// ─── Menu Screen ────────────────────────────────────────────────────────────
// Title letters are split into spans so CSS can stagger a drop-in + shine
// sweep. The live 3D scene (ship orbit) shows through the translucent panel.

import { getBestScore } from './bestScore';
import { getEnding } from './EndingScreen';
import { getSavedStage } from './progress';
import { LEVELS } from '../levels/LevelData';

export class MenuScreen {
  private element: HTMLElement;
  private startButton: HTMLElement;
  private bestEl: HTMLElement | null;
  private onKeyDown: (e: KeyboardEvent) => void;
  private onClick: () => void;

  private continueButton = document.getElementById('continue-stage-button') as HTMLElement;
  private onContinueClick = () => { const s = getSavedStage(); if (s > 0) this.onContinue(s); };

  /** `onStart` begins a new campaign; `onContinue` resumes at a saved stage. */
  constructor(private onStart: () => void, private onContinue: (stage: number) => void) {
    this.element = document.getElementById('menu-screen') as HTMLElement;
    this.startButton = document.getElementById('start-button') as HTMLElement;
    this.bestEl = document.getElementById('menu-best');

    const title = this.element.querySelector('.game-title') as HTMLElement | null;
    if (title && !title.dataset.split) {
      const text = title.textContent ?? '';
      title.dataset.split = '1';
      title.setAttribute('aria-label', text);
      title.innerHTML = [...text].map((ch, i) =>
        `<span class="title-ch" style="--i:${i}">${ch}</span>`).join('');
    }

    this.onClick = () => this.onStart();
    this.startButton.addEventListener('click', this.onClick);
    this.continueButton.addEventListener('click', this.onContinueClick);
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!this.element.classList.contains('hidden')) {
          e.preventDefault();
          // With a campaign in progress, ENTER resumes it.
          const saved = getSavedStage();
          if (saved > 0) this.onContinue(saved); else this.onStart();
        }
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  show(): void {
    const best = getBestScore();
    if (this.bestEl) this.bestEl.textContent = best > 0 ? `RÉCORD ${best.toLocaleString()}` : '';
    // The tagline is the lie — until the player has seen through it.
    const saved = getSavedStage();
    this.continueButton.classList.toggle('hidden', saved === 0);
    this.continueButton.textContent = saved > 0 ? `CONTINUAR · ETAPA ${saved + 1}` : '';
    this.continueButton.title = saved > 0 ? LEVELS[saved].name : '';
    this.startButton.textContent = saved > 0 ? 'NUEVA MISIÓN' : 'INICIAR MISIÓN';
    this.startButton.classList.toggle('primary', saved === 0);
    const sub = document.getElementById('menu-sub');
    const ending = getEnding();
    if (sub) {
      sub.textContent = ending === 'good' ? 'El planeta respira. Vuela con él.'
        : ending === 'bad' ? 'Cosecha completada. ¿Estás seguro?'
        : 'Purga la corrupción. Restaura el orden.';
    }
    this.element.classList.remove('hidden');
  }

  hide(): void {
    this.element.classList.add('hidden');
  }

  dispose(): void {
    this.startButton.removeEventListener('click', this.onClick);
    this.continueButton.removeEventListener('click', this.onContinueClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
