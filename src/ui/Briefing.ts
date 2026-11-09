// ─── Briefing: the mission order shown before the first stage ───────────────
// This is the premise exactly as the player is meant to believe it.

import { BRIEFING } from '../story/StoryData';

export class Briefing {
  private element = document.getElementById('briefing-screen') as HTMLElement;
  private button = document.getElementById('briefing-button') as HTMLElement;
  private shownAt = 0;
  private onClick = () => this.finish();
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.element.classList.contains('hidden')) return;
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); this.finish(); }
  };

  constructor(private onDone: () => void) {
    this.button.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
  }

  get visible(): boolean { return !this.element.classList.contains('hidden'); }

  show(): void {
    const lines = document.getElementById('briefing-lines') as HTMLElement;
    lines.replaceChildren(...BRIEFING.map((text, i) => {
      const p = document.createElement('p');
      p.textContent = text;
      if (i === 0) p.className = 'briefing-head';
      p.style.animationDelay = `${0.2 + i * 0.9}s`;
      return p;
    }));
    this.element.classList.remove('hidden');
    this.shownAt = performance.now();
  }

  hide(): void {
    this.element.classList.add('hidden');
  }

  // The key press that opened the briefing must not also close it.
  private finish(): void {
    if (performance.now() - this.shownAt < 450) return;
    this.hide();
    this.onDone();
  }

  dispose(): void {
    this.button.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
