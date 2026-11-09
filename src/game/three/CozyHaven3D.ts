import * as THREE from 'three';
import { gameState } from '../../domain/GameState';
import { EventBus } from '../../domain/EventBus';
import { sound } from '../../domain/SoundSynth';
import { GameViewMode, MapId } from '../../types/game';
import { NPCS_DATABASE } from '../../types/npcs';
import { CROPS_DATABASE } from '../../types/crops';
import { ITEMS_DATABASE } from '../../types/items';

// 1 3D Unit = 16 2D Pixels (800x600 2D map = 50x37.5 3D units)
const SCALE = 1 / 16;

export class CozyHaven3D {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private viewMode: GameViewMode = '3d-iso';

  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private clock: THREE.Clock = new THREE.Clock();

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.HemisphereLight;

  // Scene Groups
  private terrainGroup: THREE.Group = new THREE.Group();
  private structuresGroup: THREE.Group = new THREE.Group();
  private cropsGroup: THREE.Group = new THREE.Group();
  private npcsGroup: THREE.Group = new THREE.Group();
  private weatherGroup: THREE.Group = new THREE.Group();
  private windmillSails: THREE.Mesh | null = null;

  // Player 3D Mesh & state
  private playerMesh: THREE.Group = new THREE.Group();
  private playerTargetPos: THREE.Vector3 = new THREE.Vector3();
  private playerFacing: number = 0; // rotation angle around Y
  private isPlayerWalking: boolean = false;
  private walkTime: number = 0;

  // 3D NPCs tracking
  private npcMeshes: Map<string, THREE.Group> = new Map();

  // Particle systems
  private rainParticles: THREE.Points | null = null;

  // Key state for 3D movement
  private keys: Record<string, boolean> = {};
  private unsubListeners: (() => void)[] = [];

  constructor(container: HTMLElement, initialMode: GameViewMode = '3d-iso') {
    this.container = container;
    this.viewMode = initialMode;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#bae6fd');
    this.scene.fog = new THREE.FogExp2('#bae6fd', 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.updateCameraTransform();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.ambientLight = new THREE.HemisphereLight('#fef3c7', '#4d7c0f', 0.8);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight('#ffffff', 1.2);
    this.dirLight.position.set(30, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -35;
    this.dirLight.shadow.camera.right = 35;
    this.dirLight.shadow.camera.top = 35;
    this.dirLight.shadow.camera.bottom = -35;
    this.scene.add(this.dirLight);

    // 5. Add Groups
    this.scene.add(this.terrainGroup);
    this.scene.add(this.structuresGroup);
    this.scene.add(this.cropsGroup);
    this.scene.add(this.npcsGroup);
    this.scene.add(this.weatherGroup);

    // 6. Build Initial World & Player
    this.buildPlayer();
    this.buildCurrentZone();
    this.updateLightingAndSky();

    // 7. Input listeners
    this.setupInputs();

    // 8. EventBus sync
    this.setupEvents();

    // 9. Resize observer
    window.addEventListener('resize', this.onWindowResize);

    // 10. Start loop
    this.animate();
  }

  public setViewMode(mode: GameViewMode) {
    this.viewMode = mode;
    this.updateCameraTransform();
  }

  public getViewMode(): GameViewMode {
    return this.viewMode;
  }

  private updateCameraTransform() {
    const px = this.playerMesh.position.x;
    const pz = this.playerMesh.position.z;

    if (this.viewMode === '3d-topdown') {
      // Orthographic-style top-down view
      this.camera.fov = 40;
      this.camera.position.set(px, 38, pz + 0.1);
      this.camera.lookAt(px, 0, pz);
    } else {
      // 3D Isometric View
      this.camera.fov = 42;
      this.camera.position.set(px + 24, 26, pz + 24);
      this.camera.lookAt(px, 1.2, pz);
    }
    this.camera.updateProjectionMatrix();
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private setupInputs() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      // Space or E for action
      if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        this.performPlayerAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    this.unsubListeners.push(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    });
  }

  private setupEvents() {
    this.unsubListeners.push(
      EventBus.on('TIME_TICK', () => {
        this.updateLightingAndSky();
        this.syncNPCLocations();
      }),
      EventBus.on('WEATHER_CHANGED', () => {
        this.updateWeather();
      }),
      EventBus.on('SOIL_ACTION', () => {
        this.rebuildFarmland();
      }),
      EventBus.on('CROPS_UPDATED', () => {
        this.rebuildCrops();
      })
    );
  }

  // --- PLAYER 3D MODEL ---
  private buildPlayer() {
    this.playerMesh = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshLambertMaterial({
      color: gameState.data.player.customization.shirtColor || '#38bdf8',
    });
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.0, 0.5);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    this.playerMesh.add(body);

    // Head
    const headMat = new THREE.MeshLambertMaterial({
      color: gameState.data.player.customization.skinColor || '#fed7aa',
    });
    const headGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    this.playerMesh.add(head);

    // Hair
    const hairMat = new THREE.MeshLambertMaterial({
      color: gameState.data.player.customization.hairColor || '#78350f',
    });
    const hairGeo = new THREE.BoxGeometry(0.76, 0.35, 0.76);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.15;
    hair.castShadow = true;
    this.playerMesh.add(hair);

    // Legs
    const pantsMat = new THREE.MeshLambertMaterial({
      color: gameState.data.player.customization.pantsColor || '#1e3a8a',
    });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.35), pantsMat);
    leftLeg.position.set(-0.2, 0.3, 0);
    leftLeg.castShadow = true;
    this.playerMesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.35), pantsMat);
    rightLeg.position.set(0.2, 0.3, 0);
    rightLeg.castShadow = true;
    this.playerMesh.add(rightLeg);

    // Initial position from gameState
    const startX = (gameState.data.player.x || 320) * SCALE;
    const startZ = (gameState.data.player.y || 240) * SCALE;
    this.playerMesh.position.set(startX, 0, startZ);
    this.playerTargetPos.copy(this.playerMesh.position);

    this.scene.add(this.playerMesh);
  }

  // --- ZONE BUILDING ---
  public buildCurrentZone() {
    // Clear previous models
    this.clearGroup(this.terrainGroup);
    this.clearGroup(this.structuresGroup);
    this.clearGroup(this.cropsGroup);
    this.clearGroup(this.npcsGroup);
    this.npcMeshes.clear();
    this.windmillSails = null;

    const mapId = gameState.data.player.activeMap;
    const worldWidth = 50; // 800px * SCALE
    const worldDepth = 38; // 600px * SCALE

    switch (mapId) {
      case 'village':
        this.buildVillage3D(worldWidth, worldDepth);
        break;
      case 'beach':
        this.buildBeach3D(worldWidth, worldDepth);
        break;
      case 'forest':
        this.buildForest3D(worldWidth, worldDepth);
        break;
      case 'mine':
        this.buildMine3D(worldWidth, worldDepth);
        break;
      case 'summit':
        this.buildSummit3D(worldWidth, worldDepth);
        break;
      case 'desert':
        this.buildDesert3D(worldWidth, worldDepth);
        break;
      case 'orchard':
        this.buildOrchard3D(worldWidth, worldDepth);
        break;
      case 'farm':
      default:
        this.buildFarm3D(worldWidth, worldDepth);
        break;
    }

    this.spawnZoneNPCs();
    this.updateWeather();
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
  }

  // --- 1. FARM 3D ---
  private buildFarm3D(width: number, depth: number) {
    // Lush green ground
    const groundGeo = new THREE.PlaneGeometry(width, depth);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#5fb669' });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Farmhouse at (140, 110) => (8.75, 6.875)
    this.createHouse3D(8.75, 6.875, '#b91c1c', '#fdfbf7');

    // Shipping Bin at (220, 130) => (13.75, 8.12)
    this.createShippingBin3D(13.75, 8.12);

    // Animal Pasture Fencing at (28, 14) to (44, 26)
    this.createPastureFence3D(28, 14, 16, 12);

    // Animals
    this.createAnimal3D(32, 18, 'cow');
    this.createAnimal3D(38, 20, 'chicken');
    this.createAnimal3D(35, 23, 'chicken');

    // Rebuild tilled soil & crops
    this.rebuildFarmland();
    this.rebuildCrops();

    // Surrounding Trees
    this.createPineTree3D(4, 18);
    this.createPineTree3D(6, 26);
    this.createPineTree3D(18, 32);
    this.createPineTree3D(46, 6);
  }

  // --- 2. VILLAGE 3D ---
  private buildVillage3D(width: number, depth: number) {
    // Base grass
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#5fb669' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Cobblestone Plaza & Crossroad
    const plaza = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 12),
      new THREE.MeshLambertMaterial({ color: '#cbd5e1' })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(24, 0.02, 20);
    plaza.receiveShadow = true;
    this.terrainGroup.add(plaza);

    // General Store Building (Maple) at (420, 200) => (26.25, 12.5)
    this.createShop3D(26.25, 12.5);

    // Village Centerpiece Fountain
    this.createFountain3D(24, 20);

    // Lampposts
    this.createLanternPost3D(18, 16);
    this.createLanternPost3D(30, 16);
    this.createLanternPost3D(18, 24);
    this.createLanternPost3D(30, 24);

    // Village Trees & Flowerbeds
    this.createOakTree3D(10, 8);
    this.createOakTree3D(38, 8);
    this.createOakTree3D(12, 30);
    this.createOakTree3D(40, 28);
  }

  // --- 3. BEACH 3D ---
  private buildBeach3D(width: number, depth: number) {
    // Sandy Coastline
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#fde68a' })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(width / 2, 0, depth / 2);
    sand.receiveShadow = true;
    this.terrainGroup.add(sand);

    // Ocean on South & East (Animated translucent blue water)
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 20, 16),
      new THREE.MeshLambertMaterial({
        color: '#0284c7',
        transparent: true,
        opacity: 0.85,
      })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(width / 2, 0.05, depth - 4);
    this.terrainGroup.add(ocean);

    // Wooden Fishing Pier at (20 to 35, 20 to 22)
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 3),
      new THREE.MeshLambertMaterial({ color: '#b45309' })
    );
    pier.position.set(27, 0.2, 21);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.structuresGroup.add(pier);

    // Palm trees
    this.createPalmTree3D(8, 10);
    this.createPalmTree3D(15, 8);
    this.createPalmTree3D(38, 9);
    this.createPalmTree3D(42, 16);
    this.createPalmTree3D(12, 24);

    // Boulders
    this.createBoulder3D(11, 29);
    this.createBoulder3D(39, 28);
  }

  // --- 4. FOREST 3D ---
  private buildForest3D(width: number, depth: number) {
    // Deep mossy forest grass
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#3f6212' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Hot Springs Pool at (28 to 38, 14 to 22)
    const spring = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.2, 8),
      new THREE.MeshLambertMaterial({ color: '#38bdf8' })
    );
    spring.position.set(33, 0.1, 18);
    this.terrainGroup.add(spring);

    // Torii Gate archway at (33, 13)
    this.createToriiGate3D(33, 13);

    // Cavern Entrance Arch at (8.75, 4.4)
    this.createCaveArch3D(8.75, 4.4);

    // Whispering Pines
    for (let i = 0; i < 18; i++) {
      const px = 4 + (i * 7) % 42;
      const pz = 6 + ((i * 11) % 26);
      if (Math.abs(px - 33) > 7 || Math.abs(pz - 18) > 6) {
        this.createPineTree3D(px, pz);
      }
    }
  }

  // --- 5. MINE 3D ---
  private buildMine3D(width: number, depth: number) {
    // Slate Cavern Floor
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Cavern Perimeter Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(width, 6, 2), wallMat);
    wallN.position.set(width / 2, 3, 1);
    this.structuresGroup.add(wallN);

    // Ember's Blacksmith Forge & Anvil at (17.5, 12.5)
    this.createBlacksmithForge3D(17.5, 12.5);

    // Glowing Amethyst Crystals
    this.createCrystalCluster3D(16, 25, '#c084fc');
    this.createCrystalCluster3D(34, 25, '#a855f7');
    this.createCrystalCluster3D(25, 20, '#e879f9');

    // Ore rocks
    this.createOreRock3D(11, 10, '#94a3b8'); // iron
    this.createOreRock3D(39, 10, '#94a3b8');
    this.createOreRock3D(9, 20, '#fbbf24'); // gold
    this.createOreRock3D(41, 20, '#fbbf24');
  }

  // --- 6. SUMMIT 3D ---
  private buildSummit3D(width: number, depth: number) {
    // Alpine slate rock base
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#64748b' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Snow patches on ridges
    const snowGeo = new THREE.BoxGeometry(8, 0.1, 6);
    const snowMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    const snow1 = new THREE.Mesh(snowGeo, snowMat);
    snow1.position.set(10, 0.05, 8);
    this.terrainGroup.add(snow1);

    const snow2 = new THREE.Mesh(snowGeo, snowMat);
    snow2.position.set(40, 0.05, 10);
    this.terrainGroup.add(snow2);

    // Starlit Observatory Landmark at (25, 11)
    this.createObservatory3D(25, 11);

    // Wind Shrine at (38, 16)
    this.createWindShrine3D(38, 16);

    // Alpine pine trees
    this.createPineTree3D(8, 12);
    this.createPineTree3D(12, 22);
    this.createPineTree3D(42, 22);
    this.createPineTree3D(44, 12);
  }

  // --- 7. DESERT 3D ---
  private buildDesert3D(width: number, depth: number) {
    // Warm golden sand dunes
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#f59e0b' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Center Oasis pool at (25, 20)
    const oasis = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 5.5, 0.2, 16),
      new THREE.MeshLambertMaterial({ color: '#38bdf8' })
    );
    oasis.position.set(25, 0.1, 20);
    this.terrainGroup.add(oasis);

    // Sun Stone Obelisk Monument at (25, 11)
    this.createObelisk3D(25, 11);

    // Palm trees around oasis
    this.createPalmTree3D(18, 16);
    this.createPalmTree3D(32, 16);
    this.createPalmTree3D(18, 24);
    this.createPalmTree3D(32, 24);

    // Saguaro Cacti
    this.createCactus3D(10, 18);
    this.createCactus3D(14, 28);
    this.createCactus3D(38, 20);
    this.createCactus3D(42, 29);
  }

  // --- 8. ORCHARD 3D ---
  private buildOrchard3D(width: number, depth: number) {
    // Clover meadow
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: '#4ade80' })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(width / 2, 0, depth / 2);
    ground.receiveShadow = true;
    this.terrainGroup.add(ground);

    // Timber walkways
    const walk1 = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 2),
      new THREE.MeshLambertMaterial({ color: '#d4a373' })
    );
    walk1.rotation.x = -Math.PI / 2;
    walk1.position.set(25, 0.02, 16);
    this.terrainGroup.add(walk1);

    const walk2 = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 24),
      new THREE.MeshLambertMaterial({ color: '#d4a373' })
    );
    walk2.rotation.x = -Math.PI / 2;
    walk2.position.set(25, 0.02, 18);
    this.terrainGroup.add(walk2);

    // Whispering Windmill Landmark at (26, 10)
    this.createWindmill3D(26, 10);

    // Cedar Beehives in a row
    this.createBeehive3D(16, 21);
    this.createBeehive3D(20, 21);
    this.createBeehive3D(30, 21);
    this.createBeehive3D(34, 21);

    // Fruit Tree Groves (Apples on left, Peaches on right)
    this.createFruitTree3D(10, 10, '#ef4444');
    this.createFruitTree3D(15, 10, '#ef4444');
    this.createFruitTree3D(10, 22, '#ef4444');
    this.createFruitTree3D(12, 30, '#ef4444');

    this.createFruitTree3D(36, 10, '#fb7185');
    this.createFruitTree3D(41, 10, '#fb7185');
    this.createFruitTree3D(40, 22, '#fb7185');
    this.createFruitTree3D(38, 30, '#fb7185');
  }

  // --- FARMLAND & CROPS SYNC ---
  private rebuildFarmland() {
    // Only farm zone displays tilled soil
    if (gameState.data.player.activeMap !== 'farm') return;

    Object.entries(gameState.data.farmTiles).forEach(([key, tile]) => {
      const [tx, ty] = key.split(',').map(Number);
      const worldX = tx * 2;
      const worldZ = ty * 2;

      const soil = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 1.9),
        new THREE.MeshLambertMaterial({
          color: tile.watered ? '#451a03' : '#78350f',
        })
      );
      soil.rotation.x = -Math.PI / 2;
      soil.position.set(worldX + 1, 0.03, worldZ + 1);
      soil.receiveShadow = true;
      this.terrainGroup.add(soil);
    });
  }

  private rebuildCrops() {
    this.clearGroup(this.cropsGroup);
    if (gameState.data.player.activeMap !== 'farm') return;

    gameState.data.crops.forEach((crop) => {
      const def = CROPS_DATABASE[crop.cropId];
      if (!def) return;

      const worldX = crop.tileX * 2 + 1;
      const worldZ = crop.tileY * 2 + 1;

      const cropGroup = new THREE.Group();
      cropGroup.position.set(worldX, 0, worldZ);

      // Growth stage height & scale
      const stage = crop.currentStage; // 0, 1, 2, 3
      const stemHeight = 0.2 + stage * 0.25;

      // Stem / leaves
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, stemHeight, 6),
        new THREE.MeshLambertMaterial({ color: '#22c55e' })
      );
      stem.position.y = stemHeight / 2;
      stem.castShadow = true;
      cropGroup.add(stem);

      // Produce bulb at mature stage (stage >= 2)
      if (stage >= 2) {
        const produce = new THREE.Mesh(
          new THREE.SphereGeometry(0.25 + stage * 0.1, 8, 8),
          new THREE.MeshLambertMaterial({ color: def.color })
        );
        produce.position.y = stemHeight + 0.1;
        produce.castShadow = true;
        cropGroup.add(produce);
      }

      this.cropsGroup.add(cropGroup);
    });
  }

  // --- NPCS IN 3D ---
  private spawnZoneNPCs() {
    const currentMap = gameState.data.player.activeMap;

    Object.values(NPCS_DATABASE).forEach((npcDef) => {
      const state = gameState.data.npcs[npcDef.id];
      if (!state || state.currentMap !== currentMap) return;

      const npcModel = this.createNPCModel(npcDef);
      const nx = state.x * SCALE;
      const nz = state.y * SCALE;
      npcModel.position.set(nx, 0, nz);

      this.npcsGroup.add(npcModel);
      this.npcMeshes.set(npcDef.id, npcModel);
    });
  }

  private createNPCModel(npcDef: any): THREE.Group {
    const group = new THREE.Group();

    // Torso
    const bodyMat = new THREE.MeshLambertMaterial({ color: npcDef.shirtColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Head
    const headMat = new THREE.MeshLambertMaterial({ color: '#fed7aa' });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairMat = new THREE.MeshLambertMaterial({ color: npcDef.hairColor });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.35, 0.76), hairMat);
    hair.position.y = 2.15;
    hair.castShadow = true;
    group.add(hair);

    // Floating Name Pill Tag
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.roundRect(4, 4, 120, 32, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npcDef.name, 64, 26);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 2.8;
    sprite.scale.set(1.5, 0.5, 1);
    group.add(sprite);

    return group;
  }

  private syncNPCLocations() {
    const currentMap = gameState.data.player.activeMap;
    this.npcMeshes.forEach((mesh, id) => {
      const state = gameState.data.npcs[id];
      if (state && state.currentMap === currentMap) {
        mesh.position.x = state.x * SCALE;
        mesh.position.z = state.y * SCALE;
      }
    });
  }

  // --- STRUCTURE BUILDERS ---
  private createHouse3D(x: number, z: number, roofColor: string, wallColor: string) {
    const house = new THREE.Group();
    house.position.set(x, 0, z);

    // Walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 3.2, 3.8),
      new THREE.MeshLambertMaterial({ color: wallColor })
    );
    walls.position.y = 1.6;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Gable Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.6, 2.0, 4),
      new THREE.MeshLambertMaterial({ color: roofColor })
    );
    roof.position.y = 4.0;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Timber Door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.6, 0.1),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    door.position.set(0, 0.8, 1.95);
    house.add(door);

    this.structuresGroup.add(house);
  }

  private createShop3D(x: number, z: number) {
    const shop = new THREE.Group();
    shop.position.set(x, 0, z);

    // Walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 3.5, 4.0),
      new THREE.MeshLambertMaterial({ color: '#fef3c7' })
    );
    walls.position.y = 1.75;
    walls.castShadow = true;
    walls.receiveShadow = true;
    shop.add(walls);

    // Striped Awning
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.3, 1.4),
      new THREE.MeshLambertMaterial({ color: '#ef4444' })
    );
    awning.position.set(0, 2.4, 2.2);
    awning.rotation.x = 0.25;
    shop.add(awning);

    this.structuresGroup.add(shop);
  }

  private createShippingBin3D(x: number, z: number) {
    const bin = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.0, 1.1),
      new THREE.MeshLambertMaterial({ color: '#92400e' })
    );
    bin.position.set(x, 0.5, z);
    bin.castShadow = true;
    this.structuresGroup.add(bin);
  }

  private createPastureFence3D(x: number, z: number, w: number, d: number) {
    const fenceMat = new THREE.MeshLambertMaterial({ color: '#a16207' });
    const hw = w / 2;
    const hd = d / 2;

    const addPost = (px: number, pz: number) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), fenceMat);
      post.position.set(px, 0.6, pz);
      post.castShadow = true;
      this.structuresGroup.add(post);
    };

    for (let i = 0; i <= w; i += 3) {
      addPost(x - hw + i, z - hd);
      addPost(x - hw + i, z + hd);
    }
    for (let j = 0; j <= d; j += 3) {
      addPost(x - hw, z - hd + j);
      addPost(x + hw, z - hd + j);
    }
  }

  private createAnimal3D(x: number, z: number, type: 'cow' | 'chicken') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    if (type === 'cow') {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.1, 0.9),
        new THREE.MeshLambertMaterial({ color: '#f8fafc' })
      );
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.7),
        new THREE.MeshLambertMaterial({ color: '#1e293b' })
      );
      head.position.set(0.9, 1.3, 0);
      group.add(head);
    } else {
      // Chicken
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshLambertMaterial({ color: '#ffffff' })
      );
      body.position.y = 0.45;
      body.castShadow = true;
      group.add(body);

      const comb = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.2, 0.25),
        new THREE.MeshLambertMaterial({ color: '#ef4444' })
      );
      comb.position.set(0, 0.8, 0);
      group.add(comb);
    }

    this.structuresGroup.add(group);
  }

  private createObservatory3D(x: number, z: number) {
    const obs = new THREE.Group();
    obs.position.set(x, 0, z);

    // Stone cylinder
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.0, 3.5, 16),
      new THREE.MeshLambertMaterial({ color: '#475569' })
    );
    base.position.y = 1.75;
    base.castShadow = true;
    obs.add(base);

    // Blue dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: '#0284c7' })
    );
    dome.position.y = 3.5;
    dome.castShadow = true;
    obs.add(dome);

    // Brass telescope pointing up
    const scope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 3.0, 8),
      new THREE.MeshLambertMaterial({ color: '#fbbf24' })
    );
    scope.position.set(0, 5.0, 0.6);
    scope.rotation.x = -0.55;
    obs.add(scope);

    this.structuresGroup.add(obs);
  }

  private createWindShrine3D(x: number, z: number) {
    const shrine = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.5, 2.0),
      new THREE.MeshLambertMaterial({ color: '#94a3b8' })
    );
    shrine.position.set(x, 1.25, z);
    shrine.castShadow = true;
    this.structuresGroup.add(shrine);
  }

  private createObelisk3D(x: number, z: number) {
    const obelisk = new THREE.Group();
    obelisk.position.set(x, 0, z);

    // Pillar
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.3, 5.5, 4),
      new THREE.MeshLambertMaterial({ color: '#f59e0b' })
    );
    pillar.position.y = 2.75;
    pillar.rotation.y = Math.PI / 4;
    pillar.castShadow = true;
    obelisk.add(pillar);

    // Gold pyramidion
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 1.5, 4),
      new THREE.MeshLambertMaterial({ color: '#fde047' })
    );
    tip.position.y = 6.2;
    tip.rotation.y = Math.PI / 4;
    obelisk.add(tip);

    this.structuresGroup.add(obelisk);
  }

  private createWindmill3D(x: number, z: number) {
    const mill = new THREE.Group();
    mill.position.set(x, 0, z);

    // Tower
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 3.2, 6.0, 12),
      new THREE.MeshLambertMaterial({ color: '#78716c' })
    );
    tower.position.y = 3.0;
    tower.castShadow = true;
    mill.add(tower);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.8, 12),
      new THREE.MeshLambertMaterial({ color: '#92400e' })
    );
    roof.position.y = 6.9;
    mill.add(roof);

    // Rotating 4-blade Sails
    const sailsGroup = new THREE.Group();
    sailsGroup.position.set(0, 5.2, 2.3);

    const bladeMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.8, 0.08), bladeMat);
      blade.position.y = 1.8;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (i * Math.PI) / 2;
      bladePivot.add(blade);
      sailsGroup.add(bladePivot);
    }

    mill.add(sailsGroup);
    this.windmillSails = sailsGroup as any;

    this.structuresGroup.add(mill);
  }

  private createBeehive3D(x: number, z: number) {
    const hive = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.3, 1.1),
      new THREE.MeshLambertMaterial({ color: '#d97706' })
    );
    hive.position.set(x, 0.65, z);
    hive.castShadow = true;
    this.structuresGroup.add(hive);
  }

  private createBlacksmithForge3D(x: number, z: number) {
    const forge = new THREE.Group();
    forge.position.set(x, 0, z);

    // Hearth
    const hearth = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 2.0, 2.2),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    hearth.position.y = 1.0;
    hearth.castShadow = true;
    forge.add(hearth);

    // Glowing coals
    const coals = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 1.2),
      new THREE.MeshBasicMaterial({ color: '#ef4444' })
    );
    coals.position.set(0, 1.8, 0);
    forge.add(coals);

    // Anvil
    const anvil = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.9, 0.6),
      new THREE.MeshLambertMaterial({ color: '#475569' })
    );
    anvil.position.set(2.4, 0.45, 0);
    anvil.castShadow = true;
    forge.add(anvil);

    this.structuresGroup.add(forge);
  }

  private createToriiGate3D(x: number, z: number) {
    const torii = new THREE.Group();
    torii.position.set(x, 0, z);

    const woodMat = new THREE.MeshLambertMaterial({ color: '#b91c1c' });
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8), woodMat);
    leftPost.position.set(-1.8, 1.75, 0);
    leftPost.castShadow = true;
    torii.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8), woodMat);
    rightPost.position.set(1.8, 1.75, 0);
    rightPost.castShadow = true;
    torii.add(rightPost);

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.35, 0.35), woodMat);
    crossbeam.position.set(0, 3.3, 0);
    crossbeam.castShadow = true;
    torii.add(crossbeam);

    this.structuresGroup.add(torii);
  }

  private createCaveArch3D(x: number, z: number) {
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 3.0, 2.0),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    arch.position.set(x, 1.5, z);
    arch.castShadow = true;
    this.structuresGroup.add(arch);
  }

  private createFountain3D(x: number, z: number) {
    const f = new THREE.Group();
    f.position.set(x, 0, z);

    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.6, 0.8, 16),
      new THREE.MeshLambertMaterial({ color: '#cbd5e1' })
    );
    basin.position.y = 0.4;
    basin.castShadow = true;
    f.add(basin);

    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 0.2, 16),
      new THREE.MeshLambertMaterial({ color: '#38bdf8' })
    );
    water.position.y = 0.7;
    f.add(water);

    this.structuresGroup.add(f);
  }

  private createLanternPost3D(x: number, z: number) {
    const post = new THREE.Group();
    post.position.set(x, 0, z);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    pole.position.y = 1.2;
    pole.castShadow = true;
    post.add(pole);

    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    lamp.position.y = 2.4;
    post.add(lamp);

    this.structuresGroup.add(post);
  }

  private createPineTree3D(x: number, z: number) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage cones
    const needleMat = new THREE.MeshLambertMaterial({ color: '#166534' });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.8, 6), needleMat);
    c1.position.y = 1.8;
    c1.castShadow = true;
    tree.add(c1);

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.6, 6), needleMat);
    c2.position.y = 2.7;
    c2.castShadow = true;
    tree.add(c2);

    this.structuresGroup.add(tree);
  }

  private createOakTree3D(x: number, z: number) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.3, 1.4, 6),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 8, 8),
      new THREE.MeshLambertMaterial({ color: '#15803d' })
    );
    canopy.position.y = 2.4;
    canopy.castShadow = true;
    tree.add(canopy);

    this.structuresGroup.add(tree);
  }

  private createFruitTree3D(x: number, z: number, fruitColor: string) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.4, 6),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 8, 8),
      new THREE.MeshLambertMaterial({ color: '#22c55e' })
    );
    canopy.position.y = 2.3;
    canopy.castShadow = true;
    tree.add(canopy);

    // Little fruit spheres
    const fMat = new THREE.MeshLambertMaterial({ color: fruitColor });
    for (let i = 0; i < 4; i++) {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), fMat);
      fruit.position.set(
        Math.sin((i * Math.PI) / 2) * 1.1,
        2.1 + (i % 2) * 0.4,
        Math.cos((i * Math.PI) / 2) * 1.1
      );
      tree.add(fruit);
    }

    this.structuresGroup.add(tree);
  }

  private createPalmTree3D(x: number, z: number) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Curved trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.25, 3.5, 6),
      new THREE.MeshLambertMaterial({ color: '#92400e' })
    );
    trunk.position.set(0.2, 1.75, 0);
    trunk.rotation.z = -0.12;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm fronds
    const frondMat = new THREE.MeshLambertMaterial({ color: '#16a34a' });
    for (let i = 0; i < 5; i++) {
      const frond = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.6), frondMat);
      frond.position.set(0.3, 3.4, 0);
      frond.rotation.y = (i * Math.PI * 2) / 5;
      frond.rotation.z = -0.28;
      palm.add(frond);
    }

    this.structuresGroup.add(palm);
  }

  private createCactus3D(x: number, z: number) {
    const cactus = new THREE.Group();
    cactus.position.set(x, 0, z);

    const cMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.6, 8), cMat);
    stem.position.y = 1.3;
    stem.castShadow = true;
    cactus.add(stem);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.25), cMat);
    arm.position.set(0.4, 1.4, 0);
    cactus.add(arm);

    this.structuresGroup.add(cactus);
  }

  private createBoulder3D(x: number, z: number) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8, 0),
      new THREE.MeshLambertMaterial({ color: '#64748b' })
    );
    rock.position.set(x, 0.5, z);
    rock.castShadow = true;
    this.structuresGroup.add(rock);
  }

  private createOreRock3D(x: number, z: number, oreColor: string) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.9, 0),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    rock.position.y = 0.55;
    rock.castShadow = true;
    group.add(rock);

    // Ore speckles
    const ore = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshBasicMaterial({ color: oreColor })
    );
    ore.position.set(0.2, 0.7, 0.2);
    group.add(ore);

    this.structuresGroup.add(group);
  }

  private createCrystalCluster3D(x: number, z: number, col: string) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);

    const cMat = new THREE.MeshLambertMaterial({ color: col });
    for (let i = 0; i < 3; i++) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.4 + i * 0.3, 5), cMat);
      spire.position.set((i - 1) * 0.4, 0.8, 0);
      spire.rotation.z = (i - 1) * 0.2;
      spire.castShadow = true;
      cluster.add(spire);
    }

    this.structuresGroup.add(cluster);
  }

  // --- DAY / NIGHT SKY & LIGHTING ---
  private updateLightingAndSky() {
    const hour = gameState.data.time.hour;
    let skyCol = '#bae6fd';
    let lightCol = '#ffffff';
    let lightIntensity = 1.3;

    if (hour >= 5 && hour < 9) {
      // Dawn / Early Morning
      skyCol = '#fed7aa';
      lightCol = '#fde68a';
      lightIntensity = 1.1;
    } else if (hour >= 9 && hour < 17) {
      // Bright Midday
      skyCol = '#bae6fd';
      lightCol = '#ffffff';
      lightIntensity = 1.4;
    } else if (hour >= 17 && hour < 20) {
      // Golden Twilight / Dusk
      skyCol = '#fbcfe8';
      lightCol = '#f97316';
      lightIntensity = 1.0;
    } else {
      // Starry Night
      skyCol = '#0f172a';
      lightCol = '#93c5fd';
      lightIntensity = 0.45;
    }

    this.scene.background = new THREE.Color(skyCol);
    if (this.scene.fog) {
      this.scene.fog.color = new THREE.Color(skyCol);
    }
    this.dirLight.color = new THREE.Color(lightCol);
    this.dirLight.intensity = lightIntensity;
  }

  // --- WEATHER SYSTEM IN 3D ---
  private updateWeather() {
    this.clearGroup(this.weatherGroup);

    if (gameState.data.weather === 'rainy') {
      const rainCount = 400;
      const rainGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(rainCount * 3);

      for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60 + this.playerMesh.position.x;
        positions[i * 3 + 1] = Math.random() * 25 + 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60 + this.playerMesh.position.z;
      }

      rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: '#38bdf8',
        size: 0.15,
        transparent: true,
        opacity: 0.7,
      });

      this.rainParticles = new THREE.Points(rainGeo, rainMat);
      this.weatherGroup.add(this.rainParticles);
    } else {
      this.rainParticles = null;
    }
  }

  // --- PLAYER MOVEMENT & INTERACTIONS IN 3D ---
  private updatePlayerMovement(delta: number) {
    let dx = 0;
    let dz = 0;

    if (this.keys['w'] || this.keys['arrowup']) dz -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dz += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    const isMoving = dx !== 0 || dz !== 0;
    this.isPlayerWalking = isMoving;

    if (isMoving) {
      // Normalize
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;

      const speed = 7.5; // units/sec
      this.playerMesh.position.x += dx * speed * delta;
      this.playerMesh.position.z += dz * speed * delta;

      // Face movement direction
      this.playerFacing = Math.atan2(dx, dz);
      this.playerMesh.rotation.y = this.playerFacing;

      // Walk cycle bobbing
      this.walkTime += delta * 12;
      this.playerMesh.position.y = Math.abs(Math.sin(this.walkTime)) * 0.18;

      // Clamp to map boundaries
      this.playerMesh.position.x = Math.max(1, Math.min(49, this.playerMesh.position.x));
      this.playerMesh.position.z = Math.max(1, Math.min(37, this.playerMesh.position.z));

      // Sync 2D pixel coordinates in GameState
      gameState.data.player.x = Math.round(this.playerMesh.position.x / SCALE);
      gameState.data.player.y = Math.round(this.playerMesh.position.z / SCALE);

      // Check zone transitions in 3D
      this.check3DZoneTransitions();
    } else {
      this.playerMesh.position.y = 0;
    }

    // Camera follow player smoothly
    const px = this.playerMesh.position.x;
    const pz = this.playerMesh.position.z;

    if (this.viewMode === '3d-topdown') {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, px, 0.1);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, pz + 0.1, 0.1);
      this.camera.lookAt(px, 0, pz);
    } else {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, px + 22, 0.1);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, pz + 22, 0.1);
      this.camera.lookAt(px, 1.2, pz);
    }
  }

  private check3DZoneTransitions() {
    const px = gameState.data.player.x;
    const py = gameState.data.player.y;
    const current = gameState.data.player.activeMap;

    let target: MapId | null = null;
    let spawnX = px;
    let spawnY = py;

    if (current === 'farm') {
      if (px > 760) {
        target = 'village';
        spawnX = 60;
      } else if (py < 35) {
        target = 'forest';
        spawnY = 580;
      } else if (py > 600) {
        target = 'orchard';
        spawnY = 60;
      }
    } else if (current === 'village') {
      if (px < 40) {
        target = 'farm';
        spawnX = 740;
      } else if (px > 920) {
        target = 'beach';
        spawnX = 60;
      } else if (py < 35) {
        target = 'forest';
        spawnX = 280;
        spawnY = 580;
      } else if (py > 600) {
        target = 'desert';
        spawnY = 60;
      }
    } else if (current === 'beach') {
      if (px < 40) {
        target = 'village';
        spawnX = 900;
      } else if (py > 600) {
        target = 'desert';
        spawnX = 60;
      }
    } else if (current === 'forest') {
      if (py > 600) {
        target = 'farm';
        spawnY = 60;
      } else if (px > 760) {
        target = 'village';
        spawnX = 320;
        spawnY = 60;
      } else if (py < 35) {
        target = 'summit';
        spawnX = 400;
        spawnY = 580;
      }
    } else if (current === 'summit') {
      if (py > 600) {
        target = 'forest';
        spawnX = 400;
        spawnY = 60;
      }
    } else if (current === 'desert') {
      if (py < 35) {
        target = 'village';
        spawnY = 580;
      } else if (px < 40) {
        target = 'beach';
        spawnX = 900;
      }
    } else if (current === 'orchard') {
      if (py < 35) {
        target = 'farm';
        spawnY = 580;
      } else if (px > 760) {
        target = 'village';
        spawnX = 60;
        spawnY = 480;
      }
    }

    if (target) {
      sound.playSfx('click');
      gameState.data.player.activeMap = target;
      gameState.data.player.x = spawnX;
      gameState.data.player.y = spawnY;
      this.playerMesh.position.set(spawnX * SCALE, 0, spawnY * SCALE);
      this.buildCurrentZone();
      EventBus.emit('ZONE_CHANGED', target);
      EventBus.emit('NOTIFY', {
        title: `Entered ${target.toUpperCase()}`,
        message: 'Exploring island territory in 3D!',
      });
    }
  }

  private performPlayerAction() {
    const px = this.playerMesh.position.x;
    const pz = this.playerMesh.position.z;

    // 1. Check NPC interaction
    for (const [npcId, mesh] of this.npcMeshes.entries()) {
      const dist = Math.hypot(mesh.position.x - px, mesh.position.z - pz);
      if (dist < 3.2) {
        sound.playSfx('dialogue');
        EventBus.emit('OPEN_MODAL', { modal: 'dialogue', data: { npcId } });
        return;
      }
    }

    // 2. Check Farm Soil / Crops if in farm
    if (gameState.data.player.activeMap === 'farm') {
      const tileX = Math.round(px / 2);
      const tileY = Math.round(pz / 2);

      // Check harvestable crop
      const crop = gameState.data.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
      if (crop && crop.isHarvestable) {
        sound.playSfx('harvest');
        gameState.harvestCrop(tileX, tileY);
        this.rebuildCrops();
        return;
      }

      // Check Till or Water action
      const selectedSlot = gameState.getSelectedHotbarSlot();
      if (selectedSlot?.item?.toolType === 'hoe') {
        sound.playSfx('hoe');
        gameState.tillSoil(tileX, tileY);
        this.rebuildFarmland();
      } else if (selectedSlot?.item?.toolType === 'watering_can') {
        sound.playSfx('water');
        gameState.waterCrop(tileX, tileY);
        this.rebuildFarmland();
      } else if (selectedSlot?.item?.category === 'seed') {
        sound.playSfx('click');
        const seedId = selectedSlot.item.id;
        gameState.plantCrop(tileX, tileY, seedId);
        this.rebuildCrops();
      }
    }
  }

  // --- RENDER LOOP ---
  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Rotate windmill sails
    if (this.windmillSails) {
      this.windmillSails.rotation.z += delta * 1.5;
    }

    // Animate falling rain
    if (this.rainParticles) {
      const pos = this.rainParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - delta * 30;
        if (y < 0.2) y = 25;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // Update player movement and camera
    this.updatePlayerMovement(delta);

    this.renderer.render(this.scene, this.camera);
  };

  // --- CLEANUP ---
  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.unsubListeners.forEach((fn) => fn());

    this.clearGroup(this.terrainGroup);
    this.clearGroup(this.structuresGroup);
    this.clearGroup(this.cropsGroup);
    this.clearGroup(this.npcsGroup);
    this.clearGroup(this.weatherGroup);

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
