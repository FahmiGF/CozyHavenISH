export type QuestType = 'main' | 'daily' | 'friendship';

export type QuestObjectiveType =
  | 'talk_to_npc'
  | 'till_soil'
  | 'plant_seed'
  | 'water_crop'
  | 'harvest_crop'
  | 'pet_animal'
  | 'collect_product'
  | 'cook_dish'
  | 'buy_item'
  | 'catch_fish'
  | 'catch_bug'
  | 'place_furniture'
  | 'visit_map';

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  targetId?: string; // npcId, itemId, or mapId
  targetCount: number;
  currentCount: number;
  description: string;
}

export interface QuestReward {
  coins: number;
  items?: { itemId: string; quantity: number }[];
  friendship?: { npcId: string; points: number }[];
  recipeUnlock?: string;
}

export interface QuestDefinition {
  id: string;
  title: string;
  type: QuestType;
  category: string;
  description: string;
  giverName: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  isCompleted: boolean;
  isRewardClaimed: boolean;
}

export const INITIAL_QUESTS: QuestDefinition[] = [
  {
    id: 'quest_welcome',
    title: 'Welcome to CozyHaven',
    type: 'main',
    category: 'Village Introduction',
    description: 'Get acquainted with your new peaceful island home. Say hello to Maple at the General Store and Milo at the farm orchard.',
    giverName: 'Village Council',
    objectives: [
      {
        id: 'obj_talk_maple',
        type: 'talk_to_npc',
        targetId: 'maple',
        targetCount: 1,
        currentCount: 0,
        description: 'Talk with Maple at the General Store',
      },
      {
        id: 'obj_talk_milo',
        type: 'talk_to_npc',
        targetId: 'milo',
        targetCount: 1,
        currentCount: 0,
        description: 'Talk with Milo the farmer',
      },
    ],
    rewards: {
      coins: 150,
      items: [
        { itemId: 'seed_turnip', quantity: 5 },
        { itemId: 'seed_carrot', quantity: 3 },
      ],
      friendship: [
        { npcId: 'maple', points: 50 },
        { npcId: 'milo', points: 50 },
      ],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_first_sprout',
    title: 'First Green Sprouts',
    type: 'main',
    category: 'Farming Basics',
    description: 'Till your field with the garden hoe, sow your seeds, and water them with your watering can.',
    giverName: 'Milo',
    objectives: [
      {
        id: 'obj_till',
        type: 'till_soil',
        targetCount: 3,
        currentCount: 0,
        description: 'Till 3 soil plots on your farm',
      },
      {
        id: 'obj_plant',
        type: 'plant_seed',
        targetCount: 3,
        currentCount: 0,
        description: 'Plant 3 seeds of any kind',
      },
      {
        id: 'obj_water',
        type: 'water_crop',
        targetCount: 3,
        currentCount: 0,
        description: 'Water 3 crops',
      },
    ],
    rewards: {
      coins: 200,
      items: [{ itemId: 'food_apple_pie', quantity: 1 }],
      friendship: [{ npcId: 'milo', points: 75 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_first_harvest',
    title: 'Golden Harvest',
    type: 'main',
    category: 'Farming Progression',
    description: 'Nurture your crops until they reach maturity, then harvest your very first farm produce!',
    giverName: 'Milo',
    objectives: [
      {
        id: 'obj_harvest',
        type: 'harvest_crop',
        targetCount: 2,
        currentCount: 0,
        description: 'Harvest 2 ripe crops',
      },
    ],
    rewards: {
      coins: 250,
      items: [{ itemId: 'seed_strawberry', quantity: 4 }],
      friendship: [{ npcId: 'milo', points: 100 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_cozy_cottage',
    title: 'Interior Decorator',
    type: 'main',
    category: 'Home & Living',
    description: 'Make your home cozy by entering your cottage and placing a piece of furniture.',
    giverName: 'Poppy',
    objectives: [
      {
        id: 'obj_place_furniture',
        type: 'place_furniture',
        targetCount: 1,
        currentCount: 0,
        description: 'Place 1 piece of furniture in your home or farm',
      },
    ],
    rewards: {
      coins: 180,
      items: [{ itemId: 'furn_plant_pot', quantity: 2 }],
      friendship: [{ npcId: 'poppy', points: 60 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_angler_journey',
    title: 'The Patient Angler',
    type: 'daily',
    category: 'Fishing & Wildlife',
    description: 'Head to Bluebell Beach or the village river and reel in a fresh fish.',
    giverName: 'Oliver',
    objectives: [
      {
        id: 'obj_catch_fish',
        type: 'catch_fish',
        targetCount: 1,
        currentCount: 0,
        description: 'Catch 1 fish from any water body',
      },
    ],
    rewards: {
      coins: 120,
      items: [{ itemId: 'forage_seashell', quantity: 2 }],
      friendship: [{ npcId: 'oliver', points: 50 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_farm_friends',
    title: 'Happy Animal Pasture',
    type: 'main',
    category: 'Animal Husbandry',
    description: 'Visit your pasture, pet your chickens and cows with love, and collect fresh farm eggs or milk.',
    giverName: 'Milo',
    objectives: [
      {
        id: 'obj_pet_animal',
        type: 'pet_animal',
        targetCount: 1,
        currentCount: 0,
        description: 'Pet Daisy, Pippin, or Buttercup',
      },
      {
        id: 'obj_collect_egg',
        type: 'collect_product',
        targetCount: 1,
        currentCount: 0,
        description: 'Collect fresh farm egg or creamy milk',
      },
    ],
    rewards: {
      coins: 220,
      items: [{ itemId: 'food_pancake', quantity: 1 }],
      friendship: [{ npcId: 'milo', points: 80 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
  {
    id: 'quest_master_chef',
    title: 'Cottage Chef',
    type: 'main',
    category: 'Cooking & Recipes',
    description: 'Step into your cottage kitchen stove and cook a warm, nutritious farm recipe!',
    giverName: 'Poppy',
    objectives: [
      {
        id: 'obj_cook_dish',
        type: 'cook_dish',
        targetCount: 1,
        currentCount: 0,
        description: 'Cook any dish at the kitchen stove',
      },
    ],
    rewards: {
      coins: 300,
      items: [{ itemId: 'food_soup', quantity: 2 }],
      friendship: [{ npcId: 'poppy', points: 100 }],
    },
    isCompleted: false,
    isRewardClaimed: false,
  },
];
