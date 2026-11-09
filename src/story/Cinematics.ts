// ─── Cinematics: the shot list of the film ──────────────────────────────────
//
// Every story beat is staged with real camera work — establishing shots,
// fly-bys, two-shots, close-ups — joined by hard cuts, with the frame
// letterboxed and the HUD gone. Offsets are [right, up, forward] around the
// ship (or around the Guardian when `at: 'target'`); see CameraRig.Shot.

import type { Shot } from '../camera/CameraRig';

const HOLD = Number.POSITIVE_INFINITY;

/** Opening of each stage: an establishing shot, then a closer one, then cut to the cockpit view. */
const INTROS: Shot[][] = [
  // 1 · Valley — high and wide over the water, then skimming alongside.
  [
    { duration: 3.0, from: [14, 9, 40], to: [7, 3.5, 16], fov: -6 },
    { duration: 2.4, from: [-8, 1.2, 4], to: [-6.5, 1.6, -3], lookOffset: [0, 0.2, 1] },
  ],
  // 2 · Peaks — looking down the mountain as the ship climbs into the wind.
  [
    { duration: 3.0, from: [-12, 14, 36], to: [-6, 5, 15], fov: -6, roll: 0.05 },
    { duration: 2.4, from: [5, 3, -9], to: [3.5, 2.4, -7], lookOffset: [0, 0.5, 3] },
  ],
  // 3 · Forest — low among the trunks, the ship threading toward camera.
  [
    { duration: 2.8, from: [4, 1, 34], to: [2.5, 1, 13], fov: 4 },
    { duration: 2.6, from: [-8, 2.6, -7], to: [-6.5, 2.2, -1] },
  ],
  // 4 · Caves — tight, claustrophobic, the camera hugging the hull.
  [
    { duration: 2.6, from: [2.5, 1.5, 22], to: [1.5, 1, 9] },
    { duration: 2.6, from: [0.5, 3, -9], to: [-2.5, 2, -6], lookOffset: [0, -0.3, 1], roll: -0.06 },
  ],
  // 5 · Lava — low over the magma, tracking the ship through the haze.
  [
    { duration: 2.4, from: [8, 0.5, 18], to: [5.5, 1.2, 5], fov: 6 },
    { duration: 2.6, from: [0, 7, -13], to: [0, 4, -9], lookOffset: [0, 0, 3] },
  ],
  // 6 · City — street level looking up at the towers, then down the avenue.
  [
    { duration: 3.0, from: [-7, -2, 28], to: [-4, -1, 12], lookOffset: [0, 1, 0], fov: 6 },
    { duration: 2.4, from: [0, 10, -16], to: [0, 5, -10], lookOffset: [0, 0, 4] },
  ],
  // 7 · Aurora belt — vast, slow, the ship small against the ringed giant.
  [
    { duration: 3.4, from: [-20, 8, -30], to: [-12, 4, -16], lookOffset: [2, 0, 6], fov: -10 },
    { duration: 2.2, from: [3, 0.8, 6.5], to: [2, 0.9, 5], roll: 0.1 },
  ],
  // 8 · Core — a slow push-in on the ship; nowhere left to look away.
  [
    { duration: 3.2, from: [0, 3, 30], to: [0, 1.2, 9], fov: -10 },
    { duration: 2.8, from: [-9, 5, -13], to: [-6, 3, -9], lookOffset: [0, 0.5, 4] },
  ],
];

export function stageIntroShots(stage: number): Shot[] {
  return INTROS[stage] ?? INTROS[0];
}

/** Stage clear: the ship passes a locked-off camera, then we rise behind it as it jumps. */
export function stageOutroShots(): Shot[] {
  return [
    { duration: 2.6, from: [6, 1.5, 24], fixed: true, fov: -4 },
    { duration: HOLD, from: [0, 5, -15], to: [0, 13, -30], lookOffset: [0, 0, 24] },
  ];
}

/** The Guardian arrives: seen from under the ship's wing, then face to face. */
export function guardianEntranceShots(): Shot[] {
  return [
    { duration: 2.6, from: [4, -2.5, -10], to: [3, -1.5, -8], lookMix: 0.85, fov: -4 },
    { duration: 2.6, at: 'target', from: [15, 5, -44], to: [10, 2, -34], lookMix: 1, fov: -8 },
  ];
}

/** Phase 2: a short, shaking close-up. Not rage — pain. */
export function guardianPainShots(): Shot[] {
  return [{ duration: 1.9, at: 'target', from: [-11, -1, -34], to: [-8, 0, -29], lookMix: 1, fov: -10, roll: 0.12 }];
}

/** Exposed: an over-the-shoulder two-shot (hunter and prey), then the bare heart. */
export function exposedShots(): Shot[] {
  return [
    { duration: 2.8, from: [10, 4, -15], to: [7, 3, -11], lookMix: 0.6, fov: -4 },
    { duration: 2.4, at: 'target', from: [0, -2, -32], to: [0, -1, -26], lookMix: 1, fov: -12 },
  ];
}

/** Bad ending: from behind the Guardian as the shot comes; the world drains; a cold cockpit. */
export function harvestShots(): Shot[] {
  return [
    { duration: 1.3, at: 'target', from: [13, 5, 28], to: [10, 4, 24], lookMix: 0.1 },
    { duration: 5.0, from: [0, 14, -30], to: [0, 38, -84], lookOffset: [0, 0, 26], fov: -4 },
    { duration: 5.2, from: [1.6, 1.1, 9], to: [0.4, 1.4, 13], fov: -10 },
  ];
}

/** Good ending, beat by beat (each replaces the previous shot). */
export const SACRIFICE = {
  turn: [{ duration: HOLD, from: [3, 0.6, 11], to: [1.5, 0.8, 8], fov: -8 }] as Shot[],
  bombs: [{ duration: HOLD, from: [-13, 3, 5], to: [-8, 6, -9], fov: 2 }] as Shot[],
  silence: [{ duration: HOLD, from: [2.6, 0.9, 6.5], to: [2.2, 1, 5.5], fov: -14 }] as Shot[],
  aurora: [{ duration: HOLD, from: [9, 5, -16], to: [13, 7, -22], lookMix: 0.6, fov: -4 }] as Shot[],
  expel: [{ duration: HOLD, from: [0, 3.5, -12], to: [0, 7, -22], lookOffset: [0, 0, 24] }] as Shot[],
};

/** Epilogue: four unhurried shots of the ship among its new flock. */
export function epilogueShots(): Shot[] {
  return [
    { duration: 5.4, from: [-16, 7, -30], to: [-11, 4, -18], lookOffset: [3, 1, 34], fov: -8 },
    { duration: 5.2, from: [9, 1.4, 6], to: [7.5, 2, -1], fov: -10 },
    { duration: 5.2, from: [-3, 3, 42], to: [-2, 2.5, 34], lookOffset: [0, 0, 16], fov: -10 },
    { duration: HOLD, from: [0, 7, -18], to: [0, 15, -38], lookOffset: [0, 0, 34], fov: -6 },
  ];
}

/** Reaction beats inside a stage: a breath where the film cuts away. */
export const REACTION = {
  /** Stage 4: the crystal sang. Close on the ship as the frame tears. */
  crystal: [{ duration: 1.7, from: [1.6, 0.5, 7.5], to: [1.2, 0.6, 6.5], fov: -14, roll: -0.06 }] as Shot[],
  /** Stage 6: the EMP shows the city for what it is, from above. */
  city: [{ duration: 2.0, from: [0, 15, -20], to: [0, 19, -26], lookOffset: [0, -6, 46], fov: 4 }] as Shot[],
};

export function shotsLength(shots: Shot[]): number {
  return shots.reduce((t, s) => t + (Number.isFinite(s.duration) ? s.duration : 0), 0);
}
