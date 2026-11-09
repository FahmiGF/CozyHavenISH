export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CropDefinition {
  id: string;
  seedItemId: string;
  harvestItemId: string;
  name: string;
  growthDays: number; // total days to maturity
  stages: number; // number of stages, e.g. 4 (0: seed, 1: sprout, 2: growing, 3: mature)
  seasons: Season[];
  regrows: boolean;
  regrowDays?: number;
  baseYield: number;
  color: string;
}

export interface PlantedCrop {
  id: string;
  tileX: number;
  tileY: number;
  cropId: string;
  currentStage: number;
  daysPlanted: number;
  isWatered: boolean;
  isHarvestable: boolean;
  quality: 'normal' | 'silver' | 'gold' | 'iridium';
}

export const CROPS_DATABASE: Record<string, CropDefinition> = {
  turnip: {
    id: 'turnip',
    seedItemId: 'seed_turnip',
    harvestItemId: 'crop_turnip',
    name: 'Turnip',
    growthDays: 3,
    stages: 4,
    seasons: ['spring', 'autumn'],
    regrows: false,
    baseYield: 1,
    color: '#e2e8f0',
  },
  carrot: {
    id: 'carrot',
    seedItemId: 'seed_carrot',
    harvestItemId: 'crop_carrot',
    name: 'Carrot',
    growthDays: 4,
    stages: 4,
    seasons: ['spring', 'autumn'],
    regrows: false,
    baseYield: 1,
    color: '#f97316',
  },
  potato: {
    id: 'potato',
    seedItemId: 'seed_potato',
    harvestItemId: 'crop_potato',
    name: 'Potato',
    growthDays: 5,
    stages: 4,
    seasons: ['spring'],
    regrows: false,
    baseYield: 2,
    color: '#ca8a04',
  },
  tomato: {
    id: 'tomato',
    seedItemId: 'seed_tomato',
    harvestItemId: 'crop_tomato',
    name: 'Tomato',
    growthDays: 6,
    stages: 4,
    seasons: ['summer'],
    regrows: true,
    regrowDays: 2,
    baseYield: 1,
    color: '#ef4444',
  },
  strawberry: {
    id: 'strawberry',
    seedItemId: 'seed_strawberry',
    harvestItemId: 'crop_strawberry',
    name: 'Strawberry',
    growthDays: 7,
    stages: 4,
    seasons: ['spring'],
    regrows: true,
    regrowDays: 3,
    baseYield: 1,
    color: '#ec4899',
  },
  pumpkin: {
    id: 'pumpkin',
    seedItemId: 'seed_pumpkin',
    harvestItemId: 'crop_pumpkin',
    name: 'Pumpkin',
    growthDays: 10,
    stages: 4,
    seasons: ['autumn'],
    regrows: false,
    baseYield: 1,
    color: '#ea580c',
  },
  sunflower: {
    id: 'sunflower',
    seedItemId: 'seed_sunflower',
    harvestItemId: 'crop_sunflower',
    name: 'Sunflower',
    growthDays: 7,
    stages: 4,
    seasons: ['summer', 'autumn'],
    regrows: false,
    baseYield: 1,
    color: '#eab308',
  },
  bluerose: {
    id: 'bluerose',
    seedItemId: 'seed_bluerose',
    harvestItemId: 'crop_bluerose',
    name: 'Blue Rose',
    growthDays: 9,
    stages: 4,
    seasons: ['spring', 'summer', 'autumn'],
    regrows: false,
    baseYield: 1,
    color: '#3b82f6',
  },
};
