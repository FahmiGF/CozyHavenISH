import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { NPCS_DATABASE } from '../types/npcs';

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

describe('CozyHaven NPC & Social System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('SocialPlayer');
  });

  it('should increase friendship points by 20 upon first daily conversation', () => {
    const initialPoints = gameState.data.npcs['milo'].friendshipPoints; // starts at 100
    expect(gameState.data.npcs['milo'].talkedToday).toBe(false);

    gameState.talkToNPC('milo');

    expect(gameState.data.npcs['milo'].talkedToday).toBe(true);
    expect(gameState.data.npcs['milo'].friendshipPoints).toBe(initialPoints + 20);

    // Talking second time on the same day should not award bonus points again
    gameState.talkToNPC('milo');
    expect(gameState.data.npcs['milo'].friendshipPoints).toBe(initialPoints + 20);
  });

  it('should give loved gift bonus (+80 points) to NPC', () => {
    const miloDef = NPCS_DATABASE['milo'];
    const lovedItemId = miloDef.lovedItems[0]; // 'crop_turnip'
    gameState.addItem(lovedItemId, 1);

    const slotIdx = gameState.data.inventory.findIndex((s) => s.item?.id === lovedItemId);
    const initialPoints = gameState.data.npcs['milo'].friendshipPoints;

    const gifted = gameState.giftNPC('milo', slotIdx);
    expect(gifted).toBe(true);
    expect(gameState.data.npcs['milo'].giftedToday).toBe(true);
    expect(gameState.data.npcs['milo'].friendshipPoints).toBe(initialPoints + 80);
  });

  it('should reject a second gift on the same day', () => {
    const miloDef = NPCS_DATABASE['milo'];
    const lovedItemId = miloDef.lovedItems[0];
    gameState.addItem(lovedItemId, 2);

    const slotIdx = gameState.data.inventory.findIndex((s) => s.item?.id === lovedItemId);
    gameState.giftNPC('milo', slotIdx);

    // Second gift attempt
    const secondGift = gameState.giftNPC('milo', slotIdx);
    expect(secondGift).toBe(false);
  });

  it('should reset daily conversation and gift flags upon sleeping', () => {
    gameState.talkToNPC('luna');
    expect(gameState.data.npcs['luna'].talkedToday).toBe(true);

    gameState.sleepAndPassDay();

    expect(gameState.data.npcs['luna'].talkedToday).toBe(false);
    expect(gameState.data.npcs['luna'].giftedToday).toBe(false);
  });
});
