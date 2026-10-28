// Invents the one-of-a-kind treasure waiting in the vault. Pure and seeded,
// so a saved run always reveals the same treasure.
import { makeRng } from "./rng.js";

export function makeTreasure(words, seed, countryName = "Atlantis") {
  const rng = makeRng(seed);
  const needsThe = /^(United|Netherlands|Bahamas|Gambia|Philippines|Maldives|Comoros|Seychelles|Vatican|Czech|Central African|Dominican|Republic)|Islands?$/.test(countryName);
  const named = needsThe ? `the ${countryName}` : countryName;
  const fill = (s) => s.replace(/\{country\}/g, named);
  const object = rng.pick(words.objects);
  const material = rng.pick(words.materials);
  const adj = rng.pick(words.adjectives);
  const origin = fill(rng.pick(words.origins));
  const style = rng.int(4);
  const name =
    style === 0 ? `The ${adj} ${material.name} ${object.name}` :
    style === 1 ? `The ${material.name} ${object.name} ${origin}` :
    `The ${adj} ${material.name} ${object.name} ${origin}`;
  const quirks = rng.shuffle(words.quirks).slice(0, 2).map(fill);
  const value = rng.pick(words.values);
  return { name, object: object.name, art: object.art, material, quirks, value, seed };
}
