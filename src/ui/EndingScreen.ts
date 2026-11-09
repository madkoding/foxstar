// ─── Ending Screen: the two closings of the story ───────────────────────────
//   bad  — «La Cosecha»: grey, cold, credits in an uncomfortable silence.
//   good — «FoxStar»: the sacrifice; warm, over the living epilogue scene.

import { CREDITS } from '../story/StoryData';
import { submitScore } from './bestScore';
import { countUp } from './countUp';

export type EndingKind = 'good' | 'bad';

const KEY = 'foxstar.ending';

/** Last ending the player reached on this browser (null = none yet). */
export function getEnding(): EndingKind | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'good' || v === 'bad' ? v : null;
  } catch {
    return null;
  }
}

export class EndingScreen {
  private element = document.getElementById('ending-screen') as HTMLElement;
  private button = document.getElementById('ending-button') as HTMLElement;
  private shownAt = 0;
  private onClick = () => this.dismiss();
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.element.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); this.dismiss(); }
  };

  constructor(private onContinue: () => void) {
    this.button.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
  }

  // A held fire key from the final choice must not skip the credits.
  private dismiss(): void {
    if (performance.now() - this.shownAt < 2500) return;
    this.onContinue();
  }

  show(kind: EndingKind, score: number): void {
    const c = CREDITS[kind];
    (document.getElementById('ending-kicker') as HTMLElement).textContent = c.kicker;
    (document.getElementById('ending-title') as HTMLElement).textContent = c.title;
    const lines = document.getElementById('ending-lines') as HTMLElement;
    lines.replaceChildren(...c.lines.map((text, i) => {
      const p = document.createElement('p');
      p.textContent = text;
      p.style.animationDelay = `${1.2 + i * 1.6}s`;
      return p;
    }));
    countUp(document.getElementById('ending-score') as HTMLElement, score, 2000, 'Puntuación: ');
    submitScore(score);
    try { localStorage.setItem(KEY, kind); } catch { /* storage blocked: not remembered */ }
    this.element.classList.remove('ending-good', 'ending-bad');
    this.element.classList.add(`ending-${kind}`);
    this.element.classList.remove('hidden');
    this.shownAt = performance.now();
  }

  hide(): void {
    this.element.classList.add('hidden');
  }

  dispose(): void {
    this.button.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
