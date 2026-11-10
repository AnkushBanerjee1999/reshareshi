import { AIRacerController } from '../controllers/AIRacerController.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Grand Prix Race Manager
 *
 * Coordinates:
 * - Starting grid lineup for 7 racers (Player + 6 AI opponents)
 * - 3-2-1-GO starting sequence with audio countdown
 * - Live race leaderboard calculation (1st through 7th)
 * - Track progress & distance remaining
 * - Finish line crossings and final results
 */
export class RaceManager {
  constructor(scene, playerController, audioManager, onFinishCallback) {
    this.scene = scene;
    this.player = playerController;
    this.audio = audioManager;
    this.onFinish = onFinishCallback || (() => {});

    this.trackLength = 1200.0; // Total race distance (m)

    // AI Competitors Configurations
    this.aiConfigs = [
      {
        name: 'Bikash "Storm" Das',
        personality: 'aggressive',
        baseSpeed: 20.5,
        maxSpeed: 27.5,
        accelRate: 13.5,
        overtakeAggression: 0.95,
        canopyColor: '#c0392b',
        canopySecondary: '#f1c40f',
        canopyPattern: 'stripes',
        fringeColor: '#e67e22',
        riderKurtaColor: 0xe74c3c,
        riderLungiColor: 0x2c3e50,
        riderGamchhaColor: 0xf39c12
      },
      {
        name: 'Subhash "Hooghly" Roy',
        personality: 'balanced',
        baseSpeed: 19.0,
        maxSpeed: 25.5,
        accelRate: 11.5,
        overtakeAggression: 0.80,
        canopyColor: '#1a5276',
        canopySecondary: '#5dade2',
        canopyPattern: 'waves',
        fringeColor: '#ecf0f1',
        riderKurtaColor: 0x3498db,
        riderLungiColor: 0x1b4f72,
        riderGamchhaColor: 0xf5b041
      },
      {
        name: 'Gopal "Tollygunge" Sen',
        personality: 'cautious',
        baseSpeed: 18.5,
        maxSpeed: 25.0,
        accelRate: 11.0,
        overtakeAggression: 0.75,
        canopyColor: '#16a085',
        canopySecondary: '#a2d9ce',
        canopyPattern: 'floral',
        fringeColor: '#f9e79f',
        riderKurtaColor: 0x2ecc71,
        riderLungiColor: 0x145a32,
        riderGamchhaColor: 0xe67e22
      },
      {
        name: 'Anirban "Taxi" Ghosh',
        personality: 'overtaker',
        baseSpeed: 20.0,
        maxSpeed: 26.5,
        accelRate: 12.5,
        overtakeAggression: 0.88,
        canopyColor: '#f39c12',
        canopySecondary: '#2c3e50',
        canopyPattern: 'taxi-check',
        fringeColor: '#f1c40f',
        riderKurtaColor: 0xf1c40f,
        riderLungiColor: 0x212f3d,
        riderGamchhaColor: 0xd35400
      },
      {
        name: 'Debu "Dhakuria" Mukherjee',
        personality: 'unpredictable',
        baseSpeed: 19.5,
        maxSpeed: 26.0,
        accelRate: 12.0,
        overtakeAggression: 0.85,
        canopyColor: '#8e44ad',
        canopySecondary: '#f4d03f',
        canopyPattern: 'stripes',
        fringeColor: '#d2b4de',
        riderKurtaColor: 0x9b59b6,
        riderLungiColor: 0x4a235a,
        riderGamchhaColor: 0xe67e22
      },
      {
        name: 'Tarun "Howrah" Banerjee',
        personality: 'speedster',
        baseSpeed: 21.0,
        maxSpeed: 28.0,
        accelRate: 13.0,
        overtakeAggression: 0.90,
        canopyColor: '#e65100',
        canopySecondary: '#ffd600',
        canopyPattern: 'festival',
        fringeColor: '#ffeb3b',
        riderKurtaColor: 0xff7043,
        riderLungiColor: 0xbf360c,
        riderGamchhaColor: 0xffeb3b
      }
    ];

    // Grid Slot Layouts (Staggered rows behind Z = 0)
    this.gridSlots = [
      { x: -2.5, y: 0.0, z: 2.5 },   // AI 1
      { x: 2.5, y: 0.0, z: 2.5 },    // AI 2
      { x: -4.5, y: 0.0, z: 6.5 },   // AI 3
      { x: 0.0, y: 0.0, z: 6.5 },    // Player Slot!
      { x: 4.5, y: 0.0, z: 10.5 },   // AI 4
      { x: -2.0, y: 0.0, z: 10.5 },  // AI 5
      { x: 2.0, y: 0.0, z: 14.5 }    // AI 6
    ];

    // AI Racers collection
    this.aiRacers = [];

    // All Racers in Race (Player + AI)
    this.allRacers = [];

    // Race State
    this.raceActive = false;
    this.countdownTime = 0.0;
    this.countdownStage = 'READY'; // '3', '2', '1', 'GO!', 'RACING'
    this.raceTime = 0.0;
    this.finishingOrder = [];

    this.initRacers();
  }

  initRacers() {
    this.aiRacers = [];
    this.allRacers = [this.player];

    let slotIdx = 0;
    for (let i = 0; i < this.aiConfigs.length; i++) {
      // Slot 3 is reserved for the player!
      if (slotIdx === 3) slotIdx++;

      const config = this.aiConfigs[i];
      const slot = this.gridSlots[slotIdx++];
      config.startPos = { x: slot.x, y: 0, z: slot.z };
      config.startLaneX = slot.x;

      const aiRacer = new AIRacerController(this.scene, config);
      this.aiRacers.push(aiRacer);
      this.allRacers.push(aiRacer);
    }

    // Position player in designated slot
    const playerSlot = this.gridSlots[3];
    this.player.reset(playerSlot);
  }

  startRaceCountdown() {
    this.resetRace();
    this.countdownTime = 3.0;
    this.countdownStage = '3';
    this.raceActive = false;

    // Beep 3
    if (this.audio) this.playCountdownBeep(440);
  }

  playCountdownBeep(freq, duration = 0.22) {
    if (!this.audio || !this.audio.enabled) return;
    this.audio.ensureContext();
    if (!this.audio.ctx) return;

    const t = this.audio.ctx.currentTime;
    const osc = this.audio.ctx.createOscillator();
    const gain = this.audio.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.audio.masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  update(deltaTime, obstacles = []) {
    // 1. Starting Countdown Sequence
    if (this.countdownTime > 0) {
      this.countdownTime -= deltaTime;

      if (this.countdownTime > 2.0) {
        if (this.countdownStage !== '3') {
          this.countdownStage = '3';
          this.playCountdownBeep(440);
        }
      } else if (this.countdownTime > 1.0) {
        if (this.countdownStage !== '2') {
          this.countdownStage = '2';
          this.playCountdownBeep(440);
        }
      } else if (this.countdownTime > 0.0) {
        if (this.countdownStage !== '1') {
          this.countdownStage = '1';
          this.playCountdownBeep(440);
        }
      } else {
        // Countdown reached 0 -> Launch race!
        this.countdownStage = 'GO!';
        this.raceActive = true;
        this.playCountdownBeep(880, 0.45); // High victory start chime!
      }

      // Keep AI racers idle at starting slots
      for (const ai of this.aiRacers) {
        ai.speed = 0.0;
        ai.updateAnimations(deltaTime);
      }

      this.updateRacePositions();
      return;
    }

    if (this.raceActive && this.raceTime >= 1.2 && this.countdownStage === 'GO!') {
      this.countdownStage = 'RACING';
    }

    if (!this.raceActive) return;

    this.raceTime += deltaTime;

    // 2. Update AI Racers
    const raceContext = {
      allRacers: this.allRacers,
      obstacles
    };

    for (const ai of this.aiRacers) {
      ai.update(deltaTime, raceContext);

      // Check AI finish line (-1200m)
      if (!ai.finished && ai.mesh.position.z <= -this.trackLength) {
        ai.finished = true;
        ai.finishTime = this.raceTime;
        this.finishingOrder.push(ai);
      }
    }

    // Check Player finish line
    if (!this.player.finished && this.player.mesh.position.z <= -this.trackLength) {
      this.player.finished = true;
      this.player.finishTime = this.raceTime;
      this.finishingOrder.push(this.player);

      // Trigger race finish
      this.onFinish({
        playerRank: this.player.rank,
        raceTime: this.raceTime,
        distance: this.trackLength,
        coins: this.player.runCoins || 0,
        isWinner: this.player.rank === 1
      });
    }

    // 3. Dynamic Live Race Position Sorting
    this.updateRacePositions();
  }

  updateRacePositions() {
    // Sort all racers by distance traveled along track (-position.z)
    // Greater distance = more negative Z = further ahead!
    this.allRacers.sort((a, b) => b.raceDistance - a.raceDistance);

    for (let i = 0; i < this.allRacers.length; i++) {
      this.allRacers[i].rank = i + 1;
    }
  }

  getRaceStats() {
    const playerDist = Math.max(0, this.player.raceDistance);
    const progressPct = Math.min(100, (playerDist / this.trackLength) * 100);
    const distRemaining = Math.max(0, this.trackLength - playerDist);

    return {
      rank: this.player.rank,
      totalRacers: this.allRacers.length,
      progressPct: Math.round(progressPct),
      distanceTraveled: Math.round(playerDist),
      distanceRemaining: Math.round(distRemaining),
      trackLength: this.trackLength,
      raceTime: this.raceTime,
      countdownStage: this.countdownStage,
      isCountdown: this.countdownTime > 0 || this.countdownStage === 'GO!'
    };
  }

  resetRace() {
    this.raceActive = false;
    this.raceTime = 0.0;
    this.finishingOrder = [];
    this.countdownTime = 0.0;
    this.countdownStage = 'READY';

    // Reset player position
    const playerSlot = this.gridSlots[3];
    this.player.reset(playerSlot);

    // Reset AI racers
    let slotIdx = 0;
    for (let i = 0; i < this.aiRacers.length; i++) {
      if (slotIdx === 3) slotIdx++;
      const slot = this.gridSlots[slotIdx++];
      this.aiRacers[i].reset(slot);
    }

    this.updateRacePositions();
  }

  dispose() {
    for (const ai of this.aiRacers) {
      ai.dispose();
    }
    this.aiRacers = [];
    this.allRacers = [];
  }
}

