import * as THREE from 'three';
import { COLLECTIBLES } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { SplinePath } from '../world/SplinePath.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Prominent Collectibles Manager (Chai with Steam, Daab Coconut, Golden Rupee Coins)
 */
export class CollectibleManager {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    this.spline = new SplinePath();
    this.activeCollectibles = [];
    this.nextSpawnZ = -14.0;
    this.minSpawnDistance = 14.0;
    this.maxSpawnDistance = 22.0;

    // Materials
    this.coinMat = new THREE.MeshToonMaterial({
      color: 0xf1c40f,
      roughness: 0.15,
      emissive: 0x996500,
      emissiveIntensity: 0.25
    });

    this.coinEmbossMat = new THREE.MeshToonMaterial({
      color: 0xffeaa7,
      roughness: 0.1
    });

    this.chaiClayMat = new THREE.MeshToonMaterial({
      color: 0xc0392b,
      roughness: 0.8
    });

    this.teaLiquidMat = new THREE.MeshBasicMaterial({ color: 0x5a2d0c });

    this.coconutMat = new THREE.MeshToonMaterial({
      color: 0x27ae60,
      roughness: 0.55
    });

    this.coconutMeatMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.strawMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });

    this.auraMat = new THREE.MeshBasicMaterial({
      color: 0xfff2a3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });

    this.steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55
    });
  }

  // ==========================================
  // PROMINENT 3D COLLECTIBLE MODELS
  // ==========================================

  /**
   * Large Golden Kolkata Coin with Embossed ₹ Rupee Symbol
   */
  createCoinMesh() {
    const coinGroup = new THREE.Group();
    coinGroup.name = 'HeroCoin';

    // Large cylindrical brass coin (radius ~0.48m)
    const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.10, 20);
    coinGeo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(coinGeo, this.coinMat);
    coin.castShadow = true;
    coinGroup.add(coin);

    // Embossed outer raised rim
    const rimGeo = new THREE.TorusGeometry(0.44, 0.035, 8, 20);
    const rimFront = new THREE.Mesh(rimGeo, this.coinEmbossMat);
    rimFront.position.z = 0.055;
    coinGroup.add(rimFront);

    const rimBack = new THREE.Mesh(rimGeo, this.coinEmbossMat);
    rimBack.position.z = -0.055;
    coinGroup.add(rimBack);

    // Embossed Rupee Symbol (₹) on front and back
    for (const zSide of [0.06, -0.06]) {
      const symbolGroup = new THREE.Group();
      symbolGroup.position.z = zSide;
      if (zSide < 0) symbolGroup.rotation.y = Math.PI;

      // Top horizontal bar
      const barTop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.055, 0.03), this.coinEmbossMat);
      barTop.position.set(0, 0.15, 0);
      symbolGroup.add(barTop);

      // Second horizontal bar
      const barMid = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.03), this.coinEmbossMat);
      barMid.position.set(0, 0.04, 0);
      symbolGroup.add(barMid);

      // Curved upper loop of R
      const loopGeo = new THREE.TorusGeometry(0.11, 0.028, 6, 12, Math.PI);
      loopGeo.rotateZ(-Math.PI / 2);
      const loop = new THREE.Mesh(loopGeo, this.coinEmbossMat);
      loop.position.set(0.04, 0.09, 0);
      symbolGroup.add(loop);

      // Slanted lower leg
      const legGeo = new THREE.BoxGeometry(0.05, 0.24, 0.03);
      legGeo.rotateZ(-Math.PI / 4);
      const leg = new THREE.Mesh(legGeo, this.coinEmbossMat);
      leg.position.set(0.05, -0.10, 0);
      symbolGroup.add(leg);

      coinGroup.add(symbolGroup);
    }

    // Glowing Golden Sparkle Halo
    const haloGeo = new THREE.RingGeometry(0.55, 0.68, 16);
    const halo = new THREE.Mesh(haloGeo, this.auraMat);
    coinGroup.add(halo);

    return coinGroup;
  }

  /**
   * Roadside Masala Chai in Terracotta Kulhad with Animated Rising Steam
   */
  createChaiMesh() {
    const chaiGroup = new THREE.Group();
    chaiGroup.name = 'HeroChai';

    // Authentic flared clay Kulhad cup
    const cupGeo = new THREE.CylinderGeometry(0.32, 0.20, 0.62, 16);
    const cup = new THREE.Mesh(cupGeo, this.chaiClayMat);
    cup.castShadow = true;
    chaiGroup.add(cup);

    // Decorative clay ring ridges
    const ridgeGeo = new THREE.TorusGeometry(0.28, 0.02, 6, 16);
    ridgeGeo.rotateX(Math.PI / 2);
    const ridge = new THREE.Mesh(ridgeGeo, this.chaiClayMat);
    ridge.position.y = 0.12;
    chaiGroup.add(ridge);

    // Steaming masala tea surface
    const teaGeo = new THREE.CircleGeometry(0.30, 14);
    teaGeo.rotateX(-Math.PI / 2);
    const tea = new THREE.Mesh(teaGeo, this.teaLiquidMat);
    tea.position.y = 0.30;
    chaiGroup.add(tea);

    // Animated Rising Steam Puffs
    const steamGroup = new THREE.Group();
    steamGroup.name = 'SteamGroup';
    steamGroup.position.y = 0.36;

    const steamPuffs = [];
    for (let s = 0; s < 5; s++) {
      const puffGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const puff = new THREE.Mesh(puffGeo, this.steamMat.clone());
      puff.position.set((Math.random() - 0.5) * 0.18, s * 0.14, (Math.random() - 0.5) * 0.18);
      steamGroup.add(puff);
      steamPuffs.push({
        mesh: puff,
        baseY: s * 0.14,
        speed: 0.4 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2
      });
    }
    chaiGroup.add(steamGroup);
    chaiGroup.userData.steamPuffs = steamPuffs;

    // Warm Golden Glowing Aura
    const ringGeo = new THREE.RingGeometry(0.42, 0.58, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const aura = new THREE.Mesh(ringGeo, this.auraMat);
    aura.position.y = -0.22;
    chaiGroup.add(aura);

    return chaiGroup;
  }

  /**
   * Fresh Green Daab (Tender Coconut) with Cut Top & Striped Straw
   */
  createCoconutMesh() {
    const daabGroup = new THREE.Group();
    daabGroup.name = 'HeroDaab';

    // Large stylized green coconut (oval shell with facets)
    const shellGeo = new THREE.SphereGeometry(0.42, 14, 12);
    shellGeo.scale(1.0, 1.28, 1.0);
    const shell = new THREE.Mesh(shellGeo, this.coconutMat);
    shell.castShadow = true;
    daabGroup.add(shell);

    // Flat machete-chopped opening at top
    const cutTopGeo = new THREE.CircleGeometry(0.24, 12);
    cutTopGeo.rotateX(-Math.PI / 2);
    const cutTop = new THREE.Mesh(cutTopGeo, this.coconutMeatMat);
    cutTop.position.y = 0.52;
    daabGroup.add(cutTop);

    // Coconut water hole in center
    const waterHoleGeo = new THREE.CircleGeometry(0.12, 10);
    waterHoleGeo.rotateX(-Math.PI / 2);
    const waterHole = new THREE.Mesh(waterHoleGeo, new THREE.MeshBasicMaterial({ color: 0x90caf9 }));
    waterHole.position.y = 0.525;
    daabGroup.add(waterHole);

    // Striped Drinking Straw poking out
    const strawGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.58, 8);
    strawGeo.rotateZ(0.35);
    const straw = new THREE.Mesh(strawGeo, this.strawMat);
    straw.position.set(0.12, 0.65, 0);
    daabGroup.add(straw);

    // Green coconut palm stem cut at base
    const stemGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.12, 8);
    const stem = new THREE.Mesh(stemGeo, new THREE.MeshToonMaterial({ color: 0x1b5e20 }));
    stem.position.y = -0.52;
    daabGroup.add(stem);

    // Refreshing Cyan/Green Glow Ring
    const haloGeo = new THREE.RingGeometry(0.55, 0.72, 18);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x55efc4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = -0.32;
    daabGroup.add(halo);

    return daabGroup;
  }

  // ==========================================
  // SPAWNING & ANIMATIONS
  // ==========================================

  spawnCollectible(targetZ) {
    const roll = Math.random();
    let def, mesh;

    if (roll < 0.55) {
      def = COLLECTIBLES.COIN;
      mesh = this.createCoinMesh();
    } else if (roll < 0.80) {
      def = COLLECTIBLES.CHAI;
      mesh = this.createChaiMesh();
    } else {
      def = COLLECTIBLES.COCONUT;
      mesh = this.createCoconutMesh();
    }

    const pt = this.spline.getTrackPoint(targetZ);
    const halfWidth = pt.width / 2 - 2.0;
    const laneOffset = MathUtils.randomRange(-halfWidth, halfWidth);
    const posX = pt.x + laneOffset;
    mesh.position.set(posX, 1.05, targetZ);

    const item = {
      def,
      mesh,
      baseY: 1.05,
      animTime: Math.random() * 10
    };

    this.scene.add(mesh);
    this.activeCollectibles.push(item);
  }

  update(deltaTime, playerPos) {
    // 1. Spawning ahead up to finish line (-1180m)
    while (this.nextSpawnZ > playerPos.z - 170.0 && this.nextSpawnZ > -1180.0) {
      this.spawnCollectible(this.nextSpawnZ);
      this.nextSpawnZ -= MathUtils.randomRange(this.minSpawnDistance, this.maxSpawnDistance);
    }

    // 2. Animate and recycle
    for (let i = this.activeCollectibles.length - 1; i >= 0; i--) {
      const item = this.activeCollectibles[i];
      item.animTime += deltaTime;

      // Continuous 3D spin and vertical bobbing
      item.mesh.rotation.y += deltaTime * 2.6;
      item.mesh.position.y = item.baseY + Math.sin(item.animTime * 3.2) * 0.18;

      // Animate rising steam puffs for Chai
      if (item.mesh.userData.steamPuffs) {
        for (const p of item.mesh.userData.steamPuffs) {
          p.mesh.position.y = p.baseY + ((item.animTime * p.speed + p.offset) % 0.45);
          p.mesh.position.x = Math.sin(item.animTime * 4.0 + p.offset) * 0.08;
          const life = (p.mesh.position.y - p.baseY) / 0.45;
          p.mesh.material.opacity = (1 - life) * 0.65;
          p.mesh.scale.setScalar(0.7 + life * 0.8);
        }
      }

      // Despawn behind player
      if (item.mesh.position.z > playerPos.z + 20.0) {
        this.scene.remove(item.mesh);
        this.activeCollectibles.splice(i, 1);
      }
    }
  }

  getActiveCollectibles() {
    return this.activeCollectibles;
  }

  removeCollectible(index) {
    if (index >= 0 && index < this.activeCollectibles.length) {
      const item = this.activeCollectibles[index];
      this.scene.remove(item.mesh);
      this.activeCollectibles.splice(index, 1);
    }
  }

  clear() {
    for (const item of this.activeCollectibles) {
      this.scene.remove(item.mesh);
    }
    this.activeCollectibles = [];
    this.nextSpawnZ = -14.0;
  }
}
