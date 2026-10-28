// Answer checking. Pure functions, no DOM. Shared by the game and the tests.
//
// judge(input, targetCode) returns one of:
//   { verdict: "correct", exact }            right (exact=false means a typo was forgiven)
//   { verdict: "wrong", matched }            wrong (matched = code of the country typed, if any)
//   { verdict: "retry", message }            close but not certain: let the player fix it
//   { verdict: "clarify", message }          too vague (e.g. "Korea"): be more specific
//   { verdict: "empty" }

export function normalize(s) {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’‘`ʻ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bst\b/g, "saint")
    .replace(/\bmt\b/g, "mount")
    .trim()
    .replace(/^the /, "")
    .replace(/\s+/g, " ");
}

// Spaces removed so "u s virgin islands" and "us virgin islands" match.
export const compact = (s) => normalize(s).replace(/ /g, "");

// Optimal-string-alignment distance (Levenshtein + adjacent swaps).
export function editDistance(a, b, limit = 99) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const m = a.length, n = b.length;
  let prev2 = null, prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > limit) return limit + 1;
    prev2 = prev; prev = cur;
  }
  return prev[n];
}

// How many typos to forgive, by length of the name.
export function tolerance(len) {
  if (len <= 4) return 0;
  if (len <= 6) return 1;
  if (len <= 11) return 2;
  return 3;
}

export function buildAnswerIndex(countries, ambiguous = {}) {
  const keysByCode = new Map();
  const owner = new Map(); // key -> code
  const add = (code, text) => {
    const k = compact(text);
    if (!k) return;
    if (!keysByCode.get(code).includes(k)) keysByCode.get(code).push(k);
  };
  for (const c of countries) {
    keysByCode.set(c.code, []);
    for (const t of [c.name, ...(c.aliases || [])]) {
      add(c.code, t);
      // Auto-variants: "Cayman Islands" -> "Cayman", "Republic of X" -> "X".
      const n = normalize(t);
      const variants = [n.replace(/ islands?$/, ""), n.replace(/^republic of /, "")];
      for (const v of variants) if (v !== n && v.length >= 4) add(c.code, v);
    }
  }
  // Resolve collisions: a key that belongs to several countries is owned by
  // whichever lists it as its real name/alias first; variants never steal.
  for (const c of countries) {
    for (const k of keysByCode.get(c.code)) {
      if (!owner.has(k)) owner.set(k, c.code);
    }
  }
  // Make sure explicit names always own their key.
  for (const c of countries) for (const t of [c.name, ...(c.aliases || [])]) owner.set(compact(t), c.code);
  const amb = new Map(Object.entries(ambiguous).map(([k, v]) => [compact(k), v]));
  for (const k of amb.keys()) {
    owner.delete(k);
    for (const list of keysByCode.values()) { const i = list.indexOf(k); if (i >= 0) list.splice(i, 1); }
  }
  const byCode = new Map(countries.map((c) => [c.code, c]));
  return { keysByCode, owner, amb, byCode, allKeys: [...owner.entries()] };
}

export function judge(index, input, targetCode, { retryUsed = false } = {}) {
  const key = compact(input);
  if (!key) return { verdict: "empty" };
  if (index.amb.has(key)) return { verdict: "clarify", message: index.amb.get(key) };
  const target = index.byCode.get(targetCode);
  const targetKeys = index.keysByCode.get(targetCode);

  if (targetKeys.includes(key)) return { verdict: "correct", exact: true };

  const owner = index.owner.get(key);
  if (owner && owner !== targetCode) {
    if (target.twin === owner && !retryUsed) {
      return { verdict: "retry", twin: true, message: "So close. That flag has a near-identical twin. Study the shade and proportions, then answer again." };
    }
    return { verdict: "wrong", matched: owner };
  }

  // Typo handling.
  let dT = Infinity, tolT = 0;
  for (const k of targetKeys) {
    const d = editDistance(key, k, 4);
    if (d < dT) { dT = d; tolT = tolerance(k.length); }
  }
  let dO = Infinity, nearest = null;
  for (const [k, code] of index.allKeys) {
    if (code === targetCode) continue;
    const d = editDistance(key, k, 4);
    if (d < dO) { dO = d; nearest = code; }
  }
  if (dT <= tolT && dO > dT) return { verdict: "correct", exact: false };

  // Unique, substantial prefix: "central african" -> Central African Republic.
  if (key.length >= 5) {
    const tPrefix = targetKeys.some((k) => k.startsWith(key) && key.length >= k.length * 0.6);
    const oPrefix = index.allKeys.some(([k, code]) => code !== targetCode && k.startsWith(key));
    if (tPrefix && !oPrefix) return { verdict: "correct", exact: false };
  }

  const close = (dT <= tolT && dO <= dT) || (dT === tolT + 1 && dT < dO);
  if (close && !retryUsed) {
    return { verdict: "retry", message: "The scanner can't verify that spelling. Check it and submit again. No penalty." };
  }
  // A clear misspelling of a different country counts as that country.
  const matched = dO <= tolerance(key.length) && dO < dT ? nearest : null;
  return { verdict: "wrong", matched };
}
