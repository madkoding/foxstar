// ─── Voice Synth: Lyra speaks ───────────────────────────────────────────────
//
// Uses the browser's own speech synthesis with a Spanish voice. Her delivery
// follows the story: warm and unhurried, then clipped and urgent, then slow,
// low and metallic once the mask is off. If the browser has no Spanish voice
// (or `?voice=0` is set) the game falls back to the typewriter blips.

import type { LyraMood } from '../story/StoryData';

const DELIVERY: Record<LyraMood, { rate: number; pitch: number }> = {
  warm:   { rate: 1.02, pitch: 1.15 },
  tense:  { rate: 1.08, pitch: 1.08 },
  urgent: { rate: 1.28, pitch: 1.2 },
  cold:   { rate: 0.9,  pitch: 0.45 },
};

export class VoiceSynth {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private enabled: boolean;
  muted = false;

  constructor() {
    this.enabled = new URLSearchParams(window.location.search).get('voice') !== '0';
    if (!this.enabled || typeof window.speechSynthesis === 'undefined') return;
    this.synth = window.speechSynthesis;
    this.pickVoice();
    // Voices load asynchronously in most browsers.
    this.synth.addEventListener?.('voiceschanged', () => this.pickVoice());
  }

  private pickVoice(): void {
    const voices = this.synth?.getVoices() ?? [];
    const spanish = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    const female = /(female|mujer|helena|laura|elvira|sabina|paulina|monica|mónica|marisol|paloma|lucia|lucía|dalia|elena)/i;
    this.voice = spanish.find(v => female.test(v.name)) ?? spanish[0] ?? null;
  }

  /** True when Lyra's lines will actually be spoken aloud. */
  get available(): boolean { return this.enabled && this.synth !== null && this.voice !== null; }

  speak(text: string, mood: LyraMood): void {
    if (!this.available || this.muted) return;
    // Corrupted lines (static, leetspeak) are noise, not speech.
    if (/[0-9#]/.test(text)) return;
    const clean = text.replace(/[…—«»]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = this.voice;
    u.lang = this.voice!.lang;
    u.rate = DELIVERY[mood].rate;
    u.pitch = DELIVERY[mood].pitch;
    u.volume = 0.95;
    this.synth!.cancel();
    this.synth!.speak(u);
  }

  cancel(): void { this.synth?.cancel(); }
  pause(): void { this.synth?.pause(); }
  resume(): void { this.synth?.resume(); }
}
