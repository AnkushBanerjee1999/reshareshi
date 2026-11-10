import { GAME_STATES } from '../utils/Constants.js';
import { HUD } from './HUD.js';
import { MainMenu } from './MainMenu.js';
import { Garage } from './Garage.js';
import { GameOverScreen } from './GameOverScreen.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Master UI & Screen Flow Manager
 */
export class UIManager {
  constructor(container, saveManager, rickshawController, callbacks = {}) {
    this.container = container;
    this.saveManager = saveManager;
    this.rickshaw = rickshawController;
    this.callbacks = callbacks;

    // Create sub-screens
    this.hud = new HUD(this.container);
    this.mainMenu = new MainMenu(this.container, {
      onPlay: () => this.callbacks.onStartPlay && this.callbacks.onStartPlay(),
      onGarage: () => this.callbacks.onOpenGarage && this.callbacks.onOpenGarage(),
      onHowToPlay: () => this.showHowToPlay(),
      onToggleSound: () => this.callbacks.onToggleSound && this.callbacks.onToggleSound()
    });

    this.garage = new Garage(this.container, this.saveManager, this.rickshaw, {
      onBack: () => this.callbacks.onExitGarage && this.callbacks.onExitGarage()
    });

    this.gameOverScreen = new GameOverScreen(this.container, {
      onRestart: () => this.callbacks.onRestart && this.callbacks.onRestart(),
      onMenu: () => this.callbacks.onExitToMenu && this.callbacks.onExitToMenu()
    });

    // Build Pause & How-to-play Overlays
    this.buildPauseOverlay();
    this.buildHowToPlayOverlay();

    // Hook HUD pause button
    if (this.hud.pauseBtn) {
      this.hud.pauseBtn.addEventListener('click', () => {
        if (this.callbacks.onPauseToggle) this.callbacks.onPauseToggle();
      });
    }
  }

  buildPauseOverlay() {
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.className = 'game-screen pause-screen hidden';
    this.pauseOverlay.innerHTML = `
      <div class="pause-box">
        <h2 class="pause-title">GAME PAUSED</h2>
        <p class="pause-sub">Take a sip of chai!</p>

        <div class="pause-buttons">
          <button class="arcade-btn btn-resume" id="btn-pause-resume">
            <span class="btn-text">RESUME RIDE</span>
          </button>

          <button class="arcade-btn btn-pause-restart" id="btn-pause-restart">
            <span class="btn-text">RESTART [R]</span>
          </button>

          <button class="arcade-btn btn-pause-sound" id="btn-pause-sound">
            <span class="btn-text" id="pause-sound-text">SOUND: ON</span>
          </button>

          <button class="arcade-btn btn-pause-menu" id="btn-pause-menu">
            <span class="btn-text">MAIN MENU</span>
          </button>
        </div>
      </div>
    `;
    this.container.appendChild(this.pauseOverlay);

    this.pauseResumeBtn = this.pauseOverlay.querySelector('#btn-pause-resume');
    this.pauseRestartBtn = this.pauseOverlay.querySelector('#btn-pause-restart');
    this.pauseSoundBtn = this.pauseOverlay.querySelector('#btn-pause-sound');
    this.pauseSoundText = this.pauseOverlay.querySelector('#pause-sound-text');
    this.pauseMenuBtn = this.pauseOverlay.querySelector('#btn-pause-menu');

    this.pauseResumeBtn.addEventListener('click', () => {
      if (this.callbacks.onResume) this.callbacks.onResume();
    });

    this.pauseRestartBtn.addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    this.pauseSoundBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleSound) {
        const soundEnabled = this.callbacks.onToggleSound();
        this.updatePauseSoundText(soundEnabled);
      }
    });

    this.pauseMenuBtn.addEventListener('click', () => {
      if (this.callbacks.onExitToMenu) this.callbacks.onExitToMenu();
    });
  }

  buildHowToPlayOverlay() {
    this.howOverlay = document.createElement('div');
    this.howOverlay.className = 'game-screen how-screen hidden';
    this.howOverlay.innerHTML = `
      <div class="how-box">
        <div class="how-header">
          <h2 class="how-title">HOW TO RACE - GRAND PRIX</h2>
          <button class="how-close-btn" id="btn-how-close">✕</button>
        </div>

        <div class="how-content-scroll">
          <div class="controls-guide-grid">
            <div class="control-key-card">
              <span class="key-tag">W or ↑</span>
              <div class="key-info">
                <strong>Pedal Forward</strong>
                <span>Tap or hold to accelerate forward. Double-tap for sudden cadence bursts!</span>
              </div>
            </div>

            <div class="control-key-card">
              <span class="key-tag">Shift</span>
              <div class="key-info">
                <strong>Sprint Pedal</strong>
                <span>Burn stamina to hit top racing speed and overtake rival competitors.</span>
              </div>
            </div>

            <div class="control-key-card">
              <span class="key-tag">A / D or ← / →</span>
              <div class="key-info">
                <strong>Steer & Lane Change</strong>
                <span>Weave between 5 lanes to pass opponents and dodge street obstacles.</span>
              </div>
            </div>

            <div class="control-key-card">
              <span class="key-tag">S or ↓</span>
              <div class="key-info">
                <strong>Hand Brake</strong>
                <span>Slow down quickly to avoid pileups, cows, and police barricades.</span>
              </div>
            </div>

            <div class="control-key-card highlight-card">
              <span class="key-tag">Spacebar</span>
              <div class="key-info">
                <strong>Tring-Tring Brass Bell 🔔</strong>
                <span>Ring to scare crossing pedestrians and make them scurry out of your lane!</span>
              </div>
            </div>

            <div class="control-key-card highlight-card">
              <span class="key-tag">E</span>
              <div class="key-info">
                <strong>N₂O Energy Boost 🔥</strong>
                <span>Collect Chilled Chai & Daab Coconut to unleash a surging nitro speed wave!</span>
              </div>
            </div>

            <div class="control-key-card">
              <span class="key-tag">Esc / P</span>
              <div class="key-info">
                <strong>Pause Game</strong>
                <span>Pause race anytime.</span>
              </div>
            </div>

            <div class="control-key-card">
              <span class="key-tag">R</span>
              <div class="key-info">
                <strong>Quick Restart</strong>
                <span>Instantly restart race from starting grid.</span>
              </div>
            </div>
          </div>

          <div class="how-tips-section">
            <h3>PRO RACING TACTICS:</h3>
            <ul>
              <li><strong>The 1200m Sprint:</strong> Race against 6 rival Kolkata cycle rickshaws from the starting line to the grand finish line!</li>
              <li><strong>Overtaking Strategy:</strong> Time your lane switches to slipstream past slower rivals on open lanes.</li>
              <li><strong>Racer Bumping:</strong> Side-by-side contact nudges racers laterally—defend your lane and hold your line!</li>
              <li><strong>Stamina Pacing:</strong> Save sprint bursts for overtaking maneuvers and the final 200m sprint to the checkered flag!</li>
            </ul>
          </div>
        </div>

        <button class="arcade-btn btn-how-ok" id="btn-how-ok">READY TO RACE!</button>
      </div>
    `;
    this.container.appendChild(this.howOverlay);

    const closeBtn = this.howOverlay.querySelector('#btn-how-close');
    const okBtn = this.howOverlay.querySelector('#btn-how-ok');

    closeBtn.addEventListener('click', () => this.hideHowToPlay());
    okBtn.addEventListener('click', () => this.hideHowToPlay());
  }

  showHowToPlay() {
    this.howOverlay.classList.remove('hidden');
  }

  hideHowToPlay() {
    this.howOverlay.classList.add('hidden');
  }

  updatePauseSoundText(enabled) {
    if (this.pauseSoundText) {
      this.pauseSoundText.textContent = `SOUND: ${enabled ? 'ON' : 'MUTED'}`;
    }
  }

  setGameState(state, payload = {}) {
    // Hide all overlays first
    this.mainMenu.hide();
    this.garage.hide();
    this.hud.hide();
    this.gameOverScreen.hide();
    this.pauseOverlay.classList.add('hidden');
    this.howOverlay.classList.add('hidden');

    switch (state) {
      case GAME_STATES.MENU:
        this.mainMenu.update(this.saveManager.data);
        this.mainMenu.show();
        break;

      case GAME_STATES.PLAYING:
        this.hud.show();
        break;

      case GAME_STATES.PAUSED:
        this.hud.show();
        this.updatePauseSoundText(this.saveManager.isSoundEnabled());
        this.pauseOverlay.classList.remove('hidden');
        break;

      case GAME_STATES.GAME_OVER:
        this.gameOverScreen.show(payload);
        break;

      case GAME_STATES.GARAGE:
        this.garage.show();
        break;

      case GAME_STATES.HOW_TO_PLAY:
        this.showHowToPlay();
        break;
    }
  }

  updateHUD(stats) {
    this.hud.update(stats);
  }

  showHUDNotification(message, type) {
    this.hud.showNotification(message, type);
  }
}

