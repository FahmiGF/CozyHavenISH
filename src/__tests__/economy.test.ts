import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { ITEMS_DATABASE } from '../types/items';

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

describe('CozyHaven Economy & Shipping System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('EconFarmer');
  });

  it('should purchase items from store and deduct coins', () => {
    const initialCoins = gameState.data.player.coins; // 400
    const turnipSeedDef = ITEMS_DATABASE['seed_turnip']; // 20 coins
    expect(turnipSeedDef.buyPrice).toBe(20);

    const bought = gameState.buyItem('seed_turnip', 5);
    expect(bought).toBe(true);
    expect(gameState.data.player.coins).toBe(initialCoins - 100);

    const seedSlot = gameState.data.inventory.find((s) => s.item?.id === 'seed_turnip');
    expect(seedSlot).toBeDefined();
    expect(seedSlot!.quantity).toBeGreaterThanOrEqual(5);
  });

  it('should refuse purchase if player lacks coins', () => {
    gameState.data.player.coins = 10;
    const bought = gameState.buyItem('furn_bed_pastel', 1); // 450 coins
    expect(bought).toBe(false);
    expect(gameState.data.player.coins).toBe(10);
  });

  it('should sell items immediately for coins with quality multiplier', () => {
    const initialCoins = gameState.data.player.coins;
    // Add gold quality crop: sellPrice 35 * 1.5 = 53 (rounded 53)
    gameState.addItem('crop_turnip', 1, 'gold');
    const slotIdx = gameState.data.inventory.findIndex(
      (s) => s.item?.id === 'crop_turnip' && s.quality === 'gold'
    );
    expect(slotIdx).toBeGreaterThanOrEqual(0);

    const sold = gameState.sellItem(slotIdx, 1);
    expect(sold).toBe(true);
    const expectedCoins = Math.round(35 * 1.5);
    expect(gameState.data.player.coins).toBe(initialCoins + expectedCoins);
  });

  it('should deposit items to shipping bin and award earnings after overnight sleep', () => {
    const initialCoins = gameState.data.player.coins;
    gameState.addItem('crop_potato', 3, 'normal'); // 65 coins each = 195
    const slotIdx = gameState.data.inventory.findIndex((s) => s.item?.id === 'crop_potato');

    const deposited = gameState.depositShippingBin(slotIdx, 3);
    expect(deposited).toBe(true);
    expect(gameState.data.shippingBin.length).toBe(1);
    expect(gameState.data.shippingBin[0].totalPrice).toBe(195);

    // Coins shouldn't change immediately before sleeping
    expect(gameState.data.player.coins).toBe(initialCoins);

    // Sleep overnight
    gameState.sleepAndPassDay();

    // Shipping bin cleared and coins credited
    expect(gameState.data.shippingBin.length).toBe(0);
    expect(gameState.data.player.coins).toBe(initialCoins + 195);
    expect(gameState.data.lastEarningsReport).toBeDefined();
    expect(gameState.data.lastEarningsReport?.totalEarnings).toBe(195);
  });
});
