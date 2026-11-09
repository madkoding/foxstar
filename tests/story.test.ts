// Guards the script against the mistakes that are easy to make and hard to
// notice while playing: a stage without lines, a beat that can never fire,
// an event Lyra reacts to that the game never raises (or the reverse).

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/levels/LevelData';
import { GAME } from '../src/types/config';
import { BRIEFING, CHOICE_NAGS, CREDITS, ENDING_BAD, ENDING_GOOD_PROTEST, EPILOGUE, STAGES, type Line } from '../src/story/StoryData';
import { stageIntroShots, stageOutroShots, guardianEntranceShots, exposedShots, harvestShots, epilogueShots } from '../src/story/Cinematics';

const gameSource = readFileSync(new URL('../src/core/Game.ts', import.meta.url), 'utf8');
const allLines = (s: (typeof STAGES)[number]): Line[] =>
  [...s.intro, ...s.beats.flatMap(b => b.lines), ...Object.values(s.events).flat(), ...s.outro];

describe('campaign structure', () => {
  it('has one script per stage', () => {
    expect(STAGES).toHaveLength(LEVELS.length);
    expect(LEVELS).toHaveLength(GAME.LEVEL_COUNT);
  });

  it('numbers the stages 1..N and only the last has the Guardian', () => {
    LEVELS.forEach((l, i) => expect(l.id).toBe(i + 1));
    expect(LEVELS.filter(l => l.hasBoss).map(l => l.id)).toEqual([LEVELS.length]);
  });

  it('gives every stage waves and a name', () => {
    for (const l of LEVELS) {
      expect(l.name.length).toBeGreaterThan(3);
      expect(l.waves.length).toBeGreaterThan(0);
    }
  });
});

describe('script', () => {
  it('opens every stage with Lyra or the sensor speaking', () => {
    for (const s of STAGES) expect(s.intro.length).toBeGreaterThan(0);
  });

  it('keeps beats in order and inside the playable part of the rail', () => {
    for (const s of STAGES) {
      const at = s.beats.map(b => b.at);
      expect([...at].sort((a, b) => a - b)).toEqual(at);
      // The Guardian (or the stage end) takes over at 0.92.
      for (const a of at) { expect(a).toBeGreaterThan(0.05); expect(a).toBeLessThan(0.92); }
    }
  });

  it('has no empty or overlong lines (they must fit the comms panel)', () => {
    const lines = [...STAGES.flatMap(allLines), ...ENDING_BAD, ...ENDING_GOOD_PROTEST];
    for (const l of lines) {
      expect(l.text.trim().length).toBeGreaterThan(0);
      expect(l.text.length).toBeLessThanOrEqual(110);
    }
  });

  it('closes every stage but the last with an outro and a clear title', () => {
    STAGES.slice(0, -1).forEach(s => {
      expect(s.outro.length).toBeGreaterThan(0);
      expect(s.clearTitle.length).toBeGreaterThan(0);
    });
  });

  it('tells the lie first and the truth last', () => {
    expect(STAGES[0].mood).toBe('warm');
    expect(STAGES[STAGES.length - 1].mood).toBe('cold');
    // The raw sensor feed must stay silent in the first two stages.
    for (const s of STAGES.slice(0, 2)) expect(allLines(s).some(l => l.who === 'SENSOR')).toBe(false);
  });

  it('has text for the briefing, both endings and the epilogue', () => {
    for (const block of [BRIEFING, CHOICE_NAGS, EPILOGUE, CREDITS.good.lines, CREDITS.bad.lines]) {
      expect(block.length).toBeGreaterThan(0);
    }
  });
});

describe('script ↔ game wiring', () => {
  const scripted = new Set(STAGES.flatMap(s => Object.keys(s.events)));
  const raised = new Set<string>();
  for (const m of gameSource.matchAll(/story\.trigger\(([^)]*)\)/g)) {
    for (const lit of m[1].matchAll(/'([A-Za-z0-9]+)'/g)) raised.add(lit[1]);
  }

  it('raises every event the script reacts to', () => {
    for (const e of scripted) expect(raised, `"${e}" is scripted but never triggered`).toContain(e);
  });

  it('never raises an event no stage reacts to', () => {
    for (const e of raised) expect(scripted, `"${e}" is triggered but has no lines`).toContain(e);
  });
});

describe('cinematics', () => {
  it('has an opening sequence for every stage that ends (no held shots)', () => {
    LEVELS.forEach((_, i) => {
      const shots = stageIntroShots(i);
      expect(shots.length).toBeGreaterThan(0);
      for (const s of shots) expect(Number.isFinite(s.duration)).toBe(true);
    });
  });

  it('only holds the last shot of a sequence', () => {
    for (const seq of [stageOutroShots(), guardianEntranceShots(), exposedShots(), harvestShots(), epilogueShots()]) {
      seq.slice(0, -1).forEach(s => expect(Number.isFinite(s.duration)).toBe(true));
      for (const s of seq) expect(s.duration).toBeGreaterThan(0);
    }
  });
});
