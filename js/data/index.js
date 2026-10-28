// Gathers every data file into one object the engine and interface share.
import { COUNTRIES, AMBIGUOUS_ANSWERS } from "./countries.js";
import { LOOKALIKE_GROUPS } from "./lookalikes.js";
import { CHAMBERS, RULES, GADGETS, EVENTS } from "./chambers.js";
import { STORY } from "./story.js";
import { TREASURE } from "./treasures.js";
import { MAP } from "./map-data.js";

export const DATA = {
  countries: COUNTRIES,
  ambiguous: AMBIGUOUS_ANSWERS,
  lookalikes: LOOKALIKE_GROUPS,
  chambers: CHAMBERS,
  rules: RULES,
  gadgets: GADGETS,
  events: EVENTS,
  story: STORY,
  treasure: TREASURE,
  map: MAP,
};
