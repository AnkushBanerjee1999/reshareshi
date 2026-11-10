import { MathUtils } from '../utils/MathUtils.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Arcade Collision & Interaction System
 */
export class CollisionSystem {
  constructor(rickshaw, obstacleManager, collectibleManager, cameraController, audioManager, onNotification) {
    this.rickshaw = rickshaw;
    this.obstacleManager = obstacleManager;
    this.collectibleManager = collectibleManager;
    this.cameraController = cameraController;
    this.audio = audioManager;
    this.onNotification = onNotification || (() => {});
  }

  update(deltaTime) {
    if (!this.rickshaw || !this.rickshaw.mesh) return;

    const bounds = this.rickshaw.getCollisionBounds();

    // 1. Obstacle collisions
    const obstacles = this.obstacleManager.getActiveObstacles();
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const obsPos = obs.mesh.position;
      const obsDef = obs.def;

      // Circle collision check against both front wheel and rear carriage
      const obsRadius = Math.max(obsDef.width, obsDef.length) * 0.45;

      const hitFront = MathUtils.checkCircleOverlap(
        bounds.front.x, bounds.front.z, bounds.front.radius,
        obsPos.x, obsPos.z, obsRadius
      );

      const hitRear = MathUtils.checkCircleOverlap(
        bounds.rear.x, bounds.rear.z, bounds.rear.radius,
        obsPos.x, obsPos.z, obsRadius
      );

      if (hitFront || hitRear) {
        if (this.rickshaw.collisionCooldown <= 0) {
          // Impact response
          this.rickshaw.applyObstacleImpact(obsDef);

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

    // 2. Collectible pickups
    const collectibles = this.collectibleManager.getActiveCollectibles();
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const col = collectibles[i];
      const colPos = col.mesh.position;
      const pickupRadius = 1.35;

      const hitFront = MathUtils.checkCircleOverlap(
        bounds.front.x, bounds.front.z, bounds.front.radius,
        colPos.x, colPos.z, pickupRadius
      );

      const hitRear = MathUtils.checkCircleOverlap(
        bounds.rear.x, bounds.rear.z, bounds.rear.radius,
        colPos.x, colPos.z, pickupRadius
      );

      if (hitFront || hitRear) {
        // Collect item!
        const def = col.def;
        if (def.type === 'coin') {
          if (this.audio) this.audio.playCoin();
        } else {
          if (this.audio) this.audio.playRefreshment();
          this.rickshaw.addBoostEnergy(def.boost);
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

