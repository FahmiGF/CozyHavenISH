import { InventorySlot } from './items';
import { PlantedCrop, Season } from './crops';
import { NPCState } from './npcs';
import { QuestDefinition } from './quests';
import { PlacedFurniture } from './furniture';
import { FarmAnimal } from './animals';

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'foggy';

export type MapId = 'farm' | 'village' | 'house' | 'beach' | 'forest' | 'mine';

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
  statistics: {
    cropsHarvested: number;
    fishCaught: number;
    bugsCaught: number;
    oresMined?: number;
    coinsEarnedTotal: number;
    daysPlayed: number;
  };
}
