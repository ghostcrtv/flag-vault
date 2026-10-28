// The Flag Vault — interface. Renders the engine's state and wires up input.
import { DATA } from "../data/index.js";
import { Heist } from "../engine/heist.js";
import { audio } from "./audio.js";
import { vaultDoor, icon, routeNode } from "./art.js";
import { treasureRoom } from "./treasure-art.js";
import { worldMap } from "./map.js";
import { FLAG_SVG } from "../data/flags-data.js";

const $app = document.getElementById("app");
const $flash = document.getElementById("flash");
const root = document.documentElement;
const R = DATA.rules;

// ---------------------------------------------------------------- storage
const KEY = { run: "flagvault.run", settings: "flagvault.settings", records: "flagvault.records" };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const settings = Object.assign({
  musicVolume: 0.6, sfxVolume: 0.8, muted: false,
  reduceMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  largeText: false, autoKeyboard: true,
}, store.get(KEY.settings, {}));


function applySettings() {
  root.classList.toggle("reduce-motion", settings.reduceMotion);
  root.classList.toggle("large-text", settings.largeText);
  audio.setSettings(settings);
  store.set(KEY.settings, settings);
}
applySettings();

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const flagUrls = {};
const flagSrc = (code) => (flagUrls[code] ??= URL.createObjectURL(new Blob([FLAG_SVG[code]], { type: "image/svg+xml" })));
const wait = (ms) => new Promise((r) => setTimeout(r, settings.reduceMotion ? Math.min(ms, 250) : ms));
const country = (code) => DATA.countries.find((c) => c.code === code);
const ST = DATA.story;
/** Fill story placeholders with this run's details. */
function tell(text) {
  const st = heist?.story || {};
  return String(text)
    .replace(/\{vault\}/g, st.vault || "the vault").replace(/\{city\}/g, st.city || "the city")
    .replace(/\{contact\}/g, st.contact || "Nova").replace(/\{crew\}/g, st.crew || "Crew")
    .replace(/^the /, "The ").replace(/([.!?] )the /g, "$1The ");
}
/** A line from a list that stays the same for this moment of the run. */
function line(list, salt = 0) {
  const n = (heist ? heist.state.seed + heist.state.history.length * 7 + salt : salt);
  return tell(list[Math.abs(n) % list.length]);
}

function flash(kind) {
  if (settings.reduceMotion) return;
  $flash.className = "";
  void $flash.offsetWidth;
  $flash.className = kind;
}
function tap() { audio.unlock(); audio.play("tap"); }

// Keep the layout inside the visible area when the iPad keyboard opens.
function fitViewport() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  root.style.setProperty("--vvh", `${h}px`);
  document.body.classList.toggle("kb", !!vv && h < window.innerHeight * 0.78);
  if (vv && (vv.offsetTop || window.scrollY)) window.scrollTo(0, 0);
}
window.visualViewport?.addEventListener("resize", fitViewport);
window.visualViewport?.addEventListener("scroll", fitViewport);
window.addEventListener("resize", fitViewport);
fitViewport();

// ---------------------------------------------------------------- state
let heist = null;
let view = "title";            // title | setup | briefing | heist | debrief

let q = null;                  // per-question interface state
let timers = [];               // intervals/timeouts to clear when leaving a question

function clearTimers() { timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = []; }
function save() {
  if (heist && !["won", "caught"].includes(heist.state.phase)) store.set(KEY.run, heist.state);
  else store.del(KEY.run);
}

function setIntensity() {
  const ci = heist ? heist.state.ci : 0;
  const level = heist && heist.chamber.finalLock ? 6 : ci;
  document.body.dataset.intensity = level;
  audio.setIntensity(level);
}

// ---------------------------------------------------------------- router
function render() {
  clearTimers();
  if (view === "title") return renderTitle();
  if (view === "briefing") return renderBriefing();
  if (view === "debrief") return renderDebrief();
  const p = heist.state.phase;
  save();
  setIntensity();
  if (p === "chamberIntro") return renderChamberIntro();
  if (p === "chamberClear") return renderChamberClear();
  if (p === "won") return renderFinale();
  if (p === "caught") return renderCaught();
  return renderHeist();
}

function mount(html, cls) {
  $app.innerHTML = `<main class="screen ${cls}">${html}</main>`;
  return $app.firstElementChild;
}
const on = (el, sel, ev, fn) => el.querySelectorAll(sel).forEach((n) => n.addEventListener(ev, fn));

// ---------------------------------------------------------------- title
function renderTitle() {
  const saved = Heist.restore(DATA, store.get(KEY.run, null));
  const rec = store.get(KEY.records, { bestLoot: 0, vaults: 0, runs: 0 });
  const el = mount(`
    <div class="corner-tools">
      <button class="icon-btn" data-act="sound" aria-label="${settings.muted ? "Turn sound on" : "Mute sound"}">${icon.sound(!settings.muted)}</button>
      <button class="icon-btn" data-act="settings" aria-label="Settings">${icon.settings()}</button>
    </div>
    <div class="title-layout">
      <div class="title-door">${vaultDoor({ spin: true })}</div>
      <div class="title-copy">
        <h1 class="wordmark"><span class="the">The</span><span>Flag</span><span>Vault</span></h1>
        <p class="title-lede">Seven chambers. One legendary treasure. The only way in is knowing your flags (and your map).</p>
        <div class="title-actions">
          ${saved ? `<button class="btn" data-act="resume">Resume the heist · ${esc(DATA.chambers[saved.state.ci].name)}</button>` : ""}
          <button class="btn ${saved ? "secondary" : ""}" data-act="new">${saved ? "Start a new heist" : "Plan the heist"}</button>
        </div>
        ${rec.runs ? `<div class="best-line">Best haul ${money(rec.bestLoot)} · Vaults cracked ${rec.vaults} of ${rec.runs} attempts</div>` : ""}
        <p class="credit">Created by <strong>Leighton R.</strong> &amp; <strong>Steve R.</strong><br>Imagined out of a love for flags, countries and geography. © 2026 Leighton R. &amp; Steve R.</p>
      </div>
    </div>`, "title-screen");
  const wheel = el.querySelector(".wheel");
  if (!settings.reduceMotion) wheel.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 40000, iterations: Infinity });
  wheel.style.transformBox = "view-box";
  wheel.style.transformOrigin = "200px 200px";
  on(el, '[data-act="new"]', "click", () => {
    tap();
    if (saved && !confirm("Start over? Your heist in progress will be abandoned.")) return;
    store.del(KEY.run); newHeist();
  });
  on(el, '[data-act="resume"]', "click", () => { tap(); heist = saved; view = "heist"; audio.startMusic(); render(); });
  on(el, '[data-act="settings"]', "click", () => { tap(); openSettings(); });
  on(el, '[data-act="sound"]', "click", () => { settings.muted = !settings.muted; applySettings(); tap(); render(); });
}

// ---------------------------------------------------------------- new heist
function newHeist() {
  heist = Heist.create(DATA, { mode: "team", players: ["Crew"], timed: true });
  q = null;
  view = "briefing";
  render();
}

// ---------------------------------------------------------------- briefing
function routeHtml(current, big = false, doneUpTo = current) {
  return `<div class="route ${big ? "big" : ""}" aria-label="Chamber ${current + 1} of ${DATA.chambers.length}">${DATA.chambers.map((c, i) => {
    const state = i < doneUpTo ? "done" : i === current ? "current" : "locked";
    return `${i ? `<div class="wire ${i <= doneUpTo ? "done" : ""}"></div>` : ""}<div class="node ${state}">${routeNode(state, !!c.finalLock)}${big ? `<small>${esc(c.short || c.name)}</small>` : ""}</div>`;
  }).join("")}</div>`;
}

function renderBriefing() {
  const total = heist.totalQuestions;
  const st = heist.story;
  const el = mount(`
    <div class="panel">
      <div class="kicker">Mission briefing</div>
      <h1>${esc(st.crew)}</h1>
      <p class="story">${esc(tell(ST.briefing[st.briefing]))}</p>
      ${routeHtml(0, true, 0)}
      <h2>How it works</h2>
      <div class="rules">
        <div class="rule">${icon.flagSign()}<div><strong>Name it in ${R.timedSeconds} seconds</strong><p>Type the country. Small spelling mistakes are OK. If the clock runs out, it counts as wrong. ${DATA.chambers.length} chambers, ${total} locks, harder as you go.</p></div></div>
        <div class="rule">${icon.shield(true)}<div><strong>${R.startShields} lives</strong><p>These badges are your lives. A wrong answer costs one. Run out and you get caught. Finish a chamber with no mistakes to win one back.</p></div></div>
        <div class="rule">${icon.gadget()}<div><strong>${R.startGadgets} gadgets</strong><p>Stuck? Spend a gadget on a clue: Region, Map Pin, First Letter or Capital City. Clues also make that flag pay a bit less. Find more gadgets along the way.</p></div></div>
        <div class="rule">${icon.loot()}<div><strong>Loot</strong><p>Every right answer adds money to your haul. Deeper chambers pay more, and a streak of right answers pays extra.</p></div></div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-act="back">Back</button>
        <button class="btn" data-act="go">Start the heist</button>
      </div>
    </div>`, "panel-screen");
  on(el, '[data-act="back"]', "click", () => { tap(); heist = null; view = "title"; render(); });
  on(el, '[data-act="go"]', "click", () => {
    tap();
    const rec = store.get(KEY.records, { bestLoot: 0, vaults: 0, runs: 0 });
    rec.runs++; store.set(KEY.records, rec);
    view = "heist";
    audio.startMusic();
    render();
  });
}

// ---------------------------------------------------------------- chamber intro
const MECHANIC_ART = { flag: () => icon.flagSign(), decrypt: () => icon.decrypt(), doppel: () => icon.doppel(), map: () => icon.satellite(), sweep: () => icon.sweep() };

function renderChamberIntro() {
  const s = heist.state, ch = heist.chamber, plan = s.plan.chambers[s.ci].questions;
  const hasWager = plan.some((qq) => qq.wager);
  const el = mount(`
    <div class="panel">
      <div class="numeral" aria-hidden="true">${s.ci + 1}</div>
      <div class="chamber-number">Chamber ${s.ci + 1} of ${DATA.chambers.length}${s.ci ? ` · ${money(s.loot)} in the bag` : ""}</div>
      <h1>${esc(ch.name)}</h1>
      <p class="story">${esc(tell(ST.chamberIntro[s.ci][heist.story.chamberIntro[s.ci]]))}</p>
      ${routeHtml(s.ci, true)}
      <div class="mechanic">${MECHANIC_ART[ch.mechanic]()}<div><h3>${ch.finalLock ? "The Final Lock" : `This chamber: ${ST.mechanicName[ch.mechanic]}`}</h3><p>${ch.finalLock ? `${plan.length} expert flags. Every right answer slides one bolt off the vault door. Mistakes cost a life, but you can survive a few.` : ST.mechanicHow[ch.mechanic]} <b>All ${plan.length} locks in this chamber work this way.</b></p></div></div>
      ${hasWager ? `<div class="mechanic alt">${icon.wager()}<div><h3>Watch out: a big bet</h3><p>Before one flag in this chamber, you'll get the choice to bet some of your loot. Right answer: you win the bet. Wrong answer: you lose it. You can always say no.</p></div></div>` : ""}
      <div class="actions"><button class="btn" data-act="go">${ch.finalLock ? "Face the final lock" : `Enter the ${esc(ch.name.replace(/^The /, ""))}`}</button></div>
    </div>`, "panel-screen");
  if (s.ci) audio.play("chamber");
  on(el, '[data-act="go"]', "click", () => {
    tap();
    heist.beginChamber();
    render();
    focusAnswer();
  });
}

// ---------------------------------------------------------------- heist screen
function hudHtml() {
  const s = heist.state, ch = heist.chamber, plan = s.plan.chambers[s.ci].questions;
  const hist = s.history.filter((h) => h.ci === s.ci && !h.bonus);
  const pips = plan.map((_, i) => {
    const h = hist[i];
    const cls = h ? (h.correct ? "ok" : "miss") : i === s.qi ? "now" : "";
    return `<i class="pip ${cls}"></i>`;
  }).join("");
  let shields = "";
  for (let i = 0; i < Math.max(s.shields, R.startShields); i++) shields += icon.shield(i < s.shields);
  const word = ch.finalLock ? "Tumbler" : "Lock";
  return `<header class="hud">
    <div class="hud-left">
      <div class="hud-title"><h1>${esc(ch.name)}</h1><span class="lockcount">${word} ${Math.min(s.qi + 1, plan.length)} of ${plan.length}</span></div>
      <div class="pips" aria-hidden="true">${pips}</div>
    </div>
    <div class="hud-right">
      <div class="stat" data-stat="shields" aria-label="${s.shields} lives left"><span class="stat-label">Lives</span><span class="shields">${shields}</span></div>
      <div class="stat" data-stat="gadgets" aria-label="${s.gadgets} gadgets left"><span class="stat-label">Gadgets</span>${icon.gadget()}<span class="num">${s.gadgets}</span></div>
      <div class="stat loot" data-stat="loot" aria-label="Loot ${money(s.loot)}"><span class="stat-label">Loot</span>${icon.loot()}<span class="num">${money(s.loot)}</span></div>
      <button class="icon-btn" data-act="help" aria-label="How this screen works">${icon.help()}</button>
      <button class="icon-btn" data-act="settings" aria-label="Settings and sound">${icon.settings()}</button>
    </div>
  </header>`;
}

function questionKey() { const s = heist.state; return `${s.ci}.${s.qi}.${s.cur?.stage}`; }

function renderHeist() {
  const s = heist.state, a = heist.active, phase = s.phase;
  if (!q || q.key !== questionKey()) {
    q = { key: questionKey(), start: performance.now(), opened: 0, locked: a.type !== "doppel", checking: false, feedback: "", feedbackWarn: false, bonusLost: false };
  }
  const showQuestion = phase === "question" || phase === "result";
  const player = heist.player;
  const finalDone = s.history.filter((h) => h.ci === s.ci && h.correct && !h.bonus).length;
  let label = a.finalLock ? `Final lock · ${finalDone} of ${s.plan.chambers[s.ci].questions.length} bolts off` : `${ST.mechanicName[a.type]} · lock ${heist.questionNumber} of ${heist.totalQuestions}`;
  let tag = "";
  if (a.reveal) tag = `<span class="tag" data-reveal-tag></span>`;
  else if (a.type === "doppel") tag = `<span class="tag" data-doppel-tag>Scanning lookalikes…</span>`;
  else if (a.type === "map") tag = `<span class="tag">Name the glowing country</span>`;
  if (a.bonus) tag = `<span class="tag">Bonus flag · win a life</span> ` + tag;
  if (a.laser) tag += ` <span class="tag red">Laser grid: no clues · loot ×2</span>`;
  if (a.countdown) tag += ` <span class="tag red" data-count-tag>Beat the patrol for ×3</span>`;
  if (a.stake) tag += ` <span class="tag">${money(a.stake)} at stake</span>`;

  const el = mount(`
    ${hudHtml()}
    ${player && phase === "question" ? `<div class="turn-banner" aria-live="polite">${esc(player)}'s turn</div>` : ""}
    <div class="heist-body">
      <section class="stage">
        <div class="stage-label"><span>${label}</span>${tag}</div>
        <div class="case ${q.checking ? "checking" : ""} ${a.finalLock ? "final" : ""}" data-case>${showQuestion ? caseHtml(a, finalDone) : `<div class="flag-holder">${icon.lock(false, "#3a465c")}</div>`}</div>
        ${(a.countdown || a.timed) && phase === "question" ? `<div class="timer-row"><div class="timer" aria-hidden="true"><i data-timer></i></div><span class="timer-num" data-timer-num></span></div>` : ""}
      </section>
      <section class="side">
        <div class="side-route">${routeHtml(s.ci)}${consoleHtml(a)}</div>
        <div class="intel" data-intel aria-live="polite">${hintChips(a)}</div>
        ${phase === "result" ? resultHtml(s.cur.outcome) : controlsHtml(a)}
      </section>
    </div>`, "heist");

  on(el, '[data-act="settings"]', "click", () => { tap(); openSettings(); });
  on(el, '[data-act="help"]', "click", () => { tap(); showGuide(); });
  if (phase === "question") wireQuestion(el, a);
  if (phase === "result") wireResult(el);
  if (phase === "event") showEvent();
  if (phase === "wager") showWager();
  if (phase === "question" && !heist.introSeen("guide")) showGuide();
  return el;
}

function consoleHtml(a) {
  const s = heist.state;
  const streakBonus = Math.min(R.streakBonusMax, s.streak * R.streakBonusStep);
  let pays = a.baseLoot * (1 + streakBonus) * (a.laser ? 2 : 1);
  const left = s.plan.chambers[s.ci].questions.length - s.qi;
  return `<div class="console">
    <div class="accent"><b>${money(pays)}</b><span>This one pays${a.reveal ? " (more if early)" : ""}</span></div>
    <div><b>${s.streak}${streakBonus ? ` <small style="color:var(--accent)">+${Math.round(streakBonus * 100)}%</small>` : ""}</b><span>Right in a row</span></div>
    <div><b>${left}</b><span>${heist.chamber.finalLock ? "Tumblers to go" : "Locks to the next door"}</span></div>
  </div>`;
}

function caseHtml(a, finalDone) {
  if (a.type === "map") {
    const result = heist.state.phase === "result";
    const lit = result && heist.state.cur.outcome.correct;
    const flagCard = result ? `<div class="map-flag"><img src="${flagSrc(a.code)}" alt="Flag of ${esc(country(a.code).name)}"></div>` : "";
    return worldMap({ target: lit ? null : a.code, lit: lit ? a.code : null, focus: a.code, zoom: "fit", aspect: 1.6, label: "Satellite map with one country glowing" }) + flagCard;
  }
  const c = country(a.code);
  const result = heist.state.phase === "result";
  const tiles = a.type === "decrypt" && !result
    ? `<div class="tiles" aria-hidden="true">${a.tileOrder.map((_, i) => `<div class="tile" data-tile="${i}">${Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()}</div>`).join("")}</div>` : "";
  const stamp = result ? (heist.state.cur.outcome.correct ? `<div class="verdict-stamp good">Access granted</div>` : `<div class="verdict-stamp bad">Access denied</div>`) : "";
  const shown = a.type === "doppel" && !q.locked && !result ? a.decoys[0] : a.code;
  let door = "";
  if (a.finalLock) {
    door = `<div class="final-door" aria-hidden="true">${vaultDoor({ retracted: finalDone })}</div>`;
    if (result && heist.state.cur.outcome.correct) door = door.replace(`data-i="${finalDone - 1}"`, `data-i="${finalDone - 1}" data-just`).replace(/class="bolt" (data-i="\d+" data-just)/, 'class="bolt just" $1');
  }
  return `${door}<div class="flag-holder"><div class="flag-frame">
      <img class="flag-img" data-flag src="${flagSrc(shown)}" alt="${result ? `Flag of ${esc(c.name)}` : "The flag to identify"}" draggable="false">
      ${tiles}${a.type === "sweep" && !result ? `<div class="sweep-cover" data-sweep aria-hidden="true"><i></i></div>` : ""}<div class="lock-ring ${q.locked && a.type === "doppel" ? "on" : ""}"></div><div class="scanline"></div>
    </div>${stamp}</div>`;
}

function hintChips(a) {
  return a.hints.map((h) => {
    const info = heist.hintInfo(h, a.code);
    if (h === "locate") return `<div class="chip mapchip" aria-label="Location shown on the map">${worldMap({ ping: a.code, focus: a.code, zoom: 3.2, aspect: 240 / 126, label: "Map ping showing the location" })}</div>`;
    if (h === "letter") return `<div class="chip"><b>${info.label}</b><span class="pattern" aria-label="Starts with ${esc(info.text[0])}">${esc(info.text)}</span></div>`;
    return `<div class="chip"><b>${info.label}</b><span>${esc(info.text)}</span></div>`;
  }).join("");
}

function controlsHtml(a) {
  const disabled = !q.locked || q.checking;
  const n = heist.state.gadgets;
  const clues = Object.entries(DATA.gadgets).map(([k, g]) => {
    const can = heist.canUseGadget(k);
    const used = a.hints.includes(k);
    return `<button class="gadget ${used ? "used" : ""}" data-gadget="${k}" ${can.ok && !disabled ? "" : "disabled"} aria-label="${g.name} clue: ${g.desc} Uses 1 gadget and ${Math.round(g.cost * 100)}% of this flag's loot.">
      ${icon[k]()}<span><b>${g.name}</b><small>${used ? "Used" : `−${Math.round(g.cost * 100)}% loot`}</small></span></button>`;
  }).join("");
  return `<div class="controls">
    <div class="clue-bar">
      <div class="clue-label">Clues <small>${a.laser ? "off in the laser grid" : n ? `each one uses 1 gadget · you have ${n}` : "no gadgets left"}</small></div>
      <div class="gadgets">${clues}<button class="gadget pass" data-act="pass" ${disabled ? "disabled" : ""} aria-label="Skip this flag. You lose one life.">${icon.pass()}<span><b>Skip</b><small>lose 1 life</small></span></button></div>
    </div>
    <form class="answer-row" data-form autocomplete="off">
      <label class="sr-only" for="answer">${a.type === "map" ? "Name the glowing country" : "Which country's flag is this?"}</label>
      <input id="answer" class="answer" type="text" inputmode="text" enterkeyhint="go" autocapitalize="words" autocorrect="off" spellcheck="false" autocomplete="off"
        placeholder="${a.type === "map" ? "Which country is glowing?" : "Type the country"}" ${disabled ? "readonly" : ""} value="${esc(q.typed || "")}">
      <button class="btn submit" type="submit" ${disabled ? "disabled" : ""}>Go</button>
    </form>
    <div class="feedback ${q.feedbackWarn ? "warn" : ""}" data-feedback role="status" aria-live="polite">${esc(q.feedback)}</div>
  </div>`;
}

function focusAnswer() {
  if (!settings.autoKeyboard) return;
  const inp = document.getElementById("answer");
  if (inp) inp.focus({ preventScroll: true });
}

function wireQuestion(el, a) {
  wireControls(el, a);
  if (a.type === "decrypt") wireDecrypt(el, a);
  if (a.type === "sweep") wireSweep(el, a);
  if (a.type === "doppel" && !q.locked) wireDoppel(el, a);
  else wireTimer(el, a);
}

function wireControls(el, a) {
  const form = el.querySelector("[data-form]");
  const input = el.querySelector("#answer");
  input.addEventListener("input", () => { q.typed = input.value; audio.play("type"); });
  form.addEventListener("submit", (e) => { e.preventDefault(); submitAnswer(input.value); });
  on(el, "[data-gadget]", "click", (e) => { tap(); confirmGadget(e.currentTarget.dataset.gadget); });
  on(el, '[data-act="pass"]', "click", () => {
    tap();
    confirmDialog({ title: "Skip this one?", text: "Skipping costs 1 life. You'll see the answer, then move on.", yes: "Skip (lose 1 life)", danger: true }, () => {
      heist.pass(); afterResolve();
    });
  });
}

// Decryption: open one tile at a time.
function wireDecrypt(el, a) {
  const tiles = [...el.querySelectorAll("[data-tile]")];
  const tag = el.querySelector("[data-reveal-tag]");
  const show = () => {
    for (let i = 0; i < q.opened; i++) tiles[a.tileOrder[i]]?.classList.add("open");
    const hidden = 1 - q.opened / 24;
    if (tag) tag.textContent = hidden > 0 ? `Answer now: +${Math.round(hidden * R.revealMaxBonus * 100)}% bonus` : "Fully decrypted";
  };
  if (q.opened === 0) q.opened = 2;
  show();
  timers.push(setInterval(() => {
    if (q.checking || q.opened >= 24) return;
    q.opened++; show();
    if (q.opened % 3 === 0) audio.play("reveal");
  }, 1300));
}

// Laser sweep: a laser slides across the flag from left to right.
function wireSweep(el, a) {
  const cover = el.querySelector("[data-sweep]");
  const tag = el.querySelector("[data-reveal-tag]");
  const total = settings.reduceMotion ? 14000 : 11000;
  if (!q.revealed) q.revealed = 0.06;
  const startAt = performance.now() - q.revealed * total;
  const draw = () => {
    cover.style.left = `${q.revealed * 100}%`;
    const hidden = 1 - q.revealed;
    if (tag) tag.textContent = hidden > 0.01 ? `Answer now: +${Math.round(hidden * R.revealMaxBonus * 100)}% bonus` : "Fully scanned";
  };
  draw();
  let last = 0;
  timers.push(setInterval(() => {
    if (q.checking || q.revealed >= 1) return;
    q.revealed = Math.min(1, (performance.now() - startAt) / total);
    draw();
    if (performance.now() - last > 900) { last = performance.now(); audio.play("reveal"); }
  }, 60));
}

// Doppelgänger: flicker through the lookalikes, then lock on.
function wireDoppel(el, a) {
  const img = el.querySelector("[data-flag]");
  const frame = el.querySelector(".flag-frame");
  const seq = settings.reduceMotion ? [...a.decoys] : [...a.decoys, ...a.decoys, ...a.decoys.slice(0, 2)];
  let i = 0;
  const step = settings.reduceMotion ? 900 : 420;
  const tick = setInterval(() => {
    if (i < seq.length) {
      img.src = flagSrc(seq[i++]);
      frame.classList.remove("glitch"); void frame.offsetWidth; frame.classList.add("glitch");
      audio.play("flicker");
      return;
    }
    clearInterval(tick);
    img.src = flagSrc(a.code);
    frame.classList.remove("glitch");
    q.locked = true;
    q.start = performance.now();
    audio.play("lockon");
    el.querySelector(".lock-ring").classList.add("on");
    el.querySelector("[data-doppel-tag]").textContent = "Locked on";
    el.querySelector(".controls").outerHTML = controlsHtml(a);
    wireControls(el, a);
    wireTimer(el, a);
    focusAnswer();
  }, step);
  timers.push(tick);
}

// The lock clock (a miss when it runs out) and the patrol bonus countdown.
// The clock pauses whenever a pop-up is open.
function wireTimer(el, a) {
  const bar = el.querySelector("[data-timer]");
  const num = el.querySelector("[data-timer-num]");
  if (!bar) return;
  let last = performance.now();
  if (q.elapsed == null) q.elapsed = 0;
  const tick = () => {
    const now = performance.now();
    const paused = q.checking || document.querySelector(".overlay");
    if (!paused) q.elapsed += (now - last) / 1000;
    last = now;
    const elapsed = q.elapsed;
    const cdLeft = a.countdown ? a.countdown - elapsed : Infinity;
    const tmLeft = a.timed ? a.timed - elapsed : Infinity;
    const useCd = a.countdown && !q.bonusLost && cdLeft > 0;
    const left = useCd ? cdLeft : tmLeft, total = useCd ? a.countdown : a.timed;
    if (total) {
      bar.style.transform = `scaleX(${Math.max(0, left / total)})`;
      bar.classList.toggle("low", left < 10);
      if (num) num.textContent = `${Math.max(0, Math.ceil(left))}s`;
    }
    if (a.countdown && cdLeft <= 0 && !q.bonusLost) {
      q.bonusLost = true;
      const t = el.querySelector("[data-count-tag]");
      if (t) t.textContent = "Patrol passed: bonus gone";
    }
    if (a.timed && tmLeft <= 0) { clearTimers(); heist.timeout(); afterResolve(); }
  };
  tick();
  timers.push(setInterval(tick, 100));
}

function confirmGadget(type) {
  const g = DATA.gadgets[type];
  const s = heist.state;
  confirmDialog({
    title: `Use the ${g.name} clue?`,
    text: `${g.desc} It uses 1 of your ${s.gadgets} gadget${s.gadgets === 1 ? "" : "s"}, and this flag will pay ${Math.round(g.cost * 100)}% less.`,
    yes: "Use it",
  }, () => {
    const r = heist.useGadget(type);
    if (!r.ok) return;
    audio.play("gadget");
    save();
    const el = $app.querySelector(".heist");
    el.querySelector("[data-intel]").innerHTML = hintChips(heist.active);
    el.querySelector('[data-stat="gadgets"] .num').textContent = s.gadgets;
    bump("gadgets");
    q.typed = el.querySelector("#answer").value;
    el.querySelector(".controls").outerHTML = controlsHtml(heist.active);
    wireControls(el, heist.active);
    focusAnswer();
  });
}

function bump(stat) {
  const n = $app.querySelector(`[data-stat="${stat}"]`);
  if (!n || settings.reduceMotion) return;
  n.classList.remove("bump"); void n.offsetWidth; n.classList.add("bump");
}

async function submitAnswer(text) {
  if (!text.trim() || q.checking || !q.locked) return;
  const a = heist.active;
  const elapsedMs = (q.elapsed || 0) * 1000;
  const hiddenFraction = a.type === "decrypt" ? 1 - q.opened / 24 : a.type === "sweep" ? 1 - (q.revealed || 0) : 0;
  q.checking = true;
  q.typed = text;
  const el = $app.querySelector(".heist");
  el.querySelector("[data-case]").classList.add("checking");
  el.querySelectorAll(".gadget, .submit").forEach((b) => (b.disabled = true));
  const input = el.querySelector("#answer");
  input.readOnly = true;
  const fb = el.querySelector("[data-feedback]");
  fb.className = "feedback"; fb.textContent = "Checking security clearance…";
  audio.suspense(true);
  audio.play("checking");
  await wait(R.checkingMs);
  audio.suspense(false);
  q.checking = false;
  const v = heist.submit(text, { hiddenFraction, elapsedMs: a.countdown && q.bonusLost ? Infinity : elapsedMs });
  if (!v) return;
  if (v.verdict === "correct" || v.verdict === "wrong") { afterResolve(); return; }
  // Not judged yet: let them fix it.
  save();
  el.querySelector("[data-case]").classList.remove("checking");
  el.querySelectorAll(".gadget, .submit").forEach((b) => (b.disabled = false));
  el.querySelectorAll(".gadget").forEach((b) => { if (b.dataset.gadget && !heist.canUseGadget(b.dataset.gadget).ok) b.disabled = true; });
  input.readOnly = false;
  q.feedback = v.verdict === "empty" ? "" : v.message;
  q.feedbackWarn = true;
  fb.className = "feedback warn"; fb.textContent = q.feedback;
  audio.play("retry");
  input.focus({ preventScroll: true });
  input.select();
}

function afterResolve() {
  const o = heist.state.cur.outcome;
  clearTimers();
  document.activeElement?.blur?.();
  if (o.correct) { audio.play("granted"); flash("granted"); if (o.gained) setTimeout(() => audio.play("coins"), 500); }
  else { audio.play("denied"); flash("denied"); if (o.shieldLost) setTimeout(() => audio.play("shield"), 350); }
  render();
  if (o.correct) bump("loot"); else if (o.shieldLost) bump("shields");
  if (o.shieldRestored) bump("shields");
}

function resultHtml(o) {
  const c = country(o.code);
  const typedName = o.matched ? country(o.matched)?.name : null;
  let detail = "";
  if (o.correct) {
    const parts = [];
    if (o.gained) parts.push(`<span class="gain">+${money(o.gained)}</span>`);
    if (o.stake) parts.push(`<span class="gain">+${money(o.stake)} stake won</span>`);
    if (o.shieldRestored) parts.push(`<span class="gain">+1 life</span>`);
    if (o.multipliers.length) parts.push(o.multipliers.join(", "));
    if (o.exact === false) parts.push(`Accepted "${esc(o.typed)}"`);
    detail = parts.join(" · ");
  } else {
    const parts = [];
    if (o.passed) parts.push("Skipped");
    else if (o.timedOut) parts.push("Time ran out");
    else parts.push(`You said "${esc(o.typed)}"${typedName && typedName.toLowerCase() !== o.typed.trim().toLowerCase() ? ` (${esc(typedName)})` : ""}`);
    if (o.shieldLost) parts.push(`<span class="loss">−1 life</span>`);
    if (o.stake) parts.push(`<span class="loss">−${money(o.stake)} stake lost</span>`);
    if (o.bonus) parts.push("Bonus flag: no penalty");
    detail = parts.join(" · ");
  }
  const s = heist.state;
  const lastInChamber = s.qi === s.plan.chambers[s.ci].questions.length - 1 && s.cur.stage !== "bonus";
  const nextLabel = s.shields <= 0 ? "Continue" : lastInChamber ? (heist.chamber.finalLock ? "Open the vault!" : "Unlock the door") : "Next";
  const statusText = c.status ? ` <span style="color:var(--muted);font-size:.9rem">(${esc(c.status)})</span>` : "";
  return `<div class="result ${o.correct ? "good" : "bad"}" role="status" aria-live="assertive">
    <div class="verdict-icon">${o.correct ? icon.granted() : icon.denied()}</div>
    <div>
      <h2>${o.correct ? esc(line(ST.correct)) : `${esc(line(ST.wrong))} The answer was:`}</h2>
      <div class="country">${esc(c.name)}${statusText}</div>
      <div class="detail">${detail}</div>
    </div>
    <button class="btn" data-act="next">${nextLabel}</button>
    ${heist.active.type !== "map" && !(window.innerWidth >= 1000 && window.innerHeight < 600) ? `<div class="mini-map">${worldMap({ lit: o.code, focus: o.code, zoom: 2.2, aspect: 4, label: `${c.name} on the world map` })}</div>` : ""}
  </div>`;
}

function wireResult(el) {
  const btn = el.querySelector('[data-act="next"]');
  btn.addEventListener("click", () => {
    tap();
    heist.next();
    render();
    if (heist.state.phase === "question") focusAnswer();
  });
  setTimeout(() => btn.focus({ preventScroll: true }), 50);
}

// ---------------------------------------------------------------- quick guide
function showGuide() {
  if (document.querySelector(".overlay")) return;
  overlay(`<div class="dialog guide" role="dialog" aria-labelledby="gd">
      <h2 id="gd">Quick guide</h2>
      <div class="guide-row"><span class="shields">${icon.shield(true)}${icon.shield(true)}</span><div><strong>Badges = your lives</strong><p>You start with ${R.startShields}. A wrong answer (or a skip) loses one. Lose them all and you're caught.</p></div></div>
      <div class="guide-row">${icon.loot()}<div><strong>Loot = your score</strong><p>Money you've grabbed so far. Every right answer adds more.</p></div></div>
      <div class="guide-row">${icon.gadget()}<div><strong>Gadgets = clues</strong><p>Each gadget buys one clue (Region, Map Pin, First Letter or Capital City). Using a clue makes that flag pay a bit less.</p></div></div>
      <div class="guide-row">${icon.countdown()}<div><strong>${R.timedSeconds} seconds per lock</strong><p>Watch the bar under the flag. If time runs out, it counts as wrong. The clock pauses while a pop-up is open.</p></div></div>
      <div class="guide-row">${icon.pass()}<div><strong>Skip</strong><p>No idea at all? Skip shows you the answer and moves on, but it costs 1 life.</p></div></div>
      <div class="guide-row"><span class="go-chip">Go</span><div><strong>Type, then Go</strong><p>Type the country and tap Go (or press Return). Small spelling mistakes are fine.</p></div></div>
      <div class="actions"><button class="btn" data-act="ok">Let's go</button></div>
    </div>`, (ov) => {
    ov.querySelector('[data-act="ok"]').addEventListener("click", () => {
      tap(); heist.markIntro("guide"); save(); ov.remove(); focusAnswer();
    });
  });
}

// ---------------------------------------------------------------- events & wagers
function showEvent() {
  const ev = heist.pendingEvent;
  const texts = ST.events[ev.id] || [""];
  const storyText = tell(texts[heist.story.eventText?.[ev.id] ?? 0]);
  audio.play("alarm");
  flash("denied");
  overlay(`<div class="dialog alert" role="alertdialog" aria-labelledby="evt">
      <div class="siren"></div>
      <div class="event-art">${icon[ev.id]()}</div>
      <div class="kicker">Security surprise!</div>
      <h2 id="evt">${esc(ev.title)}</h2>
      <p class="story">${esc(storyText)}</p>
      <p class="rule-box"><b>What this means:</b> ${esc(ev.rule)}</p>
      <div class="actions"><button class="btn" data-act="ok">Got it</button></div>
    </div>`, (ov) => {
    ov.querySelector('[data-act="ok"]').addEventListener("click", () => {
      tap();
      const eff = heist.ackEvent() || {};
      if (eff.loot) audio.play("coins");
      if (eff.shields || eff.gadgets) audio.play("gadget");
      ov.remove();
      render();
      if (eff.loot) bump("loot");
      if (eff.shields) bump("shields");
      if (eff.gadgets) bump("gadgets");
      focusAnswer();
    });
  });
}

function showWager() {
  const loot = heist.state.loot;
  audio.play("wager");
  const opts = R.wagerOptions.map((f) => {
    const stake = Math.round((loot * f) / 100) * 100;
    if (f === 0) return `<button class="choice" data-f="0"><strong>No bet</strong><span>Play the next flag normally. Your loot is safe.</span></button>`;
    return `<button class="choice" data-f="${f}"><strong>${f === 1 ? "Bet it ALL" : "Bet half"}: <em>${money(stake)}</em></strong><span>Get it right: win ${money(stake)} more. Get it wrong: lose ${money(stake)}.</span></button>`;
  }).join("");
  overlay(`<div class="dialog" role="dialog" aria-labelledby="wg">
      <div class="event-art">${icon.wager()}</div>
      <h2 id="wg">Want to make a bet?</h2>
      <p>You have ${money(loot)}. Bet some of it on the next flag. Feeling lucky?</p>
      <div class="wager-options">${opts}</div>
    </div>`, (ov) => {
    on(ov, "[data-f]", "click", (e) => {
      tap();
      heist.chooseWager(Number(e.currentTarget.dataset.f));
      ov.remove();
      render();
      focusAnswer();
    });
  });
}

// ---------------------------------------------------------------- chamber clear
function renderChamberClear() {
  const s = heist.state, ch = DATA.chambers[s.lastClear.ci];
  const hist = s.history.filter((h) => h.ci === s.lastClear.ci);
  const main = hist.filter((h) => !h.bonus);
  const lootHere = hist.reduce((t, h) => t + h.gained + (h.correct ? h.stake : -h.stake), 0);
  const next = DATA.chambers[s.lastClear.ci + 1];
  const el = mount(`
    <div class="panel">
      <div class="clear-art">${icon.lock(true)}</div>
      <div class="chamber-number">Chamber ${s.lastClear.ci + 1} of ${DATA.chambers.length} cleared</div>
      <h1>${esc(ch.name)} breached</h1>
      <p class="story">${esc(line(ST.chamberClear, s.ci))} ${s.lastClear.perfect ? (s.lastClear.restored ? "No mistakes, so you win back a life!" : "No mistakes! Your lives are already full.") : s.shields === 1 ? "Careful: only one life left." : ""}</p>
      <div class="stats">
        <div><b>${main.filter((h) => h.correct).length} / ${main.length}</b><span>Flags correct</span></div>
        <div class="accent"><b>${money(lootHere)}</b><span>Loot from this chamber</span></div>
        <div><b>${s.shields}</b><span>Lives left</span></div>
        <div><b>${s.gadgets}</b><span>Gadgets left</span></div>
      </div>
      ${routeHtml(s.lastClear.ci + 1, true)}
      <div class="actions"><button class="btn" data-act="go">${next.finalLock ? "Approach the final lock" : `On to the ${esc(next.name.replace(/^The /, ""))}`}</button></div>
    </div>`, "panel-screen");
  audio.play("chamber");
  if (s.lastClear.restored) setTimeout(() => audio.play("gadget"), 700);
  on(el, '[data-act="go"]', "click", () => { tap(); heist.next(); render(); });
}

// ---------------------------------------------------------------- finale
function recordFinish() {
  if (heist.state.recorded) return;
  heist.state.recorded = true;
  const rec = store.get(KEY.records, { bestLoot: 0, vaults: 0, runs: 0 });
  rec.bestLoot = Math.max(rec.bestLoot, heist.state.loot);
  if (heist.state.phase === "won") rec.vaults++;
  store.set(KEY.records, rec);
}

function renderFinale() {
  recordFinish();
  const sum = heist.summary();
  const t = heist.treasure();
  audio.stopMusic(0.6);
  const el = mount(`
    <div class="vault-scene">
      <div class="treasure">${treasureRoom(t)}</div>
      <div class="light-burst" style="--glow:${t.material.glow}"></div>
      <div class="door-wrap">${vaultDoor({ glow: true })}</div>
    </div>
    <div class="sparkles" aria-hidden="true"></div>
    <div class="prize-card" role="status">
      <div class="kicker">${esc(line(ST.won))}</div>
      <h1>${esc(t.name)}</h1>
      <p>${esc(t.quirks[0])} ${esc(t.quirks[1])}</p>
      <p class="value">Worth: ${esc(t.value)}</p>
      <div class="loot-total" data-total>${money(0)}</div>
      <div class="actions" style="justify-content:center"><button class="btn" data-act="debrief">See how you did</button></div>
    </div>`, "finale");
  audio.play("vault");
  const steps = settings.reduceMotion ? [0, 0, 0] : [300, 1000, 1500];
  setTimeout(() => el.classList.add("spin"), steps[0]);
  setTimeout(() => el.classList.add("unbolt"), steps[1]);
  setTimeout(() => {
    el.classList.add("open");
    const total = el.querySelector("[data-total]");
    const target = sum.loot, t0 = performance.now(), dur = settings.reduceMotion ? 1 : 2400;
    setTimeout(() => {
      audio.play("coins");
      const step = () => {
        const k = Math.min(1, (performance.now() - t0 - 3400) / dur);
        total.textContent = money(target * (k < 0 ? 0 : 1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step); else audio.play("coins");
      };
      step();
      if (!settings.reduceMotion) {
        const sp = el.querySelector(".sparkles");
        const colors = [t.material.glow, t.material.hi, "#3ef2b4", "#ffffff"];
        for (let i = 0; i < 80; i++) {
          const n = document.createElement("i");
          n.style.left = Math.random() * 100 + "%";
          n.style.animationDuration = 3 + Math.random() * 4 + "s";
          n.style.animationDelay = Math.random() * 3 + "s";
          n.style.background = colors[i % colors.length];
          sp.appendChild(n);
        }
      }
    }, settings.reduceMotion ? 0 : 3400);
  }, steps[2]);
  on(el, '[data-act="debrief"]', "click", () => { tap(); view = "debrief"; render(); });
}

function renderCaught() {
  recordFinish();
  const sum = heist.summary();
  audio.stopMusic(0.3);
  audio.play("caught");
  const el = mount(`
    <div class="red-sweep"></div>
    <div class="bars" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="animation-delay:${i * 0.05}s"></i>`).join("")}</div>
    <div class="dialog alert" role="alertdialog" aria-labelledby="cg">
      <div class="siren"></div>
      <h2 id="cg">Caught in the ${esc(sum.chamberName.replace(/^The /, ""))}</h2>
      <p class="story">${esc(line(ST.caught))}</p>
      <p>You got ${sum.correct} of ${sum.total} right and made it ${sum.chamberReached === 0 ? "into the first chamber" : `through ${sum.chamberReached} of ${DATA.chambers.length} chambers`} with ${money(sum.loot)}. So close. Try again?</p>
      <div class="actions"><button class="btn secondary" data-act="debrief">Debrief</button><button class="btn" data-act="again">Try again</button></div>
    </div>`, "caught");
  on(el, '[data-act="debrief"]', "click", () => { tap(); view = "debrief"; render(); });
  on(el, '[data-act="again"]', "click", () => { tap(); store.del(KEY.run); newHeist(); });
}

function renderDebrief() {
  const sum = heist.summary();
  const players = Object.entries(sum.perPlayer);
  const el = mount(`
    <div class="panel">
      <div class="kicker">${sum.won ? "Vault cracked" : "Mission report"}</div>
      <h1>${sum.won ? `You stole ${esc(heist.treasure().name.replace(/^The /, "the "))}!` : `Stopped at the ${esc(sum.chamberName.replace(/^The /, ""))}`}</h1>
      ${routeHtml(sum.won ? DATA.chambers.length : sum.chamberReached, true, sum.won ? DATA.chambers.length : sum.chamberReached)}
      <div class="stats">
        <div class="accent"><b>${money(sum.loot)}</b><span>Total loot</span></div>
        <div><b>${sum.correct} / ${sum.total}</b><span>Flags identified</span></div>
        <div><b>${sum.bestStreak}</b><span>Most right in a row</span></div>
        <div><b>${sum.gadgetsUsed}</b><span>Clues used</span></div>
        <div><b>${sum.minutes} min</b><span>Time in the vault</span></div>
      </div>
      ${players.length ? `<div class="player-scores">${players.map(([n, p]) => `<div><strong>${esc(n)}</strong><br>${p.correct} of ${p.total} correct</div>`).join("")}</div>` : ""}
      ${sum.learn.length ? `<h2>Ones to practice</h2><p>The ones you missed or needed a clue for.</p>
      <div class="learn-grid">${sum.learn.map((code) => `<figure><img src="${flagSrc(code)}" alt=""><figcaption>${esc(country(code).name)}</figcaption></figure>`).join("")}</div>`
      : `<h2>A perfect job</h2><p>Every answer right, no clues needed. Legendary.</p>`}
      <div class="actions">
        <button class="btn ghost" data-act="title">Title screen</button>
        <button class="btn" data-act="again">Plan another heist</button>
      </div>
    </div>`, "panel-screen");
  on(el, '[data-act="title"]', "click", () => { tap(); store.del(KEY.run); heist = null; view = "title"; document.body.dataset.intensity = 0; render(); });
  on(el, '[data-act="again"]', "click", () => { tap(); store.del(KEY.run); newHeist(); });
}

// ---------------------------------------------------------------- overlays
function overlay(html, wire) {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = html;
  document.body.appendChild(ov);
  wire(ov);
  setTimeout(() => ov.querySelector("button")?.focus({ preventScroll: true }), 30);
  return ov;
}

function confirmDialog({ title, text, yes, danger = false }, onYes) {
  overlay(`<div class="dialog" role="dialog" aria-labelledby="cd"><h2 id="cd">${esc(title)}</h2><p>${esc(text)}</p>
    <div class="actions"><button class="btn ghost" data-act="no">Cancel</button><button class="btn ${danger ? "danger" : ""}" data-act="yes">${esc(yes)}</button></div></div>`, (ov) => {
    ov.querySelector('[data-act="no"]').addEventListener("click", () => { tap(); ov.remove(); focusAnswer(); });
    ov.querySelector('[data-act="yes"]').addEventListener("click", () => { ov.remove(); onYes(); });
  });
}

function openSettings() {
  const inRun = view === "heist" && heist && !["won", "caught"].includes(heist.state.phase);
  const sw = (key, label, help) => `<div class="toggle-row"><div><strong>${label}</strong>${help ? `<small>${help}</small>` : ""}</div><button class="switch" role="switch" aria-checked="${settings[key]}" aria-label="${label}" data-sw="${key}"></button></div>`;
  overlay(`<div class="dialog" role="dialog" aria-labelledby="st">
      <h2 id="st">Settings</h2>
      <div class="field"><label for="mv">Music volume</label><input id="mv" class="slider" type="range" min="0" max="1" step="0.05" value="${settings.musicVolume}"></div>
      <div class="field"><label for="sv">Sound effects volume</label><input id="sv" class="slider" type="range" min="0" max="1" step="0.05" value="${settings.sfxVolume}"></div>
      <div>
        ${sw("muted", "Mute all sound")}
        ${sw("reduceMotion", "Reduce motion", "Calmer animations, no flashing.")}
        ${sw("largeText", "Larger text")}
        ${sw("autoKeyboard", "Open the keyboard automatically", "Turn off to see each flag full size before typing.")}
      </div>
      <div class="actions">
        ${inRun ? `<button class="btn danger" data-act="abandon">Abandon heist</button>` : ""}
        <button class="btn" data-act="close">Done</button>
      </div>
    </div>`, (ov) => {
    ov.querySelector("#mv").addEventListener("input", (e) => { settings.musicVolume = Number(e.target.value); applySettings(); });
    ov.querySelector("#sv").addEventListener("input", (e) => { settings.sfxVolume = Number(e.target.value); applySettings(); audio.play("tap"); });
    on(ov, "[data-sw]", "click", (e) => {
      const k = e.currentTarget.dataset.sw;
      settings[k] = !settings[k];
      e.currentTarget.setAttribute("aria-checked", settings[k]);
      applySettings(); tap();
    });
    ov.querySelector('[data-act="close"]').addEventListener("click", () => { tap(); ov.remove(); if (view !== "heist") render(); });
    ov.querySelector('[data-act="abandon"]')?.addEventListener("click", () => {
      if (!confirm("Abandon this heist? Progress will be lost.")) return;
      ov.remove(); store.del(KEY.run); heist = null; q = null; audio.stopMusic(); view = "title"; document.body.dataset.intensity = 0; render();
    });
  });
}

// First tap anywhere unlocks audio on iPad.
document.addEventListener("pointerdown", () => audio.unlock(), { once: true });
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

render();

// Test hook (used by the automated checks; harmless in normal play).
window.__flagVault = { get heist() { return heist; }, render, DATA };
