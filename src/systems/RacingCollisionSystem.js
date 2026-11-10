import { MathUtils } from '../utils/MathUtils.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Racing Collision & Overtaking Interaction System
 *
 * Handles:
 * - Racer-to-Racer proximity bumping & lateral separation
 * - Obstacle collisions with speed penalties
 * - Collectible item pickups
 */
export class RacingCollisionSystem {
  constructor(raceManager, obstacleManager, collectibleManager, cameraController, audioManager, onNotification) {
    this.raceManager = raceManager;
    this.obstacleManager = obstacleManager;
    this.collectibleManager = collectibleManager;
    this.cameraController = cameraController;
    this.audio = audioManager;
    this.onNotification = onNotification || (() => {});
  }

  update(deltaTime) {
    const allRacers = this.raceManager.allRacers;
    const player = this.raceManager.player;

    // 1. Racer-to-Racer Collisions & Lateral Nudging
    for (let i = 0; i < allRacers.length; i++) {
      for (let j = i + 1; j < allRacers.length; j++) {
        const rA = allRacers[i];
        const rB = allRacers[j];

        const posA = rA.mesh.position;
        const posB = rB.mesh.position;

        const dz = Math.abs(posA.z - posB.z);
        const dx = Math.abs(posA.x - posB.x);

        // Bounding check between two cycle rickshaws (width ~1.8m, length ~2.6m)
        if (dz < 2.2 && dx < 1.7) {
          const deltaX = posA.x - posB.x;

          // Apply mutual lateral bounce & speed nudge
          rA.applyRacerBump(rB, deltaX);
          rB.applyRacerBump(rA, -deltaX);

          // If player is involved, slight feedback
          if (rA === player || rB === player) {
            if (this.cameraController) this.cameraController.addTrauma(0.06);
          }
        }
      }
    }

    // 2. Obstacle Collisions
    const obstacles = this.obstacleManager.getActiveObstacles();

    for (const obs of obstacles) {
      const obsPos = obs.mesh.position;
      const obsDef = obs.def;
      const obsRadius = Math.max(obsDef.width, obsDef.length) * 0.45;

      // Check against all racers
      for (const racer of allRacers) {
        const bounds = racer.getCollisionBounds();

        const hitFront = MathUtils.checkCircleOverlap(
          bounds.front.x, bounds.front.z, bounds.front.radius,
          obsPos.x, obsPos.z, obsRadius
        );

        const hitRear = MathUtils.checkCircleOverlap(
          bounds.rear.x, bounds.rear.z, bounds.rear.radius,
          obsPos.x, obsPos.z, obsRadius
        );

        if (hitFront || hitRear) {
          if (racer.collisionCooldown <= 0) {
            racer.applyObstacleImpact(obsDef);

            if (racer === player) {
              if (this.cameraController) {
                this.cameraController.addTrauma(obsDef.wobbleImpulse * 1.5);
              }
              this.onNotification({
                type: 'obstacle_hit',
                message: obsDef.message,
                penalty: obsDef.pointsPenalty,
                obstacle: obsDef
              });
            }
          }
        }
      }
    }

    // 3. Collectible pickups (Player only)
    const collectibles = this.collectibleManager.getActiveCollectibles();
    const playerBounds = player.getCollisionBounds();
    const pickupRadius = 1.4;

    for (let i = collectibles.length - 1; i >= 0; i--) {
      const col = collectibles[i];
      const colPos = col.mesh.position;

      const hitFront = MathUtils.checkCircleOverlap(
        playerBounds.front.x, playerBounds.front.z, playerBounds.front.radius,
        colPos.x, colPos.z, pickupRadius
      );

      const hitRear = MathUtils.checkCircleOverlap(
        playerBounds.rear.x, playerBounds.rear.z, playerBounds.rear.radius,
        colPos.x, colPos.z, pickupRadius
      );

      if (hitFront || hitRear) {
        const def = col.def;
        if (def.type === 'coin') {
          if (this.audio) this.audio.playCoin();
        } else {
          if (this.audio) this.audio.playRefreshment();
          player.addBoostEnergy(def.boost);
        }

        this.onNotification({
          type: 'collectible_pickup',
          collectible: def
        });

        this.collectibleManager.removeCollectible(i);
      }
    }
  }
}

