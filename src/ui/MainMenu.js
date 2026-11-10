/**
 * Cycle Rush: Kolkata Alleyways / Auto Rush
 * Grand Prix Main Menu Screen
 *
 * Modeled after the reference arcade interface:
 * - Sleek left vehicle card with Speed, Accel, Grip stats
 * - Vibrant "START RACE चलो!" peach-orange action button
 * - Top currency & trophy status badges
 * - Bottom-right Daily Challenges card
 */
export class MainMenu {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.className = 'game-screen main-menu-arcade';
    this.container.appendChild(this.root);

    this.buildHTML();
    this.bindEvents();
  }

  buildHTML() {
    this.root.innerHTML = `
      <!-- Top HUD Status Pills -->
      <div class="arcade-top-bar">
        <div class="top-pill-left">
          <button class="icon-pill-btn" id="menu-sound-btn" title="Toggle Sound">
            <span id="menu-sound-icon">🔊</span>
            <span id="menu-sound-text">SOUND ON</span>
          </button>
        </div>

        <div class="top-pills-right">
          <div class="status-pill coins-pill">
            <span class="pill-icon">🪙</span>
            <span class="pill-val" id="menu-total-coins">250</span>
          </div>

          <div class="status-pill trophy-pill">
            <span class="pill-icon">🏆</span>
            <span class="pill-val" id="menu-high-score">0 / 3</span>
          </div>

          <div class="status-pill streak-pill">
            <span class="pill-icon">🔥</span>
            <span class="pill-val">DAY 2</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="arcade-menu-body">
        <!-- Left Racing Control Card -->
        <div class="arcade-left-card">
          <!-- Game Branding Logo -->
          <div class="arcade-brand">
            <div class="brand-sub-badge">GURUGRAM & KOLKATA GRAND PRIX</div>
            <h1 class="brand-title">
              <span class="brand-auto">AUTO</span>
              <span class="brand-rush">RUSH</span>
            </h1>
          </div>

          <!-- Vehicle Specs Showcase Card -->
          <div class="vehicle-specs-card">
            <div class="vehicle-header-row">
              <span class="vehicle-name" id="menu-vehicle-name">MUMBAI KAALI-PEELI</span>
              <button class="upgrade-pill-btn" id="btn-garage">
                <span>🎨 GARAGE</span>
              </button>
            </div>

            <!-- Stats Bars -->
            <div class="specs-bars-list">
              <div class="spec-row">
                <span class="spec-label">SPEED</span>
                <div class="spec-bar-track">
                  <div class="spec-bar-fill" style="width: 78%;"></div>
                </div>
              </div>

              <div class="spec-row">
                <span class="spec-label">ACCEL</span>
                <div class="spec-bar-track">
                  <div class="spec-bar-fill" style="width: 65%;"></div>
                </div>
              </div>

              <div class="spec-row">
                <span class="spec-label">GRIP</span>
                <div class="spec-bar-track">
                  <div class="spec-bar-fill" style="width: 82%;"></div>
                </div>
              </div>
            </div>

            <div class="vehicle-card-footer">
              <span class="tier-tag">7-RACER GRAND PRIX</span>
              <span class="dist-tag" id="menu-total-dist">0 km raced</span>
            </div>
          </div>

          <!-- Track Tabs -->
          <div class="track-tabs-row">
            <button class="track-tab active">Kolkata Alleyways</button>
            <button class="track-tab locked">Gurugram CyberCity 🔒</button>
          </div>

          <!-- Grand Main START RACE Button (Peach Orange Gradient with Hindi Subtitle) -->
          <button class="arcade-start-btn" id="btn-play">
            <span class="start-text-en">START RACE</span>
            <span class="start-text-hi">चलो!</span>
          </button>

          <!-- Bottom Helper Links -->
          <div class="sub-links-row">
            <button class="sub-link-btn" id="btn-how">
              <span>⚙ Race Setup: 7 Racers</span>
            </button>
            <button class="sub-link-btn" id="btn-how-2">
              <span>📖 How to Play</span>
            </button>
          </div>
        </div>

        <!-- Right Side: Daily Challenges Card (matching reference image) -->
        <div class="arcade-right-card">
          <div class="daily-challenges-box">
            <div class="challenges-header">
              <div class="challenges-title-col">
                <span class="challenges-title">DAILY CHALLENGES</span>
                <span class="challenges-reset">RESET IN 23H 14M</span>
              </div>
            </div>

            <div class="challenge-item">
              <span class="check-circle green">✓</span>
              <div class="challenge-info">
                <span class="challenge-desc">Finish a race with no scratch</span>
                <span class="challenge-prog">0 / 1</span>
              </div>
              <span class="challenge-reward">🪙 200</span>
            </div>

            <div class="challenge-item">
              <span class="check-circle gold">★</span>
              <div class="challenge-info">
                <span class="challenge-desc">Win 1st place in Grand Prix</span>
                <span class="challenge-prog">0 / 1</span>
              </div>
              <span class="challenge-reward">🪙 400</span>
            </div>

            <div class="challenge-item">
              <span class="check-circle pink">⚡</span>
              <div class="challenge-info">
                <span class="challenge-desc">Pull off 3 slipstream overtakes</span>
                <span class="challenge-prog">0 / 3</span>
              </div>
              <span class="challenge-reward">🪙 750</span>
            </div>

            <div class="challenges-bonus-row">
              <span class="bonus-text">ALL 3 DONE: <strong>+500 BONUS</strong></span>
              <div class="bonus-prog-bar">
                <div class="bonus-prog-fill" style="width: 20%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cache elements
    this.highScoreEl = this.root.querySelector('#menu-high-score');
    this.coinsEl = this.root.querySelector('#menu-total-coins');
    this.distEl = this.root.querySelector('#menu-total-dist');
    this.playBtn = this.root.querySelector('#btn-play');
    this.garageBtn = this.root.querySelector('#btn-garage');
    this.howBtn = this.root.querySelector('#btn-how');
    this.howBtn2 = this.root.querySelector('#btn-how-2');
    this.soundBtn = this.root.querySelector('#menu-sound-btn');
    this.soundIcon = this.root.querySelector('#menu-sound-icon');
    this.soundText = this.root.querySelector('#menu-sound-text');
  }

  bindEvents() {
    this.playBtn.addEventListener('click', () => {
      if (this.callbacks.onPlay) this.callbacks.onPlay();
    });

    this.garageBtn.addEventListener('click', () => {
      if (this.callbacks.onGarage) this.callbacks.onGarage();
    });

    if (this.howBtn) {
      this.howBtn.addEventListener('click', () => {
        if (this.callbacks.onHowToPlay) this.callbacks.onHowToPlay();
      });
    }

    if (this.howBtn2) {
      this.howBtn2.addEventListener('click', () => {
        if (this.callbacks.onHowToPlay) this.callbacks.onHowToPlay();
      });
    }

    this.soundBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleSound) {
        const enabled = this.callbacks.onToggleSound();
        this.updateSoundButton(enabled);
      }
    });
  }

  update(saveData) {
    if (!saveData) return;
    if (this.highScoreEl) this.highScoreEl.textContent = `${Math.round(saveData.highScore || 0)} pts`;
    if (this.coinsEl) this.coinsEl.textContent = saveData.coins || 0;
    if (this.distEl) {
      const distKm = ((saveData.totalDistance || 0) / 1000).toFixed(1);
      this.distEl.textContent = `${distKm} km raced`;
    }
  }

  updateSoundButton(enabled) {
    if (this.soundIcon) this.soundIcon.textContent = enabled ? '🔊' : '🔇';
    if (this.soundText) this.soundText.textContent = enabled ? 'SOUND ON' : 'MUTED';
  }

  show() {
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
  }
}
