import Phaser from 'phaser';

/**
 * Procedural Pixel Art Generator for CozyHaven.
 * Renders original, crisp 16x16 and 32x32 pixel sprites into Phaser TextureManager.
 */
export function generateProceduralTextures(scene: Phaser.Scene) {
  const textures = scene.textures;

  const createPixelCanvas = (width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
    return canvas;
  };

  // --- 1. ENVIRONMENT TILES (32x32) ---
  if (!textures.exists('tile_grass')) {
    textures.addCanvas(
      'tile_grass',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#5fb669'; // base meadow green
        ctx.fillRect(0, 0, 32, 32);
        // Darker grass texture specks
        ctx.fillStyle = '#4fa359';
        for (let i = 0; i < 32; i += 4) {
          for (let j = 0; j < 32; j += 4) {
            if ((i + j * 3) % 7 === 0) ctx.fillRect(i, j, 2, 2);
          }
        }
        // Bright grass blades
        ctx.fillStyle = '#73cc7d';
        ctx.fillRect(6, 8, 2, 4);
        ctx.fillRect(20, 18, 2, 4);
        ctx.fillRect(12, 24, 2, 3);
        // Little white daisy
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(26, 6, 2, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(27, 7, 1, 1);
      })
    );
  }

  if (!textures.exists('tile_dirt')) {
    textures.addCanvas(
      'tile_dirt',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#b8895b'; // warm soil
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#a17346';
        for (let i = 0; i < 32; i += 4) {
          for (let j = 0; j < 32; j += 4) {
            if ((i * 2 + j) % 5 === 0) ctx.fillRect(i, j, 2, 2);
          }
        }
      })
    );
  }

  if (!textures.exists('tile_tilled')) {
    textures.addCanvas(
      'tile_tilled',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#8b5a2b'; // furrowed soil
        ctx.fillRect(0, 0, 32, 32);
        // Furrow ridges
        ctx.fillStyle = '#6b421a';
        ctx.fillRect(0, 6, 32, 4);
        ctx.fillRect(0, 14, 32, 4);
        ctx.fillRect(0, 22, 32, 4);
        ctx.fillStyle = '#a6723e';
        ctx.fillRect(0, 10, 32, 2);
        ctx.fillRect(0, 18, 32, 2);
        ctx.fillRect(0, 26, 32, 2);
      })
    );
  }

  if (!textures.exists('tile_tilled_watered')) {
    textures.addCanvas(
      'tile_tilled_watered',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#4a2c11'; // dark moist soil
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#321c08';
        ctx.fillRect(0, 6, 32, 4);
        ctx.fillRect(0, 14, 32, 4);
        ctx.fillRect(0, 22, 32, 4);
        // Water glistening specks
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(4, 8, 2, 2);
        ctx.fillRect(18, 16, 2, 2);
        ctx.fillRect(12, 24, 2, 2);
      })
    );
  }

  if (!textures.exists('tile_water')) {
    textures.addCanvas(
      'tile_water',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#38bdf8'; // bright water
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 14, 32, 4);
        ctx.fillRect(0, 28, 32, 4);
        // Soft white ripples
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(4, 4, 8, 2);
        ctx.fillRect(18, 18, 10, 2);
      })
    );
  }

  if (!textures.exists('tile_sand')) {
    textures.addCanvas(
      'tile_sand',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(6, 6, 2, 2);
        ctx.fillRect(20, 14, 2, 2);
        ctx.fillRect(12, 24, 2, 2);
      })
    );
  }

  if (!textures.exists('tile_path')) {
    textures.addCanvas(
      'tile_path',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#d6c4a5'; // cobblestone/dirt path
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#baa382';
        // Pebble outlines
        ctx.strokeRect(2, 2, 12, 10);
        ctx.strokeRect(16, 4, 14, 12);
        ctx.strokeRect(4, 16, 14, 12);
        ctx.strokeRect(20, 18, 10, 10);
      })
    );
  }

  if (!textures.exists('tile_wood_floor')) {
    textures.addCanvas(
      'tile_wood_floor',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#d2b48c';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#a67c52';
        ctx.fillRect(0, 0, 32, 1);
        ctx.fillRect(0, 10, 32, 1);
        ctx.fillRect(0, 21, 32, 1);
        ctx.fillRect(0, 31, 32, 1);
        ctx.fillRect(16, 0, 1, 10);
        ctx.fillRect(8, 10, 1, 11);
        ctx.fillRect(24, 21, 1, 10);
      })
    );
  }

  if (!textures.exists('tile_wall_wood')) {
    textures.addCanvas(
      'tile_wall_wood',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(0, 0, 32, 4);
        ctx.fillRect(0, 30, 32, 2);
        ctx.fillStyle = '#73441c';
        ctx.fillRect(0, 15, 32, 2);
      })
    );
  }

  if (!textures.exists('tile_forest_grass')) {
    textures.addCanvas(
      'tile_forest_grass',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#2d6a4f'; // deep pine forest green
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#1b4332';
        for (let i = 0; i < 32; i += 4) {
          for (let j = 0; j < 32; j += 4) {
            if ((i + j * 2) % 7 === 0) ctx.fillRect(i, j, 2, 2);
          }
        }
        // Fallen brown pine needles
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 10, 3, 1);
        ctx.fillRect(20, 22, 3, 1);
        ctx.fillRect(14, 6, 1, 3);
        // Little blue forest mushroom
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(24, 16, 2, 2);
      })
    );
  }

  if (!textures.exists('tile_hotspring')) {
    textures.addCanvas(
      'tile_hotspring',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#38bdf8'; // warm turquoise water
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 8, 32, 3);
        ctx.fillRect(0, 20, 32, 3);
        // Thermal steam ripples & bubbles
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(8, 14, 2, 0, Math.PI * 2);
        ctx.arc(22, 10, 3, 0, Math.PI * 2);
        ctx.arc(16, 24, 2.5, 0, Math.PI * 2);
        ctx.fill();
      })
    );
  }

  if (!textures.exists('tile_cave_floor')) {
    textures.addCanvas(
      'tile_cave_floor',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#334155'; // dark cavern slate
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 32, 1);
        ctx.fillRect(0, 0, 1, 32);
        // Glistening mineral specks
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 8, 2, 2);
        ctx.fillRect(20, 18, 2, 2);
        ctx.fillRect(12, 26, 2, 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(7, 9, 1, 1);
        ctx.fillRect(21, 19, 1, 1);
      })
    );
  }

  if (!textures.exists('tile_cave_wall')) {
    textures.addCanvas(
      'tile_cave_wall',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 26, 32, 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 4, 24, 8);
        ctx.fillRect(8, 14, 18, 6);
      })
    );
  }

  if (!textures.exists('tile_ocean_deep')) {
    textures.addCanvas(
      'tile_ocean_deep',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 10, 32, 4);
        ctx.fillRect(0, 24, 32, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(6, 12, 8, 1);
        ctx.fillRect(20, 26, 6, 1);
      })
    );
  }

  if (!textures.exists('tile_ocean_shallow')) {
    textures.addCanvas(
      'tile_ocean_shallow',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, 32, 32);
        // Gentle white foamy wave crest
        ctx.fillStyle = '#f0f9ff';
        ctx.fillRect(0, 4, 32, 3);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(4, 16, 12, 2);
        ctx.fillRect(18, 22, 10, 2);
      })
    );
  }

  if (!textures.exists('tile_pier_wood')) {
    textures.addCanvas(
      'tile_pier_wood',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, 32, 2);
        ctx.fillRect(0, 10, 32, 2);
        ctx.fillRect(0, 20, 32, 2);
        ctx.fillRect(0, 30, 32, 2);
        // Iron nail studs
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 5, 2, 2);
        ctx.fillRect(26, 5, 2, 2);
        ctx.fillRect(4, 15, 2, 2);
        ctx.fillRect(26, 15, 2, 2);
        ctx.fillRect(4, 25, 2, 2);
        ctx.fillRect(26, 25, 2, 2);
      })
    );
  }

  // --- 2. LARGE OBJECTS (Trees, Boulders, Shipping Bin, Buildings) ---
  if (!textures.exists('obj_tree')) {
    textures.addCanvas(
      'obj_tree',
      createPixelCanvas(48, 64, (ctx) => {
        // Trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(20, 40, 8, 22);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(20, 40, 2, 22);
        // Foliage shadow
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(24, 26, 22, 0, Math.PI * 2);
        ctx.fill();
        // Foliage main
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(24, 22, 19, 0, Math.PI * 2);
        ctx.fill();
        // Foliage highlight
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.arc(19, 16, 10, 0, Math.PI * 2);
        ctx.fill();
        // Sweet red apples
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(14, 22, 4, 4);
        ctx.fillRect(30, 18, 4, 4);
        ctx.fillRect(22, 30, 4, 4);
      })
    );
  }

  if (!textures.exists('obj_pine_tree')) {
    textures.addCanvas(
      'obj_pine_tree',
      createPixelCanvas(48, 64, (ctx) => {
        // Trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(21, 46, 6, 16);
        // Tier 3 foliage (bottom)
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.moveTo(8, 48);
        ctx.lineTo(24, 30);
        ctx.lineTo(40, 48);
        ctx.closePath();
        ctx.fill();
        // Tier 2 foliage (middle)
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(12, 34);
        ctx.lineTo(24, 18);
        ctx.lineTo(36, 34);
        ctx.closePath();
        ctx.fill();
        // Tier 1 foliage (top tip)
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(16, 20);
        ctx.lineTo(24, 6);
        ctx.lineTo(32, 20);
        ctx.closePath();
        ctx.fill();
        // Highlights & pinecones
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(22, 10, 3, 3);
        ctx.fillRect(20, 24, 3, 3);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(16, 38, 3, 4);
        ctx.fillRect(29, 36, 3, 4);
      })
    );
  }

  if (!textures.exists('obj_palm_tree')) {
    textures.addCanvas(
      'obj_palm_tree',
      createPixelCanvas(48, 64, (ctx) => {
        // Curved trunk
        ctx.fillStyle = '#92400e';
        ctx.fillRect(22, 44, 6, 18);
        ctx.fillRect(20, 28, 6, 18);
        ctx.fillRect(18, 14, 6, 16);
        // Fronds / Palm leaves
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(10, 16, 12, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(32, 16, 12, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(20, 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(12, 14, 6, 2);
        ctx.fillRect(26, 14, 6, 2);
        // Coconuts
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(18, 17, 3, 0, Math.PI * 2);
        ctx.arc(23, 18, 3, 0, Math.PI * 2);
        ctx.fill();
      })
    );
  }

  if (!textures.exists('obj_rock')) {
    textures.addCanvas(
      'obj_rock',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(16, 20, 13, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(14, 18, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(10, 15, 4, 2);
      })
    );
  }

  if (!textures.exists('obj_rock_cavern')) {
    textures.addCanvas(
      'obj_rock_cavern',
      createPixelCanvas(32, 32, (ctx) => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(14, 18, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.fillRect(9, 14, 6, 3);
        ctx.fillRect(18, 18, 4, 3);
      })
    );
  }

  if (!textures.exists('obj_ore_iron')) {
    textures.addCanvas(
      'obj_ore_iron',
      createPixelCanvas(32, 32, (ctx) => {
        // Base rock
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(14, 18, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iron Veins (glistening silver & ice blue)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(8, 14, 5, 4);
        ctx.fillRect(17, 13, 6, 4);
        ctx.fillRect(13, 20, 5, 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(9, 15, 3, 2);
        ctx.fillRect(19, 14, 3, 2);
        ctx.fillRect(14, 21, 2, 1);
      })
    );
  }

  if (!textures.exists('obj_ore_gold')) {
    textures.addCanvas(
      'obj_ore_gold',
      createPixelCanvas(32, 32, (ctx) => {
        // Base rock
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(14, 18, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Golden Ore veins (sparkling amber & radiant gold)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(8, 14, 6, 5);
        ctx.fillRect(17, 13, 7, 5);
        ctx.fillRect(12, 21, 6, 4);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(9, 15, 4, 3);
        ctx.fillRect(18, 14, 4, 3);
        ctx.fillRect(13, 22, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 15, 1, 1);
        ctx.fillRect(19, 14, 1, 1);
      })
    );
  }

  if (!textures.exists('obj_crystal_amethyst')) {
    textures.addCanvas(
      'obj_crystal_amethyst',
      createPixelCanvas(32, 32, (ctx) => {
        // Rock pedestal
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(16, 24, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Crystal spire 1 (center)
        ctx.fillStyle = '#6b21a8';
        ctx.beginPath();
        ctx.moveTo(11, 24);
        ctx.lineTo(16, 6);
        ctx.lineTo(21, 24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(13, 24);
        ctx.lineTo(16, 8);
        ctx.lineTo(19, 24);
        ctx.closePath();
        ctx.fill();
        // Crystal spire 2 (left)
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(6, 24);
        ctx.lineTo(10, 12);
        ctx.lineTo(15, 24);
        ctx.closePath();
        ctx.fill();
        // Crystal spire 3 (right)
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(17, 24);
        ctx.lineTo(23, 14);
        ctx.lineTo(27, 24);
        ctx.closePath();
        ctx.fill();
        // Shimmer highlights
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(15, 9, 2, 5);
        ctx.fillRect(10, 14, 2, 4);
      })
    );
  }

  if (!textures.exists('obj_lantern_post')) {
    textures.addCanvas(
      'obj_lantern_post',
      createPixelCanvas(24, 48, (ctx) => {
        // Post
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 14, 4, 32);
        // Crossbar
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 12, 12, 3);
        // Lantern housing
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(5, 15, 8, 9);
        // Glowing amber glass
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(6, 17, 6, 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(8, 19, 2, 2);
      })
    );
  }

  if (!textures.exists('obj_shipping_bin')) {
    textures.addCanvas(
      'obj_shipping_bin',
      createPixelCanvas(32, 32, (ctx) => {
        // Wooden chest body
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 6, 28, 24);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(4, 8, 24, 20);
        // Metal hinges & lock
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 14, 28, 3);
        ctx.fillRect(14, 13, 4, 6);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(15, 15, 2, 2);
      })
    );
  }

  if (!textures.exists('obj_house')) {
    textures.addCanvas(
      'obj_house',
      createPixelCanvas(96, 80, (ctx) => {
        // Walls
        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(12, 32, 72, 46);
        ctx.fillStyle = '#eedcc3';
        ctx.fillRect(12, 74, 72, 4);
        // Roof
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(4, 32);
        ctx.lineTo(48, 6);
        ctx.lineTo(92, 32);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(8, 30);
        ctx.lineTo(48, 10);
        ctx.lineTo(88, 30);
        ctx.closePath();
        ctx.fill();
        // Chimney
        ctx.fillStyle = '#78350f';
        ctx.fillRect(66, 10, 10, 16);
        // Smoke puff
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(71, 6, 4, 0, Math.PI * 2);
        ctx.fill();
        // Door
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(40, 52, 16, 26);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(52, 64, 2, 2); // knob
        // Windows
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(20, 46, 12, 12);
        ctx.fillRect(64, 46, 12, 12);
        ctx.fillStyle = '#64748b';
        ctx.strokeRect(20, 46, 12, 12);
        ctx.strokeRect(64, 46, 12, 12);
      })
    );
  }

  if (!textures.exists('obj_shop')) {
    textures.addCanvas(
      'obj_shop',
      createPixelCanvas(96, 80, (ctx) => {
        // Walls
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(10, 30, 76, 48);
        // Striped awning
        const colors = ['#ef4444', '#ffffff', '#ef4444', '#ffffff', '#ef4444', '#ffffff', '#ef4444', '#ffffff'];
        colors.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(8 + idx * 10, 24, 10, 12);
        });
        // Signboard
        ctx.fillStyle = '#78350f';
        ctx.fillRect(30, 8, 36, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(32, 10, 32, 10);
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('STORE', 34, 18);
        // Door & display window
        ctx.fillStyle = '#92400e';
        ctx.fillRect(40, 50, 16, 28);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(18, 44, 16, 16);
        ctx.fillRect(62, 44, 16, 16);
      })
    );
  }

  // --- 3. PLAYER SPRITESHEET (16x24 per frame, 4 directions x 4 walk frames) ---
  if (!textures.exists('player_sheet')) {
    const pCanvas = createPixelCanvas(64, 96, (ctx) => {
      // Rows: 0=Down, 1=Left, 2=Right, 3=Up
      const directions = ['down', 'left', 'right', 'up'];
      directions.forEach((dir, row) => {
        for (let frame = 0; frame < 4; frame++) {
          const ox = frame * 16;
          const oy = row * 24;
          const legOffset = frame === 1 ? -2 : frame === 3 ? 2 : 0;

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(ox + 8, oy + 22, 6, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Legs / Shoes
          ctx.fillStyle = '#1e3a8a'; // denim blue
          ctx.fillRect(ox + 5, oy + 15, 2, 6 + (frame === 1 ? legOffset : 0));
          ctx.fillRect(ox + 9, oy + 15, 2, 6 + (frame === 3 ? -legOffset : 0));
          ctx.fillStyle = '#78350f'; // boots
          ctx.fillRect(ox + 5, oy + 20, 2, 2);
          ctx.fillRect(ox + 9, oy + 20, 2, 2);

          // Torso / Shirt
          ctx.fillStyle = '#10b981'; // cozy green sweater
          ctx.fillRect(ox + 4, oy + 10, 8, 6);

          // Head / Face
          ctx.fillStyle = '#fcd34d'; // peach skin tone
          ctx.fillRect(ox + 4, oy + 4, 8, 7);

          // Eyes (based on direction)
          ctx.fillStyle = '#1e293b';
          if (dir === 'down') {
            ctx.fillRect(ox + 5, oy + 7, 2, 2);
            ctx.fillRect(ox + 9, oy + 7, 2, 2);
          } else if (dir === 'left') {
            ctx.fillRect(ox + 4, oy + 7, 2, 2);
          } else if (dir === 'right') {
            ctx.fillRect(ox + 10, oy + 7, 2, 2);
          } // Up has back of head

          // Hair (cozy tousled brown)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(ox + 3, oy + 2, 10, 4);
          if (dir === 'down') {
            ctx.fillRect(ox + 3, oy + 3, 2, 4);
            ctx.fillRect(ox + 11, oy + 3, 2, 4);
          } else if (dir === 'up') {
            ctx.fillRect(ox + 3, oy + 2, 10, 7);
          }
        }
      });
    });

    textures.addCanvas('player_raw', pCanvas);
    const playerSource = textures.get('player_raw').getSourceImage() as HTMLImageElement;
    textures.addSpriteSheet('player_sheet', playerSource, {
      frameWidth: 16,
      frameHeight: 24,
    });
  }

  // --- 4. NPC SPRITESHEETS (7 Villagers) ---
  const npcs = [
    { key: 'npc_milo', shirt: '#4d7c0f', hair: '#78350f', skin: '#fcd34d' },
    { key: 'npc_luna', shirt: '#c084fc', hair: '#6b21a8', skin: '#fed7aa' },
    { key: 'npc_oliver', shirt: '#38bdf8', hair: '#334155', skin: '#fde047' },
    { key: 'npc_poppy', shirt: '#fb7185', hair: '#f59e0b', skin: '#ffedd5' },
    { key: 'npc_theo', shirt: '#34d399', hair: '#1e293b', skin: '#fcd34d' },
    { key: 'npc_maple', shirt: '#f43f5e', hair: '#881337', skin: '#fed7aa' },
    { key: 'npc_nori', shirt: '#818cf8', hair: '#312e81', skin: '#fef08a' },
  ];

  npcs.forEach((npc) => {
    if (!textures.exists(npc.key)) {
      const npcCanvas = createPixelCanvas(64, 96, (ctx) => {
        ['down', 'left', 'right', 'up'].forEach((dir, row) => {
          for (let frame = 0; frame < 4; frame++) {
            const ox = frame * 16;
            const oy = row * 24;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(ox + 8, oy + 22, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Legs
            ctx.fillStyle = '#475569';
            ctx.fillRect(ox + 5, oy + 16, 2, 5);
            ctx.fillRect(ox + 9, oy + 16, 2, 5);

            // Shirt
            ctx.fillStyle = npc.shirt;
            ctx.fillRect(ox + 4, oy + 10, 8, 6);

            // Face
            ctx.fillStyle = npc.skin;
            ctx.fillRect(ox + 4, oy + 4, 8, 7);

            // Eyes
            ctx.fillStyle = '#0f172a';
            if (dir === 'down') {
              ctx.fillRect(ox + 5, oy + 7, 2, 2);
              ctx.fillRect(ox + 9, oy + 7, 2, 2);
            } else if (dir === 'left') {
              ctx.fillRect(ox + 4, oy + 7, 2, 2);
            } else if (dir === 'right') {
              ctx.fillRect(ox + 10, oy + 7, 2, 2);
            }

            // Hair
            ctx.fillStyle = npc.hair;
            ctx.fillRect(ox + 3, oy + 2, 10, 4);
            if (dir === 'up') ctx.fillRect(ox + 3, oy + 3, 10, 7);
          }
        });
      });
      const rawKey = `${npc.key}_raw`;
      textures.addCanvas(rawKey, npcCanvas);
      const npcSource = textures.get(rawKey).getSourceImage() as HTMLImageElement;
      textures.addSpriteSheet(npc.key, npcSource, {
        frameWidth: 16,
        frameHeight: 24,
      });
    }
  });

  // --- ANIMAL SPRITES (Chickens & Cows) ---
  if (!textures.exists('animal_chicken')) {
    textures.addCanvas(
      'animal_chicken',
      createPixelCanvas(20, 20, (ctx) => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(10, 18, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Feet
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, 16, 1, 3);
        ctx.fillRect(11, 16, 1, 3);
        // Body (fluffy white)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10, 11, 6, 0, Math.PI * 2);
        ctx.fill();
        // Wing
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(7, 10, 4, 4);
        // Comb
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(9, 3, 3, 3);
        // Beak
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(14, 9, 3, 2);
        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 8, 2, 2);
        // Wattle
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(13, 11, 2, 2);
      })
    );
  }

  if (!textures.exists('animal_cow')) {
    textures.addCanvas(
      'animal_cow',
      createPixelCanvas(32, 28, (ctx) => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(16, 25, 12, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(7, 18, 3, 8);
        ctx.fillRect(12, 18, 3, 8);
        ctx.fillRect(20, 18, 3, 8);
        ctx.fillRect(25, 18, 3, 8);
        // Body (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 8, 22, 13);
        // Black spots
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(9, 10, 5, 5);
        ctx.fillRect(18, 12, 6, 6);
        ctx.fillRect(21, 9, 4, 3);
        // Head
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(22, 6, 8, 9);
        // Black ear
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(22, 4, 3, 3);
        // Horns
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(26, 3, 2, 3);
        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(27, 8, 2, 2);
        // Snout
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(28, 10, 4, 5);
        ctx.fillStyle = '#be185d';
        ctx.fillRect(30, 12, 1, 1);
        // Tail
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 11, 2, 6);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, 16, 3, 3);
      })
    );
  }

  // --- 5. CROPS GROWTH STAGES (4 stages per crop, 16x16) ---
  const crops = [
    { key: 'turnip', color: '#e2e8f0', leaf: '#22c55e' },
    { key: 'carrot', color: '#f97316', leaf: '#16a34a' },
    { key: 'potato', color: '#ca8a04', leaf: '#4ade80' },
    { key: 'tomato', color: '#ef4444', leaf: '#15803d' },
    { key: 'strawberry', color: '#ec4899', leaf: '#22c55e' },
    { key: 'pumpkin', color: '#ea580c', leaf: '#166534' },
    { key: 'sunflower', color: '#eab308', leaf: '#84cc16' },
    { key: 'bluerose', color: '#3b82f6', leaf: '#059669' },
  ];

  crops.forEach((crop) => {
    for (let stage = 0; stage < 4; stage++) {
      const texKey = `crop_${crop.key}_stage_${stage}`;
      if (!textures.exists(texKey)) {
        textures.addCanvas(
          texKey,
          createPixelCanvas(16, 16, (ctx) => {
            if (stage === 0) {
              // Seed mound
              ctx.fillStyle = '#78350f';
              ctx.fillRect(6, 12, 4, 2);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(7, 11, 2, 1);
            } else if (stage === 1) {
              // Sprout
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(7, 10, 2, 4);
              ctx.fillRect(5, 8, 3, 2);
              ctx.fillRect(8, 8, 3, 2);
            } else if (stage === 2) {
              // Growing bush
              ctx.fillStyle = crop.leaf;
              ctx.fillRect(5, 7, 6, 7);
              ctx.fillRect(4, 9, 8, 4);
              ctx.fillStyle = '#86efac';
              ctx.fillRect(6, 6, 4, 2);
            } else {
              // Mature harvestable
              ctx.fillStyle = crop.leaf;
              ctx.fillRect(4, 6, 8, 8);
              // Prize vegetable/flower
              ctx.fillStyle = crop.color;
              ctx.fillRect(6, 8, 4, 4);
              ctx.fillRect(5, 9, 6, 2);
            }
          })
        );
      }
    }
  });

  // --- 6. ITEM & TOOL ICONS (24x24) ---
  const iconDefs: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
    item_hoe: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 18, 14, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(16, 6, 4, 12);
      ctx.fillRect(12, 6, 6, 3);
    },
    item_can: (ctx) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, 10, 12, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, 12, 7, 3);
      ctx.fillRect(20, 10, 2, 6);
      ctx.fillStyle = '#94a3b8';
      ctx.strokeRect(6, 6, 8, 5);
    },
    item_axe: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 18, 12, 3);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(16, 8, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    item_pickaxe: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 18, 14, 3);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(14, 4, 7, 4);
      ctx.fillRect(18, 8, 3, 6);
    },
    item_rod: (ctx) => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(2, 20, 18, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(18, 8, 3, 3); // bobber
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 11, 3, 2);
    },
    item_net: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 18, 12, 2);
      ctx.fillStyle = '#94a3b8';
      ctx.strokeRect(14, 6, 7, 7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(15, 7, 5, 5);
    },
    item_wood: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 8, 16, 8);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 10, 12, 4);
    },
    item_stone: (ctx) => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(5, 8, 14, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8, 10, 8, 4);
    },
    item_iron: (ctx) => {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 7, 12, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(8, 9, 6, 4);
    },
    item_gold: (ctx) => {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(6, 7, 12, 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(8, 9, 6, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 10, 2, 2);
    },
    item_amethyst: (ctx) => {
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(19, 14);
      ctx.lineTo(12, 21);
      ctx.lineTo(5, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(12, 6);
      ctx.lineTo(17, 14);
      ctx.lineTo(12, 19);
      ctx.lineTo(7, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 8, 2, 3);
    },
    item_clay: (ctx) => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 9, 12, 8);
    },
    item_wildberry: (ctx) => {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(10, 12, 5, 0, Math.PI * 2);
      ctx.arc(14, 13, 5, 0, Math.PI * 2);
      ctx.fill();
    },
    item_mushroom: (ctx) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, 11, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(10, 11, 4, 6);
    },
    item_seashell: (ctx) => {
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    item_fish_bluecarp: (ctx) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, 9, 14, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(16, 8, 4, 8);
    },
    item_fish_sunbass: (ctx) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(4, 9, 14, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(16, 8, 4, 8);
    },
    item_fish_salmon: (ctx) => {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(4, 9, 14, 6);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(16, 8, 4, 8);
    },
    item_fish_trout: (ctx) => {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(4, 9, 14, 6);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(16, 8, 4, 8);
    },
    item_bug_butterfly: (ctx) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, 6, 6, 8);
      ctx.fillRect(14, 6, 6, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, 6, 2, 10);
    },
    item_bug_ladybug: (ctx) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(9, 10, 2, 2);
      ctx.fillRect(13, 13, 2, 2);
    },
    item_bug_dragonfly: (ctx) => {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(11, 4, 2, 14);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(4, 8, 16, 2);
    },
    item_bug_firefly: (ctx) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(9, 9, 6, 6);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    },
    item_pie: (ctx) => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, 11, 16, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(5, 8, 14, 4);
    },
    item_salad: (ctx) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(5, 12, 14, 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(6, 8, 12, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, 9, 3, 3);
    },
    item_egg: (ctx) => {
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.ellipse(12, 12, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 8, 2, 3);
    },
    item_milk: (ctx) => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(8, 8, 8, 12);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(8, 12, 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 10, 6, 9);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, 5, 4, 3);
    },
    item_omelet: (ctx) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(12, 11, 7, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(9, 13, 2, 1);
      ctx.fillRect(14, 14, 2, 1);
      ctx.fillRect(11, 16, 2, 1);
    },
    item_pancake: (ctx) => {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(5, 15, 14, 4);
      ctx.fillRect(6, 11, 12, 4);
      ctx.fillRect(7, 7, 10, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(10, 5, 4, 3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(13, 8, 2, 6);
    },
    item_soup: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(12, 14, 8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(6, 11, 12, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(8, 12, 2, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(13, 12, 2, 2);
    },
    item_furn_chair: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 4, 12, 4);
      ctx.fillRect(6, 8, 3, 6);
      ctx.fillRect(15, 8, 3, 6);
      ctx.fillRect(6, 12, 12, 3);
      ctx.fillRect(6, 15, 2, 6);
      ctx.fillRect(16, 15, 2, 6);
    },
    item_furn_table: (ctx) => {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(3, 7, 18, 5);
      ctx.fillRect(5, 12, 3, 9);
      ctx.fillRect(16, 12, 3, 9);
    },
    item_furn_bed: (ctx) => {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(4, 6, 16, 14);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(6, 8, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 8, 5, 4);
    },
    item_furn_bookshelf: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 4, 16, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, 7, 3, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, 7, 3, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(14, 7, 3, 5);
    },
    item_furn_pot: (ctx) => {
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(7, 12, 10, 8);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(8, 6, 8, 6);
    },
    item_furn_lamp: (ctx) => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(11, 8, 2, 12);
      ctx.fillRect(8, 19, 8, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(12, 7, 5, 0, Math.PI * 2);
      ctx.fill();
    },
    item_furn_sprinkler: (ctx) => {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(9, 13, 6, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, 9, 10, 4);
    },
    item_furn_campfire: (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, 16, 14, 3);
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(12, 12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(11, 10, 2, 4);
    },
  };

  // Seed icons and Crop icons
  crops.forEach((crop) => {
    iconDefs[`item_seed_${crop.key}`] = (ctx) => {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(6, 6, 12, 12);
      ctx.fillStyle = crop.color;
      ctx.fillRect(9, 10, 6, 5);
    };
    iconDefs[`item_crop_${crop.key}`] = (ctx) => {
      ctx.fillStyle = crop.leaf;
      ctx.fillRect(10, 4, 4, 4);
      ctx.fillStyle = crop.color;
      ctx.beginPath();
      ctx.arc(12, 13, 6, 0, Math.PI * 2);
      ctx.fill();
    };
  });

  Object.entries(iconDefs).forEach(([key, drawer]) => {
    if (!textures.exists(key)) {
      textures.addCanvas(key, createPixelCanvas(24, 24, drawer));
    }
  });
}
