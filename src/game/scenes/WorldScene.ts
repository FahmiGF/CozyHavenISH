import Phaser from 'phaser';
import { gameState } from '../../domain/GameState';
import { EventBus } from '../../domain/EventBus';
import { sound } from '../../domain/SoundSynth';
import { mpClient, RemotePlayer } from '../../network/MultiplayerClient';
import { FarmAnimal } from '../../types/animals';
import { MapId, WeatherType } from '../../types/game';
import { CROPS_DATABASE, PlantedCrop } from '../../types/crops';
import { NPCS_DATABASE, NPCDefinition } from '../../types/npcs';
import { ITEMS_DATABASE } from '../../types/items';
import { GridPathfinder, Point } from '../ai/Pathfinder';

interface ForageSpawn {
  id: string;
  itemId: string;
  x: number;
  y: number;
  sprite?: Phaser.GameObjects.Sprite;
}

interface ActiveNPCController {
  id: string;
  def: NPCDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  currentPath: Point[];
  targetPixel: { x: number; y: number } | null;
  state: 'idle' | 'walking' | 'wandering';
  facing: 'down' | 'left' | 'right' | 'up';
  stateTimer: number;
  anchorX: number;
  anchorY: number;
}

interface MineableNode {
  id: string;
  nodeType: 'rock' | 'cavern' | 'iron' | 'gold' | 'amethyst';
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  sprite: Phaser.GameObjects.Image;
  body: Phaser.Physics.Arcade.Image;
  hitsLeft: number;
}

export class WorldScene extends Phaser.Scene {
  private mapId: MapId = 'farm';
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private soilTiles: Map<string, Phaser.GameObjects.Image> = new Map();
  private activeNPCs: Map<string, ActiveNPCController> = new Map();
  private mineableNodes: Map<string, MineableNode> = new Map();
  private animalSprites: Map<
    string,
    { container: Phaser.GameObjects.Container; sprite: Phaser.GameObjects.Sprite; productIcon?: Phaser.GameObjects.Image; id: string }
  > = new Map();
  private remotePlayers: Map<
    string,
    { container: Phaser.GameObjects.Container; sprite: Phaser.GameObjects.Sprite; nameTag: Phaser.GameObjects.Text; targetX: number; targetY: number }
  > = new Map();
  private forageSpawns: ForageSpawn[] = [];
  private ambientOverlay!: Phaser.GameObjects.Rectangle;
  private rainParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private facingDirection: 'down' | 'left' | 'right' | 'up' = 'down';
  private currentPrompt: string | null = null;
  private virtualMovement: { x: number; y: number } = { x: 0, y: 0 };
  private cleanupListeners: (() => void)[] = [];

  // Pathfinding & Grid
  private pathfinder!: GridPathfinder;
  private walkableGrid: boolean[][] = [];
  private gridCols: number = 25;
  private gridRows: number = 20;

  // Mechanics
  private hotSpringTimer: number = 0;
  private playerMoveDistance: number = 0;

  constructor() {
    super('WorldScene');
  }

  init(data: { mapId?: MapId; playerX?: number; playerY?: number }) {
    this.mapId = data.mapId || 'farm';
    gameState.setActiveMap(this.mapId);
  }

  create(data: { playerX?: number; playerY?: number }) {
    // 1. World Bounds setup (32x32 tiles)
    const worldWidth = this.mapId === 'village' ? 960 : 800;
    const worldHeight = 640;
    this.gridCols = Math.floor(worldWidth / 32);
    this.gridRows = Math.floor(worldHeight / 32);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Initialize collision grid
    this.walkableGrid = Array.from({ length: this.gridRows }, () => Array(this.gridCols).fill(true));

    // 2. Obstacles static group
    this.obstaclesGroup = this.physics.add.staticGroup();

    // 3. Clear node tracking
    this.mineableNodes.clear();
    this.activeNPCs.clear();
    this.forageSpawns = [];

    // 4. Build map tiles & structures based on zone
    switch (this.mapId) {
      case 'village':
        this.buildVillageMap(worldWidth, worldHeight);
        break;
      case 'beach':
        this.buildBeachMap(worldWidth, worldHeight);
        break;
      case 'forest':
        this.buildForestMap(worldWidth, worldHeight);
        break;
      case 'mine':
        this.buildMineMap(worldWidth, worldHeight);
        break;
      case 'summit':
        this.buildSummitMap(worldWidth, worldHeight);
        break;
      case 'desert':
        this.buildDesertMap(worldWidth, worldHeight);
        break;
      case 'orchard':
        this.buildOrchardMap(worldWidth, worldHeight);
        break;
      case 'farm':
      default:
        this.buildFarmMap(worldWidth, worldHeight);
        break;
    }

    // 5. Initialize A* Pathfinder
    this.pathfinder = new GridPathfinder(this.gridCols, this.gridRows, (tx, ty) => this.isTileWalkable(tx, ty));

    // 6. Create Player
    const defaultCoords = this.getDefaultSpawnCoords();
    const spawnX = data.playerX ?? defaultCoords.x;
    const spawnY = data.playerY ?? defaultCoords.y;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_sheet', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(12, 10);
    this.player.setOffset(2, 14);

    this.physics.add.collider(this.player, this.obstaclesGroup);

    // Camera follow player
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.85);

    // 7. Setup Keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };

      this.wasdKeys.E.on('down', () => this.handleActionE());
      this.wasdKeys.SPACE.on('down', () => this.handleActionSpace());
    }

    // 8. Day/Night ambient lighting overlay
    this.ambientOverlay = this.add.rectangle(0, 0, worldWidth, worldHeight, 0x000000, 0);
    this.ambientOverlay.setOrigin(0, 0).setDepth(800);
    this.updateAmbientLighting();

    // 9. Weather Particle Systems
    this.updateWeatherEffects();

    // 10. Sync Farmland Soil & Crops (if on farm)
    if (this.mapId === 'farm') {
      this.syncFarmPlots();
      this.spawnFarmAnimals();
    }

    // 11. Spawn Forageables & NPCs
    this.spawnForageables();
    this.spawnNPCs();

    // 12. Wire Domain EventBus listeners
    this.setupEventListeners();

    // 13. Sync any already connected remote players
    if (mpClient.getStatus().isConnected) {
      mpClient.getStatus().players.forEach((p) => this.syncRemotePlayer(p));
    }

    // Atmospheric ambient music
    const isNight = gameState.data.time.timeOfDay === 'night';
    sound.startAtmosphericMusic(isNight ? 'night' : 'day');
  }

  private getDefaultSpawnCoords(): { x: number; y: number } {
    switch (this.mapId) {
      case 'village':
        return { x: 70, y: 320 };
      case 'beach':
        return { x: 80, y: 320 };
      case 'forest':
        return { x: 380, y: 560 };
      case 'mine':
        return { x: 400, y: 560 };
      case 'summit':
        return { x: 400, y: 550 };
      case 'desert':
        return { x: 100, y: 320 };
      case 'orchard':
        return { x: 400, y: 100 };
      case 'farm':
      default:
        return { x: 320, y: 240 };
    }
  }

  private isTileWalkable(tx: number, ty: number): boolean {
    if (tx < 0 || tx >= this.gridCols || ty < 0 || ty >= this.gridRows) return false;
    return this.walkableGrid[ty][tx] === true;
  }

  private setTileObstacle(tileX: number, tileY: number, walkable: boolean = false) {
    if (tileX >= 0 && tileX < this.gridCols && tileY >= 0 && tileY < this.gridRows) {
      this.walkableGrid[tileY][tileX] = walkable;
    }
  }

  private setupEventListeners() {
    this.cleanupListeners.push(
      EventBus.on('TIME_TICK', () => {
        this.updateAmbientLighting();
        this.updateWeatherEffects();
        this.updateNPCSchedules();
      }),
      EventBus.on('ANIMALS_UPDATED', () => {
        this.updateAnimalVisuals();
      }),
      EventBus.on('MP_PLAYERS_SYNCED', (players: RemotePlayer[]) => {
        players.forEach((p) => this.syncRemotePlayer(p));
      }),
      EventBus.on('MP_PLAYER_JOINED', (p: RemotePlayer) => {
        this.syncRemotePlayer(p);
      }),
      EventBus.on('MP_PLAYER_MOVED', (p: RemotePlayer) => {
        this.syncRemotePlayer(p);
      }),
      EventBus.on('MP_PLAYER_LEFT', (playerId: string) => {
        const rp = this.remotePlayers.get(playerId);
        if (rp) {
          rp.container.destroy();
          this.remotePlayers.delete(playerId);
        }
      }),
      EventBus.on('MP_CHAT_MESSAGE', (msg: { playerId: string; playerName: string; text: string; emote?: string }) => {
        this.showPlayerChatBubble(msg.playerId, msg.text, msg.emote);
      }),
      EventBus.on('SOIL_ACTION', () => {
        if (this.mapId === 'farm') {
          this.syncFarmPlots();
        }
      }),
      EventBus.on('REMOTE_MINE_ACTION', (data: { tileX: number; tileY: number; nodeType: string }) => {
        const key = `${data.tileX},${data.tileY}`;
        const node = this.mineableNodes.get(key);
        if (node) {
          sound.playSfx('mine');
          node.sprite.destroy();
          node.body.destroy();
          this.mineableNodes.delete(key);
          this.setTileObstacle(data.tileX, data.tileY, true);
        }
      }),
      EventBus.on('VIRTUAL_JOYSTICK_MOVE', (vec: { x: number; y: number }) => {
        this.virtualMovement = vec;
      }),
      EventBus.on('VIRTUAL_ACTION_TRIGGER', (action: 'action' | 'interact') => {
        if (action === 'action') this.handleActionSpace();
        else if (action === 'interact') this.handleActionE();
      })
    );
  }

  // --- MAP BUILDERS ---

  private buildFarmMap(width: number, height: number) {
    // Fill meadow grass
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_grass').setOrigin(0, 0).setDepth(0);
      }
    }

    // River on south edge
    for (let x = 0; x < width; x += 32) {
      for (let y = height - 64; y < height; y += 32) {
        this.add.image(x, y, 'tile_water').setOrigin(0, 0).setDepth(1);
        const waterBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_water') as Phaser.Physics.Arcade.Image;
        waterBody.setVisible(false);
        waterBody.refreshBody();
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
      }
    }

    // Cottage house
    this.add.image(140, 110, 'obj_house').setOrigin(0.5, 0.5).setDepth(110);
    const houseBody = this.obstaclesGroup.create(140, 115, 'obj_house') as Phaser.Physics.Arcade.Image;
    houseBody.setSize(72, 40);
    houseBody.setOffset(12, 35);
    houseBody.setVisible(false);
    houseBody.refreshBody();
    for (let tx = 2; tx <= 6; tx++) {
      for (let ty = 2; ty <= 4; ty++) {
        this.setTileObstacle(tx, ty, false);
      }
    }

    // Dirt path from house to east exit
    for (let x = 120; x < width; x += 32) {
      this.add.image(x, 150, 'tile_path').setOrigin(0, 0).setDepth(1);
    }
    for (let y = 150; y < 350; y += 32) {
      this.add.image(280, y, 'tile_path').setOrigin(0, 0).setDepth(1);
    }

    // Shipping bin near house
    this.add.image(210, 155, 'obj_shipping_bin').setOrigin(0.5, 0.5).setDepth(155);
    const binBody = this.obstaclesGroup.create(210, 155, 'obj_shipping_bin') as Phaser.Physics.Arcade.Image;
    binBody.setSize(24, 20);
    binBody.setVisible(false);
    binBody.refreshBody();
    this.setTileObstacle(Math.floor(210 / 32), Math.floor(155 / 32), false);

    // Boundary trees
    for (let x = 20; x < width; x += 60) {
      if (x < 90 || (x > 190 && x < 280) || x > 520) {
        this.createTree(x, 25);
      }
    }
    for (let y = 80; y < height - 80; y += 70) {
      this.createTree(25, y);
    }

    // Orchard trees in north-east
    this.createTree(580, 90);
    this.createTree(680, 90);
    this.createTree(580, 170);
    this.createTree(680, 170);

    // Mineable surface rocks
    this.createMineableNode(480, 110, 'rock');
    this.createMineableNode(380, 480, 'rock');
    this.createMineableNode(620, 500, 'rock');

    // Tillable dirt region marker (visual background for farming plot)
    for (let x = 180; x < 460; x += 32) {
      for (let y = 240; y < 440; y += 32) {
        this.add.image(x, y, 'tile_dirt').setOrigin(0, 0).setDepth(1);
      }
    }
  }

  private buildVillageMap(width: number, height: number) {
    // Fill base grass
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_grass').setOrigin(0, 0).setDepth(0);
      }
    }

    // Ocean on the east
    for (let x = width - 160; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_water').setOrigin(0, 0).setDepth(1);
        const waterBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_water') as Phaser.Physics.Arcade.Image;
        waterBody.setVisible(false);
        waterBody.refreshBody();
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
      }
    }

    // Wooden Pier into the ocean
    for (let x = width - 200; x < width - 60; x += 32) {
      this.add.image(x, 480, 'tile_wood_floor').setOrigin(0, 0).setDepth(2);
      this.setTileObstacle(Math.floor(x / 32), Math.floor(480 / 32), true);
    }

    // Sandy beach buffer
    for (let x = width - 224; x < width - 160; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_sand').setOrigin(0, 0).setDepth(1);
      }
    }

    // Cobblestone Main Plaza
    for (let x = 120; x < 680; x += 32) {
      this.add.image(x, 320, 'tile_path').setOrigin(0, 0).setDepth(1);
    }
    for (let x = 320; x < 480; x += 32) {
      for (let y = 200; y < 440; y += 32) {
        this.add.image(x, y, 'tile_path').setOrigin(0, 0).setDepth(1);
      }
    }

    // General Store building
    this.add.image(420, 200, 'obj_shop').setOrigin(0.5, 0.5).setDepth(200);
    const shopBody = this.obstaclesGroup.create(420, 205, 'obj_shop') as Phaser.Physics.Arcade.Image;
    shopBody.setSize(76, 42);
    shopBody.setOffset(10, 32);
    shopBody.setVisible(false);
    shopBody.refreshBody();
    for (let tx = 11; tx <= 15; tx++) {
      for (let ty = 5; ty <= 7; ty++) {
        this.setTileObstacle(tx, ty, false);
      }
    }

    // Village trees & decorative lampposts
    this.createTree(180, 140);
    this.createTree(260, 120);
    this.createTree(620, 160);
    this.createTree(160, 480);
    this.createTree(240, 520);
    this.createLanternPost(320, 290);
    this.createLanternPost(480, 290);
  }

  private buildBeachMap(width: number, height: number) {
    // Fill base sand
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_sand').setOrigin(0, 0).setDepth(0);
      }
    }

    // Ocean on South & East (waves and deep ocean)
    for (let x = 0; x < width; x += 32) {
      for (let y = height - 128; y < height; y += 32) {
        const isCrest = y === height - 128;
        this.add.image(x, y, isCrest ? 'tile_ocean_shallow' : 'tile_ocean_deep').setOrigin(0, 0).setDepth(1);
        const waterBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_water') as Phaser.Physics.Arcade.Image;
        waterBody.setVisible(false);
        waterBody.refreshBody();
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
      }
    }
    for (let x = width - 128; x < width; x += 32) {
      for (let y = 0; y < height - 128; y += 32) {
        this.add.image(x, y, 'tile_ocean_deep').setOrigin(0, 0).setDepth(1);
        const waterBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_water') as Phaser.Physics.Arcade.Image;
        waterBody.setVisible(false);
        waterBody.refreshBody();
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
      }
    }

    // Long Wooden Fishing Pier extending into ocean
    for (let x = 320; x <= 544; x += 32) {
      for (let y = 320; y <= 352; y += 32) {
        this.add.image(x, y, 'tile_pier_wood').setOrigin(0, 0).setDepth(2);
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), true);
      }
    }

    // Palm trees
    this.createPalmTree(140, 160);
    this.createPalmTree(240, 120);
    this.createPalmTree(600, 140);
    this.createPalmTree(660, 240);
    this.createPalmTree(200, 360);

    // Decorative coastal rocks
    this.createRock(180, 460);
    this.createRock(620, 440);
  }

  private buildForestMap(width: number, height: number) {
    // Fill base forest grass
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_forest_grass').setOrigin(0, 0).setDepth(0);
      }
    }

    // Cavern Entrance Archway at (140, 70)
    const caveArch = this.add.image(140, 70, 'tile_cave_wall').setScale(2.5, 2).setOrigin(0.5, 0.5).setDepth(70);
    const caveSign = this.add.text(140, 95, '⛰️ Crystal Caverns', {
      fontSize: '11px',
      color: '#fef08a',
      fontFamily: 'sans-serif',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(75);

    // Hot Springs Pool at (x: 440 to 608, y: 224 to 352)
    for (let x = 440; x <= 608; x += 32) {
      for (let y = 224; y <= 352; y += 32) {
        this.add.image(x, y, 'tile_hotspring').setOrigin(0, 0).setDepth(1);
        // Allow walking in hot springs!
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), true);
      }
    }
    // Natural boulders bordering hot springs
    this.createRock(420, 220);
    this.createRock(628, 220);
    this.createRock(420, 360);
    this.createRock(628, 360);

    // Whispering Forest Pine Trees framing the paths
    this.createPineTree(60, 180);
    this.createPineTree(240, 160);
    this.createPineTree(340, 120);
    this.createPineTree(460, 100);
    this.createPineTree(620, 90);
    this.createPineTree(720, 180);
    this.createPineTree(80, 360);
    this.createPineTree(180, 460);
    this.createPineTree(680, 480);
    this.createPineTree(740, 340);

    // Torii Gate archway leading to hot springs
    this.add.image(524, 210, 'obj_hotspring_gate').setOrigin(0.5, 0.7).setDepth(210);

    // Cavern rocks
    this.createMineableNode(260, 280, 'rock');
    this.createMineableNode(360, 420, 'rock');
  }

  private buildMineMap(width: number, height: number) {
    // Fill dark cavern floor
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_cave_floor').setOrigin(0, 0).setDepth(0);
      }
    }

    // Cavern perimeter walls
    for (let x = 0; x < width; x += 32) {
      // North wall
      this.createCaveWall(x, 0);
      // South wall (except opening between 320 and 480)
      if (x < 320 || x > 480) {
        this.createCaveWall(x, height - 32);
      }
    }
    for (let y = 0; y < height; y += 32) {
      this.createCaveWall(0, y);
      this.createCaveWall(width - 32, y);
    }

    // Cavern interior pillar columns
    this.createCaveWall(224, 160);
    this.createCaveWall(224, 192);
    this.createCaveWall(576, 160);
    this.createCaveWall(576, 192);

    // Blacksmith Forge for Ember
    this.add.image(280, 200, 'obj_blacksmith_forge').setOrigin(0.5, 0.5).setDepth(200);
    const forgeBody = this.obstaclesGroup.create(280, 205, 'obj_blacksmith_forge') as Phaser.Physics.Arcade.Image;
    forgeBody.setSize(64, 32);
    forgeBody.setOffset(8, 24);
    forgeBody.setVisible(false);
    forgeBody.refreshBody();
    this.setTileObstacle(Math.floor(280 / 32), Math.floor(200 / 32), false);

    // Warm Lantern posts
    this.createLanternPost(224, 128);
    this.createLanternPost(576, 128);
    this.createLanternPost(320, 360);
    this.createLanternPost(480, 360);

    // Mineable Iron, Gold, and Amethyst nodes
    this.createMineableNode(180, 160, 'iron');
    this.createMineableNode(620, 160, 'iron');
    this.createMineableNode(340, 220, 'iron');
    this.createMineableNode(460, 220, 'iron');

    this.createMineableNode(140, 320, 'gold');
    this.createMineableNode(660, 320, 'gold');
    this.createMineableNode(400, 160, 'gold');

    this.createMineableNode(260, 400, 'amethyst');
    this.createMineableNode(540, 400, 'amethyst');
    this.createMineableNode(400, 320, 'amethyst');

    this.createMineableNode(140, 460, 'cavern');
    this.createMineableNode(660, 460, 'cavern');
  }

  private buildSummitMap(width: number, height: number) {
    // Fill alpine rock base
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_summit_rock').setOrigin(0, 0).setDepth(0);
      }
    }

    // Snow ridges & frosted peaks
    for (let x = 80; x < width - 80; x += 32) {
      for (let y = 60; y < 220; y += 32) {
        if ((x + y) % 64 === 0) {
          this.add.image(x, y, 'tile_summit_snow').setOrigin(0, 0).setDepth(1);
        }
      }
    }

    // Cobblestone path winding up to the observatory
    for (let y = 240; y < height; y += 32) {
      this.add.image(400, y, 'tile_path').setOrigin(0, 0).setDepth(1);
    }
    for (let x = 320; x <= 480; x += 32) {
      this.add.image(x, 240, 'tile_path').setOrigin(0, 0).setDepth(1);
    }

    // Starlit Observatory Landmark
    this.add.image(400, 180, 'obj_observatory').setOrigin(0.5, 0.5).setDepth(180);
    const obsBody = this.obstaclesGroup.create(400, 185, 'obj_observatory') as Phaser.Physics.Arcade.Image;
    obsBody.setSize(76, 40);
    obsBody.setOffset(10, 34);
    obsBody.setVisible(false);
    obsBody.refreshBody();
    for (let tx = 11; tx <= 14; tx++) {
      for (let ty = 4; ty <= 6; ty++) {
        this.setTileObstacle(tx, ty, false);
      }
    }

    // Wind Shrine Landmark
    this.add.image(620, 260, 'obj_wind_shrine').setOrigin(0.5, 0.5).setDepth(260);
    const shrineBody = this.obstaclesGroup.create(620, 265, 'obj_wind_shrine') as Phaser.Physics.Arcade.Image;
    shrineBody.setSize(36, 24);
    shrineBody.setOffset(6, 20);
    shrineBody.setVisible(false);
    shrineBody.refreshBody();
    this.setTileObstacle(Math.floor(620 / 32), Math.floor(260 / 32), false);

    // Pine trees and alpine rocks
    this.createPineTree(120, 160);
    this.createPineTree(180, 280);
    this.createPineTree(140, 420);
    this.createPineTree(680, 160);
    this.createPineTree(720, 340);
    this.createPineTree(660, 480);
    this.createRock(260, 360);
    this.createRock(560, 400);

    // Amethyst and gold nodes along cliffside
    this.createMineableNode(240, 220, 'amethyst');
    this.createMineableNode(560, 200, 'gold');
    this.createMineableNode(300, 480, 'amethyst');

    // Lantern posts
    this.createLanternPost(360, 250);
    this.createLanternPost(460, 250);
  }

  private buildDesertMap(width: number, height: number) {
    // Fill base golden sand
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_desert_sand').setOrigin(0, 0).setDepth(0);
      }
    }

    // Dune ridges along north & east margins
    for (let x = 0; x < width; x += 32) {
      this.add.image(x, 0, 'tile_desert_dune').setOrigin(0, 0).setDepth(1);
    }
    for (let y = 0; y < height; y += 64) {
      this.add.image(width - 48, y, 'tile_desert_dune').setOrigin(0, 0).setDepth(1);
    }

    // Center Oasis Pool (water tiles)
    for (let x = 320; x <= 480; x += 32) {
      for (let y = 280; y <= 384; y += 32) {
        this.add.image(x, y, 'tile_water').setOrigin(0, 0).setDepth(1);
        const waterBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_water') as Phaser.Physics.Arcade.Image;
        waterBody.setVisible(false);
        waterBody.refreshBody();
        this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
      }
    }

    // Sun Stone Obelisk Monument
    this.add.image(400, 180, 'obj_desert_shrine').setOrigin(0.5, 0.5).setDepth(180);
    const obeliskBody = this.obstaclesGroup.create(400, 190, 'obj_desert_shrine') as Phaser.Physics.Arcade.Image;
    obeliskBody.setSize(44, 30);
    obeliskBody.setOffset(10, 44);
    obeliskBody.setVisible(false);
    obeliskBody.refreshBody();
    this.setTileObstacle(Math.floor(400 / 32), Math.floor(180 / 32), false);

    // Oasis Palm Trees ringed around water
    this.createPalmTree(280, 260);
    this.createPalmTree(520, 260);
    this.createPalmTree(270, 400);
    this.createPalmTree(530, 400);
    this.createPalmTree(160, 160);
    this.createPalmTree(660, 180);

    // Saguaro Cacti
    const addCactus = (cx: number, cy: number) => {
      this.add.image(cx, cy, 'obj_cactus').setOrigin(0.5, 0.8).setDepth(cy);
      const b = this.obstaclesGroup.create(cx, cy, 'obj_cactus') as Phaser.Physics.Arcade.Image;
      b.setSize(18, 14);
      b.setOffset(7, 30);
      b.setVisible(false);
      b.refreshBody();
      this.setTileObstacle(Math.floor(cx / 32), Math.floor(cy / 32), false);
    };
    addCactus(160, 320);
    addCactus(220, 460);
    addCactus(620, 320);
    addCactus(680, 460);
    addCactus(480, 480);

    // Mineable cavern/gold nodes
    this.createMineableNode(140, 220, 'gold');
    this.createMineableNode(660, 240, 'cavern');
    this.createMineableNode(340, 460, 'cavern');
  }

  private buildOrchardMap(width: number, height: number) {
    // Fill base clover grass
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x, y, 'tile_orchard_grass').setOrigin(0, 0).setDepth(0);
      }
    }

    // Timber mulch walkways
    for (let x = 120; x < width - 120; x += 32) {
      this.add.image(x, 260, 'tile_orchard_path').setOrigin(0, 0).setDepth(1);
      this.add.image(x, 420, 'tile_orchard_path').setOrigin(0, 0).setDepth(1);
    }
    for (let y = 0; y < height; y += 32) {
      this.add.image(400, y, 'tile_orchard_path').setOrigin(0, 0).setDepth(1);
    }

    // Orchard Windmill Landmark
    this.add.image(420, 160, 'obj_windmill').setOrigin(0.5, 0.5).setDepth(160);
    const millBody = this.obstaclesGroup.create(420, 170, 'obj_windmill') as Phaser.Physics.Arcade.Image;
    millBody.setSize(54, 40);
    millBody.setOffset(20, 50);
    millBody.setVisible(false);
    millBody.refreshBody();
    for (let tx = 12; tx <= 14; tx++) {
      for (let ty = 4; ty <= 6; ty++) {
        this.setTileObstacle(tx, ty, false);
      }
    }

    // Cedar Beehives in a neat row
    const addHive = (hx: number, hy: number) => {
      this.add.image(hx, hy, 'obj_beehive').setOrigin(0.5, 0.7).setDepth(hy);
      const b = this.obstaclesGroup.create(hx, hy, 'obj_beehive') as Phaser.Physics.Arcade.Image;
      b.setSize(22, 16);
      b.setOffset(5, 12);
      b.setVisible(false);
      b.refreshBody();
      this.setTileObstacle(Math.floor(hx / 32), Math.floor(hy / 32), false);
    };
    addHive(260, 340);
    addHive(320, 340);
    addHive(480, 340);
    addHive(540, 340);

    // Fruit Tree Orchards (Apples on West terraces, Peaches on East terraces)
    const addFruitTree = (fx: number, fy: number, tex: string) => {
      this.add.image(fx, fy, tex).setOrigin(0.5, 0.85).setDepth(fy);
      const b = this.obstaclesGroup.create(fx, fy, tex) as Phaser.Physics.Arcade.Image;
      b.setSize(20, 16);
      b.setOffset(14, 44);
      b.setVisible(false);
      b.refreshBody();
      this.setTileObstacle(Math.floor(fx / 32), Math.floor(fy / 32), false);
    };

    // Honeycrisp Apple grove
    addFruitTree(160, 160, 'obj_fruit_tree_apple');
    addFruitTree(240, 160, 'obj_fruit_tree_apple');
    addFruitTree(160, 360, 'obj_fruit_tree_apple');
    addFruitTree(180, 480, 'obj_fruit_tree_apple');

    // Peach grove
    addFruitTree(580, 160, 'obj_fruit_tree_peach');
    addFruitTree(660, 160, 'obj_fruit_tree_peach');
    addFruitTree(640, 360, 'obj_fruit_tree_peach');
    addFruitTree(600, 480, 'obj_fruit_tree_peach');

    // Lantern posts along the path
    this.createLanternPost(360, 270);
    this.createLanternPost(440, 270);
    this.createLanternPost(360, 430);
    this.createLanternPost(440, 430);
  }

  // --- ENTITY FACTORIES ---

  private createTree(x: number, y: number) {
    const tree = this.add.image(x, y, 'obj_tree').setOrigin(0.5, 0.9).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, 'obj_tree') as Phaser.Physics.Arcade.Image;
    body.setSize(16, 12);
    body.setOffset(16, 48);
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
    return tree;
  }

  private createPineTree(x: number, y: number) {
    const tree = this.add.image(x, y, 'obj_pine_tree').setOrigin(0.5, 0.9).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, 'obj_pine_tree') as Phaser.Physics.Arcade.Image;
    body.setSize(18, 14);
    body.setOffset(15, 48);
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
    return tree;
  }

  private createPalmTree(x: number, y: number) {
    const tree = this.add.image(x, y, 'obj_palm_tree').setOrigin(0.5, 0.9).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, 'obj_palm_tree') as Phaser.Physics.Arcade.Image;
    body.setSize(16, 14);
    body.setOffset(16, 48);
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
    return tree;
  }

  private createRock(x: number, y: number) {
    const rock = this.add.image(x, y, 'obj_rock').setOrigin(0.5, 0.7).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, 'obj_rock') as Phaser.Physics.Arcade.Image;
    body.setSize(22, 14);
    body.setOffset(5, 12);
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
    return rock;
  }

  private createCaveWall(x: number, y: number) {
    this.add.image(x, y, 'tile_cave_wall').setOrigin(0, 0).setDepth(y + 16);
    const body = this.obstaclesGroup.create(x + 16, y + 16, 'tile_cave_wall') as Phaser.Physics.Arcade.Image;
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
  }

  private createLanternPost(x: number, y: number) {
    this.add.image(x, y, 'obj_lantern_post').setOrigin(0.5, 0.85).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, 'obj_lantern_post') as Phaser.Physics.Arcade.Image;
    body.setSize(10, 8);
    body.setOffset(7, 38);
    body.setVisible(false);
    body.refreshBody();
    this.setTileObstacle(Math.floor(x / 32), Math.floor(y / 32), false);
  }

  private createMineableNode(x: number, y: number, nodeType: 'rock' | 'cavern' | 'iron' | 'gold' | 'amethyst') {
    let tex = 'obj_rock';
    if (nodeType === 'cavern') tex = 'obj_rock_cavern';
    else if (nodeType === 'iron') tex = 'obj_ore_iron';
    else if (nodeType === 'gold') tex = 'obj_ore_gold';
    else if (nodeType === 'amethyst') tex = 'obj_crystal_amethyst';

    const sprite = this.add.image(x, y, tex).setOrigin(0.5, 0.7).setDepth(y);
    const body = this.obstaclesGroup.create(x, y, tex) as Phaser.Physics.Arcade.Image;
    body.setSize(22, 14);
    body.setOffset(5, 12);
    body.setVisible(false);
    body.refreshBody();

    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    this.setTileObstacle(tileX, tileY, false);

    const hitsLeft = nodeType === 'amethyst' || nodeType === 'gold' ? 3 : nodeType === 'iron' ? 2 : 1;
    const key = `${tileX},${tileY}`;
    this.mineableNodes.set(key, {
      id: key,
      nodeType,
      x,
      y,
      tileX,
      tileY,
      sprite,
      body,
      hitsLeft,
    });
  }

  // --- NPC MANAGEMENT & PATHFINDING ---

  private spawnNPCs() {
    this.activeNPCs.forEach((ctrl) => {
      ctrl.sprite.destroy();
    });
    this.activeNPCs.clear();

    Object.values(NPCS_DATABASE).forEach((npcDef) => {
      const state = gameState.data.npcs[npcDef.id];
      if (!state) return;

      if (state.currentMap === this.mapId) {
        this.createNPCController(npcDef, state.x, state.y);
      }
    });
  }

  private createNPCController(npcDef: NPCDefinition, x: number, y: number): ActiveNPCController {
    const npcSprite = this.physics.add.sprite(x, y, `npc_${npcDef.id}`, 0);
    npcSprite.setSize(12, 12);
    npcSprite.setOffset(2, 12);
    npcSprite.setDepth(y);

    this.physics.add.collider(this.player, npcSprite);
    this.physics.add.collider(npcSprite, this.obstaclesGroup);

    const controller: ActiveNPCController = {
      id: npcDef.id,
      def: npcDef,
      sprite: npcSprite,
      currentPath: [],
      targetPixel: null,
      state: 'idle',
      facing: 'down',
      stateTimer: Phaser.Math.Between(2000, 6000),
      anchorX: x,
      anchorY: y,
    };

    npcSprite.play(`npc_${npcDef.id}_idle_down`, true);
    this.activeNPCs.set(npcDef.id, controller);
    return controller;
  }

  private updateNPCSchedules() {
    const currentHour = gameState.data.time.hour;
    const currentMinute = gameState.data.time.minute;

    Object.values(NPCS_DATABASE).forEach((npcDef) => {
      // Find waypoint active for this hour
      const sorted = [...npcDef.schedule].sort((a, b) => b.hour * 60 + b.minute - (a.hour * 60 + a.minute));
      const targetWaypoint = sorted.find((w) => currentHour * 60 + currentMinute >= w.hour * 60 + w.minute) || sorted[sorted.length - 1];

      if (!targetWaypoint) return;

      const state = gameState.data.npcs[npcDef.id];
      if (!state) return;

      state.currentActivity = targetWaypoint.activity;

      if (targetWaypoint.mapId === this.mapId) {
        let ctrl = this.activeNPCs.get(npcDef.id);
        if (!ctrl) {
          // NPC just arrived on this map! Spawn near border or destination
          ctrl = this.createNPCController(npcDef, targetWaypoint.x, targetWaypoint.y);
        }
        ctrl.anchorX = targetWaypoint.x;
        ctrl.anchorY = targetWaypoint.y;

        // Pathfind to scheduled waypoint
        const startTileX = Math.floor(ctrl.sprite.x / 32);
        const startTileY = Math.floor(ctrl.sprite.y / 32);
        const targetTileX = Math.floor(targetWaypoint.x / 32);
        const targetTileY = Math.floor(targetWaypoint.y / 32);

        const path = this.pathfinder.findPath(startTileX, startTileY, targetTileX, targetTileY);
        if (path.length > 0) {
          ctrl.currentPath = path;
          const next = ctrl.currentPath.shift()!;
          ctrl.targetPixel = { x: next.x * 32 + 16, y: next.y * 32 + 16 };
          ctrl.state = 'walking';
        }
      } else {
        // NPC is scheduled on another map
        const ctrl = this.activeNPCs.get(npcDef.id);
        if (ctrl) {
          ctrl.sprite.destroy();
          this.activeNPCs.delete(npcDef.id);
        }
        state.currentMap = targetWaypoint.mapId;
        state.x = targetWaypoint.x;
        state.y = targetWaypoint.y;
      }
    });
  }

  private updateNPCs(delta: number) {
    this.activeNPCs.forEach((ctrl) => {
      const speed = 48; // Natural NPC walking speed

      if (ctrl.targetPixel) {
        const dx = ctrl.targetPixel.x - ctrl.sprite.x;
        const dy = ctrl.targetPixel.y - ctrl.sprite.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          const vx = (dx / dist) * speed;
          const vy = (dy / dist) * speed;
          ctrl.sprite.setVelocity(vx, vy);

          // Update animation direction
          let dir: 'down' | 'left' | 'right' | 'up' = 'down';
          if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx < 0 ? 'left' : 'right';
          } else {
            dir = dy < 0 ? 'up' : 'down';
          }
          if (dir !== ctrl.facing || ctrl.sprite.anims.currentAnim?.key !== `npc_${ctrl.id}_walk_${dir}`) {
            ctrl.facing = dir;
            ctrl.sprite.play(`npc_${ctrl.id}_walk_${dir}`, true);
          }
        } else {
          // Reached intermediate node
          ctrl.sprite.setPosition(ctrl.targetPixel.x, ctrl.targetPixel.y);
          if (ctrl.currentPath.length > 0) {
            const next = ctrl.currentPath.shift()!;
            ctrl.targetPixel = { x: next.x * 32 + 16, y: next.y * 32 + 16 };
          } else {
            // Reached destination
            ctrl.targetPixel = null;
            ctrl.sprite.setVelocity(0);
            ctrl.state = 'idle';
            ctrl.stateTimer = Phaser.Math.Between(4000, 8000);
            ctrl.sprite.play(`npc_${ctrl.id}_idle_${ctrl.facing}`, true);

            // Sync state
            const state = gameState.data.npcs[ctrl.id];
            if (state) {
              state.x = Math.round(ctrl.sprite.x);
              state.y = Math.round(ctrl.sprite.y);
            }
          }
        }
      } else if (ctrl.state === 'idle') {
        ctrl.sprite.setVelocity(0);
        ctrl.stateTimer -= delta;

        if (ctrl.stateTimer <= 0) {
          // 50% chance to take a casual wander step
          if (Math.random() < 0.5) {
            const anchorTileX = Math.floor(ctrl.anchorX / 32);
            const anchorTileY = Math.floor(ctrl.anchorY / 32);
            const wanderTarget = this.pathfinder.findRandomWalkableAround(anchorTileX, anchorTileY, 2);

            if (wanderTarget) {
              const startTileX = Math.floor(ctrl.sprite.x / 32);
              const startTileY = Math.floor(ctrl.sprite.y / 32);
              const path = this.pathfinder.findPath(startTileX, startTileY, wanderTarget.x, wanderTarget.y);
              if (path.length > 0) {
                ctrl.currentPath = path;
                const next = ctrl.currentPath.shift()!;
                ctrl.targetPixel = { x: next.x * 32 + 16, y: next.y * 32 + 16 };
                ctrl.state = 'wandering';
              }
            }
          }
          ctrl.stateTimer = Phaser.Math.Between(4000, 9000);
        }
      }

      ctrl.sprite.setDepth(ctrl.sprite.y);
    });
  }

  // --- FARM ANIMALS ---

  private spawnFarmAnimals() {
    this.animalSprites.forEach((entry) => entry.container.destroy());
    this.animalSprites.clear();

    const animals = gameState.getAnimals();
    animals.forEach((animal) => {
      const container = this.add.container(animal.x, animal.y);
      const spr = this.add.sprite(0, 0, animal.type === 'chicken' ? 'animal_chicken' : 'animal_cow');
      container.add(spr);
      container.setDepth(animal.y);

      let productIcon: Phaser.GameObjects.Image | undefined;
      if (animal.hasProduct) {
        productIcon = this.add.image(0, animal.type === 'chicken' ? -16 : -22, animal.productItemId);
        productIcon.setScale(0.75);
        container.add(productIcon);
      }

      this.animalSprites.set(animal.id, {
        container,
        sprite: spr,
        productIcon,
        id: animal.id,
      });
    });
  }

  private updateAnimalVisuals() {
    const animals = gameState.getAnimals();
    animals.forEach((animal) => {
      const entry = this.animalSprites.get(animal.id);
      if (!entry) return;

      if (animal.hasProduct && !entry.productIcon) {
        const productIcon = this.add.image(0, animal.type === 'chicken' ? -16 : -22, animal.productItemId);
        productIcon.setScale(0.75);
        entry.container.add(productIcon);
        entry.productIcon = productIcon;
      } else if (!animal.hasProduct && entry.productIcon) {
        entry.productIcon.destroy();
        entry.productIcon = undefined;
      }
    });
  }

  // --- FORAGEABLES ---

  private spawnForageables() {
    this.forageSpawns.forEach((f) => f.sprite?.destroy());
    this.forageSpawns = [];

    if (this.mapId === 'farm') {
      this.forageSpawns = [
        { id: 'f_1', itemId: 'forage_wildberry', x: 580, y: 340 },
        { id: 'f_2', itemId: 'forage_mushroom', x: 700, y: 440 },
      ];
    } else if (this.mapId === 'beach') {
      this.forageSpawns = [
        { id: 'f_b1', itemId: 'forage_seashell', x: 260, y: 440 },
        { id: 'f_b2', itemId: 'forage_seashell', x: 480, y: 440 },
        { id: 'f_b3', itemId: 'forage_seashell', x: 640, y: 380 },
      ];
    } else if (this.mapId === 'forest') {
      this.forageSpawns = [
        { id: 'f_fo1', itemId: 'forage_mushroom', x: 220, y: 220 },
        { id: 'f_fo2', itemId: 'forage_mushroom', x: 680, y: 260 },
        { id: 'f_fo3', itemId: 'forage_wildberry', x: 320, y: 380 },
      ];
    } else if (this.mapId === 'village') {
      this.forageSpawns = [
        { id: 'f_3', itemId: 'forage_wildberry', x: 180, y: 220 },
        { id: 'f_4', itemId: 'forage_mushroom', x: 260, y: 190 },
      ];
    } else if (this.mapId === 'summit') {
      this.forageSpawns = [
        { id: 'f_s1', itemId: 'flora_edelweiss', x: 280, y: 320 },
        { id: 'f_s2', itemId: 'flora_edelweiss', x: 520, y: 340 },
      ];
    } else if (this.mapId === 'desert') {
      this.forageSpawns = [
        { id: 'f_d1', itemId: 'relic_ancient_tablet', x: 400, y: 440 },
        { id: 'f_d2', itemId: 'forage_seashell', x: 240, y: 260 },
      ];
    } else if (this.mapId === 'orchard') {
      this.forageSpawns = [
        { id: 'f_o1', itemId: 'crop_honey', x: 300, y: 370 },
        { id: 'f_o2', itemId: 'crop_apple', x: 180, y: 220 },
        { id: 'f_o3', itemId: 'crop_peach', x: 620, y: 220 },
      ];
    }

    this.forageSpawns.forEach((f) => {
      const tex = ITEMS_DATABASE[f.itemId]?.textureKey || `item_${f.itemId.replace('forage_', '')}`;
      const spr = this.add.sprite(f.x, f.y, tex);
      spr.setDepth(f.y);
      f.sprite = spr;
    });
  }

  // --- FARMLAND SYNC ---

  private syncFarmPlots() {
    Object.entries(gameState.data.farmTiles).forEach(([key, tile]) => {
      const [tx, ty] = key.split(',').map(Number);
      const worldX = tx * 32;
      const worldY = ty * 32;
      const texKey = tile.watered ? 'tile_dirt_watered' : 'tile_dirt_tilled';

      let soilImg = this.soilTiles.get(key);
      if (soilImg) {
        soilImg.setTexture(texKey);
      } else {
        soilImg = this.add.image(worldX, worldY, texKey).setOrigin(0, 0).setDepth(2);
        this.soilTiles.set(key, soilImg);
      }
    });

    // Remove stale crops
    const currentCropIds = new Set(gameState.data.crops.map((c) => c.id));
    this.cropSprites.forEach((spr, id) => {
      if (!currentCropIds.has(id)) {
        spr.destroy();
        this.cropSprites.delete(id);
      }
    });

    // Update crops
    gameState.data.crops.forEach((crop) => {
      const worldX = crop.tileX * 32 + 16;
      const worldY = crop.tileY * 32 + 16;
      const texKey = `crop_${crop.cropId}_stage_${crop.currentStage}`;

      let spr = this.cropSprites.get(crop.id);
      if (spr) {
        spr.setTexture(texKey);
      } else {
        spr = this.add.sprite(worldX, worldY, texKey).setOrigin(0.5, 0.75).setDepth(worldY + 5);
        this.cropSprites.set(crop.id, spr);
      }
    });
  }

  // --- AMBIENT LIGHTING & WEATHER ---

  private updateAmbientLighting() {
    const timeOfDay = gameState.data.time.timeOfDay;
    let alpha = 0;
    let color = 0x000000;

    if (timeOfDay === 'morning') {
      alpha = 0.05;
      color = 0xfef08a; // warm dawn
    } else if (timeOfDay === 'afternoon') {
      alpha = 0;
    } else if (timeOfDay === 'evening') {
      alpha = 0.22;
      color = 0xf97316; // amber golden hour
    } else if (timeOfDay === 'night') {
      alpha = 0.52;
      color = 0x0f172a; // deep midnight navy
    }

    // In cavern mine, keep a permanent mysterious dimness
    if (this.mapId === 'mine') {
      alpha = 0.45;
      color = 0x0f172a;
    }

    this.ambientOverlay.setFillStyle(color, alpha);
  }

  private updateWeatherEffects() {
    const weather = gameState.data.weather;
    if (weather === 'rainy' && this.mapId !== 'mine') {
      if (!this.rainParticles) {
        this.rainParticles = this.add.particles(0, 0, 'tile_water', {
          x: { min: 0, max: 960 },
          y: -20,
          speedY: { min: 250, max: 400 },
          speedX: { min: -40, max: -10 },
          scaleX: 0.05,
          scaleY: 0.25,
          alpha: { start: 0.6, end: 0.2 },
          lifespan: 1200,
          quantity: 4,
        });
        this.rainParticles.setDepth(900);
      }
    } else {
      if (this.rainParticles) {
        this.rainParticles.destroy();
        this.rainParticles = undefined;
      }
    }
  }

  // --- MULTIPLAYER PLAYERS & CHAT ---

  private syncRemotePlayer(p: RemotePlayer) {
    if (p.id === mpClient.getStatus().myPlayerId) return;

    let rp = this.remotePlayers.get(p.id);
    if (!rp) {
      const container = this.add.container(p.x, p.y);
      const sprite = this.add.sprite(0, 0, 'player_sheet', 0);
      sprite.setSize(12, 10);

      const nameTag = this.add.text(0, -20, p.name, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        stroke: '#0f172a',
        strokeThickness: 3,
      }).setOrigin(0.5, 0.5);

      container.add([sprite, nameTag]);
      container.setDepth(p.y);

      rp = {
        container,
        sprite,
        nameTag,
        targetX: p.x,
        targetY: p.y,
      };
      this.remotePlayers.set(p.id, rp);
    }

    rp.container.setVisible(p.mapId === this.mapId);
    rp.targetX = p.x;
    rp.targetY = p.y;
  }

  private showPlayerChatBubble(playerId: string, text: string, emote?: string) {
    let targetX = this.player.x;
    let targetY = this.player.y;

    if (playerId !== mpClient.getStatus().myPlayerId) {
      const rp = this.remotePlayers.get(playerId);
      if (!rp || !rp.container.visible) return;
      targetX = rp.container.x;
      targetY = rp.container.y;
    }

    const bubble = this.add.container(targetX, targetY - 32);
    const displayText = emote ? `${emote} ${text}` : text;

    const bubbleBg = this.add.rectangle(0, 0, displayText.length * 7 + 16, 22, 0xffffff, 0.95);
    bubbleBg.setStrokeStyle(1.5, 0x1e293b);
    const chatText = this.add.text(0, 0, displayText, {
      fontSize: '11px',
      color: '#0f172a',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5, 0.5);

    bubble.add([bubbleBg, chatText]);
    bubble.setDepth(999);

    this.tweens.add({
      targets: bubble,
      y: bubble.y - 12,
      alpha: 0,
      duration: 3500,
      ease: 'Power1',
      onComplete: () => bubble.destroy(),
    });
  }

  // --- ACTIONS & INTERACTIONS ---

  private handleActionE() {
    const px = this.player.x;
    const py = this.player.y;

    // 1. Check NPC Talk
    for (const [npcId, ctrl] of this.activeNPCs) {
      const dist = Phaser.Math.Distance.Between(px, py, ctrl.sprite.x, ctrl.sprite.y);
      if (dist < 46) {
        // Face player
        const dx = px - ctrl.sprite.x;
        const dy = py - ctrl.sprite.y;
        ctrl.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
        ctrl.sprite.play(`npc_${ctrl.id}_idle_${ctrl.facing}`, true);
        ctrl.sprite.setVelocity(0);
        ctrl.targetPixel = null;
        ctrl.state = 'idle';
        ctrl.stateTimer = 6000;

        gameState.talkToNPC(npcId);
        return;
      }
    }

    // 2. Check Farm Animals
    if (this.mapId === 'farm') {
      const animals = gameState.getAnimals();
      for (const animal of animals) {
        const dist = Phaser.Math.Distance.Between(px, py, animal.x, animal.y);
        if (dist < 46) {
          if (animal.hasProduct) {
            gameState.collectAnimalProduct(animal.id);
          } else {
            gameState.petAnimal(animal.id);
          }
          return;
        }
      }
    }

    // 3. Check Shipping Bin
    if (this.mapId === 'farm') {
      const distToBin = Phaser.Math.Distance.Between(px, py, 210, 155);
      if (distToBin < 42) {
        sound.playSfx('click');
        EventBus.emit('OPEN_MODAL', 'shipping_bin');
        return;
      }
    }

    // 4. Check General Store
    if (this.mapId === 'village') {
      const distToStore = Phaser.Math.Distance.Between(px, py, 420, 230);
      if (distToStore < 48) {
        sound.playSfx('click');
        EventBus.emit('OPEN_MODAL', 'shop');
        return;
      }
    }

    // 5. Check Forageables
    for (let i = 0; i < this.forageSpawns.length; i++) {
      const f = this.forageSpawns[i];
      const dist = Phaser.Math.Distance.Between(px, py, f.x, f.y);
      if (dist < 32) {
        const added = gameState.addItem(f.itemId, 1);
        if (added) {
          sound.playSfx('harvest');
          EventBus.emit('SHOW_NOTIFICATION', {
            title: 'Foraged!',
            message: `Found wild ${f.itemId.replace('forage_', '').replace('_', ' ')}!`,
            icon: '🌿',
          });
          f.sprite?.destroy();
          this.forageSpawns.splice(i, 1);
          return;
        }
      }
    }

    // 6. Check House Door entrance
    if (this.mapId === 'farm') {
      const distToHouseDoor = Phaser.Math.Distance.Between(px, py, 140, 150);
      if (distToHouseDoor < 35) {
        this.transitionToMap('house');
        return;
      }
    }

    // 7. Check Cavern entrance (Forest -> Mine)
    if (this.mapId === 'forest') {
      const distToCave = Phaser.Math.Distance.Between(px, py, 140, 80);
      if (distToCave < 42) {
        this.transitionToMap('mine', 400, 560);
        return;
      }
    }

    // 8. Check Cavern exit (Mine -> Forest)
    if (this.mapId === 'mine') {
      if (py > 580 && px >= 340 && px <= 460) {
        this.transitionToMap('forest', 140, 130);
        return;
      }
    }
  }

  private handleActionSpace() {
    const px = this.player.x;
    const py = this.player.y;

    // Calculate facing tile coordinates (32x32 grid)
    let targetX = px;
    let targetY = py;
    const offset = 26;

    if (this.facingDirection === 'up') targetY -= offset;
    else if (this.facingDirection === 'down') targetY += offset;
    else if (this.facingDirection === 'left') targetX -= offset;
    else if (this.facingDirection === 'right') targetX += offset;

    const tileX = Math.floor(targetX / 32);
    const tileY = Math.floor(targetY / 32);

    // 1. Check Mineable Nodes
    const facingKey = `${tileX},${tileY}`;
    let targetNode = this.mineableNodes.get(facingKey);
    if (!targetNode) {
      // Check proximity search
      for (const [, node] of this.mineableNodes) {
        if (Phaser.Math.Distance.Between(px, py, node.x, node.y) < 36) {
          targetNode = node;
          break;
        }
      }
    }

    if (targetNode) {
      targetNode.hitsLeft--;
      sound.playSfx('mine');

      this.tweens.add({
        targets: targetNode.sprite,
        scaleX: 1.15,
        scaleY: 0.85,
        duration: 60,
        yoyo: true,
      });

      if (targetNode.hitsLeft <= 0) {
        const mined = gameState.mineRockNode(targetNode.nodeType);
        if (mined.success) {
          targetNode.sprite.destroy();
          targetNode.body.destroy();
          this.mineableNodes.delete(targetNode.id);
          this.setTileObstacle(targetNode.tileX, targetNode.tileY, true);

          // Broadcast to multiplayer room
          mpClient.sendWorldAction('mine', {
            tileX: targetNode.tileX,
            tileY: targetNode.tileY,
            nodeType: targetNode.nodeType,
          });
        }
      }
      return;
    }

    const activeSlot = gameState.getSelectedHotbarSlot();
    const activeItem = activeSlot?.item;

    // 2. Check Harvestable Crop
    const existingCrop = gameState.data.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
    if (existingCrop && existingCrop.isHarvestable) {
      gameState.harvestCrop(tileX, tileY);
      return;
    }

    // 3. Tool usage
    if (!activeItem) return;

    if (activeItem.toolType === 'hoe') {
      gameState.tillSoil(tileX, tileY);
    } else if (activeItem.toolType === 'watering_can') {
      gameState.waterCrop(tileX, tileY);
    } else if (activeItem.category === 'seed') {
      gameState.plantCrop(tileX, tileY, activeItem.id);
    } else if (activeItem.toolType === 'fishing_rod') {
      // Cast fishing line if facing water or on beach pier
      const isFacingWater =
        (this.mapId === 'farm' && py > 520) ||
        (this.mapId === 'village' && px > 700) ||
        (this.mapId === 'beach' && (py > 460 || px > 640 || (px >= 320 && px <= 544 && py >= 300)));

      if (isFacingWater) {
        sound.playSfx('step');
        EventBus.emit('OPEN_MODAL', 'fishing');
      } else {
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'No Water',
          message: 'Face a pond, river, or ocean to cast your line!',
          icon: '🎣',
        });
      }
    } else if (activeItem.toolType === 'bug_net') {
      sound.playSfx('harvest');
      const bugs = ['bug_butterfly', 'bug_ladybug', 'bug_dragonfly', 'bug_firefly'];
      const picked = bugs[Math.floor(Math.random() * bugs.length)];
      gameState.addItem(picked, 1);
      gameState.data.statistics.bugsCaught += 1;
      gameState.checkQuestProgress('catch_bug', picked, 1);
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Bug Caught!',
        message: `You swung your net and caught a ${picked.replace('bug_', '')}!`,
        icon: '🦋',
      });
    }
  }

  public transitionToMap(targetMap: MapId, x?: number, y?: number) {
    sound.playSfx('step');
    gameState.setActiveMap(targetMap);
    this.cleanup();
    if (targetMap === 'house') {
      this.scene.start('HouseScene');
    } else {
      this.scene.restart({ mapId: targetMap, playerX: x, playerY: y });
    }
  }

  update(time: number, delta: number) {
    const speed = 140;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let vx = 0;
    let vy = 0;

    // Keyboard controls
    if (this.cursors && this.wasdKeys) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;
    }

    // Virtual Touch Joystick input
    if (this.virtualMovement.x !== 0 || this.virtualMovement.y !== 0) {
      vx = this.virtualMovement.x;
      vy = this.virtualMovement.y;
    }

    // Player velocity & walk animation
    const isMoving = vx !== 0 || vy !== 0;
    if (isMoving) {
      const vec = new Phaser.Math.Vector2(vx, vy).normalize().scale(speed);
      body.setVelocity(vec.x, vec.y);

      // Footstep sound tick
      if (Phaser.Math.Between(0, 16) === 0) {
        sound.playSfx('step');
      }

      // Tutorial pace tracking
      this.playerMoveDistance += speed * (delta / 1000);
      if (this.playerMoveDistance >= 24) {
        this.playerMoveDistance = 0;
        gameState.advanceTutorial('move', 1);
      }

      // Determine animation direction
      if (Math.abs(vec.x) > Math.abs(vec.y)) {
        if (vec.x < 0) {
          this.facingDirection = 'left';
          this.player.play('player_walk_left', true);
        } else {
          this.facingDirection = 'right';
          this.player.play('player_walk_right', true);
        }
      } else {
        if (vec.y < 0) {
          this.facingDirection = 'up';
          this.player.play('player_walk_up', true);
        } else {
          this.facingDirection = 'down';
          this.player.play('player_walk_down', true);
        }
      }
    } else {
      this.player.play(`player_idle_${this.facingDirection}`, true);
    }

    // Y-sorting
    this.player.setDepth(this.player.y);

    // Update dynamic NPCs
    this.updateNPCs(delta);

    // Hot Springs energy regeneration in Whispering Forest
    if (this.mapId === 'forest') {
      const inSprings = this.player.x >= 440 && this.player.x <= 608 && this.player.y >= 224 && this.player.y <= 352;
      if (inSprings) {
        this.hotSpringTimer += delta;
        if (this.hotSpringTimer >= 1000) {
          this.hotSpringTimer = 0;
          const restored = gameState.restoreEnergy(3);
          if (restored) sound.playSfx('spring');
        }
      } else {
        this.hotSpringTimer = 0;
      }
    }

    // Remote multiplayer player interpolation
    this.remotePlayers.forEach((rp) => {
      rp.container.x = Phaser.Math.Linear(rp.container.x, rp.targetX, 0.25);
      rp.container.y = Phaser.Math.Linear(rp.container.y, rp.targetY, 0.25);
      rp.container.setDepth(rp.container.y);
    });

    // Send local player position to server
    if (mpClient.getStatus().isConnected) {
      mpClient.sendMovement(
        this.player.x,
        this.player.y,
        this.mapId,
        this.facingDirection,
        isMoving
      );
    }

    // Save player coords in gameState
    gameState.data.player.x = Math.round(this.player.x);
    gameState.data.player.y = Math.round(this.player.y);

    // Map border transitions
    this.checkZoneTransitions();

    // Contextual interaction prompt check
    this.checkContextualPrompt();
  }

  private checkZoneTransitions() {
    const px = this.player.x;
    const py = this.player.y;

    if (this.mapId === 'farm') {
      // East to Village
      if (px > 760) {
        this.transitionToMap('village', 60, py);
      }
      // North to Forest
      else if (py < 35 && px >= 260 && px <= 540) {
        this.transitionToMap('forest', px, 580);
      }
      // South to Orchard
      else if (py > 600 && px >= 200 && px <= 600) {
        this.transitionToMap('orchard', px, 60);
      }
    } else if (this.mapId === 'village') {
      // West to Farm
      if (px < 40) {
        this.transitionToMap('farm', 740, py);
      }
      // East to Beach
      else if (px > 920) {
        this.transitionToMap('beach', 60, py);
      }
      // North to Forest
      else if (py < 35 && px >= 200 && px <= 460) {
        this.transitionToMap('forest', 280, 580);
      }
      // South to Desert
      else if (py > 600 && px >= 260 && px <= 680) {
        this.transitionToMap('desert', px, 60);
      }
    } else if (this.mapId === 'beach') {
      // West to Village
      if (px < 40) {
        this.transitionToMap('village', 900, py);
      }
      // South to Desert
      else if (py > 600) {
        this.transitionToMap('desert', 60, 320);
      }
    } else if (this.mapId === 'forest') {
      // South to Farm
      if (py > 600 && px >= 240 && px <= 560) {
        this.transitionToMap('farm', px, 60);
      }
      // East to Village
      else if (px > 760) {
        this.transitionToMap('village', 320, 60);
      }
      // North to Summit
      else if (py < 35 && px >= 260 && px <= 540) {
        this.transitionToMap('summit', 400, 580);
      }
    } else if (this.mapId === 'summit') {
      // South to Forest
      if (py > 600) {
        this.transitionToMap('forest', 400, 60);
      }
    } else if (this.mapId === 'desert') {
      // North to Village
      if (py < 35) {
        this.transitionToMap('village', px, 580);
      }
      // West to Beach
      else if (px < 40) {
        this.transitionToMap('beach', 900, 320);
      }
    } else if (this.mapId === 'orchard') {
      // North to Farm
      if (py < 35) {
        this.transitionToMap('farm', px, 580);
      }
      // East to Village
      else if (px > 760) {
        this.transitionToMap('village', 60, 480);
      }
    } else if (this.mapId === 'mine') {
      // South to Forest
      if (py > 600 && px >= 340 && px <= 460) {
        this.transitionToMap('forest', 140, 130);
      }
    }
  }

  private checkContextualPrompt() {
    const px = this.player.x;
    const py = this.player.y;
    let prompt: string | null = null;

    // Check Hot Springs in Forest
    if (this.mapId === 'forest' && px >= 440 && px <= 608 && py >= 224 && py <= 352) {
      prompt = '♨️ Soaking in Hot Springs (+3 Energy/s)';
    } else if (this.mapId === 'summit' && px >= 340 && px <= 460 && py >= 140 && py <= 240) {
      prompt = '🔭 Skyreach Observatory: Gazing upon island constellations';
    } else if (this.mapId === 'desert' && px >= 350 && px <= 450 && py >= 150 && py <= 240) {
      prompt = '☀️ Sun Stone Obelisk: Ancient solar runes humming with warmth';
    } else if (this.mapId === 'orchard' && px >= 360 && px <= 480 && py >= 130 && py <= 220) {
      prompt = '🌾 Whispering Windmill: Grinding harvest flour & pressing cider';
    } else if (this.mapId === 'mine' && px >= 230 && px <= 330 && py >= 160 && py <= 250) {
      prompt = '🔨 Ember’s Blacksmith Forge: Roaring coal fire & anvil';
    }

    // Check NPC nearby
    if (!prompt) {
      for (const [npcId, ctrl] of this.activeNPCs) {
        const dist = Phaser.Math.Distance.Between(px, py, ctrl.sprite.x, ctrl.sprite.y);
        if (dist < 46) {
          const def = NPCS_DATABASE[npcId];
          prompt = `[E] Talk to ${def?.name || 'Villager'}`;
          break;
        }
      }
    }

    // Check Mineable Nodes
    if (!prompt) {
      for (const [, node] of this.mineableNodes) {
        const dist = Phaser.Math.Distance.Between(px, py, node.x, node.y);
        if (dist < 38) {
          const name =
            node.nodeType === 'iron'
              ? 'Iron Ore'
              : node.nodeType === 'gold'
              ? 'Gold Ore'
              : node.nodeType === 'amethyst'
              ? 'Amethyst Gem'
              : 'Rock';
          prompt = `[Space] Mine ${name} (⚡3)`;
          break;
        }
      }
    }

    // Check Farm Animals (Farm map)
    if (!prompt && this.mapId === 'farm') {
      const animals = gameState.getAnimals();
      for (const animal of animals) {
        const dist = Phaser.Math.Distance.Between(px, py, animal.x, animal.y);
        if (dist < 46) {
          if (animal.hasProduct) {
            prompt = `[E] Collect ${animal.type === 'chicken' ? 'Fresh Egg' : 'Creamy Milk'} (${animal.name})`;
          } else {
            prompt = `[E] Pet ${animal.name} (${animal.petToday ? 'Loved ❤️' : 'Give Love'})`;
          }
          break;
        }
      }
    }

    // Check Shipping Bin
    if (!prompt && this.mapId === 'farm') {
      const dist = Phaser.Math.Distance.Between(px, py, 210, 155);
      if (dist < 42) {
        prompt = '[E] Open Shipping Bin';
      }
    }

    // Check General Store
    if (!prompt && this.mapId === 'village') {
      const dist = Phaser.Math.Distance.Between(px, py, 420, 230);
      if (dist < 48) {
        prompt = '[E] Enter General Store';
      }
    }

    // Check House Door
    if (!prompt && this.mapId === 'farm') {
      const dist = Phaser.Math.Distance.Between(px, py, 140, 150);
      if (dist < 36) {
        prompt = '[E] Enter Cottage';
      }
    }

    // Check Forest Cavern Entrance
    if (!prompt && this.mapId === 'forest') {
      const dist = Phaser.Math.Distance.Between(px, py, 140, 80);
      if (dist < 42) {
        prompt = '[E] Enter Crystal Caverns';
      }
    }

    // Check Cavern Exit
    if (!prompt && this.mapId === 'mine') {
      if (py > 560 && px >= 340 && px <= 460) {
        prompt = '[E] Exit to Whispering Forest';
      }
    }

    // Check Forage
    if (!prompt) {
      for (const f of this.forageSpawns) {
        if (Phaser.Math.Distance.Between(px, py, f.x, f.y) < 30) {
          prompt = '[E] Forage Item';
          break;
        }
      }
    }

    // Check Soil / Tool action
    if (!prompt) {
      let tx = px;
      let ty = py;
      if (this.facingDirection === 'up') ty -= 26;
      else if (this.facingDirection === 'down') ty += 26;
      else if (this.facingDirection === 'left') tx -= 26;
      else if (this.facingDirection === 'right') tx += 26;

      const tileX = Math.floor(tx / 32);
      const tileY = Math.floor(ty / 32);

      const crop = gameState.data.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
      if (crop && crop.isHarvestable) {
        prompt = '[Space] Harvest Crop';
      } else {
        const active = gameState.getSelectedHotbarSlot()?.item;
        if (active?.toolType === 'hoe') prompt = '[Space] Till Soil';
        else if (active?.toolType === 'watering_can') prompt = '[Space] Water Soil';
        else if (active?.category === 'seed') prompt = `[Space] Plant ${active.name}`;
      }
    }

    if (prompt !== this.currentPrompt) {
      this.currentPrompt = prompt;
      EventBus.emit('INTERACTION_PROMPT', prompt);
    }
  }

  private cleanup() {
    this.cleanupListeners.forEach((unsub) => unsub());
    this.cleanupListeners = [];
    EventBus.emit('INTERACTION_PROMPT', null);
  }
}
