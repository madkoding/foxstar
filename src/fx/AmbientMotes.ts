// ─── Ambient Motes: particles hanging in the air around the camera ──────────
//
//   snow   — flakes driven sideways by the crosswind (Cumbres de la Bruma)
//   spores — slow glowing seeds (Bosque de Esporas)
//   embers — sparks rising off the magma (Río de Lava)
//   light  — drifting motes of liquid light (Corazón del Leviatán)
//
// One Points cloud in a box that follows the camera; particles that leave the
// box wrap to the opposite face, so the air is always full at a fixed cost.

import * as THREE from 'three';
import type { MoteKind } from '../levels/LevelData';
import { getSoftParticleTexture } from './softTexture';

const COUNT = 520;
const BOX = new THREE.Vector3(110, 60, 170);   // full extents (x, y, z)

interface Look {
  color: number; size: number; opacity: number; additive: boolean;
  vel: [number, number, number]; wobble: number; windGain: number;
}

const LOOKS: Record<MoteKind, Look> = {
  snow:   { color: 0xffffff, size: 0.55, opacity: 0.9,  additive: false, vel: [0, -7, 0],   wobble: 1.2, windGain: 26 },
  spores: { color: 0xb8ff9a, size: 0.7,  opacity: 0.75, additive: true,  vel: [0, 0.8, 0],  wobble: 2.0, windGain: 0 },
  embers: { color: 0xff8a3a, size: 0.6,  opacity: 0.9,  additive: true,  vel: [0, 6, 0],    wobble: 2.6, windGain: 0 },
  light:  { color: 0xb0e8ff, size: 0.8,  opacity: 0.7,  additive: true,  vel: [0, 1.4, 0],  wobble: 1.6, windGain: 0 },
};

export class AmbientMotes {
  private points: THREE.Points;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private seeds: Float32Array;
  private look: Look | null = null;
  private time = 0;
  private seeded = false;

  constructor(private scene: THREE.Scene) {
    this.positions = new Float32Array(COUNT * 3);
    this.seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) this.seeds[i] = Math.random() * 100;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      map: getSoftParticleTexture(), size: 0.6, sizeAttenuation: true,
      transparent: true, depthWrite: false, fog: false,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }

  apply(kind: MoteKind | undefined): void {
    this.look = kind ? LOOKS[kind] : null;
    this.points.visible = this.look !== null;
    this.seeded = false;
    if (!this.look) return;
    const l = this.look;
    this.material.color.setHex(l.color);
    this.material.size = l.size;
    this.material.opacity = l.opacity;
    this.material.blending = l.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.material.needsUpdate = true;
  }

  /** `wind` = current lateral gust (−1..1); only snow reacts to it. */
  update(dt: number, cam: THREE.Vector3, wind = 0): void {
    const l = this.look;
    if (!l) return;
    this.time += dt;
    const p = this.positions;
    if (!this.seeded) {
      for (let i = 0; i < COUNT; i++) {
        p[i * 3] = cam.x + (Math.random() - 0.5) * BOX.x;
        p[i * 3 + 1] = cam.y + (Math.random() - 0.5) * BOX.y;
        p[i * 3 + 2] = cam.z - Math.random() * BOX.z;
      }
      this.seeded = true;
    }
    const vx = l.vel[0] + wind * l.windGain, vy = l.vel[1];
    const hx = BOX.x / 2, hy = BOX.y / 2;
    for (let i = 0; i < COUNT; i++) {
      const s = this.seeds[i];
      const j = i * 3;
      p[j] += (vx + Math.sin(this.time * 0.9 + s) * l.wobble) * dt;
      p[j + 1] += (vy + Math.cos(this.time * 0.7 + s * 1.7) * l.wobble * 0.6) * dt;
      // Wrap into the camera-centred box (z runs from just behind to far ahead).
      let rx = p[j] - cam.x, ry = p[j + 1] - cam.y, rz = p[j + 2] - cam.z;
      if (rx > hx) rx -= BOX.x; else if (rx < -hx) rx += BOX.x;
      if (ry > hy) ry -= BOX.y; else if (ry < -hy) ry += BOX.y;
      if (rz > 10) rz -= BOX.z; else if (rz < 10 - BOX.z) rz += BOX.z;
      p[j] = cam.x + rx; p[j + 1] = cam.y + ry; p[j + 2] = cam.z + rz;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose(): void {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
