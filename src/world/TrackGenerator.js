import * as THREE from 'three';
import { TRACK, COLORS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { BuildingGenerator } from './BuildingGenerator.js';
import { EnvironmentBuilder } from './EnvironmentBuilder.js';
import { TextureGenerator } from './TextureGenerator.js';
import { SplinePath } from './SplinePath.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Endless Procedural Track & Street Generator
 *
 * Assembles high-density Kolkata heritage streets with:
 * - Twin metallic tram tracks with wooden ties embedded in asphalt
 * - Detailed heritage architecture lining both sides
 * - Parked yellow Ambassador cabs along curbs
 * - Traditional tea stalls and puchka carts
 * - Cast-iron streetlamps and overhead cable crossings
 */
export class TrackGenerator {
  constructor(scene) {
    this.scene = scene;
    this.spline = new SplinePath();
    this.buildingGen = new BuildingGenerator();
    this.envBuilder = new EnvironmentBuilder();

    this.segmentLength = TRACK.SEGMENT_LENGTH;
    this.roadWidth = TRACK.ROAD_WIDTH;
    this.sidewalkWidth = TRACK.SIDEWALK_WIDTH;

    // Segment tracking
    this.activeSegments = [];
    this.nextSegmentZ = 0.0;
    this.totalSegmentsCreated = 0;

    // Reusable Materials
    this.roadTexture = TextureGenerator.createRoadTexture();
    this.roadMaterial = new THREE.MeshToonMaterial({
      map: this.roadTexture,
      roughness: 0.92
    });

    this.sidewalkMaterial = new THREE.MeshToonMaterial({
      color: COLORS.SIDEWALK,
      roughness: 0.85
    });

    this.curbMaterial = new THREE.MeshToonMaterial({
      color: COLORS.SIDEWALK_CURB,
      roughness: 0.88
    });

    this.steelRailMat = new THREE.MeshToonMaterial({
      color: 0xbdc3c7,
      roughness: 0.2
    });

    this.tieWoodMat = new THREE.MeshToonMaterial({
      color: 0x3e2723,
      roughness: 0.8
    });

    this.wireMat = new THREE.LineBasicMaterial({
      color: 0x111111,
      linewidth: 1
    });

    this.init();
  }

  init() {
    this.clear();
    // Pre-populate segments from behind player (+50m) to ahead (-200m)
    this.nextSegmentZ = 50.0;
    for (let i = 0; i < TRACK.TOTAL_ACTIVE_SEGMENTS + 1; i++) {
      this.createSegment(this.nextSegmentZ);
      this.nextSegmentZ -= this.segmentLength;
    }
  }

  createSegment(centerZ) {
    const segment = new THREE.Group();
    segment.name = `TrackSegment_${this.totalSegmentsCreated++}`;
    segment.position.set(0, 0, centerZ);

    const length = this.segmentLength;

    // 1. Asphalt Road Surface
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, length);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.receiveShadow = true;
    segment.add(roadMesh);

    // 2. Central Polished Steel Tram Tracks with Wooden Sleepers
    const tramTrackGroup = new THREE.Group();
    for (const railX of [-0.95, 0.95]) {
      const railGeo = new THREE.BoxGeometry(0.12, 0.06, length);
      const rail = new THREE.Mesh(railGeo, this.steelRailMat);
      rail.position.set(railX, 0.035, 0);
      rail.receiveShadow = true;
      tramTrackGroup.add(rail);
    }

    const tieCount = Math.floor(length / 2.6);
    for (let t = 0; t < tieCount; t++) {
      const tieZ = (t - tieCount / 2) * 2.6;
      const tieGeo = new THREE.BoxGeometry(2.3, 0.035, 0.24);
      const tie = new THREE.Mesh(tieGeo, this.tieWoodMat);
      tie.position.set(0, 0.018, tieZ);
      tramTrackGroup.add(tie);
    }
    segment.add(tramTrackGroup);

    // 3. Sidewalks & Stone Curbs (Left & Right)
    for (const side of [-1, 1]) {
      const sidewalkX = side * (this.roadWidth / 2 + this.sidewalkWidth / 2);
      const sidewalkGeo = new THREE.BoxGeometry(this.sidewalkWidth, 0.26, length);
      const sidewalk = new THREE.Mesh(sidewalkGeo, this.sidewalkMaterial);
      sidewalk.position.set(sidewalkX, 0.13, 0);
      sidewalk.receiveShadow = true;
      segment.add(sidewalk);

      // Raised stone curb
      const curbX = side * (this.roadWidth / 2 + 0.1);
      const curbGeo = new THREE.BoxGeometry(0.22, 0.32, length);
      const curb = new THREE.Mesh(curbGeo, this.curbMaterial);
      curb.position.set(curbX, 0.16, 0);
      curb.receiveShadow = true;
      segment.add(curb);
    }

    // 4. Kolkata Buildings Lining Left & Right
    const buildingDepth = TRACK.BUILDING_DEPTH;
    const buildingWidth = 12.0;
    const buildingsPerSegment = Math.floor(length / buildingWidth);

    for (let b = 0; b < buildingsPerSegment; b++) {
      const bZ = (b - (buildingsPerSegment - 1) / 2) * buildingWidth;

      // Left building
      const leftH = MathUtils.randomRange(15, 23);
      const leftBuilding = this.buildingGen.createBuilding(buildingWidth - 0.2, leftH, buildingDepth, 'left');
      leftBuilding.position.set(-(this.roadWidth / 2 + this.sidewalkWidth + buildingDepth / 2), 0, bZ);
      segment.add(leftBuilding);

      // Right building
      const rightH = MathUtils.randomRange(15, 23);
      const rightBuilding = this.buildingGen.createBuilding(buildingWidth - 0.2, rightH, buildingDepth, 'right');
      rightBuilding.position.set(this.roadWidth / 2 + this.sidewalkWidth + buildingDepth / 2, 0, bZ);
      segment.add(rightBuilding);
    }

    // 5. Environmental Street Props & Details
    // Parked Yellow Ambassador Taxi (near curb)
    if (Math.random() > 0.28) {
      const taxiSide = Math.random() > 0.5 ? 1 : -1;
      const taxiX = taxiSide * (this.roadWidth / 2 - 1.35);
      const taxiZ = (Math.random() - 0.5) * (length * 0.65);
      const taxi = this.envBuilder.createYellowTaxi();
      taxi.position.set(taxiX, 0, taxiZ);
      taxi.rotation.y = taxiSide > 0 ? Math.PI : 0;
      segment.add(taxi);
    }

    // Roadside Chai Stall or Puchka Cart on Sidewalk
    if (Math.random() > 0.32) {
      const stallSide = Math.random() > 0.5 ? 1 : -1;
      const stallX = stallSide * (this.roadWidth / 2 + this.sidewalkWidth * 0.46);
      const stallZ = (Math.random() - 0.5) * (length * 0.7);

      if (Math.random() > 0.42) {
        const chai = this.envBuilder.createChaiStall();
        chai.position.set(stallX, 0.26, stallZ);
        chai.rotation.y = stallSide > 0 ? -Math.PI / 2 : Math.PI / 2;
        segment.add(chai);
      } else {
        const puchka = this.envBuilder.createPuchkaCart();
        puchka.position.set(stallX, 0.26, stallZ);
        puchka.rotation.y = stallSide > 0 ? -Math.PI / 2 : Math.PI / 2;
        segment.add(puchka);
      }
    }

    // Victorian Heritage Streetlights
    for (const side of [-1, 1]) {
      const lightX = side * (this.roadWidth / 2 + 0.65);
      const lightZ = (Math.random() - 0.5) * 22;
      const streetLight = this.envBuilder.createStreetLight();
      streetLight.position.set(lightX, 0.26, lightZ);
      streetLight.rotation.y = side > 0 ? Math.PI : 0;
      segment.add(streetLight);
    }

    // Concrete Utility Pole & Tangled Overhead Cables
    const poleSide = 1;
    const poleX = poleSide * (this.roadWidth / 2 + 1.25);
    const pole = this.envBuilder.createUtilityPole();
    pole.position.set(poleX, 0.26, 0);
    segment.add(pole);

    // Overhead electrical cables criss-crossing the street
    const wirePoints1 = [
      new THREE.Vector3(-poleX, 8.4, -length / 2),
      new THREE.Vector3(0, 7.6, 0),
      new THREE.Vector3(poleX, 8.4, length / 2)
    ];
    const wireLine1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePoints1), this.wireMat);
    segment.add(wireLine1);

    const wirePoints2 = [
      new THREE.Vector3(poleX, 7.5, -length / 2),
      new THREE.Vector3(0, 6.9, 0),
      new THREE.Vector3(-poleX, 7.5, length / 2)
    ];
    const wireLine2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePoints2), this.wireMat);
    segment.add(wireLine2);

    this.scene.add(segment);
    this.activeSegments.push(segment);
    return segment;
  }

  update(playerZ) {
    const despawnZ = playerZ + TRACK.DESPAWN_DISTANCE_BEHIND;
    while (this.activeSegments.length > 0 && this.activeSegments[0].position.z > despawnZ) {
      const oldSegment = this.activeSegments.shift();
      this.scene.remove(oldSegment);
    }

    const targetSpawnZ = playerZ - TRACK.SPAWN_DISTANCE_AHEAD;
    while (this.nextSegmentZ > targetSpawnZ) {
      this.createSegment(this.nextSegmentZ);
      this.nextSegmentZ -= this.segmentLength;
    }
  }

  clear() {
    for (const seg of this.activeSegments) {
      this.scene.remove(seg);
    }
    this.activeSegments = [];
    this.nextSegmentZ = 0.0;
  }
}
