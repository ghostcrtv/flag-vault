// Gathers every data file into one object the engine and interface share.
import { COUNTRIES, AMBIGUOUS_ANSWERS } from "./countries.js";
import { LOOKALIKE_GROUPS } from "./lookalikes.js";
import { CHAMBERS, RULES, GADGETS, EVENTS, FINALE_PRIZES } from "./chambers.js";
import { MAP } from "./map-data.js";

export const DATA = {
  countries: COUNTRIES,
  ambiguous: AMBIGUOUS_ANSWERS,
  lookalikes: LOOKALIKE_GROUPS,
  chambers: CHAMBERS,
  rules: RULES,
  gadgets: GADGETS,
  events: EVENTS,
  prizes: FINALE_PRIZES,
  map: MAP,
};
