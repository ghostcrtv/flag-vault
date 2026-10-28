// =====================================================================
//  Heist configuration: chambers, question slots, gadgets, events, scoring.
//  Edit this file to change the shape of a run. The engine reads it;
//  no interface code needs to change.
//
//  Slot types:
//    flag     a flag, type the country
//    decrypt  the flag is revealed tile by tile; answer early for a bonus
//    doppel   lookalike flags flicker past, then one locks in
//    map      a territory is highlighted on the world map; type its name
//  Slot options:
//    tier     difficulty tier to draw from (or [min, max])
//    wager    show the High-Risk Breach choice before this question
//    event    a random security event may fire before this question
// =====================================================================

export const CHAMBERS = [
  {
    id: "entrance",
    name: "Street Entrance",
    tagline: "Badge through the front door. Easy does it.",
    lootPerFlag: 1000,
    slots: [
      { type: "flag", tier: 1 },
      { type: "flag", tier: 1 },
      { type: "flag", tier: 1 },
      { type: "flag", tier: 1 },
      { type: "flag", tier: 1 },
    ],
  },
  {
    id: "lobby",
    name: "Security Lobby",
    tagline: "The cameras are watching. Decrypt their feeds.",
    lootPerFlag: 2000,
    slots: [
      { type: "flag", tier: 2 },
      { type: "decrypt", tier: 2 },
      { type: "flag", tier: 2 },
      { type: "decrypt", tier: 2 },
      { type: "flag", tier: 2 },
    ],
  },
  {
    id: "lasers",
    name: "Laser Corridor",
    tagline: "Lookalikes everywhere. Trust your eyes.",
    lootPerFlag: 3000,
    slots: [
      { type: "flag", tier: 3 },
      { type: "doppel", tier: [2, 3] },
      { type: "flag", tier: 3 },
      { type: "flag", tier: 3, event: true },
      { type: "doppel", tier: [3, 4] },
      { type: "flag", tier: 3 },
    ],
  },
  {
    id: "control",
    name: "Control Room",
    tagline: "Hijack the satellites. Then decide how much to risk.",
    lootPerFlag: 5000,
    slots: [
      { type: "flag", tier: 4 },
      { type: "map", tier: [3, 4] },
      { type: "flag", tier: 4, wager: true },
      { type: "decrypt", tier: 4 },
      { type: "flag", tier: 4 },
      { type: "flag", tier: 4 },
    ],
  },
  {
    id: "corridor",
    name: "Deep Vault Corridor",
    tagline: "Few crews make it this far. The air is cold.",
    lootPerFlag: 8000,
    slots: [
      { type: "flag", tier: 5 },
      { type: "doppel", tier: [4, 6] },
      { type: "decrypt", tier: 5, event: true },
      { type: "flag", tier: 5, wager: true },
      { type: "flag", tier: 5 },
      { type: "flag", tier: 5 },
    ],
  },
  {
    id: "final",
    name: "The Final Lock",
    tagline: "Six tumblers. The hardest flags in the vault.",
    lootPerFlag: 15000,
    finalLock: true,
    slots: [
      { type: "flag", tier: 5 },
      { type: "flag", tier: 6 },
      { type: "doppel", tier: [5, 6] },
      { type: "flag", tier: 6 },
      { type: "flag", tier: 6 },
      { type: "flag", tier: 6, wager: true },
    ],
  },
];

export const RULES = {
  startShields: 4,        // wrong answers cost one shield; zero = caught
  maxShields: 5,
  perfectChamberShield: 1, // shields restored for a flawless chamber
  startGadgets: 3,
  maxGadgets: 5,
  streakBonusStep: 0.1,   // +10% loot per consecutive correct answer...
  streakBonusMax: 0.5,    // ...up to +50%
  decryptMaxBonus: 1.0,   // answer with the flag fully hidden = +100%
  wagerOptions: [0, 0.5, 1], // fraction of current loot at stake
  timedSeconds: 45,       // only used in Timed mode
  checkingMs: 1300,       // "verifying clearance" suspense pause
};

// Gadgets (hints). cost = share of the question's loot given up.
export const GADGETS = {
  region:  { name: "Region Scan",       cost: 0.25, desc: "Reveals the region of the world." },
  locate:  { name: "Satellite Locator", cost: 0.35, desc: "Pings its location on the world map." },
  letter:  { name: "Letter Decoder",    cost: 0.5,  desc: "Reveals the first letter and length of the name." },
  intel:   { name: "Intel File",        cost: 0.5,  desc: "Reveals the capital (and status, for territories)." },
};

// Security events. One is drawn at random for each slot marked event: true.
export const EVENTS = [
  {
    id: "laserGrid",
    title: "Laser Grid Armed",
    text: "The corridor lights up. Gadgets are offline for this flag, but the loot is doubled.",
  },
  {
    id: "countdown",
    title: "Patrol Countdown",
    text: "A guard is coming. Answer within 25 seconds for triple loot. If the clock runs out you just lose the bonus, nothing else.",
    seconds: 25,
  },
  {
    id: "supplyDrop",
    title: "Supply Drop",
    text: "Your inside contact left a case behind a vent. +1 gadget.",
  },
  {
    id: "checkpoint",
    title: "Extra Checkpoint",
    text: "A surprise checkpoint! A bonus flag. Get it right to restore a shield (or bank extra loot if your shields are full). A miss costs nothing.",
  },
];

// The vault's centerpiece changes each successful run.
export const FINALE_PRIZES = [
  { name: "The Meridian Atlas", text: "A gold-bound atlas holding every flag ever flown." },
  { name: "The Compass Rose Diamond", text: "A 300-carat diamond cut with thirty-two points." },
  { name: "The Admiral's Ensign", text: "A silk banner said to have crossed every ocean." },
  { name: "The Equator Crown", text: "A crown set with a gemstone from every continent." },
  { name: "The Cartographer's Key", text: "The master key to every vault on Earth." },
];
