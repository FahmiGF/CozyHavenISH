import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { CROPS_DATABASE } from '../types/crops';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('CozyHaven Farming System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('TestFarmer');
  });

  it('should till soil and deduct 2 energy points', () => {
    const initialEnergy = gameState.data.player.energy;
    const success = gameState.tillSoil(10, 10);

    expect(success).toBe(true);
    expect(gameState.data.player.energy).toBe(initialEnergy - 2);
    expect(gameState.data.farmTiles['10,10']).toBeDefined();
    expect(gameState.data.farmTiles['10,10'].tilled).toBe(true);
    expect(gameState.data.farmTiles['10,10'].watered).toBe(false);
  });

  it('should plant seeds in tilled soil and consume 1 seed from inventory', () => {
    gameState.tillSoil(10, 10);

    const initialSeeds = gameState.data.inventory.find((s) => s.item?.id === 'seed_turnip')!.quantity;
    const planted = gameState.plantCrop(10, 10, 'seed_turnip');

    expect(planted).toBe(true);
    expect(gameState.data.crops.length).toBe(1);
    expect(gameState.data.crops[0].cropId).toBe('turnip');
    expect(gameState.data.crops[0].currentStage).toBe(0);

    const afterSeeds = gameState.data.inventory.find((s) => s.item?.id === 'seed_turnip')!.quantity;
    expect(afterSeeds).toBe(initialSeeds - 1);
  });

  it('should not allow planting seeds on untilled soil', () => {
    const planted = gameState.plantCrop(15, 15, 'seed_turnip');
    expect(planted).toBe(false);
    expect(gameState.data.crops.length).toBe(0);
  });

  it('should water crops and mark soil as watered', () => {
    gameState.tillSoil(10, 10);
    gameState.plantCrop(10, 10, 'seed_turnip');

    const watered = gameState.waterCrop(10, 10);
    expect(watered).toBe(true);
    expect(gameState.data.farmTiles['10,10'].watered).toBe(true);
    expect(gameState.data.crops[0].isWatered).toBe(true);
  });

  it('should advance crop stages upon sleeping when watered', () => {
    gameState.tillSoil(10, 10);
    gameState.plantCrop(10, 10, 'seed_turnip'); // Turnip matures in 3 days
    gameState.waterCrop(10, 10);

    // Day 1 -> Day 2
    gameState.sleepAndPassDay();
    expect(gameState.data.crops[0].daysPlanted).toBe(1);
    expect(gameState.data.crops[0].currentStage).toBe(1);

    // Water and sleep Day 2 -> Day 3
    gameState.waterCrop(10, 10);
    gameState.sleepAndPassDay();
    expect(gameState.data.crops[0].daysPlanted).toBe(2);
    expect(gameState.data.crops[0].currentStage).toBe(2);

    // Water and sleep Day 3 -> Day 4 (Maturity!)
    gameState.waterCrop(10, 10);
    gameState.sleepAndPassDay();
    expect(gameState.data.crops[0].daysPlanted).toBe(3);
    expect(gameState.data.crops[0].currentStage).toBe(3);
    expect(gameState.data.crops[0].isHarvestable).toBe(true);
  });

  it('should harvest ripe crops into backpack inventory and clear tile', () => {
    gameState.tillSoil(10, 10);
    gameState.plantCrop(10, 10, 'seed_turnip');

    // Fast-forward maturity
    gameState.data.crops[0].currentStage = 3;
    gameState.data.crops[0].isHarvestable = true;

    const harvested = gameState.harvestCrop(10, 10);
    expect(harvested).toBe(true);
    expect(gameState.data.crops.length).toBe(0); // non-regrowing turnip is removed

    const cropInBag = gameState.data.inventory.find((s) => s.item?.id === 'crop_turnip');
    expect(cropInBag).toBeDefined();
    expect(cropInBag!.quantity).toBeGreaterThanOrEqual(1);
    expect(gameState.data.statistics.cropsHarvested).toBe(1);
  });
});
