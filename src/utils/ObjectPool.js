/**
 * Cycle Rush: Kolkata Alleyways
 * Object Pooling Utility
 */

export class ObjectPool {
  /**
   * @param {Function} createFn - Factory function that returns a new item.
   * @param {Function} resetFn - Function to reset an item before returning to pool or reusing.
   * @param {number} initialSize - Initial count of pre-warmed items.
   */
  constructor(createFn, resetFn = null, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = new Set();

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get() {
    let item;
    if (this.pool.length > 0) {
      item = this.pool.pop();
    } else {
      item = this.createFn();
    }

    if (this.resetFn) {
      this.resetFn(item);
    }
    this.active.add(item);
    return item;
  }

  release(item) {
    if (this.active.has(item)) {
      this.active.delete(item);
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.pool.push(item);
    }
  }

  releaseAll() {
    for (const item of this.active) {
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.pool.push(item);
    }
    this.active.clear();
  }

  getActiveItems() {
    return Array.from(this.active);
  }
}

