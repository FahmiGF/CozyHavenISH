import Phaser from 'phaser';
import { gameState } from '../../domain/GameState';
import { EventBus } from '../../domain/EventBus';
import { sound } from '../../domain/SoundSynth';
import { PlacedFurniture } from '../../types/furniture';

export class HouseScene extends Phaser.Scene {
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
  private furnitureSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private facingDirection: 'down' | 'left' | 'right' | 'up' = 'down';
  private currentPrompt: string | null = null;
  private placementCursor?: Phaser.GameObjects.Rectangle;
  private placingItemId: string | null = null;
  private placingRotation: 0 | 90 | 180 | 270 = 0;
  private cleanupListeners: (() => void)[] = [];

  constructor() {
    super('HouseScene');
  }

  create() {
    gameState.setActiveMap('house');
    const roomWidth = 480;
    const roomHeight = 384;
    this.physics.world.setBounds(0, 0, roomWidth, roomHeight);

    this.obstaclesGroup = this.physics.add.staticGroup();

    // 1. Build House Interior
    // Wooden Walls on North
    for (let x = 0; x < roomWidth; x += 32) {
      for (let y = 0; y < 64; y += 32) {
        this.add.image(x, y, 'tile_wall_wood').setOrigin(0, 0).setDepth(1);
        const wallBody = this.obstaclesGroup.create(x + 16, y + 16, 'tile_wall_wood') as Phaser.Physics.Arcade.Image;
        wallBody.setVisible(false);
        wallBody.refreshBody();
      }
    }

    // Wooden Flooring
    for (let x = 0; x < roomWidth; x += 32) {
      for (let y = 64; y < roomHeight; y += 32) {
        this.add.image(x, y, 'tile_wood_floor').setOrigin(0, 0).setDepth(0);
      }
    }

    // Outer wall boundaries (West, East, South)
    for (let y = 64; y < roomHeight; y += 32) {
      // West boundary
      const wBody = this.obstaclesGroup.create(16, y + 16, 'tile_wall_wood') as Phaser.Physics.Arcade.Image;
      wBody.setVisible(false);
      wBody.refreshBody();
      // East boundary
      const eBody = this.obstaclesGroup.create(roomWidth - 16, y + 16, 'tile_wall_wood') as Phaser.Physics.Arcade.Image;
      eBody.setVisible(false);
      eBody.refreshBody();
    }
    // South boundary (except center door)
    for (let x = 0; x < roomWidth; x += 32) {
      if (x < 200 || x > 280) {
        const sBody = this.obstaclesGroup.create(x + 16, roomHeight - 16, 'tile_wall_wood') as Phaser.Physics.Arcade.Image;
        sBody.setVisible(false);
        sBody.refreshBody();
      }
    }

    // Cozy Fireplace in northwest
    this.add.sprite(90, 60, 'item_furn_campfire').setScale(1.5).setDepth(60);

    // Kitchen Cooking Countertop
    const stove = this.add.sprite(160, 68, 'item_furn_table').setScale(1.2).setDepth(65);
    this.add.sprite(160, 54, 'item_soup').setScale(0.85).setDepth(70);
    const stoveBody = this.obstaclesGroup.create(160, 68, 'item_furn_table') as Phaser.Physics.Arcade.Image;
    stoveBody.setSize(36, 24);
    stoveBody.setVisible(false);
    stoveBody.refreshBody();

    // Bed in northeast corner
    const bed = this.add.sprite(390, 90, 'item_furn_bed').setScale(2).setDepth(90);
    const bedBody = this.obstaclesGroup.create(390, 90, 'item_furn_bed') as Phaser.Physics.Arcade.Image;
    bedBody.setSize(48, 48);
    bedBody.setVisible(false);
    bedBody.refreshBody();

    // 2. Render Placed Furniture from GameState
    this.renderPlacedFurniture();

    // 3. Create Player (entering from door at bottom center)
    this.player = this.physics.add.sprite(240, 320, 'player_sheet', 12); // facing up
    this.player.setCollideWorldBounds(true);
    this.player.setSize(12, 10);
    this.player.setOffset(2, 14);

    this.physics.add.collider(this.player, this.obstaclesGroup);

    // Camera setup
    this.cameras.main.setBounds(0, 0, roomWidth, roomHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.1);

    // 4. Setup Input
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

    // 5. Setup Placement Mode cursor
    this.placementCursor = this.add.rectangle(0, 0, 32, 32, 0x22c55e, 0.4);
    this.placementCursor.setStrokeStyle(2, 0x15803d);
    this.placementCursor.setDepth(500);
    this.placementCursor.setVisible(false);

    // 6. Listen to Events
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.cleanupListeners.push(
      EventBus.on('START_FURNITURE_PLACEMENT', (itemId: string) => {
        this.placingItemId = itemId;
        this.placementCursor?.setVisible(true);
        sound.playSfx('click');
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Placement Mode',
          message: 'Move cursor, press [Space] to place, or [E] to cancel.',
          icon: '🪑',
        });
      }),
      EventBus.on('CANCEL_FURNITURE_PLACEMENT', () => {
        this.placingItemId = null;
        this.placementCursor?.setVisible(false);
      }),
      EventBus.on('ROTATE_FURNITURE_PLACEMENT', () => {
        this.placingRotation = ((this.placingRotation + 90) % 360) as 0 | 90 | 180 | 270;
        sound.playSfx('click');
      }),
      EventBus.on('FURNITURE_PLACEMENT_CONFIRM', () => {
        this.renderPlacedFurniture();
        this.placingItemId = null;
        this.placementCursor?.setVisible(false);
      }),
      EventBus.on('FURNITURE_REMOVED', () => {
        this.renderPlacedFurniture();
      })
    );
  }

  private renderPlacedFurniture() {
    this.furnitureSprites.forEach((spr) => spr.destroy());
    this.furnitureSprites.clear();

    const houseFurniture = gameState.data.furniture.filter((f) => f.mapId === 'house');
    houseFurniture.forEach((f) => {
      const wx = f.gridX * 32 + 16;
      const wy = f.gridY * 32 + 16;
      const spr = this.add.sprite(wx, wy, `item_furn_${f.furnitureKey.replace('_wood', '').replace('_pastel', '')}`);
      spr.setAngle(f.rotation);
      spr.setDepth(wy);
      this.furnitureSprites.set(f.id, spr);
    });
  }

  private handleActionE() {
    // If in placement mode, cancel
    if (this.placingItemId) {
      this.placingItemId = null;
      this.placementCursor?.setVisible(false);
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Cancelled', message: 'Exited furniture placement.', icon: '❌' });
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // Check Kitchen Stove interaction (cooking)
    const distToStove = Phaser.Math.Distance.Between(px, py, 160, 75);
    if (distToStove < 44) {
      sound.playSfx('click');
      EventBus.emit('OPEN_MODAL', 'cooking');
      return;
    }

    // Check Bed interaction (sleep until tomorrow)
    const distToBed = Phaser.Math.Distance.Between(px, py, 390, 90);
    if (distToBed < 45) {
      EventBus.emit('OPEN_MODAL', 'sleep_confirm');
      return;
    }

    // Check Door exit (bottom center)
    if (py > 350 && px > 200 && px < 280) {
      this.exitToFarm();
      return;
    }

    // Check if picking up placed furniture
    const gridX = Math.floor(px / 32);
    const gridY = Math.floor(py / 32);
    const targetPlaced = gameState.data.furniture.find(
      (f) => f.mapId === 'house' && Math.abs(f.gridX - gridX) <= 1 && Math.abs(f.gridY - gridY) <= 1
    );

    if (targetPlaced) {
      gameState.removeFurniture(targetPlaced.id);
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Picked Up', message: 'Furniture returned to backpack.', icon: '📦' });
    }
  }

  private handleActionSpace() {
    if (this.placingItemId) {
      // Confirm placement
      const px = this.player.x;
      const py = this.player.y;
      let targetX = px;
      let targetY = py;
      if (this.facingDirection === 'up') targetY -= 32;
      else if (this.facingDirection === 'down') targetY += 32;
      else if (this.facingDirection === 'left') targetX -= 32;
      else if (this.facingDirection === 'right') targetX += 32;

      const gridX = Math.floor(targetX / 32);
      const gridY = Math.floor(targetY / 32);

      // Check bounds inside room
      if (gridX < 1 || gridX > 13 || gridY < 2 || gridY > 10) {
        EventBus.emit('SHOW_NOTIFICATION', { title: 'Invalid', message: 'Must place within room walls!', icon: '🚫' });
        return;
      }

      gameState.placeFurniture(this.placingItemId, gridX, gridY, this.placingRotation, 'house');
    }
  }

  private exitToFarm() {
    sound.playSfx('step');
    gameState.setActiveMap('farm');
    this.cleanup();
    this.scene.start('WorldScene', { mapId: 'farm', playerX: 140, playerY: 170 });
  }

  update() {
    const speed = 140;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let vx = 0;
    let vy = 0;

    if (this.cursors && this.wasdKeys) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;
    }

    if (vx !== 0 || vy !== 0) {
      const vec = new Phaser.Math.Vector2(vx, vy).normalize().scale(speed);
      body.setVelocity(vec.x, vec.y);

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

    this.player.setDepth(this.player.y);

    // Update Placement Cursor position
    if (this.placingItemId && this.placementCursor) {
      let targetX = this.player.x;
      let targetY = this.player.y;
      if (this.facingDirection === 'up') targetY -= 32;
      else if (this.facingDirection === 'down') targetY += 32;
      else if (this.facingDirection === 'left') targetX -= 32;
      else if (this.facingDirection === 'right') targetX += 32;

      const gridX = Math.floor(targetX / 32) * 32 + 16;
      const gridY = Math.floor(targetY / 32) * 32 + 16;
      this.placementCursor.setPosition(gridX, gridY);
    }

    // Contextual prompt in house
    this.checkPrompt();
  }

  private checkPrompt() {
    const px = this.player.x;
    const py = this.player.y;
    let prompt: string | null = null;

    if (this.placingItemId) {
      prompt = '[Space] Place Item   [E] Cancel';
    } else {
      if (Phaser.Math.Distance.Between(px, py, 160, 75) < 44) {
        prompt = '[E] Cook in Kitchen';
      } else if (Phaser.Math.Distance.Between(px, py, 390, 90) < 45) {
        prompt = '[E] Sleep Until Tomorrow';
      } else if (py > 345 && px > 200 && px < 280) {
        prompt = '[E] Exit to Farm';
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
