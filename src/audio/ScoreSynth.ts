// ─── Score Synth: the film's two original cues, synthesised live ────────────
//
//   guardian — slow D-minor lament (pad + low drone + sparse bells) for the
//              Guardian's pain and the final choice
//   epilogue — warm D-major theme with a rising arpeggio for the flight home
//
// Bars are scheduled a little ahead of the audio clock from a light timer, so
// timing is sample-accurate and the cue can be faded or paused at any moment.

export type Cue = 'guardian' | 'epilogue';

interface Bus { ctx: AudioContext; out: AudioNode }

interface CueDef {
  bpm: number;
  /** One chord per bar, as semitone offsets from D2 (root first). */
  chords: number[][];
  scale: number[];
  arpeggio: boolean;
  padCutoff: number;
  level: number;
}

const D2 = 73.42;
const hz = (semi: number) => D2 * Math.pow(2, semi / 12);

const CUES: Record<Cue, CueDef> = {
  guardian: {
    bpm: 54,
    chords: [[0, 3, 7], [-4, 0, 3], [-7, -4, 0], [-5, -1, 2]],          // Dm · B♭ · Gm · A
    scale: [0, 2, 3, 5, 7, 8, 10],
    arpeggio: false, padCutoff: 700, level: 0.5,
  },
  epilogue: {
    bpm: 72,
    chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]],          // D · A · Bm · G
    scale: [0, 2, 4, 7, 9],
    arpeggio: true, padCutoff: 1500, level: 0.55,
  },
};

export class ScoreSynth {
  private master: GainNode | null = null;
  private cue: CueDef | null = null;
  private timer: number | null = null;
  private nextBar = 0;
  private bar = 0;
  private note = 0;
  private paused = false;

  constructor(private bus: () => Bus | null) {}

  get playing(): boolean { return this.cue !== null; }

  play(cue: Cue, fadeIn = 3): void {
    const bus = this.bus();
    if (!bus) return;
    this.stop(0.6);
    const { ctx, out } = bus;
    this.cue = CUES[cue];
    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(this.cue.level, ctx.currentTime + fadeIn);
    this.master.connect(out);
    this.nextBar = ctx.currentTime + 0.1;
    this.bar = 0;
    this.paused = false;
    this.timer = window.setInterval(() => this.schedule(), 120);
    this.schedule();
  }

  stop(fade = 2.5): void {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
    const m = this.master;
    const bus = this.bus();
    if (m && bus) {
      const t = bus.ctx.currentTime;
      m.gain.cancelScheduledValues(t);
      m.gain.setValueAtTime(Math.max(0.0001, m.gain.value), t);
      m.gain.exponentialRampToValueAtTime(0.0001, t + fade);
      window.setTimeout(() => m.disconnect(), (fade + 0.2) * 1000);
    }
    this.master = null;
    this.cue = null;
  }

  /** Game paused: hold the cue silently (bars already playing ring out). */
  setPaused(paused: boolean): void {
    this.paused = paused;
    const bus = this.bus();
    if (!paused && bus) this.nextBar = Math.max(this.nextBar, bus.ctx.currentTime + 0.1);
  }

  private schedule(): void {
    const bus = this.bus();
    const cue = this.cue, master = this.master;
    if (!bus || !cue || !master || this.paused) return;
    const { ctx } = bus;
    const beat = 60 / cue.bpm;
    while (this.nextBar < ctx.currentTime + 0.5) {
      this.playBar(ctx, master, cue, this.nextBar, beat);
      this.nextBar += beat * 4;
      this.bar++;
    }
  }

  private playBar(ctx: AudioContext, out: AudioNode, cue: CueDef, t: number, beat: number): void {
    const chord = cue.chords[this.bar % cue.chords.length];
    const len = beat * 4;

    // Pad: detuned saws through a slow-opening low-pass.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cue.padCutoff * 0.5, t);
    filter.frequency.linearRampToValueAtTime(cue.padCutoff, t + len * 0.5);
    filter.frequency.linearRampToValueAtTime(cue.padCutoff * 0.5, t + len);
    const pad = ctx.createGain();
    pad.gain.setValueAtTime(0.0001, t);
    pad.gain.linearRampToValueAtTime(0.11, t + len * 0.35);
    pad.gain.linearRampToValueAtTime(0.0001, t + len * 1.15);
    filter.connect(pad);
    pad.connect(out);
    for (const semi of chord) {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = hz(semi + 12);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + len * 1.2);
      }
    }

    // Drone / bass on the chord root.
    this.tone(ctx, out, hz(chord[0]), t, len * 1.05, 0.2, 'sine', 0.4);

    // Melody: bells walking the scale (guardian) or a rising arpeggio (epilogue).
    if (cue.arpeggio) {
      for (let i = 0; i < 8; i++) {
        const semi = chord[i % 3] + 24 + (i >= 6 ? 12 : 0);
        this.tone(ctx, out, hz(semi), t + i * beat * 0.5, beat * 1.4, 0.07, 'triangle', 0.01);
      }
      if (this.bar % 2 === 1) this.bell(ctx, out, cue, chord, t + beat * 2, beat * 3);
    } else {
      this.bell(ctx, out, cue, chord, t + beat * (this.bar % 2 ? 1 : 0), beat * 3.5);
      if (this.bar % 4 === 3) this.bell(ctx, out, cue, chord, t + beat * 2.5, beat * 3);
    }
  }

  private bell(ctx: AudioContext, out: AudioNode, cue: CueDef, chord: number[], t: number, len: number): void {
    // A slow random walk, pulled back toward the chord so it never sours.
    this.note = (this.note + (Math.random() < 0.5 ? 1 : cue.scale.length - 1)) % cue.scale.length;
    const semi = Math.random() < 0.45 ? chord[1 + Math.floor(Math.random() * 2)] + 36 : cue.scale[this.note] + 36;
    this.tone(ctx, out, hz(semi), t, len, 0.09, 'sine', 0.01);
    this.tone(ctx, out, hz(semi) * 2.01, t, len * 0.5, 0.025, 'sine', 0.005);
  }

  private tone(ctx: AudioContext, out: AudioNode, f: number, t: number, len: number, level: number, type: OscillatorType, attack: number): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + Math.max(0.005, attack));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + len + 0.05);
  }

  dispose(): void { this.stop(0.1); }
}
