import test from "node:test";
import assert from "node:assert/strict";
import { DATA } from "../js/data/index.js";
import { buildAnswerIndex, judge } from "../js/engine/answers.js";

const idx = buildAnswerIndex(DATA.countries, DATA.ambiguous);
const v = (input, code, opts) => judge(idx, input, code, opts).verdict;

test("exact names, case, spaces, accents, punctuation", () => {
  assert.equal(v("  canada ", "CA"), "correct");
  assert.equal(v("UNITED STATES", "US"), "correct");
  assert.equal(v("usa", "US"), "correct");
  assert.equal(v("Cote d'Ivoire", "CI"), "correct");
  assert.equal(v("côte d’ivoire", "CI"), "correct");
  assert.equal(v("ivory coast", "CI"), "correct");
  assert.equal(v("St. Kitts & Nevis", "KN"), "correct");
  assert.equal(v("saint lucia", "LC"), "correct");
  assert.equal(v("the bahamas", "BS"), "correct");
  assert.equal(v("Bosnia", "BA"), "correct");
  assert.equal(v("Holland", "NL"), "correct");
  assert.equal(v("Burma", "MM"), "correct");
  assert.equal(v("czechia", "CZ"), "correct");
  assert.equal(v("Timor-Leste", "TL"), "correct");
  assert.equal(v("Cayman", "KY"), "correct");
  assert.equal(v("US Virgin Islands", "VI"), "correct");
  assert.equal(v("U.S. Virgin Islands", "VI"), "correct");
  assert.equal(v("Sao Tome and Principe", "ST"), "correct");
  assert.equal(v("aland", "AX"), "correct");
  assert.equal(v("Guinea Bissau", "GW"), "correct");
});

test("forgives small typos", () => {
  assert.equal(v("Kazakstan", "KZ"), "correct");
  assert.equal(v("Phillipines", "PH"), "correct");
  assert.equal(v("Columbia", "CO"), "correct");
  assert.equal(v("Lichtenstein", "LI"), "correct");
  assert.equal(v("Azerbaijian", "AZ"), "correct");
  assert.equal(v("Mozambqiue", "MZ"), "correct");
  assert.equal(v("central african", "CF"), "correct");
});

test("never accepts a different country", () => {
  assert.equal(v("Nigeria", "NE"), "wrong");
  assert.equal(v("Niger", "NG"), "wrong");
  assert.equal(v("Guinea", "GW"), "wrong");
  assert.equal(v("Guinea", "GQ"), "wrong");
  assert.equal(v("Dominica", "DO"), "wrong");
  assert.equal(v("Dominican Republic", "DM"), "wrong");
  assert.equal(v("Austria", "AU"), "wrong");
  assert.equal(v("Australia", "AT"), "wrong");
  assert.equal(v("Slovakia", "SI"), "wrong");
  assert.equal(v("Slovenia", "SK"), "wrong");
  assert.equal(v("Sudan", "SS"), "wrong");
  assert.equal(v("Samoa", "AS"), "wrong");
  assert.equal(v("Iran", "IQ"), "wrong");
  assert.equal(v("Iraq", "IR"), "wrong");
  assert.equal(v("Mali", "MW"), "wrong");
  assert.equal(v("England", "GB"), "wrong");
  assert.equal(v("British Virgin Islands", "VI"), "wrong");
  assert.equal(v("Gambia", "ZM"), "wrong");
  assert.equal(v("Zambia", "GM"), "wrong");
});

test("typo of a different country is not accepted", () => {
  // "Nigera" is a typo of Nigeria but also close to Niger: never auto-accept.
  assert.notEqual(v("Nigera", "NE"), "correct");
  assert.notEqual(v("Slovania", "SK"), "correct");
  assert.notEqual(v("Austrlia", "AT"), "correct");
  assert.equal(v("Austrai", "AT"), "correct"); // swapped letters of Austria itself
});

test("near misses get one retry, then count as wrong", () => {
  assert.equal(v("Kyrgistn", "KG"), "retry");
  assert.equal(v("Kyrgistn", "KG", { retryUsed: true }), "wrong");
});

test("vague answers ask for clarification", () => {
  assert.equal(v("Korea", "KR"), "clarify");
  assert.equal(v("Congo", "CD"), "clarify");
  assert.equal(v("Congo", "CG"), "clarify");
  assert.equal(v("virgin islands", "VG"), "clarify");
  assert.equal(v("DRC", "CD"), "correct");
  assert.equal(v("Republic of the Congo", "CG"), "correct");
});

test("near-identical twins get one second look", () => {
  assert.equal(v("Romania", "TD"), "retry");
  assert.equal(v("Romania", "TD", { retryUsed: true }), "wrong");
  assert.equal(v("Monaco", "ID"), "retry");
  assert.equal(v("empty", "ID") !== "empty", true);
  assert.equal(v("   ", "ID"), "empty");
});
