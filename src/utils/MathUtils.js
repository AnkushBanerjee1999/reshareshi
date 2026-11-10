/**
 * Cycle Rush: Kolkata Alleyways
 * Math Utilities
 */

export const MathUtils = {
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  lerp(start, end, alpha) {
    return start + (end - start) * alpha;
  },

  /**
   * Frame-rate independent exponential damping.
   * lambda controls speed of convergence.
   */
  damp(current, target, lambda, dt) {
    return MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
  },

  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  },

  radToDeg(radians) {
    return radians * (180 / Math.PI);
  },

  /**
   * Checks 2D Circle-Circle or Circle-AABB collision in X-Z plane.
   */
  checkCircleOverlap(x1, z1, r1, x2, z2, r2) {
    const dx = x1 - x2;
    const dz = z1 - z2;
    const distSq = dx * dx + dz * dz;
    const radSum = r1 + r2;
    return distSq <= radSum * radSum;
  },

  /**
   * 2D AABB overlap check in X-Z plane.
   */
  checkAABBOverlap(minA, maxA, minB, maxB) {
    return (
      minA.x <= maxB.x &&
      maxA.x >= minB.x &&
      minA.z <= maxB.z &&
      maxA.z >= minB.z
    );
  }
};

