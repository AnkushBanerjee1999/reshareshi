import * as THREE from 'three';

/**
 * Cycle Rush: Kolkata Alleyways
 * Grand Prix Circuit Spline & Track Curve System
 *
 * Defines a smooth, realistic, wide urban racing circuit with:
 * - Start Straight: Z = 60m to -140m (rock-solid 5-lane straight launchpad at X = 0)
 * - Turn 1 (Howrah Sweeper): Z = -140m to -420m (broad sweeping right turn peaking at X = +14.0m)
 * - Boulevard Straight: Z = -420m to -580m (high-speed straightaway at X = 0)
 * - Turn 2 (Victoria Memorial Sweeper): Z = -580m to -860m (broad sweeping left turn peaking at X = -14.0m)
 * - Turn 3 (Esplanade Technical Chicane): Z = -860m to -1020m (gentle S-curve peaking at X = +8.0m)
 * - Final Sprint: Z = -1020m to -1250m (straight high-speed sprint into Finish Line Archway at X = 0)
 */
export class SplinePath {
  constructor() {
    this.waypoints = [
      { z:   60.0, x:   0.0 },
      { z:    0.0, x:   0.0 }, // Start Line
      { z: -140.0, x:   0.0 }, // Launch straight
      { z: -280.0, x:  14.0 }, // Turn 1 Apex (Howrah Sweeper Right)
      { z: -420.0, x:   0.0 }, // Turn 1 Exit / Boulevard Entry
      { z: -580.0, x:   0.0 }, // Boulevard Straight
      { z: -720.0, x: -14.0 }, // Turn 2 Apex (Victoria Memorial Sweeper Left)
      { z: -860.0, x:   0.0 }, // Turn 2 Exit
      { z: -940.0, x:   8.0 }, // Turn 3 Apex (Esplanade Chicane Right)
      { z: -1020.0, x:   0.0 }, // Final Sprint Entry
      { z: -1100.0, x:   0.0 }, // Final Sprint Straight
      { z: -1200.0, x:   0.0 }, // Grand Finish Line
      { z: -1300.0, x:   0.0 }  // Runoff
    ];
  }

  static catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2.0 * p1) +
      (-p0 + p2) * t +
      (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
      (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
    );
  }

  /**
   * Returns track center X coordinate at any track distance Z
   */
  getCenterAtZ(z) {
    // Keep start and finish straightaways strictly centered at X = 0
    if (z >= -140.0) return 0.0;
    if (z <= -1020.0) return 0.0;

    const wp = this.waypoints;
    const count = wp.length;

    for (let i = 0; i < count - 1; i++) {
      const p1 = wp[i];
      const p2 = wp[i + 1];

      if (z <= p1.z && z >= p2.z) {
        const p0 = i > 0 ? wp[i - 1] : p1;
        const p3 = i < count - 2 ? wp[i + 2] : p2;

        const dz = p2.z - p1.z;
        let t = dz !== 0 ? (z - p1.z) / dz : 0.0;
        t = Math.max(0.0, Math.min(1.0, t));

        return SplinePath.catmullRom(p0.x, p1.x, p2.x, p3.x, t);
      }
    }

    return 0.0;
  }

  /**
   * Returns road yaw heading angle (radians) in Three.js coordinate system:
   * 0 rad = facing forward along -Z
   * < 0 rad = facing forward-right towards +X
   * > 0 rad = facing forward-left towards -X
   */
  getTangentAngleAtZ(z) {
    if (z >= -140.0 || z <= -1020.0) return 0.0;

    const delta = 1.0;
    const x1 = this.getCenterAtZ(z + delta);
    const x2 = this.getCenterAtZ(z - delta);
    // As vehicle moves forward (-Z), deltaX = x2 - x1.
    // Three.js forward is -Z, so tan(yaw) = -deltaX / -deltaZ = (x1 - x2) / (2 * delta).
    return Math.atan2(x1 - x2, 2.0 * delta);
  }

  /**
   * Returns road curvature (signed: > 0 for right turn, < 0 for left turn)
   */
  getCurvatureAtZ(z) {
    if (z >= -140.0 || z <= -1020.0) return 0.0;

    const delta = 1.5;
    const a1 = this.getTangentAngleAtZ(z + delta);
    const a2 = this.getTangentAngleAtZ(z - delta);
    return (a1 - a2) / (2.0 * delta);
  }

  /**
   * Returns consistent road width (14.6m = wide 5-lane highway)
   */
  getRoadWidthAtZ(z) {
    return 14.6;
  }

  /**
   * Returns comprehensive track metadata at given Z
   */
  getTrackPoint(z) {
    const x = this.getCenterAtZ(z);
    const angle = this.getTangentAngleAtZ(z);
    const width = this.getRoadWidthAtZ(z);
    const curvature = this.getCurvatureAtZ(z);

    return {
      x,
      z,
      angle,
      width,
      curvature
    };
  }
}
