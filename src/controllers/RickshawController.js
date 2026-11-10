import * as THREE from 'three';
import { PHYSICS, CANOPY_SKINS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { GLBRickshawLoader } from './GLBRickshawLoader.js';
import { SplinePath } from '../world/SplinePath.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Player Rickshaw Controller
 *
 * True arcade racing vehicle physics:
 * - Direct heading yaw steering with natural caster stabilization along curved Grand Prix tracks
 * - Velocity-integrated 3D movement along vehicle heading (-sin(yaw) * speed, -cos(yaw) * speed)
 * - Rock-solid vertical stability (0 vertical shaking or jitter)
 * - Curb boundaries with realistic friction penalties
 * - Exclusively renders the photorealistic 3D GLB Auto Rickshaw model
 */
export class RickshawController {
  constructor(scene, inputManager, audioManager, options = {}) {
    this.scene = scene;
    this.input = inputManager;
    this.audio = audioManager;
    this.selectedCanopyId = options.selectedCanopy || 'kaali-peeli';

    this.spline = new SplinePath();

    // Racer identity
    this.name = 'Player (You)';
    this.isAI = false;

    // Movement & True Heading Physics
    this.speed = 0.0;
    this.maxSpeed = PHYSICS.MAX_NORMAL_SPEED;
    this.heading = 0.0; // Current yaw heading in radians (0 = along -Z)
    this.steerAngle = 0.0;
    this.leanAngle = 0.0;

    // Energy & Boost
    this.stamina = PHYSICS.MAX_STAMINA;
    this.boostEnergy = 50.0;
    this.isBoosting = false;
    this.boostTimer = 0.0;

    // Collision & Bell
    this.collisionCooldown = 0.0;
    this.bellCooldownTimer = 0.0;
    this.isWallContact = false;
    this.wallScrapeTimer = 0.0;
    this.cameraController = null;

    // Race Tracking
    this.raceDistance = 0.0; // Distance traveled along the track (m)
    this.finished = false;
    this.finishTime = 0.0;
    this.rank = 1;

    const skinDef = CANOPY_SKINS.find(s => s.id === this.selectedCanopyId) || CANOPY_SKINS[0];

    // Outer container holding vehicle geometry - hidden until authentic GLB model is attached
    this.mesh = new THREE.Group();
    this.mesh.name = 'PlayerVehicleRoot';
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    // Asynchronously load the photorealistic GLB Tuk-Tuk / Auto Rickshaw model
    this.glbData = null;
    this.loadGLBModel(skinDef);

    // Visual Bell shockwave ring
    const waveGeo = new THREE.RingGeometry(0.25, 0.45, 24);
    waveGeo.rotateX(-Math.PI / 2);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    this.soundWaveRing = new THREE.Mesh(waveGeo, waveMat);
    this.soundWaveRing.position.set(-0.28, 1.55, -1.35);
    this.mesh.add(this.soundWaveRing);

    // Dust particles
    this.dustParticles = [];
    this.initDustParticles();
  }

  async loadGLBModel(skinDef) {
    try {
      const glbInstance = await GLBRickshawLoader.createRickshawInstance({
        name: 'PlayerGLBAuto',
        isPlayer: true,
        primaryColor: skinDef.primaryColor || '#f1c40f',
        secondaryColor: skinDef.secondaryColor || '#1a1a1a',
        canopyColor: '#1a1a1a'
      });

      if (glbInstance && glbInstance.root) {
        this.glbData = glbInstance;
        this.mesh.add(glbInstance.root);
        this.mesh.visible = true;
      }
    } catch (err) {
      console.warn('Could not initialize GLB model for player:', err);
    }
  }

  initDustParticles() {
    const count = 18;
    const dustGeo = new THREE.SphereGeometry(0.08, 5, 5);
    const dustMat = new THREE.MeshBasicMaterial({ color: 0xd7ccc8, transparent: true, opacity: 0.0 });

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(dustGeo, dustMat.clone());
      p.visible = false;
      this.mesh.add(p);
      this.dustParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.38,
        velY: 0,
        velZ: 0
      });
    }
  }

  applyCanopySkin(skinId) {
    const skinDef = CANOPY_SKINS.find(s => s.id === skinId) || CANOPY_SKINS[0];
    this.selectedCanopyId = skinDef.id;

    if (this.glbData && this.glbData.model) {
      const primaryCol = new THREE.Color(skinDef.primaryColor);
      const secondaryCol = new THREE.Color(skinDef.secondaryColor || '#1a1a1a');
      const canopyCol = new THREE.Color(skinDef.canopyColor || skinDef.secondaryColor || '#1a1a1a');

      this.glbData.model.traverse((child) => {
        if (child.isMesh && child.material) {
          const matName = (child.material.name || '').toLowerCase();
          if (matName.includes('metallic_blue') || matName.includes('metallic_yellow')) {
            child.material.color.copy(primaryCol);
          } else if (matName.includes('metallic_orange') || matName.includes('metallic_red')) {
            child.material.color.copy(secondaryCol);
          } else if (matName === 'material' || matName === 'material_0') {
            child.material.color.copy(canopyCol);
          }
        }
      });
    }
  }

  setCameraController(cameraController) {
    this.cameraController = cameraController;
  }

  update(deltaTime) {
    this.handleInput(deltaTime);
    this.updateStamina(deltaTime);
    this.updateBoost(deltaTime);
    this.updatePhysics(deltaTime);
    this.updateAnimations(deltaTime);
    this.updateDust(deltaTime);

    if (this.audio) {
      this.audio.updateVehicleSounds(
        this.speed,
        PHYSICS.MAX_SPRINT_SPEED,
        this.input ? this.input.isPedaling() : false,
        this.isBoosting
      );
    }

    if (this.collisionCooldown > 0) this.collisionCooldown -= deltaTime;
    if (this.bellCooldownTimer > 0) this.bellCooldownTimer -= deltaTime;
  }

  handleInput(deltaTime) {
    if (!this.input || this.finished) return;

    if (this.input.isBellTriggered()) this.ringBell();
    if (this.input.isBoostTriggered()) this.activateBoost();

    const isPedaling = this.input.isPedaling();
    const isBraking = this.input.isBraking();
    const isSprinting = this.input.isSprinting() && this.stamina > 5.0;

    // 1. Acceleration & Braking
    if (this.isBoosting) {
      this.speed = MathUtils.damp(this.speed, PHYSICS.BOOST_SPEED, 6.0, deltaTime);
    } else if (isPedaling) {
      let accel = isSprinting ? PHYSICS.SPRINT_ACCELERATION : PHYSICS.BASE_ACCELERATION;
      if (this.stamina < PHYSICS.LOW_STAMINA_THRESHOLD) {
        accel *= PHYSICS.EXHAUSTED_ACCEL_PENALTY;
      }

      const targetSpeed = isSprinting ? PHYSICS.MAX_SPRINT_SPEED : PHYSICS.MAX_NORMAL_SPEED;
      if (this.speed < targetSpeed) {
        this.speed += accel * deltaTime;
        if (this.speed > targetSpeed) this.speed = targetSpeed;
      }
    } else if (isBraking) {
      this.speed -= PHYSICS.BRAKE_FORCE * deltaTime;
      if (this.speed < 0) this.speed = 0;
    } else {
      if (this.speed > 0) {
        this.speed -= PHYSICS.FRICTION * deltaTime;
        if (this.speed < 0) this.speed = 0;
      }
    }

    // 2. Smooth, Controllable Arcade Steering
    // steerAxis: -1 for Left (A), +1 for Right (D), 0 for center
    const steerAxis = this.input.getSteerAxis();
    // In Three.js: Left = positive yaw (+Y rotation), Right = negative yaw (-Y rotation)
    const targetSteerAngle = -steerAxis * PHYSICS.MAX_STEER_ANGLE;

    const steerDampRate = Math.abs(steerAxis) > 0.01 ? PHYSICS.STEER_SPEED : PHYSICS.STEER_RETURN_SPEED;
    this.steerAngle = MathUtils.damp(this.steerAngle, targetSteerAngle, steerDampRate, deltaTime);

    // Subtle, realistic body lean into the corner (no excessive tilt)
    const speedRatio = Math.min(1.0, this.speed / PHYSICS.MAX_NORMAL_SPEED);
    const targetLean = -steerAxis * PHYSICS.MAX_LEAN_ANGLE * speedRatio;
    this.leanAngle = MathUtils.damp(this.leanAngle, targetLean, PHYSICS.LEAN_SPEED, deltaTime);
  }

  updateStamina(deltaTime) {
    if (!this.input || this.finished) return;

    const isPedaling = this.input.isPedaling();
    const isSprinting = this.input.isSprinting() && this.stamina > 0;

    if (isSprinting) {
      this.stamina = Math.max(0, this.stamina - PHYSICS.STAMINA_SPRINT_DRAIN * deltaTime);
    } else if (isPedaling) {
      this.stamina = Math.max(0, this.stamina - PHYSICS.STAMINA_NORMAL_DRAIN * deltaTime);
    } else {
      this.stamina = Math.min(PHYSICS.MAX_STAMINA, this.stamina + PHYSICS.STAMINA_RECOVERY_RATE * deltaTime);
    }
  }

  updateBoost(deltaTime) {
    if (this.isBoosting) {
      this.boostTimer -= deltaTime;
      this.boostEnergy = Math.max(0, (this.boostTimer / 3.5) * PHYSICS.MAX_BOOST_ENERGY);

      if (this.boostTimer <= 0 || this.boostEnergy <= 0) {
        this.isBoosting = false;
        this.boostEnergy = 0;
      }
    }
  }

  addBoostEnergy(amount) {
    this.boostEnergy = Math.min(PHYSICS.MAX_BOOST_ENERGY, this.boostEnergy + amount);
  }

  activateBoost() {
    if (this.boostEnergy >= 30.0 && !this.isBoosting && !this.finished) {
      this.isBoosting = true;
      this.boostTimer = (this.boostEnergy / PHYSICS.MAX_BOOST_ENERGY) * 3.5;
      if (this.audio) this.audio.playBoost();
      return true;
    }
    return false;
  }

  ringBell() {
    if (this.bellCooldownTimer > 0) return false;
    this.bellCooldownTimer = PHYSICS.BELL_COOLDOWN;
    if (this.audio) this.audio.playBell();

    if (this.soundWaveRing) {
      this.soundWaveRing.scale.set(1, 1, 1);
      this.soundWaveRing.material.opacity = 0.9;
    }

    return true;
  }

  isBellScareActive() {
    return this.bellCooldownTimer > (PHYSICS.BELL_COOLDOWN - 0.45);
  }

  applyObstacleImpact(obstacle) {
    if (this.collisionCooldown > 0) return;

    this.speed = Math.max(2.0, this.speed * (1.0 - obstacle.speedPenalty));
    this.collisionCooldown = 0.8;

    if (this.audio) this.audio.playCollision(obstacle.speedPenalty);
  }

  applyRacerBump(otherRacer, deltaX) {
    // Subtle lateral elastic repulsion
    const pushDir = deltaX >= 0 ? 1 : -1;
    this.mesh.position.x += pushDir * 0.12;
    this.speed = Math.max(2.0, this.speed * 0.96);

    if (this.audio) this.audio.playCollision(0.15);
  }

  updatePhysics(deltaTime) {
    const curZ = this.mesh.position.z;
    const roadHeading = this.spline.getTangentAngleAtZ(curZ);
    const roadCenter = this.spline.getCenterAtZ(curZ);
    const halfRoadWidth = 14.6 / 2 - 1.25;

    // 1. Pure Manual Steering (Zero Auto-Syncing / Zero Autopilot)
    // The rickshaw NEVER automatically follows or syncs with the road curve.
    // Turning only occurs when the player actively presses A/D to steer.
    if (this.speed > 0.4 && Math.abs(this.steerAngle) > 0.001) {
      const turnRate = this.steerAngle * (this.speed * 0.14);
      this.heading += turnRate * deltaTime;
    }

    // 2. Physical Velocity Integration along vehicle's true heading
    const moveDist = this.speed * deltaTime;
    this.mesh.position.x += -Math.sin(this.heading) * moveDist;
    this.mesh.position.z += -Math.cos(this.heading) * moveDist;
    this.raceDistance = -this.mesh.position.z;

    // 3. Physical Wall / Curb Barrier Collision & Gradual Stop
    const lateralDist = this.mesh.position.x - roadCenter;
    const barrierAngle = this.spline.getTangentAngleAtZ(curZ);
    let hittingWall = false;

    if (lateralDist < -halfRoadWidth) {
      // Left barrier contact
      hittingWall = true;
      this.mesh.position.x = roadCenter - halfRoadWidth;
      // Barrier normal prevents steering further into the left wall
      this.heading = Math.min(this.heading, barrierAngle);
    } else if (lateralDist > halfRoadWidth) {
      // Right barrier contact
      hittingWall = true;
      this.mesh.position.x = roadCenter + halfRoadWidth;
      // Barrier normal prevents steering further into the right wall
      this.heading = Math.max(this.heading, barrierAngle);
    }

    if (hittingWall) {
      // 1. Initial Impact Jolt (First frame of hitting wall)
      if (!this.isWallContact) {
        this.isWallContact = true;
        if (this.speed > 3.0) {
          // Sharp speed reduction on initial collision
          this.speed *= 0.65;
          if (this.cameraController) this.cameraController.addTrauma(0.35);
          if (this.audio) this.audio.playCollision(0.4);
        }
        if (this.isBoosting) {
          this.isBoosting = false;
          this.boostTimer = 0.0;
        }
      }

      // 2. Wall Scraping Friction: continuously reduces speed and gradually stops!
      const wallFriction = 8.5; // m/s^2 deceleration
      this.speed = Math.max(0.0, this.speed - wallFriction * deltaTime);
      if (this.speed < 0.1) {
        this.speed = 0.0;
      }

      // Scraping sound feedback while moving against barrier
      this.wallScrapeTimer -= deltaTime;
      if (this.speed > 1.0 && this.wallScrapeTimer <= 0) {
        if (this.audio) this.audio.playCollision(0.12);
        this.wallScrapeTimer = 0.28;
      }
    } else {
      // Free of wall contact
      this.isWallContact = false;
      this.wallScrapeTimer = 0.0;
    }

    // 4. Stable 3D World Transform (0 vertical jitter)
    this.mesh.position.y = 0.0;
    this.mesh.rotation.x = 0.0;
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = this.leanAngle;
  }

  updateAnimations(deltaTime) {
    // 1. GLB Auto Model Wheel Rotations
    if (this.glbData && this.glbData.wheels && this.speed > 0.05) {
      const wheelRotDelta = (this.speed * deltaTime) / (this.glbData.wheelRadius || 0.38);
      for (const w of this.glbData.wheels) {
        w.rotation.x += wheelRotDelta;
      }

      // Boost headlight illumination intensity on asphalt decal
      if (this.glbData.poolMesh && this.glbData.poolMesh.material) {
        this.glbData.poolMesh.material.opacity = this.isBoosting ? 0.95 : 0.78;
      }
    }

    // 2. Soundwave bell animation
    if (this.soundWaveRing && this.soundWaveRing.material.opacity > 0.01) {
      this.soundWaveRing.scale.addScalar(deltaTime * 4.8);
      this.soundWaveRing.material.opacity -= deltaTime * 2.4;
    }
  }

  updateDust(deltaTime) {
    if (this.speed < 4.0) return;
    for (const p of this.dustParticles) {
      if (!p.mesh.visible && Math.random() < 0.22) {
        const side = Math.random() > 0.5 ? -0.92 : 0.92;
        p.mesh.position.set(side + (Math.random() - 0.5) * 0.18, 0.12, 1.35); // Behind rear wheels (+Z)
        p.mesh.visible = true;
        p.life = 0;
        p.maxLife = 0.38;
        p.velY = 0.9 + Math.random() * 0.5;
        p.velZ = 1.6 + Math.random();
        p.mesh.material.opacity = 0.65;
        p.mesh.scale.set(1, 1, 1);
      } else if (p.mesh.visible) {
        p.life += deltaTime;
        if (p.life >= p.maxLife) {
          p.mesh.visible = false;
        } else {
          p.mesh.position.y += p.velY * deltaTime;
          p.mesh.position.z += p.velZ * deltaTime;
          p.mesh.scale.addScalar(deltaTime * 2.0);
          p.mesh.material.opacity = (1 - p.life / p.maxLife) * 0.55;
        }
      }
    }
  }

  // Heading-aligned collision bounds
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
      minX: pos.x - 1.05,
      maxX: pos.x + 1.05,
      minZ: pos.z - 1.75,
      maxZ: pos.z + 1.45
    };
  }

  reset(startPosition = {}) {
    this.speed = 0.0;
    this.stamina = PHYSICS.MAX_STAMINA;
    this.boostEnergy = 50.0;
    this.isBoosting = false;
    this.boostTimer = 0.0;
    this.heading = 0.0;
    this.steerAngle = 0.0;
    this.leanAngle = 0.0;
    this.collisionCooldown = 0.0;
    this.bellCooldownTimer = 0.0;
    this.isWallContact = false;
    this.wallScrapeTimer = 0.0;
    this.finished = false;
    this.finishTime = 0.0;
    this.rank = 1;

    const posX = (typeof startPosition.x === 'number' && Number.isFinite(startPosition.x)) ? startPosition.x : 0.0;
    const posZ = (typeof startPosition.z === 'number' && Number.isFinite(startPosition.z)) ? startPosition.z : 0.0;

    const trackCenter = this.spline.getCenterAtZ(posZ);
    this.heading = this.spline.getTangentAngleAtZ(posZ);

    this.mesh.position.set(trackCenter + posX, 0.0, posZ);
    this.mesh.rotation.set(0, this.heading, 0);
    this.raceDistance = -posZ;
  }

  dispose() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
