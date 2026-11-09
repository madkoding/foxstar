// ─── Comms Panel: Lyra's voice (and the raw sensor feed leaking past her) ───
//
// A lower-third dialogue box with a typewriter effect and a queue. Driven by
// the game loop (not timers) so pausing freezes it mid-word. Styling per
// speaker / mood lives in styles.css.

import type { Line, LyraMood } from '../story/StoryData';

const CHARS_PER_SEC = 46;

export class CommsPanel {
  private root: HTMLElement;
  private nameEl: HTMLElement;
  private textEl: HTMLElement;
  private queue: Line[] = [];
  private current: Line | null = null;
  private shown = 0;       // characters revealed (fractional)
  private hold = 0;        // seconds left on screen once fully typed
  private dead = false;    // Lyra has been shut down for good
  private mood: LyraMood = 'warm';

  /** Called for every few revealed characters (voice blip). */
  onBlip: ((who: Line['who']) => void) | null = null;
  /** Called when a new line starts (voice-over). */
  onLine: ((line: Line) => void) | null = null;
  /** Called when speech must stop at once (interrupt, shutdown, reset). */
  onHush: (() => void) | null = null;

  constructor() {
    let el = document.getElementById('comms');
    if (!el) {
      el = document.createElement('div');
      el.id = 'comms';
      document.getElementById('game-container')?.appendChild(el);
    }
    el.innerHTML = `
      <div class="comms-wave"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="comms-body">
        <div class="comms-name"></div>
        <div class="comms-text"></div>
      </div>`;
    this.root = el;
    this.nameEl = el.querySelector('.comms-name') as HTMLElement;
    this.textEl = el.querySelector('.comms-text') as HTMLElement;
  }

  setMood(mood: LyraMood): void {
    this.mood = mood;
    this.root.dataset.mood = mood;
  }

  /** Queue lines. `interrupt` drops whatever is being said first. */
  say(lines: Line[], interrupt = false): void {
    if (!lines.length) return;
    const usable = this.dead ? lines.filter(l => l.who !== 'LYRA') : lines;
    if (!usable.length) return;
    if (interrupt) { this.queue.length = 0; this.current = null; this.onHush?.(); }
    this.queue.push(...usable);
  }

  get busy(): boolean { return this.current !== null || this.queue.length > 0; }

  /** Lyra goes silent forever (good ending). */
  kill(): void {
    this.dead = true;
    this.queue = this.queue.filter(l => l.who !== 'LYRA');
    if (this.current?.who === 'LYRA') this.current = null;
    this.onHush?.();
    if (!this.current) this.root.classList.remove('open');
  }

  update(dt: number): void {
    if (!this.current) {
      const next = this.queue.shift();
      if (!next) { this.root.classList.remove('open'); return; }
      this.current = next;
      this.shown = 0;
      this.hold = Math.max(1.7, next.text.length * 0.05);
      this.root.dataset.who = next.who;
      this.nameEl.textContent = next.who === 'LYRA' ? 'LYRA' : 'SENSOR · SIN FILTRAR';
      this.textEl.textContent = '';
      this.root.classList.add('open');
      this.onLine?.(next);
    }
    const line = this.current;
    const total = line.text.length;
    if (this.shown < total) {
      const before = Math.floor(this.shown);
      this.shown = Math.min(total, this.shown + dt * CHARS_PER_SEC);
      const now = Math.floor(this.shown);
      if (now !== before) {
        this.textEl.textContent = line.text.slice(0, now);
        if (Math.floor(now / 3) !== Math.floor(before / 3)) this.onBlip?.(line.who);
      }
      this.root.classList.add('talking');
    } else {
      this.root.classList.remove('talking');
      this.hold -= dt;
      // Don't linger when more is waiting.
      if (this.hold <= 0 || (this.queue.length > 1 && this.hold < 1)) this.current = null;
    }
  }

  /** Clear everything (menu / restart). Brings Lyra back. */
  reset(): void {
    this.queue.length = 0;
    this.current = null;
    this.dead = false;
    this.onHush?.();
    this.root.classList.remove('open', 'talking');
    this.setMood('warm');
  }

  get currentMood(): LyraMood { return this.mood; }
}
