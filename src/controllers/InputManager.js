/**
 * Cycle Rush: Kolkata Alleyways
 * Keyboard and Input Management
 */

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.justPressedKeys = new Set();
    
    // Tap detection for cadence sprint
    this.lastPedalPressTime = 0;
    this.pedalTapCadence = 0; // Taps per second boost
    this.rapidTapActive = false;
    this.rapidTapTimer = 0;

    // Bound listeners for clean destruction
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this._onBlur = this.onBlur.bind(this);

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  unbindEvents() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    this.reset();
  }

  onKeyDown(event) {
    const code = event.code;
    
    // Prevent default scroll behavior for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
      event.preventDefault();
    }

    if (!this.keys.has(code)) {
      this.justPressedKeys.add(code);
    }
    this.keys.add(code);

    // Check rapid pedal tap
    if (code === 'KeyW' || code === 'ArrowUp') {
      const now = performance.now();
      const delta = now - this.lastPedalPressTime;
      if (delta > 60 && delta < 380) {
        // Double/rapid tap detected!
        this.rapidTapActive = true;
        this.rapidTapTimer = 0.45; // Active for 450ms
      }
      this.lastPedalPressTime = now;
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  onBlur() {
    this.reset();
  }

  update(deltaTime) {
    if (this.rapidTapActive) {
      this.rapidTapTimer -= deltaTime;
      if (this.rapidTapTimer <= 0) {
        this.rapidTapActive = false;
      }
    }
  }

  /**
   * Clears single-frame impulse keys. Must be called at end of frame update.
   */
  clearFrame() {
    this.justPressedKeys.clear();
  }

  reset() {
    this.keys.clear();
    this.justPressedKeys.clear();
    this.rapidTapActive = false;
    this.rapidTapTimer = 0;
  }

  // Continuous key states
  isPedaling() {
    return this.keys.has('KeyW') || this.keys.has('ArrowUp');
  }

  isBraking() {
    return this.keys.has('KeyS') || this.keys.has('ArrowDown');
  }

  isSteeringLeft() {
    return this.keys.has('KeyA') || this.keys.has('ArrowLeft');
  }

  isSteeringRight() {
    return this.keys.has('KeyD') || this.keys.has('ArrowRight');
  }

  isSprinting() {
    return (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.rapidTapActive) && this.isPedaling();
  }

  // Single-frame triggers
  isBoostTriggered() {
    return this.justPressedKeys.has('KeyE');
  }

  isBellTriggered() {
    return this.justPressedKeys.has('Space');
  }

  isPauseTriggered() {
    return this.justPressedKeys.has('Escape') || this.justPressedKeys.has('KeyP');
  }

  isRestartTriggered() {
    return this.justPressedKeys.has('KeyR');
  }

  getSteerAxis() {
    let steer = 0;
    if (this.isSteeringLeft()) steer -= 1;
    if (this.isSteeringRight()) steer += 1;
    return steer;
  }
}

