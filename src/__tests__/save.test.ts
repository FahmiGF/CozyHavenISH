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

describe('CozyHaven Save System & Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('SaveTester');
  });

  it('should save and load across different save slots', () => {
    gameState.data.player.coins = 9999;
    const saved = gameState.saveGame(2);
    expect(saved).toBe(true);

    // Reset game state
    gameState.resetToNewGame('AnotherPlayer');
    expect(gameState.data.player.coins).toBe(400);

    // Load slot 2
    const loaded = gameState.loadGame(2);
    expect(loaded).toBe(true);
    expect(gameState.data.player.coins).toBe(9999);
    expect(gameState.data.saveSlotId).toBe(2);
  });

  it('should export and import save data as JSON correctly', () => {
    gameState.data.player.coins = 7777;
    const jsonStr = gameState.exportSaveJson();
    expect(jsonStr).toContain('7777');

    gameState.resetToNewGame('FreshPlayer');
    expect(gameState.data.player.coins).toBe(400);

    const imported = gameState.importSaveJson(jsonStr);
    expect(imported).toBe(true);
    expect(gameState.data.player.coins).toBe(7777);
  });
});
