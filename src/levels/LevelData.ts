// ─── Level Definitions: the 8 stages of «El Eco del Leviatán» ───────────────
// Each stage owns its environment, rail, obstacles, waves and the gameplay
// mechanic that carries its story beat (see src/story/StoryData.ts for the
// script). All rails are ~1200 units so every stage lasts about the same.

import type { EnemyType, PatternType, WaveDefinition } from '../waves/WaveDefinition';

export type TerrainType = 'space' | 'atmosphere' | 'cave' | 'nebula' | 'storm' | 'ice' | 'lava' | 'city' | 'void' | 'aurora' | 'forest' | 'core';

export interface LevelEnvironment {
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  starfield: { count: number; depth: number; speed: number } | null;
  nebulae: { colors: number[]; count: number } | null;
  terrain: TerrainType;
  ambientLight: number;
  backgroundShips: boolean;
}

export interface LevelObstacleConfig {
  spawnInterval: number; // base seconds between obstacles (lower = denser)
  minRadius: number;
  maxRadius: number;
}

export interface LevelRailConfig {
  amplitudeX: number;
  amplitudeY: number;
  frequencyX: number;
  frequencyY: number;
  length: number;
}

export type MoteKind = 'snow' | 'spores' | 'embers' | 'light';

/** Stage-specific rules. Every field is optional: absent = mechanic off. */
export interface StageMechanics {
  /** Rail speed multiplier (lava river runs hot). */
  speed?: number;
  /** Crosswind gust strength pushing the ship off its line. */
  wind?: number;
  /** Heat-haze screen distortion, 0..1. */
  heat?: number;
  /** Particles hanging in the air around the camera. */
  motes?: MoteKind;
  /** Player lasers ricochet off the tunnel walls at this radius. */
  laserBounce?: number;
  /** 0..1 share of enemy bolts aimed at the player's shots, not the ship. */
  intercept?: number;
  /** Enemies abandon their manoeuvre and throw themselves at the ship. */
  kamikaze?: boolean;
  /** The world throbs to a heartbeat (bloom + FOV). */
  pulse?: boolean;
}

export interface LevelDefinition {
  id: number;
  name: string;
  environment: LevelEnvironment;
  rail: LevelRailConfig;
  obstacles: LevelObstacleConfig;
  waves: WaveDefinition[];
  hasBoss: boolean;
  mechanics: StageMechanics;
  /** Colour enemies dissolve into when they fall. */
  dissolve: number;
}

// ── Helper: build a wave entry ──
function W(type: EnemyType, count: number, pattern: PatternType, bonus = 0) {
  return { entries: [{ enemyType: type, count, pattern }], bonusScore: bonus };
}
function MW(...entries: { enemyType: EnemyType; count: number; pattern: PatternType }[]) {
  const bonus = entries.reduce((s, e) => s + e.count * 100, 0);
  return { entries, bonusScore: bonus };
}

// ── The 8 stages ──
export const LEVELS: LevelDefinition[] = [
  // 1 · Tutorial / illusion — gentle flight over the water.
  {
    id: 1, name: 'El Valle de los Susurros',
    environment: { skyColor: 0x8ec8f0, fogColor: 0x9cc4e4, fogDensity: 0.001, starfield: null, nebulae: null, terrain: 'atmosphere', ambientLight: 0.3, backgroundShips: false },
    rail: { amplitudeX: 7, amplitudeY: 2.5, frequencyX: 1.4, frequencyY: 1.8, length: 1200 },
    obstacles: { spawnInterval: 2.4, minRadius: 0.6, maxRadius: 1.2 },
    waves: [W('DRONE', 6, 'SWEEP', 200), W('SCOUT', 3, 'SWEEP', 300), W('DRONE', 4, 'CIRCLE', 200)],
    hasBoss: false,
    mechanics: {},
    dissolve: 0xcfefff,
  },
  // 2 · Verticality — crosswinds over the snow peaks.
  {
    id: 2, name: 'Las Cumbres de la Bruma',
    environment: { skyColor: 0xbcd6ea, fogColor: 0xbcd6ea, fogDensity: 0.002, starfield: null, nebulae: null, terrain: 'ice', ambientLight: 0.3, backgroundShips: false },
    rail: { amplitudeX: 8, amplitudeY: 6.5, frequencyX: 1.6, frequencyY: 2.6, length: 1200 },
    obstacles: { spawnInterval: 1.8, minRadius: 0.6, maxRadius: 1.4 },
    waves: [W('SCOUT', 6, 'SWEEP', 300), W('DRONE', 6, 'SWEEP', 250), W('SCOUT', 5, 'ZIGZAG', 350), W('FIGHTER', 2, 'SWEEP', 500)],
    hasBoss: false,
    mechanics: { wind: 1, motes: 'snow' },
    dissolve: 0xe6f4ff,
  },
  // 3 · Density — a canyon of giant growth to thread at speed.
  {
    id: 3, name: 'El Bosque de Esporas',
    environment: { skyColor: 0x7aa88a, fogColor: 0x7aa88a, fogDensity: 0.003, starfield: null, nebulae: null, terrain: 'forest', ambientLight: 0.25, backgroundShips: false },
    rail: { amplitudeX: 10, amplitudeY: 3.5, frequencyX: 2.0, frequencyY: 2.2, length: 1200 },
    obstacles: { spawnInterval: 0.55, minRadius: 0.6, maxRadius: 1.5 },
    waves: [W('DRONE', 8, 'CIRCLE', 250), W('SCOUT', 6, 'ZIGZAG', 350), W('FIGHTER', 3, 'DIVE', 500)],
    hasBoss: false,
    mechanics: { motes: 'spores' },
    dissolve: 0xb8ffd0,
  },
  // 4 · Mystery — the first glitch.
  {
    id: 4, name: 'Las Cuevas de Cristal',
    environment: { skyColor: 0x0a1a2a, fogColor: 0x0a1a2a, fogDensity: 0.002, starfield: null, nebulae: null, terrain: 'cave', ambientLight: 0.45, backgroundShips: false },
    rail: { amplitudeX: 7, amplitudeY: 4, frequencyX: 2.5, frequencyY: 3.0, length: 1200 },
    obstacles: { spawnInterval: 0.75, minRadius: 0.5, maxRadius: 1.4 },
    waves: [W('SCOUT', 8, 'SWEEP', 350), W('INTERCEPTOR', 3, 'CIRCLE', 600), W('FIGHTER', 4, 'DIVE', 600)],
    hasBoss: false,
    mechanics: { laserBounce: 14.5 },
    dissolve: 0x9fe8ff,
  },
  // 5 · Speed and chaos — Lyra stops sounding kind.
  {
    id: 5, name: 'El Río de Lava',
    environment: { skyColor: 0x2a0a0a, fogColor: 0x5a1a08, fogDensity: 0.003, starfield: null, nebulae: null, terrain: 'lava', ambientLight: 0.2, backgroundShips: false },
    rail: { amplitudeX: 10, amplitudeY: 5, frequencyX: 1.3, frequencyY: 1.7, length: 1200 },
    obstacles: { spawnInterval: 0.8, minRadius: 0.7, maxRadius: 1.8 },
    waves: [W('FIGHTER', 5, 'DIVE_BOMB', 700), W('DRONE', 10, 'DIVE_BOMB', 350), W('INTERCEPTOR', 3, 'ZIGZAG', 600), W('FIGHTER', 4, 'DIVE_BOMB', 700)],
    hasBoss: false,
    mechanics: { speed: 1.35, heat: 1, motes: 'embers' },
    dissolve: 0xffd9a0,
  },
  // 6 · Doubt — they are not shooting at you.
  {
    id: 6, name: 'La Ciudad Viva',
    environment: { skyColor: 0x14142a, fogColor: 0x141a2c, fogDensity: 0.004, starfield: null, nebulae: null, terrain: 'city', ambientLight: 0.15, backgroundShips: false },
    rail: { amplitudeX: 11, amplitudeY: 5, frequencyX: 1.6, frequencyY: 2.2, length: 1200 },
    obstacles: { spawnInterval: 0.6, minRadius: 0.6, maxRadius: 1.8 },
    waves: [W('FIGHTER', 8, 'CIRCLE', 800), W('INTERCEPTOR', 5, 'ZIGZAG', 700), W('BOMBER', 2, 'CRUISE', 1400), W('SCOUT', 8, 'SWEEP', 400)],
    hasBoss: false,
    mechanics: { intercept: 0.65 },
    dissolve: 0xa8d8ff,
  },
  // 7 · Epic — the mask falls in deep space.
  {
    id: 7, name: 'El Cinturón de Aurora',
    environment: { skyColor: 0x0a1a2e, fogColor: 0x0a1a2e, fogDensity: 0.001, starfield: { count: 1000, depth: 500, speed: 16 }, nebulae: { colors: [0x22ff88, 0x22aaff, 0xaa44ff], count: 4 }, terrain: 'aurora', ambientLight: 0.3, backgroundShips: false },
    rail: { amplitudeX: 11, amplitudeY: 5, frequencyX: 1.4, frequencyY: 1.9, length: 1200 },
    obstacles: { spawnInterval: 0.7, minRadius: 0.5, maxRadius: 1.6 },
    waves: [W('INTERCEPTOR', 8, 'ZIGZAG', 900), W('BOMBER', 3, 'CRUISE', 1600), W('INTERCEPTOR', 6, 'DIVE', 900), W('FIGHTER', 8, 'DIVE_BOMB', 900)],
    hasBoss: false,
    mechanics: { kamikaze: true },
    dissolve: 0xa8ffd8,
  },
  // 8 · The truth — and the Guardian.
  {
    id: 8, name: 'El Corazón del Leviatán',
    environment: { skyColor: 0x1a0a3a, fogColor: 0x1a0a3a, fogDensity: 0.002, starfield: null, nebulae: null, terrain: 'core', ambientLight: 0.35, backgroundShips: false },
    rail: { amplitudeX: 13, amplitudeY: 7, frequencyX: 2.3, frequencyY: 3.1, length: 1200 },
    obstacles: { spawnInterval: 1.1, minRadius: 0.6, maxRadius: 1.6 },
    waves: [W('SCOUT', 8, 'CIRCLE', 500), W('INTERCEPTOR', 6, 'DIVE', 900), W('FIGHTER', 6, 'DIVE_BOMB', 900)],
    hasBoss: true,
    mechanics: { pulse: true, motes: 'light', kamikaze: true },
    dissolve: 0xffc8f0,
  },
];
