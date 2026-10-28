import test from "node:test";
import assert from "node:assert/strict";
import { DATA } from "../js/data/index.js";
import { Heist } from "../js/engine/heist.js";

// Drives a run to the end. `answer(heist)` returns the text to type.
function play(h, answer, { wager = 0, hint = null } = {}) {
  let guard = 0;
  while (!["won", "caught"].includes(h.state.phase) && guard++ < 500) {
    const p = h.state.phase;
    if (p === "chamberIntro") h.beginChamber();
    else if (p === "event") h.ackEvent();
    else if (p === "wager") h.chooseWager(wager);
    else if (p === "question") {
      if (hint) h.useGadget(hint);
      const r = h.submit(answer(h));
      if (r.verdict === "retry" || r.verdict === "clarify") h.pass();
    } else if (p === "result" || p === "chamberClear") h.next();
  }
  return h;
}
const right = (h) => h.country(h.active.code).name;
const wrong = () => "Atlantis";

test("a perfect run reaches the vault with every slot filled and no repeats", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const h = play(Heist.create(DATA, { seed }), right);
    assert.equal(h.state.phase, "won", `seed ${seed}`);
    const codes = h.state.history.map((x) => x.code);
    assert.equal(new Set(codes).size, codes.length, `repeat in seed ${seed}`);
    assert.equal(h.state.history.filter((x) => !x.bonus).length, h.totalQuestions);
    assert.ok(h.state.loot > 0);
    const s = h.summary();
    assert.ok(s.won && s.correct === s.total);
  }
});

test("difficulty rises chamber by chamber", () => {
  const h = Heist.create(DATA, { seed: 7 });
  const avg = h.state.plan.chambers.map((c) => c.questions.reduce((t, q) => t + h.country(q.code).tier, 0) / c.questions.length);
  for (let i = 1; i < avg.length; i++) assert.ok(avg[i] > avg[i - 1], `chamber ${i}: ${avg}`);
});

test("wrong answers cost shields and end in capture", () => {
  const h = play(Heist.create(DATA, { seed: 3 }), wrong);
  assert.equal(h.state.phase, "caught");
  assert.equal(h.state.shields, 0);
  assert.equal(h.state.history.filter((x) => !x.correct && !x.bonus).length, DATA.rules.startShields);
  const s = h.summary();
  assert.equal(s.won, false);
  assert.equal(s.learn.length, DATA.rules.startShields);
});

test("gadgets reduce loot, run out, and give useful info", () => {
  const h = Heist.create(DATA, { seed: 11 });
  h.beginChamber();
  const code = h.active.code;
  const r1 = h.useGadget("letter");
  assert.ok(r1.ok && r1.info.text.startsWith(h.country(code).name[0]));
  assert.equal(h.useGadget("letter").ok, false, "same gadget twice");
  assert.ok(h.useGadget("region").info.text);
  assert.ok(h.useGadget("intel").info.text.includes("Capital"));
  assert.equal(h.state.gadgets, 0);
  assert.equal(h.useGadget("locate").ok, false, "none left");
  const out = h.submit(h.country(code).name).outcome;
  assert.ok(out.correct);
  assert.ok(out.gained < DATA.chambers[0].lootPerFlag * 0.2, `gained ${out.gained}`);
});

test("wager wins and losses move the stake", () => {
  const h = Heist.create(DATA, { seed: 5 });
  // Play correctly until the first wager appears.
  while (h.state.phase !== "wager") {
    const p = h.state.phase;
    if (p === "chamberIntro") h.beginChamber();
    else if (p === "event") h.ackEvent();
    else if (p === "question") h.submit(right(h));
    else h.next();
  }
  const before = h.state.loot;
  h.chooseWager(1);
  assert.equal(h.active.stake, Math.round(before / 100) * 100);
  const out = h.submit("Atlantis").outcome;
  assert.ok(!out.correct);
  assert.ok(h.state.loot <= before - out.stake + 100);
});

test("security events fire and the checkpoint adds a bonus flag", () => {
  let sawCheckpoint = false, sawSupply = false;
  for (let seed = 1; seed <= 30; seed++) {
    const h = Heist.create(DATA, { seed });
    while (!["won", "caught"].includes(h.state.phase)) {
      const p = h.state.phase;
      if (p === "chamberIntro") h.beginChamber();
      else if (p === "event") {
        const ev = h.pendingEvent.id, g = h.state.gadgets;
        h.ackEvent();
        if (ev === "checkpoint") { assert.ok(h.active.bonus); sawCheckpoint = true; }
        if (ev === "supplyDrop") { assert.equal(h.state.gadgets, Math.min(g + 1, DATA.rules.maxGadgets)); sawSupply = true; }
        if (ev === "laserGrid") assert.equal(h.canUseGadget("region").ok, false);
      } else if (p === "wager") h.chooseWager(0);
      else if (p === "question") h.submit(right(h));
      else h.next();
    }
  }
  assert.ok(sawCheckpoint && sawSupply);
});

test("a run survives save and restore mid-question", () => {
  const h = Heist.create(DATA, { seed: 21, mode: "turns", players: ["Leighton", "Steve"] });
  h.beginChamber();
  h.submit(right(h)); h.next();
  assert.equal(h.player, "Steve");
  const saved = JSON.parse(JSON.stringify(h.state));
  const r = Heist.restore(DATA, saved);
  assert.equal(r.active.code, h.active.code);
  play(r, right);
  assert.equal(r.state.phase, "won");
  const s = r.summary();
  assert.ok(s.perPlayer.Leighton.total > 0 && s.perPlayer.Steve.total > 0);
});

test("perfect chamber restores a shield", () => {
  const h = Heist.create(DATA, { seed: 9 });
  h.beginChamber();
  h.submit("Atlantis"); h.next(); // lose one in chamber 1
  while (h.state.phase !== "chamberClear") {
    if (h.state.phase === "question") h.submit(right(h)); else if (h.state.phase === "event") h.ackEvent(); else h.next();
  }
  assert.equal(h.state.lastClear.perfect, false);
  h.next(); h.beginChamber();
  const shields = h.state.shields;
  while (h.state.phase !== "chamberClear") {
    if (h.state.phase === "question") h.submit(right(h)); else if (h.state.phase === "event") h.ackEvent(); else if (h.state.phase === "wager") h.chooseWager(0); else h.next();
  }
  assert.equal(h.state.lastClear.perfect, true);
  assert.equal(h.state.shields, shields + 1);
});
