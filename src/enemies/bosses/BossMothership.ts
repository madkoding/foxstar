// ─── The Guardian (final boss) ───────────────────────────────────────────────
//
// Not a warship: the planet's last immune response. An organic, luminous
// being — a pulsing heart of light inside translucent petals, crowned with
// antlers of energy and trailing slow ribbons. It never tries to kill: its
// volleys are walls meant to turn the ship back, and it periodically shoves
// the intruder away with a harmless pulse.
//
// It cannot be destroyed by ordinary fire. When its strength is spent it is
// left EXPOSED and defenceless, and the game hands the decision to the
// player (see Game: the final choice).

import * as THREE from 'three';
import { BOSS } from '../../types/config';
import { GameEvent } from '../../types/events';
import { getSoftParticleTexture } from '../../fx/softTexture';
import { BossBase } from './BossBase';

const CALM = new THREE.Color(0x7fe8d8);
const PAIN = new THREE.Color(0xff5c9a);
const GOLD = new THREE.Color(0xffe2a0);
/** Health fraction at which the Guardian collapses, exposed. */
const EXPOSE_AT = 0.06;
const PULSE_EVERY = 9;

export class BossMothership extends BossBase {
  // Assigned in buildMesh(), which runs from the base constructor. With
  // useDefineForClassFields (ES2022), plain field declarations would clobber
  // them with `undefined` after super(), so declare them as ambient.
  private declare emitters: THREE.Object3D[];
  private declare core: THREE.Mesh;
  private declare coreHalo: THREE.Sprite;
  private declare petals: THREE.Mesh[];
  private declare petalMat: THREE.MeshStandardMaterial;
  private declare antlerMat: THREE.MeshStandardMaterial;
  private declare ribbons: THREE.Mesh[];
  private declare ribbonMat: THREE.MeshBasicMaterial;
  private declare aura: THREE.Mesh;
  private declare ring: THREE.Mesh;

  private attackTimer = 0;
  private attackInterval = 2.4;
  private volleyCount = 0;
  private hitFlash = 0;
  private pulseTimer = 0;
  private _exposed = false;
  private _pacified = false;
  private _pain = 0;       // 0 calm → 1 agony (drives colour + tremor)
  private _desired = new THREE.Vector3();
  private _tint = new THREE.Color();

  constructor() {
    super(BOSS.MOTHERSHIP);
  }

  protected buildMesh(): void {
    this.emitters = [];
    this.petals = [];
    this.ribbons = [];
    const R = this._size;

    // ── Heart of light ──
    this.core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(R * 0.3, 3),
      new THREE.MeshBasicMaterial({ color: 0xfff6e0, transparent: true, opacity: 0.95 }),
    );
    this.group.add(this.core);
    this.coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getSoftParticleTexture(), color: CALM.getHex(), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.coreHalo.scale.setScalar(R * 2.2);
    this.group.add(this.coreHalo);

    // ── Petals: translucent shells cupping the heart, like a closed flower ──
    this.petalMat = new THREE.MeshStandardMaterial({
      color: 0xdff8f0, emissive: CALM.getHex(), emissiveIntensity: 0.55,
      roughness: 0.35, metalness: 0, transparent: true, opacity: 0.78, side: THREE.DoubleSide,
    });
    const petalGeo = new THREE.SphereGeometry(R * 0.62, 20, 14, 0, Math.PI * 0.42, Math.PI * 0.12, Math.PI * 0.6);
    for (let i = 0; i < 7; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / 7) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, this.petalMat);
      petal.rotation.y = -Math.PI * 0.21;
      pivot.add(petal);
      this.group.add(pivot);
      this.petals.push(petal);
    }

    // ── Antlers: branching curves of light rising from the crown ──
    this.antlerMat = new THREE.MeshStandardMaterial({
      color: 0xfff4d8, emissive: GOLD.getHex(), emissiveIntensity: 1.1, roughness: 0.4,
    });
    const branch = (pts: THREE.Vector3[], r: number): THREE.Mesh => {
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, r, 6, false), this.antlerMat);
      this.group.add(m);
      return m;
    };
    for (const s of [-1, 1]) {
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x * s * R, y * R, z * R);
      branch([V(0.12, 0.3, 0), V(0.38, 0.72, 0.05), V(0.62, 1.0, -0.05), V(0.7, 1.32, 0.02)], R * 0.035);
      branch([V(0.38, 0.72, 0.05), V(0.2, 1.02, 0.12), V(0.22, 1.28, 0.1)], R * 0.026);
      branch([V(0.62, 1.0, -0.05), V(0.9, 1.08, 0.0), V(1.04, 1.26, 0.06)], R * 0.024);
      branch([V(0.3, 0.6, 0.02), V(0.6, 0.62, 0.14), V(0.82, 0.74, 0.2)], R * 0.022);
      // Light gathers at the tips: this is where its "voice" comes from.
      for (const tip of [V(0.7, 1.32, 0.02), V(0.22, 1.28, 0.1), V(1.04, 1.26, 0.06)]) {
        const e = new THREE.Sprite(new THREE.SpriteMaterial({
          map: getSoftParticleTexture(), color: GOLD.getHex(), transparent: true,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        e.position.copy(tip);
        e.scale.setScalar(R * 0.3);
        this.group.add(e);
        this.emitters.push(e);
      }
    }

    // ── Ribbons: slow trailing veils below the body ──
    this.ribbonMat = new THREE.MeshBasicMaterial({
      color: CALM.getHex(), transparent: true, opacity: 0.32, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.PlaneGeometry(R * 0.16, R * 1.9, 1, 14);
      geo.translate(0, -R * 0.95, 0);
      const ribbon = new THREE.Mesh(geo, this.ribbonMat);
      const a = (i / 6) * Math.PI * 2;
      ribbon.position.set(Math.cos(a) * R * 0.3, -R * 0.25, Math.sin(a) * R * 0.3);
      ribbon.rotation.y = -a;
      ribbon.userData.base = (geo.attributes.position.array as Float32Array).slice();
      ribbon.userData.phase = i * 1.1;
      this.group.add(ribbon);
      this.ribbons.push(ribbon);
    }

    // ── Aura: soft fresnel glow, no hard edges anywhere ──
    this.aura = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.95, 32, 20),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: CALM.clone() }, uHit: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 1 } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uHit; uniform float uTime; uniform float uAlpha;
          varying vec3 vN; varying vec3 vV;
          void main() {
            float rim = pow(1.0 - abs(dot(vN, vV)), 2.2);
            float breathe = 0.75 + 0.25 * sin(uTime * 1.6);
            gl_FragColor = vec4(uColor * (1.2 + uHit * 2.0), (rim * 0.55 * breathe + uHit * 0.2) * uAlpha);
          }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      }),
    );
    this.group.add(this.aura);

    // ── Halo ring, like a slow orbiting thought ──
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(R * 1.05, R * 0.012, 6, 64),
      new THREE.MeshBasicMaterial({ color: GOLD.getHex(), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    this.group.add(this.ring);
  }

  get exposed(): boolean { return this._exposed; }
  get pacified(): boolean { return this._pacified; }

  protected onPhaseChange(phase: number): void {
    if (phase >= 2) this.attackInterval = 1.25;
  }

  init(position: THREE.Vector3): void {
    super.init(position);
    this.attackTimer = -2.5; // grace period while it drifts in
    this.attackInterval = 2.4;
    this.volleyCount = 0;
    this.hitFlash = 0;
    this.pulseTimer = PULSE_EVERY * 0.6;
    this._exposed = false;
    this._pacified = false;
    this._pain = 0;
  }

  takeDamage(amount: number): boolean {
    if (!this._active || this._exposed || this._pacified) return false;
    this.hitFlash = 1;
    const floor = this._maxHealth * EXPOSE_AT;
    if (this._health - amount <= floor) {
      // Spent. It does not die here: it is left open and helpless.
      this._health = floor;
      this._exposed = true;
      this.eventBus.emit(GameEvent.BOSS_DAMAGED, { health: this._health, maxHealth: this._maxHealth });
      this.eventBus.emit(GameEvent.BOSS_EXPOSED, {});
      return false;
    }
    return super.takeDamage(amount);
  }

  /** Bad ending: the player obeys and fires into the open heart. */
  finalBlow(): void {
    if (!this._active) return;
    this._health = 0;
    this.eventBus.emit(GameEvent.BOSS_DAMAGED, { health: 0, maxHealth: this._maxHealth });
    this.destroy();
  }

  /** Good ending: the threat is gone; the Guardian heals and stays. */
  pacify(): void {
    this._pacified = true;
    this._exposed = false;
  }

  /**
   * @param anchor point on the rail ~45 units ahead of the ship. The Guardian
   * holds station around it so it stays on the path on winding rails.
   */
  update(dt: number, playerPos: THREE.Vector3, anchor?: THREE.Vector3): void {
    if (!this._active) return;
    super.update(dt, playerPos);
    const t = this._age;

    // Pain rises through phase 2 and peaks when exposed; fades if pacified.
    const painTarget = this._pacified ? 0 : this._exposed ? 1 : this._currentPhase >= 2 ? 0.75 : 0;
    this._pain = THREE.MathUtils.lerp(this._pain, painTarget, 1 - Math.exp(-1.5 * dt));
    const pain = this._pain;

    const a = anchor ?? this._desired.set(0, 0, playerPos.z - 45);
    // Exposed: it sinks and barely moves. In pain: it thrashes.
    const sway = this._exposed ? 0.25 : 1 + pain * 0.9;
    this._desired.set(
      a.x + Math.sin(t * 0.45 * sway) * 7 * (this._exposed ? 0.3 : 1),
      a.y + (this._exposed ? -1 : 2) + Math.sin(t * 0.7 * sway) * 3 * (this._exposed ? 0.3 : 1),
      a.z,
    );
    const k = 1 - Math.exp(-(t < 3 ? 1.6 : 2.4) * dt);
    this.group.position.lerp(this._desired, k);
    this.group.lookAt(playerPos);
    // Tremor of pain.
    if (pain > 0.05 && !this._pacified) {
      this.group.position.x += (Math.random() - 0.5) * 0.35 * pain;
      this.group.position.y += (Math.random() - 0.5) * 0.35 * pain;
    }

    // Colour: calm teal → aching magenta. Never red-and-black "evil".
    this._tint.copy(CALM).lerp(PAIN, pain);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 6);
    this.petalMat.emissive.copy(this._tint);
    this.petalMat.emissiveIntensity = 0.55 + this.hitFlash * 1.4 + pain * 0.3;
    this.ribbonMat.color.copy(this._tint);
    (this.coreHalo.material as THREE.SpriteMaterial).color.copy(this._tint).lerp(GOLD, 0.25);
    const aura = (this.aura.material as THREE.ShaderMaterial).uniforms;
    aura.uColor.value.copy(this._tint);
    aura.uHit.value = this.hitFlash;
    aura.uTime.value = t;
    // The aura (its last shield) gutters out when exposed.
    aura.uAlpha.value = THREE.MathUtils.lerp(aura.uAlpha.value, this._exposed ? 0.12 : 1, 1 - Math.exp(-2 * dt));

    // Heartbeat: slow and even when calm, fast and ragged in pain.
    const rate = 1.6 + pain * 4.5;
    const beat = Math.pow(Math.abs(Math.sin(t * rate)), 4);
    this.core.scale.setScalar(1 + beat * (0.12 + pain * 0.2));
    this.coreHalo.scale.setScalar(this._size * (2.2 + beat * 0.7 + this.hitFlash * 0.5));

    // Petals: closed around the heart; phase 2 forces them open, and when
    // exposed they hang fully apart, the heart bare.
    const open = this._pacified ? 0.15 : this._exposed ? 1.15 : this._currentPhase >= 2 ? 0.6 : 0.12;
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      const target = -Math.PI * 0.21 - open - Math.sin(t * 1.3 + i) * 0.04;
      p.rotation.y = THREE.MathUtils.lerp(p.rotation.y, target, 1 - Math.exp(-2.5 * dt));
    }

    // Ribbons ripple like kelp.
    for (const r of this.ribbons) {
      const pos = r.geometry.attributes.position;
      const base = r.userData.base as Float32Array;
      for (let i = 0; i < pos.count; i++) {
        const y = base[i * 3 + 1];
        const w = (y / (this._size * 1.9)) ;
        pos.setX(i, base[i * 3] + Math.sin(t * (1.4 + pain * 3) + y * 0.5 + r.userData.phase) * w * w * 2.2);
        pos.setZ(i, base[i * 3 + 2] + Math.cos(t * 1.1 + y * 0.4 + r.userData.phase) * w * w * 1.6);
      }
      pos.needsUpdate = true;
    }

    this.ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.35;
    this.ring.rotation.y += dt * (0.5 + pain * 2);
    for (const e of this.emitters) e.scale.setScalar(this._size * (0.26 + beat * 0.12));

    if (this._exposed || this._pacified) return;
    this.attackTimer += dt;
    // The shove: only while it still has the strength to be gentle.
    if (this._currentPhase === 1 && t > 4) {
      this.pulseTimer -= dt;
      if (this.pulseTimer <= 0) {
        this.pulseTimer = PULSE_EVERY;
        this.hitFlash = 0.6;
        this.eventBus.emit(GameEvent.BOSS_PULSE, {});
      }
    }
  }

  canAttack(): boolean {
    return this._active && !this._exposed && !this._pacified && this.attackTimer >= this.attackInterval;
  }

  resetAttackTimer(): void {
    this.attackTimer = 0;
  }

  /**
   * Phase 1 (defence): alternating fan / rotating ring — walls with wide
   * gaps, thrown to block the path rather than to hit.
   * Phase 2 (despair): both at once, denser, plus aimed bursts from the
   * antler tips. Still always dodgeable.
   */
  computeVolley(playerPos: THREE.Vector3): { position: THREE.Vector3; dir: THREE.Vector3 }[] {
    this.volleyCount++;
    const shots: { position: THREE.Vector3; dir: THREE.Vector3 }[] = [];
    const corePos = new THREE.Vector3();
    this.core.getWorldPosition(corePos);
    const toPlayer = playerPos.clone().sub(corePos).normalize();
    const right = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, toPlayer).normalize();
    const desperate = this._currentPhase >= 2;

    const fan = () => {
      const n = desperate ? 3 : 2;
      for (let i = -n; i <= n; i++) {
        // Phase 1 leaves the centre lane open: it is a wall, not a shot.
        if (!desperate && i === 0) continue;
        shots.push({ position: corePos.clone(), dir: toPlayer.clone().addScaledVector(right, i * 0.1).normalize() });
      }
    };
    const ringBurst = () => {
      const n = desperate ? 12 : 8;
      const spin = this._age * 1.3;
      for (let i = 0; i < n; i++) {
        const ang = spin + (i / n) * Math.PI * 2;
        shots.push({
          position: corePos.clone(),
          dir: toPlayer.clone().addScaledVector(right, Math.cos(ang) * 0.28).addScaledVector(up, Math.sin(ang) * 0.28).normalize(),
        });
      }
    };

    if (desperate) {
      fan();
      if (this.volleyCount % 2 === 0) ringBurst();
      const tips = this.getTurretPositions();
      const tip = tips[this.volleyCount % tips.length];
      shots.push({ position: tip, dir: playerPos.clone().sub(tip).normalize() });
    } else if (this.volleyCount % 2 === 0) {
      ringBurst();
    } else {
      fan();
    }
    return shots;
  }

  getTurretPositions(): THREE.Vector3[] {
    return this.emitters.map(e => e.getWorldPosition(new THREE.Vector3()));
  }

  reset(): void {
    super.reset();
    this.attackTimer = 0;
    this.attackInterval = 2.4;
    this.volleyCount = 0;
    this.hitFlash = 0;
    this._exposed = false;
    this._pacified = false;
    this._pain = 0;
  }
}
