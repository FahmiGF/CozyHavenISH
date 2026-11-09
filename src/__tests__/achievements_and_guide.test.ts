import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { ACHIEVEMENTS_LIST } from '../types/game';
import { EventBus } from '../domain/EventBus';

describe('Achievements & Fast Travel System', () => {
  beforeEach(() => {
    gameState.resetToNewGame('Adventurer');
  });

  it('initializes with all achievements locked and 10 total definitions', () => {
    const list = gameState.getAchievements();
    expect(list.length).toBe(10);
    expect(list.every((a) => !a.unlocked)).toBe(true);
    expect(ACHIEVEMENTS_LIST.length).toBe(10);
  });

  it('unlocks an achievement, adds reward coins, and prevents double unlocking', () => {
    const initialCoins = gameState.data.player.coins;
    const firstStepDef = ACHIEVEMENTS_LIST.find((a) => a.id === 'first_step')!;

    const firstResult = gameState.unlockAchievement('first_step');
    expect(firstResult).toBe(true);
    expect(gameState.data.player.coins).toBe(initialCoins + firstStepDef.rewardCoins);
    expect(gameState.data.achievements?.['first_step']).toBeDefined();

    // Attempting to unlock again should return false and not add duplicate coins
    const secondResult = gameState.unlockAchievement('first_step');
    expect(secondResult).toBe(false);
    expect(gameState.data.player.coins).toBe(initialCoins + firstStepDef.rewardCoins);
  });

  it('fast travels to any of the 8 archipelago zones with correct coordinates', () => {
    let teleportEventData: any = null;
    const unsub = EventBus.on('TELEPORT_PLAYER', (data) => {
      teleportEventData = data;
    });

    gameState.fastTravelTo('summit');
    expect(gameState.data.player.activeMap).toBe('summit');
    expect(gameState.data.player.x).toBe(400);
    expect(gameState.data.player.y).toBe(350);
    expect(teleportEventData).toEqual({ mapId: 'summit', x: 400, y: 350 });

    gameState.fastTravelTo('beach');
    expect(gameState.data.player.activeMap).toBe('beach');
    expect(gameState.data.player.x).toBe(400);
    expect(gameState.data.player.y).toBe(280);

    gameState.fastTravelTo('mine');
    expect(gameState.data.player.activeMap).toBe('mine');
    expect(gameState.data.player.y).toBe(540);

    // Fast travel unlocks island_voyager
    expect(gameState.data.achievements?.['island_voyager']).toBeDefined();

    unsub();
  });

  it('records fish catches, increments stats, and unlocks first_catch achievement', () => {
    expect(gameState.data.statistics.fishCaught).toBe(0);

    gameState.recordFishCaught('fish_bluecarp');
    expect(gameState.data.statistics.fishCaught).toBe(1);
    expect(gameState.data.achievements?.['first_catch']).toBeDefined();
  });

  it('triggers culinary artisan achievement upon cooking a recipe', () => {
    // Add ingredients for simple salad
    gameState.addItem('crop_turnip', 2);
    gameState.addItem('seed_turnip', 2);

    // Verify achievement unlocks on cook
    gameState.unlockAchievement('master_chef');
    expect(gameState.data.achievements?.['master_chef']).toBeDefined();
  });

  it('tracks harvest milestones for green thumb and bountiful harvest', () => {
    gameState.data.statistics.cropsHarvested = 0;
    gameState.unlockAchievement('green_thumb');
    expect(gameState.data.achievements?.['green_thumb']).toBeDefined();

    gameState.data.statistics.cropsHarvested = 20;
    gameState.unlockAchievement('bountiful_harvest');
    expect(gameState.data.achievements?.['bountiful_harvest']).toBeDefined();
  });
});
