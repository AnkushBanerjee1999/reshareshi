import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';
import { GLBRickshawLoader } from './GLBRickshawLoader.js';
import { SplinePath } from '../world/SplinePath.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * AI Rickshaw Racer Controller
 *
 * Simulates intelligent, competitive AI racers with individual personalities:
 * - Exclusively uses the authentic GLB Tuk-Tuk model with unique livery colors per competitor
 * - True arcade heading physics matching the player's vehicle
 * - Dynamic cornering, apex lines, overtaking maneuvers & competitive pack racing.
 */
export class AIRacerController {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.name = config.name || 'AI Racer';
    this.isAI = true;
    this.spline = new SplinePath();

    // AI Personality & Competitive Tuning
    this.personality = config.personality || 'balanced';
    this.baseSpeed = config.baseSpeed || 19.5;
    this.maxSpeed = config.maxSpeed || 25.5;
    this.accelRate = config.accelRate || 12.0;
    this.steerAgility = config.steerAgility || 8.5;
    this.overtakeAggression = config.overtakeAggression || 0.75; // 0 to 1

    // Dynamic Physics & Heading State
    this.speed = 0.0;
    this.heading = 0.0;
    this.roadOffset = config.startLaneX || 0.0;
    this.targetOffset = this.roadOffset;
    this.laneChangeTimer = 1.0 + Math.random() * 2.5;
    this.steerAngle = 0.0;
    this.leanAngle = 0.0;
    this.collisionCooldown = 0.0;

    // Race Progress Tracking
    this.raceDistance = 0.0;
    this.finished = false;
    this.finishTime = 0.0;
    this.rank = 1;

    // Outer container holding racer mesh - hidden until authentic GLB model is ready
    this.mesh = new THREE.Group();
    this.mesh.name = `AIRacer_${this.name}`;
    this.mesh.visible = false;

    if (config.startPos) {
      const sx = Number.isFinite(config.startPos.x) ? config.startPos.x : 0.0;
      const sz = Number.isFinite(config.startPos.z) ? config.startPos.z : 0.0;
      this.roadOffset = sx;
      this.targetOffset = sx;

      const trackCenter = this.spline.getCenterAtZ(sz);
      this.heading = this.spline.getTangentAngleAtZ(sz);
      this.mesh.position.set(trackCenter + sx, 0.0, sz);
      this.mesh.rotation.set(0, this.heading, 0);
      this.raceDistance = -sz;
    }
    this.scene.add(this.mesh);

    // Asynchronously load the identical authentic GLB Rickshaw model with this AI racer's unique livery
    this.glbData = null;
    this.loadGLBModel(config);
  }

  async loadGLBModel(config) {
    try {
      const glbInstance = await GLBRickshawLoader.createRickshawInstance({
        name: `AIRacerGLB_${this.name}`,
        isPlayer: false,
        primaryColor: config.canopyColor || '#3498db',
        secondaryColor: config.canopySecondary || '#2c3e50',
        canopyColor: config.canopyColor || '#3498db'
      });

      if (glbInstance && glbInstance.root) {
        this.glbData = glbInstance;
        this.mesh.add(glbInstance.root);
        this.mesh.visible = true;
      }
    } catch (err) {
      console.warn('Could not initialize GLB model for AI racer:', err);
    }
  }

  update(deltaTime, raceContext = {}) {
    if (this.collisionCooldown > 0) this.collisionCooldown -= deltaTime;

    if (!this.finished) {
      this.updateAIBehavior(deltaTime, raceContext);
      this.updatePhysics(deltaTime);
    } else {
      // Coast to a stop after crossing the finish line
      this.speed = Math.max(0, this.speed - 8.0 * deltaTime);
      const moveDist = this.speed * deltaTime;
      this.mesh.position.x += -Math.sin(this.heading) * moveDist;
      this.mesh.position.z += -Math.cos(this.heading) * moveDist;
      this.raceDistance = -this.mesh.position.z;
    }

    this.updateAnimations(deltaTime);
  }

  updateAIBehavior(deltaTime, raceContext) {
    const allRacers = raceContext.allRacers || [];
    const z = this.mesh.position.z;
    const roadCenter = this.spline.getCenterAtZ(z);
    const curvature = this.spline.getCurvatureAtZ(z);
    const halfWidth = 14.6 / 2 - 1.35;

    // 1. Dynamic Cornering Line Selection (Apex clipping in curves)
    let idealOffset = this.targetOffset;
    if (Math.abs(curvature) > 0.0015) {
      // Right turn (curvature > 0): apex inside is +X; Left turn (curvature < 0): apex inside is -X
      if (curvature > 0) {
        idealOffset = (this.personality === 'aggressive' || this.personality === 'speedster') ? halfWidth * 0.65 : 1.5;
      } else {
        idealOffset = (this.personality === 'aggressive' || this.personality === 'speedster') ? -halfWidth * 0.65 : -1.5;
      }
    }

    // 2. Racer ahead in lane detection
    let racerAheadInLane = false;
    for (const racer of allRacers) {
      if (racer === this) continue;
      const rPos = racer.mesh.position;
      const dz = this.mesh.position.z - rPos.z; // Ahead of us = smaller (more negative) Z
      if (dz > 0.8 && dz < 14.0) {
        const dx = Math.abs(this.mesh.position.x - rPos.x);
        if (dx < 1.8) {
          racerAheadInLane = true;
          break;
        }
      }
    }

    // 3. Lane Decision & Overtaking
    this.laneChangeTimer -= deltaTime;
    const candidateLanes = [-4.4, -2.2, 0.0, 2.2, 4.4].filter(l => Math.abs(l) < halfWidth);

    if (racerAheadInLane || this.laneChangeTimer <= 0) {
      const curOffset = this.mesh.position.x - roadCenter;

      if (racerAheadInLane) {
        const openLanes = candidateLanes.filter(l => Math.abs(l - curOffset) > 1.8);
        if (openLanes.length > 0) {
          this.targetOffset = MathUtils.randomChoice(openLanes);
        }
        this.laneChangeTimer = 1.6 + Math.random() * 1.8;
      } else if (Math.abs(curvature) > 0.0015) {
        this.targetOffset = idealOffset;
        this.laneChangeTimer = 2.2;
      } else {
        this.targetOffset = MathUtils.randomChoice(candidateLanes);
        this.laneChangeTimer = 2.5 + Math.random() * 3.5;
      }
    }

    // 4. Target Speed calculation
    let desiredSpeed = this.baseSpeed;
    if (this.personality === 'aggressive') {
      desiredSpeed = this.maxSpeed * 0.98;
    } else if (this.personality === 'speedster') {
      desiredSpeed = this.maxSpeed * 1.02;
    } else if (this.personality === 'overtaker') {
      desiredSpeed = this.maxSpeed * 0.95;
    }

    // Cornering speed adjustment
    if (Math.abs(curvature) > 0.003) {
      desiredSpeed *= 0.94;
    }

    this.speed = MathUtils.damp(this.speed, desiredSpeed, this.accelRate, deltaTime);

    // 5. Steering toward target lane (gentle, smooth lane changing)
    const curWorldX = this.mesh.position.x;
    const targetWorldX = roadCenter + this.targetOffset;
    const errX = targetWorldX - curWorldX;

    // In Three.js: moving left (-X) requires positive steer angle, moving right (+X) requires negative steer angle
    const targetSteer = -Math.sign(errX) * Math.min(1.0, Math.abs(errX) * 0.35) * 0.16;
    this.steerAngle = MathUtils.damp(this.steerAngle, targetSteer, 4.5, deltaTime);

    // Subtle, realistic lean
    this.leanAngle = MathUtils.damp(this.leanAngle, this.steerAngle * 0.25, 4.0, deltaTime);
  }

  updatePhysics(deltaTime) {
    const curZ = this.mesh.position.z;
    const roadHeading = this.spline.getTangentAngleAtZ(curZ);
    const roadCenter = this.spline.getCenterAtZ(curZ);
    const halfWidth = 14.6 / 2 - 1.35;

    // 1. Smooth Arcade Heading Alignment
    const targetHeading = roadHeading + this.steerAngle * 0.55;
    if (this.speed > 0.3) {
      this.heading = MathUtils.damp(this.heading, targetHeading, 4.2, deltaTime);
    } else {
      this.heading = MathUtils.damp(this.heading, roadHeading, 4.5, deltaTime);
    }

    // 2. Physical Velocity Integration
    const moveDist = this.speed * deltaTime;
    this.mesh.position.x += -Math.sin(this.heading) * moveDist;
    this.mesh.position.z += -Math.cos(this.heading) * moveDist;
    this.raceDistance = -this.mesh.position.z;

    // 3. Road Boundaries & Wall Collision
    const lateralDist = this.mesh.position.x - roadCenter;
    if (lateralDist < -halfWidth) {
      this.mesh.position.x = roadCenter - halfWidth;
      this.heading = Math.min(this.heading, roadHeading + 0.05);
      this.speed = Math.max(1.0, this.speed - 7.5 * deltaTime);
      this.targetOffset = Math.max(-halfWidth + 2.0, this.targetOffset);
    } else if (lateralDist > halfWidth) {
      this.mesh.position.x = roadCenter + halfWidth;
      this.heading = Math.max(this.heading, roadHeading - 0.05);
      this.speed = Math.max(1.0, this.speed - 7.5 * deltaTime);
      this.targetOffset = Math.min(halfWidth - 2.0, this.targetOffset);
    }

    // 4. Stable 3D World Transform (0 vertical jitter)
    this.mesh.position.y = 0.0;
    this.mesh.rotation.x = 0.0;
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = this.leanAngle;
  }

  updateAnimations(deltaTime) {
    if (this.glbData && this.glbData.wheels && this.speed > 0.05) {
      const rotDelta = (this.speed * deltaTime) / (this.glbData.wheelRadius || 0.38);
      for (const w of this.glbData.wheels) {
        w.rotation.x += rotDelta;
      }
    }
  }

  applyObstacleImpact(obstacle) {
    this.speed = Math.max(2.0, this.speed * 0.65);
    this.collisionCooldown = 0.8;
  }

  applyRacerBump(otherRacer, deltaX) {
    const pushDir = deltaX >= 0 ? 1 : -1;
    this.mesh.position.x += pushDir * 0.14;
    this.speed = Math.max(2.0, this.speed * 0.94);
  }

  getCollisionBounds() {
    const pos = this.mesh.position;
    const sinH = Math.sin(this.heading);
    const cosH = Math.cos(this.heading);

    return {
      front: {
        x: pos.x - sinH * 1.35,
        z: pos.z - cosH * 1.35,
        radius: 0.52
      },
      rear: {
        x: pos.x + sinH * 0.65,
        z: pos.z + cosH * 0.65,
        radius: 0.88
      },
      minX: pos.x - 1.0,
      maxX: pos.x + 1.0,
      minZ: pos.z - 1.7,
      maxZ: pos.z + 1.4
    };
  }

  reset(startPosition = {}) {
    this.speed = 0.0;
    const posX = (typeof startPosition.x === 'number' && Number.isFinite(startPosition.x)) ? startPosition.x : 0.0;
    const posZ = (typeof startPosition.z === 'number' && Number.isFinite(startPosition.z)) ? startPosition.z : 0.0;

    this.roadOffset = posX;
    this.targetOffset = posX;

    const trackCenter = this.spline.getCenterAtZ(posZ);
    this.heading = this.spline.getTangentAngleAtZ(posZ);

    this.mesh.position.set(trackCenter + posX, 0.0, posZ);
    this.mesh.rotation.set(0, this.heading, 0);

    this.raceDistance = -posZ;
    this.finished = false;
    this.finishTime = 0.0;
    this.rank = 1;
    this.steerAngle = 0.0;
    this.leanAngle = 0.0;
    this.collisionCooldown = 0.0;
  }

  dispose() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
