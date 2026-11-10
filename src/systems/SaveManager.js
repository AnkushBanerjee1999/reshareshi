/**
 * Cycle Rush: Kolkata Alleyways
 * Persistent Progression and Save Manager
 */

const STORAGE_KEY = 'cycle_rush_kolkata_save_v1';

const DEFAULT_SAVE_DATA = {
  highScore: 0,
  totalCoins: 0,
  unlockedCanopies: ['classic-red'],
  selectedCanopy: 'classic-red',
  totalDistance: 0,
  soundEnabled: true
};

export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return { ...DEFAULT_SAVE_DATA };
      }
      const parsed = JSON.parse(serialized);
      // Validate and merge missing keys
      return {
        highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
        totalCoins: typeof parsed.totalCoins === 'number' ? parsed.totalCoins : 0,
        unlockedCanopies: Array.isArray(parsed.unlockedCanopies) && parsed.unlockedCanopies.length > 0
          ? parsed.unlockedCanopies
          : ['classic-red'],
        selectedCanopy: typeof parsed.selectedCanopy === 'string' ? parsed.selectedCanopy : 'classic-red',
        totalDistance: typeof parsed.totalDistance === 'number' ? parsed.totalDistance : 0,
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true
      };
    } catch (err) {
      console.warn('Could not read saved data from localStorage. Using defaults.', err);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('Could not write save data to localStorage.', err);
    }
  }

  getHighScore() {
    return this.data.highScore;
  }

  recordScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = Math.floor(score);
      this.save();
      return true; // New high score
    }
    return false;
  }

  getTotalCoins() {
    return this.data.totalCoins;
  }

  addCoins(amount) {
    if (amount > 0) {
      this.data.totalCoins += Math.floor(amount);
      this.save();
    }
    return this.data.totalCoins;
  }

  spendCoins(amount) {
    if (amount <= this.data.totalCoins) {
      this.data.totalCoins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  addDistance(meters) {
    if (meters > 0) {
      this.data.totalDistance += Math.floor(meters);
      this.save();
    }
  }

  getTotalDistance() {
    return this.data.totalDistance;
  }

  getUnlockedCanopies() {
    return this.data.unlockedCanopies;
  }

  isCanopyUnlocked(canopyId) {
    return this.data.unlockedCanopies.includes(canopyId);
  }

  unlockCanopy(canopyId) {
    if (!this.data.unlockedCanopies.includes(canopyId)) {
      this.data.unlockedCanopies.push(canopyId);
      this.save();
      return true;
    }
    return false;
  }

  getSelectedCanopy() {
    return this.data.selectedCanopy;
  }

  setSelectedCanopy(canopyId) {
    if (this.isCanopyUnlocked(canopyId)) {
      this.data.selectedCanopy = canopyId;
      this.save();
      return true;
    }
    return false;
  }

  isSoundEnabled() {
    return this.data.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.data.soundEnabled = Boolean(enabled);
    this.save();
  }

  resetAll() {
    this.data = { ...DEFAULT_SAVE_DATA };
    this.save();
  }
}

