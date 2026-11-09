// ─── Voice Synth: the film's two voices ─────────────────────────────────────
//
// Uses the browser's own speech synthesis with Spanish voices.
//   Lyra   — her delivery follows the story: warm and unhurried, then clipped
//            and urgent, then slow and low once the mask is off.
//   Sensor — a second, flatter voice for the raw readings (a different
//            installed voice when the browser has one).
// The comms panel waits for each sentence to finish, so lines never talk
// over each other. With no Spanish voice installed (or `?voice=0`) the game
// falls back to typewriter blips.

import type { LyraMood } from '../story/StoryData';

export type VoiceRole = LyraMood | 'sensor';

const DELIVERY: Record<VoiceRole, { rate: number; pitch: number; volume: number }> = {
  warm:   { rate: 1.0,  pitch: 1.1,  volume: 1 },
  tense:  { rate: 1.06, pitch: 1.05, volume: 1 },
  urgent: { rate: 1.18, pitch: 1.12, volume: 1 },
  cold:   { rate: 0.92, pitch: 0.7,  volume: 1 },
  sensor: { rate: 1.12, pitch: 0.9,  volume: 0.8 },
};

const FEMALE = /(female|mujer|helena|laura|elvira|sabina|paulina|monica|mónica|marisol|paloma|lucia|lucía|dalia|elena|ximena|paola|camila|catalina)/i;
const MALE = /(male|hombre|pablo|jorge|diego|juan|alvaro|álvaro|carlos|enrique|raul|raúl|gerardo|tomas|tomás)/i;
const NATURAL = /(natural|neural|online|premium|enhanced|google)/i;

export class VoiceSynth {
  private synth: SpeechSynthesis | null = null;
  private lyra: SpeechSynthesisVoice | null = null;
  private sensor: SpeechSynthesisVoice | null = null;
  private enabled: boolean;
  // Held so the browser can't garbage-collect an utterance mid-sentence.
  private current: SpeechSynthesisUtterance | null = null;
  private pending: number | null = null;

  constructor() {
    this.enabled = new URLSearchParams(window.location.search).get('voice') !== '0';
    if (!this.enabled || typeof window.speechSynthesis === 'undefined') return;
    this.synth = window.speechSynthesis;
    this.pickVoices();
    // Voices load asynchronously in most browsers.
    this.synth.addEventListener?.('voiceschanged', () => this.pickVoices());
  }

  private pickVoices(): void {
    const spanish = (this.synth?.getVoices() ?? []).filter(v => v.lang.toLowerCase().startsWith('es'));
    const score = (v: SpeechSynthesisVoice, want: RegExp, avoid: RegExp) =>
      (want.test(v.name) ? 4 : 0) - (avoid.test(v.name) && !want.test(v.name) ? 3 : 0) +
      (NATURAL.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
    const best = (want: RegExp, avoid: RegExp, not?: SpeechSynthesisVoice | null) =>
      spanish.filter(v => v !== not).sort((a, b) => score(b, want, avoid) - score(a, want, avoid))[0] ?? null;
    this.lyra = best(FEMALE, MALE);
    // A different voice for the sensor when there is one; otherwise Lyra's
    // voice is reused with a flatter delivery.
    this.sensor = best(MALE, FEMALE, this.lyra) ?? this.lyra;
  }

  /** True when lines will actually be spoken aloud. */
  get available(): boolean { return this.enabled && this.synth !== null && this.lyra !== null; }

  /** True while a sentence is being (or about to be) spoken. */
  get speaking(): boolean {
    return this.available && (this.pending !== null || this.current !== null);
  }

  speak(text: string, role: VoiceRole): void {
    if (!this.available) return;
    // Corrupted lines (static, leetspeak) are noise, not speech.
    if (/[0-9]\w*[a-zA-Z]|#/.test(text)) return;
    const clean = text.replace(/[…—«»]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const voice = role === 'sensor' ? this.sensor! : this.lyra!;
    const d = DELIVERY[role];
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = d.rate;
    // Same voice doing both parts: drop the sensor's pitch so it reads as other.
    u.pitch = role === 'sensor' && this.sensor === this.lyra ? 0.6 : d.pitch;
    u.volume = d.volume;
    const done = () => { if (this.current === u) this.current = null; };
    u.onend = done;
    u.onerror = done;
    // A short gap after any cancel(): speaking in the same tick gets the new
    // sentence swallowed in some browsers.
    if (this.pending !== null) clearTimeout(this.pending);
    this.pending = window.setTimeout(() => {
      this.pending = null;
      this.current = u;
      this.synth!.speak(u);
    }, 70);
  }

  cancel(): void {
    if (this.pending !== null) { clearTimeout(this.pending); this.pending = null; }
    this.current = null;
    this.synth?.cancel();
  }

  pause(): void { this.synth?.pause(); }
  resume(): void { this.synth?.resume(); }
}
