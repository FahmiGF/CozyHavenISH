import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from '../domain/GameState';
import { COOKING_RECIPES } from '../types/cooking';

describe('Animal Husbandry and Kitchen Cooking', () => {
  beforeEach(() => {
    gameState.resetToNewGame('TestFarmer');
  });

  it('should initialize farm with chickens and cows', () => {
    const animals = gameState.getAnimals();
    expect(animals.length).toBeGreaterThanOrEqual(3);

    const chicken = animals.find((a) => a.type === 'chicken');
    expect(chicken).toBeDefined();
    expect(chicken?.productItemId).toBe('item_egg');

    const cow = animals.find((a) => a.type === 'cow');
    expect(cow).toBeDefined();
    expect(cow?.productItemId).toBe('item_milk');
  });

  it('should allow petting animals to increase friendship', () => {
    const animals = gameState.getAnimals();
    const initialFriendship = animals[0].friendship;

    const success = gameState.petAnimal(animals[0].id);
    expect(success).toBe(true);
    expect(animals[0].petToday).toBe(true);
    expect(animals[0].friendship).toBe(initialFriendship + 25);

    // Second pet on same day should return false
    const secondPet = gameState.petAnimal(animals[0].id);
    expect(secondPet).toBe(false);
  });

  it('should allow collecting animal products into inventory', () => {
    const animals = gameState.getAnimals();
    const chicken = animals.find((a) => a.type === 'chicken')!;
    chicken.hasProduct = true;

    const success = gameState.collectAnimalProduct(chicken.id);
    expect(success).toBe(true);
    expect(chicken.hasProduct).toBe(false);

    const eggSlot = gameState.data.inventory.find(
      (s) => s.item && s.item.id === 'item_egg'
    );
    expect(eggSlot).toBeDefined();
    expect(eggSlot?.quantity).toBe(1);
  });

  it('should cook delicious dishes when required ingredients are in inventory', () => {
    // Add ingredients for omelet: 1x egg, 1x tomato
    gameState.addItem('item_egg', 1);
    gameState.addItem('crop_tomato', 1);

    const initialEggs = gameState.data.inventory.find((s) => s.item?.id === 'item_egg')?.quantity || 0;
    expect(initialEggs).toBeGreaterThanOrEqual(1);

    const recipe = COOKING_RECIPES.find((r) => r.id === 'recipe_omelet')!;
    const cooked = gameState.cookRecipe(recipe.id);
    expect(cooked).toBe(true);

    // Check omelet exists in inventory
    const omeletSlot = gameState.data.inventory.find((s) => s.item?.id === 'food_omelet');
    expect(omeletSlot).toBeDefined();
    expect(omeletSlot?.quantity).toBe(1);
  });

  it('should prevent cooking if ingredients are missing', () => {
    // Ensure no eggs in inventory
    gameState.data.inventory.forEach((s) => {
      if (s.item?.id === 'item_egg' || s.item?.id === 'crop_tomato') {
        s.item = null;
        s.quantity = 0;
      }
    });

    const cooked = gameState.cookRecipe('recipe_omelet');
    expect(cooked).toBe(false);
  });
});
