/**
 * Cycle Rush: Kolkata Alleyways
 * Grand Prix Race Results Screen
 *
 * Displays:
 * - Finishing Placement (1st, 2nd, 3rd... 7th)
 * - Victory Celebration Banner
 * - Final Race Time, Distance, Coins & Score
 */
export class GameOverScreen {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.root = document.createElement('div');
    this.root.className = 'game-screen game-over-screen hidden';
    this.container.appendChild(this.root);

    this.buildHTML();
    this.bindEvents();
  }

  buildHTML() {
    this.root.innerHTML = `
      <div class="game-over-box race-results-box">
        <div class="over-header">
          <div class="over-badge" id="results-badge">GRAND PRIX FINISH</div>
          <h2 class="over-title" id="results-title">1ST PLACE - CHAMPION!</h2>
          <div class="new-high-badge hidden" id="over-high-badge">★ NEW RECORD TIME! ★</div>
        </div>

        <div class="over-stats-grid">
          <div class="over-stat-card">
            <span class="over-card-label">FINISHING RANK</span>
            <span class="over-card-val highlight" id="results-rank">1st / 7</span>
          </div>

          <div class="over-stat-card">
            <span class="over-card-label">RACE TIME</span>
            <span class="over-card-val" id="results-time">01:12.4</span>
          </div>

          <div class="over-stat-card">
            <span class="over-card-label">BRASS COINS</span>
            <span class="over-card-val" id="results-coins">+0 🪙</span>
          </div>

          <div class="over-stat-card">
            <span class="over-card-label">FINAL SCORE</span>
            <span class="over-card-val highlight" id="results-score">0</span>
          </div>
        </div>

        <div class="over-buttons">
          <button class="arcade-btn btn-restart" id="btn-restart">
            <span class="btn-icon">🏁</span>
            <span class="btn-text">RACE AGAIN [R]</span>
          </button>

          <button class="arcade-btn btn-menu" id="btn-over-menu">
            <span class="btn-icon">🏠</span>
            <span class="btn-text">MAIN MENU</span>
          </button>
        </div>
      </div>
    `;

    this.badgeEl = this.root.querySelector('#results-badge');
    this.titleEl = this.root.querySelector('#results-title');
    this.rankEl = this.root.querySelector('#results-rank');
    this.timeEl = this.root.querySelector('#results-time');
    this.coinsEl = this.root.querySelector('#results-coins');
    this.scoreEl = this.root.querySelector('#results-score');
    this.highBadge = this.root.querySelector('#over-high-badge');
    this.restartBtn = this.root.querySelector('#btn-restart');
    this.menuBtn = this.root.querySelector('#btn-over-menu');
  }

  bindEvents() {
    this.restartBtn.addEventListener('click', () => {
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    this.menuBtn.addEventListener('click', () => {
      if (this.callbacks.onMenu) this.callbacks.onMenu();
    });
  }

  show(results = {}) {
    const rank = results.playerRank || 1;
    const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th'];
    const suf = rank <= 3 ? suffixes[rank] : 'th';

    if (this.rankEl) this.rankEl.textContent = `${rank}${suf} / ${results.totalRacers || 7}`;

    if (this.titleEl) {
      if (rank === 1) {
        this.titleEl.textContent = '🏆 1ST PLACE - VICTORY!';
        this.titleEl.style.color = '#f1c40f';
      } else if (rank === 2) {
        this.titleEl.textContent = '🥈 2ND PLACE - RUNNER UP!';
        this.titleEl.style.color = '#ecf0f1';
      } else if (rank === 3) {
        this.titleEl.textContent = '🥉 3RD PLACE - PODIUM FINISH!';
        this.titleEl.style.color = '#e67e22';
      } else {
        this.titleEl.textContent = `${rank}${suf} PLACE FINISH`;
        this.titleEl.style.color = '#ffffff';
      }
    }

    if (this.timeEl) {
      const t = results.raceTime || 0;
      const mins = Math.floor(t / 60);
      const secs = (t % 60).toFixed(1).padStart(4, '0');
      this.timeEl.textContent = `${String(mins).padStart(2, '0')}:${secs}`;
    }

    if (this.coinsEl) this.coinsEl.textContent = `+${results.coins || 0} 🪙`;
    if (this.scoreEl) this.scoreEl.textContent = Math.floor(results.score || 0).toLocaleString();

    if (this.highBadge) {
      if (results.isNewHigh) {
        this.highBadge.classList.remove('hidden');
      } else {
        this.highBadge.classList.add('hidden');
      }
    }

    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
  }
}
