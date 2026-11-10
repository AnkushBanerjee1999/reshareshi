/**
 * Cycle Rush: Kolkata Alleyways
 * Core Game Loop and Delta Time Coordinator
 */
export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;

    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.rafId = null;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now(); // Avoid huge delta spike
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const rawDelta = (currentTime - this.lastTime) / 1000.0;
    this.lastTime = currentTime;

    // Clamp delta time to maximum 0.1s to avoid physics penetration on lag spikes
    const deltaTime = Math.min(0.1, Math.max(0.001, rawDelta));

    if (!this.isPaused) {
      if (this.updateFn) {
        this.updateFn(deltaTime);
      }
    }

    // Always render so scene/menus remain visible
    if (this.renderFn) {
      this.renderFn(deltaTime);
    }

    this.rafId = requestAnimationFrame(this.loop);
  }
}

