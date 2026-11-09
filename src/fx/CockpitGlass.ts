// ─── Cockpit Glass: snowflakes that land on the canopy and melt ─────────────
// Pure DOM/CSS (see styles.css): each flake lands, sits a moment, then runs
// down the glass as a droplet. Shown only while it snows.

const FLAKES = 16;

export class CockpitGlass {
  private root: HTMLElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'glass';
    for (let i = 0; i < FLAKES; i++) {
      const f = document.createElement('i');
      // Keep the centre of the canopy clearer than the edges.
      const edge = Math.random() < 0.7;
      const x = edge ? (Math.random() < 0.5 ? Math.random() * 30 : 70 + Math.random() * 30) : 30 + Math.random() * 40;
      f.style.setProperty('--x', `${x.toFixed(1)}%`);
      f.style.setProperty('--y', `${(6 + Math.random() * 70).toFixed(1)}%`);
      f.style.setProperty('--s', `${(10 + Math.random() * 18).toFixed(0)}px`);
      f.style.setProperty('--d', `${(Math.random() * 7).toFixed(2)}s`);
      f.style.setProperty('--t', `${(5 + Math.random() * 4).toFixed(2)}s`);
      this.root.appendChild(f);
    }
    document.getElementById('game-container')?.appendChild(this.root);
  }

  setSnowing(on: boolean): void {
    this.root.classList.toggle('snowing', on);
  }

  dispose(): void {
    this.root.remove();
  }
}
