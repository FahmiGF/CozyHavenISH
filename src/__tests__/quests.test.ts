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

describe('CozyHaven Quest Engine', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('QuestAdventurer');
  });

  it('should track NPC talk objectives and complete quest_welcome', () => {
    const welcomeQuest = gameState.data.quests.find((q) => q.id === 'quest_welcome')!;
    expect(welcomeQuest.isCompleted).toBe(false);

    // Talk to Maple
    gameState.talkToNPC('maple');
    const mapleObj = welcomeQuest.objectives.find((o) => o.targetId === 'maple')!;
    expect(mapleObj.currentCount).toBe(1);

    // Talk to Milo
    gameState.talkToNPC('milo');
    const miloObj = welcomeQuest.objectives.find((o) => o.targetId === 'milo')!;
    expect(miloObj.currentCount).toBe(1);

    expect(welcomeQuest.isCompleted).toBe(true);
    expect(welcomeQuest.isRewardClaimed).toBe(false);
  });

  it('should claim quest rewards once and prevent double-claim', () => {
    const welcomeQuest = gameState.data.quests.find((q) => q.id === 'quest_welcome')!;
    gameState.talkToNPC('maple');
    gameState.talkToNPC('milo');

    expect(welcomeQuest.isCompleted).toBe(true);

    const initialCoins = gameState.data.player.coins;
    const claimed = gameState.claimQuestReward('quest_welcome');

    expect(claimed).toBe(true);
    expect(welcomeQuest.isRewardClaimed).toBe(true);
    expect(gameState.data.player.coins).toBe(initialCoins + welcomeQuest.rewards.coins);

    // Second claim should be rejected
    const secondClaim = gameState.claimQuestReward('quest_welcome');
    expect(secondClaim).toBe(false);
  });
});
