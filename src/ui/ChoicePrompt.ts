// ─── Choice Prompt: the final decision ──────────────────────────────────────
// Lyra's order is offered first and alone. The other option only surfaces a
// few seconds later, glitching in from the unfiltered sensor feed.

export class ChoicePrompt {
  private element = document.getElementById('choice') as HTMLElement;
  private defyText = document.getElementById('choice-defy-text') as HTMLElement;

  show(bombs: number): void {
    this.defyText.textContent = bombs > 0
      ? `Girar la nave y lanzar ${bombs === 1 ? 'tu última bomba' : `tus ${bombs} bombas`} contra tu propio Dispositivo de Resonancia`
      : 'Girar la nave y sobrecargar los motores contra tu propio Dispositivo de Resonancia';
    this.element.classList.remove('hidden', 'alt');
  }

  /** Let the second option through. */
  revealAlternative(): void {
    this.element.classList.add('alt');
  }

  hide(): void {
    this.element.classList.add('hidden');
    this.element.classList.remove('alt');
  }
}
