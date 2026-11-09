// ─── Story Director: plays the script against what the player is doing ──────
//
// Knows nothing about rendering: the Game tells it which stage is running,
// how far along the rail the ship is, and which story-relevant things just
// happened; it decides what Lyra (or the raw sensor feed) says.

import { CommsPanel } from '../ui/CommsPanel';
import { STAGES, type Line, type LyraMood, type StageStory, type StoryEvent } from './StoryData';

export class StoryDirector {
  readonly comms = new CommsPanel();
  private stage: StageStory | null = null;
  private beatIndex = 0;
  private fired = new Set<StoryEvent>();
  private introPending = false;

  /** Mood changed (HUD re-skin, voice timbre). */
  onMood: ((mood: LyraMood) => void) | null = null;

  beginStage(index: number): void {
    this.stage = STAGES[index] ?? null;
    this.beatIndex = 0;
    this.fired.clear();
    this.introPending = true;
    if (this.stage) this.setMood(this.stage.mood);
  }

  get current(): StageStory | null { return this.stage; }

  setMood(mood: LyraMood): void {
    this.comms.setMood(mood);
    this.onMood?.(mood);
  }

  /** Lyra's opening lines; called once the ship is in control. */
  playIntro(): void {
    if (!this.stage || !this.introPending) return;
    this.introPending = false;
    this.comms.say(this.stage.intro, true);
  }

  playOutro(): void {
    if (this.stage) this.comms.say(this.stage.outro, true);
  }

  /** Fire a once-per-stage reaction. Returns true if it had lines to say. */
  trigger(event: StoryEvent, interrupt = false): boolean {
    if (!this.stage || this.fired.has(event)) return false;
    const lines = this.stage.events[event];
    if (!lines) return false;
    this.fired.add(event);
    this.comms.say(lines, interrupt);
    return true;
  }

  has(event: StoryEvent): boolean { return this.fired.has(event); }

  say(lines: Line[], interrupt = false): void { this.comms.say(lines, interrupt); }

  /** `active` = the player is flying (not warping, dying or in a cinematic). */
  update(dt: number, stageProgress: number, active: boolean): void {
    this.comms.update(dt);
    if (!this.stage || !active || this.introPending) return;
    const beats = this.stage.beats;
    while (this.beatIndex < beats.length && stageProgress >= beats[this.beatIndex].at) {
      this.comms.say(beats[this.beatIndex].lines);
      this.beatIndex++;
    }
  }

  reset(): void {
    this.stage = null;
    this.beatIndex = 0;
    this.fired.clear();
    this.introPending = false;
    this.comms.reset();
    this.onMood?.('warm');
  }
}
