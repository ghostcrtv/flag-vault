// =====================================================================
//  The vault's treasure is invented fresh for every successful heist
//  from these lists. Add your own words: the more, the wilder.
//  {country} is replaced with a country your crew identified on the run.
// =====================================================================

export const TREASURE = {
  adjectives: [
    "Legendary", "Singing", "Floating", "Self-Polishing", "Upside-Down", "Ticking", "Gigantic",
    "Teeny-Tiny", "Ancient", "Time-Travelling", "Moonlit", "Thunderstruck", "Bouncing", "Whispering",
    "Turbo-Charged", "Royal", "Long-Lost", "Mysterious", "Glow-in-the-Dark", "Lucky", "Invisible-ish",
    "Sneezing", "Rocket-Powered", "Lightning-Fast", "Two-Hundred-Year-Old", "Unbreakable",
  ],
  // art: which drawing to use (see js/ui/treasure-art.js)
  objects: [
    { name: "Crown", art: "crown" }, { name: "Egg", art: "egg" }, { name: "Diamond", art: "gem" },
    { name: "Globe", art: "globe" }, { name: "Trophy", art: "trophy" }, { name: "Sword", art: "sword" },
    { name: "Mask", art: "mask" }, { name: "Coin", art: "coin" }, { name: "Rubber Duck", art: "duck" },
    { name: "Robot", art: "robot" }, { name: "Rocket", art: "rocket" }, { name: "Teapot", art: "teapot" },
    { name: "Key", art: "key" }, { name: "Skull", art: "skull" }, { name: "Pineapple", art: "pineapple" },
  ],
  // hi / mid / lo shades, plus the glow that fills the treasure room
  materials: [
    { name: "Solid Gold", hi: "#fff3b0", mid: "#ffc83d", lo: "#a8730a", glow: "#ffcf5a" },
    { name: "Emerald", hi: "#b5ffdc", mid: "#18c27a", lo: "#075c38", glow: "#3ef2b4" },
    { name: "Ruby", hi: "#ffc2cf", mid: "#e8204e", lo: "#6d0820", glow: "#ff4d73" },
    { name: "Sapphire", hi: "#c4ddff", mid: "#2f6fff", lo: "#0e2470", glow: "#5c8dff" },
    { name: "Amethyst", hi: "#ecd0ff", mid: "#9b4dff", lo: "#3f137a", glow: "#b57bff" },
    { name: "Jade", hi: "#e8ffd9", mid: "#5fe043", lo: "#1f7a12", glow: "#8dff6a" },
    { name: "Meteorite", hi: "#e3e4ee", mid: "#71768a", lo: "#22242c", glow: "#9aa7ff" },
    { name: "Rainbow Opal", hi: "#ffffff", mid: "#7ff0ff", lo: "#7a3cff", glow: "#ff7ae6", rainbow: true },
    { name: "Neon Crystal", hi: "#d4fffb", mid: "#1ff0de", lo: "#067a74", glow: "#29fff0" },
    { name: "Platinum", hi: "#ffffff", mid: "#cdd5e2", lo: "#6f7a8d", glow: "#dfe9ff" },
    { name: "Obsidian", hi: "#8c88b8", mid: "#25223a", lo: "#060509", glow: "#8a5cff" },
    { name: "Rose Quartz", hi: "#ffe4ef", mid: "#ff8fbc", lo: "#a8436d", glow: "#ff9fcb" },
  ],
  origins: [
    "of {country}", "of {country}", "of the Seven Seas", "of Atlantis", "of the Northern Lights",
    "of the Lost Pharaoh", "of Captain Blackbeard", "from the Moon", "of the Last Emperor",
    "from Outer Space", "of the Deep Ocean", "of Emperor Leighton the Bold", "of the Sky Pirates",
    "of the Forgotten Kingdom", "of the Volcano King",
  ],
  quirks: [
    "It hums the national anthem of {country} when nobody is looking.",
    "It is guarded by a very sleepy parrot named Gerald.",
    "Legend says it was won in a chess game against a pirate.",
    "It weighs as much as a small elephant.",
    "It changes color every time someone sneezes.",
    "Three explorers spent forty years searching for it.",
    "On full moons it floats two inches off its pedestal.",
    "It was last seen in {country} in the year 1492.",
    "Scientists still can't explain why it's always warm.",
    "It glows brighter when someone tells a joke.",
    "A museum once offered to trade an entire castle for it.",
    "It was smuggled out of {country} inside a giant birthday cake.",
    "Every flag in the world is engraved on its underside. Microscopically.",
    "It plays a tiny drumroll whenever someone walks past.",
    "It has been stolen eleven times. Tonight makes twelve.",
    "It is rumored to grant one wish, but only on Tuesdays.",
    "Its last owner traded it for a really good sandwich.",
    "It smells faintly of chocolate chip cookies.",
  ],
  values: ["$40 million", "$120 million", "$600 million", "$1.2 billion", "$3 billion", "$9.9 billion", "more than the Moon", "exactly one zillion dollars"],
};
