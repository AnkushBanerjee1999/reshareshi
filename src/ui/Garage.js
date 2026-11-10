import { CANOPY_SKINS } from '../utils/Constants.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Garage & Customization Screen
 */
export class Garage {
  constructor(container, saveManager, rickshawController, callbacks = {}) {
    this.container = container;
    this.saveManager = saveManager;
    this.rickshaw = rickshawController;
    this.callbacks = callbacks;

    this.root = document.createElement('div');
    this.root.className = 'game-screen garage-screen hidden';
    this.container.appendChild(this.root);

    this.buildHTML();
  }

  buildHTML() {
    this.root.innerHTML = `
      <div class="garage-container">
        <!-- Top Header -->
        <div class="garage-header">
          <button class="arcade-btn btn-back" id="garage-back-btn">← BACK TO MENU</button>
          <div class="garage-title-wrap">
            <h2 class="garage-title">RICKSHAW GARAGE</h2>
            <span class="garage-sub">Customize your canopy with traditional Kolkata craftsmanship</span>
          </div>
          <div class="garage-coins-badge">
            <span class="coin-icon">🪙</span>
            <span id="garage-coins-val">0</span>
          </div>
        </div>

        <!-- Canopy Carousel / Grid -->
        <div class="canopy-cards-grid" id="canopy-cards-grid"></div>

        <!-- Selected Skin Info Panel -->
        <div class="selected-skin-panel" id="selected-skin-panel">
          <div class="skin-info-details">
            <h3 class="skin-name" id="skin-info-name">Classic Red</h3>
            <p class="skin-desc" id="skin-info-desc">The iconic Kolkata crimson canopy with golden valance fringe.</p>
          </div>
          <div class="skin-action-wrap" id="skin-action-wrap"></div>
        </div>
      </div>
    `;

    this.grid = this.root.querySelector('#canopy-cards-grid');
    this.coinsVal = this.root.querySelector('#garage-coins-val');
    this.skinName = this.root.querySelector('#skin-info-name');
    this.skinDesc = this.root.querySelector('#skin-info-desc');
    this.actionWrap = this.root.querySelector('#skin-action-wrap');
    this.backBtn = this.root.querySelector('#garage-back-btn');

    this.backBtn.addEventListener('click', () => {
      if (this.callbacks.onBack) this.callbacks.onBack();
    });

    this.selectedId = this.saveManager.getSelectedCanopy();
    this.refresh();
  }

  refresh() {
    const totalCoins = this.saveManager.getTotalCoins();
    const unlocked = this.saveManager.getUnlockedCanopies();
    const equippedId = this.saveManager.getSelectedCanopy();

    if (this.coinsVal) this.coinsVal.textContent = totalCoins.toLocaleString();

    // Render cards
    if (this.grid) {
      this.grid.innerHTML = '';
      CANOPY_SKINS.forEach(skin => {
        const isUnlocked = unlocked.includes(skin.id);
        const isEquipped = skin.id === equippedId;
        const isSelected = skin.id === this.selectedId;

        const card = document.createElement('div');
        card.className = `canopy-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="card-swatch" style="background: linear-gradient(135deg, ${skin.primaryColor} 0%, ${skin.secondaryColor} 100%);">
            <div class="swatch-fringe" style="border-top-color: ${skin.fringeColor};"></div>
            ${isEquipped ? '<span class="equipped-tag">EQUIPPED</span>' : ''}
            ${!isUnlocked ? `<span class="lock-tag">🔒 ${skin.price} 🪙</span>` : ''}
          </div>
          <div class="card-title">${skin.name}</div>
        `;

        card.addEventListener('click', () => {
          this.selectSkin(skin.id);
        });

        this.grid.appendChild(card);
      });
    }

    // Update bottom action panel
    this.updateActionPanel();
  }

  selectSkin(skinId) {
    this.selectedId = skinId;
    // Live preview on 3D rickshaw
    if (this.rickshaw) {
      this.rickshaw.applyCanopySkin(skinId);
    }
    this.refresh();
  }

  updateActionPanel() {
    const skin = CANOPY_SKINS.find(s => s.id === this.selectedId) || CANOPY_SKINS[0];
    const unlocked = this.saveManager.isCanopyUnlocked(skin.id);
    const equipped = this.saveManager.getSelectedCanopy() === skin.id;
    const totalCoins = this.saveManager.getTotalCoins();

    if (this.skinName) this.skinName.textContent = skin.name;
    if (this.skinDesc) this.skinDesc.textContent = skin.description;

    if (this.actionWrap) {
      this.actionWrap.innerHTML = '';

      if (equipped) {
        const badge = document.createElement('div');
        badge.className = 'status-badge-equipped';
        badge.textContent = '✓ CURRENTLY EQUIPPED';
        this.actionWrap.appendChild(badge);
      } else if (unlocked) {
        const equipBtn = document.createElement('button');
        equipBtn.className = 'arcade-btn btn-equip';
        equipBtn.textContent = 'EQUIP CANOPY';
        equipBtn.addEventListener('click', () => {
          this.saveManager.setSelectedCanopy(skin.id);
          this.refresh();
        });
        this.actionWrap.appendChild(equipBtn);
      } else {
        // Locked
        const buyBtn = document.createElement('button');
        buyBtn.className = 'arcade-btn btn-unlock';
        if (totalCoins >= skin.price) {
          buyBtn.innerHTML = `UNLOCK FOR ${skin.price} <span class="coin-icon">🪙</span>`;
          buyBtn.addEventListener('click', () => {
            if (this.saveManager.spendCoins(skin.price)) {
              this.saveManager.unlockCanopy(skin.id);
              this.saveManager.setSelectedCanopy(skin.id);
              this.refresh();
            }
          });
        } else {
          buyBtn.disabled = true;
          buyBtn.className += ' disabled';
          buyBtn.textContent = `NEED ${skin.price} 🪙 (HAVE ${totalCoins})`;
        }
        this.actionWrap.appendChild(buyBtn);
      }
    }
  }

  show() {
    this.selectedId = this.saveManager.getSelectedCanopy();
    if (this.rickshaw) {
      this.rickshaw.applyCanopySkin(this.selectedId);
    }
    this.refresh();
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
    // Ensure equipped skin is restored
    if (this.rickshaw) {
      this.rickshaw.applyCanopySkin(this.saveManager.getSelectedCanopy());
    }
  }
}

