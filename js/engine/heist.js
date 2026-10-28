// The Flag Vault game engine. Pure logic, no DOM, fully serializable so a run
// can be saved after every answer and resumed later. The interface (js/ui/)
// reads `heist.state` and calls the action methods below.
//
// Phases:  chamberIntro -> [event] -> [wager] -> question -> result -> ...
//          ... -> chamberClear -> chamberIntro ... -> won | caught

import { buildAnswerIndex, judge } from "./answers.js";
import { makeRng, newSeed } from "./rng.js";
import { makeTreasure } from "./treasure.js";

export const SAVE_VERSION = 2;
const REVEAL_TYPES = ["decrypt", "sweep"];

export class Heist {
  constructor(data, state) {
    this.data = data;
    this.state = state;
    this.byCode = new Map(data.countries.map((c) => [c.code, c]));
    this.index = buildAnswerIndex(data.countries, data.ambiguous);
  }

  static create(data, { mode = "team", players = ["Crew"], timed = true, seed = newSeed() } = {}) {
    const plan = buildPlan(data, makeRng(seed));
    const r = data.rules;
    const state = {
      v: SAVE_VERSION, seed, mode, players, timed, plan,
      ci: 0, qi: 0, phase: "chamberIntro",
      shields: r.startShields, gadgets: r.startGadgets, loot: 0,
      streak: 0, bestStreak: 0, turn: 0, chamberMisses: 0,
      cur: null, lastClear: null, history: [], gadgetsUsed: 0,
      introsSeen: [], startedAt: Date.now(), finishedAt: null,
    };
    return new Heist(data, state);
  }

  static restore(data, saved) {
    if (!saved || saved.v !== SAVE_VERSION) return null;
    const codes = new Set(data.countries.map((c) => c.code));
    if (saved.plan.chambers.length !== data.chambers.length) return null;
    for (const ch of saved.plan.chambers) for (const q of ch.questions) {
      if (!codes.has(q.code) || (q.bonus && !codes.has(q.bonus.code))) return null;
    }
    return new Heist(data, saved);
  }

  // ---------- read helpers ----------
  get chamber() { return this.data.chambers[this.state.ci]; }
  get slot() { return this.state.plan.chambers[this.state.ci].questions[this.state.qi]; }
  country(code) { return this.byCode.get(code); }
  get player() {
    const s = this.state;
    return s.mode === "turns" ? s.players[s.turn % s.players.length] : null;
  }
  get totalQuestions() { return this.state.plan.chambers.reduce((n, c) => n + c.questions.length, 0); }
  get questionNumber() {
    const s = this.state;
    let n = 0;
    for (let i = 0; i < s.ci; i++) n += s.plan.chambers[i].questions.length;
    return n + s.qi + 1;
  }
  get story() { return this.state.plan.story; }

  /** The question currently on screen (bonus checkpoint or main lock). */
  get active() {
    const s = this.state, q = this.slot, cur = s.cur;
    if (!q || !cur) return null;
    const bonus = cur.stage === "bonus";
    const src = bonus ? q.bonus : q;
    return {
      code: src.code,
      type: src.type,
      decoys: src.decoys || [],
      groupName: src.groupName,
      tileOrder: src.tileOrder,
      bonus,
      laser: !bonus && cur.eventId === "laserGrid",
      countdown: !bonus && cur.eventId === "countdown" ? this.data.events.find((e) => e.id === "countdown").seconds : 0,
      timed: s.timed ? this.data.rules.timedSeconds : 0,
      stake: bonus ? 0 : cur.stake,
      hints: cur.hints,
      finalLock: !!this.chamber.finalLock,
      baseLoot: this.chamber.lootPerFlag * (bonus ? 0.5 : 1),
      reveal: REVEAL_TYPES.includes(src.type),
    };
  }

  get pendingEvent() {
    const q = this.slot;
    return q?.event ? this.data.events.find((e) => e.id === q.event) : null;
  }

  canUseGadget(type) {
    const s = this.state, a = this.active;
    if (s.phase !== "question" || !a) return { ok: false, why: "Not now." };
    if (a.laser) return { ok: false, why: "Gadgets are off in the laser grid." };
    if (s.gadgets <= 0) return { ok: false, why: "No gadgets left." };
    if (a.hints.includes(type)) return { ok: false, why: "Already used on this flag." };
    if (a.type === "map" && type === "locate") return { ok: false, why: "You can already see where it is." };
    return { ok: true };
  }

  hintInfo(type, code = this.active?.code) {
    const c = this.country(code);
    switch (type) {
      case "region": return { label: "Region", text: c.region };
      case "locate": return { label: "Location", point: this.data.map.points[code] };
      case "letter": {
        const pattern = c.name.split("").map((ch, i) => (i === 0 ? ch : /[A-Za-zÀ-ÿ]/.test(ch) ? "_" : ch)).join(" ");
        return { label: "Decoded", text: pattern };
      }
      case "intel": return { label: "Intel", text: `Capital: ${c.capital}${c.status ? `. ${c.status}` : ""}` };
    }
    return null;
  }

  introSeen(key) { return this.state.introsSeen.includes(key); }
  markIntro(key) { if (!this.introSeen(key)) this.state.introsSeen.push(key); }

  /** The treasure behind the vault door (only meaningful once won). */
  treasure() {
    const s = this.state;
    const best = s.history.filter((h) => h.correct && h.type !== "map").sort((a, b) => this.country(b.code).tier - this.country(a.code).tier)[0];
    return makeTreasure(this.data.treasure, s.plan.treasureSeed, best ? this.country(best.code).name : "Atlantis");
  }

  // ---------- actions ----------
  beginChamber() {
    if (this.state.phase !== "chamberIntro") return;
    this.state.chamberMisses = 0;
    this.#prepare();
  }

  #prepare() {
    const s = this.state, q = this.slot;
    s.cur = s.cur && s.cur.keep ? s.cur : { stage: "main", eventId: null, eventDone: false, stake: 0, hints: [], retryUsed: false, outcome: null };
    delete s.cur.keep;
    if (q.event && !s.cur.eventDone) { s.phase = "event"; return; }
    if (s.cur.stage === "main" && q.wager && !s.cur.wagerDone && s.loot > 0) { s.phase = "wager"; return; }
    s.phase = "question";
  }

  ackEvent() {
    const s = this.state, ev = this.pendingEvent, r = this.data.rules;
    if (s.phase !== "event" || !ev) return null;
    s.cur.eventDone = true;
    s.cur.eventId = ev.id;
    const effect = {};
    if (ev.id === "supplyDrop") {
      const before = s.gadgets;
      s.gadgets = Math.min(r.maxGadgets, s.gadgets + 1);
      effect.gadgets = s.gadgets - before;
    }
    if (ev.id === "jackpot") { effect.loot = this.chamber.lootPerFlag * 2; s.loot += effect.loot; }
    if (ev.id === "keycard") {
      if (s.shields < r.maxShields) { s.shields++; effect.shields = 1; }
      else { effect.loot = this.chamber.lootPerFlag; s.loot += effect.loot; }
    }
    if (ev.id === "checkpoint") s.cur.stage = "bonus";
    s.cur.keep = true;
    this.#prepare();
    return effect;
  }

  chooseWager(fraction) {
    const s = this.state;
    if (s.phase !== "wager") return;
    s.cur.wagerDone = true;
    s.cur.stake = Math.round((s.loot * fraction) / 100) * 100;
    s.cur.stakeFraction = fraction;
    s.phase = "question";
  }

  useGadget(type) {
    const can = this.canUseGadget(type);
    if (!can.ok) return can;
    const s = this.state;
    s.gadgets--;
    s.gadgetsUsed++;
    s.cur.hints.push(type);
    return { ok: true, info: this.hintInfo(type) };
  }

  /** Returns the judge verdict; on correct/wrong the run moves to "result". */
  submit(text, { hiddenFraction = 0, elapsedMs = 0 } = {}) {
    const s = this.state;
    if (s.phase !== "question") return null;
    const a = this.active;
    const v = judge(this.index, text, a.code, { retryUsed: s.cur.retryUsed });
    if (v.verdict === "retry") s.cur.retryUsed = true;
    if (v.verdict === "correct" || v.verdict === "wrong") {
      return { ...v, outcome: this.#resolve(v.verdict === "correct", { typed: text, matched: v.matched, exact: v.exact, hiddenFraction, elapsedMs }) };
    }
    return v;
  }

  pass() { return this.state.phase === "question" ? this.#resolve(false, { passed: true }) : null; }
  timeout() { return this.state.phase === "question" ? this.#resolve(false, { timedOut: true }) : null; }

  #resolve(correct, info) {
    const s = this.state, a = this.active, r = this.data.rules, g = this.data.gadgets;
    const o = { correct, code: a.code, type: a.type, bonus: a.bonus, gained: 0, stake: a.stake, shieldLost: false, shieldRestored: false, multipliers: [], ...info };
    if (correct) {
      let mult = 1;
      const hintCost = Math.min(0.9, a.hints.reduce((t, h) => t + g[h].cost, 0));
      if (hintCost) { mult *= 1 - hintCost; o.multipliers.push(`Clues −${Math.round(hintCost * 100)}%`); }
      if (a.reveal && info.hiddenFraction > 0) {
        const b = info.hiddenFraction * r.revealMaxBonus;
        mult *= 1 + b;
        o.multipliers.push(`Early answer +${Math.round(b * 100)}%`);
      }
      if (a.laser) { mult *= 2; o.multipliers.push("Laser grid ×2"); }
      if (a.countdown && info.elapsedMs <= a.countdown * 1000) { mult *= 3; o.multipliers.push("Beat the patrol ×3"); }
      const streakBonus = Math.min(r.streakBonusMax, s.streak * r.streakBonusStep);
      if (streakBonus > 0) { mult *= 1 + streakBonus; o.multipliers.push(`Streak +${Math.round(streakBonus * 100)}%`); }
      o.gained = Math.round((a.baseLoot * mult) / 10) * 10;
      if (a.bonus) {
        if (s.shields < r.maxShields) { s.shields++; o.shieldRestored = true; }
        else { o.gained += a.baseLoot; o.multipliers.push("Lives full: bonus loot"); }
      }
      s.loot += o.gained + a.stake;
      s.streak++;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    } else if (!a.bonus) {
      s.shields--;
      o.shieldLost = true;
      s.chamberMisses++;
      s.streak = 0;
      s.loot = Math.max(0, s.loot - a.stake);
    }
    o.player = this.player;
    s.history.push({
      code: a.code, type: a.type, ci: s.ci, correct, bonus: a.bonus, hints: [...a.hints],
      gained: o.gained, stake: a.stake, player: o.player, typed: info.typed ?? null, matched: info.matched ?? null,
    });
    s.turn++;
    s.cur.outcome = o;
    s.phase = "result";
    return o;
  }

  next() {
    const s = this.state, r = this.data.rules;
    if (s.phase === "result") {
      if (s.shields <= 0) { s.phase = "caught"; s.finishedAt = Date.now(); return; }
      if (s.cur.stage === "bonus") {
        s.cur = { ...s.cur, stage: "main", hints: [], retryUsed: false, outcome: null, keep: true, eventId: null };
        this.#prepare();
        return;
      }
      s.qi++;
      s.cur = null;
      const qs = s.plan.chambers[s.ci].questions;
      if (s.qi < qs.length) { this.#prepare(); return; }
      if (s.ci === this.data.chambers.length - 1) { s.phase = "won"; s.finishedAt = Date.now(); return; }
      const perfect = s.chamberMisses === 0;
      let restored = 0;
      if (perfect && s.shields < r.maxShields) { restored = Math.min(r.perfectChamberShield, r.maxShields - s.shields); s.shields += restored; }
      s.lastClear = { ci: s.ci, perfect, restored };
      s.phase = "chamberClear";
      return;
    }
    if (s.phase === "chamberClear") {
      s.ci++; s.qi = 0; s.cur = null;
      s.phase = "chamberIntro";
    }
  }

  summary() {
    const s = this.state;
    const answered = s.history.filter((x) => !x.bonus);
    const learn = [];
    for (const x of s.history) {
      if ((!x.correct || x.hints.length) && !learn.includes(x.code)) learn.push(x.code);
    }
    const perPlayer = {};
    if (s.mode === "turns") {
      for (const p of s.players) perPlayer[p] = { correct: 0, total: 0 };
      for (const x of s.history) if (x.player && perPlayer[x.player]) {
        perPlayer[x.player].total++;
        if (x.correct) perPlayer[x.player].correct++;
      }
    }
    return {
      won: s.phase === "won",
      chamberReached: s.ci,
      chamberName: this.data.chambers[s.ci].name,
      loot: s.loot,
      correct: answered.filter((x) => x.correct).length,
      answered: answered.length,
      total: this.totalQuestions,
      bonusCorrect: s.history.filter((x) => x.bonus && x.correct).length,
      gadgetsUsed: s.gadgetsUsed,
      bestStreak: s.bestStreak,
      learn,
      perPlayer,
      minutes: Math.max(1, Math.round(((s.finishedAt || Date.now()) - s.startedAt) / 60000)),
    };
  }
}

// ---------------------------------------------------------------------------
// Run planning: picks every flag, event and story line for the run up front,
// respecting tiers and never repeating a flag.
// ---------------------------------------------------------------------------
export function buildPlan(data, rng) {
  const used = new Set();
  const tierOf = new Map(data.countries.map((c) => [c.code, c.tier]));
  const tiersFor = (t) => (Array.isArray(t) ? range(t[0], t[1]) : [t]);
  const minArea = data.rules.mapMinArea ?? 250;
  const box = data.map.boxes;
  const bigEnough = (c) => box[c.code] && (box[c.code][2] - box[c.code][0]) * (box[c.code][3] - box[c.code][1]) >= minArea;

  const pick = (tiers, filter = () => true) => {
    for (let widen = 0; widen <= 5; widen++) {
      const ts = new Set(tiers.flatMap((t) => range(t - widen, t + widen)));
      const cands = data.countries.filter((c) => ts.has(c.tier) && !used.has(c.code) && filter(c));
      if (cands.length) {
        const c = rng.pick(cands);
        used.add(c.code);
        return c.code;
      }
    }
    throw new Error("Ran out of flags");
  };

  const makeQuestion = (type, tierSpec) => {
    const tiers = tiersFor(tierSpec);
    const q = { type };
    if (type === "doppel") {
      // Widen the tier range step by step until a lookalike group has a free flag.
      for (let widen = 0; widen <= 3 && !q.code; widen++) {
        const ts = range(tiers[0] - widen, tiers[tiers.length - 1] + widen);
        for (const g of rng.shuffle(data.lookalikes)) {
          const cands = g.codes.filter((c) => !used.has(c) && ts.includes(tierOf.get(c)));
          if (!cands.length) continue;
          q.code = rng.pick(cands);
          used.add(q.code);
          q.decoys = rng.shuffle(g.codes.filter((c) => c !== q.code)).slice(0, 4);
          q.groupName = g.name;
          break;
        }
      }
      if (!q.code) { q.type = "flag"; q.code = pick(tiers); }
    } else if (type === "map") {
      q.code = pick(tiers, bigEnough);
    } else {
      q.code = pick(tiers);
    }
    if (type === "decrypt") q.tileOrder = rng.shuffle(range(0, 23));
    return q;
  };

  const chambers = data.chambers.map((ch) => ({
    questions: ch.tiers.map((t, i) => ({ ...makeQuestion(ch.mechanic, t), wager: (ch.wagers || []).includes(i) })),
  }));

  // Security events: a random few, at random locks (never the first lock of a chamber).
  const spots = [];
  for (const ci of data.rules.eventChambers) for (let qi = 1; qi < chambers[ci].questions.length; qi++) {
    if (!chambers[ci].questions[qi].wager) spots.push([ci, qi]);
  }
  const chosenSpots = rng.shuffle(spots).slice(0, data.rules.eventsPerRun);
  const events = rng.shuffle(data.events);
  chosenSpots.forEach(([ci, qi], i) => {
    const q = chambers[ci].questions[qi];
    q.event = events[i % events.length].id;
    if (q.event === "checkpoint") {
      const ch = data.chambers[ci];
      q.bonus = makeQuestion(ch.mechanic, ch.tiers[qi]);
    }
  });

  const st = data.story;
  const story = {
    vault: rng.pick(st.vaults), city: rng.pick(st.cities), contact: rng.pick(st.contacts), crew: rng.pick(st.crews),
    briefing: rng.int(st.briefing.length),
    chamberIntro: st.chamberIntro.map((list) => rng.int(list.length)),
    eventText: Object.fromEntries(Object.entries(st.events).map(([k, list]) => [k, rng.int(list.length)])),
  };
  return { chambers, story, treasureSeed: rng.int(2 ** 31) };
}

function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}
