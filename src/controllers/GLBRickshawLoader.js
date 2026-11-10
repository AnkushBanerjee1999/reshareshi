import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextureGenerator } from '../world/TextureGenerator.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * GLB Rickshaw & Auto Model Loader
 *
 * Loads the photorealistic PBR Tuk-Tuk / Auto Rickshaw model,
 * normalizes orientation (-Z forward), scales to realistic street dimensions,
 * configures contact shadows, dynamic headlights & glowing red taillights,
 * and produces customized liveries (Kaali-Peeli, Delhi CNG, Bengal Red, etc.).
 */
export class GLBRickshawLoader {
  static cachedGLTF = null;
  static loadPromise = null;

  /**
   * Loads and caches the base GLB model
   */
  static async loadBaseModel() {
    if (this.cachedGLTF) {
      return this.cachedGLTF;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const loader = new GLTFLoader();
    const modelUrls = [
      '/src/thai_tuk-tuk_-_3d_model_pbr_real-time.glb',
      './src/thai_tuk-tuk_-_3d_model_pbr_real-time.glb',
      '/public/assets/models/thai_tuk-tuk_-_3d_model_pbr_real-time.glb',
      '/public/assets/models/rickshaw.glb',
      '/assets/models/rickshaw.glb'
    ];

    this.loadPromise = new Promise(async (resolve, reject) => {
      let loadedData = null;

      for (const url of modelUrls) {
        try {
          loadedData = await Promise.race([
            new Promise((res, rej) => {
              loader.load(url, res, undefined, rej);
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('GLB load timeout')), 7000))
          ]);
          if (loadedData && loadedData.scene) {
            // Model loaded successfully
            break;
          }
        } catch (e) {
          // Try next candidate URL
        }
      }

      if (!loadedData || !loadedData.scene) {
        console.warn('GLBRickshawLoader: Could not load GLB from candidate paths, using procedural fallback.');
        resolve(null);
        return;
      }

      this.cachedGLTF = loadedData;
      resolve(loadedData);
    });

    return this.loadPromise;
  }

  /**
   * Instantiates a fully configured, forward-facing 3D Auto Rickshaw model
   * @param {Object} options - Customization & livery options
   */
  static async createRickshawInstance(options = {}) {
    const gltf = await this.loadBaseModel();
    if (!gltf || !gltf.scene) {
      return null;
    }

    const root = new THREE.Group();
    root.name = options.name || 'GLBAutoRickshaw';

    // Clone the scene hierarchy
    const model = gltf.scene.clone(true);

    // 1. Calculate raw model bounding box to normalize scale & pivot
    const rawBox = new THREE.Box3().setFromObject(model);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);

    // Target realistic auto-rickshaw dimensions: Length ~2.8m, Height ~1.82m, Width ~1.3m
    const targetHeight = 1.82;
    const scaleFactor = targetHeight / (rawSize.y || 1.95);
    model.scale.setScalar(scaleFactor);

    // Recompute box with new scale
    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    // Center horizontally on X and longitudinally on Z
    // Place wheels directly on asphalt ground (y = 0.0)
    model.position.x = -scaledCenter.x;
    model.position.y = -scaledBox.min.y;
    model.position.z = -scaledCenter.z;

    // Wrap model in modelPivot so we rotate around the vehicle center (0, 0, 0)
    const modelPivot = new THREE.Group();
    modelPivot.name = 'ModelPivot';
    modelPivot.add(model);

    // In the raw GLB model:
    // Front is along -X, Rear is along +X, Sides are along ±Z.
    // Rotating modelPivot by -90 deg (-Math.PI / 2) around Y turns:
    // Front (-X) -> -Z (FORWARD down the alleyway!)
    // Rear (+X) -> +Z (BACKWARD towards the chase camera!)
    // Right side (+Z) -> +X (right side of road)
    // Left side (-Z) -> -X (left side of road)
    modelPivot.rotation.y = -Math.PI / 2;

    root.add(modelPivot);

    // 2. Configure PBR Materials, Distinct Liveries & Preserve Authentic Textures
    const isPlayer = !!options.isPlayer;

    // Resolve livery colors
    const primaryHex = options.primaryColor || (isPlayer ? '#f1c40f' : '#3498db');
    const secondaryHex = options.secondaryColor || (isPlayer ? '#1a1a1a' : '#2c3e50');
    const canopyHex = options.canopyColor || secondaryHex;

    const primaryColor = new THREE.Color(primaryHex);
    const secondaryColor = new THREE.Color(secondaryHex);
    const canopyColor = new THREE.Color(canopyHex);

    // Cache cloned materials for this vehicle instance so meshes sharing a material remain linked
    const materialMap = new Map();

    const getClonedMaterial = (origMat) => {
      if (!origMat) return origMat;
      if (materialMap.has(origMat)) return materialMap.get(origMat);

      const clonedMat = origMat.clone();
      const matName = (clonedMat.name || '').toLowerCase();

      // 1. Livery Color Customization (Body & Trim)
      if (matName.includes('metallic_blue') || matName.includes('metallic_yellow')) {
        // Main vehicle body panels (Yellow for player Kaali-Peeli, Red/Blue/Green/etc. for AI)
        clonedMat.color.copy(primaryColor);
      } else if (matName.includes('metallic_orange') || matName.includes('metallic_red')) {
        // Accent trims & front cowl
        clonedMat.color.copy(secondaryColor);
      } else if (matName === 'material' || matName === 'material_0') {
        // Roof canopy fabric
        clonedMat.color.copy(canopyColor);
      }

      // 2. Glowing Headlights & Taillights
      if (matName.includes('headlight')) {
        clonedMat.emissive = new THREE.Color(0xfffae6);
        clonedMat.emissiveIntensity = 1.4;
      } else if (matName.includes('tail')) {
        clonedMat.emissive = new THREE.Color(0xff2200);
        clonedMat.emissiveIntensity = 2.0;
      }

      materialMap.set(origMat, clonedMat);
      return clonedMat;
    };

    const wheels = [];

    // Traverse and apply cloned materials + shadows
    model.traverse((child) => {
      if (child.isMesh) {
        const nameLower = (child.name || '').toLowerCase();

        // Shadow casting on primary body shell
        if (nameLower.includes('body') || nameLower.includes('roof') || nameLower.includes('chassis') || nameLower.includes('cabin') || nameLower.includes('hood')) {
          child.castShadow = true;
        }

        // Collect wheels for rolling animation
        if (nameLower.includes('tyre') || nameLower.includes('wheel')) {
          wheels.push(child);
        }

        // Apply cloned materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(getClonedMaterial);
          } else {
            child.material = getClonedMaterial(child.material);
          }
        }
      }
    });

    // 3. Projected Headlight Light Pool on Asphalt (Forward illuminated beam cone matching reference screenshot)
    const poolCanvas = document.createElement('canvas');
    poolCanvas.width = 256;
    poolCanvas.height = 512;
    const poolCtx = poolCanvas.getContext('2d');
    const radGrad = poolCtx.createRadialGradient(128, 440, 16, 128, 300, 210);
    radGrad.addColorStop(0, 'rgba(255, 252, 235, 0.88)');
    radGrad.addColorStop(0.30, 'rgba(255, 240, 185, 0.58)');
    radGrad.addColorStop(0.65, 'rgba(255, 215, 120, 0.22)');
    radGrad.addColorStop(1, 'rgba(255, 190, 50, 0.0)');
    poolCtx.fillStyle = radGrad;
    poolCtx.fillRect(0, 0, 256, 512);

    const poolTexture = new THREE.CanvasTexture(poolCanvas);
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const poolMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 13.5), poolMat);
    poolMesh.rotateX(-Math.PI / 2);
    poolMesh.position.set(0, 0.025, -7.5); // Directly on asphalt in front of the vehicle
    root.add(poolMesh);

    // 4. Circular Dashed Targeting/Drift Reticle Ring on Asphalt (Matching reference screenshot)
    if (isPlayer) {
      const ringGeo = new THREE.PlaneGeometry(4.6, 4.6);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        map: TextureGenerator.createTargetReticleTexture(),
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0.016, 0); // Flat on asphalt centered under the rickshaw
      root.add(ringMesh);
    }

    return {
      root,
      model,
      poolMesh,
      wheels,
      wheelRadius: 0.38
    };
  }
}

