import test from "node:test";
import assert from "node:assert/strict";
import { DATA } from "../js/data/index.js";
import { FLAG_SVG } from "../js/data/flags-data.js";

test("every country has a flag file, valid tier, region and capital", () => {
  const seen = new Set();
  for (const c of DATA.countries) {
    assert.ok(!seen.has(c.code), `duplicate ${c.code}`); seen.add(c.code);
    assert.ok(/^<svg[\s\S]*<\/svg>$/.test(FLAG_SVG[c.code]) && /viewBox=/.test(FLAG_SVG[c.code]), `flag ${c.code}`);
    assert.ok(c.tier >= 1 && c.tier <= 6, c.code);
    assert.ok(c.region && c.capital && c.name, c.code);
    assert.ok(DATA.map.points[c.code], `map point ${c.code}`);
  }
});

test("lookalike groups and twins reference real countries", () => {
  const codes = new Set(DATA.countries.map((c) => c.code));
  for (const g of DATA.lookalikes) for (const c of g.codes) assert.ok(codes.has(c), `${g.name}: ${c}`);
  for (const c of DATA.countries) if (c.twin) assert.ok(codes.has(c.twin));
});

test("no two countries share an accepted answer", () => {
  const owners = new Map();
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const c of DATA.countries) for (const n of [c.name, ...c.aliases]) {
    const k = norm(n);
    assert.ok(!owners.has(k) || owners.get(k) === c.code, `"${n}" used by ${owners.get(k)} and ${c.code}`);
    owners.set(k, c.code);
  }
});

test("each tier has enough flags for the chambers", () => {
  const count = {};
  for (const c of DATA.countries) count[c.tier] = (count[c.tier] || 0) + 1;
  for (const t of [1, 2, 3, 4, 5, 6]) assert.ok(count[t] >= 12, `tier ${t}: ${count[t]}`);
});
