import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';

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

describe('CozyHaven Inventory Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('InvTester');
  });

  it('should stack items up to maxStack limit', () => {
    // Empty inventory first for pure test
    gameState.data.inventory.forEach((s) => {
      s.item = null;
      s.quantity = 0;
    });

    gameState.addItem('mat_wood', 50);
    expect(gameState.data.inventory[0].item?.id).toBe('mat_wood');
    expect(gameState.data.inventory[0].quantity).toBe(50);

    // Add 25 more wood
    gameState.addItem('mat_wood', 25);
    expect(gameState.data.inventory[0].quantity).toBe(75);
  });

  it('should separate items with different quality tiers into separate slots', () => {
    gameState.data.inventory.forEach((s) => {
      s.item = null;
      s.quantity = 0;
    });

    gameState.addItem('crop_carrot', 1, 'normal');
    gameState.addItem('crop_carrot', 1, 'gold');

    expect(gameState.data.inventory[0].item?.id).toBe('crop_carrot');
    expect(gameState.data.inventory[0].quality).toBe('normal');

    expect(gameState.data.inventory[1].item?.id).toBe('crop_carrot');
    expect(gameState.data.inventory[1].quality).toBe('gold');
  });

  it('should swap slots correctly', () => {
    const slot0Item = gameState.data.inventory[0].item?.id;
    const slot1Item = gameState.data.inventory[1].item?.id;

    gameState.swapInventorySlots(0, 1);

    expect(gameState.data.inventory[0].item?.id).toBe(slot1Item);
    expect(gameState.data.inventory[1].item?.id).toBe(slot0Item);
  });

  it('should select active hotbar slot index (0..8)', () => {
    gameState.setHotbarSelectedIndex(3);
    expect(gameState.data.hotbarSelectedIndex).toBe(3);
    const selected = gameState.getSelectedHotbarSlot();
    expect(selected?.slotIndex).toBe(3);
  });
});
