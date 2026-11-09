import { InventorySlot } from './items';
import { PlantedCrop, Season } from './crops';
import { NPCState } from './npcs';
import { QuestDefinition } from './quests';
import { PlacedFurniture } from './furniture';
import { FarmAnimal } from './animals';

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'foggy';

export type MapId =
  | 'farm'
  | 'village'
  | 'house'
  | 'beach'
  | 'forest'
  | 'mine'
  | 'summit'
  | 'desert'
  | 'orchard';

export type GameViewMode = '2d' | '3d-iso' | '3d-topdown';

export interface TutorialStage {
  id: number;
  title: string;
  instruction: string;
  hint: string;
  targetAction: 'move' | 'talk' | 'till' | 'plant' | 'water' | 'explore' | 'mine' | 'complete';
  targetCount: number;
  rewardCoins: number;
  rewardItem?: { itemId: string; quantity: number };
}

export interface TutorialProgress {
  currentStage: number; // 1 to 8
  isCompleted: boolean;
  stageProgress: number;
  dismissed: boolean;
}

export interface PlayerCustomization {
  name: string;
  pronoun: string;
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
}

export interface GameTime {
  minute: number; // 0, 10, 20, 30, 40, 50
  hour: number; // 6 to 26 (26 = 2:00 AM next day)
  day: number; // 1 to 28
  season: Season;
  year: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface ShippedItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  quality?: 'normal' | 'silver' | 'gold' | 'iridium';
}

export interface DayEarningsReport {
  day: number;
  season: Season;
  items: ShippedItem[];
  totalEarnings: number;
}

export interface FarmTileState {
  tilled: boolean;
  watered: boolean;
  tilledDay?: number;
}

export interface GameSaveData {
  schemaVersion: number;
  saveSlotId: number;
  saveName: string;
  timestamp: number;
  playtimeSeconds: number;
  player: {
    customization: PlayerCustomization;
    coins: number;
    energy: number;
    maxEnergy: number;
    x: number;
    y: number;
    activeMap: MapId;
  };
  time: GameTime;
  weather: WeatherType;
  inventory: InventorySlot[];
  hotbarSelectedIndex: number;
  farmTiles: Record<string, FarmTileState>; // key: "x,y"
  crops: PlantedCrop[];
  npcs: Record<string, NPCState>;
  quests: QuestDefinition[];
  furniture: PlacedFurniture[];
  animals: FarmAnimal[];
  museumDonations: string[]; // itemIds
  shippingBin: ShippedItem[];
  lastEarningsReport: DayEarningsReport | null;
  tutorial?: TutorialProgress;
  achievements?: Record<string, number>; // achievementId -> timestamp unlocked
  graphicsQuality?: 'high' | 'medium' | 'low';
  statistics: {
    cropsHarvested: number;
    fishCaught: number;
    bugsCaught: number;
    oresMined?: number;
    coinsEarnedTotal: number;
    daysPlayed: number;
  };
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  category: 'farming' | 'exploration' | 'social' | 'crafting' | 'mastery';
}

export const ACHIEVEMENTS_LIST: AchievementDefinition[] = [
  {
    id: 'first_step',
    title: 'First Footsteps',
    description: 'Begin your journey across the CozyHaven archipelago.',
    icon: '👣',
    rewardCoins: 50,
    category: 'exploration',
  },
  {
    id: 'green_thumb',
    title: 'Green Thumb',
    description: 'Harvest your very first mature crop on the farm.',
    icon: '🌱',
    rewardCoins: 100,
    category: 'farming',
  },
  {
    id: 'bountiful_harvest',
    title: 'Bountiful Harvest',
    description: 'Harvest 20 crops across the seasons.',
    icon: '🌾',
    rewardCoins: 250,
    category: 'farming',
  },
  {
    id: 'deep_delver',
    title: 'Deep Delver',
    description: 'Mine 10 rocks, ores, or gemstone crystal veins.',
    icon: '⛏️',
    rewardCoins: 150,
    category: 'crafting',
  },
  {
    id: 'first_catch',
    title: 'Patient Angler',
    description: 'Reel in your first fish from island waterways.',
    icon: '🐟',
    rewardCoins: 100,
    category: 'crafting',
  },
  {
    id: 'master_chef',
    title: 'Culinary Artisan',
    description: 'Prepare your first homemade recipe in the cottage kitchen.',
    icon: '🍳',
    rewardCoins: 120,
    category: 'crafting',
  },
  {
    id: 'island_voyager',
    title: 'Island Voyager',
    description: 'Explore all 8 island territories of the archipelago.',
    icon: '🧭',
    rewardCoins: 300,
    category: 'exploration',
  },
  {
    id: 'social_butterfly',
    title: 'Island Friend',
    description: 'Engage in conversation with all 12 unique island villagers.',
    icon: '💬',
    rewardCoins: 250,
    category: 'social',
  },
  {
    id: 'master_of_dimensions',
    title: 'Dimension Shifter',
    description: 'Switch perspective to 3D Low-Poly or Top-Down camera mode.',
    icon: '📦',
    rewardCoins: 100,
    category: 'mastery',
  },
  {
    id: 'archipelago_legend',
    title: 'Archipelago Legend',
    description: 'Attain true harmony across all island chapters.',
    icon: '🌟',
    rewardCoins: 500,
    category: 'mastery',
  },
];
