/**
 * Cycle Rush: Kolkata Alleyways
 * Arcade Racing Heads-Up Display (HUD)
 *
 * Displays:
 * - Live Race Position (e.g. 1st / 7)
 * - Race Progress % & Distance Remaining (e.g. 450m / 1200m)
 * - Large 3-2-1-GO Starting Countdown
 * - Speedometer, Stamina, Boost, Coins & Score
 */
export class HUD {
  constructor(container) {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'game-hud hidden';
    this.container.appendChild(this.root);

    this.bannerTimer = null;
    this.lastCountdownStage = null;
    this.buildHTML();
  }

  buildHTML() {
    this.root.innerHTML = `
      <!-- Large Center Starting Countdown -->
      <div class="hud-countdown hidden" id="hud-countdown">3</div>

      <!-- Top Racing Status Bar -->
      <div class="hud-top-bar">
        <!-- Live Position Badge -->
        <div class="hud-stat-box position-box">
          <span class="hud-label">POSITION</span>
          <span class="hud-val position-val" id="hud-position">1st / 7</span>
        </div>

        <!-- Race Progress & Distance -->
        <div class="hud-stat-box progress-box">
          <div class="progress-info-row">
            <span class="hud-label">RACE PROGRESS</span>
            <span class="hud-val-small" id="hud-progress-pct">0%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="hud-progress-fill" style="width: 0%;"></div>
          </div>
          <span class="distance-remaining" id="hud-distance-text">0m / 1200m</span>
        </div>

        <!-- Race Timer -->
        <div class="hud-stat-box timer-box">
          <span class="hud-label">TIME</span>
          <span class="hud-val" id="hud-timer">00:00.0</span>
        </div>

        <!-- Coins -->
        <div class="hud-stat-box coins-box">
          <span class="hud-coin-icon">🪙</span>
          <span class="hud-val" id="hud-coins">0</span>
        </div>

        <!-- Pause Button -->
        <button class="hud-pause-btn" id="hud-pause-btn" title="Pause Game (Esc)">⏸</button>
      </div>

      <!-- Center Road Banner for Alerts -->
      <div class="hud-banner" id="hud-banner"></div>

      <!-- Minimalist Bottom Cluster: Subtle Speedometer + Centered Glowing N2O Indicator -->
      <div class="hud-minimal-cluster">
        <div class="minimal-speed" id="hud-speed-wrapper">
          <span class="speed-number" id="hud-speed">0</span>
          <span class="speed-unit">km/h</span>
        </div>

        <div class="minimal-n2o-container" id="hud-n2o-container">
          <div class="n2o-header">
            <span class="n2o-label">N₂O</span>
            <span class="n2o-val" id="hud-boost-text">0%</span>
          </div>
          <div class="n2o-track">
            <div class="n2o-fill" id="hud-boost-bar" style="width: 0%;"></div>
          </div>
        </div>
      </div>
    `;

    // Cache elements
    this.countdownEl = this.root.querySelector('#hud-countdown');
    this.positionEl = this.root.querySelector('#hud-position');
    this.progressPctEl = this.root.querySelector('#hud-progress-pct');
    this.progressFillEl = this.root.querySelector('#hud-progress-fill');
    this.distanceTextEl = this.root.querySelector('#hud-distance-text');
    this.timerEl = this.root.querySelector('#hud-timer');
    this.coinsEl = this.root.querySelector('#hud-coins');
    this.speedEl = this.root.querySelector('#hud-speed');
    this.speedWrapper = this.root.querySelector('#hud-speed-wrapper');
    this.n2oContainer = this.root.querySelector('#hud-n2o-container');
    this.boostBar = this.root.querySelector('#hud-boost-bar');
    this.boostText = this.root.querySelector('#hud-boost-text');
    this.staminaBar = null;
    this.staminaText = null;
    this.boostHint = null;
    this.bannerEl = this.root.querySelector('#hud-banner');
    this.pauseBtn = this.root.querySelector('#hud-pause-btn');
  }

  show() {
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
  }

  update(stats) {
    // 1. Race Position (e.g. "1st / 7")
    if (this.positionEl && stats.rank) {
      const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th'];
      const suf = (stats.rank <= 3) ? suffixes[stats.rank] : 'th';
      this.positionEl.textContent = `${stats.rank}${suf} / ${stats.totalRacers || 7}`;

      if (stats.rank === 1) {
        this.positionEl.style.color = '#f1c40f'; // Gold
      } else if (stats.rank === 2) {
        this.positionEl.style.color = '#ecf0f1'; // Silver
      } else if (stats.rank === 3) {
        this.positionEl.style.color = '#e67e22'; // Bronze
      } else {
        this.positionEl.style.color = '#ffffff';
      }
    }

    // 2. Race Progress & Distance
    if (this.progressPctEl) this.progressPctEl.textContent = `${stats.progressPct || 0}%`;
    if (this.progressFillEl) this.progressFillEl.style.width = `${stats.progressPct || 0}%`;
    if (this.distanceTextEl) {
      this.distanceTextEl.textContent = `${stats.distanceTraveled || 0}m / ${stats.trackLength || 1200}m`;
    }

    // 3. Race Timer
    if (this.timerEl && typeof stats.raceTime === 'number') {
      const mins = Math.floor(stats.raceTime / 60);
      const secs = (stats.raceTime % 60).toFixed(1).padStart(4, '0');
      this.timerEl.textContent = `${String(mins).padStart(2, '0')}:${secs}`;
    }

    // 4. Starting Countdown
    if (this.countdownEl) {
      if (stats.isCountdown && stats.countdownStage) {
        this.countdownEl.classList.remove('hidden');
        if (this.lastCountdownStage !== stats.countdownStage) {
          this.lastCountdownStage = stats.countdownStage;
          this.countdownEl.textContent = stats.countdownStage;
          if (stats.countdownStage === 'GO!') {
            this.countdownEl.className = 'hud-countdown go';
          } else {
            this.countdownEl.className = 'hud-countdown';
          }
          // Force CSS animation restart for each number
          this.countdownEl.style.animation = 'none';
          void this.countdownEl.offsetWidth;
          this.countdownEl.style.animation = '';
        }
      } else {
        this.lastCountdownStage = null;
        this.countdownEl.classList.add('hidden');
      }
    }

    // 5. Coins & Speedometer (Clean, Minimal, Subtle)
    if (this.coinsEl) this.coinsEl.textContent = stats.coins || 0;
    const kmh = Math.round((stats.speed || 0) * 3.6);
    if (this.speedEl) this.speedEl.textContent = kmh;

    // 6. N2O / Nitrous Gauge & Glow Effect
    const boostPct = Math.max(0, Math.min(100, Math.round(stats.boostEnergy || 0)));
    if (this.boostBar) {
      this.boostBar.style.width = `${boostPct}%`;
    }
    if (this.boostText) {
      this.boostText.textContent = `${boostPct}%`;
    }

    // Glowing N2O indicator at bottom-mid when boosting
    const isBoosting = !!stats.isBoosting;
    if (this.n2oContainer) {
      this.n2oContainer.classList.toggle('active-n2o', isBoosting);
    }
    if (this.speedWrapper) {
      this.speedWrapper.classList.toggle('boosting', isBoosting);
    }
  }

  showNotification(message, type = 'info', duration = 2200) {
    if (!this.bannerEl) return;
    this.bannerEl.textContent = message;
    this.bannerEl.className = `hud-banner active ${type}`;

    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.bannerEl.className = 'hud-banner';
    }, duration);
  }
}
