// ─── Music Player: plays the background soundtrack on loop ──────────────────

export class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private _playing = false;

  play(): void {
    if (this._playing) return;
    this._playing = true;
    this.audio = new Audio('./Starfall Vanguard2.mp3');
    this.audio.volume = 0.75;
    this.audio.loop = true;
    this.audio.play().catch(() => {
      // Autoplay may be blocked until user interacts
    });
  }

  pause(): void {
    if (!this.audio || this.audio.paused) return;
    this.audio.pause();
  }

  resume(): void {
    if (!this.audio || !this.audio.paused) return;
    this.audio.play().catch(() => {});
  }

  /**
   * Bend the track: rate < 1 drags it down in pitch and tempo (the Guardian's
   * pain), volume ducks it under the scene.
   */
  setMood(rate: number, volume = 0.75): void {
    if (!this.audio) return;
    (this.audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = false;
    this.audio.playbackRate = rate;
    this.audio.volume = volume;
  }

  stop(): void {
    this._playing = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  dispose(): void {
    this.stop();
    this.audio = null;
  }
}