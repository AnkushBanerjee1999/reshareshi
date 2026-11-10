import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { BuildingGenerator } from './BuildingGenerator.js';
import { EnvironmentBuilder } from './EnvironmentBuilder.js';
import { TextureGenerator } from './TextureGenerator.js';
import { SplinePath } from './SplinePath.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Dynamic Curved Grand Prix Race Track
 *
 * Spans a challenging 1200m circuit with:
 * - Mathematical curvature via SplinePath
 * - Continuous curved asphalt road ribbon with 5 racing lanes and central tram tracks
 * - Yellow & black striped curbs with friction penalties on impact
 * - Glowing Neon Magenta Chevrons (>>> / <<<) on corner entries & apexes
 * - Grand Start Gantry (Z = 0) & Finish Archway (Z = -1200)
 * - Layered Kolkata Architecture, trees & streetlights cleanly aligned without overlap
 */
export class RaceTrack {
  constructor(scene) {
    this.scene = scene;
    this.spline = new SplinePath();
    this.buildingGen = new BuildingGenerator();
    this.envBuilder = new EnvironmentBuilder();

    // Track Geometry Specs
    this.trackLength = 1200.0;
    this.roadWidth = 14.6;
    this.sidewalkWidth = 3.8;
    this.buildingDepth = 8.0;

    // Track state: 40m segments with 8 sub-slices (5m resolution)
    this.segmentLength = 40.0;
    this.slicesPerSeg = 8;
    this.activeSegments = [];
    this.nextSegmentZ = 50.0;

    // Materials
    this.roadTexture = TextureGenerator.createRoadTexture();
    this.roadTexture.anisotropy = 8;
    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.88,
      metalness: 0.04,
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    this.sidewalkTexture = TextureGenerator.createSidewalkTileTexture();
    this.sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.sidewalkTexture,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.hazardCurbTexture = TextureGenerator.createHazardCurbTexture();
    this.hazardCurbTexture.anisotropy = 8;
    this.curbMat = new THREE.MeshStandardMaterial({
      map: this.hazardCurbTexture,
      roughness: 0.65,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    this.curbStripeMat = new THREE.MeshBasicMaterial({ color: 0xffb703, side: THREE.DoubleSide });
    this.groundMat = new THREE.MeshStandardMaterial({ color: 0x0e0d14, roughness: 1.0, side: THREE.DoubleSide });

    this.guardrailMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      roughness: 0.35,
      metalness: 0.82
    });

    this.guardrailPostMat = new THREE.MeshToonMaterial({
      color: 0x2c3e50,
      roughness: 0.6
    });

    this.reflectorAmberMat = new THREE.MeshBasicMaterial({ color: 0xffa502 });

    this.steelRailMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      roughness: 0.22,
      metalness: 0.82
    });

    this.tieWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.85
    });

    this.sharedTieGeo = new THREE.BoxGeometry(2.5, 0.035, 0.24);

    this.root = new THREE.Group();
    this.root.name = 'RaceTrackCourse';
    this.scene.add(this.root);

    // Build Start and Finish structures
    this.buildStartGantry();
    this.buildFinishGantry();

    // Populate initial segments
    this.init();
  }

  init() {
    this.clearSegments();
    this.nextSegmentZ = 50.0;
    // Pre-spawn segments around start
    for (let i = 0; i < 7; i++) {
      this.createSegment(this.nextSegmentZ);
      this.nextSegmentZ -= this.segmentLength;
    }
  }

  // ==========================================
  // STARTING GANTRY & GRID (Z = 0)
  // ==========================================

  buildStartGantry() {
    const startGroup = new THREE.Group();
    startGroup.position.set(0, 0, 0);

    // Checkered Starting Line on Asphalt
    const checkGeo = new THREE.PlaneGeometry(this.roadWidth, 2.5);
    checkGeo.rotateX(-Math.PI / 2);
    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 512;
    checkCanvas.height = 128;
    const ctx = checkCanvas.getContext('2d');
    const size = 32;
    for (let y = 0; y < 128; y += size) {
      for (let x = 0; x < 512; x += size) {
        ctx.fillStyle = ((x / size) + (y / size)) % 2 === 0 ? '#ffffff' : '#111111';
        ctx.fillRect(x, y, size, size);
      }
    }
    const checkTexture = new THREE.CanvasTexture(checkCanvas);
    const checkMat = new THREE.MeshBasicMaterial({ map: checkTexture });
    const checkLine = new THREE.Mesh(checkGeo, checkMat);
    checkLine.position.y = 0.025;
    startGroup.add(checkLine);

    // Starting grid boxes
    const gridPoints = [
      { x: -3.5, z: 2.5 },
      { x: 3.5, z: 2.5 },
      { x: -1.2, z: 6.5 },
      { x: 1.2, z: 6.5 },
      { x: -4.5, z: 10.5 },
      { x: 0.0, z: 10.5 },
      { x: 4.5, z: 10.5 }
    ];
    for (const pt of gridPoints) {
      const boxGeo = new THREE.RingGeometry(0.85, 0.95, 4);
      boxGeo.rotateX(-Math.PI / 2);
      boxGeo.rotateY(Math.PI / 4);
      const boxMesh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xf1c40f }));
      boxMesh.position.set(pt.x, 0.03, pt.z);
      startGroup.add(boxMesh);
    }

    // Overhead Starting Gantry Truss Arch
    const gantry = new THREE.Group();
    gantry.position.set(0, 0, 0);

    const postMat = new THREE.MeshToonMaterial({ color: 0x2c3e50 });
    for (const side of [-1, 1]) {
      const postX = side * (this.roadWidth / 2 + 0.8);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8.5, 0.6), postMat);
      post.position.set(postX, 4.25, 0);
      gantry.add(post);
    }

    const beam = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 2.2, 1.2, 0.8), postMat);
    beam.position.set(0, 8.2, 0);
    gantry.add(beam);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = '#c0392b';
    bCtx.fillRect(0, 0, 1024, 256);
    bCtx.strokeStyle = '#f1c40f';
    bCtx.lineWidth = 14;
    bCtx.strokeRect(10, 10, 1004, 236);
    bCtx.fillStyle = '#f1c40f';
    bCtx.font = 'bold 84px Impact, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('★ KOLKATA GRAND PRIX ★', 512, 110);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 56px "Trebuchet MS", sans-serif';
    bCtx.fillText('START LINE', 512, 190);

    const bannerMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bannerCanvas) });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 2.8), bannerMat);
    bannerMesh.position.set(0, 7.8, 0.42);
    gantry.add(bannerMesh);

    startGroup.add(gantry);
    this.root.add(startGroup);
  }

  // ==========================================
  // FINISH LINE GANTRY (Z = -1200)
  // ==========================================

  buildFinishGantry() {
    const finishGroup = new THREE.Group();
    finishGroup.position.set(0, 0, -this.trackLength);

    const checkGeo = new THREE.PlaneGeometry(this.roadWidth, 4.0);
    checkGeo.rotateX(-Math.PI / 2);
    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 512;
    checkCanvas.height = 128;
    const ctx = checkCanvas.getContext('2d');
    const size = 32;
    for (let y = 0; y < 128; y += size) {
      for (let x = 0; x < 512; x += size) {
        ctx.fillStyle = ((x / size) + (y / size)) % 2 === 0 ? '#ffffff' : '#111111';
        ctx.fillRect(x, y, size, size);
      }
    }
    const checkTexture = new THREE.CanvasTexture(checkCanvas);
    const checkMat = new THREE.MeshBasicMaterial({ map: checkTexture });
    const checkLine = new THREE.Mesh(checkGeo, checkMat);
    checkLine.position.y = 0.025;
    finishGroup.add(checkLine);

    const archGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf1c40f,
      roughness: 0.25,
      metalness: 0.85
    });

    for (const side of [-1, 1]) {
      const pX = side * (this.roadWidth / 2 + 0.9);
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9.5, 1.2), goldMat);
      pillar.position.set(pX, 4.75, 0);
      archGroup.add(pillar);
    }

    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 2.8, 1.8, 1.2), goldMat);
    archBeam.position.set(0, 9.2, 0);
    archGroup.add(archBeam);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = '#111111';
    bCtx.fillRect(0, 0, 1024, 256);
    bCtx.strokeStyle = '#f1c40f';
    bCtx.lineWidth = 14;
    bCtx.strokeRect(10, 10, 1004, 236);
    bCtx.fillStyle = '#f1c40f';
    bCtx.font = 'bold 88px Impact, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('★ FINISH LINE ★', 512, 115);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 50px "Trebuchet MS", sans-serif';
    bCtx.fillText('1200 METERS COMPLETE', 512, 195);

    const bannerMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bannerCanvas) });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 3.0), bannerMat);
    bannerMesh.position.set(0, 8.8, 0.52);
    archGroup.add(bannerMesh);

    finishGroup.add(archGroup);
    this.root.add(finishGroup);
  }

  // ==========================================
  // CURVED SEGMENT GEOMETRY BUILDERS
  // ==========================================

  buildCurvedRoadMesh(startZ, length, slices = 8) {
    const positions = [];
    const uvs = [];
    const indices = [];

    const step = length / slices;
    const hw = this.roadWidth / 2;

    for (let j = 0; j <= slices; j++) {
      const z = startZ - j * step;
      const cx = this.spline.getCenterAtZ(z);

      positions.push(cx - hw, 0.0, z);
      positions.push(cx + hw, 0.0, z);

      const v = (50.0 - z) / 12.0;
      uvs.push(0.0, v);
      uvs.push(1.0, v);

      if (j < slices) {
        const i0 = j * 2;
        const i1 = j * 2 + 1;
        const i2 = (j + 1) * 2;
        const i3 = (j + 1) * 2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, this.roadMaterial);
    mesh.receiveShadow = true;
    return mesh;
  }

  buildCurvedSidewalkMesh(startZ, length, side = 'left', slices = 8) {
    const positions = [];
    const uvs = [];
    const indices = [];

    const step = length / slices;
    const hw = this.roadWidth / 2;
    const cw = 0.45;
    const sw = this.sidewalkWidth + 1.2;

    for (let j = 0; j <= slices; j++) {
      const z = startZ - j * step;
      const cx = this.spline.getCenterAtZ(z);

      if (side === 'left') {
        const xOuter = cx - (hw + cw + sw);
        const xInner = cx - (hw + cw);
        positions.push(xOuter, 0.22, z);
        positions.push(xInner, 0.22, z);
      } else {
        const xInner = cx + (hw + cw);
        const xOuter = cx + (hw + cw + sw);
        positions.push(xInner, 0.22, z);
        positions.push(xOuter, 0.22, z);
      }

      const v = (50.0 - z) / 4.0;
      uvs.push(0.0, v);
      uvs.push(1.0, v);

      if (j < slices) {
        const i0 = j * 2;
        const i1 = j * 2 + 1;
        const i2 = (j + 1) * 2;
        const i3 = (j + 1) * 2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, this.sidewalkMat);
    mesh.receiveShadow = true;
    return mesh;
  }

  buildCurvedGroundMesh(startZ, length, slices = 8) {
    const positions = [];
    const indices = [];
    const step = length / slices;
    const totalHalfWidth = this.roadWidth / 2 + this.sidewalkWidth + 28.0;

    for (let j = 0; j <= slices; j++) {
      const z = startZ - j * step;
      const cx = this.spline.getCenterAtZ(z);

      positions.push(cx - totalHalfWidth, -0.05, z);
      positions.push(cx + totalHalfWidth, -0.05, z);

      if (j < slices) {
        const i0 = j * 2;
        const i1 = j * 2 + 1;
        const i2 = (j + 1) * 2;
        const i3 = (j + 1) * 2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, this.groundMat);
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * True 3D Stepped Hazard Curb with Vertical Face (Y = 0 to 0.34m)
   * Displays high-contrast yellow & black hazard stripes facing the driver.
   */
  buildCurvedCurbMesh(startZ, length, side = 'left', slices = 8) {
    const positions = [];
    const uvs = [];
    const indices = [];

    const step = length / slices;
    const hw = this.roadWidth / 2;
    const cw = 0.45;
    const curbHeight = 0.34;

    for (let j = 0; j <= slices; j++) {
      const z = startZ - j * step;
      const cx = this.spline.getCenterAtZ(z);

      const xInner = side === 'left' ? (cx - hw) : (cx + hw);
      const xOuter = side === 'left' ? (cx - (hw + cw)) : (cx + (hw + cw));

      // 3 vertices: P0 (asphalt base), P1 (top front of vertical riser), P2 (top outer edge)
      positions.push(xInner, 0.0, z);
      positions.push(xInner, curbHeight, z);
      positions.push(xOuter, 0.22, z);

      const v = (50.0 - z) / 2.6;
      uvs.push(0.0, v);
      uvs.push(0.42, v);
      uvs.push(1.0, v);

      if (j < slices) {
        const i0 = j * 3;
        const i1 = j * 3 + 1;
        const i2 = j * 3 + 2;

        const k0 = (j + 1) * 3;
        const k1 = (j + 1) * 3 + 1;
        const k2 = (j + 1) * 3 + 2;

        if (side === 'left') {
          // Vertical face facing into road (+X)
          indices.push(i0, k0, i1);
          indices.push(i1, k0, k1);
          // Top bevel surface
          indices.push(i1, k1, i2);
          indices.push(i2, k1, k2);
        } else {
          // Vertical face facing into road (-X)
          indices.push(i0, i1, k0);
          indices.push(i1, k1, k0);
          // Top bevel surface
          indices.push(i1, i2, k1);
          indices.push(i2, k2, k1);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, this.curbMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Continuous 3D Galvanized Steel Highway Guardrail (W-Beam Profile & Posts)
   * Provides prominent physical barrier separation between racetrack and surrounding city.
   */
  buildCurvedGuardrailMesh(startZ, length, side = 'left', slices = 8) {
    const group = new THREE.Group();
    const positions = [];
    const uvs = [];
    const indices = [];

    const step = length / slices;
    const hw = this.roadWidth / 2;
    const cw = 0.45;
    const railXOffset = side === 'left' ? -(hw + cw) : (hw + cw);

    for (let j = 0; j <= slices; j++) {
      const z = startZ - j * step;
      const cx = this.spline.getCenterAtZ(z);
      const rx = cx + railXOffset;

      // Corrugated W-beam profile (3 vertical slices: lower, middle ridge, upper)
      positions.push(rx, 0.46, z);
      positions.push(rx + (side === 'left' ? 0.04 : -0.04), 0.66, z);
      positions.push(rx, 0.86, z);

      const v = (50.0 - z) / 3.0;
      uvs.push(0.0, v);
      uvs.push(0.5, v);
      uvs.push(1.0, v);

      if (j < slices) {
        const i0 = j * 3;
        const i1 = j * 3 + 1;
        const i2 = j * 3 + 2;
        const k0 = (j + 1) * 3;
        const k1 = (j + 1) * 3 + 1;
        const k2 = (j + 1) * 3 + 2;

        if (side === 'left') {
          indices.push(i0, k0, i1);
          indices.push(i1, k0, k1);
          indices.push(i1, k1, i2);
          indices.push(i2, k1, k2);
        } else {
          indices.push(i0, i1, k0);
          indices.push(i1, k1, k0);
          indices.push(i1, i2, k1);
          indices.push(i2, k2, k1);
        }
      }
    }

    const railGeo = new THREE.BufferGeometry();
    railGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    railGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    railGeo.setIndex(indices);
    railGeo.computeVertexNormals();

    const railMesh = new THREE.Mesh(railGeo, this.guardrailMat);
    railMesh.castShadow = true;
    railMesh.receiveShadow = true;
    group.add(railMesh);

    // Steel support posts & amber reflectors every 3.5m
    const postCount = Math.floor(length / 3.5);
    for (let p = 0; p <= postCount; p++) {
      const pz = startZ - p * 3.5;
      const pcx = this.spline.getCenterAtZ(pz);
      const px = pcx + railXOffset + (side === 'left' ? -0.06 : 0.06);

      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.12), this.guardrailPostMat);
      post.position.set(px, 0.48, pz);
      post.castShadow = true;
      group.add(post);

      const reflector = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.16), this.reflectorAmberMat);
      reflector.position.set(pcx + railXOffset + (side === 'left' ? 0.05 : -0.05), 0.68, pz);
      group.add(reflector);
    }

    return group;
  }

  buildCurvedTramRails(startZ, length, slices = 8) {
    const group = new THREE.Group();
    const step = length / slices;

    for (const railOffset of [-1.1, 1.1]) {
      const positions = [];
      const indices = [];

      for (let j = 0; j <= slices; j++) {
        const z = startZ - j * step;
        const cx = this.spline.getCenterAtZ(z);

        const x1 = cx + railOffset - 0.06;
        const x2 = cx + railOffset + 0.06;

        positions.push(x1, 0.035, z);
        positions.push(x2, 0.035, z);

        if (j < slices) {
          const i0 = j * 2;
          const i1 = j * 2 + 1;
          const i2 = (j + 1) * 2;
          const i3 = (j + 1) * 2 + 1;
          indices.push(i0, i2, i1);
          indices.push(i1, i2, i3);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, this.steelRailMat);
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    // Wooden cross-ties every 2.6m
    const tieCount = Math.floor(length / 2.6);
    for (let t = 0; t < tieCount; t++) {
      const tz = startZ - t * 2.6;
      const cx = this.spline.getCenterAtZ(tz);
      const angle = this.spline.getTangentAngleAtZ(tz);
      const tie = new THREE.Mesh(this.sharedTieGeo, this.tieWoodMat);
      tie.position.set(cx, 0.018, tz);
      tie.rotation.y = angle;
      group.add(tie);
    }

    return group;
  }

  // ==========================================
  // DYNAMIC SEGMENT GENERATION
  // ==========================================

  createSegment(startZ) {
    const segment = new THREE.Group();
    segment.name = `RaceTrackSeg_${startZ}`;
    const length = this.segmentLength;
    const slices = this.slicesPerSeg;
    const endZ = startZ - length;
    segment.userData = { startZ, endZ };

    const hw = this.roadWidth / 2;
    const cw = 0.45;
    const sw = this.sidewalkWidth + 1.2;

    // 1. Curved Road Ribbon (Clean, uninterrupted realistic asphalt with white dashed lane dividers)
    const road = this.buildCurvedRoadMesh(startZ, length, slices);
    segment.add(road);

    // 3. Left & Right Tiled Sidewalks (Raised to Y = 0.22m)
    const swLeft = this.buildCurvedSidewalkMesh(startZ, length, 'left', slices);
    const swRight = this.buildCurvedSidewalkMesh(startZ, length, 'right', slices);
    segment.add(swLeft);
    segment.add(swRight);

    // 4. True 3D Stepped Hazard Curbs (Y = 0 to 0.34m vertical face with yellow/black hazard blocks)
    const curbLeft = this.buildCurvedCurbMesh(startZ, length, 'left', slices);
    const curbRight = this.buildCurvedCurbMesh(startZ, length, 'right', slices);
    segment.add(curbLeft);
    segment.add(curbRight);

    // Ground fill ribbon extending beyond sidewalks (curves with track, prevents any void)
    const ground = this.buildCurvedGroundMesh(startZ, length, slices);
    segment.add(ground);

    // Continuous solid yellow safety stripe along curb top edge (matching reference screenshot)
    for (const curbSide of ['left', 'right']) {
      const stripePositions = [];
      const stripeIndices = [];
      const sStep = length / slices;
      const stripeWidth = 0.18;
      const curbTopY = (offset) => 0.34 - (0.12 / cw) * offset + 0.006;
      for (let j = 0; j <= slices; j++) {
        const z = startZ - j * sStep;
        const cx = this.spline.getCenterAtZ(z);
        const sign = curbSide === 'left' ? -1 : 1;
        const xInner = cx + sign * hw;
        const xOuter = cx + sign * (hw + stripeWidth);
        stripePositions.push(xInner, curbTopY(0), z);
        stripePositions.push(xOuter, curbTopY(stripeWidth), z);
        if (j < slices) {
          const i0 = j * 2, i1 = j * 2 + 1, i2 = (j + 1) * 2, i3 = (j + 1) * 2 + 1;
          if (curbSide === 'left') {
            stripeIndices.push(i0, i2, i1);
            stripeIndices.push(i1, i2, i3);
          } else {
            stripeIndices.push(i0, i1, i2);
            stripeIndices.push(i1, i3, i2);
          }
        }
      }
      const stripeGeo = new THREE.BufferGeometry();
      stripeGeo.setAttribute('position', new THREE.Float32BufferAttribute(stripePositions, 3));
      stripeGeo.setIndex(stripeIndices);
      stripeGeo.computeVertexNormals();
      const stripe = new THREE.Mesh(stripeGeo, this.curbStripeMat);
      segment.add(stripe);
    }

    // 5. Roadside Glowing Diya Lamps & Cones along Curbs (Matching reference screenshot)
    for (const dZ of [startZ - 6.0, startZ - 18.0, startZ - 30.0, startZ - 42.0]) {
      const dCX = this.spline.getCenterAtZ(dZ);
      const dAngle = this.spline.getTangentAngleAtZ(dZ);

      // Glowing Diya Lamp on the curb bevel
      const diyaSide = (Math.floor(Math.abs(dZ) / 12) % 2 === 0) ? 1 : -1;
      const diyaX = dCX + diyaSide * (hw + cw * 0.5);
      const diya = this.envBuilder.createDiyaLamp();
      diya.position.set(diyaX, 0.28, dZ);
      diya.rotation.y = dAngle;
      segment.add(diya);

      // Roadside Traffic Cone on sidewalk near curb
      if (Math.abs(dZ) % 24 < 6) {
        const coneSide = -diyaSide;
        const coneX = dCX + coneSide * (hw + cw + 0.55);
        const cone = this.envBuilder.createTrafficCone();
        cone.position.set(coneX, 0.22, dZ);
        segment.add(cone);
      }
    }

    // 6. City Surroundings: Modern Skyscrapers, Louvered Buildings, Urban Parks & Intersections
    const neonTitles = ['METROPOLIS GP', 'CYBERCITY 99', 'SPEEDWAY LOUNGE', 'HOTEL NIRVANA', 'BLUE HORIZON', 'ROYAL MOTORS', 'TURBO RUSH'];
    const neonThemes = ['cyan', 'yellow', 'pink'];

    const segIdx = Math.floor(Math.abs(startZ) / length);
    const patternType = segIdx % 4; // 0: Modern Commercial, 1: City Intersection, 2: Mixed Heritage, 3: Urban Park Plaza

    const midZ = startZ - length * 0.5;
    const midCX = this.spline.getCenterAtZ(midZ);
    const midAngle = this.spline.getTangentAngleAtZ(midZ);

    if (patternType === 1 && Math.abs(startZ) > 40.0) {
      // ---------------------------------------------------------
      // PATTERN 1: MAJOR CITY INTERSECTION & CROSS-STREET (Reference Screenshot)
      // ---------------------------------------------------------
      const crossSide = (segIdx % 8 === 1) ? 'left' : 'right';
      const sideSign = crossSide === 'left' ? -1 : 1;

      // 1. Cross-street boulevard with zebra crosswalk extending into the city
      const crossStreet = this.buildingGen.createCrossStreet(38.0, 12.0, crossSide);
      const crossX = midCX + sideSign * (hw + cw + sw + 1.0);
      crossStreet.position.set(crossX, 0, midZ);
      crossStreet.rotation.y = midAngle;
      segment.add(crossStreet);

      // 2. 4-Way Modern Cross Streetlamp at the corner with warm golden luminous flares (as seen in screenshot)
      const lampCorner = this.envBuilder.createIntersectionCrossLamp();
      const lampX = midCX + sideSign * (hw + cw + 1.4);
      lampCorner.position.set(lampX, 0.22, midZ + 7.5);
      lampCorner.rotation.y = midAngle;
      segment.add(lampCorner);

      // 3. Flanking Modern Skyscraper beyond the intersection corner
      const skyH = MathUtils.randomRange(28, 36);
      const skyBldg = this.buildingGen.createGlassSkyscraper(16.0, skyH, 14.0, crossSide);
      const skyX = midCX + sideSign * (hw + cw + sw + 18.0);
      skyBldg.position.set(skyX, 0, midZ - 18.0);
      skyBldg.rotation.y = midAngle + (sideSign > 0 ? Math.PI : 0);
      segment.add(skyBldg);

      // 4. Opposite side: Modern Louvered Commercial Building
      const oppSide = crossSide === 'left' ? 'right' : 'left';
      const oppSign = -sideSign;
      const louvH = MathUtils.randomRange(22, 28);
      const louvBldg = this.buildingGen.createLouveredCommercialBuilding(18.0, louvH, 14.0, oppSide);
      const louvX = midCX + oppSign * (hw + cw + sw + 8.5);
      louvBldg.position.set(louvX, 0, midZ);
      louvBldg.rotation.y = midAngle + (oppSign > 0 ? Math.PI : 0);
      segment.add(louvBldg);

    } else if (patternType === 3 && Math.abs(startZ) > 40.0) {
      // ---------------------------------------------------------
      // PATTERN 3: URBAN PUBLIC PARK & FOUNTAIN PLAZA (Reference Screenshot)
      // ---------------------------------------------------------
      const parkSide = (segIdx % 8 === 3) ? 'left' : 'right';
      const parkSign = parkSide === 'left' ? -1 : 1;

      // 1. Manicured Green Lawn Park with Central Circular Water Fountain, Globe Monument & Leafy Trees
      const parkPlaza = this.buildingGen.createUrbanParkPlaza(26.0, 36.0);
      const parkX = midCX + parkSign * (hw + cw + sw + 14.5);
      parkPlaza.position.set(parkX, 0.05, midZ);
      parkPlaza.rotation.y = midAngle + (parkSign > 0 ? Math.PI : 0);
      segment.add(parkPlaza);

      // 2. Opposite side: Modern Blue Reflective Glass Skyscraper
      const oppSide = parkSide === 'left' ? 'right' : 'left';
      const oppSign = -parkSign;
      const skyH = MathUtils.randomRange(30, 40);
      const skyBldg = this.buildingGen.createGlassSkyscraper(16.0, skyH, 14.0, oppSide);
      const skyX = midCX + oppSign * (hw + cw + sw + 8.5);
      skyBldg.position.set(skyX, 0, midZ);
      skyBldg.rotation.y = midAngle + (oppSign > 0 ? Math.PI : 0);

      if (Math.random() > 0.4) {
        const sign = this.envBuilder.createGTANeonSign(MathUtils.randomChoice(neonTitles), MathUtils.randomChoice(neonThemes));
        sign.position.set(0, skyH, 0);
        skyBldg.add(sign);
      }
      segment.add(skyBldg);

    } else {
      // ---------------------------------------------------------
      // PATTERN 0 & 2: MODERN COMMERCIAL BOULEVARD & HERITAGE BLOCKS
      // ---------------------------------------------------------
      for (const side of [-1, 1]) {
        const isLeft = side < 0;
        const bZ = midZ;
        const bCX = midCX;
        const bAngle = midAngle;

        const rand = (segIdx + (isLeft ? 1 : 2)) % 3;
        let bldg = null;
        let bH = 22;

        if (rand === 0) {
          // Modern Blue Reflective Glass Skyscraper (matching reference screenshot)
          bH = MathUtils.randomRange(28, 38);
          bldg = this.buildingGen.createGlassSkyscraper(16.0, bH, 14.0, isLeft ? 'left' : 'right');
        } else if (rand === 1) {
          // Modern Horizontal Louvered Commercial Building (matching reference screenshot)
          bH = MathUtils.randomRange(22, 28);
          bldg = this.buildingGen.createLouveredCommercialBuilding(16.0, bH, 14.0, isLeft ? 'left' : 'right');
        } else {
          // Authentic Kolkata Colonial Heritage Facade
          bH = MathUtils.randomRange(18, 26);
          bldg = this.buildingGen.createBuilding(12.0, bH, this.buildingDepth, isLeft ? 'left' : 'right');
        }

        const bX = bCX + side * (hw + cw + sw + 8.5);
        bldg.position.set(bX, 0, bZ);
        bldg.rotation.y = bAngle + (side > 0 ? Math.PI : 0);

        if (Math.random() > 0.45) {
          const sign = this.envBuilder.createGTANeonSign(MathUtils.randomChoice(neonTitles), MathUtils.randomChoice(neonThemes));
          sign.position.set(0, bH, 0);
          bldg.add(sign);
        }
        segment.add(bldg);
      }
    }

    // 7. City Trees & Streetlights along sidewalks (matching reference screenshot)
    for (const zOffset of [8.0, 24.0]) {
      const pZ = startZ - zOffset;
      const pCX = this.spline.getCenterAtZ(pZ);
      const pAngle = this.spline.getTangentAngleAtZ(pZ);

      // Alternating Leafy City Shade Trees & Royal Palms along sidewalk
      for (const side of [-1, 1]) {
        const treeX = pCX + side * (hw + cw + 1.2);
        const useStreetTree = (zOffset === 8.0 && side > 0) || (zOffset === 24.0 && side < 0);
        const tree = useStreetTree ? this.envBuilder.createStreetTree() : this.envBuilder.createRoyalPalmTree();
        tree.position.set(treeX, 0.22, pZ);
        tree.rotation.y = pAngle + (side > 0 ? Math.PI : 0) + (Math.random() - 0.5) * 0.4;
        segment.add(tree);
      }
    }

    // Streetlights spaced every 20m
    for (const zOffset of [16.0, 36.0]) {
      const pZ = startZ - zOffset;
      const pCX = this.spline.getCenterAtZ(pZ);
      const pAngle = this.spline.getTangentAngleAtZ(pZ);

      for (const side of [-1, 1]) {
        const lightX = pCX + side * (hw + cw + 0.35);
        const light = this.envBuilder.createStreetLight();
        light.position.set(lightX, 0.22, pZ);
        light.rotation.y = pAngle + (side > 0 ? Math.PI : 0);
        segment.add(light);
      }
    }

    // 8. Parked City Vehicles (Ambassador Taxis in roadside parking bays)
    if (Math.random() > 0.4) {
      const taxiSide = Math.random() > 0.5 ? 1 : -1;
      const tZ = startZ - 18.0;
      const tCX = this.spline.getCenterAtZ(tZ);
      const tAngle = this.spline.getTangentAngleAtZ(tZ);
      const taxiX = tCX + taxiSide * (hw + cw + sw * 0.75);
      const taxi = this.envBuilder.createYellowTaxi();
      taxi.position.set(taxiX, 0.22, tZ);
      taxi.rotation.y = tAngle + (taxiSide > 0 ? Math.PI : 0);
      segment.add(taxi);
    }

    // 9. Roadside Kolkata Chai Dukan on sidewalk
    if (Math.random() > 0.55) {
      const stallSide = Math.random() > 0.5 ? 1 : -1;
      const sZ = startZ - 32.0;
      const sCX = this.spline.getCenterAtZ(sZ);
      const sAngle = this.spline.getTangentAngleAtZ(sZ);
      const stallX = sCX + stallSide * (hw + cw + sw * 0.70);
      const stall = this.envBuilder.createChaiStall();
      stall.position.set(stallX, 0.22, sZ);
      stall.rotation.y = sAngle + (stallSide > 0 ? -Math.PI / 2 : Math.PI / 2);
      segment.add(stall);
    }

    // 10. Roadside Kolkata Puchka (Pani Puri) Vendor Cart on sidewalk
    if (Math.random() > 0.45) {
      const cartSide = Math.random() > 0.5 ? 1 : -1;
      const cZ = startZ - 12.0;
      const cCX = this.spline.getCenterAtZ(cZ);
      const cAngle = this.spline.getTangentAngleAtZ(cZ);
      const cartX = cCX + cartSide * (hw + cw + sw * 0.70);
      const cart = this.envBuilder.createPuchkaCart();
      cart.position.set(cartX, 0.22, cZ);
      cart.rotation.y = cAngle + (cartSide > 0 ? -Math.PI / 2 : Math.PI / 2);
      segment.add(cart);
    }

    // 11. Kolkata Police Blue & White Pagoda Traffic Booth at sidewalk intersections
    const policeLocations = [-40.0, -280.0, -520.0, -780.0, -1000.0];
    for (const pZ of policeLocations) {
      if (startZ >= pZ && (startZ - length) < pZ) {
        const pSide = -1; // Left sidewalk
        const pCX = this.spline.getCenterAtZ(pZ);
        const pAngle = this.spline.getTangentAngleAtZ(pZ);
        const boothX = pCX + pSide * (hw + cw + sw * 0.72);
        const booth = this.envBuilder.createKolkataPoliceBooth();
        booth.position.set(boothX, 0.22, pZ);
        booth.rotation.y = pAngle + Math.PI / 2;
        segment.add(booth);
      }
    }

    // 12. Vintage Calcutta Tramways Company (CTC) Green & Cream Electric Tram on roadside sidings
    const tramLocations = [-75.0, -620.0];
    for (const tZ of tramLocations) {
      if (startZ >= tZ && (startZ - length) < tZ) {
        const tramSide = 1; // Right side tram siding platform
        const tCX = this.spline.getCenterAtZ(tZ);
        const tAngle = this.spline.getTangentAngleAtZ(tZ);
        const tramX = tCX + tramSide * (hw + cw + sw * 0.85);
        const tramCar = this.envBuilder.createKolkataTramCar();
        tramCar.position.set(tramX, 0.22, tZ);
        tramCar.rotation.y = tAngle;
        segment.add(tramCar);
      }
    }

    // 13. Iconic Howrah Bridge Cantilever Steel Lattice Overhead Portal Truss
    const howrahLocations = [-120.0, -560.0, -1040.0];
    for (const hZ of howrahLocations) {
      if (startZ >= hZ && (startZ - length) < hZ) {
        const arch = this.envBuilder.createHowrahBridgeArch(this.roadWidth + 2.5);
        const hCX = this.spline.getCenterAtZ(hZ);
        const hAngle = this.spline.getTangentAngleAtZ(hZ);
        arch.position.set(hCX, 0, hZ);
        arch.rotation.y = hAngle;
        segment.add(arch);
      }
    }

    // 14. Overhead Central Tram Electrical Cables & Suspension Web
    const tramWires = this.envBuilder.createOverheadTramWires(length);
    const wireMidZ = startZ - length * 0.5;
    const wireCX = this.spline.getCenterAtZ(wireMidZ);
    const wireAngle = this.spline.getTangentAngleAtZ(wireMidZ);
    tramWires.position.set(wireCX, 0, startZ);
    tramWires.rotation.y = wireAngle;
    segment.add(tramWires);

    // 15. Elevated Metro Viaduct & Highway Flyover overhead
    if (Math.abs(startZ) > 160.0 && Math.abs(startZ) < 1100.0 && Math.abs(startZ % 160.0) < 40.0) {
      const viaduct = this.envBuilder.createMetroViaduct(length);
      const vX = this.spline.getCenterAtZ(midZ) + (hw + cw + sw + 9.5);
      viaduct.position.set(vX, 0, midZ);
      viaduct.rotation.y = this.spline.getTangentAngleAtZ(midZ);
      segment.add(viaduct);
    }

    // 16. Neon Magenta Turn Chevrons (>>> / <<<) along curves (matching reference design)
    const curvature = this.spline.getCurvatureAtZ(midZ);
    if (Math.abs(curvature) > 0.0012) {
      const isRight = curvature > 0;
      const sign = isRight ? -1 : 1; // Outside of turn (left barrier for right turn, right barrier for left turn)
      const chevX = this.spline.getCenterAtZ(midZ) + sign * (hw + cw + 0.45);
      const chevron = this.envBuilder.createNeonChevronSign();
      chevron.position.set(chevX, 0.16, midZ);
      const roadHeading = this.spline.getTangentAngleAtZ(midZ);
      chevron.rotation.y = roadHeading + (isRight ? 0.22 : -0.22);
      if (!isRight) {
        chevron.scale.x = -1; // Flip arrows to point left <<< on left turns
      }
      segment.add(chevron);
    }

    this.root.add(segment);
    this.activeSegments.push(segment);
    return segment;
  }

  update(playerZ) {
    // Recycle behind player
    while (this.activeSegments.length > 0 && this.activeSegments[0].userData.endZ > playerZ + 45.0) {
      const oldSeg = this.activeSegments.shift();
      this.root.remove(oldSeg);
      oldSeg.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.dispose();
        }
      });
    }

    // Spawn ahead up to finish line
    const spawnTargetZ = playerZ - 210.0;
    while (this.nextSegmentZ > spawnTargetZ && this.nextSegmentZ > -this.trackLength - 60.0) {
      this.createSegment(this.nextSegmentZ);
      this.nextSegmentZ -= this.segmentLength;
    }
  }

  clearSegments() {
    for (const seg of this.activeSegments) {
      this.root.remove(seg);
      seg.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.dispose();
        }
      });
    }
    this.activeSegments = [];
    this.nextSegmentZ = 50.0;
  }
}
