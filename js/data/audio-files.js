// =====================================================================
//  Optional audio files. Everything works without them: the game
//  synthesizes its own music and effects. To use your own (for example
//  from Envato Elements), put the file in /audio and write its path here.
//  Use .mp3 or .m4a. Leave a slot as null to keep the built-in sound.
// =====================================================================

export const AUDIO_FILES = {
  music: {
    calm: null,   // chambers 1–3, loops (e.g. "audio/music-calm.mp3")
    tense: null,  // chambers 4–5, loops
    final: null,  // the final lock, loops
  },
  sfx: {
    granted: null,  // correct answer: lock clicking open
    denied: null,   // wrong answer: alarm buzz
    checking: null, // "verifying clearance" blips (about 1 second)
    alarm: null,    // security event siren
    chamber: null,  // chamber cleared
    vault: null,    // vault door opening (about 5 seconds)
    caught: null,   // caught by security
    gadget: null,   // using a gadget
    coins: null,    // loot counting up
  },
};
