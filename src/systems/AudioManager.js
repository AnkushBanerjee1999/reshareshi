/**
 * Cycle Rush: Kolkata Alleyways
 * Web Audio API Manager & Sound Synthesizer
 */

export class AudioManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
    this.enabled = this.saveManager ? this.saveManager.isSoundEnabled() : true;
    this.ctx = null;
    this.masterGain = null;
    
    // Looping sound nodes
    this.pedalLoopNode = null;
    this.pedalGainNode = null;
    this.windGainNode = null;
    this.boostSoundGain = null;
    
    // Music state
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;

    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported in this browser.');
        return;
      }
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.enabled ? 0.75 : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create ambient wind whoosh
      this.initWindSynth();

      // Create pedal ratchet sound
      this.initPedalSynth();

      this.initialized = true;
    } catch (err) {
      console.warn('Could not initialize AudioContext:', err);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.saveManager) {
      this.saveManager.setSoundEnabled(this.enabled);
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? 0.75 : 0, this.ctx.currentTime);
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // ==========================================
  // PROCEDURAL SOUND SYNTHESIZERS
  // ==========================================

  /**
   * Traditional Kolkata "Tring-Tring" brass cycle bell
   */
  playBell() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Two quick strikes: 0ms and 110ms
    this.createBellStrike(t, 2480, 3120);
    this.createBellStrike(t + 0.11, 2520, 3180);
  }

  createBellStrike(startTime, freq1, freq2) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq2, startTime);

    // Fast brass ping decay
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.45, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.3);
    osc2.stop(startTime + 0.3);
  }

  /**
   * Coin collection sparkle (ascending pentatonic notes)
   */
  playCoin() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Refreshing Masala Chai / Daab Coconut collection
   */
  playRefreshment() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Resonant refreshing chime
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D, F#, A, D
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.36);
    });
  }

  /**
   * Energy Boost activation surge
   */
  playBoost() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.6);

    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.6);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.25);
  }

  /**
   * Obstacle collision crunch & brake screech
   */
  playCollision(severity = 1.0) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Low impact thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);

    oscGain.gain.setValueAtTime(0.6 * severity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.32);

    // 2. Metal scrape noise burst
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 2.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * severity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Pothole bump jolt
   */
  playPothole() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // ==========================================
  // CONTINUOUS / VEHICLE SOUNDS
  // ==========================================

  initWindSynth() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;

    this.windGainNode = this.ctx.createGain();
    this.windGainNode.gain.value = 0;

    whiteNoise.connect(filter);
    filter.connect(this.windGainNode);
    this.windGainNode.connect(this.masterGain);

    whiteNoise.start(0);
  }

  initPedalSynth() {
    if (!this.ctx) return;
    this.pedalGainNode = this.ctx.createGain();
    this.pedalGainNode.gain.value = 0;
    this.pedalGainNode.connect(this.masterGain);
    this.lastClickTime = 0;
  }

  /**
   * Updates continuous vehicle sounds based on speed and boost
   */
  updateVehicleSounds(speed, maxSpeed, isPedaling, isBoosting) {
    if (!this.ctx || !this.enabled) return;

    const normalizedSpeed = Math.min(1.0, Math.max(0, speed / maxSpeed));

    // Wind volume increases with speed
    if (this.windGainNode) {
      const targetGain = normalizedSpeed * 0.25 + (isBoosting ? 0.25 : 0);
      this.windGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    // Pedal chain clicks
    if (isPedaling && speed > 1.0) {
      const interval = Math.max(0.08, 0.35 - normalizedSpeed * 0.24);
      const now = this.ctx.currentTime;
      if (now - this.lastClickTime > interval) {
        this.playChainClick();
        this.lastClickTime = now;
      }
    }
  }

  playChainClick() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650 + Math.random() * 150, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  // ==========================================
  // AMBIENT KOLKATA STREET MUSIC (Procedural Raga)
  // ==========================================

  startMusic() {
    if (this.musicPlaying) return;
    this.ensureContext();
    this.musicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  scheduleMusicStep() {
    if (!this.musicPlaying || !this.ctx || !this.enabled) {
      this.musicTimer = setTimeout(() => this.scheduleMusicStep(), 250);
      return;
    }

    // Pentatonic Indian raga notes (Khamaj / Desh scale) in Hz
    // Root D = 293.66 Hz
    const scale = [
      293.66, // D4
      329.63, // E4
      369.99, // F#4
      440.00, // A4
      493.88, // B4
      587.33, // D5
      659.25  // E5
    ];

    // Soft melody note every 2nd or 3rd beat
    if (this.musicStep % 2 === 0 && Math.random() > 0.25) {
      const noteFreq = scale[Math.floor(Math.random() * scale.length)];
      this.playPluckNote(noteFreq, 0.12, 0.45);
    }

    // Soft tabla / rhythm pulse every beat
    if (this.musicStep % 4 === 0) {
      this.playTablaBeat(110, 0.18); // Dayan / Bayan bass pulse
    } else if (this.musicStep % 2 === 0) {
      this.playTablaBeat(220, 0.09); // Tap pulse
    }

    this.musicStep = (this.musicStep + 1) % 16;
    this.musicTimer = setTimeout(() => this.scheduleMusicStep(), 200);
  }

  playPluckNote(freq, volume, duration) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  playTablaBeat(freq, volume) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.12);

    gain.gain.setValueAtTime(volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }
}

