import { Game } from './Game.js';
import { GLBRickshawLoader } from './controllers/GLBRickshawLoader.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Main Application Bootstrap
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('canvas-container');
  const uiContainer = document.getElementById('ui-container');

  if (!canvasContainer || !uiContainer) {
    console.error('Missing root canvas or UI container elements.');
    return;
  }

  // Initialize and attach game instance to window IMMEDIATELY so 3D world, track & UI render instantly
  window.cycleRushGame = new Game(canvasContainer, uiContainer);

  // Background preload authentic GLB rickshaw model with error protection
  GLBRickshawLoader.loadBaseModel().catch((err) => {
    console.warn('GLB background preload issue (using procedural fallback):', err);
  });
});

