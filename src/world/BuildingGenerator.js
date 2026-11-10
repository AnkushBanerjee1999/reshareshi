import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * High-Performance Procedural Kolkata Heritage Architecture Generator
 *
 * Pre-caches shared geometries, materials, and signboard textures so that
 * building creation costs ZERO runtime texture allocations and minimal draw calls.
 */
export class BuildingGenerator {
  constructor() {
    this.facadeColors = [
      COLORS.BRICK_RED,
      COLORS.OCHRE_YELLOW,
      COLORS.COLONIAL_TEAL,
      COLORS.HERITAGE_CREAM,
      0xb9770e, // Bengal Ochre
      0x8b3a2b, // Terracotta Deep
      0x407364  // Hooghly Mint Teal
    ];

    // 1. Pre-cached shared materials (0 runtime shader recompilations)
    this.wallMaterials = this.facadeColors.map(color => new THREE.MeshToonMaterial({
      color,
      roughness: 0.85
    }));

    this.trimMat = new THREE.MeshToonMaterial({ color: 0x2c3e50, roughness: 0.7 });
    this.shutterMat = new THREE.MeshToonMaterial({ color: 0x1b4d3e, roughness: 0.65 });
    this.ironMat = new THREE.MeshToonMaterial({ color: 0x1e272c, roughness: 0.4 });
    this.plasterMat = new THREE.MeshToonMaterial({ color: 0xdcdde1, roughness: 0.9 });
    this.shutterGateMat = new THREE.MeshToonMaterial({ color: 0x576574 });
    this.acMat = new THREE.MeshToonMaterial({ color: 0xecf0f1, roughness: 0.5 });

    // 2. Pre-cached shared geometries
    this.depth = 8.0;
    this.width = 11.8;
    this.standardHeights = [18.0, 22.0, 26.0];

    this.wallGeometries = this.standardHeights.map(h => new THREE.BoxGeometry(this.width, h, this.depth));
    this.corniceGeo = new THREE.BoxGeometry(this.width + 0.5, 0.8, this.depth + 0.5);
    this.plasterBandGeo = new THREE.BoxGeometry(this.width + 0.15, 0.8, this.depth + 0.15);
    this.signGeo = new THREE.PlaneGeometry(this.width * 0.78, 2.1);
    this.shutterGateGeo = new THREE.PlaneGeometry(this.width * 0.76, 2.6);

    this.windowFrameGeo = new THREE.BoxGeometry(1.05, 1.55, 0.16);
    this.shutterGeo = new THREE.BoxGeometry(0.44, 1.45, 0.08);
    this.archGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.14, 8, 1, false, 0, Math.PI);
    this.archGeo.rotateZ(Math.PI / 2);

    this.balconyFloorGeo = new THREE.BoxGeometry(2.6, 0.18, 0.95);
    this.balconyRailGeo = new THREE.BoxGeometry(2.55, 0.85, 0.08);
    this.corbelGeo = new THREE.BoxGeometry(0.18, 0.42, 0.65);
    this.acGeo = new THREE.BoxGeometry(0.85, 0.55, 0.35);

    // 3. Pre-generate and cache Kolkata Heritage Signboard textures ONCE
    this.signboards = [
      { name: 'K.C. DAS SWEETS • কে.সি. দাশ', sub: 'Original Kolkata Rossogolla Estd. 1866' },
      { name: 'FLURYS PARK STREET', sub: 'Legendary Heritage Tearoom Estd. 1927' },
      { name: 'COLLEGE ST. BOIPARA • বইপাড়া', sub: 'Heritage Booksellers & Publishers' },
      { name: 'MITRA CAFE • মিত্র ক্যাফে', sub: 'Celebrated Kabiraji & Cutlets Estd. 1910' },
      { name: 'CALCUTTA TRAMWAYS CO.', sub: 'Esplanade Depot • Electric Transit Since 1902' },
      { name: 'PARAMOUNT SHERBETS', sub: 'College Square Syrups & Daab Sarbat 1918' },
      { name: 'INDIAN COFFEE HOUSE', sub: 'College Street Heritage Intellectual Hub' },
      { name: 'BHIM CHANDRA NAG', sub: 'Bowbazar Sandesh & Traditional Mishti 1826' }
    ];

    this.signboardMaterials = this.signboards.map((sign, idx) => {
      const color = this.facadeColors[idx % this.facadeColors.length];
      const texture = TextureGenerator.createShopSignboardTexture(
        sign.name,
        sign.sub,
        '#' + color.toString(16).padStart(6, '0')
      );
      return new THREE.MeshBasicMaterial({ map: texture });
    });

    // 4. Pre-cached Modern City Architecture Materials (matching reference screenshot)
    this.glassFacadeTexture = TextureGenerator.createGlassFacadeTexture();
    this.glassFacadeMat = new THREE.MeshStandardMaterial({
      map: this.glassFacadeTexture,
      roughness: 0.18,
      metalness: 0.85
    });

    this.louverFacadeTexture = TextureGenerator.createLouverFacadeTexture();
    this.louverFacadeMat = new THREE.MeshStandardMaterial({
      map: this.louverFacadeTexture,
      roughness: 0.35,
      metalness: 0.45
    });

    this.whiteFrameMat = new THREE.MeshToonMaterial({ color: 0xf5f6fa, roughness: 0.65 });
    this.darkSpandrelMat = new THREE.MeshToonMaterial({ color: 0x1a252f, roughness: 0.5 });
    this.modernPlazaMat = new THREE.MeshToonMaterial({ color: 0xb0bec5, roughness: 0.85 });

    this.parkGrassTexture = TextureGenerator.createParkGrassTexture();
    this.parkGrassMat = new THREE.MeshToonMaterial({ map: this.parkGrassTexture, roughness: 0.8 });

    this.fountainWaterTexture = TextureGenerator.createFountainWaterTexture();
    this.fountainWaterMat = new THREE.MeshBasicMaterial({ map: this.fountainWaterTexture });

    this.crosswalkTexture = TextureGenerator.createCrosswalkTexture();
    this.crosswalkMat = new THREE.MeshBasicMaterial({ map: this.crosswalkTexture });

    this.asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1c1b26, roughness: 0.90, metalness: 0.0 });
    this.yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    this.curbMat = new THREE.MeshToonMaterial({ color: 0xdcdde1, roughness: 0.8 });
    this.treeBarkMat = new THREE.MeshToonMaterial({ color: 0x4a2e18, roughness: 0.85 });
    this.treeFoliageMat = new THREE.MeshToonMaterial({ color: 0x2ecc71, roughness: 0.7 });
  }

  /**
   * Generates a colonial heritage building using pre-cached assets (0 texture allocations)
   */
  createBuilding(width = 11.8, targetHeight = 18.0, depth = 8.0, side = 'left') {
    const building = new THREE.Group();

    // Select closest cached height variant
    let heightIdx = 0;
    if (targetHeight >= 24) heightIdx = 2;
    else if (targetHeight >= 20) heightIdx = 1;
    const height = this.standardHeights[heightIdx];

    // Pick pre-cached wall material
    const wallMat = MathUtils.randomChoice(this.wallMaterials);

    // 1. Structural wall block (only object casting shadow)
    const wall = new THREE.Mesh(this.wallGeometries[heightIdx], wallMat);
    wall.position.set(0, height / 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    building.add(wall);

    // 2. Plaster accent band
    const plasterBand = new THREE.Mesh(this.plasterBandGeo, this.plasterMat);
    plasterBand.position.set(0, 4.2, 0);
    building.add(plasterBand);

    // 3. Rooftop Cornice
    const cornice = new THREE.Mesh(this.corniceGeo, this.trimMat);
    cornice.position.set(0, height + 0.4, 0);
    building.add(cornice);

    // 4. Ground floor storefront & signboard (reusing cached material)
    const signMat = MathUtils.randomChoice(this.signboardMaterials);
    const signMesh = new THREE.Mesh(this.signGeo, signMat);
    const shutterGate = new THREE.Mesh(this.shutterGateGeo, this.shutterGateMat);

    if (side === 'left') {
      signMesh.rotation.y = Math.PI / 2;
      signMesh.position.set(depth / 2 + 0.08, 3.4, 0);

      shutterGate.rotation.y = Math.PI / 2;
      shutterGate.position.set(depth / 2 + 0.06, 1.3, 0);
    } else {
      signMesh.rotation.y = -Math.PI / 2;
      signMesh.position.set(-depth / 2 - 0.08, 3.4, 0);

      shutterGate.rotation.y = -Math.PI / 2;
      shutterGate.position.set(-depth / 2 - 0.06, 1.3, 0);
    }
    building.add(signMesh);
    building.add(shutterGate);

    // 5. Upper Floors: Optimized Khorkhori Shutters & Windows (2 floors max per building)
    const floors = Math.min(3, Math.floor(height / 6.0));
    const windowsPerRow = 3;

    for (let f = 1; f < floors; f++) {
      const floorY = f * 5.2 + 1.2;
      const hasBalcony = f === 1;

      for (let w = 0; w < windowsPerRow; w++) {
        const offsetZ = (w - (windowsPerRow - 1) / 2) * 3.2;
        const windowGroup = new THREE.Group();

        if (side === 'left') {
          windowGroup.position.set(depth / 2 + 0.06, floorY, offsetZ);
          windowGroup.rotation.y = Math.PI / 2;
        } else {
          windowGroup.position.set(-depth / 2 - 0.06, floorY, offsetZ);
          windowGroup.rotation.y = -Math.PI / 2;
        }

        // Window frame
        const frame = new THREE.Mesh(this.windowFrameGeo, this.trimMat);
        windowGroup.add(frame);

        // Arched pediment
        const arch = new THREE.Mesh(this.archGeo, this.trimMat);
        arch.position.set(0, 0.78, 0);
        windowGroup.add(arch);

        // Wooden louvers
        const leftShutter = new THREE.Mesh(this.shutterGeo, this.shutterMat);
        leftShutter.position.set(-0.55, 0, 0.06);
        leftShutter.rotation.y = -0.32;
        windowGroup.add(leftShutter);

        const rightShutter = new THREE.Mesh(this.shutterGeo, this.shutterMat);
        rightShutter.position.set(0.55, 0, 0.06);
        rightShutter.rotation.y = 0.32;
        windowGroup.add(rightShutter);

        building.add(windowGroup);
      }

      // Wrought-iron balcony on 1st floor
      if (hasBalcony) {
        const balcony = new THREE.Group();

        for (const cx of [-0.95, 0.95]) {
          const corbel = new THREE.Mesh(this.corbelGeo, this.trimMat);
          corbel.position.set(cx, -0.28, 0);
          balcony.add(corbel);
        }

        const bFloor = new THREE.Mesh(this.balconyFloorGeo, this.trimMat);
        balcony.add(bFloor);

        const bRail = new THREE.Mesh(this.balconyRailGeo, this.ironMat);
        bRail.position.set(0, 0.48, 0.42);
        balcony.add(bRail);

        if (side === 'left') {
          balcony.position.set(depth / 2 + 0.48, floorY - 0.75, 0);
          balcony.rotation.y = Math.PI / 2;
        } else {
          balcony.position.set(-depth / 2 - 0.48, floorY - 0.75, 0);
          balcony.rotation.y = -Math.PI / 2;
        }
        building.add(balcony);
      }
    }

    // 6. Exterior Wall-Mounted AC Unit
    if (Math.random() > 0.4) {
      const ac = new THREE.Mesh(this.acGeo, this.acMat);
      const acY = 7.8;
      const acZ = (Math.random() - 0.5) * (width * 0.4);

      if (side === 'left') {
        ac.position.set(depth / 2 + 0.2, acY, acZ);
        ac.rotation.y = Math.PI / 2;
      } else {
        ac.position.set(-depth / 2 - 0.2, acY, acZ);
        ac.rotation.y = -Math.PI / 2;
      }
      building.add(ac);
    }

    return building;
  }

  /**
   * Modern Blue Reflective Glass Curtain-Wall Skyscraper (matching reference screenshot):
   * High-rise commercial tower with blue reflective glass panels, structural white grid mullions,
   * ground floor entrance lobby, and rooftop mechanical penthouse.
   */
  createGlassSkyscraper(width = 16.0, height = 34.0, depth = 14.0, side = 'left') {
    const tower = new THREE.Group();
    tower.name = 'ModernGlassSkyscraper';

    // 1. Concrete Ground Entrance Plaza Plinth
    const plinthGeo = new THREE.BoxGeometry(width + 2.0, 0.4, depth + 2.0);
    const plinth = new THREE.Mesh(plinthGeo, this.modernPlazaMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;
    tower.add(plinth);

    // 2. Ground Floor Entrance Lobby (Glass & White Structural Columns)
    const lobbyH = 4.8;
    const lobbyGeo = new THREE.BoxGeometry(width - 0.4, lobbyH, depth - 0.4);
    const lobby = new THREE.Mesh(lobbyGeo, this.whiteFrameMat);
    lobby.position.y = lobbyH / 2 + 0.4;
    lobby.castShadow = true;
    lobby.receiveShadow = true;
    tower.add(lobby);

    // 3. Main Blue Reflective Glass Tower Body (Full shadow casting across street)
    const bodyH = height - lobbyH - 3.8;
    const bodyGeo = new THREE.BoxGeometry(width, bodyH, depth);
    const body = new THREE.Mesh(bodyGeo, this.glassFacadeMat);
    body.position.y = 0.4 + lobbyH + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    tower.add(body);

    // 4. White Vertical Architectural Corner Frames
    const colGeo = new THREE.BoxGeometry(0.55, height, 0.55);
    for (const cx of [-width / 2, width / 2]) {
      for (const cz of [-depth / 2, depth / 2]) {
        const col = new THREE.Mesh(colGeo, this.whiteFrameMat);
        col.position.set(cx, height / 2, cz);
        col.castShadow = true;
        tower.add(col);
      }
    }

    // 5. Rooftop Mechanical Penthouse & Chiller Enclosures
    const pentH = 3.6;
    const pentGeo = new THREE.BoxGeometry(width * 0.65, pentH, depth * 0.65);
    const pent = new THREE.Mesh(pentGeo, this.whiteFrameMat);
    pent.position.y = height + pentH / 2;
    pent.castShadow = true;
    tower.add(pent);

    // Rooftop Communications Antenna Mast
    const antGeo = new THREE.CylinderGeometry(0.06, 0.12, 6.5, 6);
    const ant = new THREE.Mesh(antGeo, this.trimMat);
    ant.position.set(0, height + pentH + 3.25, 0);
    tower.add(ant);

    // Blinking Red Aviation Beacon
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
    beacon.position.set(0, height + pentH + 6.5, 0);
    tower.add(beacon);

    return tower;
  }

  /**
   * Modern Horizontal Louvered / Brise-Soleil Commercial Building (matching reference screenshot):
   * Architectural building with horizontal sunshade louvers, glass ribbon windows & concrete balconies.
   */
  createLouveredCommercialBuilding(width = 16.0, height = 24.0, depth = 14.0, side = 'left') {
    const bldg = new THREE.Group();
    bldg.name = 'LouveredCommercialBuilding';

    // 1. Concrete Base Plinth
    const plinthGeo = new THREE.BoxGeometry(width + 1.5, 0.4, depth + 1.5);
    const plinth = new THREE.Mesh(plinthGeo, this.modernPlazaMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;
    bldg.add(plinth);

    // 2. Main Architectural Louvered Body (Fully casts shadows across street)
    const bodyGeo = new THREE.BoxGeometry(width, height - 1.5, depth);
    const body = new THREE.Mesh(bodyGeo, this.louverFacadeMat);
    body.position.y = (height - 1.5) / 2 + 0.4;
    body.castShadow = true;
    body.receiveShadow = true;
    bldg.add(body);

    // 3. Cantilever White Floor Slabs every 5.5m
    const floorCount = Math.floor(height / 5.5);
    for (let f = 1; f <= floorCount; f++) {
      const slabGeo = new THREE.BoxGeometry(width + 0.6, 0.35, depth + 0.6);
      const slab = new THREE.Mesh(slabGeo, this.whiteFrameMat);
      slab.position.y = f * 5.5;
      slab.castShadow = true;
      bldg.add(slab);
    }

    // 4. Rooftop Parapet & HVAC Enclosures
    const paraGeo = new THREE.BoxGeometry(width, 1.2, depth);
    const para = new THREE.Mesh(paraGeo, this.whiteFrameMat);
    para.position.y = height + 0.2;
    bldg.add(para);

    return bldg;
  }

  /**
   * Urban Public Park & Fountain Plaza (exact match to reference screenshot):
   * Manicured green lawn, intersecting paved stone pathways, multiple leafy shade trees,
   * and a central circular tiered water fountain with pool basin and circular globe monument.
   */
  createUrbanParkPlaza(width = 24.0, depth = 32.0) {
    const park = new THREE.Group();
    park.name = 'UrbanParkPlaza';

    // 1. Perimeter Raised Sidewalk Curb
    const curbGeo = new THREE.BoxGeometry(width, 0.32, depth);
    const curb = new THREE.Mesh(curbGeo, this.curbMat);
    curb.position.y = 0.16;
    curb.receiveShadow = true;
    park.add(curb);

    // 2. Lush Manicured Green Lawn Turf
    const lawnGeo = new THREE.BoxGeometry(width - 1.2, 0.36, depth - 1.2);
    const lawn = new THREE.Mesh(lawnGeo, this.parkGrassMat);
    lawn.position.y = 0.19;
    lawn.receiveShadow = true;
    park.add(lawn);

    // 3. Intersecting Paved Flagstone Pathways (Crossing the park north-south and east-west)
    const pathXGeo = new THREE.PlaneGeometry(width - 1.4, 3.2);
    pathXGeo.rotateX(-Math.PI / 2);
    const pathX = new THREE.Mesh(pathXGeo, this.modernPlazaMat);
    pathX.position.y = 0.38;
    pathX.receiveShadow = true;
    park.add(pathX);

    const pathZGeo = new THREE.PlaneGeometry(3.2, depth - 1.4);
    pathZGeo.rotateX(-Math.PI / 2);
    const pathZ = new THREE.Mesh(pathZGeo, this.modernPlazaMat);
    pathZ.position.y = 0.381;
    pathZ.receiveShadow = true;
    park.add(pathZ);

    // 4. Central Circular Tiered Water Fountain (matching reference screenshot)
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0.38, 0);

    // Outer Stone Basin Wall
    const basinGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.65, 24, 1, true);
    const basin = new THREE.Mesh(basinGeo, this.curbMat);
    basin.position.y = 0.325;
    basin.castShadow = true;
    fountainGroup.add(basin);

    // Stone Basin Coping Rim
    const rimGeo = new THREE.TorusGeometry(3.7, 0.18, 8, 24);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.curbMat);
    rim.position.y = 0.65;
    fountainGroup.add(rim);

    // Turquoise Sparkling Pool Water Surface
    const waterGeo = new THREE.CircleGeometry(3.55, 24);
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(waterGeo, this.fountainWaterMat);
    water.position.y = 0.52;
    fountainGroup.add(water);

    // Central Stone Tier Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.85, 1.15, 1.35, 16);
    const ped = new THREE.Mesh(pedGeo, this.whiteFrameMat);
    ped.position.y = 0.68;
    ped.castShadow = true;
    fountainGroup.add(ped);

    // Spilling Water Basin Bowl
    const bowlGeo = new THREE.CylinderGeometry(1.85, 1.25, 0.45, 16);
    const bowl = new THREE.Mesh(bowlGeo, this.whiteFrameMat);
    bowl.position.y = 1.45;
    bowl.castShadow = true;
    fountainGroup.add(bowl);

    // Decorative Polished Granite / Blue Metallic Globe Sculpture (as seen in screenshot)
    const sphereGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0984e3,
      metalness: 0.9,
      roughness: 0.1
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 2.45;
    sphere.castShadow = true;
    fountainGroup.add(sphere);

    park.add(fountainGroup);

    // 5. Four Leafy Park Shade Trees in Lawn Quadrants (matching screenshot)
    const treePositions = [
      { x: -6.5, z: -8.5 },
      { x: 6.5, z: -8.5 },
      { x: -6.5, z: 8.5 },
      { x: 6.5, z: 8.5 }
    ];

    for (const pos of treePositions) {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0.38, pos.z);

      // Circular Stone Planter Border
      const planterGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.28, 14, 1, true);
      const planter = new THREE.Mesh(planterGeo, this.curbMat);
      planter.position.y = 0.14;
      treeGroup.add(planter);

      // Tree Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, 3.8, 7);
      const trunk = new THREE.Mesh(trunkGeo, this.treeBarkMat);
      trunk.position.y = 1.9;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multi-Cluster Lush Green Volumetric Canopy
      const canopyClusters = [
        { x: 0, y: 4.2, z: 0, r: 2.1 },
        { x: -0.65, y: 3.8, z: 0.45, r: 1.6 },
        { x: 0.65, y: 3.8, z: -0.45, r: 1.6 },
        { x: 0, y: 5.2, z: 0, r: 1.4 }
      ];

      for (const c of canopyClusters) {
        const folGeo = new THREE.DodecahedronGeometry(c.r, 1);
        const fol = new THREE.Mesh(folGeo, this.treeFoliageMat);
        fol.position.set(c.x, c.y, c.z);
        fol.castShadow = true;
        fol.receiveShadow = true;
        treeGroup.add(fol);
      }

      park.add(treeGroup);
    }

    return park;
  }

  /**
   * Intersecting City Cross-Street Opening with Pedestrian Zebra Crosswalk:
   * Asphalt roadway branching off into the city, yellow center divider,
   * white pedestrian zebra crossing stripes across intersection mouth, and corner sidewalks.
   */
  createCrossStreet(length = 36.0, width = 11.5, side = 'left') {
    const street = new THREE.Group();
    street.name = `CityCrossStreet_${side}`;

    // 1. Asphalt Roadway extending perpendicular to main boulevard
    const roadGeo = new THREE.PlaneGeometry(length, width);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, this.asphaltMat);
    road.position.set(side === 'left' ? -length / 2 : length / 2, 0.02, 0);
    road.receiveShadow = true;
    street.add(road);

    // 2. Dashed Yellow Centerline Divider
    const lineGeo = new THREE.PlaneGeometry(length - 6.0, 0.22);
    lineGeo.rotateX(-Math.PI / 2);
    const line = new THREE.Mesh(lineGeo, this.yellowLineMat);
    line.position.set(side === 'left' ? -length / 2 - 2.0 : length / 2 + 2.0, 0.026, 0);
    street.add(line);

    // 3. Crisp White Pedestrian Zebra Crosswalk at Street Mouth
    const walkGeo = new THREE.PlaneGeometry(width - 0.8, 3.4);
    walkGeo.rotateX(-Math.PI / 2);
    const walk = new THREE.Mesh(walkGeo, this.crosswalkMat);
    walk.position.set(side === 'left' ? -2.2 : 2.2, 0.028, 0);
    walk.rotation.y = Math.PI / 2;
    street.add(walk);

    // 4. Bordering Concrete Sidewalks & Curbs
    for (const cz of [-width / 2 - 1.8, width / 2 + 1.8]) {
      const swGeo = new THREE.BoxGeometry(length, 0.24, 3.6);
      const sw = new THREE.Mesh(swGeo, this.modernPlazaMat);
      sw.position.set(side === 'left' ? -length / 2 : length / 2, 0.12, cz);
      sw.receiveShadow = true;
      street.add(sw);

      const curbEdgeGeo = new THREE.BoxGeometry(length, 0.28, 0.24);
      const curbEdge = new THREE.Mesh(curbEdgeGeo, this.curbMat);
      curbEdge.position.set(side === 'left' ? -length / 2 : length / 2, 0.14, cz + (cz > 0 ? -1.8 : 1.8));
      street.add(curbEdge);
    }

    return street;
  }
}
