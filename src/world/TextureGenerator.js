import * as THREE from 'three';

/**
 * Cycle Rush: Kolkata Alleyways
 * Procedural Texture Generator using HTML5 Canvas
 */
export class TextureGenerator {
  /**
   * Generates decorative Kolkata Rickshaw Art for the rear tin panel.
   */
  static createRearPlateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background gradient: vibrant yellow-orange to deep cyan
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    bgGrad.addColorStop(0, '#f39c12');
    bgGrad.addColorStop(0.5, '#e74c3c');
    bgGrad.addColorStop(1, '#16a085');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Decorative ornate border
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#f1c40f';
    ctx.strokeRect(16, 16, 480, 480);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(28, 28, 456, 456);

    // Triangular folk fringe around inner border
    ctx.fillStyle = '#c0392b';
    for (let i = 40; i < 480; i += 32) {
      // Top fringe
      ctx.beginPath();
      ctx.moveTo(i, 34);
      ctx.lineTo(i + 16, 54);
      ctx.lineTo(i + 32, 34);
      ctx.fill();
      // Bottom fringe
      ctx.beginPath();
      ctx.moveTo(i, 478);
      ctx.lineTo(i + 16, 458);
      ctx.lineTo(i + 32, 478);
      ctx.fill();
    }

    // Central painted lotus flower
    const cx = 256;
    const cy = 250;
    
    // Lotus petals
    const petalColors = ['#ff6b81', '#ff4757', '#ffbe76', '#ffffff'];
    for (let layer = 3; layer >= 0; layer--) {
      ctx.fillStyle = petalColors[layer % petalColors.length];
      const count = 7 + layer * 2;
      const r = 70 + layer * 25;
      for (let p = 0; p < count; p++) {
        const angle = (p / count) * Math.PI + Math.PI;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * (r * 0.7);
        ctx.beginPath();
        ctx.arc(px, py, 22 - layer * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Center jewel
    ctx.fillStyle = '#ffd32a';
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Bengali traditional text: "যাত্রা শুভ হোক" (Have a safe journey!)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Trebuchet MS", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText('যাত্রা শুভ হোক', cx, 410);
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('KOLKATA RICKSHAW', cx, 445);
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Generates canopy texture based on selected skin definition.
   */
  static createCanopyTexture(skin) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base background
    ctx.fillStyle = skin.primaryColor;
    ctx.fillRect(0, 0, 512, 512);

    if (skin.pattern === 'stripes') {
      // Classic Kolkata bold awning stripes
      ctx.fillStyle = skin.secondaryColor;
      for (let x = 0; x < 512; x += 64) {
        ctx.fillRect(x, 0, 32, 512);
      }
    } else if (skin.pattern === 'taxi-check') {
      // Kolkata Ambassador Taxi checkerboard pattern
      ctx.fillStyle = skin.secondaryColor;
      const size = 32;
      for (let y = 0; y < 512; y += size) {
        for (let x = 0; x < 512; x += size) {
          if (((x / size) + (y / size)) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
      // Yellow Taxi stripe
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(0, 220, 512, 72);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 44px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAXI 1974', 256, 275);
    } else if (skin.pattern === 'waves') {
      // Royal Blue with Hooghly river wave curves
      ctx.strokeStyle = skin.secondaryColor;
      ctx.lineWidth = 14;
      for (let y = 20; y < 512; y += 48) {
        ctx.beginPath();
        for (let x = 0; x <= 512; x += 20) {
          const dy = Math.sin((x / 512) * Math.PI * 4) * 16;
          if (x === 0) ctx.moveTo(x, y + dy);
          else ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }
    } else if (skin.pattern === 'floral') {
      // Bengali floral creepers
      ctx.fillStyle = skin.secondaryColor;
      for (let y = 40; y < 512; y += 80) {
        for (let x = 40; x < 512; x += 80) {
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, Math.PI * 2);
          ctx.fill();
          // Petals
          ctx.fillStyle = skin.fringeColor;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * 20, y + Math.sin(a) * 20, 10, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = skin.secondaryColor;
        }
      }
    } else if (skin.pattern === 'festival') {
      // Puja radiant diamond motifs & marigold garlands
      ctx.fillStyle = skin.secondaryColor;
      const dSize = 64;
      for (let y = 0; y < 512; y += dSize) {
        for (let x = 0; x < 512; x += dSize) {
          ctx.beginPath();
          ctx.moveTo(x + dSize / 2, y);
          ctx.lineTo(x + dSize, y + dSize / 2);
          ctx.lineTo(x + dSize / 2, y + dSize);
          ctx.lineTo(x, y + dSize / 2);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.fillStyle = skin.fringeColor;
      ctx.fillRect(0, 0, 512, 30);
      ctx.fillRect(0, 482, 512, 30);
    }

    // Fringe hemline border at bottom
    ctx.fillStyle = skin.fringeColor;
    ctx.fillRect(0, 470, 512, 42);

    // Scalloped fringe cuts
    ctx.fillStyle = '#222222';
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.arc(x + 16, 512, 14, Math.PI, 0, false);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates authentic midnight tarmac road texture (exact match to reference screenshot):
   * - Deep midnight charcoal aggregate asphalt base (#1c1b26)
   * - Fine micro-aggregate mineral specks (light quartz & dark bitumen)
   * - Realistic branching asphalt cracks and fissures on driving lanes
   * - Crisp pure-white dashed lane dividers (#ffffff) separating driving lanes
   * - Solid outer white shoulder boundary lines along curbs
   * - Soft natural tire wear paths along traffic lanes
   */
  static createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Base deep midnight tarmac charcoal asphalt (matching reference screenshot)
    ctx.fillStyle = '#1c1b26';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Micro-aggregate gravel & bitumen noise pattern (ultra-fast, authentic tarmac grain)
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 64;
    noiseCanvas.height = 64;
    const nCtx = noiseCanvas.getContext('2d');
    const nImg = nCtx.createImageData(64, 64);
    for (let i = 0; i < nImg.data.length; i += 4) {
      const rand = Math.random();
      if (rand < 0.45) {
        // Dark bitumen grain
        nImg.data[i] = 10;
        nImg.data[i + 1] = 10;
        nImg.data[i + 2] = 14;
        nImg.data[i + 3] = 48;
      } else if (rand > 0.82) {
        // Light aggregate mineral flecks
        nImg.data[i] = 175;
        nImg.data[i + 1] = 180;
        nImg.data[i + 2] = 195;
        nImg.data[i + 3] = 32;
      } else {
        // Neutral variation
        const v = Math.floor(rand * 35);
        nImg.data[i] = v;
        nImg.data[i + 1] = v;
        nImg.data[i + 2] = v + 4;
        nImg.data[i + 3] = 20;
      }
    }
    nCtx.putImageData(nImg, 0, 0);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 512, 512);

    // 3. Realistic branching asphalt cracks and fissures (matching reference screenshot)
    ctx.save();
    const drawCrack = (startX, startY, segments) => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(8, 7, 12, 0.88)';
      ctx.lineWidth = 1.9;
      let cx = startX, cy = startY;
      ctx.moveTo(cx, cy);
      for (const seg of segments) {
        cx += seg[0];
        cy += seg[1];
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Subtle highlighted edge for realistic depth
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.0;
      cx = startX + 0.8;
      cy = startY + 0.8;
      ctx.moveTo(cx, cy);
      for (const seg of segments) {
        cx += seg[0];
        cy += seg[1];
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    };

    // Left outer lane organic asphalt cracks
    drawCrack(68, 30, [[14, 24], [-8, 22], [16, 28], [6, 20], [-10, 18], [14, 26]]);
    drawCrack(82, 75, [[20, 12], [14, 18], [18, 8]]);
    drawCrack(58, 290, [[-14, 22], [12, 26], [-8, 18], [15, 30], [-6, 22]]);
    // Mid-right lane asphalt fissures
    drawCrack(320, 160, [[16, 22], [-10, 18], [14, 24], [-6, 18]]);
    drawCrack(336, 198, [[18, 10], [12, 16]]);
    drawCrack(410, 380, [[-12, 20], [10, 24], [-8, 16], [12, 22]]);
    ctx.restore();

    // 4. Subtle dark tire wear paths in lanes
    const tireGrad = ctx.createLinearGradient(0, 0, 512, 0);
    tireGrad.addColorStop(0, 'rgba(0,0,0,0)');
    tireGrad.addColorStop(0.12, 'rgba(12, 11, 16, 0.35)');
    tireGrad.addColorStop(0.24, 'rgba(0,0,0,0)');
    tireGrad.addColorStop(0.36, 'rgba(12, 11, 16, 0.35)');
    tireGrad.addColorStop(0.48, 'rgba(0,0,0,0)');
    tireGrad.addColorStop(0.64, 'rgba(12, 11, 16, 0.35)');
    tireGrad.addColorStop(0.76, 'rgba(0,0,0,0)');
    tireGrad.addColorStop(0.88, 'rgba(12, 11, 16, 0.35)');
    tireGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tireGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 5. Solid outer white shoulder boundary lines (flush along curbs)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 0, 9, 512);
    ctx.fillRect(489, 0, 9, 512);

    // 6. Crisp White Driving Lane Dividers (Exact match to reference screenshot: 4 lanes separated by 3 white dashed lines)
    ctx.fillStyle = '#ffffff';
    const dashY = [
      { start: 24, len: 155 },
      { start: 280, len: 155 }
    ];
    for (const d of dashY) {
      // Lane divider 1 (left)
      ctx.fillRect(133, d.start, 7, d.len);
      // Lane divider 2 (center)
      ctx.fillRect(253, d.start, 7, d.len);
      // Lane divider 3 (right)
      ctx.fillRect(373, d.start, 7, d.len);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }

  /**
   * Generates Indian Black & Yellow alternating hazard curb texture (matching reference screenshot):
   * Alternates large, vivid road-safety yellow and charcoal black rectangular blocks along road length.
   */
  static createHazardCurbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Block 1 (Top half, V = 0 to 256): Vivid Highway Yellow
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(0, 0, 256, 256);

    // Block 2 (Bottom half, V = 256 to 512): Charcoal Black
    ctx.fillStyle = '#141416';
    ctx.fillRect(0, 256, 256, 256);

    // Concrete top-bevel surface highlights and shadows across X (U axis)
    // Left side (x = 0 to 110) is vertical face facing road
    // Right side (x = 110 to 256) is beveled top surface
    const bevelGrad = ctx.createLinearGradient(0, 0, 256, 0);
    bevelGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    bevelGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.28)'); // Crisp top-corner bevel highlight
    bevelGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.1)');
    bevelGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.05)');
    bevelGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)'); // Back recessed joint
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(0, 0, 256, 512);

    // Recessed dark mortar joints between alternating blocks
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 254, 256, 5);
    ctx.fillRect(0, 0, 256, 4);
    ctx.fillRect(0, 508, 256, 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }

  /**
   * Generates arcade circular dashed targeting/drift reticle texture on asphalt
   * (matching reference screenshot circle around the auto-rickshaw)
   */
  static createTargetReticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cx = 256, cy = 256;
    const rOuter = 240, rInner = 200;
    const segments = 32;
    const segAngle = (Math.PI * 2) / segments;
    const dashRatio = 0.65; // 65% arc solid block, 35% gap

    ctx.fillStyle = 'rgba(245, 248, 255, 0.75)';
    for (let i = 0; i < segments; i++) {
      const a0 = i * segAngle;
      const a1 = a0 + segAngle * dashRatio;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, a0, a1, false);
      ctx.arc(cx, cy, rInner, a1, a0, true);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates a smooth, feather-edged radial light glow texture (for lamps, headlights, and diyas)
   */
  static createRadialGlowTexture(innerColor = 'rgba(255, 185, 65, 0.95)', midColor = 'rgba(255, 135, 30, 0.38)', outerColor = 'rgba(255, 90, 10, 0.0)') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.35, midColor);
    grad.addColorStop(1, outerColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(canvas);
    return glowTex;
  }

  /**
   * Generates vibrant Neon Pink/Magenta glowing chevron arrow signs (>>>)
   * for race curve barriers, matching the reference screenshot.
   */
  static createChevronNeonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark metallic purple/black backing board
    ctx.fillStyle = '#160824';
    ctx.fillRect(0, 0, 512, 256);

    // Neon pink glowing border
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 18;
    ctx.strokeRect(8, 8, 496, 240);

    // 3 Large Bold Neon Chevron Arrows (>>>)
    ctx.fillStyle = '#ff2a9d';
    const arrowX = [105, 235, 365];
    for (const ax of arrowX) {
      ctx.beginPath();
      ctx.moveTo(ax - 45, 40);
      ctx.lineTo(ax + 35, 128);
      ctx.lineTo(ax - 45, 216);
      ctx.lineTo(ax - 10, 216);
      ctx.lineTo(ax + 70, 128);
      ctx.lineTo(ax - 10, 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates vintage Kolkata shop signboards
   */
  static createShopSignboardTexture(name, subtitle, bgColor = '#a83232', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Board background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    // Weathered board border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f1c40f';
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(name, 256, 56);

    ctx.font = 'italic 19px Georgia, serif';
    ctx.fillText(subtitle, 256, 94);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates iconic Howrah Bridge cantilever riveted steel nameplate texture
   */
  static createHowrahBridgeSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Heavy weathered steel plate background
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(0, 0, 512, 128);

    // Industrial yellow-black hazard border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f1c40f';
    ctx.strokeRect(6, 6, 500, 116);

    // Steel rivets around perimeter
    ctx.fillStyle = '#95a5a6';
    for (let x = 16; x < 500; x += 32) {
      ctx.beginPath();
      ctx.arc(x, 14, 4, 0, Math.PI * 2);
      ctx.arc(x, 114, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title in English and Bengali
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText('HOWRAH BRIDGE • হাওড়া ব্রিজ', 256, 58);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText('HISTORIC CANTILEVER • ESTD. 1943 • 25 KM/H SPEED LIMIT', 256, 96);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Calcutta Tramways Company (CTC) route destination board
   */
  static createTramDestinationTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Classic CTC Crimson / Burgundy Board
    ctx.fillStyle = '#78281f';
    ctx.fillRect(0, 0, 512, 128);

    // Gold trim border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f1c40f';
    ctx.strokeRect(6, 6, 500, 116);

    // Route number badge
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(20, 20, 72, 88);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 52px "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('14', 56, 84);

    // Destination in English and Bengali
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 32px "Trebuchet MS", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('ESPLANADE - SHYAMBAZAR', 106, 58);

    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillStyle = '#f9e79f';
    ctx.fillText('এসপ্ল্যানেড - শ্যামবাজার • CALCUTTA TRAMWAYS', 106, 94);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Kolkata Police Official Shield & Slogan Texture
   */
  static createPoliceShieldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Royal Blue background
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(0, 0, 512, 256);

    // White border
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(8, 8, 496, 240);

    // Kolkata Police Crest Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOLKATA POLICE', 256, 75);

    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('কলকাতা পুলিশ', 256, 120);

    // Slogan Banner
    ctx.fillStyle = '#fffa65';
    ctx.fillRect(40, 150, 432, 60);

    ctx.fillStyle = '#1b1464';
    ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
    ctx.fillText('★ SAFE DRIVE SAVE LIFE ★', 256, 190);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates GTA-style modern urban concrete sidewalk tile texture:
   * Atmospheric dark slate pavers with recessed mortar joints (matching reference screenshot)
   */
  static createSidewalkTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark slate concrete tone for night realism
    ctx.fillStyle = '#383f4b';
    ctx.fillRect(0, 0, 512, 512);

    // 64x64 grid pavers
    const tileSize = 64;
    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        ctx.fillStyle = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? '#424956' : '#343a46';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, 2);
        ctx.fillRect(x + 2, y + 2, 2, tileSize - 4);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(x + 2, y + tileSize - 4, tileSize - 4, 2);
        ctx.fillRect(x + tileSize - 4, y + 2, 2, tileSize - 4);
      }
    }

    // Recessed dark mortar lines
    ctx.strokeStyle = '#1b1e25';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 6);
    return texture;
  }

  /**
   * Generates stylized GTA 6 / Vice City / CyberCity Neon Billboard posters
   */
  static createGTABillboardTexture(title = 'VICE CITY GP', sub = 'GURUGRAM SPEEDWAY', theme = 'vice') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    if (theme === 'vice') {
      grad.addColorStop(0, '#ff007f');   // Hot neon pink
      grad.addColorStop(0.5, '#7d0552'); // Magenta purple
      grad.addColorStop(1, '#00f0ff');   // Cyan blue
    } else if (theme === 'sunset') {
      grad.addColorStop(0, '#f39c12');   // Sun gold
      grad.addColorStop(0.5, '#e74c3c'); // Crimson
      grad.addColorStop(1, '#8e44ad');   // Deep violet
    } else {
      grad.addColorStop(0, '#00b894');   // Emerald
      grad.addColorStop(0.5, '#0984e3'); // Blue
      grad.addColorStop(1, '#6c5ce7');   // Indigo
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Sun disc
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(256, 175, 75, 0, Math.PI * 2);
    ctx.fill();

    // Palm tree silhouettes
    ctx.fillStyle = '#1e152a';
    for (const px of [75, 435]) {
      ctx.beginPath();
      ctx.moveTo(px - 6, 256);
      ctx.quadraticCurveTo(px + (px > 256 ? -25 : 25), 160, px, 90);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#1e152a';
      ctx.stroke();
      for (let a = 0; a < 6; a++) {
        const ang = -Math.PI * 0.8 + a * 0.35;
        ctx.beginPath();
        ctx.moveTo(px, 90);
        ctx.quadraticCurveTo(px + Math.cos(ang) * 45, 90 + Math.sin(ang) * 35 + 10, px + Math.cos(ang) * 65, 90 + Math.sin(ang) * 55);
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }

    // Grid horizon lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    for (let y = 175; y <= 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Chrome & Neon Border
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 244);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold italic 54px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fillText(title, 256, 85);

    // Subtitle
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
    ctx.fillText(sub, 256, 135);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates modern blue reflective glass curtain wall texture (matching reference screenshot):
   * Bright cyan-blue reflective glass panels, white structural mullion grid & sky reflections.
   */
  static createGlassFacadeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Sky-Blue Reflective Glass
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#5dade2');
    grad.addColorStop(0.35, '#2e86c1');
    grad.addColorStop(0.7, '#1b4f72');
    grad.addColorStop(1, '#3498db');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Diagonal sky sheen reflection highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(240, 0);
    ctx.lineTo(380, 0);
    ctx.lineTo(0, 220);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(512, 40);
    ctx.lineTo(512, 140);
    ctx.lineTo(0, 420);
    ctx.fill();

    // 8x8 Grid of Glass Panes with White Architectural Mullions
    const paneCols = 8;
    const paneRows = 8;
    const pw = 512 / paneCols;
    const ph = 512 / paneRows;

    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;

    for (let r = 0; r < paneRows; r++) {
      for (let c = 0; c < paneCols; c++) {
        const px = c * pw;
        const py = r * ph;

        // Pane inner shadow & bevel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(px + 2, py + 2, pw - 4, 3);
        ctx.fillRect(px + 2, py + 2, 3, ph - 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(px + 2, py + ph - 5, pw - 4, 3);
        ctx.fillRect(px + pw - 5, py + 2, 3, ph - 4);

        ctx.strokeRect(px, py, pw, ph);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  /**
   * Generates modern horizontal louvered / brise-soleil facade texture (matching reference screenshot):
   * Crisp white horizontal sunshade slats over dark recessed ribbon windows.
   */
  static createLouverFacadeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark tinted window background
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(0, 0, 512, 512);

    // Multi-tier floors (4 floors per 512px)
    const floorH = 128;
    for (let f = 0; f < 4; f++) {
      const fy = f * floorH;

      // Heavy white concrete floor slab
      ctx.fillStyle = '#f2f4f4';
      ctx.fillRect(0, fy, 512, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, fy + 24, 512, 4);

      // 4 Horizontal sunshade louvers / aluminum fins per floor
      const louverCount = 4;
      const louverSpacing = (floorH - 38) / louverCount;
      for (let l = 0; l < louverCount; l++) {
        const ly = fy + 34 + l * louverSpacing;

        // Louver shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, ly + 8, 512, 6);

        // White architectural louver fin
        ctx.fillStyle = '#eaeded';
        ctx.fillRect(0, ly, 512, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, ly, 512, 3);
      }

      // Vertical structural support posts
      ctx.fillStyle = '#bdc3c7';
      for (let x = 64; x < 512; x += 96) {
        ctx.fillRect(x - 3, fy + 28, 6, floorH - 28);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3);
    return texture;
  }

  /**
   * Generates pedestrian zebra crosswalk texture for city intersections (matching reference image)
   */
  static createCrosswalkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Midnight asphalt base (seamless match to RaceTrack road)
    ctx.fillStyle = '#1c1b26';
    ctx.fillRect(0, 0, 512, 128);

    // Fine aggregate noise on asphalt
    for (let i = 0; i < 300; i++) {
      const nx = Math.random() * 512;
      const ny = Math.random() * 128;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15)';
      ctx.fillRect(nx, ny, 2, 2);
    }

    // Crisp high-visibility white zebra crossing bars
    ctx.fillStyle = '#f8f9fa';
    const barWidth = 36;
    const gap = 24;
    for (let x = 12; x < 500; x += barWidth + gap) {
      ctx.fillRect(x, 10, barWidth, 108);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates lush manicured park lawn texture with paving borders (matching reference image)
   */
  static createParkGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base fresh spring park green
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, 512, 512);

    // Grass texture mown lawn stripes
    for (let y = 0; y < 512; y += 32) {
      ctx.fillStyle = (y / 32) % 2 === 0 ? '#2ecc71' : '#229954';
      ctx.fillRect(0, y, 512, 32);
    }

    // Micro grass blade noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  /**
   * Generates sparkling blue fountain pool water texture
   */
  static createFountainWaterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Vibrant turquoise / cyan pool water
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(0.6, '#0984e3');
    grad.addColorStop(1, '#0c2461');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Concentric ripple rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    for (let r = 20; r < 120; r += 24) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}

