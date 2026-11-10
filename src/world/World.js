import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Main 3D World, Cinematic Golden-Hour Lighting and Scene Setup
 *
 * Configured for vibrant cel-shaded color separation, sharp contact shadows,
 * and warm Kolkata sunset atmosphere without washed-out haziness.
 */
export class World {
  constructor(canvasContainer) {
    this.container = canvasContainer;

    // 1. Scene & Crisp Night/Twilight Urban Atmosphere (matching reference screenshot)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121020);
    // Soft midnight distance haze for cinematic night racing visibility
    this.scene.fog = new THREE.Fog(0x18152c, 110, 320);

    // 2. Camera (Heroic Arcade Chase View)
    this.camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      380
    );
    this.camera.position.set(0, 2.8, 4.8);

    // 3. WebGL Renderer with High-Performance Settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Sky Dome Setup
    this.setupSkyDome();
    this.setupLighting();

    // Resize handler
    this._onResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  setupSkyDome() {
    // Night/Twilight Sky Gradient matching reference screenshot:
    // Deep midnight indigo zenith into deep dusk violet and warm horizon ember glow
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');

    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#0a0818');     // Midnight
    skyGrad.addColorStop(0.35, '#151228');  // Indigo
    skyGrad.addColorStop(0.6, '#241a3d');   // Violet
    skyGrad.addColorStop(0.78, '#49305c');  // Intermediate violet
    skyGrad.addColorStop(0.9, '#8d453f');   // Warm dusk
    skyGrad.addColorStop(1, '#cd6133');     // Horizon embers
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 512, 512);

    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    const skyGeo = new THREE.SphereGeometry(280, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.skyDome.position.set(0, 0, 0);
    this.scene.add(this.skyDome);
  }

  setupLighting() {
    // Twilight Urban Hemisphere Ambient Light (Night indigo sky + asphalt bounce)
    const hemiLight = new THREE.HemisphereLight(0x4a47a3, 0x161422, 0.9);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const violetFill = new THREE.AmbientLight(0x5f27cd, 0.35);
    this.scene.add(violetFill);

    // Low-Angle Warm Moonlight / Distant Street Glow (matching reference screenshot sharp shadows)
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.55);
    this.sunLight.position.set(34, 40, -32);
    this.sunLight.castShadow = true;

    // Crisp shadow map calibration (optimized for stable 60+ FPS)
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 145;
    this.sunLight.shadow.camera.left = -28;
    this.sunLight.shadow.camera.right = 28;
    this.sunLight.shadow.camera.top = 38;
    this.sunLight.shadow.camera.bottom = -38;
    this.sunLight.shadow.bias = -0.0004;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

  }

  update(playerZ) {
    const safeZ = Number.isFinite(playerZ) ? playerZ : 0.0;
    if (this.skyDome) {
      this.skyDome.position.z = safeZ;
    }
    if (this.sunLight) {
      this.sunLight.position.z = safeZ - 34;
      this.sunLight.target.position.z = safeZ;
      this.sunLight.target.updateMatrixWorld();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
