import Phaser from 'phaser';
import { generateProceduralTextures } from '../assets/ProceduralTextures';
import { gameState } from '../../domain/GameState';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate all original procedural pixel art assets
    generateProceduralTextures(this);
  }

  create() {
    // 1. Create Player Animations
    const anims = this.anims;

    // Player Walk
    anims.create({
      key: 'player_walk_down',
      frames: anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    anims.create({
      key: 'player_walk_left',
      frames: anims.generateFrameNumbers('player_sheet', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });
    anims.create({
      key: 'player_walk_right',
      frames: anims.generateFrameNumbers('player_sheet', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });
    anims.create({
      key: 'player_walk_up',
      frames: anims.generateFrameNumbers('player_sheet', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    // Player Idles
    anims.create({ key: 'player_idle_down', frames: [{ key: 'player_sheet', frame: 0 }], frameRate: 1 });
    anims.create({ key: 'player_idle_left', frames: [{ key: 'player_sheet', frame: 4 }], frameRate: 1 });
    anims.create({ key: 'player_idle_right', frames: [{ key: 'player_sheet', frame: 8 }], frameRate: 1 });
    anims.create({ key: 'player_idle_up', frames: [{ key: 'player_sheet', frame: 12 }], frameRate: 1 });

    // 2. Create NPC Animations
    ['npc_milo', 'npc_luna', 'npc_oliver', 'npc_poppy', 'npc_theo', 'npc_maple', 'npc_nori'].forEach((npcKey) => {
      anims.create({
        key: `${npcKey}_idle_down`,
        frames: [{ key: npcKey, frame: 0 }],
        frameRate: 1,
      });
      anims.create({
        key: `${npcKey}_idle_left`,
        frames: [{ key: npcKey, frame: 4 }],
        frameRate: 1,
      });
      anims.create({
        key: `${npcKey}_idle_right`,
        frames: [{ key: npcKey, frame: 8 }],
        frameRate: 1,
      });
      anims.create({
        key: `${npcKey}_idle_up`,
        frames: [{ key: npcKey, frame: 12 }],
        frameRate: 1,
      });
      anims.create({
        key: `${npcKey}_walk_down`,
        frames: anims.generateFrameNumbers(npcKey, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
      anims.create({
        key: `${npcKey}_walk_left`,
        frames: anims.generateFrameNumbers(npcKey, { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
      anims.create({
        key: `${npcKey}_walk_right`,
        frames: anims.generateFrameNumbers(npcKey, { start: 8, end: 11 }),
        frameRate: 6,
        repeat: -1,
      });
      anims.create({
        key: `${npcKey}_walk_up`,
        frames: anims.generateFrameNumbers(npcKey, { start: 12, end: 15 }),
        frameRate: 6,
        repeat: -1,
      });
    });

    // Start with active map
    const activeMap = gameState.data.player.activeMap || 'farm';
    if (activeMap === 'house') {
      this.scene.start('HouseScene');
    } else {
      this.scene.start('WorldScene', { mapId: activeMap });
    }
  }
}
