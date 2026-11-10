import * as THREE from 'three';
import { OBSTACLES, PHYSICS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Heroic 3D Obstacle & Traffic Manager
 *
 * Implements prominent, recognizable stylized low-poly obstacles:
 * - Humped Desi Cow with walking legs, horns & animated tail
 * - Crossing Pedestrians with clothing, umbrella & walking gait
 * - Heavy Hand-Pulled Cargo Cart with burlap sacks & rope
 * - Vintage Retro Scooter with spare wheel & chrome shield
 * - Deep 3D Pothole with cracked raised rim
 * - Kolkata Police Barricade with hazard stripes
 */
export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeObstacles = [];
    this.nextSpawnZ = -30.0;
    this.minSpawnDistance = 24.0;
    this.maxSpawnDistance = 36.0;

    // Stylized Materials
    this.cowWhiteMat = new THREE.MeshToonMaterial({ color: 0xf5ebe6, roughness: 0.65 });
    this.cowPatchMat = new THREE.MeshToonMaterial({ color: 0x795548, roughness: 0.7 });
    this.cowMuzzleMat = new THREE.MeshToonMaterial({ color: 0x3e2723 });
    this.cowHornMat = new THREE.MeshToonMaterial({ color: 0x212121, roughness: 0.3 });
    this.cowHoofMat = new THREE.MeshToonMaterial({ color: 0x111111 });

    this.skinMat = new THREE.MeshToonMaterial({ color: 0x9c5936, roughness: 0.65 });
    this.clothMat1 = new THREE.MeshToonMaterial({ color: 0xd35400, roughness: 0.8 }); // Saffron/Orange
    this.clothMat2 = new THREE.MeshToonMaterial({ color: 0x2980b9, roughness: 0.8 }); // Bengal Blue
    this.clothWhiteMat = new THREE.MeshToonMaterial({ color: 0xf5f6fa });
    this.umbrellaMat = new THREE.MeshToonMaterial({ color: 0x1e272c });

    this.woodMat = new THREE.MeshToonMaterial({ color: 0x5d4037, roughness: 0.8 });
    this.sackMat = new THREE.MeshToonMaterial({ color: 0xd7ccc8, roughness: 0.9 });
    this.ropeMat = new THREE.MeshBasicMaterial({ color: 0xa1887f });

    this.scooterTealMat = new THREE.MeshToonMaterial({ color: 0x16a085, roughness: 0.35 });
    this.chromeMat = new THREE.MeshToonMaterial({ color: 0xdfe6e9, roughness: 0.15 });
    this.rubberMat = new THREE.MeshToonMaterial({ color: 0x151515, roughness: 0.9 });

    this.barricadeYellowMat = new THREE.MeshToonMaterial({ color: 0xf1c40f });
    this.barricadeBlackMat = new THREE.MeshToonMaterial({ color: 0x1e272c });
  }

  // ==========================================
  // PROCEDURAL HIGH-QUALITY OBSTACLE MESHES
  // ==========================================

  /**
   * Anatomically Stylized Indian Zebu Cow with animated walking legs & swishing tail
   */
  createCowMesh() {
    const cow = new THREE.Group();
    cow.name = 'DesiCow';

    // Barrel chest & torso
    const bodyGeo = new THREE.BoxGeometry(0.95, 1.05, 2.0);
    const body = new THREE.Mesh(bodyGeo, this.cowWhiteMat);
    body.position.set(0, 1.05, 0);
    body.castShadow = true;
    cow.add(body);

    // Large prominent Zebu hump on shoulders
    const humpGeo = new THREE.ConeGeometry(0.42, 0.55, 8);
    humpGeo.rotateX(0.25);
    const hump = new THREE.Mesh(humpGeo, this.cowWhiteMat);
    hump.position.set(0, 1.72, 0.45);
    cow.add(hump);

    // Brown hide patches
    const patch1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.55, 0.75), this.cowPatchMat);
    patch1.position.set(0, 1.08, -0.25);
    cow.add(patch1);

    const patch2 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.42, 0.5), this.cowPatchMat);
    patch2.position.set(0, 1.15, 0.55);
    cow.add(patch2);

    // Expressive Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 1.05);

    const headGeo = new THREE.BoxGeometry(0.52, 0.62, 0.78);
    const head = new THREE.Mesh(headGeo, this.cowWhiteMat);
    headGroup.add(head);

    // Dark muzzle and nostrils
    const muzzleGeo = new THREE.BoxGeometry(0.42, 0.32, 0.28);
    const muzzle = new THREE.Mesh(muzzleGeo, this.cowMuzzleMat);
    muzzle.position.set(0, -0.15, 0.42);
    headGroup.add(muzzle);

    // Eyes
    for (const ex of [-0.27, 0.27]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      eye.position.set(ex, 0.12, 0.15);
      headGroup.add(eye);
    }

    // Curved black horns
    for (const side of [-1, 1]) {
      const hornGeo = new THREE.ConeGeometry(0.09, 0.52, 8);
      hornGeo.rotateX(-Math.PI / 4);
      hornGeo.rotateZ(side * 0.45);
      const horn = new THREE.Mesh(hornGeo, this.cowHornMat);
      horn.position.set(side * 0.28, 0.42, 0.05);
      headGroup.add(horn);

      // Floppy ears
      const earGeo = new THREE.ConeGeometry(0.08, 0.32, 6);
      earGeo.rotateZ(side * 1.2);
      const ear = new THREE.Mesh(earGeo, this.cowWhiteMat);
      ear.position.set(side * 0.34, 0.12, -0.08);
      headGroup.add(ear);
    }
    cow.add(headGroup);

    // 4 Articulated Walking Legs with Hooves
    const legPositions = [
      { name: 'frontL', x: -0.34, z: 0.68 },
      { name: 'frontR', x: 0.34, z: 0.68 },
      { name: 'backL', x: -0.34, z: -0.68 },
      { name: 'backR', x: 0.34, z: -0.68 }
    ];

    const legs = {};
    for (const pos of legPositions) {
      const legGroup = new THREE.Group();
      legGroup.position.set(pos.x, 0.78, pos.z);

      const thighGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.52);
      thighGeo.translate(0, -0.26, 0);
      const thigh = new THREE.Mesh(thighGeo, this.cowWhiteMat);
      legGroup.add(thigh);

      const shinGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42);
      shinGeo.translate(0, -0.21, 0);
      const shin = new THREE.Mesh(shinGeo, this.cowWhiteMat);
      shin.position.set(0, -0.48, 0);
      thigh.add(shin);

      // Black hoof
      const hoofGeo = new THREE.BoxGeometry(0.12, 0.1, 0.14);
      const hoof = new THREE.Mesh(hoofGeo, this.cowHoofMat);
      hoof.position.set(0, -0.24, 0.02);
      shin.add(hoof);

      cow.add(legGroup);
      legs[pos.name] = legGroup;
    }
    cow.userData.legs = legs;

    // Swishing Tail with tuft
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 1.25, -1.02);

    const tailGeo = new THREE.CylinderGeometry(0.038, 0.022, 0.82);
    tailGeo.rotateX(-0.25);
    tailGeo.translate(0, -0.38, -0.08);
    const tailMesh = new THREE.Mesh(tailGeo, this.cowWhiteMat);
    tailGroup.add(tailMesh);

    const tuftGeo = new THREE.SphereGeometry(0.08, 6, 6);
    tuftGeo.scale(1.0, 1.8, 1.0);
    const tuft = new THREE.Mesh(tuftGeo, this.cowPatchMat);
    tuft.position.set(0, -0.80, -0.20);
    tailGroup.add(tuft);

    cow.add(tailGroup);
    cow.userData.tail = tailGroup;

    return cow;
  }

  /**
   * Stylized Crossing Pedestrian with animated walking legs, arms & umbrella
   */
  createPedestrianMesh() {
    const ped = new THREE.Group();
    ped.name = 'Pedestrian';

    const isWoman = Math.random() > 0.5;
    const outfitMat = isWoman ? this.clothMat1 : this.clothMat2;

    // Torso / Kurta
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.68, 0.28);
    const torso = new THREE.Mesh(torsoGeo, outfitMat);
    torso.position.set(0, 1.15, 0);
    torso.castShadow = true;
    ped.add(torso);

    // Head with hair
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.64, 0);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), this.skinMat);
    headGroup.add(head);

    const hairGeo = new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hair = new THREE.Mesh(hairGeo, new THREE.MeshToonMaterial({ color: 0x111111 }));
    hair.position.y = 0.03;
    headGroup.add(hair);

    ped.add(headGroup);

    // Walking Legs
    const legGeo = new THREE.CylinderGeometry(0.085, 0.065, 0.85);
    legGeo.translate(0, -0.42, 0);

    const legL = new THREE.Mesh(legGeo, this.clothWhiteMat);
    legL.position.set(-0.14, 0.82, 0);
    ped.add(legL);

    const legR = new THREE.Mesh(legGeo.clone(), this.clothWhiteMat);
    legR.position.set(0.14, 0.82, 0);
    ped.add(legR);

    // Umbrella in Hand
    const armGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.58);
    armGeo.rotateX(-Math.PI / 4);
    const armR = new THREE.Mesh(armGeo, outfitMat);
    armR.position.set(0.32, 1.25, 0.18);
    ped.add(armR);

    const umbrellaGroup = new THREE.Group();
    umbrellaGroup.position.set(0.38, 1.45, 0.32);

    const shaftGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.1);
    const shaft = new THREE.Mesh(shaftGeo, this.chromeMat);
    umbrellaGroup.add(shaft);

    const canopyGeo = new THREE.ConeGeometry(0.58, 0.28, 12);
    const canopy = new THREE.Mesh(canopyGeo, this.umbrellaMat);
    canopy.position.y = 0.52;
    umbrellaGroup.add(canopy);

    ped.add(umbrellaGroup);

    ped.userData.legL = legL;
    ped.userData.legR = legR;
    ped.userData.armR = armR;

    return ped;
  }

  /**
   * Heavy Hand-Pulled Cargo Cart with Burlap Sacks & Wooden Wheels
   */
  createHandCartMesh() {
    const cart = new THREE.Group();
    cart.name = 'HandCart';

    // Wooden bed frame
    const bedGeo = new THREE.BoxGeometry(1.65, 0.18, 2.8);
    const bed = new THREE.Mesh(bedGeo, this.woodMat);
    bed.position.set(0, 0.65, 0);
    bed.castShadow = true;
    cart.add(bed);

    // Large Spoked Wooden Wagon Wheels
    for (const side of [-0.92, 0.92]) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(side, 0.58, 0);

      const rimGeo = new THREE.TorusGeometry(0.58, 0.05, 8, 18);
      rimGeo.rotateY(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.woodMat);
      wheelGroup.add(rim);

      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 8);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, this.woodMat);
      wheelGroup.add(hub);

      for (let s = 0; s < 6; s++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1), this.woodMat);
        spoke.rotation.x = (s / 6) * Math.PI;
        wheelGroup.add(spoke);
      }

      cart.add(wheelGroup);
    }

    // Long bamboo pulling shafts
    for (const side of [-0.48, 0.48]) {
      const poleGeo = new THREE.CylinderGeometry(0.045, 0.038, 2.0);
      poleGeo.rotateX(Math.PI / 2.3);
      const pole = new THREE.Mesh(poleGeo, this.woodMat);
      pole.position.set(side, 0.72, 1.7);
      cart.add(pole);
    }

    // Stacked Burlap Jute Sacks with binding ropes
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 3; i++) {
        const sackGeo = new THREE.BoxGeometry(0.72, 0.38, 0.85);
        const sack = new THREE.Mesh(sackGeo, this.sackMat);
        sack.position.set(
          (i === 1 ? 0 : (i === 0 ? -0.42 : 0.42)),
          0.95 + layer * 0.38,
          (layer === 1 ? 0 : (i - 1) * 0.8)
        );
        sack.rotation.y = (Math.random() - 0.5) * 0.2;
        cart.add(sack);
      }
    }

    // Ropes tying down cargo
    const ropeGeo = new THREE.BoxGeometry(1.68, 0.03, 0.03);
    const rope1 = new THREE.Mesh(ropeGeo, this.ropeMat);
    rope1.position.set(0, 1.55, 0.4);
    cart.add(rope1);

    const rope2 = new THREE.Mesh(ropeGeo, this.ropeMat);
    rope2.position.set(0, 1.55, -0.4);
    cart.add(rope2);

    return cart;
  }

  /**
   * Vintage Bajaj Chetak Retro Scooter with spare wheel & round headlamp
   */
  createScooterMesh() {
    const scooter = new THREE.Group();
    scooter.name = 'VintageScooter';

    // Rounded bulbous rear engine cowls
    const rearBodyGeo = new THREE.BoxGeometry(0.78, 0.65, 1.5);
    const rearBody = new THREE.Mesh(rearBodyGeo, this.scooterTealMat);
    rearBody.position.set(0, 0.58, -0.15);
    rearBody.castShadow = true;
    scooter.add(rearBody);

    // Front curved leg shield with chrome trim
    const shieldGeo = new THREE.BoxGeometry(0.68, 0.85, 0.08);
    const shield = new THREE.Mesh(shieldGeo, this.scooterTealMat);
    shield.position.set(0, 0.85, 0.72);
    shield.rotation.x = -0.18;
    scooter.add(shield);

    // Chrome floorboard runners
    const floorGeo = new THREE.BoxGeometry(0.55, 0.06, 0.65);
    const floor = new THREE.Mesh(floorGeo, this.chromeMat);
    floor.position.set(0, 0.35, 0.35);
    scooter.add(floor);

    // Dual black vinyl seats
    const seatGeo = new THREE.BoxGeometry(0.42, 0.16, 0.52);
    const frontSeat = new THREE.Mesh(seatGeo, this.rubberMat);
    frontSeat.position.set(0, 0.98, 0.05);
    scooter.add(frontSeat);

    const pillionSeat = new THREE.Mesh(seatGeo, this.rubberMat);
    pillionSeat.position.set(0, 1.02, -0.52);
    scooter.add(pillionSeat);

    // Spare wheel mounted vertically at rear
    const spareGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 12);
    spareGeo.rotateZ(Math.PI / 2);
    const spare = new THREE.Mesh(spareGeo, this.rubberMat);
    spare.position.set(0, 0.85, -0.92);
    scooter.add(spare);

    // Handlebar headset with round chrome headlamp
    const barGeo = new THREE.BoxGeometry(0.78, 0.12, 0.14);
    const bar = new THREE.Mesh(barGeo, this.scooterTealMat);
    bar.position.set(0, 1.32, 0.62);
    scooter.add(bar);

    const lampGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12);
    lampGeo.rotateX(Math.PI / 2);
    const lamp = new THREE.Mesh(lampGeo, this.chromeMat);
    lamp.position.set(0, 1.32, 0.70);
    
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095, 10), new THREE.MeshBasicMaterial({ color: 0xfff2a3 }));
    lens.position.set(0, 0, 0.045);
    lamp.add(lens);
    scooter.add(lamp);

    // Wheels
    for (const z of [-0.48, 0.68]) {
      const wGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.15, 12);
      wGeo.rotateZ(Math.PI / 2);
      const w = new THREE.Mesh(wGeo, this.rubberMat);
      w.position.set(0, 0.24, z);
      scooter.add(w);
    }

    return scooter;
  }

  /**
   * Deep 3D Pothole with irregular cracked asphalt depression
   */
  createPotholeMesh() {
    const pot = new THREE.Group();
    pot.name = '3DPothole';

    // Dark asphalt hole crater
    const holeGeo = new THREE.CylinderGeometry(0.92, 0.78, 0.14, 14);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.y = -0.05;
    pot.add(hole);

    // Rainwater reflection in puddle center
    const waterGeo = new THREE.CircleGeometry(0.68, 12);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.012;
    pot.add(water);

    // Raised rough cracked asphalt rim
    const rimGeo = new THREE.TorusGeometry(0.92, 0.08, 6, 14);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshToonMaterial({ color: 0x485460 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.02;
    pot.add(rim);

    return pot;
  }

  /**
   * Kolkata Police Barricade with Warning Hazard Stripes
   */
  createBarricadeMesh() {
    const bar = new THREE.Group();
    bar.name = 'PoliceBarricade';

    // Two horizontal warning boards (Yellow with Black hazard diagonals)
    for (const y of [0.65, 1.05]) {
      const plankGeo = new THREE.BoxGeometry(2.4, 0.32, 0.08);
      const plank = new THREE.Mesh(plankGeo, this.barricadeYellowMat);
      plank.position.set(0, y, 0);
      plank.castShadow = true;
      bar.add(plank);

      // Black diagonal hazard stripes
      for (let s = -0.9; s <= 0.9; s += 0.45) {
        const stripeGeo = new THREE.BoxGeometry(0.14, 0.34, 0.09);
        stripeGeo.rotateZ(Math.PI / 4);
        const stripe = new THREE.Mesh(stripeGeo, this.barricadeBlackMat);
        stripe.position.set(s, y, 0);
        bar.add(stripe);
      }
    }

    // A-frame heavy steel legs
    for (const side of [-1.1, 1.1]) {
      const leg1Geo = new THREE.BoxGeometry(0.09, 1.35, 0.08);
      leg1Geo.rotateZ(side * 0.16);
      const leg1 = new THREE.Mesh(leg1Geo, this.barricadeBlackMat);
      leg1.position.set(side, 0.65, 0);
      bar.add(leg1);

      const footGeo = new THREE.BoxGeometry(0.12, 0.08, 0.75);
      const foot = new THREE.Mesh(footGeo, this.barricadeBlackMat);
      foot.position.set(side, 0.04, 0);
      bar.add(foot);
    }

    return bar;
  }

  // ==========================================
  // SPAWNING & LIFECYCLE
  // ==========================================

  spawnObstacle(targetZ) {
    const types = [
      OBSTACLES.COW,
      OBSTACLES.PEDESTRIAN,
      OBSTACLES.HAND_CART,
      OBSTACLES.PARKED_SCOOTER,
      OBSTACLES.POTHOLE,
      OBSTACLES.BARRICADE
    ];
    const def = MathUtils.randomChoice(types);

    let mesh;
    switch (def.type) {
      case 'cow':
        mesh = this.createCowMesh();
        break;
      case 'pedestrian':
        mesh = this.createPedestrianMesh();
        break;
      case 'hand_cart':
        mesh = this.createHandCartMesh();
        break;
      case 'parked_scooter':
        mesh = this.createScooterMesh();
        break;
      case 'pothole':
        mesh = this.createPotholeMesh();
        break;
      case 'barricade':
        mesh = this.createBarricadeMesh();
        break;
      default:
        mesh = this.createPotholeMesh();
    }

    const posX = MathUtils.randomRange(-3.8, 3.8);
    mesh.position.set(posX, 0, targetZ);

    let moveDirX = 0;
    if (def.type === 'pedestrian') {
      moveDirX = posX > 0 ? -1 : 1;
      mesh.rotation.y = moveDirX > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else if (def.type === 'cow') {
      moveDirX = (Math.random() - 0.5) * 0.35;
      mesh.rotation.y = Math.PI;
    } else if (def.type === 'hand_cart') {
      mesh.rotation.y = Math.PI;
    } else if (def.type === 'parked_scooter') {
      mesh.rotation.y = MathUtils.randomRange(-0.35, 0.35);
    }

    const obstacleObj = {
      def,
      mesh,
      moveDirX,
      animTime: 0,
      scared: false
    };

    this.scene.add(mesh);
    this.activeObstacles.push(obstacleObj);
  }

  update(deltaTime, playerPos, isBellActive) {
    // Road hurdle removal: Keep road lanes 100% clear and wide open for smooth racing
    if (this.activeObstacles.length > 0) {
      this.clear();
    }
  }

  getActiveObstacles() {
    return [];
  }

  clear() {
    for (const obs of this.activeObstacles) {
      this.scene.remove(obs.mesh);
    }
    this.activeObstacles = [];
    this.nextSpawnZ = -30.0;
  }
}
