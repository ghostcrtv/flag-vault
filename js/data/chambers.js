// =====================================================================
//  Heist configuration: chambers, rules, gadgets, security events.
//  Edit this file to change the shape of a run. The engine reads it;
//  no interface code needs to change.
//
//  Every chamber has ONE challenge ("mechanic") that applies to every
//  lock in it:
//    flag     a flag appears, type the country
//    decrypt  the flag is revealed tile by tile; answer early for a bonus
//    doppel   lookalike flags flicker past, then one locks in
//    map      a country lights up on the satellite map; name it
//    sweep    a laser sweeps across, revealing the flag; answer early
//  tiers    one difficulty tier per lock (1 = famous .. 6 = expert);
//           the number of entries is the number of locks
//  wagers   which locks (0 = first) offer the High-Risk Breach choice
// =====================================================================

export const CHAMBERS = [
  {
    id: "entrance",
    name: "Street Entrance",
    short: "Entrance",
    mechanic: "flag",
    lootPerFlag: 1000,
    tiers: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "lobby",
    name: "Security Lobby",
    short: "Lobby",
    mechanic: "decrypt",
    lootPerFlag: 2000,
    tiers: [2, 2, 2, 2, 2, 2, 2, 2],
  },
  {
    id: "control",
    name: "Control Room",
    short: "Control Room",
    mechanic: "map",
    lootPerFlag: 3000,
    tiers: [[1, 2], [1, 2], [1, 3], [2, 3], [2, 3], [2, 4], [3, 4], [3, 4]],
  },
  {
    id: "lasers",
    name: "Laser Corridor",
    short: "Lasers",
    mechanic: "doppel",
    lootPerFlag: 4000,
    tiers: [[2, 3], [2, 3], [2, 4], [3, 4], [3, 4], [3, 4], [3, 5], [3, 5]],
    wagers: [5],
  },
  {
    id: "observatory",
    name: "Rooftop Observatory",
    short: "Observatory",
    mechanic: "map",
    lootPerFlag: 6000,
    tiers: [[3, 4], [3, 4], [4, 5], [4, 5], [4, 5], [4, 6], [5, 6], [5, 6]],
  },
  {
    id: "corridor",
    name: "Deep Vault Corridor",
    short: "Deep Vault",
    mechanic: "sweep",
    lootPerFlag: 8000,
    tiers: [4, 4, 5, 5, 5, 5, 5, 5],
    wagers: [6],
  },
  {
    id: "final",
    name: "The Final Lock",
    short: "Final Lock",
    mechanic: "flag",
    lootPerFlag: 15000,
    finalLock: true,
    tiers: [5, 6, 5, 6, 6, 5, 6, 6],
    wagers: [7],
  },
];

export const RULES = {
  startShields: 4,        // lives: wrong answers cost one; zero = caught
  maxShields: 5,
  perfectChamberShield: 1, // lives restored for a flawless chamber
  startGadgets: 3,        // gadgets are spent on clues
  maxGadgets: 5,
  streakBonusStep: 0.1,   // +10% loot per consecutive correct answer...
  streakBonusMax: 0.5,    // ...up to +50%
  revealMaxBonus: 1.0,    // decrypt/sweep: answering with the flag fully hidden = +100%
  wagerOptions: [0, 0.5, 1], // fraction of current loot at stake
  timedSeconds: 45,       // seconds per lock; running out counts as a wrong answer
  checkingMs: 1100,       // "verifying clearance" suspense pause
  eventsPerRun: 3,        // random security events per run...
  eventChambers: [1, 2, 3, 4, 5], // ...placed somewhere in these chambers (0 = first)
  mapMinArea: 120,        // map questions only use countries big enough to see
};

// The four clues. Each one costs 1 gadget and part of that flag's loot.
// cost = share of the flag's loot given up.
export const GADGETS = {
  region:  { name: "Region",       cost: 0.25, desc: "Shows which part of the world it's in." },
  locate:  { name: "Map Pin",      cost: 0.35, desc: "Drops a pin on the world map where it is." },
  letter:  { name: "First Letter", cost: 0.5,  desc: "Shows the first letter and how long the name is." },
  intel:   { name: "Capital City", cost: 0.5,  desc: "Shows its capital city." },
};

// Security events. A few are drawn at random each run, at random locks.
// `rule` is the plain-English effect; the story text lives in story.js.
export const EVENTS = [
  { id: "laserGrid", title: "Laser Grid", rule: "Gadgets are switched off for this flag, but it pays DOUBLE." },
  { id: "countdown", title: "Guard Patrol", rule: "Answer within 25 seconds for TRIPLE loot. If time runs out you only lose the bonus.", seconds: 25 },
  { id: "supplyDrop", title: "Supply Drop", rule: "You get +1 gadget to spend on clues." },
  { id: "checkpoint", title: "Surprise Checkpoint", rule: "A bonus flag before the next lock. Get it right to win an extra life. Miss it and nothing happens." },
  { id: "jackpot", title: "Open Deposit Box", rule: "Free loot! Your haul grows instantly." },
  { id: "keycard", title: "Spare Keycard", rule: "You get +1 life (or bonus loot if your lives are full)." },
];
