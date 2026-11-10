import * as THREE from 'three';
import { TextureGenerator } from '../world/TextureGenerator.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Rickshaw Factory: Constructs detailed, authentic Kolkata cycle rickshaws & riders
 *
 * All models are oriented to face FORWARD toward Negative Z:
 * - Front wheel & handlebars at -Z
 * - Passenger seat & rear wheels at +Z
 * - Rider sits facing forward toward -Z
 * - Headlamp shines forward toward -Z
 */
export class RickshawFactory {
  /**
   * Creates a complete rickshaw 3D model with rider
   * @param {Object} config - Customization options
   *   - canopyColor: primary canopy hex color
   *   - canopyPattern: 'stripes' | 'taxi-check' | 'waves' | 'floral' | 'festival'
   *   - riderKurtaColor: kurta fabric hex color
   *   - riderLungiColor: lungi fabric hex color
   *   - riderGamchhaColor: gamchha scarf hex color
   *   - metalColor: frame steel color
   *   - seatColor: passenger cushion color
   */
  static createRickshawModel(config = {}) {
    const root = new THREE.Group();
    root.name = config.name || 'CycleRickshaw';

    const colors = {
      canopyPrimary: config.canopyColor || '#c02727',
      canopySecondary: config.canopySecondary || '#f1c40f',
      canopyPattern: config.canopyPattern || 'stripes',
      fringeColor: config.fringeColor || '#e67e22',
      riderKurta: config.riderKurtaColor || 0xf5f6fa,
      riderLungi: config.riderLungiColor || 0x227093,
      riderGamchha: config.riderGamchhaColor || 0xe67e22,
      seat: config.seatColor || 0x8b1e1e,
      steel: config.metalColor || 0x1a1e21,
      mudguard: config.mudguardColor || 0x9b1d20
    };

    // Shared Stylized Materials
    const steelMat = new THREE.MeshToonMaterial({ color: colors.steel, roughness: 0.35 });
    const chromeMat = new THREE.MeshToonMaterial({ color: 0xdfe6ed, roughness: 0.15 });
    const brassMat = new THREE.MeshToonMaterial({ color: 0xf39c12, roughness: 0.25 });
    const tireMat = new THREE.MeshToonMaterial({ color: 0x14171a, roughness: 0.9 });
    const seatMat = new THREE.MeshToonMaterial({ color: colors.seat, roughness: 0.65 });
    const darkWoodMat = new THREE.MeshToonMaterial({ color: 0x5a2d0c, roughness: 0.75 });
    const mudguardMat = new THREE.MeshToonMaterial({ color: colors.mudguard, roughness: 0.5 });
    const skinMat = new THREE.MeshToonMaterial({ color: 0x9c5936, roughness: 0.65 });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x191919 });

    const rearWheelRadius = 0.58;
    const frontWheelRadius = 0.44;
    const crankRadius = 0.22;

    // ----------------------------------------------------
    // 1. REAR PASSENGER CARRIAGE (+Z is rear, behind rider)
    // ----------------------------------------------------
    const rearChassis = new THREE.Group();
    rearChassis.name = 'RearChassis';

    // Tubular steel perimeter undercarriage (centered at Z = +0.65)
    const chassisGeo = new THREE.BoxGeometry(1.68, 0.1, 1.85);
    const chassis = new THREE.Mesh(chassisGeo, steelMat);
    chassis.position.set(0, 0.52, 0.65);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    rearChassis.add(chassis);

    // Rear solid steel axle
    const axleGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.82, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axle = new THREE.Mesh(axleGeo, chromeMat);
    axle.position.set(0, 0.52, 0.65);
    rearChassis.add(axle);

    // Leaf spring suspensions
    for (const side of [-0.68, 0.68]) {
      const springGroup = new THREE.Group();
      springGroup.position.set(side, 0.62, 0.65);

      const arcGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 16, Math.PI * 0.9);
      arcGeo.rotateY(Math.PI / 2);
      const arc = new THREE.Mesh(arcGeo, steelMat);
      springGroup.add(arc);

      const clampGeo = new THREE.BoxGeometry(0.08, 0.12, 0.1);
      const clamp = new THREE.Mesh(clampGeo, brassMat);
      springGroup.add(clamp);

      rearChassis.add(springGroup);
    }

    // Rear Spoked Wheels (Left and Right)
    const rearWheelL = RickshawFactory.createWheel(rearWheelRadius, 0.1, tireMat, chromeMat, brassMat);
    rearWheelL.position.set(-0.92, 0.58, 0.65);
    rearChassis.add(rearWheelL);

    const rearWheelR = RickshawFactory.createWheel(rearWheelRadius, 0.1, tireMat, chromeMat, brassMat);
    rearWheelR.position.set(0.92, 0.58, 0.65);
    rearChassis.add(rearWheelR);

    // Curved mudguards with reflector flaps
    for (const side of [-0.92, 0.92]) {
      const guardGroup = new THREE.Group();
      guardGroup.position.set(side, 0.62, 0.65);

      const guardGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.15, 20, 1, true, Math.PI * 0.15, Math.PI * 0.72);
      guardGeo.rotateZ(Math.PI / 2);
      const guard = new THREE.Mesh(guardGeo, mudguardMat);
      guard.material.side = THREE.DoubleSide;
      guardGroup.add(guard);

      // Hanging mudflap
      const flapGeo = new THREE.BoxGeometry(0.14, 0.22, 0.02);
      const flap = new THREE.Mesh(flapGeo, tireMat);
      flap.position.set(0, -0.32, 0.58);
      guardGroup.add(flap);

      rearChassis.add(guardGroup);
    }

    // Passenger hardwood floorboard
    const floorGeo = new THREE.BoxGeometry(1.36, 0.07, 1.25);
    const floor = new THREE.Mesh(floorGeo, darkWoodMat);
    floor.position.set(0, 0.65, 0.55);
    floor.castShadow = true;
    rearChassis.add(floor);

    // Lowered passenger footrest
    const stepGeo = new THREE.BoxGeometry(1.18, 0.05, 0.38);
    const step = new THREE.Mesh(stepGeo, steelMat);
    step.position.set(0, 0.38, -0.15);
    rearChassis.add(step);

    // Passenger Bench with Button-Tufted Leather Cushion
    const seatBaseGeo = new THREE.BoxGeometry(1.32, 0.24, 0.62);
    const seatBase = new THREE.Mesh(seatBaseGeo, seatMat);
    seatBase.position.set(0, 0.88, 0.72);
    seatBase.castShadow = true;
    rearChassis.add(seatBase);

    // Backrest cushion (faces forward toward -Z)
    const seatBackGeo = new THREE.BoxGeometry(1.32, 0.76, 0.18);
    const seatBack = new THREE.Mesh(seatBackGeo, seatMat);
    seatBack.position.set(0, 1.32, 0.98);
    seatBack.rotation.x = 0.1;
    seatBack.castShadow = true;
    rearChassis.add(seatBack);

    // Polished Armrests
    for (const side of [-0.68, 0.68]) {
      const armGroup = new THREE.Group();
      armGroup.position.set(side, 1.12, 0.72);

      const armWood = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.62), darkWoodMat);
      armGroup.add(armWood);

      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32), brassMat);
      post1.position.set(0, -0.18, 0.24);
      armGroup.add(post1);

      const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32), brassMat);
      post2.position.set(0, -0.18, -0.24);
      armGroup.add(post2);

      rearChassis.add(armGroup);
    }

    // ----------------------------------------------------
    // 2. REAR TIN ART PANEL (Facing backward toward +Z)
    // ----------------------------------------------------
    const plateGroup = new THREE.Group();
    plateGroup.position.set(0, 0.85, 1.12);

    const plateGeo = new THREE.PlaneGeometry(1.25, 0.65);
    const plateTexture = TextureGenerator.createRearPlateTexture();
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTexture, side: THREE.DoubleSide });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plateGroup.add(plate);

    const plateBorder = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.03), brassMat);
    plateBorder.position.z = -0.015;
    plateGroup.add(plateBorder);

    rearChassis.add(plateGroup);

    // ----------------------------------------------------
    // 3. COLORFUL FABRIC CANOPY
    // ----------------------------------------------------
    const canopyGroup = new THREE.Group();
    canopyGroup.name = 'Canopy';

    // Metal articulated canopy ribs
    for (let i = 0; i < 4; i++) {
      const ribGeo = new THREE.TorusGeometry(0.78, 0.024, 8, 20, Math.PI);
      const rib = new THREE.Mesh(ribGeo, chromeMat);
      rib.position.set(0, 1.58, 0.76 - i * 0.26);
      rib.rotation.x = 0.16 - i * 0.12;
      canopyGroup.add(rib);
    }

    // Canopy fabric hood
    const canopyGeo = new THREE.CylinderGeometry(0.80, 0.84, 1.12, 24, 1, true, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);

    const canopyTexture = TextureGenerator.createCanopyTexture({
      id: config.id || 'custom',
      primaryColor: colors.canopyPrimary,
      secondaryColor: colors.canopySecondary,
      fringeColor: colors.fringeColor,
      pattern: colors.canopyPattern
    });

    const canopyMaterial = new THREE.MeshToonMaterial({
      map: canopyTexture,
      side: THREE.DoubleSide,
      roughness: 0.75
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMaterial);
    canopyMesh.position.set(0, 1.62, 0.66);
    canopyMesh.rotation.x = 0.12;
    canopyMesh.castShadow = true;
    canopyGroup.add(canopyMesh);

    // Scalloped fringe valance
    const valanceGeo = new THREE.BoxGeometry(1.64, 0.16, 0.05);
    const valanceMat = new THREE.MeshToonMaterial({ color: 0xf1c40f });
    const valance = new THREE.Mesh(valanceGeo, valanceMat);
    valance.position.set(0, 1.56, 0.10);
    canopyGroup.add(valance);

    rearChassis.add(canopyGroup);
    root.add(rearChassis);

    // ----------------------------------------------------
    // 4. BICYCLE CHASSIS & CRANKSET (Forward is -Z)
    // ----------------------------------------------------
    const bikeFrame = new THREE.Group();
    bikeFrame.name = 'BikeFrame';

    // Truss tubes connecting to rear carriage
    for (const side of [-0.28, 0.28]) {
      const tubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.15);
      tubeGeo.rotateX(-Math.PI / 3.2);
      const tube = new THREE.Mesh(tubeGeo, steelMat);
      tube.position.set(side, 0.50, 0.08);
      bikeFrame.add(tube);
    }

    // Down tube (angles down toward crank at -0.42 Z)
    const downTubeGeo = new THREE.CylinderGeometry(0.042, 0.042, 1.12);
    downTubeGeo.rotateX(-Math.PI / 3.8);
    const downTube = new THREE.Mesh(downTubeGeo, steelMat);
    downTube.position.set(0, 0.68, -0.76);
    bikeFrame.add(downTube);

    // Double top-tubes
    for (const ty of [1.04, 1.12]) {
      const topTubeGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.02);
      topTubeGeo.rotateX(-Math.PI / 2.15);
      const topTube = new THREE.Mesh(topTubeGeo, steelMat);
      topTube.position.set(0, ty, -0.76);
      bikeFrame.add(topTube);
    }

    // Seat tube
    const seatTubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.96);
    seatTubeGeo.rotateX(Math.PI / 14);
    const seatTube = new THREE.Mesh(seatTubeGeo, steelMat);
    seatTube.position.set(0, 0.78, -0.38);
    bikeFrame.add(seatTube);

    // Driver Saddle (centered at Z = -0.32)
    const saddleGroup = new THREE.Group();
    saddleGroup.position.set(0, 1.24, -0.32);

    const saddleGeo = new THREE.ConeGeometry(0.22, 0.38, 8);
    saddleGeo.rotateX(-Math.PI / 2);
    saddleGeo.scale(1.2, 0.55, 1.0);
    const saddle = new THREE.Mesh(saddleGeo, new THREE.MeshToonMaterial({ color: 0x222f3e }));
    saddleGroup.add(saddle);
    bikeFrame.add(saddleGroup);

    // Crankset with 360-degree rotating crank arms
    const crankCenter = new THREE.Vector3(0, 0.44, -0.42);
    const crankset = new THREE.Group();
    crankset.position.copy(crankCenter);

    const spindleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.42);
    spindleGeo.rotateZ(Math.PI / 2);
    const spindle = new THREE.Mesh(spindleGeo, chromeMat);
    crankset.add(spindle);

    const sprocketGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.024, 20);
    sprocketGeo.rotateZ(Math.PI / 2);
    const sprocket = new THREE.Mesh(sprocketGeo, chromeMat);
    sprocket.position.set(0.18, 0, 0);
    crankset.add(sprocket);

    // Left and right crank arms
    const crankArmGeo = new THREE.BoxGeometry(0.032, crankRadius * 2, 0.032);
    const leftArm = new THREE.Mesh(crankArmGeo, chromeMat);
    leftArm.position.set(-0.20, crankRadius * 0.5, 0);
    crankset.add(leftArm);

    const rightArm = new THREE.Mesh(crankArmGeo, chromeMat);
    rightArm.position.set(0.20, -crankRadius * 0.5, 0);
    crankset.add(rightArm);

    const pedalGeo = new THREE.BoxGeometry(0.14, 0.04, 0.09);
    const leftPedal = new THREE.Mesh(pedalGeo, tireMat);
    leftPedal.position.set(-0.26, crankRadius, 0);
    crankset.add(leftPedal);

    const rightPedal = new THREE.Mesh(pedalGeo, tireMat);
    rightPedal.position.set(0.26, -crankRadius, 0);
    crankset.add(rightPedal);

    bikeFrame.add(crankset);
    root.add(bikeFrame);

    // ----------------------------------------------------
    // 5. FRONT FORK, WHEEL & STEERING (Positioned at Z = -1.35)
    // ----------------------------------------------------
    const frontAssembly = new THREE.Group();
    frontAssembly.position.set(0, 0, -1.35);

    // Head tube
    const headTubeGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.58);
    headTubeGeo.rotateX(Math.PI / 14);
    const headTube = new THREE.Mesh(headTubeGeo, steelMat);
    headTube.position.set(0, 1.05, 0);
    frontAssembly.add(headTube);

    // Fork legs
    for (const side of [-0.11, 0.11]) {
      const forkLegGeo = new THREE.CylinderGeometry(0.03, 0.024, 0.78);
      forkLegGeo.rotateX(Math.PI / 15);
      const forkLeg = new THREE.Mesh(forkLegGeo, chromeMat);
      forkLeg.position.set(side, 0.58, -0.05);
      frontAssembly.add(forkLeg);
    }

    // Front Wheel
    const frontWheel = RickshawFactory.createWheel(frontWheelRadius, 0.08, tireMat, chromeMat, brassMat);
    frontWheel.position.set(0, 0.44, -0.1);
    frontAssembly.add(frontWheel);

    // Front Mudguard
    const frontGuardGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.11, 20, 1, true, Math.PI * 0.18, Math.PI * 0.72);
    frontGuardGeo.rotateZ(Math.PI / 2);
    const frontGuard = new THREE.Mesh(frontGuardGeo, mudguardMat);
    frontGuard.position.set(0, 0.48, -0.08);
    frontGuard.rotation.x = Math.PI;
    frontGuard.material.side = THREE.DoubleSide;
    frontAssembly.add(frontGuard);

    // Stem and Handlebars
    const stemGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.42);
    const stem = new THREE.Mesh(stemGeo, chromeMat);
    stem.position.set(0, 1.32, 0.02);
    frontAssembly.add(stem);

    const barGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.94);
    barGeo.rotateZ(Math.PI / 2);
    const handlebar = new THREE.Mesh(barGeo, chromeMat);
    handlebar.position.set(0, 1.45, -0.03);
    frontAssembly.add(handlebar);

    // Rubber handgrips
    for (const side of [-0.42, 0.42]) {
      const gripGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.18, 10);
      gripGeo.rotateZ(Math.PI / 2);
      const grip = new THREE.Mesh(gripGeo, tireMat);
      grip.position.set(side, 1.45, -0.03);
      frontAssembly.add(grip);
    }

    // Vintage Chrome Headlamp pointing forward (-Z)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 1.12, -0.22);

    const lampBucketGeo = new THREE.SphereGeometry(0.13, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6);
    lampBucketGeo.rotateX(-Math.PI / 2);
    const lampBucket = new THREE.Mesh(lampBucketGeo, chromeMat);
    lampGroup.add(lampBucket);

    const lensGeo = new THREE.CircleGeometry(0.125, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 0, -0.09);
    lens.rotation.y = Math.PI;
    lampGroup.add(lens);

    frontAssembly.add(lampGroup);

    // Brass Bell
    const bellGroup = new THREE.Group();
    bellGroup.position.set(-0.28, 1.52, -0.04);
    const bellDomeGeo = new THREE.SphereGeometry(0.065, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const bellDome = new THREE.Mesh(bellDomeGeo, brassMat);
    bellGroup.add(bellDome);

    const strikerGeo = new THREE.BoxGeometry(0.018, 0.08, 0.018);
    const bellStriker = new THREE.Mesh(strikerGeo, chromeMat);
    bellStriker.position.set(0.04, 0.01, -0.02);
    bellGroup.add(bellStriker);

    frontAssembly.add(bellGroup);
    root.add(frontAssembly);

    // ----------------------------------------------------
    // 6. RIDER CHARACTER (Facing forward toward -Z)
    // ----------------------------------------------------
    const riderGroup = new THREE.Group();
    riderGroup.position.set(0, 1.25, -0.32);

    const kurtaMat = new THREE.MeshToonMaterial({ color: colors.riderKurta, roughness: 0.75 });
    const lungiMat = new THREE.MeshToonMaterial({ color: colors.riderLungi, roughness: 0.8 });
    const gamchhaMat = new THREE.MeshToonMaterial({ color: colors.riderGamchha, roughness: 0.7 });

    // Torso leaning forward toward -Z
    const riderTorso = new THREE.Group();
    riderTorso.position.set(0, 0.15, 0);

    const chestGeo = new THREE.BoxGeometry(0.48, 0.62, 0.32);
    const chest = new THREE.Mesh(chestGeo, kurtaMat);
    chest.position.set(0, 0.28, -0.08);
    chest.rotation.x = -0.24;
    chest.castShadow = true;
    riderTorso.add(chest);

    // Gamchha scarf
    const scarfGeo = new THREE.BoxGeometry(0.18, 0.70, 0.36);
    const scarf = new THREE.Mesh(scarfGeo, gamchhaMat);
    scarf.position.set(0.14, 0.30, -0.10);
    scarf.rotation.x = -0.24;
    riderTorso.add(scarf);

    // Head facing -Z
    const riderHead = new THREE.Group();
    riderHead.position.set(0, 0.72, -0.24);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), skinMat);
    riderHead.add(head);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.035, 0.09, 6);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 0.01, -0.16);
    riderHead.add(nose);

    // Mustache
    const stacheGeo = new THREE.TorusGeometry(0.065, 0.02, 6, 10, Math.PI);
    stacheGeo.rotateX(Math.PI * 0.75);
    const stache = new THREE.Mesh(stacheGeo, hairMat);
    stache.position.set(0, -0.045, -0.15);
    riderHead.add(stache);

    // Eyes
    for (const ex of [-0.065, 0.065]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      eye.position.set(ex, 0.05, -0.15);
      riderHead.add(eye);
    }

    // Gamchha Headwrap
    const paggGeo = new THREE.TorusGeometry(0.16, 0.065, 8, 14);
    paggGeo.rotateX(Math.PI / 2);
    const pagg = new THREE.Mesh(paggGeo, gamchhaMat);
    pagg.position.set(0, 0.08, 0);
    riderHead.add(pagg);

    riderTorso.add(riderHead);

    // Arms reaching to grips at -Z
    const arms = [];
    for (const side of [-1, 1]) {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.28, 0.50, -0.12);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.42), kurtaMat);
      upperArm.rotation.x = Math.PI / 3.8;
      upperArm.position.set(side * 0.08, -0.12, -0.14);
      armGroup.add(upperArm);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.45), kurtaMat);
      forearm.rotation.x = Math.PI / 2.6;
      forearm.position.set(side * 0.12, -0.26, -0.44);
      armGroup.add(forearm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 6), skinMat);
      hand.position.set(side * 0.15, -0.38, -0.72);
      armGroup.add(hand);

      riderTorso.add(armGroup);
      arms.push(armGroup);
    }

    riderGroup.add(riderTorso);

    // 2-Segment Articulated Legs
    const thighGeo = new THREE.CylinderGeometry(0.085, 0.065, 0.48);
    thighGeo.translate(0, -0.24, 0);
    const shinGeo = new THREE.CylinderGeometry(0.06, 0.048, 0.48);
    shinGeo.translate(0, -0.24, 0);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.20, 0, 0);
    const leftThigh = new THREE.Mesh(thighGeo, lungiMat);
    leftLeg.add(leftThigh);
    const leftShin = new THREE.Mesh(shinGeo, skinMat);
    leftShin.position.set(0, -0.48, 0);
    leftThigh.add(leftShin);
    riderGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.20, 0, 0);
    const rightThigh = new THREE.Mesh(thighGeo.clone(), lungiMat);
    rightLeg.add(rightThigh);
    const rightShin = new THREE.Mesh(shinGeo.clone(), skinMat);
    rightShin.position.set(0, -0.48, 0);
    rightThigh.add(rightShin);
    riderGroup.add(rightLeg);

    root.add(riderGroup);

    return {
      root,
      frontAssembly,
      frontWheel,
      rearWheelLeft: rearWheelL,
      rearWheelRight: rearWheelR,
      crankset,
      leftPedal,
      rightPedal,
      bellStriker,
      canopyMesh,
      canopyMaterial,
      riderTorso,
      riderHead,
      leftThigh,
      leftShin,
      rightThigh,
      rightShin,
      rearWheelRadius,
      frontWheelRadius
    };
  }

  static createWheel(radius, width, rubberMat, chromeMat, brassMat) {
    const wheelGroup = new THREE.Group();

    const tireGeo = new THREE.TorusGeometry(radius, width * 0.48, 12, 24);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, rubberMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, width * 0.75, 18, 1, true);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheelGroup.add(rim);

    const hubGeo = new THREE.CylinderGeometry(0.055, 0.055, width * 1.35, 10);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, chromeMat);
    wheelGroup.add(hub);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI;
      const spokeGeo = new THREE.CylinderGeometry(0.007, 0.007, radius * 1.74);
      spokeGeo.rotateZ(Math.PI / 2);
      spokeGeo.rotateX(angle);
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      wheelGroup.add(spoke);
    }

    return wheelGroup;
  }
}

