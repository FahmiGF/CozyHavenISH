import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { NPCS_DATABASE } from '../types/npcs';
import { NPC_VOICE_PROFILES } from '../domain/VoiceAI';
import { CROPS_DATABASE } from '../types/crops';
import { ITEMS_DATABASE } from '../types/items';
import { COOKING_RECIPES } from '../types/cooking';
import { MapId } from '../types/game';

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

describe('Expanded Zones, 12 NPCs, Crops, Cooking & Storyline Quests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    gameState.resetToNewGame('GrandAdventurer');
  });

  it('should initialize and support all 8 island zones', () => {
    const expectedZones: MapId[] = [
      'farm',
      'village',
      'beach',
      'forest',
      'mine',
      'summit',
      'desert',
      'orchard',
    ];

    expectedZones.forEach((zone) => {
      gameState.data.player.activeMap = zone;
      expect(gameState.data.player.activeMap).toBe(zone);
    });
  });

  it('should verify all 12 NPCs have valid definitions, schedules and voice profiles', () => {
    const npcIds = [
      'milo',
      'luna',
      'oliver',
      'poppy',
      'theo',
      'maple',
      'nori',
      'kai',
      'selene',
      'cedric',
      'ember',
      'aiden',
    ];

    expect(Object.keys(NPCS_DATABASE).length).toBe(12);

    npcIds.forEach((id) => {
      const npc = NPCS_DATABASE[id];
      expect(npc).toBeDefined();
      expect(npc.name).toBeTruthy();
      expect(npc.title).toBeTruthy();
      expect(npc.schedule.length).toBeGreaterThan(0);
      expect(npc.dialogues.length).toBeGreaterThan(0);

      // Voice AI Profile
      const voice = NPC_VOICE_PROFILES[id];
      expect(voice).toBeDefined();
      expect(voice.catchphrasePool.morning.length).toBeGreaterThan(0);
      expect(voice.catchphrasePool.afternoon.length).toBeGreaterThan(0);
    });
  });

  it('should verify new crops and their seed-to-harvest links', () => {
    const newCropKeys = ['melon', 'corn', 'eggplant'];

    newCropKeys.forEach((key) => {
      const crop = CROPS_DATABASE[key];
      expect(crop).toBeDefined();
      expect(crop.stages).toBe(4);

      // Seed item
      const seedItem = ITEMS_DATABASE[crop.seedItemId];
      expect(seedItem).toBeDefined();
      expect(seedItem.category).toBe('seed');

      // Harvest item
      const harvestItem = ITEMS_DATABASE[crop.harvestItemId];
      expect(harvestItem).toBeDefined();
      expect(harvestItem.category).toBe('crop');
      expect(harvestItem.sellPrice).toBeGreaterThan(0);
    });
  });

  it('should verify new cooking recipes have registered ingredients and produce dishes', () => {
    const newRecipeIds = [
      'recipe_cider',
      'recipe_honey_tea',
      'recipe_glazed_salmon',
      'recipe_peach_tart',
    ];

    newRecipeIds.forEach((id) => {
      const recipe = COOKING_RECIPES.find((r) => r.id === id);
      expect(recipe).toBeDefined();
      expect(recipe!.energyRestored).toBeGreaterThan(50);
      expect(ITEMS_DATABASE[recipe!.resultItemId]).toBeDefined();

      recipe!.ingredients.forEach((ing) => {
        expect(ITEMS_DATABASE[ing.itemId]).toBeDefined();
      });
    });
  });

  it('should support Chapter storyline quests (Chapters III through VI)', () => {
    const summitQuest = gameState.data.quests.find((q) => q.id === 'quest_story_summit');
    expect(summitQuest).toBeDefined();
    expect(summitQuest?.category).toBe('Island Storyline');

    const desertQuest = gameState.data.quests.find((q) => q.id === 'quest_story_desert');
    expect(desertQuest).toBeDefined();

    const orchardQuest = gameState.data.quests.find((q) => q.id === 'quest_story_orchard');
    expect(orchardQuest).toBeDefined();

    const harmonyQuest = gameState.data.quests.find((q) => q.id === 'quest_story_harmony');
    expect(harmonyQuest).toBeDefined();
    expect(harmonyQuest?.rewards.items?.some((i) => i.itemId === 'tool_golden_pickaxe')).toBe(true);
  });

  it('should track talk objectives for new NPCs like Kai and Selene', () => {
    const summitQuest = gameState.data.quests.find((q) => q.id === 'quest_story_summit')!;
    expect(summitQuest.isCompleted).toBe(false);

    gameState.talkToNPC('kai');
    const kaiObj = summitQuest.objectives.find((o) => o.targetId === 'kai')!;
    expect(kaiObj.currentCount).toBe(1);
  });
});
