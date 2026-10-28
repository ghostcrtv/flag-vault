// =====================================================================
//  Story text. A fresh mix is picked for every heist, so the briefing,
//  chamber openings, events and endings change from run to run.
//  Placeholders: {vault} {city} {contact} {crew} {loot} {shields}
//  Keep lines short: one or two punchy sentences reads best on an iPad.
// =====================================================================

export const STORY = {
  vaults: [
    "the Obsidian Reserve", "the Glacier Bank", "Meridian Trust", "the Iron Lantern Vault",
    "the Sapphire Depository", "Polaris Bullion House", "the Neon Citadel", "the Monolith Bank",
    "the Black Pearl Reserve", "Aurora Federal", "the Titan Strongroom", "the Echo Chamber Bank",
  ],
  cities: [
    "Zurich", "Singapore", "Monaco", "Dubai", "Reykjavík", "Buenos Aires", "Tokyo",
    "Cape Town", "Montreal", "Oslo", "Hong Kong", "Lisbon", "Seoul", "Sydney",
  ],
  contacts: ["Nova", "Ghost", "Pixel", "Viper", "Echo", "Raven", "Comet", "Jinx", "Atlas", "Cipher", "Blitz", "Onyx"],
  crews: [
    "The Night Owls", "Team Midnight", "The Banner Bandits", "Crew Zero", "The Flagrunners",
    "The Silent Stripes", "The Mint Condition", "Operation Starfield", "The Polar Ghosts", "The Last Minute Club",
  ],

  briefing: [
    "Tonight's target: {vault} in {city}. Nobody has ever cracked it. Your inside contact, {contact}, found its weakness. Every lock opens for one thing: the right flag.",
    "{contact} just sent a message. \"{vault} switches to a flag-only security system at midnight. Know your flags and you walk right in.\" It's 11:58.",
    "Rumor says the most incredible treasure on Earth is sitting in {vault} in {city}. Seven chambers stand in the way. Each one is guarded by flags.",
    "{crew}, this is it. {vault}, {city}. {contact} has cut the cameras for exactly one night. Name the flags. Open the doors. Grab the prize.",
  ],

  // One list per chamber (same order as chambers.js). One line is picked per run.
  chamberIntro: [
    [
      "The front door hums. A scanner wakes up and flashes a flag at you. Easy ones first.",
      "You slip past the doorman. The first security panel lights up. Warm up those flag skills.",
      "Rain on the street. A keypad by the door blinks to life. Time to badge in.",
    ],    [
      "The lobby cameras are scrambled. Every flag arrives in pieces, decrypting tile by tile.",
      "{contact} hacked the camera feed, but it's glitchy. Flags will load one square at a time.",
      "Marble floors. Silent guards. Every screen shows a flag hidden behind encrypted tiles.",
    ],    [
      "Wall-to-wall screens. You've hijacked the satellites. Each lock shows a country from space. Name it.",
      "{contact} patches you into the satellite feed. No flags here. Just countries glowing on a map.",
      "The control room is yours. The satellites spin and light up one country at a time.",
    ],    [
      "Red beams crisscross the hall. The scanners shuffle lookalike flags to confuse you.",
      "This corridor plays tricks. Flags that look almost the same flash past. Watch which one sticks.",
      "Lasers everywhere. The system flickers through twin flags before it locks on one.",
    ],    [
      "Up on the roof, the giant telescope swivels. It zooms in on tiny countries and islands. Name them.",
      "The observatory dome opens. {contact} aims the satellites at trickier spots on the globe.",
      "Wind howls across the roof. The big screen tracks harder countries now. Smaller. Sneakier.",
    ],
    [
      "Freezing air. A sweeping laser scans each flag into view, left to right. Shout it out early for a bonus.",
      "The last corridor. A red laser crawls across each flag. The sooner you name it, the bigger the haul.",
      "Deep underground now. Each flag is revealed by a slow-moving laser. Speed pays.",
    ],    [
      "The vault door. Eight tumblers. The hardest flags on the planet. One bolt slides free for every correct answer.",
      "This is it. Eight bolts hold the door shut. Each one needs an expert flag.",
      "The final lock glows. Behind this door: the treasure. Eight flags stand between you and it.",
    ],
  ],

  // How each challenge works, shown at the start of every chamber.
  mechanicHow: {
    flag: "A flag appears. Type the country it belongs to.",
    decrypt: "Each flag is hidden under tiles that open one by one. Answer as soon as you know it. The earlier you answer, the bigger your bonus (up to double).",
    doppel: "Lookalike flags flicker on the screen, then the scanner locks onto one. Name the flag it locks onto.",
    map: "A country lights up on the satellite map. Type its name. You'll see its flag after you answer.",
    sweep: "A laser sweeps across each flag from left to right. Answer before it finishes for a bonus (up to double).",
  },
  mechanicName: {
    flag: "Flag scan",
    decrypt: "Decryption scan",
    doppel: "Doppelgänger",
    map: "Satellite uplink",
    sweep: "Laser sweep",
  },

  correct: [
    "Click. That lock didn't stand a chance.",
    "Smooth. The door slides open.",
    "Access granted. Keep moving.",
    "Nailed it. The guards suspect nothing.",
    "Green light. Next!",
    "Too easy. {contact} is impressed.",
    "Lock cracked. The vault gets closer.",
    "Perfect. You're a natural.",
  ],
  wrong: [
    "The alarm blinks red. Shake it off.",
    "Close call. You lost a life.",
    "That one got you. Remember it for next time.",
    "Bzzzt. Security is getting nervous.",
    "Wrong flag. Stay sharp.",
    "Ouch. The scanner didn't like that.",
  ],

  // Story text for each security event (the rule itself is in chambers.js).
  events: {
    laserGrid: ["A grid of lasers snaps on. Your gear fizzes and goes dark.", "Red beams everywhere! Your gadgets stop working."],
    countdown: ["Footsteps! A guard is walking this way.", "{contact} on the radio: \"Patrol coming. Move fast!\""],
    supplyDrop: ["A small case is taped behind a vent. {contact} left you a present.", "You find a backpack in a locker. There's a gadget inside."],
    checkpoint: ["A barrier slams down. A surprise scanner wants one more flag.", "Wait, that checkpoint wasn't on the map!"],
    jackpot: ["One of the deposit boxes is wide open. Finders keepers.", "A cart full of cash is just sitting here. Grab it."],
    keycard: ["A guard dropped a keycard. That's an extra life!", "{contact} slides a spare keycard under the door."],
  },

  chamberClear: [
    "Door open. Nobody saw a thing.",
    "You're through. The next door is waiting.",
    "Another chamber down. {contact} says you're right on schedule.",
    "The alarms stay quiet. Keep going.",
  ],
  caught: [
    "Sirens. Floodlights. The doors slam shut.",
    "Out of lives. Steel bars drop from the ceiling.",
    "Busted! The security system wins this round.",
  ],
  won: [
    "The wheel spins. The bolts slide back. The door swings open...",
    "Eight bolts clear. A long hiss. Light pours out of the vault...",
  ],
};
