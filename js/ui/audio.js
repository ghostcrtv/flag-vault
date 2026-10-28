// Sound: synthesized music + effects (Web Audio, no files needed).
// Any slot listed in js/data/audio-files.js that points at a real file
// replaces the synthesized version automatically.
import { AUDIO_FILES } from "../data/audio-files.js";

const CHORDS = [ // D minor heist progression, as MIDI roots + minor/major
  [50, "m"], [46, "M"], [43, "m"], [45, "M"],
];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicVol = 0.6;
    this.sfxVol = 0.8;
    this.muted = false;
    this.intensity = 0;
    this.playing = false;
    this.buffers = {};
    this.fileMusic = null;
  }

  /** Must be called from a tap (iPad Safari only allows audio after one). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.duck = this.ctx.createGain();
      this.musicBus.connect(this.duck).connect(this.master);
      this.sfxBus.connect(this.master);
      // Gentle compressor keeps everything glued and safe for small speakers.
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3;
      this.master.connect(comp).connect(this.ctx.destination);
      this.noise = this.#makeNoise();
      this.applyVolumes();
      this.#loadFiles();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.05);
    this.musicBus.gain.setTargetAtTime(this.musicVol * 0.5, t, 0.1);
    this.sfxBus.gain.setTargetAtTime(this.sfxVol, t, 0.05);
    if (this.fileMusic) this.fileMusic.gain.gain.setTargetAtTime(this.musicVol * 0.8, t, 0.1);
  }

  setSettings({ musicVolume, sfxVolume, muted }) {
    this.musicVol = musicVolume; this.sfxVol = sfxVolume; this.muted = muted;
    this.applyVolumes();
  }

  async #loadFiles() {
    const all = { ...(AUDIO_FILES.music || {}), ...(AUDIO_FILES.sfx || {}) };
    for (const [slot, url] of Object.entries(all)) {
      if (!url) continue;
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        this.buffers[slot] = await this.ctx.decodeAudioData(await res.arrayBuffer());
      } catch { /* missing or unsupported file: keep the synth */ }
    }
    if (this.playing) this.#startFileMusic();
  }

  #makeNoise() {
    const len = this.ctx.sampleRate * 1.5;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---------- music ----------
  setIntensity(level) {
    this.intensity = level;
    if (this.fileMusic) this.#startFileMusic();
  }

  startMusic() {
    if (!this.ctx || this.playing) return;
    this.playing = true;
    if (this.#musicFileSlot()) { this.#startFileMusic(); return; }
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.#schedule(), 30);
  }

  stopMusic(fade = 1.2) {
    this.playing = false;
    clearInterval(this.timer);
    if (this.fileMusic) {
      const fm = this.fileMusic;
      fm.gain.gain.setTargetAtTime(0, this.ctx.currentTime, fade / 3);
      setTimeout(() => { try { fm.src.stop(); } catch {} }, fade * 1000 + 200);
      this.fileMusic = null;
    }
  }

  #musicFileSlot() {
    const slot = this.intensity >= 5 ? "final" : this.intensity >= 3 ? "tense" : "calm";
    return this.buffers[slot] ? slot : null;
  }

  #startFileMusic() {
    const slot = this.#musicFileSlot();
    if (!slot || !this.playing) return;
    if (this.fileMusic?.slot === slot) return;
    clearInterval(this.timer);
    if (this.fileMusic) { const old = this.fileMusic; old.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6); setTimeout(() => { try { old.src.stop(); } catch {} }, 2500); }
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[slot]; src.loop = true;
    const gain = this.ctx.createGain(); gain.gain.value = 0;
    src.connect(gain).connect(this.duck);
    src.start();
    gain.gain.setTargetAtTime(this.musicVol * 0.8, this.ctx.currentTime, 0.8);
    this.fileMusic = { slot, src, gain };
  }

  /** Lower the music while the scanner checks an answer. */
  suspense(on) {
    if (!this.ctx) return;
    this.duck.gain.setTargetAtTime(on ? 0.35 : 1, this.ctx.currentTime, 0.15);
  }

  #schedule() {
    const ctx = this.ctx;
    const bpm = 84 + this.intensity * 7;
    const sixteenth = 60 / bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this.#playStep(this.step, this.nextTime, sixteenth);
      this.nextTime += sixteenth;
      this.step++;
    }
  }

  #playStep(step, t, dur) {
    const L = this.intensity;
    const bar = Math.floor(step / 16);
    const [root, kind] = CHORDS[Math.floor(bar / 2) % CHORDS.length];
    const s = step % 16;
    // Pad: sustained chord, re-voiced every two bars.
    if (step % 32 === 0) {
      const third = kind === "m" ? 3 : 4;
      for (const n of [root + 12, root + 12 + third, root + 19, root + 24]) this.#pad(midi(n), t, dur * 32, 0.05);
    }
    // Pulse bass: steady eighths, the heartbeat of the heist.
    if (s % 2 === 0) this.#bass(midi(root - 12), t, dur * 1.6, s % 8 === 0 ? 0.32 : 0.2);
    // Ticking clock from chamber 2.
    if (L >= 1 && s % 4 === 2) this.#tick(t, 0.05 + L * 0.008, 7000);
    // Low drum from chamber 3.
    if (L >= 2 && (s === 0 || s === 10)) this.#drum(t, 0.5);
    // Tension arpeggio from chamber 4.
    if (L >= 3 && s % 2 === 1) {
      const third = kind === "m" ? 3 : 4;
      const pat = [0, third, 7, 12, 7, third, 12, 15];
      this.#pluck(midi(root + 24 + pat[(s >> 1) % 8]), t, dur * 1.5, 0.045 + (L - 3) * 0.01);
    }
    // Final lock: a high string ostinato.
    if (L >= 5 && s % 8 === 0) this.#pad(midi(root + 31), t, dur * 7, 0.03);
  }

  #out(node, gainVal, t, dur, bus = this.musicBus, attack = 0.005) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainVal, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g).connect(bus);
    return g;
  }

  #pad(freq, t, dur, vol) {
    const ctx = this.ctx;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 700 + this.intensity * 180; f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(1.2, dur * 0.3));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    f.connect(g).connect(this.musicBus);
    for (const det of [-7, 6]) {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + dur + 0.05);
    }
  }

  #bass(freq, t, dur, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 420;
    o.connect(f);
    this.#out(f, vol, t, dur);
    o.start(t); o.stop(t + dur + 0.02);
  }

  #pluck(freq, t, dur, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = freq;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(400, t + dur);
    o.connect(f);
    this.#out(f, vol, t, dur);
    o.start(t); o.stop(t + dur + 0.02);
  }

  #tick(t, vol, freq, bus = this.musicBus) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = freq;
    src.connect(f);
    this.#out(f, vol, t, 0.04, bus, 0.001);
    src.start(t, Math.random()); src.stop(t + 0.06);
  }

  #drum(t, vol, bus = this.musicBus) {
    const o = this.ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    this.#out(o, vol, t, 0.4, bus, 0.002);
    o.start(t); o.stop(t + 0.45);
  }

  #tone(freq, t, dur, vol, type = "sine", bus = this.sfxBus, attack = 0.005) {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    this.#out(o, vol, t, dur, bus, attack);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  #noiseBurst(t, dur, vol, type, freq, q = 1) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    src.connect(f);
    this.#out(f, vol, t, dur, this.sfxBus, 0.002);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
    return f;
  }

  // ---------- effects ----------
  play(name) {
    if (!this.ctx || this.muted) return;
    if (this.buffers[name]) {
      const src = this.ctx.createBufferSource(); src.buffer = this.buffers[name];
      src.connect(this.sfxBus); src.start();
      return;
    }
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case "tap": this.#tone(1400, t, 0.05, 0.08, "triangle"); break;
      case "type": this.#tick(t, 0.04, 5000, this.sfxBus); break;
      case "checking":
        for (let i = 0; i < 6; i++) this.#tone(i % 2 ? 1320 : 990, t + i * 0.18, 0.07, 0.07, "square");
        break;
      case "granted": {
        // Lock latch: a crisp click, a heavy thunk, then a bright two-note chime.
        this.#noiseBurst(t, 0.05, 0.5, "bandpass", 2600, 4);
        this.#drum(t + 0.03, 0.55, this.sfxBus);
        this.#noiseBurst(t + 0.12, 0.04, 0.35, "bandpass", 3600, 6);
        this.#tone(midi(74), t + 0.2, 0.9, 0.16, "triangle");
        this.#tone(midi(81), t + 0.32, 1.1, 0.14, "triangle");
        this.#tone(midi(86), t + 0.32, 1.1, 0.05, "sine");
        break;
      }
      case "denied": {
        for (let i = 0; i < 3; i++) {
          this.#tone(i % 2 ? 311 : 415, t + i * 0.22, 0.2, 0.12, "sawtooth");
        }
        this.#drum(t, 0.6, this.sfxBus);
        break;
      }
      case "shield": this.#noiseBurst(t, 0.35, 0.4, "lowpass", 500); this.#tone(90, t, 0.35, 0.3, "square"); break;
      case "gadget": {
        const o = this.#tone(600, t, 0.25, 0.1, "sine");
        o.frequency.exponentialRampToValueAtTime(1800, t + 0.2);
        this.#tone(2400, t + 0.22, 0.12, 0.06, "triangle");
        break;
      }
      case "retry": this.#tone(660, t, 0.12, 0.08, "triangle"); this.#tone(660, t + 0.15, 0.12, 0.08, "triangle"); break;
      case "reveal": this.#noiseBurst(t, 0.12, 0.08, "bandpass", 1800, 2); break;
      case "flicker": this.#noiseBurst(t, 0.06, 0.12, "highpass", 3000); this.#tone(220, t, 0.06, 0.05, "square"); break;
      case "lockon": this.#tone(880, t, 0.08, 0.1, "square"); this.#tone(1760, t + 0.09, 0.2, 0.08, "triangle"); break;
      case "alarm": {
        for (let i = 0; i < 4; i++) {
          const o = this.#tone(500, t + i * 0.45, 0.42, 0.1, "sawtooth");
          o.frequency.setValueAtTime(500, t + i * 0.45);
          o.frequency.linearRampToValueAtTime(900, t + i * 0.45 + 0.4);
        }
        break;
      }
      case "chamber": {
        this.#drum(t, 0.7, this.sfxBus);
        for (const [n, d] of [[62, 0], [69, 0.12], [74, 0.24], [78, 0.36]]) this.#tone(midi(n), t + d, 1.4, 0.07, "triangle");
        break;
      }
      case "wager": this.#tone(midi(50), t, 1.5, 0.15, "sawtooth"); this.#tone(midi(51), t, 1.5, 0.08, "sawtooth"); break;
      case "coins": for (let i = 0; i < 8; i++) this.#tone(2000 + Math.random() * 2500, t + i * 0.06, 0.12, 0.04, "triangle"); break;
      case "vault": {
        // Wheel spin, bolts retracting, the door's groan, and a big swell.
        for (let i = 0; i < 6; i++) this.#noiseBurst(t + 0.9 + i * 0.09, 0.06, 0.4, "bandpass", 1800 + i * 200, 5);
        const rumble = this.#noiseBurst(t + 1.4, 3.2, 0.5, "lowpass", 160);
        rumble.frequency.linearRampToValueAtTime(90, t + 4.4);
        for (const n of [38, 50, 57, 62, 66, 69, 74]) this.#tone(midi(n), t + 2.2, 4.5, 0.06, "sawtooth", this.sfxBus, 1.8);
        for (const n of [81, 86]) this.#tone(midi(n), t + 3.4, 3.5, 0.05, "triangle", this.sfxBus, 0.4);
        break;
      }
      case "caught": {
        this.#drum(t, 0.9, this.sfxBus);
        for (let i = 0; i < 6; i++) this.#noiseBurst(t + 0.05 + i * 0.08, 0.15, 0.3, "lowpass", 800);
        for (let i = 0; i < 4; i++) { const o = this.#tone(700, t + 0.5 + i * 0.5, 0.45, 0.09, "square"); o.frequency.linearRampToValueAtTime(450, t + 0.9 + i * 0.5); }
        break;
      }
    }
  }
}

export const audio = new AudioEngine();
