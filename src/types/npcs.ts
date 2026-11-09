export interface NPCScheduleWaypoint {
  hour: number;
  minute: number;
  mapId: 'village' | 'farm' | 'beach' | 'forest' | 'mine';
  x: number;
  y: number;
  activity: string;
}

export interface NPCDialogueChoice {
  text: string;
  response: string;
  friendshipDelta?: number;
}

export interface NPCDialogueLine {
  id: string;
  text: string;
  condition?: (friendshipHearts: number) => boolean;
  choices?: NPCDialogueChoice[];
}

export interface NPCDefinition {
  id: string;
  name: string;
  title: string;
  bio: string;
  personality: string;
  avatarColor: string;
  shirtColor: string;
  hairColor: string;
  lovedItems: string[];
  likedItems: string[];
  dislikedItems: string[];
  schedule: NPCScheduleWaypoint[];
  dialogues: NPCDialogueLine[];
  birthday: { season: 'spring' | 'summer' | 'autumn' | 'winter'; day: number };
}

export interface NPCState {
  id: string;
  friendshipPoints: number; // 0 to 2500 (250 points = 1 heart, max 10 hearts)
  talkedToday: boolean;
  giftedToday: boolean;
  currentMap: 'village' | 'farm' | 'beach' | 'forest' | 'mine';
  x: number;
  y: number;
  currentActivity: string;
}

export const NPCS_DATABASE: Record<string, NPCDefinition> = {
  milo: {
    id: 'milo',
    name: 'Milo',
    title: 'Village Farmer',
    bio: 'A passionate agriculturist who loves soil care, wholesome compost, and hearty root crops.',
    personality: 'Friendly & Earthy',
    avatarColor: '#d97706',
    shirtColor: '#4d7c0f',
    hairColor: '#78350f',
    birthday: { season: 'spring', day: 12 },
    lovedItems: ['crop_turnip', 'crop_potato', 'crop_pumpkin'],
    likedItems: ['mat_wood', 'mat_clay', 'food_salad'],
    dislikedItems: ['bug_butterfly', 'bug_dragonfly'],
    schedule: [
      { hour: 6, minute: 0, mapId: 'village', x: 260, y: 320, activity: 'Tending to town orchard' },
      { hour: 10, minute: 0, mapId: 'village', x: 420, y: 380, activity: 'Browsing seeds at Maple\'s store' },
      { hour: 13, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Eating lunch at Poppy\'s cafe' },
      { hour: 17, minute: 0, mapId: 'village', x: 340, y: 300, activity: 'Sitting by town fountain' },
      { hour: 20, minute: 0, mapId: 'village', x: 220, y: 280, activity: 'Resting at home' },
    ],
    dialogues: [
      {
        id: 'milo_greeting_1',
        text: 'Hey there neighbor! Smell that sweet morning air? It is prime weather for tilling soil!',
        choices: [
          { text: 'Any farming tips today?', response: 'Remember to water your crops every single day! And don\'t forget: fertilizers speed up growth.', friendshipDelta: 15 },
          { text: 'Just enjoying the walk.', response: 'That is the true CozyHaven spirit. No rush, just enjoy the peace.', friendshipDelta: 10 },
        ],
      },
      {
        id: 'milo_greeting_2',
        text: 'The soil here in CozyHaven has ancient volcanic nutrients. Whatever you plant will thrive with gentle love!',
      },
    ],
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    title: 'Botanist & Florist',
    bio: 'Gentle soul obsessed with rare blossoms, pollinating bees, and botanical remedies.',
    personality: 'Creative & Serene',
    avatarColor: '#a855f7',
    shirtColor: '#c084fc',
    hairColor: '#6b21a8',
    birthday: { season: 'spring', day: 24 },
    lovedItems: ['crop_sunflower', 'crop_bluerose', 'forage_wildberry'],
    likedItems: ['furn_plant_pot', 'forage_mushroom'],
    dislikedItems: ['mat_stone', 'mat_iron'],
    schedule: [
      { hour: 7, minute: 0, mapId: 'forest', x: 340, y: 200, activity: 'Gathering rare flora in Whispering Forest' },
      { hour: 11, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Sipping floral tea at the cafe' },
      { hour: 14, minute: 0, mapId: 'village', x: 620, y: 280, activity: 'Arranging bouquets in the flower garden' },
      { hour: 18, minute: 0, mapId: 'forest', x: 520, y: 320, activity: 'Soaking by the warm forest hot springs' },
      { hour: 21, minute: 0, mapId: 'village', x: 620, y: 280, activity: 'Reading botanical journals' },
    ],
    dialogues: [
      {
        id: 'luna_greeting_1',
        text: 'Hello sweet gardener. Have you seen the wild sunflowers turning toward the golden horizon?',
        choices: [
          { text: 'Your flowers are breathtaking!', response: 'Oh, you flatter me! Flowers blossom best when someone speaks kindly to them.', friendshipDelta: 20 },
          { text: 'I want to breed blue roses.', response: 'A magnificent ambition! Blue roses require great patience, but their perfume is unforgettable.', friendshipDelta: 20 },
        ],
      },
      {
        id: 'luna_greeting_2',
        text: 'Every petal carries a little secret from the earth. I hope your day is filled with gentle colors.',
      },
    ],
  },
  oliver: {
    id: 'oliver',
    name: 'Oliver',
    title: 'Veteran Fisher',
    bio: 'Patient angler who knows the mood of every wave, reef, and current around the island.',
    personality: 'Quiet & Contemplative',
    avatarColor: '#0284c7',
    shirtColor: '#38bdf8',
    hairColor: '#334155',
    birthday: { season: 'summer', day: 8 },
    lovedItems: ['fish_moonlight_salmon', 'fish_rainbow_trout', 'forage_seashell'],
    likedItems: ['fish_bluecarp', 'fish_sunbass'],
    dislikedItems: ['mat_clay', 'bug_firefly'],
    schedule: [
      { hour: 6, minute: 0, mapId: 'beach', x: 440, y: 340, activity: 'Casting line off the Bluebell Beach pier' },
      { hour: 12, minute: 0, mapId: 'beach', x: 300, y: 380, activity: 'Repairing fishing nets on the sandy shore' },
      { hour: 15, minute: 0, mapId: 'village', x: 420, y: 380, activity: 'Selling fresh catches at General Store' },
      { hour: 18, minute: 0, mapId: 'beach', x: 440, y: 340, activity: 'Watching the sunset over Bluebell Beach' },
      { hour: 21, minute: 0, mapId: 'village', x: 720, y: 440, activity: 'Tuning bamboo rods' },
    ],
    dialogues: [
      {
        id: 'oliver_greeting_1',
        text: 'The water is steady today. Patience is 90 percent of fishing. The remaining 10 percent is gratitude.',
        choices: [
          { text: 'What is biting today?', response: 'During warm afternoons, Sun Bass gather in shallow pools. At dusk, you might hook a Moonlight Salmon.', friendshipDelta: 15 },
          { text: 'Teach me the rod technique.', response: 'Keep your wrist light and let the bobber breathe. You will feel the tug when the time is right.', friendshipDelta: 20 },
        ],
      },
      {
        id: 'oliver_greeting_2',
        text: 'The rhythm of the tides washes away every worry. Spend an hour by the water and you will feel anew.',
      },
    ],
  },
  poppy: {
    id: 'poppy',
    name: 'Poppy',
    title: 'Bakery & Cafe Host',
    bio: 'The energetic heartbeat of CozyHaven. Bakes warm pastries and brews fragrant berry teas.',
    personality: 'Cheerful & Hospitable',
    avatarColor: '#f43f5e',
    shirtColor: '#fb7185',
    hairColor: '#f59e0b',
    birthday: { season: 'autumn', day: 18 },
    lovedItems: ['crop_strawberry', 'food_apple_pie', 'crop_pumpkin'],
    likedItems: ['forage_wildberry', 'crop_turnip', 'crop_carrot'],
    dislikedItems: ['fish_bluecarp', 'mat_iron'],
    schedule: [
      { hour: 6, minute: 30, mapId: 'village', x: 500, y: 440, activity: 'Baking fresh apple pies' },
      { hour: 9, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Welcoming villagers to the cafe' },
      { hour: 14, minute: 0, mapId: 'village', x: 340, y: 300, activity: 'Sharing pastries at the Town Square' },
      { hour: 17, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Brewing evening herbal tea' },
      { hour: 21, minute: 30, mapId: 'village', x: 480, y: 400, activity: 'Cleaning pastry pans' },
    ],
    dialogues: [
      {
        id: 'poppy_greeting_1',
        text: 'Yay, you\'re here! The cinnamon oven just dinged! Want a fresh bite of warm apple pie?',
        choices: [
          { text: 'Yes please, it smells heavenly!', response: 'Here you go! Made with love, honey, and crisp orchard apples. Enjoy!', friendshipDelta: 25 },
          { text: 'How is the cafe going today?', response: 'Buzzing with smiles! Theo told a hilarious story about a glowing dragonfly!', friendshipDelta: 15 },
        ],
      },
      {
        id: 'poppy_greeting_2',
        text: 'A cozy belly makes a cozy heart! Always take time to eat something warm before working the fields!',
      },
    ],
  },
  theo: {
    id: 'theo',
    name: 'Theo',
    title: 'Island Explorer',
    bio: 'Curious cartographer who tracks secret groves, rare insects, and ancient fossil formations.',
    personality: 'Adventurous & Inquisitive',
    avatarColor: '#10b981',
    shirtColor: '#34d399',
    hairColor: '#1e293b',
    birthday: { season: 'summer', day: 21 },
    lovedItems: ['bug_dragonfly', 'bug_firefly', 'mat_iron'],
    likedItems: ['mat_stone', 'forage_mushroom', 'forage_seashell'],
    dislikedItems: ['furn_chair_wood'],
    schedule: [
      { hour: 7, minute: 0, mapId: 'forest', x: 280, y: 220, activity: 'Mapping trails in Whispering Forest' },
      { hour: 11, minute: 0, mapId: 'mine', x: 260, y: 260, activity: 'Inspecting mineral formations in Crystal Caverns' },
      { hour: 15, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Chatting with Poppy at Cafe' },
      { hour: 18, minute: 0, mapId: 'forest', x: 420, y: 340, activity: 'Observing glowing fireflies by the hot springs' },
      { hour: 22, minute: 0, mapId: 'village', x: 180, y: 220, activity: 'Logging museum entries' },
    ],
    dialogues: [
      {
        id: 'theo_greeting_1',
        text: 'Did you know CozyHaven has over forty micro-climates? Yesterday I tracked an emerald dragonfly near the waterfall!',
        choices: [
          { text: 'I caught a bug today too!', response: 'Phenomenal! Be sure to register it in our Museum Collection. Every discovery matters!', friendshipDelta: 20 },
          { text: 'Where is the best foraging spot?', response: 'The deep corners of Whispering Forest are teeming with juicy wild berries and mushrooms.', friendshipDelta: 15 },
        ],
      },
      {
        id: 'theo_greeting_2',
        text: 'Never stop being curious. Adventure is not just climbing peaks; it is noticing a tiny ladybug upon a leaf.',
      },
    ],
  },
  maple: {
    id: 'maple',
    name: 'Maple',
    title: 'General Storekeeper',
    bio: 'The dependable village merchant who provides seeds, tools, and friendly neighborhood advice.',
    personality: 'Warm & Organized',
    avatarColor: '#e11d48',
    shirtColor: '#f43f5e',
    hairColor: '#881337',
    birthday: { season: 'winter', day: 5 },
    lovedItems: ['crop_carrot', 'crop_tomato', 'furn_chair_wood'],
    likedItems: ['mat_wood', 'mat_clay', 'food_salad'],
    dislikedItems: ['bug_butterfly'],
    schedule: [
      { hour: 7, minute: 0, mapId: 'village', x: 420, y: 380, activity: 'Unlocking General Store and sweeping porch' },
      { hour: 9, minute: 0, mapId: 'village', x: 420, y: 380, activity: 'Serving customers behind the counter' },
      { hour: 16, minute: 0, mapId: 'village', x: 340, y: 300, activity: 'Checking the community bulletin board' },
      { hour: 18, minute: 0, mapId: 'village', x: 420, y: 380, activity: 'Balancing the day\'s store ledger' },
      { hour: 21, minute: 0, mapId: 'village', x: 380, y: 340, activity: 'Knitting by candlelight' },
    ],
    dialogues: [
      {
        id: 'maple_greeting_1',
        text: 'Welcome, dear! Need fresh seeds, or perhaps some sturdy tools for your new homestead?',
        choices: [
          { text: 'What is popular in the shop?', response: 'Turnip seeds are flying off the shelves because they sprout in just three days! Great for quick coins.', friendshipDelta: 15 },
          { text: 'Thank you for keeping the village supplied!', response: 'Aww, that warms my heart! It is a joy to serve such wonderful neighbors.', friendshipDelta: 20 },
        ],
      },
      {
        id: 'maple_greeting_2',
        text: 'If you have spare produce or forage, you can drop it in your farm\'s shipping bin or sell it right to my counter!',
      },
    ],
  },
  nori: {
    id: 'nori',
    name: 'Nori',
    title: 'Village Artist',
    bio: 'Gentle painter who captures the shifting seasons and sunset reflections across CozyHaven.',
    personality: 'Shy & Imaginative',
    avatarColor: '#6366f1',
    shirtColor: '#818cf8',
    hairColor: '#312e81',
    birthday: { season: 'winter', day: 26 },
    lovedItems: ['crop_bluerose', 'bug_dragonfly', 'furn_plant_pot'],
    likedItems: ['forage_seashell', 'crop_sunflower'],
    dislikedItems: ['mat_clay'],
    schedule: [
      { hour: 8, minute: 0, mapId: 'beach', x: 320, y: 280, activity: 'Sketching watercolor waves on Bluebell Beach' },
      { hour: 12, minute: 0, mapId: 'village', x: 500, y: 440, activity: 'Quietly sketching patrons at the cafe' },
      { hour: 15, minute: 0, mapId: 'forest', x: 380, y: 260, activity: 'Studying forest pigments and moss shades' },
      { hour: 18, minute: 0, mapId: 'beach', x: 420, y: 300, activity: 'Painting twilight reflections at the harbor' },
      { hour: 21, minute: 0, mapId: 'village', x: 300, y: 460, activity: 'Mixing natural mineral watercolors' },
    ],
    dialogues: [
      {
        id: 'nori_greeting_1',
        text: 'U-um... hello. The light falling across the grass right now is... breathtaking, isn\'t it?',
        choices: [
          { text: 'Your paintings are truly magical!', response: 'R-really? Thank you so much... that means the world to me.', friendshipDelta: 25 },
          { text: 'What colors are you mixing?', response: 'A soft blend of crushed lavender petals and bluebell sea clay.', friendshipDelta: 15 },
        ],
      },
      {
        id: 'nori_greeting_2',
        text: 'Sometimes silence speaks louder than words. Watching the clouds drift is my favorite meditation.',
      },
    ],
  },
};
