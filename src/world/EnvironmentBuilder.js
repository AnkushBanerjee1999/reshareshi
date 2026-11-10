import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Environmental Elements & Kolkata Street Props Builder
 *
 * Builds iconic, highly recognizable elements of the Kolkata cityscape:
 * - Howrah Bridge Cantilever Riveted Steel Truss Arches
 * - Vintage Calcutta Tramways Company (CTC) Green & Cream Electric Trams
 * - Kolkata Police Blue & White Hexagonal Pagoda Traffic Booths
 * - Ambassador Yellow Taxis with chrome bumpers & checker trim
 * - Traditional roadside Chai Stalls with kettle, kulhads & benches
 * - Puchka (Pani Puri) vendor carts with clay pots & brass urns
 * - Ornate Victorian cast-iron streetlights with warm amber lanterns
 * - Overhead tram electrical cables & utility poles
 */
export class EnvironmentBuilder {
  constructor() {
    // Shared Stylized Materials
    this.steelMat = new THREE.MeshToonMaterial({ color: 0x222f3e, roughness: 0.4 });
    this.chromeMat = new THREE.MeshToonMaterial({ color: 0xe0e6ed, roughness: 0.15 });
    this.taxiYellowMat = new THREE.MeshToonMaterial({ color: COLORS.AMBASSADOR_YELLOW, roughness: 0.35 });
    this.taxiBlackMat = new THREE.MeshToonMaterial({ color: 0x1e272c });
    this.woodMat = new THREE.MeshToonMaterial({ color: 0x5a2d0c, roughness: 0.75 });
    this.clayMat = new THREE.MeshToonMaterial({ color: 0xb9770e, roughness: 0.85 });
    this.brassMat = new THREE.MeshToonMaterial({ color: 0xf39c12, roughness: 0.25 });
    this.amberGlowMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    this.tireMat = new THREE.MeshToonMaterial({ color: 0x151515, roughness: 0.9 });
    this.concreteMat = new THREE.MeshToonMaterial({ color: 0xa4b0be, roughness: 0.85 });
    this.hazardMat = new THREE.MeshToonMaterial({ color: 0xf1c40f, roughness: 0.6 });
    this.neonMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });
    this.neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });
    this.palmTrunkMat = new THREE.MeshToonMaterial({ color: 0x5a3825, roughness: 0.9 });
    this.palmFrondMat = new THREE.MeshToonMaterial({ color: 0x27ae60, roughness: 0.65, side: THREE.DoubleSide });
    this.barrierSteelMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.35, metalness: 0.82 });
    this.reflectorAmberMat = new THREE.MeshBasicMaterial({ color: 0xffa502 });
    this.reflectorRedMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });

    // Kolkata Specific Materials
    this.howrahSteelMat = new THREE.MeshStandardMaterial({ color: 0x4f5b66, roughness: 0.38, metalness: 0.78 });
    this.tramGreenMat = new THREE.MeshToonMaterial({ color: 0x1b4d3e, roughness: 0.45 });
    this.tramCreamMat = new THREE.MeshToonMaterial({ color: 0xfcf8ed, roughness: 0.45 });
    this.tramGoldTrimMat = new THREE.MeshToonMaterial({ color: 0xf1c40f, roughness: 0.3 });
    this.policeBlueMat = new THREE.MeshToonMaterial({ color: 0x0984e3, roughness: 0.4 });
    this.policeWhiteMat = new THREE.MeshToonMaterial({ color: 0xf5f6fa, roughness: 0.4 });
    this.coneOrangeMat = new THREE.MeshToonMaterial({ color: 0xff4d00, roughness: 0.35 });
    this.coneWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.coneBaseMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, roughness: 0.85 });
    this.diyaClayMat = new THREE.MeshToonMaterial({ color: 0xcd6133, roughness: 0.9 });
    this.diyaFlameMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
    
    // Smooth radial lighting pools for night realism (matching reference screenshots)
    this.diyaGlowTexture = TextureGenerator.createRadialGlowTexture('rgba(255, 195, 75, 0.95)', 'rgba(255, 130, 25, 0.42)', 'rgba(255, 80, 0, 0.0)');
    this.diyaGlowMat = new THREE.MeshBasicMaterial({
      map: this.diyaGlowTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.streetGlowPoolTexture = TextureGenerator.createRadialGlowTexture('rgba(255, 220, 140, 0.65)', 'rgba(255, 175, 70, 0.22)', 'rgba(255, 130, 30, 0.0)');
    this.streetGlowPoolMat = new THREE.MeshBasicMaterial({
      map: this.streetGlowPoolTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.crossGlowPoolTexture = TextureGenerator.createRadialGlowTexture('rgba(255, 230, 160, 0.80)', 'rgba(255, 185, 80, 0.32)', 'rgba(255, 140, 40, 0.0)');
    this.crossGlowPoolMat = new THREE.MeshBasicMaterial({
      map: this.crossGlowPoolTexture,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1e272c,
      roughness: 0.15,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85
    });

    // Pre-cached textures and billboard materials (reused across all segments, 0 memory leak)
    this.billboardMat = this.initBillboardMaterial();
    this.howrahSignMat = new THREE.MeshBasicMaterial({ map: TextureGenerator.createHowrahBridgeSignTexture() });
    this.tramDestMat = new THREE.MeshBasicMaterial({ map: TextureGenerator.createTramDestinationTexture() });
    this.policeShieldMat = new THREE.MeshBasicMaterial({ map: TextureGenerator.createPoliceShieldTexture() });
  }

  initBillboardMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#8e44ad');
    grad.addColorStop(0.5, '#e056fd');
    grad.addColorStop(1, '#ff7675');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;
    ctx.fillText('SPEED NITRO', 256, 115);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 32px "Trebuchet MS", sans-serif';
    ctx.fillText('ENERGY CHAI & DAAB', 256, 175);

    return new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas)
    });
  }

  /**
   * Iconic Kolkata Yellow Ambassador Taxi (Parked along curb)
   */
  createYellowTaxi() {
    const taxi = new THREE.Group();
    taxi.name = 'YellowAmbassadorTaxi';

    // Lower Curved Body / Mudguards
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.72, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, this.taxiYellowMat);
    chassis.position.set(0, 0.52, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    taxi.add(chassis);

    // Rounded Classic Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.85, 0.76, 2.45);
    const cabin = new THREE.Mesh(cabinGeo, this.taxiYellowMat);
    cabin.position.set(0, 1.18, -0.22);
    cabin.castShadow = true;
    taxi.add(cabin);

    // Front Curved Hood / Bonnet slope
    const hoodGeo = new THREE.BoxGeometry(1.82, 0.38, 1.35);
    const hood = new THREE.Mesh(hoodGeo, this.taxiYellowMat);
    hood.position.set(0, 0.75, 1.45);
    hood.rotation.x = -0.12;
    taxi.add(hood);

    // Classic Horizontal Chrome Grille
    const grilleGeo = new THREE.BoxGeometry(1.5, 0.36, 0.08);
    const grille = new THREE.Mesh(grilleGeo, this.chromeMat);
    grille.position.set(0, 0.62, 2.21);
    taxi.add(grille);

    // Heavy Chrome Bumpers with Overrider Bullets
    for (const zSide of [2.22, -2.22]) {
      const bumperGroup = new THREE.Group();
      bumperGroup.position.set(0, 0.36, zSide);

      const barGeo = new THREE.BoxGeometry(2.05, 0.18, 0.14);
      const bar = new THREE.Mesh(barGeo, this.chromeMat);
      bumperGroup.add(bar);

      // Overrider bullets
      for (const ox of [-0.62, 0.62]) {
        const bulletGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8);
        bulletGeo.rotateX(Math.PI / 2);
        const bullet = new THREE.Mesh(bulletGeo, this.chromeMat);
        bullet.position.set(ox, 0.06, (zSide > 0 ? 0.08 : -0.08));
        bumperGroup.add(bullet);
      }
      taxi.add(bumperGroup);
    }

    // Classic Round Chrome Headlights
    for (const side of [-0.72, 0.72]) {
      const lightGroup = new THREE.Group();
      lightGroup.position.set(side, 0.68, 2.18);

      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), this.chromeMat);
      bezel.rotation.x = Math.PI / 2;
      lightGroup.add(bezel);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.115, 12), this.amberGlowMat);
      lens.position.set(0, 0, 0.045);
      lightGroup.add(lens);

      taxi.add(lightGroup);
    }

    // Windows (Tinted glass)
    const glassMat = new THREE.MeshToonMaterial({ color: 0x1a252f });

    // Windshield
    const windGeo = new THREE.PlaneGeometry(1.68, 0.64);
    const windshield = new THREE.Mesh(windGeo, glassMat);
    windshield.position.set(0, 1.20, 1.02);
    windshield.rotation.x = -0.32;
    taxi.add(windshield);

    // Rear window
    const rearWin = new THREE.Mesh(windGeo, glassMat);
    rearWin.position.set(0, 1.20, -1.46);
    rearWin.rotation.y = Math.PI;
    rearWin.rotation.x = -0.32;
    taxi.add(rearWin);

    // Side windows with black pillared dividers
    for (const side of [-0.93, 0.93]) {
      const sideWinGeo = new THREE.BoxGeometry(0.04, 0.54, 2.1);
      const sideWin = new THREE.Mesh(sideWinGeo, glassMat);
      sideWin.position.set(side, 1.18, -0.22);
      taxi.add(sideWin);
    }

    // Iconic Black & White Checkerboard Taxi Beltline Stripe
    for (const side of [-1.06, 1.06]) {
      const stripeGroup = new THREE.Group();
      stripeGroup.position.set(side, 0.78, 0);

      const count = 12;
      for (let i = 0; i < count; i++) {
        const sqGeo = new THREE.BoxGeometry(0.02, 0.10, 0.28);
        const sqMat = i % 2 === 0 ? this.taxiBlackMat : new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sq = new THREE.Mesh(sqGeo, sqMat);
        sq.position.set(0, 0, (i - count / 2) * 0.28);
        stripeGroup.add(sq);
      }
      taxi.add(stripeGroup);
    }

    // Illuminated Rooftop TAXI Sign
    const signGroup = new THREE.Group();
    signGroup.position.set(0, 1.62, -0.15);

    const signBaseGeo = new THREE.BoxGeometry(0.85, 0.18, 0.28);
    const signBase = new THREE.Mesh(signBaseGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    signGroup.add(signBase);

    const signTextMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textStripe = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.02), signTextMat);
    textStripe.position.set(0, 0, 0.145);
    signGroup.add(textStripe);

    taxi.add(signGroup);

    // Wheels with Chrome Hubcaps
    const wheelPositions = [
      [-1.02, 0.36, 1.35],
      [1.02, 0.36, 1.35],
      [-1.02, 0.36, -1.35],
      [1.02, 0.36, -1.35]
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, this.tireMat);
      tire.position.set(wx, wy, wz);

      const capGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.26, 10);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, this.chromeMat);
      tire.add(cap);

      taxi.add(tire);
    }

    return taxi;
  }

  /**
   * Traditional Kolkata Roadside Chai Dukan (Steaming Tea Stall)
   */
  createChaiStall() {
    const stall = new THREE.Group();
    stall.name = 'KolkataChaiStall';

    // Wooden stall counter
    const counterGeo = new THREE.BoxGeometry(2.6, 0.95, 1.35);
    const counter = new THREE.Mesh(counterGeo, this.woodMat);
    counter.position.set(0, 0.48, 0);
    counter.castShadow = true;
    stall.add(counter);

    // Weathered Blue/Orange Striped Canvas Awning
    const awningGeo = new THREE.BoxGeometry(2.8, 0.08, 1.85);
    const awningMat = new THREE.MeshToonMaterial({ color: 0x2980b9, side: THREE.DoubleSide });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.35, 0.15);
    awning.rotation.x = 0.14;
    stall.add(awning);

    // Wooden awning corner support posts
    for (const px of [-1.25, 1.25]) {
      for (const pz of [-0.62, 0.62]) {
        const postGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.3);
        const post = new THREE.Mesh(postGeo, this.woodMat);
        post.position.set(px, 1.15, pz);
        stall.add(post);
      }
    }

    // Large Boiling Brass Chai Samovar / Kettle
    const kettleGroup = new THREE.Group();
    kettleGroup.position.set(-0.65, 1.15, 0.1);

    const kettleGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.42, 14);
    const kettle = new THREE.Mesh(kettleGeo, this.brassMat);
    kettleGroup.add(kettle);

    const lidGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.1, 10);
    const lid = new THREE.Mesh(lidGeo, this.brassMat);
    lid.position.y = 0.26;
    kettleGroup.add(lid);

    const spoutGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.24);
    spoutGeo.rotateZ(Math.PI / 4);
    const spout = new THREE.Mesh(spoutGeo, this.brassMat);
    spout.position.set(0.24, 0.08, 0);
    kettleGroup.add(spout);

    stall.add(kettleGroup);

    // Stacks of Earthenware Clay Kulhads
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const kulhadGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.14, 8);
        const kulhad = new THREE.Mesh(kulhadGeo, this.clayMat);
        kulhad.position.set(0.35 + col * 0.16, 1.02 + row * 0.13, 0.08);
        stall.add(kulhad);
      }
    }

    // Glass Biscuits Jar
    const jarGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 10);
    const jarMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const jar = new THREE.Mesh(jarGeo, jarMat);
    jar.position.set(-0.15, 1.12, -0.2);
    stall.add(jar);

    // Warm Hanging Lightbulb under Awning (pure emissive mesh, 0 dynamic GPU light cost)
    const bulbGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const bulb = new THREE.Mesh(bulbGeo, this.amberGlowMat);
    bulb.position.set(0, 2.1, 0.1);
    stall.add(bulb);

    // Wooden customers bench
    const benchGeo = new THREE.BoxGeometry(2.2, 0.09, 0.45);
    const bench = new THREE.Mesh(benchGeo, this.woodMat);
    bench.position.set(0, 0.44, 1.25);
    stall.add(bench);

    for (const bx of [-0.92, 0.92]) {
      const legGeo = new THREE.BoxGeometry(0.09, 0.44, 0.09);
      const leg = new THREE.Mesh(legGeo, this.woodMat);
      leg.position.set(bx, 0.22, 1.25);
      stall.add(leg);
    }

    return stall;
  }

  /**
   * Street Puchka (Pani Puri) Vendor Cart
   */
  createPuchkaCart() {
    const cart = new THREE.Group();
    cart.name = 'KolkataPuchkaCart';

    // Wooden cart body
    const bodyGeo = new THREE.BoxGeometry(1.75, 0.52, 1.15);
    const body = new THREE.Mesh(bodyGeo, this.woodMat);
    body.position.set(0, 0.68, 0);
    body.castShadow = true;
    cart.add(body);

    // Cart wheels
    for (const side of [-0.92, 0.92]) {
      const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.09, 14);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, this.steelMat);
      wheel.position.set(side, 0.42, 0);
      cart.add(wheel);
    }

    // Clay Water Pot (Matka for spiced tamarind water)
    const potGeo = new THREE.SphereGeometry(0.28, 12, 10);
    const pot = new THREE.Mesh(potGeo, this.clayMat);
    pot.position.set(-0.38, 1.18, 0);
    cart.add(pot);

    // Red cloth wrapped over pot mouth
    const clothGeo = new THREE.TorusGeometry(0.18, 0.04, 6, 12);
    clothGeo.rotateX(Math.PI / 2);
    const cloth = new THREE.Mesh(clothGeo, new THREE.MeshToonMaterial({ color: 0xc0392b }));
    cloth.position.set(-0.38, 1.40, 0);
    cart.add(cloth);

    // Transparent Glass Display Case filled with round crisp puris
    const caseGeo = new THREE.BoxGeometry(0.72, 0.48, 0.72);
    const caseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const glassCase = new THREE.Mesh(caseGeo, caseMat);
    glassCase.position.set(0.42, 1.18, 0);
    cart.add(glassCase);

    // Spherical crisp puris inside case
    const puriMat = new THREE.MeshToonMaterial({ color: 0xf39c12 });
    for (let p = 0; p < 8; p++) {
      const puri = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), puriMat);
      puri.position.set(0.32 + (p % 2) * 0.16, 1.02 + Math.floor(p / 4) * 0.14, -0.15 + (p % 4) * 0.12);
      cart.add(puri);
    }

    return cart;
  }

  /**
   * Victorian Heritage Cast-Iron Streetlight
   */
  createStreetLight() {
    const lightGroup = new THREE.Group();
    lightGroup.name = 'HeritageStreetLight';

    // Ornate fluted pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.28, 0.42, 0.95, 10);
    const base = new THREE.Mesh(baseGeo, this.steelMat);
    base.position.y = 0.48;
    lightGroup.add(base);

    // Tall fluted cast-iron column
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.14, 6.4, 10);
    const pole = new THREE.Mesh(poleGeo, this.steelMat);
    pole.position.y = 4.15;
    lightGroup.add(pole);

    // Decorative capital & curved ironwork bracket arm
    const bracketGeo = new THREE.TorusGeometry(0.65, 0.04, 6, 12, Math.PI * 0.75);
    bracketGeo.rotateY(Math.PI / 2);
    const bracket = new THREE.Mesh(bracketGeo, this.steelMat);
    bracket.position.set(0.42, 6.75, 0);
    lightGroup.add(bracket);

    // Glowing Victorian lantern fixture
    const lanternGeo = new THREE.CylinderGeometry(0.24, 0.14, 0.45, 6);
    const lantern = new THREE.Mesh(lanternGeo, this.amberGlowMat);
    lantern.position.set(0.85, 6.65, 0);
    lightGroup.add(lantern);

    // Lantern pagoda cap
    const capGeo = new THREE.ConeGeometry(0.32, 0.22, 6);
    const cap = new THREE.Mesh(capGeo, this.steelMat);
    cap.position.set(0.85, 6.95, 0);
    lightGroup.add(cap);

    // Warm radial ground illumination pool on sidewalk/road under the street lantern
    const groundPoolGeo = new THREE.PlaneGeometry(5.2, 5.2);
    groundPoolGeo.rotateX(-Math.PI / 2);
    const groundPool = new THREE.Mesh(groundPoolGeo, this.streetGlowPoolMat);
    groundPool.position.set(0.85, 0.02, 0);
    lightGroup.add(groundPool);

    return lightGroup;
  }

  /**
   * 4-Way Modern Cross Streetlamp with glowing halo flares (exact match to reference screenshot):
   * Tall silver/white column with 4 orthogonal cantilever crossarms and glowing golden lantern heads.
   */
  createIntersectionCrossLamp() {
    const lampGroup = new THREE.Group();
    lampGroup.name = 'IntersectionCrossLamp';

    // Large circular ground illumination pool on the intersection asphalt (matching reference screenshot)
    const crossGroundGeo = new THREE.PlaneGeometry(13.0, 13.0);
    crossGroundGeo.rotateX(-Math.PI / 2);
    const crossGroundPool = new THREE.Mesh(crossGroundGeo, this.crossGlowPoolMat);
    crossGroundPool.position.set(0, 0.02, 0);
    lampGroup.add(crossGroundPool);

    // Tall vertical silver/white steel column (height 7.4m)
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.4, 8);
    const pole = new THREE.Mesh(poleGeo, this.chromeMat);
    pole.position.y = 3.7;
    pole.castShadow = true;
    lampGroup.add(pole);

    // 4 Orthogonal Cantilever Crossarms
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const armGroup = new THREE.Group();
      armGroup.position.set(0, 7.0, 0);
      armGroup.rotation.y = angle;

      // Cantilever arm
      const armGeo = new THREE.BoxGeometry(1.3, 0.08, 0.08);
      const arm = new THREE.Mesh(armGeo, this.chromeMat);
      arm.position.set(0.65, 0, 0);
      armGroup.add(arm);

      // Downward angled luminaire housing
      const housingGeo = new THREE.BoxGeometry(0.38, 0.12, 0.22);
      const housing = new THREE.Mesh(housingGeo, this.chromeMat);
      housing.position.set(1.3, -0.06, 0);
      armGroup.add(housing);

      // Glowing warm golden light emitter lens
      const lensGeo = new THREE.PlaneGeometry(0.34, 0.2);
      lensGeo.rotateX(Math.PI / 2);
      const lens = new THREE.Mesh(lensGeo, this.amberGlowMat);
      lens.position.set(1.3, -0.13, 0);
      armGroup.add(lens);

      // Halo flare sprite (visible from all camera angles)
      const flareGeo = new THREE.PlaneGeometry(1.6, 1.6);
      const flareMat = new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const flare = new THREE.Mesh(flareGeo, flareMat);
      flare.position.set(1.3, -0.25, 0);
      armGroup.add(flare);

      lampGroup.add(armGroup);
    }

    return lampGroup;
  }

  /**
   * Utility Pole with Overhead Transformers & Wire Mounts
   */
  createUtilityPole() {
    const poleGroup = new THREE.Group();
    poleGroup.name = 'UtilityPole';

    // Heavy concrete/wooden utility pole
    const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 9.2, 10);
    const poleMat = new THREE.MeshToonMaterial({ color: 0x3d2b1f, roughness: 0.85 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 4.6;
    poleGroup.add(pole);

    // Multi-tiered cross-arms
    for (const y of [7.5, 8.4]) {
      const armGeo = new THREE.BoxGeometry(0.12, 0.12, 2.2);
      const arm = new THREE.Mesh(armGeo, this.steelMat);
      arm.position.set(0, y, 0);
      poleGroup.add(arm);

      // White ceramic bell insulators
      for (const z of [-0.9, -0.45, 0.45, 0.9]) {
        const insGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.18, 8);
        const ins = new THREE.Mesh(insGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        ins.position.set(0, y + 0.14, z);
        poleGroup.add(ins);
      }
    }

    // Heavy cylindrical transformer tank mounted on pole
    const transGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.92, 12);
    const transMat = new THREE.MeshToonMaterial({ color: 0x4a6572, roughness: 0.4 });
    const transformer = new THREE.Mesh(transGeo, transMat);
    transformer.position.set(0.42, 5.5, 0);
    poleGroup.add(transformer);

    return poleGroup;
  }

  /**
   * Stylized 3D City Tree matching reference screenshot:
   * Volumetric leafy canopies in fresh greens, textured bark trunk & sidewalk planter
   */
  createStreetTree() {
    const treeGroup = new THREE.Group();
    treeGroup.name = 'StreetTree';

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.34, 4.2, 6);
    const trunkMat = new THREE.MeshToonMaterial({ color: 0x4a2e18, roughness: 0.85 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.1;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leafy stylized canopy (matching reference image)
    const folGeo = new THREE.DodecahedronGeometry(2.35, 1);
    const folMat = new THREE.MeshToonMaterial({ color: 0x2ecc71, roughness: 0.7 });
    const folMesh = new THREE.Mesh(folGeo, folMat);
    folMesh.position.y = 5.2;
    folMesh.castShadow = true;
    folMesh.receiveShadow = true;
    treeGroup.add(folMesh);

    return treeGroup;
  }

  /**
   * Neon Glowing Magenta/Pink Arrow Chevron Barrier (>>>)
   * As seen on curve barriers in the reference screenshot
   */
  createNeonChevronSign() {
    const signGroup = new THREE.Group();
    signGroup.name = 'NeonChevronSign';

    // Double black steel support legs
    const legMat = new THREE.MeshToonMaterial({ color: 0x111111, roughness: 0.5 });
    for (const lx of [-1.1, 1.1]) {
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 1.4, 0);
      leg.castShadow = true;
      signGroup.add(leg);
    }

    // Heavy dark sign housing frame
    const frameGeo = new THREE.BoxGeometry(3.2, 1.45, 0.16);
    const frameMat = new THREE.MeshToonMaterial({ color: 0x120822, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 2.3, 0);
    frame.castShadow = true;
    signGroup.add(frame);

    // Glowing Neon Chevrons Face Panel
    const arrowGroup = new THREE.Group();
    arrowGroup.position.set(0, 2.3, 0.09);

    // 3 Cutout illuminated chevrons (using cached neonMat)
    for (const ax of [-0.85, 0, 0.85]) {
      const shape = new THREE.Shape();
      shape.moveTo(-0.25, -0.45);
      shape.lineTo(0.20, 0.0);
      shape.lineTo(-0.25, 0.45);
      shape.lineTo(-0.05, 0.45);
      shape.lineTo(0.40, 0.0);
      shape.lineTo(-0.05, -0.45);
      shape.closePath();

      const geom = new THREE.ShapeGeometry(shape);
      const arrowMesh = new THREE.Mesh(geom, this.neonMat);
      arrowMesh.position.set(ax, 0, 0);
      arrowGroup.add(arrowMesh);
    }
    signGroup.add(arrowGroup);

    return signGroup;
  }

  /**
   * Elevated Metro Viaduct & Flyover Structure:
   * Concrete columns with hazard striping, crosshead beam & overhead transit tracks
   */
  createMetroViaduct(length = 60.0) {
    const viaduct = new THREE.Group();
    viaduct.name = 'MetroViaduct';

    // Concrete Piers every 25m
    const concreteMat = this.concreteMat;
    const steelMat = this.steelMat;
    const hazardMat = this.hazardMat;
    const pierCount = Math.ceil(length / 25.0);
    for (let p = 0; p < pierCount; p++) {
      const pz = (p - (pierCount - 1) / 2) * 25.0;
      const pierGroup = new THREE.Group();
      pierGroup.position.set(0, 0, pz);

      // Yellow/Black hazard base
      const baseGeo = new THREE.BoxGeometry(2.4, 1.4, 2.4);
      const base = new THREE.Mesh(baseGeo, hazardMat);
      base.position.y = 0.7;
      base.castShadow = true;
      base.receiveShadow = true;
      pierGroup.add(base);

      // Vertical column
      const colGeo = new THREE.BoxGeometry(1.8, 8.5, 1.8);
      const col = new THREE.Mesh(colGeo, concreteMat);
      col.position.y = 5.25;
      col.castShadow = true;
      col.receiveShadow = true;
      pierGroup.add(col);

      // Crosshead cantilever hammerhead beam
      const capGeo = new THREE.BoxGeometry(6.8, 1.4, 2.2);
      const cap = new THREE.Mesh(capGeo, concreteMat);
      cap.position.y = 9.8;
      cap.castShadow = true;
      pierGroup.add(cap);

      viaduct.add(pierGroup);
    }

    // Longitudinal Overhead Bridge Deck / Girders
    const deckGeo = new THREE.BoxGeometry(5.8, 1.1, length);
    const deck = new THREE.Mesh(deckGeo, concreteMat);
    deck.position.set(0, 10.6, 0);
    deck.castShadow = true;
    viaduct.add(deck);

    // Parapet concrete sound barrier walls on sides
    for (const side of [-2.85, 2.85]) {
      const barrierGeo = new THREE.BoxGeometry(0.35, 1.6, length);
      const barrier = new THREE.Mesh(barrierGeo, steelMat);
      barrier.position.set(side, 11.8, 0);
      viaduct.add(barrier);
    }

    return viaduct;
  }

  /**
   * Roadside Commercial Billboard / Hoarding with Overhead Floodlights
   */
  createBillboard(brand = 'JUICE CO.') {
    const bbGroup = new THREE.Group();
    bbGroup.name = 'HighwayBillboard';

    const steelMat = new THREE.MeshToonMaterial({ color: 0x1e272c, roughness: 0.4 });

    // Double lattice steel column posts
    for (const lx of [-2.4, 2.4]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 10.5, 0.32), steelMat);
      post.position.set(lx, 5.25, 0);
      post.castShadow = true;
      bbGroup.add(post);
    }

    // Billboard Display Board (reusing cached material)
    const board = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4), this.billboardMat);
    board.position.set(0, 9.5, 0.22);
    bbGroup.add(board);

    // Overhead floodlight fixture caps (pure meshes, 0 dynamic lights)
    const floodMat = new THREE.MeshBasicMaterial({ color: 0xfff2cc });
    for (const fx of [-2.2, 0, 2.2]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.3), steelMat);
      lamp.position.set(fx, 11.5, 0.6);
      bbGroup.add(lamp);

      const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), floodMat);
      bulb.position.set(fx, 11.38, 0.65);
      bulb.rotation.x = Math.PI / 3;
      bbGroup.add(bulb);
    }

    return bbGroup;
  }

  /**
   * Iconic GTA 6 / Vice City Royal Palm Tree:
   * Tall curved fibrous trunk with planter bed and canopy of tropical fan fronds.
   */
  createRoyalPalmTree() {
    const palm = new THREE.Group();
    palm.name = 'GTARoyalPalmTree';

    // 1. Concrete sidewalk planter box
    const planterGeo = new THREE.BoxGeometry(1.6, 0.32, 1.6);
    const planter = new THREE.Mesh(planterGeo, this.concreteMat);
    planter.position.y = 0.16;
    planter.castShadow = true;
    palm.add(planter);

    const soilGeo = new THREE.PlaneGeometry(1.4, 1.4);
    soilGeo.rotateX(-Math.PI / 2);
    const soil = new THREE.Mesh(soilGeo, new THREE.MeshBasicMaterial({ color: 0x22130c }));
    soil.position.y = 0.33;
    palm.add(soil);

    // 2. Tall, curving segmented tropical palm trunk (height ~9.2m)
    const trunkHeight = 9.2;
    const swayX = (Math.random() - 0.5) * 0.8;
    const swayZ = (Math.random() - 0.5) * 0.8;
    const trunkCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(swayX * 0.25, 2.8, swayZ * 0.25),
      new THREE.Vector3(swayX * 0.75, 6.2, swayZ * 0.75),
      new THREE.Vector3(swayX, trunkHeight, swayZ)
    );
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 10, 0.26, 7, false);
    const trunk = new THREE.Mesh(trunkGeo, this.palmTrunkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    palm.add(trunk);

    // 3. Spreading Tropical Fan Fronds (9 arching palm fronds)
    const crownPos = new THREE.Vector3(swayX, trunkHeight, swayZ);
    const frondCount = 9;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondGroup = new THREE.Group();
      frondGroup.position.copy(crownPos);
      frondGroup.rotation.y = angle;

      // Curved leaf stem
      const bladeCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1.6, 0.65, 0),
        new THREE.Vector3(3.2, -1.1, 0)
      );
      const bladeGeo = new THREE.TubeGeometry(bladeCurve, 6, 0.08, 4, false);
      const blade = new THREE.Mesh(bladeGeo, this.palmFrondMat);
      blade.scale.set(1, 0.35, 2.4);
      blade.castShadow = true;
      frondGroup.add(blade);

      palm.add(frondGroup);
    }

    return palm;
  }

  /**
   * 3D Galvanized Steel Highway Crash Barrier (Armco W-Beam Guardrail):
   * Provides unmistakable physical separation between racetrack and city sidewalk.
   */
  createHighwayCrashBarrier(length = 40.0) {
    const barrierGroup = new THREE.Group();
    barrierGroup.name = 'HighwayCrashBarrier';

    // 1. Galvanized W-Beam continuous guardrail
    const railGeo = new THREE.BoxGeometry(0.12, 0.38, length);
    const railMesh = new THREE.Mesh(railGeo, this.barrierSteelMat);
    railMesh.position.set(0, 0.65, -length / 2);
    railMesh.castShadow = true;
    railMesh.receiveShadow = true;
    barrierGroup.add(railMesh);

    // 2. Heavy Steel I-Beam Support Posts every 3.5m
    const postCount = Math.floor(length / 3.5);
    for (let p = 0; p <= postCount; p++) {
      const pz = -p * 3.5;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), this.steelMat);
      post.position.set(0.02, 0.42, pz);
      post.castShadow = true;
      barrierGroup.add(post);

      // Warning amber reflectors
      const reflector = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.10, 0.12), this.reflectorAmberMat);
      reflector.position.set(-0.06, 0.65, pz);
      barrierGroup.add(reflector);
    }

    return barrierGroup;
  }

  /**
   * GTA 6 / Vice City Glowing 3D Neon Rooftop & Facade Signboard
   */
  createGTANeonSign(text = 'VICE CITY', colorScheme = 'pink') {
    const signGroup = new THREE.Group();
    signGroup.name = `GTANeon_${text}`;

    // Steel lattice support truss
    const steelMat = new THREE.MeshToonMaterial({ color: 0x1e272c, roughness: 0.5 });
    for (const sx of [-2.4, 2.4]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.22), steelMat);
      leg.position.set(sx, 1.6, 0);
      leg.castShadow = true;
      signGroup.add(leg);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.22, 0.22), steelMat);
    beam.position.set(0, 2.9, 0);
    signGroup.add(beam);

    // High-impact illuminated canvas signboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b0416';
    ctx.fillRect(0, 0, 512, 140);

    const neonColor = colorScheme === 'cyan' ? '#00f0ff' : (colorScheme === 'yellow' ? '#f1c40f' : '#ff007f');
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 6;
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 14;
    ctx.strokeRect(6, 6, 500, 128);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold italic 48px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 75);

    ctx.fillStyle = neonColor;
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.fillText('★ GRAND PRIX NIGHT CIRCUIT ★', 256, 112);

    const boardMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.8), boardMat);
    board.position.set(0, 2.8, 0.14);
    signGroup.add(board);

    return signGroup;
  }

  /**
   * Iconic Howrah Bridge Cantilever Steel Lattice Overhead Portal Truss:
   * Massive Warren-truss cantilever arch spanning over the racetrack with
   * riveted steel uprights, cross-lattice girders, and bilingual illuminated nameplate.
   */
  createHowrahBridgeArch(roadSpan = 16.5) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = 'HowrahBridgePortal';

    const steel = this.howrahSteelMat;
    const halfSpan = roadSpan / 2;
    const towerH = 13.5;

    // 1. Left and Right Massive Lattice Steel Pylons / Towers
    for (const side of [-1, 1]) {
      const pylon = new THREE.Group();
      const px = side * (halfSpan + 1.2);
      pylon.position.set(px, 0, 0);

      // Heavy Concrete Foundation Plinth
      const plinthGeo = new THREE.BoxGeometry(2.2, 1.2, 3.2);
      const plinth = new THREE.Mesh(plinthGeo, this.concreteMat);
      plinth.position.y = 0.6;
      plinth.castShadow = true;
      pylon.add(plinth);

      // 4 Main Vertical Steel Box Girders per Pylon
      for (const colX of [-0.65, 0.65]) {
        for (const colZ of [-0.95, 0.95]) {
          const colGeo = new THREE.BoxGeometry(0.32, towerH - 1.2, 0.32);
          const col = new THREE.Mesh(colGeo, steel);
          col.position.set(colX, 1.2 + (towerH - 1.2) / 2, colZ);
          col.castShadow = true;
          pylon.add(col);
        }
      }

      // Horizontal Tie Beams every 2.4m
      for (let y = 3.2; y <= towerH; y += 2.4) {
        const tieGeoX = new THREE.BoxGeometry(1.4, 0.18, 0.22);
        const tieX1 = new THREE.Mesh(tieGeoX, steel);
        tieX1.position.set(0, y, -0.95);
        pylon.add(tieX1);

        const tieX2 = new THREE.Mesh(tieGeoX, steel);
        tieX2.position.set(0, y, 0.95);
        pylon.add(tieX2);

        const tieGeoZ = new THREE.BoxGeometry(0.22, 0.18, 2.0);
        const tieZ1 = new THREE.Mesh(tieGeoZ, steel);
        tieZ1.position.set(-0.65, y, 0);
        pylon.add(tieZ1);

        const tieZ2 = new THREE.Mesh(tieGeoZ, steel);
        tieZ2.position.set(0.65, y, 0);
        pylon.add(tieZ2);
      }

      // Diagonal Warren Cross Struts between vertical legs
      for (let y = 2.4; y < towerH - 2.0; y += 2.4) {
        const diagLen = Math.hypot(1.3, 2.4);
        const diagGeo = new THREE.BoxGeometry(0.14, diagLen, 0.14);

        const d1 = new THREE.Mesh(diagGeo, steel);
        d1.position.set(0, y + 1.2, 0.95);
        d1.rotation.z = Math.atan2(1.3, 2.4);
        pylon.add(d1);

        const d2 = new THREE.Mesh(diagGeo, steel);
        d2.position.set(0, y + 1.2, -0.95);
        d2.rotation.z = -Math.atan2(1.3, 2.4);
        pylon.add(d2);
      }

      // Aviation Red Beacon Light on top
      const beaconGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 8);
      const beacon = new THREE.Mesh(beaconGeo, this.reflectorRedMat);
      beacon.position.set(0, towerH + 0.2, 0);
      pylon.add(beacon);

      bridgeGroup.add(pylon);
    }

    // 2. Transverse Cantilever Steel Cross-Girders Overhead (Y = 8.2m clearance)
    const spanWidth = roadSpan + 3.0;

    // Lower transverse main girder beam
    const lowBeamGeo = new THREE.BoxGeometry(spanWidth, 0.65, 1.8);
    const lowBeam = new THREE.Mesh(lowBeamGeo, steel);
    lowBeam.position.set(0, 8.2, 0);
    lowBeam.castShadow = true;
    bridgeGroup.add(lowBeam);

    // Upper transverse girder beam
    const upBeamGeo = new THREE.BoxGeometry(spanWidth, 0.55, 1.4);
    const upBeam = new THREE.Mesh(upBeamGeo, steel);
    upBeam.position.set(0, 11.8, 0);
    upBeam.castShadow = true;
    bridgeGroup.add(upBeam);

    // Diagonal Warren Truss Members across the overhead span
    const segCount = 6;
    const segW = spanWidth / segCount;
    for (let s = 0; s < segCount; s++) {
      const sx1 = -spanWidth / 2 + s * segW;
      const sx2 = sx1 + segW;
      const midX = (sx1 + sx2) / 2;
      const hDiff = 11.8 - 8.2;
      const strutLen = Math.hypot(segW, hDiff);
      const strutGeo = new THREE.BoxGeometry(strutLen, 0.18, 0.18);

      const strut = new THREE.Mesh(strutGeo, steel);
      strut.position.set(midX, 10.0, 0);
      strut.rotation.z = (s % 2 === 0 ? 1 : -1) * Math.atan2(hDiff, segW);
      strut.castShadow = true;
      bridgeGroup.add(strut);
    }

    // Arching top chord crown
    const crownCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-halfSpan - 1.2, 11.8, 0),
      new THREE.Vector3(0, 14.8, 0),
      new THREE.Vector3(halfSpan + 1.2, 11.8, 0)
    );
    const crownGeo = new THREE.TubeGeometry(crownCurve, 16, 0.24, 6, false);
    const crown = new THREE.Mesh(crownGeo, steel);
    crown.castShadow = true;
    bridgeGroup.add(crown);

    // 3. Central Overhead Riveted Nameplate: "HOWRAH BRIDGE • হাওড়া ব্রিজ"
    const signGeo = new THREE.PlaneGeometry(8.8, 2.2);
    const signFront = new THREE.Mesh(signGeo, this.howrahSignMat);
    signFront.position.set(0, 9.8, 0.95);
    bridgeGroup.add(signFront);

    const signBack = new THREE.Mesh(signGeo, this.howrahSignMat);
    signBack.position.set(0, 9.8, -0.95);
    signBack.rotation.y = Math.PI;
    bridgeGroup.add(signBack);

    // Amber clearance lights on sign edges
    for (const lx of [-4.2, 0, 4.2]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), this.amberGlowMat);
      lamp.position.set(lx, 11.0, 1.0);
      bridgeGroup.add(lamp);

      const lampB = lamp.clone();
      lampB.position.set(lx, 11.0, -1.0);
      bridgeGroup.add(lampB);
    }

    return bridgeGroup;
  }

  /**
   * Iconic Calcutta Tramways Company (CTC) Green & Cream Vintage Electric Tram Car
   */
  createKolkataTramCar() {
    const tram = new THREE.Group();
    tram.name = 'KolkataVintageTram';

    const tramLength = 8.8;
    const tramWidth = 2.25;
    const tramHeight = 3.3;

    // 1. Two-Truck 4-Wheel Bogies (Resting on central tram rails)
    for (const bz of [-2.4, 2.4]) {
      const bogie = new THREE.Group();
      bogie.position.set(0, 0.25, bz);

      const bogieFrameGeo = new THREE.BoxGeometry(1.8, 0.16, 1.8);
      const bogieFrame = new THREE.Mesh(bogieFrameGeo, this.steelMat);
      bogie.add(bogieFrame);

      // 4 Cast-Iron Tram Flanged Wheels
      for (const wx of [-0.85, 0.85]) {
        for (const wz of [-0.65, 0.65]) {
          const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 14);
          wheelGeo.rotateZ(Math.PI / 2);
          const wheel = new THREE.Mesh(wheelGeo, this.steelMat);
          wheel.position.set(wx, 0.08, wz);
          bogie.add(wheel);
        }
      }
      tram.add(bogie);
    }

    // 2. Underbody Chassis & Cowcatcher Grille
    const chassisGeo = new THREE.BoxGeometry(tramWidth, 0.22, tramLength);
    const chassis = new THREE.Mesh(chassisGeo, this.steelMat);
    chassis.position.set(0, 0.65, 0);
    chassis.castShadow = true;
    tram.add(chassis);

    // Front & Rear curved safety cowcatcher fenders
    for (const cz of [-tramLength / 2 - 0.25, tramLength / 2 + 0.25]) {
      const cowGeo = new THREE.BoxGeometry(tramWidth * 0.9, 0.25, 0.4);
      const cow = new THREE.Mesh(cowGeo, this.hazardMat);
      cow.position.set(0, 0.35, cz);
      tram.add(cow);
    }

    // 3. Lower Body Shell: Signature Dark Forest Green with Gold Divider Pinstripe
    const lowerBodyGeo = new THREE.BoxGeometry(tramWidth, 1.1, tramLength);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, this.tramGreenMat);
    lowerBody.position.set(0, 1.3, 0);
    lowerBody.castShadow = true;
    tram.add(lowerBody);

    // Gold Waistline Pinstripe
    const goldStripeGeo = new THREE.BoxGeometry(tramWidth + 0.04, 0.08, tramLength + 0.04);
    const goldStripe = new THREE.Mesh(goldStripeGeo, this.tramGoldTrimMat);
    goldStripe.position.set(0, 1.88, 0);
    tram.add(goldStripe);

    // 4. Upper Cabin Shell: Vintage CTC Cream / Ivory
    const upperBodyGeo = new THREE.BoxGeometry(tramWidth, 1.25, tramLength);
    const upperBody = new THREE.Mesh(upperBodyGeo, this.tramCreamMat);
    upperBody.position.set(0, 2.5, 0);
    upperBody.castShadow = true;
    tram.add(upperBody);

    // 5. Arched Passenger Windows along both sides (6 large arched windows per side)
    const winCount = 6;
    const winStep = (tramLength - 1.8) / (winCount - 1);
    for (let w = 0; w < winCount; w++) {
      const wz = -tramLength / 2 + 0.9 + w * winStep;
      for (const side of [-1, 1]) {
        const winGeo = new THREE.BoxGeometry(0.06, 0.72, 0.85);
        const win = new THREE.Mesh(winGeo, this.windowGlassMat);
        win.position.set(side * (tramWidth / 2 + 0.02), 2.55, wz);
        tram.add(win);
      }
    }

    // Front & Rear 3-Piece Windscreens
    for (const fz of [-tramLength / 2 - 0.02, tramLength / 2 + 0.02]) {
      const screenGeo = new THREE.BoxGeometry(tramWidth * 0.82, 0.75, 0.06);
      const screen = new THREE.Mesh(screenGeo, this.windowGlassMat);
      screen.position.set(0, 2.55, fz);
      tram.add(screen);
    }

    // 6. Front & Rear Route Destination Boards: "14 • ESPLANADE - SHYAMBAZAR"
    const destGeo = new THREE.PlaneGeometry(1.6, 0.42);
    const destFront = new THREE.Mesh(destGeo, this.tramDestMat);
    destFront.position.set(0, 3.12, -tramLength / 2 - 0.04);
    destFront.rotation.y = Math.PI;
    tram.add(destFront);

    const destRear = new THREE.Mesh(destGeo, this.tramDestMat);
    destRear.position.set(0, 3.12, tramLength / 2 + 0.04);
    tram.add(destRear);

    // 7. Center Round Headlight on Front & Red Marker Lights on Rear
    const headlampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12);
    headlampGeo.rotateX(Math.PI / 2);
    const headlamp = new THREE.Mesh(headlampGeo, this.amberGlowMat);
    headlamp.position.set(0, 1.45, -tramLength / 2 - 0.06);
    tram.add(headlamp);

    const taillightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10);
    taillightGeo.rotateX(Math.PI / 2);
    const taillight = new THREE.Mesh(taillightGeo, this.reflectorRedMat);
    taillight.position.set(0, 1.45, tramLength / 2 + 0.06);
    tram.add(taillight);

    // 8. Clerestory Monitor Curved Roof with Ventilation Cowls
    const roofCurveGeo = new THREE.CylinderGeometry(tramWidth * 0.65, tramWidth * 0.65, tramLength + 0.3, 16, 1, false, 0, Math.PI);
    roofCurveGeo.rotateZ(Math.PI / 2);
    roofCurveGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofCurveGeo, this.tramCreamMat);
    roof.position.set(0, 3.18, 0);
    roof.castShadow = true;
    tram.add(roof);

    // 9. Articulated Diamond Pantograph / Trolley Pole contacting overhead wire
    const pantograph = new THREE.Group();
    pantograph.position.set(0, 3.45, -0.6);

    const pBaseGeo = new THREE.BoxGeometry(0.8, 0.12, 1.2);
    const pBase = new THREE.Mesh(pBaseGeo, this.steelMat);
    pantograph.add(pBase);

    // Lower scissor arms
    const arm1Geo = new THREE.CylinderGeometry(0.03, 0.03, 1.3);
    const arm1 = new THREE.Mesh(arm1Geo, this.steelMat);
    arm1.position.set(0, 0.65, -0.35);
    arm1.rotation.x = 0.55;
    pantograph.add(arm1);

    // Upper scissor arm
    const arm2 = new THREE.Mesh(arm1Geo, this.steelMat);
    arm2.position.set(0, 1.45, 0.05);
    arm2.rotation.x = -0.55;
    pantograph.add(arm2);

    // Horizontal collector bow / carbon shoe
    const collectorGeo = new THREE.BoxGeometry(1.6, 0.06, 0.18);
    const collector = new THREE.Mesh(collectorGeo, this.chromeMat);
    collector.position.set(0, 1.85, 0.4);
    pantograph.add(collector);

    tram.add(pantograph);

    return tram;
  }

  /**
   * Iconic Kolkata Traffic Police Hexagonal Umbrella Pagoda Booth
   */
  createKolkataPoliceBooth() {
    const booth = new THREE.Group();
    booth.name = 'KolkataPoliceBooth';

    // 1. Raised Octagonal Base with Blue & White Diagonal Stripes
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.4, 8);
    const base = new THREE.Mesh(baseGeo, this.policeBlueMat);
    base.position.y = 0.2;
    base.castShadow = true;
    booth.add(base);

    // White base rim
    const rimGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.08, 8);
    const rim = new THREE.Mesh(rimGeo, this.policeWhiteMat);
    rim.position.y = 0.42;
    booth.add(rim);

    // 2. Hexagonal Cabin Look-out Booth
    const cabinGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.9, 6);
    const cabin = new THREE.Mesh(cabinGeo, this.policeBlueMat);
    cabin.position.y = 1.35;
    cabin.castShadow = true;
    booth.add(cabin);

    // White waist band
    const bandGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.25, 6);
    const band = new THREE.Mesh(bandGeo, this.policeWhiteMat);
    band.position.y = 1.25;
    booth.add(band);

    // 360-degree Lookout Windows
    const winGeo = new THREE.CylinderGeometry(0.87, 0.87, 0.65, 6);
    const win = new THREE.Mesh(winGeo, this.windowGlassMat);
    win.position.y = 1.85;
    booth.add(win);

    // 3. Kolkata Police Crest & Shield on Front
    const shieldGeo = new THREE.PlaneGeometry(0.75, 0.42);
    const shield = new THREE.Mesh(shieldGeo, this.policeShieldMat);
    shield.position.set(0, 1.25, 0.89);
    booth.add(shield);

    // 4. Large Octagonal Sun-Umbrella Canopy Overhead (Alternating Blue & White Segments)
    const umbrellaMastGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 8);
    const umbrellaMast = new THREE.Mesh(umbrellaMastGeo, this.chromeMat);
    umbrellaMast.position.y = 1.8;
    booth.add(umbrellaMast);

    const umbrellaGeo = new THREE.ConeGeometry(1.95, 0.65, 8);
    const umbrella = new THREE.Mesh(umbrellaGeo, this.policeBlueMat);
    umbrella.position.y = 3.6;
    umbrella.castShadow = true;
    booth.add(umbrella);

    // White umbrella scallops & ribs
    const capGeo = new THREE.ConeGeometry(0.4, 0.2, 8);
    const cap = new THREE.Mesh(capGeo, this.policeWhiteMat);
    cap.position.y = 3.95;
    booth.add(cap);

    return booth;
  }

  /**
   * Overhead Central Tram Electrical Cables & Suspension Droppers
   */
  createOverheadTramWires(length = 40.0) {
    const wireGroup = new THREE.Group();
    wireGroup.name = 'OverheadTramWires';

    const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

    // Twin contact cables directly above the tram rails (X = -0.65 and +0.65, Y = 5.25m)
    for (const wx of [-0.65, 0.65]) {
      const wireGeo = new THREE.BoxGeometry(0.03, 0.03, length);
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.set(wx, 5.25, -length / 2);
      wireGroup.add(wire);
    }

    // Transverse Span Wire Brackets every 20m
    const bracketCount = Math.floor(length / 20.0);
    for (let b = 0; b <= bracketCount; b++) {
      const bz = -b * 20.0;

      // Transverse span cable across street
      const spanGeo = new THREE.BoxGeometry(8.5, 0.02, 0.02);
      const span = new THREE.Mesh(spanGeo, wireMat);
      span.position.set(0, 5.5, bz);
      wireGroup.add(span);

      // Ceramic insulator droppers holding the contact wire
      for (const wx of [-0.65, 0.65]) {
        const dropGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 4);
        const drop = new THREE.Mesh(dropGeo, wireMat);
        drop.position.set(wx, 5.38, bz);
        wireGroup.add(drop);

        const insGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.08, 6);
        const ins = new THREE.Mesh(insGeo, this.policeWhiteMat);
        ins.position.set(wx, 5.48, bz);
        wireGroup.add(ins);
      }
    }

    return wireGroup;
  }

  /**
   * Roadside Traffic Cone with white reflective sleeve (matching reference screenshot)
   */
  createTrafficCone() {
    const group = new THREE.Group();
    group.name = 'RoadsideTrafficCone';

    // 1. Black/Dark rubber square base plinth
    const baseGeo = new THREE.BoxGeometry(0.42, 0.05, 0.42);
    const base = new THREE.Mesh(baseGeo, this.coneBaseMat);
    base.position.y = 0.025;
    base.castShadow = true;
    group.add(base);

    // 2. Bright orange conical body
    const bodyGeo = new THREE.ConeGeometry(0.18, 0.72, 12);
    const body = new THREE.Mesh(bodyGeo, this.coneOrangeMat);
    body.position.y = 0.41;
    body.castShadow = true;
    group.add(body);

    // 3. White retro-reflective sleeve collar
    const sleeveGeo = new THREE.CylinderGeometry(0.115, 0.145, 0.16, 12);
    const sleeve = new THREE.Mesh(sleeveGeo, this.coneWhiteMat);
    sleeve.position.y = 0.38;
    group.add(sleeve);

    return group;
  }

  /**
   * Traditional Glowing Terracotta Diya (Oil Lamp) on curb/sidewalk (matching reference screenshot)
   */
  createDiyaLamp() {
    const group = new THREE.Group();
    group.name = 'CurbDiyaLamp';

    // 1. Terracotta clay oil dish
    const dishGeo = new THREE.CylinderGeometry(0.14, 0.07, 0.07, 10);
    const dish = new THREE.Mesh(dishGeo, this.diyaClayMat);
    dish.position.y = 0.035;
    group.add(dish);

    // 2. Bright golden flame cone
    const flameGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
    const flame = new THREE.Mesh(flameGeo, this.diyaFlameMat);
    flame.position.y = 0.11;
    group.add(flame);

    // 3. Warm amber light halo pool on curb stone (soft radial gradient)
    const haloGeo = new THREE.PlaneGeometry(1.25, 1.25);
    haloGeo.rotateX(-Math.PI / 2);
    const halo = new THREE.Mesh(haloGeo, this.diyaGlowMat);
    halo.position.y = 0.01;
    group.add(halo);

    return group;
  }
}
