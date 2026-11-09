import { EventBus } from './EventBus';
import { sound } from './SoundSynth';
import {
  GameSaveData,
  GameTime,
  MapId,
  PlayerCustomization,
  ShippedItem,
  DayEarningsReport,
  WeatherType,
  FarmTileState,
  TutorialStage,
  TutorialProgress,
} from '../types/game';
import { InventorySlot, ITEMS_DATABASE, ItemDefinition } from '../types/items';
import { CROPS_DATABASE, PlantedCrop, Season } from '../types/crops';
import { NPCS_DATABASE, NPCState } from '../types/npcs';
import { INITIAL_QUESTS, QuestDefinition, QuestObjectiveType } from '../types/quests';
import { PlacedFurniture } from '../types/furniture';
import { FarmAnimal, INITIAL_FARM_ANIMALS } from '../types/animals';
import { COOKING_RECIPES, RecipeDefinition } from '../types/cooking';

export const TUTORIAL_STAGES: TutorialStage[] = [
  {
    id: 1,
    title: 'Welcome to CozyHaven!',
    instruction: 'Use WASD or Arrow Keys to walk around your home island.',
    hint: 'Stretch your legs by walking 15 paces.',
    targetAction: 'move',
    targetCount: 15,
    rewardCoins: 50,
  },
  {
    id: 2,
    title: 'Island Friendships',
    instruction: 'Walk east to the village or meet Milo on the farm. Press [E] to talk.',
    hint: 'Villagers have unique personalities and daily routines!',
    targetAction: 'talk',
    targetCount: 1,
    rewardCoins: 75,
    rewardItem: { itemId: 'seed_turnip', quantity: 4 },
  },
  {
    id: 3,
    title: 'Tilling the Soil',
    instruction: 'Select your Garden Hoe [1-9] and press Space on the dirt plot.',
    hint: 'Tilled soil creates furrowed ridges ready for planting.',
    targetAction: 'till',
    targetCount: 3,
    rewardCoins: 60,
  },
  {
    id: 4,
    title: 'Sowing Your Seeds',
    instruction: 'Equip Turnip Seeds from your hotbar and press Space on tilled soil.',
    hint: 'Turnips mature quickly in just 3 days!',
    targetAction: 'plant',
    targetCount: 3,
    rewardCoins: 60,
  },
  {
    id: 5,
    title: 'Watering Daily',
    instruction: 'Equip your Watering Can and water each newly planted seed.',
    hint: 'Crops must be watered every day to grow healthy and strong.',
    targetAction: 'water',
    targetCount: 3,
    rewardCoins: 75,
    rewardItem: { itemId: 'food_apple_pie', quantity: 1 },
  },
  {
    id: 6,
    title: 'Island Exploration',
    instruction: 'Travel beyond your farm! Walk North to Whispering Forest or East to Bluebell Beach.',
    hint: 'Step through zone borders to explore the connected world.',
    targetAction: 'explore',
    targetCount: 1,
    rewardCoins: 100,
  },
  {
    id: 7,
    title: 'Resource Gathering & Mining',
    instruction: 'Equip your Pickaxe and press Space to mine rocks or ore veins.',
    hint: 'Caverns and fields hold stone, iron, gold, and amethyst crystals!',
    targetAction: 'mine',
    targetCount: 2,
    rewardCoins: 120,
    rewardItem: { itemId: 'mat_wood', quantity: 5 },
  },
  {
    id: 8,
    title: 'Homestead Master',
    instruction: 'Congratulations! You have mastered the fundamentals of CozyHaven.',
    hint: 'Farm, fish, cook recipes, decorate your cottage, and make lifelong friends!',
    targetAction: 'complete',
    targetCount: 1,
    rewardCoins: 250,
  },
];

const SAVE_KEY_PREFIX = 'cozyhaven_save_slot_';
const INVENTORY_CAPACITY = 24;

export class GameStateManager {
  private static instance: GameStateManager;

  public data: GameSaveData;
  private timeTickInterval: any = null;
  private isPaused: boolean = false;

  private constructor() {
    this.data = this.createDefaultSaveData(1, 'Cozy Farmer');
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public init() {
    // Try loading slot 1, otherwise initialize fresh
    const loaded = this.loadGame(1);
    if (!loaded) {
      this.resetToNewGame();
    }
    this.startTimeLoop();
  }

  public createDefaultSaveData(slotId: number, playerName: string): GameSaveData {
    const initialInventory: InventorySlot[] = Array.from({ length: INVENTORY_CAPACITY }, (_, i) => ({
      slotIndex: i,
      item: null,
      quantity: 0,
    }));

    // Grant starter tools and seeds
    const starterItems: { id: string; qty: number }[] = [
      { id: 'tool_hoe', qty: 1 },
      { id: 'tool_can', qty: 1 },
      { id: 'tool_axe', qty: 1 },
      { id: 'tool_pickaxe', qty: 1 },
      { id: 'tool_rod', qty: 1 },
      { id: 'tool_net', qty: 1 },
      { id: 'seed_turnip', qty: 8 },
      { id: 'seed_carrot', qty: 5 },
      { id: 'seed_potato', qty: 4 },
      { id: 'furn_chair_wood', qty: 2 },
      { id: 'furn_table_wood', qty: 1 },
    ];

    starterItems.forEach((starter, index) => {
      const def = ITEMS_DATABASE[starter.id];
      if (def) {
        initialInventory[index] = {
          slotIndex: index,
          item: def,
          quantity: starter.qty,
        };
      }
    });

    const initialNPCs: Record<string, NPCState> = {};
    Object.values(NPCS_DATABASE).forEach((npc) => {
      initialNPCs[npc.id] = {
        id: npc.id,
        friendshipPoints: 100, // starting acquaintance
        talkedToday: false,
        giftedToday: false,
        currentMap: npc.schedule[0].mapId,
        x: npc.schedule[0].x,
        y: npc.schedule[0].y,
        currentActivity: npc.schedule[0].activity,
      };
    });

    return {
      schemaVersion: 1,
      saveSlotId: slotId,
      saveName: playerName,
      timestamp: Date.now(),
      playtimeSeconds: 0,
      player: {
        customization: {
          name: playerName,
          pronoun: 'They/Them',
          skinColor: '#fcd34d',
          hairStyle: 'cozy_tousled',
          hairColor: '#78350f',
          shirtColor: '#10b981',
          pantsColor: '#1e3a8a',
        },
        coins: 400,
        energy: 100,
        maxEnergy: 100,
        x: 400,
        y: 350,
        activeMap: 'farm',
      },
      time: {
        minute: 0,
        hour: 6,
        day: 1,
        season: 'spring',
        year: 1,
        timeOfDay: 'morning',
      },
      weather: 'sunny',
      inventory: initialInventory,
      hotbarSelectedIndex: 0,
      farmTiles: {},
      crops: [],
      npcs: initialNPCs,
      quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
      furniture: [
        {
          id: 'furn_bed_init',
          furnitureKey: 'bed_pastel',
          itemId: 'furn_bed_pastel',
          mapId: 'house',
          gridX: 2,
          gridY: 2,
          rotation: 0,
          width: 2,
          height: 2,
          placedAt: Date.now(),
        },
        {
          id: 'furn_shelf_init',
          furnitureKey: 'bookshelf_wood',
          itemId: 'furn_bookshelf',
          mapId: 'house',
          gridX: 5,
          gridY: 1,
          rotation: 0,
          width: 2,
          height: 2,
          placedAt: Date.now(),
        },
      ],
      animals: JSON.parse(JSON.stringify(INITIAL_FARM_ANIMALS)),
      museumDonations: [],
      shippingBin: [],
      lastEarningsReport: null,
      tutorial: {
        currentStage: 1,
        isCompleted: false,
        stageProgress: 0,
        dismissed: false,
      },
      statistics: {
        cropsHarvested: 0,
        fishCaught: 0,
        bugsCaught: 0,
        oresMined: 0,
        coinsEarnedTotal: 0,
        daysPlayed: 1,
      },
    };
  }

  public resetToNewGame(playerName: string = 'Alex', customization?: Partial<PlayerCustomization>) {
    this.data = this.createDefaultSaveData(1, playerName);
    if (customization) {
      this.data.player.customization = {
        ...this.data.player.customization,
        ...customization,
      };
    }
    this.saveGame(1);
    this.notifyAllState();
  }

  // --- TIME & WEATHER PROGRESSION ---
  public startTimeLoop() {
    if (this.timeTickInterval) clearInterval(this.timeTickInterval);
    // Every 5 seconds real-time = 10 minutes in-game
    this.timeTickInterval = setInterval(() => {
      if (this.isPaused) return;
      this.tickMinute(10);
      this.data.playtimeSeconds += 5;
    }, 5000);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public tickMinute(increment: number = 10) {
    const time = this.data.time;
    time.minute += increment;
    if (time.minute >= 60) {
      time.minute = 0;
      time.hour += 1;
    }

    // Determine time of day
    if (time.hour >= 6 && time.hour < 12) time.timeOfDay = 'morning';
    else if (time.hour >= 12 && time.hour < 17) time.timeOfDay = 'afternoon';
    else if (time.hour >= 17 && time.hour < 20) time.timeOfDay = 'evening';
    else time.timeOfDay = 'night';

    // Update NPC positions based on schedule
    this.updateNPCSchedules();

    // Past 2:00 AM (hour 26)? Player collapses from exhaustion and wakes at 6:00 AM!
    if (time.hour >= 26) {
      this.passToNextDay(true);
    }

    EventBus.emit('TIME_TICK', { ...this.data.time, weather: this.data.weather });
  }

  public sleepAndPassDay() {
    this.passToNextDay(false);
  }

  private passToNextDay(exhausted: boolean = false) {
    sound.playSfx('fanfare');
    const time = this.data.time;

    // 1. Process overnight shipping bin earnings
    let totalNightlyEarnings = 0;
    const shippedItems = [...this.data.shippingBin];
    shippedItems.forEach((item) => {
      totalNightlyEarnings += item.totalPrice;
    });

    if (totalNightlyEarnings > 0) {
      this.data.player.coins += totalNightlyEarnings;
      this.data.statistics.coinsEarnedTotal += totalNightlyEarnings;
      this.data.lastEarningsReport = {
        day: time.day,
        season: time.season,
        items: shippedItems,
        totalEarnings: totalNightlyEarnings,
      };
      this.data.shippingBin = [];
      EventBus.emit('OPEN_MODAL', 'shipping_report', this.data.lastEarningsReport);
    }

    // 2. Advance day & season
    time.day += 1;
    this.data.statistics.daysPlayed += 1;
    if (time.day > 28) {
      time.day = 1;
      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      const nextSeasonIdx = (seasons.indexOf(time.season) + 1) % seasons.length;
      time.season = seasons[nextSeasonIdx];
      if (nextSeasonIdx === 0) {
        time.year += 1;
      }
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'New Season!',
        message: `Welcome to the season of ${time.season.toUpperCase()} Year ${time.year}!`,
        icon: '🌺',
      });
    }

    time.hour = 6;
    time.minute = 0;
    time.timeOfDay = 'morning';

    // 3. Roll new weather
    this.data.weather = this.rollWeather(time.season);

    // 4. Restore Energy (100 if rested, 60 if exhausted)
    this.data.player.energy = exhausted ? 60 : 100;
    if (exhausted) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Exhausted!',
        message: 'You passed out late at night and woke up with less energy.',
        icon: '💤',
      });
    }

    // 5. Grow crops and process soil
    this.processCropsOvernight();

    // 6. Reset daily NPC interactions
    Object.values(this.data.npcs).forEach((npc) => {
      npc.talkedToday = false;
      npc.giftedToday = false;
    });

    // 7. Refresh Farm Animals
    if (this.data.animals) {
      this.data.animals.forEach((animal) => {
        animal.petToday = false;
        animal.hasProduct = true;
      });
      EventBus.emit('ANIMALS_UPDATED', this.data.animals);
    }

    // 8. Auto-save progress
    this.saveGame(this.data.saveSlotId);
    this.notifyAllState();

    EventBus.emit('SHOW_NOTIFICATION', {
      title: `Day ${time.day} ${time.season.toUpperCase()}`,
      message: `Rise and shine! The weather today is ${this.data.weather.toUpperCase()}.`,
      icon: '☀️',
    });
  }

  private rollWeather(season: Season): WeatherType {
    const rand = Math.random();
    if (season === 'spring') {
      return rand < 0.65 ? 'sunny' : rand < 0.85 ? 'rainy' : 'cloudy';
    } else if (season === 'summer') {
      return rand < 0.75 ? 'sunny' : rand < 0.9 ? 'cloudy' : 'rainy';
    } else if (season === 'autumn') {
      return rand < 0.5 ? 'sunny' : rand < 0.8 ? 'cloudy' : 'rainy';
    } else {
      return rand < 0.4 ? 'sunny' : rand < 0.7 ? 'foggy' : 'cloudy';
    }
  }

  private processCropsOvernight() {
    const isRainy = this.data.weather === 'rainy';

    // 1. Check sprinklers
    this.data.furniture
      .filter((f) => f.furnitureKey === 'sprinkler')
      .forEach((sprinkler) => {
        const adjacent = [
          { x: sprinkler.gridX + 1, y: sprinkler.gridY },
          { x: sprinkler.gridX - 1, y: sprinkler.gridY },
          { x: sprinkler.gridX, y: sprinkler.gridY + 1 },
          { x: sprinkler.gridX, y: sprinkler.gridY - 1 },
        ];
        adjacent.forEach((pos) => {
          const key = `${pos.x},${pos.y}`;
          if (this.data.farmTiles[key] && this.data.farmTiles[key].tilled) {
            this.data.farmTiles[key].watered = true;
          }
        });
      });

    // 2. Grow crops
    this.data.crops.forEach((crop) => {
      const tileKey = `${crop.tileX},${crop.tileY}`;
      const tile = this.data.farmTiles[tileKey];
      const wasWatered = (tile && tile.watered) || crop.isWatered || isRainy;

      if (wasWatered && !crop.isHarvestable) {
        crop.daysPlanted += 1;
        const cropDef = CROPS_DATABASE[crop.cropId];
        if (cropDef) {
          const daysPerStage = Math.max(1, Math.floor(cropDef.growthDays / (cropDef.stages - 1)));
          const targetStage = Math.min(cropDef.stages - 1, Math.floor(crop.daysPlanted / daysPerStage));
          crop.currentStage = targetStage;
          if (targetStage >= cropDef.stages - 1) {
            crop.isHarvestable = true;
          }
        }
      }

      // Soil dries up for next day unless rainy
      crop.isWatered = isRainy;
      if (tile) {
        tile.watered = isRainy;
      }
    });
  }

  private updateNPCSchedules() {
    const currentHour = this.data.time.hour;
    const currentMinute = this.data.time.minute;
    const currentTotalMins = currentHour * 60 + currentMinute;

    Object.values(NPCS_DATABASE).forEach((npcDef) => {
      const state = this.data.npcs[npcDef.id];
      if (!state) return;

      // Find current schedule waypoint
      let activeWaypoint = npcDef.schedule[0];
      for (const wp of npcDef.schedule) {
        const wpTotalMins = wp.hour * 60 + wp.minute;
        if (currentTotalMins >= wpTotalMins) {
          activeWaypoint = wp;
        }
      }

      state.currentMap = activeWaypoint.mapId;
      state.x = activeWaypoint.x;
      state.y = activeWaypoint.y;
      state.currentActivity = activeWaypoint.activity;
    });
  }

  // --- INVENTORY MANAGEMENT ---
  public getInventory(): InventorySlot[] {
    return this.data.inventory;
  }

  public getSelectedHotbarSlot(): InventorySlot | null {
    return this.data.inventory[this.data.hotbarSelectedIndex] || null;
  }

  public setHotbarSelectedIndex(index: number) {
    if (index >= 0 && index < 9) {
      this.data.hotbarSelectedIndex = index;
      sound.playSfx('click');
      EventBus.emit('ACTIVE_TOOL_CHANGED', index, this.getSelectedHotbarSlot()?.item || null);
    }
  }

  public addItem(itemId: string, quantity: number = 1, quality: 'normal' | 'silver' | 'gold' | 'iridium' = 'normal'): boolean {
    const itemDef = ITEMS_DATABASE[itemId];
    if (!itemDef) return false;

    let remaining = quantity;

    // 1. Fill existing stackable slots
    if (itemDef.stackable) {
      for (const slot of this.data.inventory) {
        if (slot.item && slot.item.id === itemId && (slot.quality || 'normal') === quality) {
          const space = itemDef.maxStack - slot.quantity;
          if (space > 0) {
            const add = Math.min(space, remaining);
            slot.quantity += add;
            remaining -= add;
            if (remaining <= 0) break;
          }
        }
      }
    }

    // 2. Fill empty slots
    if (remaining > 0) {
      for (const slot of this.data.inventory) {
        if (!slot.item) {
          const add = itemDef.stackable ? Math.min(itemDef.maxStack, remaining) : 1;
          slot.item = itemDef;
          slot.quantity = add;
          slot.quality = quality;
          remaining -= add;
          if (remaining <= 0) break;
        }
      }
    }

    if (remaining < quantity) {
      EventBus.emit('INVENTORY_UPDATED', this.data.inventory);
      return true;
    }
    return false;
  }

  public removeItem(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.data.inventory[slotIndex];
    if (!slot || !slot.item) return false;

    if (slot.quantity <= quantity) {
      slot.item = null;
      slot.quantity = 0;
      slot.quality = undefined;
    } else {
      slot.quantity -= quantity;
    }

    EventBus.emit('INVENTORY_UPDATED', this.data.inventory);
    return true;
  }

  public swapInventorySlots(sourceIdx: number, targetIdx: number) {
    if (sourceIdx < 0 || targetIdx < 0 || sourceIdx >= INVENTORY_CAPACITY || targetIdx >= INVENTORY_CAPACITY) return;
    const temp = { ...this.data.inventory[sourceIdx] };
    this.data.inventory[sourceIdx] = {
      ...this.data.inventory[targetIdx],
      slotIndex: sourceIdx,
    };
    this.data.inventory[targetIdx] = {
      ...temp,
      slotIndex: targetIdx,
    };
    sound.playSfx('click');
    EventBus.emit('INVENTORY_UPDATED', this.data.inventory);
  }

  // --- FARMING ACTIONS ---
  public tillSoil(tileX: number, tileY: number): boolean {
    if (this.data.player.energy < 2) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Tired', message: 'Not enough energy to till soil!', icon: '⚡' });
      return false;
    }

    const key = `${tileX},${tileY}`;
    this.data.farmTiles[key] = {
      tilled: true,
      watered: false,
      tilledDay: this.data.time.day,
    };
    this.data.player.energy -= 2;
    sound.playSfx('hoe');
    this.checkQuestProgress('till_soil', undefined, 1);
    this.advanceTutorial('till', 1);
    EventBus.emit('ENERGY_CHANGED', this.data.player.energy, this.data.player.maxEnergy);
    EventBus.emit('SOIL_ACTION', 'till', tileX, tileY);
    EventBus.emit('LOCAL_WORLD_ACTION', { action: 'till', tileX, tileY });
    return true;
  }

  public plantCrop(tileX: number, tileY: number, seedItemId: string): boolean {
    const key = `${tileX},${tileY}`;
    const tile = this.data.farmTiles[key];
    if (!tile || !tile.tilled) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Untilled', message: 'Till the soil first with your hoe!', icon: '🌱' });
      return false;
    }

    // Check if crop already planted here
    const existing = this.data.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
    if (existing) return false;

    // Find crop def matching seedItemId
    const cropDef = Object.values(CROPS_DATABASE).find((c) => c.seedItemId === seedItemId);
    if (!cropDef) return false;

    // Consume 1 seed from active hotbar
    const activeSlot = this.getSelectedHotbarSlot();
    if (!activeSlot || !activeSlot.item || activeSlot.item.id !== seedItemId) {
      // Find seed in inventory
      const seedSlot = this.data.inventory.find((s) => s.item && s.item.id === seedItemId);
      if (!seedSlot) return false;
      this.removeItem(seedSlot.slotIndex, 1);
    } else {
      this.removeItem(activeSlot.slotIndex, 1);
    }

    const newCrop: PlantedCrop = {
      id: `crop_${tileX}_${tileY}_${Date.now()}`,
      tileX,
      tileY,
      cropId: cropDef.id,
      currentStage: 0,
      daysPlanted: 0,
      isWatered: tile.watered,
      isHarvestable: false,
      quality: 'normal',
    };

    this.data.crops.push(newCrop);
    sound.playSfx('harvest');
    this.checkQuestProgress('plant_seed', cropDef.id, 1);
    this.advanceTutorial('plant', 1);
    EventBus.emit('SOIL_ACTION', 'plant', tileX, tileY, newCrop);
    EventBus.emit('LOCAL_WORLD_ACTION', { action: 'plant', tileX, tileY, crop: newCrop });
    return true;
  }

  public waterCrop(tileX: number, tileY: number): boolean {
    if (this.data.player.energy < 2) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Tired', message: 'Not enough energy to water!', icon: '💧' });
      return false;
    }

    const key = `${tileX},${tileY}`;
    const tile = this.data.farmTiles[key];
    if (tile && tile.tilled) {
      tile.watered = true;
    }

    const crop = this.data.crops.find((c) => c.tileX === tileX && c.tileY === tileY);
    if (crop) {
      crop.isWatered = true;
    }

    this.data.player.energy -= 2;
    sound.playSfx('water');
    this.checkQuestProgress('water_crop', undefined, 1);
    this.advanceTutorial('water', 1);
    EventBus.emit('ENERGY_CHANGED', this.data.player.energy, this.data.player.maxEnergy);
    EventBus.emit('SOIL_ACTION', 'water', tileX, tileY);
    EventBus.emit('LOCAL_WORLD_ACTION', { action: 'water', tileX, tileY });
    return true;
  }

  public harvestCrop(tileX: number, tileY: number): boolean {
    const cropIndex = this.data.crops.findIndex((c) => c.tileX === tileX && c.tileY === tileY);
    if (cropIndex === -1) return false;

    const crop = this.data.crops[cropIndex];
    if (!crop.isHarvestable) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Growing', message: 'This crop is not ready to harvest yet!', icon: '⏳' });
      return false;
    }

    const cropDef = CROPS_DATABASE[crop.cropId];
    if (!cropDef) return false;

    // Roll quality: 60% normal, 25% silver, 12% gold, 3% iridium
    const roll = Math.random();
    const quality: 'normal' | 'silver' | 'gold' | 'iridium' =
      roll < 0.6 ? 'normal' : roll < 0.85 ? 'silver' : roll < 0.97 ? 'gold' : 'iridium';

    // Add harvest item to inventory
    const added = this.addItem(cropDef.harvestItemId, cropDef.baseYield, quality);
    if (!added) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Inventory Full', message: 'Make room in your backpack first!', icon: '🎒' });
      return false;
    }

    sound.playSfx('harvest');
    this.data.statistics.cropsHarvested += 1;
    this.checkQuestProgress('harvest_crop', cropDef.id, 1);

    if (cropDef.regrows) {
      // Regrowing crop stays planted, reset to stage 2
      crop.currentStage = 2;
      crop.daysPlanted = cropDef.growthDays - (cropDef.regrowDays || 2);
      crop.isHarvestable = false;
      crop.isWatered = false;
      EventBus.emit('SOIL_ACTION', 'regrow', tileX, tileY, crop);
    } else {
      // Remove crop from list
      this.data.crops.splice(cropIndex, 1);
      EventBus.emit('SOIL_ACTION', 'clear', tileX, tileY);
      EventBus.emit('LOCAL_WORLD_ACTION', { action: 'harvest', tileX, tileY });
    }

    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Harvested!',
      message: `You harvested fresh ${cropDef.name} (${quality.toUpperCase()})!`,
      icon: '✨',
    });

    return true;
  }

  // --- MINING & RESOURCES ---
  public mineRockNode(nodeType: 'rock' | 'cavern' | 'iron' | 'gold' | 'amethyst'): { success: boolean; itemId?: string; count?: number } {
    if (this.data.player.energy < 3) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Exhausted',
        message: 'Too tired to swing your pickaxe! Rest or visit the hot springs.',
        icon: '⚡',
      });
      return { success: false };
    }

    // Consume energy
    this.data.player.energy -= 3;
    sound.playSfx('mine');
    EventBus.emit('ENERGY_CHANGED', this.data.player.energy, this.data.player.maxEnergy);

    let primaryItem = 'mat_stone';
    let primaryCount = 1;
    let bonusItem: string | null = null;
    let bonusCount = 0;

    if (nodeType === 'iron') {
      primaryItem = 'mat_iron';
      primaryCount = Math.random() < 0.35 ? 2 : 1;
      bonusItem = 'mat_stone';
      bonusCount = 1;
    } else if (nodeType === 'gold') {
      primaryItem = 'mat_gold';
      primaryCount = Math.random() < 0.25 ? 2 : 1;
      bonusItem = 'mat_stone';
      bonusCount = 1;
    } else if (nodeType === 'amethyst') {
      primaryItem = 'mat_amethyst';
      primaryCount = 1;
      bonusItem = 'mat_stone';
      bonusCount = 2;
    } else if (nodeType === 'cavern') {
      primaryItem = 'mat_stone';
      primaryCount = 2;
      if (Math.random() < 0.25) {
        bonusItem = 'mat_clay';
        bonusCount = 1;
      }
    } else {
      // standard surface rock
      primaryItem = 'mat_stone';
      primaryCount = Math.random() < 0.5 ? 2 : 1;
      if (Math.random() < 0.15) {
        bonusItem = 'mat_clay';
        bonusCount = 1;
      }
    }

    this.addItem(primaryItem, primaryCount);
    if (bonusItem && bonusCount > 0) {
      this.addItem(bonusItem, bonusCount);
    }

    this.data.statistics.oresMined = (this.data.statistics.oresMined || 0) + 1;
    this.advanceTutorial('mine', 1);

    const itemDef = ITEMS_DATABASE[primaryItem];
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Mined Resource!',
      message: `Extracted ${primaryCount}x ${itemDef?.name || primaryItem}!`,
      icon: '⛏️',
    });

    return { success: true, itemId: primaryItem, count: primaryCount };
  }

  // --- ENERGY REGENERATION & MAP ACTIVE STATE ---
  public restoreEnergy(amount: number): boolean {
    if (this.data.player.energy >= this.data.player.maxEnergy) return false;
    this.data.player.energy = Math.min(this.data.player.maxEnergy, this.data.player.energy + amount);
    EventBus.emit('ENERGY_CHANGED', this.data.player.energy, this.data.player.maxEnergy);
    return true;
  }

  public setActiveMap(mapId: MapId) {
    if (this.data.player.activeMap !== mapId) {
      this.data.player.activeMap = mapId;
      if (mapId !== 'farm' && mapId !== 'house') {
        this.advanceTutorial('explore', 1);
      }
    }
  }

  // --- NEWCOMER TUTORIAL GUIDE ---
  public advanceTutorial(
    action: 'move' | 'talk' | 'till' | 'plant' | 'water' | 'explore' | 'mine' | 'complete',
    count: number = 1
  ) {
    if (!this.data.tutorial || this.data.tutorial.isCompleted || this.data.tutorial.dismissed) return;

    const currentStageDef = TUTORIAL_STAGES.find((s) => s.id === this.data.tutorial!.currentStage);
    if (!currentStageDef) return;

    if (currentStageDef.targetAction === action) {
      this.data.tutorial.stageProgress += count;
      if (this.data.tutorial.stageProgress >= currentStageDef.targetCount) {
        // Stage target reached
        this.data.tutorial.stageProgress = 0;
        if (currentStageDef.rewardCoins > 0) {
          this.data.player.coins += currentStageDef.rewardCoins;
          this.data.statistics.coinsEarnedTotal += currentStageDef.rewardCoins;
          EventBus.emit('COINS_CHANGED', this.data.player.coins, currentStageDef.rewardCoins);
        }
        if (currentStageDef.rewardItem) {
          this.addItem(currentStageDef.rewardItem.itemId, currentStageDef.rewardItem.quantity);
        }

        sound.playSfx('fanfare');
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Tutorial Cleared!',
          message: `Finished: "${currentStageDef.title}"! (+${currentStageDef.rewardCoins} Haven Coins)`,
          icon: '🌟',
        });

        this.data.tutorial.currentStage += 1;
        if (this.data.tutorial.currentStage > TUTORIAL_STAGES.length) {
          this.data.tutorial.isCompleted = true;
          EventBus.emit('SHOW_NOTIFICATION', {
            title: 'Tutorial Complete!',
            message: 'You graduated the CozyHaven newcomer guide! Enjoy island life.',
            icon: '🎓',
          });
        }
      }
      EventBus.emit('TUTORIAL_UPDATED', this.data.tutorial);
    }
  }

  public dismissTutorial() {
    if (this.data.tutorial) {
      this.data.tutorial.dismissed = true;
      EventBus.emit('TUTORIAL_UPDATED', this.data.tutorial);
    }
  }

  public resetTutorial() {
    this.data.tutorial = {
      currentStage: 1,
      isCompleted: false,
      stageProgress: 0,
      dismissed: false,
    };
    EventBus.emit('TUTORIAL_UPDATED', this.data.tutorial);
  }

  // --- ECONOMY & SHOPS ---
  public buyItem(itemId: string, quantity: number = 1): boolean {
    const itemDef = ITEMS_DATABASE[itemId];
    if (!itemDef || !itemDef.buyPrice) return false;

    const totalCost = itemDef.buyPrice * quantity;
    if (this.data.player.coins < totalCost) {
      sound.playSfx('dialogue');
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Not Enough Coins', message: 'You do not have enough Haven Coins!', icon: '🪙' });
      return false;
    }

    const added = this.addItem(itemId, quantity);
    if (!added) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Inventory Full', message: 'Clear some backpack slots first!', icon: '🎒' });
      return false;
    }

    this.data.player.coins -= totalCost;
    sound.playSfx('coin');
    this.checkQuestProgress('buy_item', itemId, quantity);
    EventBus.emit('COINS_CHANGED', this.data.player.coins, -totalCost);
    return true;
  }

  public sellItem(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.data.inventory[slotIndex];
    if (!slot || !slot.item) return false;

    const itemName = slot.item.name;
    const qtyToSell = Math.min(slot.quantity, quantity);
    const multiplier =
      slot.quality === 'silver' ? 1.25 : slot.quality === 'gold' ? 1.5 : slot.quality === 'iridium' ? 2.0 : 1.0;
    const unitPrice = Math.round(slot.item.sellPrice * multiplier);
    const totalEarned = unitPrice * qtyToSell;

    this.removeItem(slotIndex, qtyToSell);
    this.data.player.coins += totalEarned;
    this.data.statistics.coinsEarnedTotal += totalEarned;

    sound.playSfx('coin');
    EventBus.emit('COINS_CHANGED', this.data.player.coins, totalEarned);
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Sold!',
      message: `Sold ${qtyToSell}x ${itemName} for ${totalEarned} Haven Coins.`,
      icon: '🪙',
    });
    return true;
  }

  public depositShippingBin(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.data.inventory[slotIndex];
    if (!slot || !slot.item) return false;

    const qtyToShip = Math.min(slot.quantity, quantity);
    const multiplier =
      slot.quality === 'silver' ? 1.25 : slot.quality === 'gold' ? 1.5 : slot.quality === 'iridium' ? 2.0 : 1.0;
    const unitPrice = Math.round(slot.item.sellPrice * multiplier);
    const totalPrice = unitPrice * qtyToShip;

    const itemName = slot.item.name;
    const shipped: ShippedItem = {
      itemId: slot.item.id,
      quantity: qtyToShip,
      unitPrice,
      totalPrice,
      quality: slot.quality,
    };

    this.data.shippingBin.push(shipped);
    this.removeItem(slotIndex, qtyToShip);
    sound.playSfx('coin');
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Placed in Shipping Bin',
      message: `${qtyToShip}x ${itemName} deposited. Coins arrive tomorrow morning!`,
      icon: '📦',
    });
    return true;
  }

  // --- NPC & SOCIAL ---
  public talkToNPC(npcId: string): boolean {
    const npc = this.data.npcs[npcId];
    if (!npc) return false;

    if (!npc.talkedToday) {
      npc.talkedToday = true;
      npc.friendshipPoints = Math.min(2500, npc.friendshipPoints + 20);
    }

    sound.playSfx('dialogue');
    this.checkQuestProgress('talk_to_npc', npcId, 1);
    this.advanceTutorial('talk', 1);
    EventBus.emit('OPEN_MODAL', 'dialogue', { npcId });
    return true;
  }

  public giftNPC(npcId: string, slotIndex: number): boolean {
    const slot = this.data.inventory[slotIndex];
    const npcDef = NPCS_DATABASE[npcId];
    const npcState = this.data.npcs[npcId];
    if (!slot || !slot.item || !npcDef || !npcState) return false;

    if (npcState.giftedToday) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Already Gifted',
        message: `${npcDef.name} already received a gift from you today!`,
        icon: '🎁',
      });
      return false;
    }

    const itemId = slot.item.id;
    let points = 20;
    let reactionText = 'Thank you for the gift!';

    if (npcDef.lovedItems.includes(itemId)) {
      points = 80;
      reactionText = `Oh, I absolutely LOVE this! Thank you so very much! ❤️`;
    } else if (npcDef.likedItems.includes(itemId)) {
      points = 45;
      reactionText = `What a lovely thought! Thank you kindly! 😊`;
    } else if (npcDef.dislikedItems.includes(itemId)) {
      points = -20;
      reactionText = `Um... this isn't really my style, but thank you anyway. 😐`;
    }

    npcState.giftedToday = true;
    npcState.friendshipPoints = Math.max(0, Math.min(2500, npcState.friendshipPoints + points));
    this.removeItem(slotIndex, 1);

    sound.playSfx('fanfare');
    EventBus.emit('SHOW_NOTIFICATION', {
      title: `Gift for ${npcDef.name}`,
      message: reactionText,
      icon: points > 0 ? '❤️' : '💔',
    });

    return true;
  }

  // --- HOUSE & FURNITURE PLACEMENT ---
  public placeFurniture(
    furnitureItemId: string,
    gridX: number,
    gridY: number,
    rotation: 0 | 90 | 180 | 270 = 0,
    mapId: 'farm' | 'house' = 'house'
  ): boolean {
    const itemDef = ITEMS_DATABASE[furnitureItemId];
    if (!itemDef || !itemDef.furnitureKey) return false;

    // Check collision with other placed furniture
    const width = itemDef.furnitureSize?.width || 1;
    const height = itemDef.furnitureSize?.height || 1;

    const overlap = this.data.furniture.some((f) => {
      if (f.mapId !== mapId) return false;
      return (
        gridX < f.gridX + f.width &&
        gridX + width > f.gridX &&
        gridY < f.gridY + f.height &&
        gridY + height > f.gridY
      );
    });

    if (overlap) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Blocked Space',
        message: 'Cannot place furniture on top of existing items!',
        icon: '🚫',
      });
      return false;
    }

    // Consume from inventory
    const slot = this.data.inventory.find((s) => s.item && s.item.id === furnitureItemId);
    if (slot) {
      this.removeItem(slot.slotIndex, 1);
    }

    const newPlaced: PlacedFurniture = {
      id: `furn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      furnitureKey: itemDef.furnitureKey,
      itemId: furnitureItemId,
      mapId,
      gridX,
      gridY,
      rotation,
      width,
      height,
      placedAt: Date.now(),
    };

    this.data.furniture.push(newPlaced);
    sound.playSfx('hoe');
    this.checkQuestProgress('place_furniture', furnitureItemId, 1);
    EventBus.emit('FURNITURE_PLACEMENT_CONFIRM', newPlaced);
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Placed!',
      message: `Placed ${itemDef.name} into your room.`,
      icon: '🪑',
    });

    return true;
  }

  public removeFurniture(placedId: string): boolean {
    const idx = this.data.furniture.findIndex((f) => f.id === placedId);
    if (idx === -1) return false;

    const placed = this.data.furniture[idx];
    const added = this.addItem(placed.itemId, 1);
    if (!added) {
      EventBus.emit('SHOW_NOTIFICATION', { title: 'Inventory Full', message: 'Free up space in backpack first!', icon: '🎒' });
      return false;
    }

    this.data.furniture.splice(idx, 1);
    sound.playSfx('click');
    EventBus.emit('FURNITURE_REMOVED', placedId);
    return true;
  }

  // --- QUESTS PROGRESSION ---
  public checkQuestProgress(type: QuestObjectiveType, targetId?: string, count: number = 1) {
    let changed = false;

    this.data.quests.forEach((quest) => {
      if (quest.isCompleted) return;

      quest.objectives.forEach((obj) => {
        if (obj.type === type && (!obj.targetId || obj.targetId === targetId)) {
          obj.currentCount = Math.min(obj.targetCount, obj.currentCount + count);
          changed = true;
        }
      });

      const allMet = quest.objectives.every((obj) => obj.currentCount >= obj.targetCount);
      if (allMet && !quest.isCompleted) {
        quest.isCompleted = true;
        sound.playSfx('fanfare');
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Quest Complete!',
          message: `"${quest.title}" is ready to claim!`,
          icon: '🏆',
        });
      }
    });

    if (changed) {
      EventBus.emit('QUESTS_UPDATED', this.data.quests);
    }
  }

  public claimQuestReward(questId: string): boolean {
    const quest = this.data.quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isRewardClaimed) return false;

    quest.isRewardClaimed = true;

    // Grant coins
    if (quest.rewards.coins > 0) {
      this.data.player.coins += quest.rewards.coins;
      this.data.statistics.coinsEarnedTotal += quest.rewards.coins;
      EventBus.emit('COINS_CHANGED', this.data.player.coins, quest.rewards.coins);
    }

    // Grant items
    if (quest.rewards.items) {
      quest.rewards.items.forEach((item) => {
        this.addItem(item.itemId, item.quantity);
      });
    }

    // Grant friendship
    if (quest.rewards.friendship) {
      quest.rewards.friendship.forEach((f) => {
        if (this.data.npcs[f.npcId]) {
          this.data.npcs[f.npcId].friendshipPoints = Math.min(2500, this.data.npcs[f.npcId].friendshipPoints + f.points);
        }
      });
    }

    sound.playSfx('fanfare');
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Rewards Claimed!',
      message: `Earned ${quest.rewards.coins} Haven Coins and bonus gifts!`,
      icon: '🎁',
    });
    EventBus.emit('QUESTS_UPDATED', this.data.quests);
    return true;
  }

  // --- MUSEUM DONATIONS ---
  public donateToMuseum(slotIndex: number): boolean {
    const slot = this.data.inventory[slotIndex];
    if (!slot || !slot.item) return false;

    const validCategories = ['fish', 'bug', 'forage', 'crop'];
    if (!validCategories.includes(slot.item.category)) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Ineligible Item',
        message: 'The museum only accepts fish, insects, minerals, and rare botany.',
        icon: '🏛️',
      });
      return false;
    }

    if (this.data.museumDonations.includes(slot.item.id)) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Already Donated',
        message: `The museum already exhibits a specimen of ${slot.item.name}!`,
        icon: '🏛️',
      });
      return false;
    }

    this.data.museumDonations.push(slot.item.id);
    const itemName = slot.item.name;
    this.removeItem(slotIndex, 1);

    sound.playSfx('fanfare');
    this.data.player.coins += 50; // Museum stipend
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Museum Donation Accepted!',
      message: `Thank you for contributing "${itemName}" to the CozyHaven Museum! (+50 Coins)`,
      icon: '🏛️',
    });
    EventBus.emit('COINS_CHANGED', this.data.player.coins, 50);
    return true;
  }

  // --- ANIMAL HUSBANDRY ---
  public getAnimals(): FarmAnimal[] {
    return this.data.animals || [];
  }

  public petAnimal(animalId: string): boolean {
    const animal = (this.data.animals || []).find((a) => a.id === animalId);
    if (!animal) return false;

    if (animal.petToday) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: animal.name,
        message: `${animal.name} is already happy and purring today!`,
        icon: animal.type === 'chicken' ? '🐔' : '🐄',
      });
      return false;
    }

    animal.petToday = true;
    animal.friendship = Math.min(1000, animal.friendship + 25);
    sound.playSfx('fanfare');

    EventBus.emit('SHOW_NOTIFICATION', {
      title: `Pet ${animal.name}!`,
      message: `${animal.name} loves your gentle attention! (+Friendship ❤️)`,
      icon: '💖',
    });

    this.checkQuestProgress('pet_animal', animal.type, 1);
    EventBus.emit('ANIMALS_UPDATED', this.data.animals);
    return true;
  }

  public collectAnimalProduct(animalId: string): boolean {
    const animal = (this.data.animals || []).find((a) => a.id === animalId);
    if (!animal) return false;

    if (!animal.hasProduct) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: animal.name,
        message: `${animal.name} has no products ready right now. Check back tomorrow!`,
        icon: '⏳',
      });
      return false;
    }

    // Determine product quality based on friendship
    const quality: 'normal' | 'silver' | 'gold' | 'iridium' =
      animal.friendship > 800 ? 'gold' : animal.friendship > 400 ? 'silver' : 'normal';

    const added = this.addItem(animal.productItemId, 1, quality);
    if (!added) {
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Inventory Full',
        message: 'Free up backpack space to collect animal products!',
        icon: '🎒',
      });
      return false;
    }

    animal.hasProduct = false;
    sound.playSfx('harvest');

    const itemDef = ITEMS_DATABASE[animal.productItemId];
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Collected Product!',
      message: `Gathered ${itemDef?.name || 'fresh product'} from ${animal.name}! (${quality.toUpperCase()})`,
      icon: animal.type === 'chicken' ? '🥚' : '🥛',
    });

    this.checkQuestProgress('collect_product', animal.productItemId, 1);
    EventBus.emit('ANIMALS_UPDATED', this.data.animals);
    return true;
  }

  // --- KITCHEN COOKING ---
  public cookRecipe(recipeId: string): boolean {
    const recipe = COOKING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;

    // Check if player has all ingredients
    for (const ing of recipe.ingredients) {
      let count = 0;
      for (const slot of this.data.inventory) {
        if (slot.item && slot.item.id === ing.itemId) {
          count += slot.quantity;
        }
      }
      if (count < ing.quantity) {
        const ingDef = ITEMS_DATABASE[ing.itemId];
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Missing Ingredients',
          message: `Need ${ing.quantity}x ${ingDef?.name || ing.itemId} to prepare ${recipe.name}!`,
          icon: '🍳',
        });
        return false;
      }
    }

    // Check inventory space for result
    const resultDef = ITEMS_DATABASE[recipe.resultItemId];
    if (!resultDef) return false;

    // Remove ingredients
    for (const ing of recipe.ingredients) {
      let needed = ing.quantity;
      for (const slot of this.data.inventory) {
        if (slot.item && slot.item.id === ing.itemId) {
          const deduct = Math.min(slot.quantity, needed);
          this.removeItem(slot.slotIndex, deduct);
          needed -= deduct;
          if (needed <= 0) break;
        }
      }
    }

    // Add cooked dish
    const added = this.addItem(recipe.resultItemId, 1, 'normal');
    if (!added) {
      // Return ingredients if inventory full
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Backpack Full',
        message: 'Cannot carry cooked dish!',
        icon: '🎒',
      });
      return false;
    }

    sound.playSfx('fanfare');
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Deliciously Cooked!',
      message: `You prepared warm, delicious ${recipe.name}! (+${recipe.energyRestored} Energy restore)`,
      icon: recipe.icon,
    });

    this.checkQuestProgress('cook_dish', recipe.resultItemId, 1);
    EventBus.emit('INVENTORY_UPDATED', this.data.inventory);
    return true;
  }

  // --- PERSISTENCE: SAVE & LOAD ---
  public saveGame(slotId: number = 1): boolean {
    try {
      if (typeof localStorage === 'undefined') return true;
      this.data.saveSlotId = slotId;
      this.data.timestamp = Date.now();
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, serialized);
      return true;
    } catch (e) {
      console.error('[SaveManager] Failed to save game:', e);
      return false;
    }
  }

  public loadGame(slotId: number = 1): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
      if (!raw) return false;
      const parsed: GameSaveData = JSON.parse(raw);
      if (parsed.schemaVersion === 1) {
        if (!parsed.animals || !Array.isArray(parsed.animals)) {
          parsed.animals = JSON.parse(JSON.stringify(INITIAL_FARM_ANIMALS));
        }
        if (!parsed.tutorial) {
          parsed.tutorial = {
            currentStage: 1,
            isCompleted: false,
            stageProgress: 0,
            dismissed: false,
          };
        }
        if (parsed.statistics.oresMined === undefined) {
          parsed.statistics.oresMined = 0;
        }
        this.data = parsed;
        this.notifyAllState();
        return true;
      }
      return false;
    } catch (e) {
      console.error('[SaveManager] Failed to load game:', e);
      return false;
    }
  }

  public exportSaveJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importSaveJson(jsonStr: string): boolean {
    try {
      const parsed: GameSaveData = JSON.parse(jsonStr);
      if (parsed.schemaVersion) {
        this.data = parsed;
        this.saveGame(this.data.saveSlotId || 1);
        this.notifyAllState();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public notifyAllState() {
    EventBus.emit('TIME_TICK', { ...this.data.time, weather: this.data.weather });
    EventBus.emit('COINS_CHANGED', this.data.player.coins, 0);
    EventBus.emit('ENERGY_CHANGED', this.data.player.energy, this.data.player.maxEnergy);
    EventBus.emit('INVENTORY_UPDATED', this.data.inventory);
    EventBus.emit('QUESTS_UPDATED', this.data.quests);
    if (this.data.tutorial) {
      EventBus.emit('TUTORIAL_UPDATED', this.data.tutorial);
    }
  }
}

export const gameState = GameStateManager.getInstance();
