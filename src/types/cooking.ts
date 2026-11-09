export interface CookingIngredient {
  itemId: string;
  quantity: number;
}

export interface RecipeDefinition {
  id: string;
  name: string;
  resultItemId: string;
  description: string;
  energyRestored: number;
  ingredients: CookingIngredient[];
  icon: string;
}

export const COOKING_RECIPES: RecipeDefinition[] = [
  {
    id: 'recipe_omelet',
    name: 'Golden Farm Omelet',
    resultItemId: 'food_omelet',
    description: 'Fluffy country omelet folded with farm eggs and fresh garden veggies.',
    energyRestored: 55,
    ingredients: [
      { itemId: 'item_egg', quantity: 1 },
      { itemId: 'crop_tomato', quantity: 1 },
    ],
    icon: '🍳',
  },
  {
    id: 'recipe_pancake',
    name: 'Fluffy Berry Pancakes',
    resultItemId: 'food_pancake',
    description: 'Stack of warm buttermilk pancakes made with fresh eggs, milk, and sweet strawberries.',
    energyRestored: 75,
    ingredients: [
      { itemId: 'item_egg', quantity: 1 },
      { itemId: 'item_milk', quantity: 1 },
      { itemId: 'crop_strawberry', quantity: 1 },
    ],
    icon: '🥞',
  },
  {
    id: 'recipe_soup',
    name: 'Hearty Harvest Stew',
    resultItemId: 'food_soup',
    description: 'Rich, slow-simmered farm stew made with garden potato, carrot, and tomato.',
    energyRestored: 100,
    ingredients: [
      { itemId: 'crop_potato', quantity: 1 },
      { itemId: 'crop_carrot', quantity: 1 },
      { itemId: 'crop_tomato', quantity: 1 },
    ],
    icon: '🍲',
  },
  {
    id: 'recipe_salad',
    name: 'Harvest Garden Salad',
    resultItemId: 'food_salad',
    description: 'Crisp mix of garden carrot and tomato tossed with fresh greens.',
    energyRestored: 45,
    ingredients: [
      { itemId: 'crop_carrot', quantity: 1 },
      { itemId: 'crop_tomato', quantity: 1 },
    ],
    icon: '🥗',
  },
  {
    id: 'recipe_cider',
    name: 'Sparkling Apple Cider',
    resultItemId: 'artisan_cider',
    description: 'Freshly pressed Honeycrisp apples infused with wild honey and bubbling crispness.',
    energyRestored: 85,
    ingredients: [
      { itemId: 'crop_apple', quantity: 2 },
      { itemId: 'crop_honey', quantity: 1 },
    ],
    icon: '🍾',
  },
  {
    id: 'recipe_honey_tea',
    name: 'Calming Honey Herb Tea',
    resultItemId: 'artisan_honey_tea',
    description: 'Fragrant steeped tea sweetened with golden wild honey.',
    energyRestored: 65,
    ingredients: [
      { itemId: 'crop_honey', quantity: 1 },
      { itemId: 'forage_wildberry', quantity: 1 },
    ],
    icon: '🍵',
  },
  {
    id: 'recipe_glazed_salmon',
    name: 'Honey Glazed Moonlight Salmon',
    resultItemId: 'dish_glazed_salmon',
    description: 'Rare moonlight salmon roasted with golden honey glaze and fragrant forest herbs.',
    energyRestored: 100,
    ingredients: [
      { itemId: 'fish_moonlight_salmon', quantity: 1 },
      { itemId: 'crop_honey', quantity: 1 },
      { itemId: 'crop_corn', quantity: 1 },
    ],
    icon: '🐟',
  },
  {
    id: 'recipe_peach_tart',
    name: 'Golden Peach Blossom Tart',
    resultItemId: 'dish_peach_tart',
    description: 'Delicious bakery pastry made with fresh orchard peaches, milk, and eggs.',
    energyRestored: 75,
    ingredients: [
      { itemId: 'crop_peach', quantity: 2 },
      { itemId: 'item_egg', quantity: 1 },
      { itemId: 'item_milk', quantity: 1 },
    ],
    icon: '🥧',
  },
];
