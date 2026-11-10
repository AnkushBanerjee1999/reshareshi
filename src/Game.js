import { GAME_STATES } from './utils/Constants.js';
import { World } from './world/World.js';
import { SaveManager } from './systems/SaveManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { InputManager } from './controllers/InputManager.js';
import { RickshawController } from './controllers/RickshawController.js';
import { CameraController } from './controllers/CameraController.js';
import { RaceTrack } from './world/RaceTrack.js';
import { ObstacleManager } from './systems/ObstacleManager.js';
import { CollectibleManager } from './systems/CollectibleManager.js';
import { RaceManager } from './systems/RaceManager.js';
import { RacingCollisionSystem } from './systems/RacingCollisionSystem.js';
import { UIManager } from './ui/UIManager.js';
import { GameLoop } from './GameLoop.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Main Racing Game Coordinator & State Machine
 */
export class Game {
  constructor(canvasContainer, uiContainer) {
    this.canvasContainer = canvasContainer;
    this.uiContainer = uiContainer;

    this.state = GAME_STATES.MENU;

    // Run Stats
    this.score = 0.0;
    this.runCoins = 0;

    // 1. Core Systems
    this.saveManager = new SaveManager();
    this.audio = new AudioManager(this.saveManager);
    this.input = new InputManager();
    this.world = new World(this.canvasContainer);

    // 2. Player Rickshaw
    const initialCanopy = this.saveManager.getSelectedCanopy();
    this.rickshaw = new RickshawController(this.world.scene, this.input, this.audio, {
      selectedCanopy: initialCanopy
    });

    // 3. Camera
    this.cameraController = new CameraController(this.world.camera, this.rickshaw);
    this.cameraController.setMode('MENU');
    this.rickshaw.setCameraController(this.cameraController);

    // 4. Structured 1200m Race Track
    this.raceTrack = new RaceTrack(this.world.scene);

    // 5. Obstacles & Collectibles
    this.obstacleManager = new ObstacleManager(this.world.scene);
    this.collectibleManager = new CollectibleManager(this.world.scene, this.audio);

    // 6. Race Manager (6 AI Competitors + Player = 7 Racers, 3-2-1-GO Sequence)
    this.raceManager = new RaceManager(
      this.world.scene,
      this.rickshaw,
      this.audio,
      this.handleRaceFinish.bind(this)
    );

    // 7. Racing Collision System
    this.collisionSystem = new RacingCollisionSystem(
      this.raceManager,
      this.obstacleManager,
      this.collectibleManager,
      this.cameraController,
      this.audio,
      this.handleCollisionEvent.bind(this)
    );

    // 8. Master UI
    this.ui = new UIManager(this.uiContainer, this.saveManager, this.rickshaw, {
      onStartPlay: () => this.startRace(),
      onOpenGarage: () => this.openGarage(),
      onExitGarage: () => this.exitGarage(),
      onPauseToggle: () => this.togglePause(),
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartRace(),
      onExitToMenu: () => this.exitToMenu(),
      onToggleSound: () => this.audio.toggle()
    });

    // 9. Animation Game Loop
    this.loop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.setState(GAME_STATES.MENU);
    this.audio.startMusic();
    this.loop.start();
  }

  setState(newState, payload = {}) {
    this.state = newState;

    if (newState === GAME_STATES.MENU) {
      this.cameraController.setMode('MENU');
      this.raceManager.resetRace();
    } else if (newState === GAME_STATES.PLAYING) {
      this.cameraController.setMode('CHASE');
    } else if (newState === GAME_STATES.GARAGE) {
      this.cameraController.setMode('GARAGE');
    } else if (newState === GAME_STATES.GAME_OVER) {
      this.cameraController.setMode('MENU');
    }

    this.ui.setGameState(newState, payload);
  }

  startRace() {
    this.audio.ensureContext();
    this.score = 0.0;
    this.runCoins = 0;

    // Reset Track & Props
    this.raceTrack.init();
    this.obstacleManager.clear();
    this.collectibleManager.clear();

    // Line up racers on starting grid & start 3-2-1-GO countdown!
    this.raceManager.startRaceCountdown();

    this.setState(GAME_STATES.PLAYING);
    this.cameraController.snapToTarget();
  }

  restartRace() {
    this.loop.resume();
    this.startRace();
  }

  openGarage() {
    this.audio.ensureContext();
    this.setState(GAME_STATES.GARAGE);
  }

  exitGarage() {
    this.setState(GAME_STATES.MENU);
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.setState(GAME_STATES.PAUSED);
      this.loop.pause();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state === GAME_STATES.PAUSED) {
      this.setState(GAME_STATES.PLAYING);
      this.loop.resume();
    }
  }

  exitToMenu() {
    this.loop.resume();
    this.setState(GAME_STATES.MENU);
  }

  handleRaceFinish(results) {
    // Calculate final score based on placement and time
    // 1st place gives +5000 bonus!
    const rankBonus = Math.max(0, (8 - results.playerRank) * 1000);
    const finalScore = this.score + rankBonus;

    const isNewHigh = this.saveManager.recordScore(finalScore);
    this.saveManager.addCoins(this.runCoins);
    this.saveManager.addDistance(results.distance);

    this.setState(GAME_STATES.GAME_OVER, {
      playerRank: results.playerRank,
      totalRacers: this.raceManager.allRacers.length,
      raceTime: results.raceTime,
      distance: results.distance,
      coins: this.runCoins,
      score: finalScore,
      isNewHigh
    });
  }

  handleCollisionEvent(event) {
    if (event.type === 'obstacle_hit') {
      const penalty = event.penalty || 20;
      this.score = Math.max(0, this.score - penalty);
      this.ui.showHUDNotification(event.message, 'warning', 2000);
    } else if (event.type === 'collectible_pickup') {
      const col = event.collectible;
      this.score += col.points;

      if (col.type === 'coin') {
        this.runCoins += 1;
        this.ui.showHUDNotification('+1 Brass Coin! (100 pts)', 'success', 1200);
      } else if (col.type === 'chai') {
        this.ui.showHUDNotification('Chilled Chai! +35 Boost Energy!', 'success', 1800);
      } else if (col.type === 'coconut') {
        this.ui.showHUDNotification('Fresh Daab! +55 Boost Energy!', 'success', 1800);
      }
    }
  }

  update(deltaTime) {
    if (this.input.isPauseTriggered()) {
      this.togglePause();
      this.input.clearFrame();
      return;
    }

    if (this.state === GAME_STATES.GAME_OVER && this.input.isRestartTriggered()) {
      this.restartRace();
      this.input.clearFrame();
      return;
    }

    if (this.state === GAME_STATES.PLAYING) {
      this.updatePlaying(deltaTime);
    } else if (this.state === GAME_STATES.GARAGE || this.state === GAME_STATES.MENU) {
      this.cameraController.update(deltaTime);
    }

    this.input.clearFrame();
  }

  updatePlaying(deltaTime) {
    const playerPos = this.rickshaw.mesh.position;

    // 1. Race Manager handles Countdown & AI racers
    const obstacles = this.obstacleManager.getActiveObstacles();
    this.raceManager.update(deltaTime, obstacles);

    // 2. Player movement (active once countdown reaches "GO!")
    if (!this.raceManager.raceActive) {
      this.rickshaw.speed = 0.0;
    }
    this.rickshaw.update(deltaTime);

    if (this.raceManager.raceActive) {
      // Score increases with forward progress and speed
      const speedMultiplier = 1.0 + (this.rickshaw.speed / 18.0);
      this.score += this.rickshaw.speed * deltaTime * 5 * speedMultiplier;
    }

    // 3. Update Camera
    this.cameraController.update(deltaTime);

    // 4. Update Sunlight Position
    this.world.update(playerPos.z);

    // 5. Update Race Track Chunks
    this.raceTrack.update(playerPos.z);

    // 6. Update Dynamic Obstacles & Collectibles
    const isBellActive = this.rickshaw.isBellScareActive();
    this.obstacleManager.update(deltaTime, playerPos, isBellActive);
    this.collectibleManager.update(deltaTime, playerPos);

    // 7. Racing Collisions (Racer-to-Racer bumping + Obstacles)
    this.collisionSystem.update(deltaTime);

    // 8. Update Racing HUD
    const raceStats = this.raceManager.getRaceStats();
    this.ui.updateHUD({
      rank: raceStats.rank,
      totalRacers: raceStats.totalRacers,
      progressPct: raceStats.progressPct,
      distanceTraveled: raceStats.distanceTraveled,
      distanceRemaining: raceStats.distanceRemaining,
      trackLength: raceStats.trackLength,
      raceTime: raceStats.raceTime,
      countdownStage: raceStats.countdownStage,
      isCountdown: raceStats.isCountdown,
      score: this.score,
      coins: this.runCoins,
      speed: this.rickshaw.speed,
      stamina: this.rickshaw.stamina,
      boostEnergy: this.rickshaw.boostEnergy,
      isBoosting: this.rickshaw.isBoosting
    });
  }

  render(deltaTime) {
    this.world.render();
  }
}
