import { EventBus } from './EventBus';
import { sound } from './SoundSynth';

export interface NPCVoiceProfile {
  npcId: string;
  name: string;
  pitch: number; // 0.5 to 2.0
  rate: number; // 0.6 to 1.5
  volume: number; // 0.0 to 1.0
  preferredGender: 'female' | 'male';
  voiceKeywords: string[];
  formantTone: number; // base frequency for procedural voice babble
  catchphrasePool: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    night: string[];
  };
}

export const NPC_VOICE_PROFILES: Record<string, NPCVoiceProfile> = {
  milo: {
    npcId: 'milo',
    name: 'Milo',
    pitch: 0.82,
    rate: 0.92,
    volume: 1.0,
    preferredGender: 'male',
    voiceKeywords: ['male', 'david', 'mark', 'george', 'guy', 'en-us', 'en-gb'],
    formantTone: 150,
    catchphrasePool: {
      morning: [
        'Well howdy neighbor! Smell that fresh morning soil!',
        'Top of the morning to you! Prime time to water the crops!',
      ],
      afternoon: [
        'Sun is high and warm today! Roots are drinking deep!',
        'Howdy! Remember, good compost is the secret to prize pumpkins!',
      ],
      evening: [
        'Evening, friend! Time to check the shipping bin before resting!',
        'Ah, nothing beats the peace of the fields at sunset.',
      ],
      night: [
        'Nighttime already! Don\'t stay up too late or you\'ll wake up exhausted!',
        'Rest well, neighbor. Tomorrow brings another harvest!',
      ],
    },
  },
  luna: {
    npcId: 'luna',
    name: 'Luna',
    pitch: 1.28,
    rate: 0.88,
    volume: 0.95,
    preferredGender: 'female',
    voiceKeywords: ['female', 'samantha', 'zira', 'victoria', 'natural', 'karen', 'en'],
    formantTone: 280,
    catchphrasePool: {
      morning: [
        'Hello sweet soul... listen closely to the morning petals opening.',
        'Blessed dawn to you. The morning dew carries such gentle dreams.',
      ],
      afternoon: [
        'The wild sunflowers are turning toward the golden light today...',
        'Every blossom has a secret to share if you listen with patience.',
      ],
      evening: [
        'The evening fragrance of lavender is intoxicating, isn\'t it?',
        'Twilight wraps the island in shades of amethyst...',
      ],
      night: [
        'The moonlit night watches over our sleepy village... sleep peacefully.',
        'Stars are blooming like silver flowers in the dark sky...',
      ],
    },
  },
  oliver: {
    npcId: 'oliver',
    name: 'Oliver',
    pitch: 0.62,
    rate: 0.80,
    volume: 1.0,
    preferredGender: 'male',
    voiceKeywords: ['male', 'deep', 'david', 'richard', 'james', 'en'],
    formantTone: 110,
    catchphrasePool: {
      morning: [
        'Ahoy, friend. The tide is steady this morning.',
        'The early fisherman catches the calmest water. Welcome.',
      ],
      afternoon: [
        'Sun Bass are schooling near the warm reef right now.',
        'Steady wrists, steady mind. The ocean teaches patience.',
      ],
      evening: [
        'Dusk is falling. This is when the Moonlight Salmon bite.',
        'Look at those harbor reflections. Beautiful end to a hard day.',
      ],
      night: [
        'The waves sing an ancient lullaby tonight. Turn in early, lad.',
        'Rest your tired bones. The sea will be here waiting at sunrise.',
      ],
    },
  },
  poppy: {
    npcId: 'poppy',
    name: 'Poppy',
    pitch: 1.38,
    rate: 1.14,
    volume: 1.0,
    preferredGender: 'female',
    voiceKeywords: ['female', 'cheerful', 'samantha', 'zira', 'karen', 'en'],
    formantTone: 340,
    catchphrasePool: {
      morning: [
        'Ding! Fresh out of the oven! Welcome, welcome sweet friend!',
        'Yay, you\'re here! The cafe smells like cinnamon and honey!',
      ],
      afternoon: [
        'Time for an afternoon tea break! You\'ve been working so hard!',
        'Mmm! Strawberry tart or warm apple pie? Both, definitely both!',
      ],
      evening: [
        'Winding down for the day with a warm mug of spiced berry tea!',
        'Nothing warms the heart like laughing with good neighbors!',
      ],
      night: [
        'Goodnight, sunshine! Dream of giant fluffy pastries!',
        'Time to tuck in and rest! See you bright and early tomorrow!',
      ],
    },
  },
  theo: {
    npcId: 'theo',
    name: 'Theo',
    pitch: 1.08,
    rate: 1.08,
    volume: 1.0,
    preferredGender: 'male',
    voiceKeywords: ['male', 'alex', 'david', 'mark', 'george', 'en'],
    formantTone: 210,
    catchphrasePool: {
      morning: [
        'Aha! Look who\'s up! A new day for great expeditions!',
        'Did you see that rare emerald butterfly by the orchard path?!',
      ],
      afternoon: [
        'Fascinating micro-climates today! I\'m logging new soil specimens!',
        'Always keep your eyes open! Adventure is under every leaf!',
      ],
      evening: [
        'The twilight insects are beginning their symphony! Remarkable!',
        'Cataloging today\'s cartography notes... we discovered so much!',
      ],
      night: [
        'Look! Glow fireflies dancing through Whispering Forest!',
        'Time to rest the explorer boots for the night! Great trekking today!',
      ],
    },
  },
  maple: {
    npcId: 'maple',
    name: 'Maple',
    pitch: 0.95,
    rate: 0.96,
    volume: 1.0,
    preferredGender: 'female',
    voiceKeywords: ['female', 'zira', 'samantha', 'victoria', 'en'],
    formantTone: 230,
    catchphrasePool: {
      morning: [
        'Good morning, dear! The General Store is swept and ready for you.',
        'Fresh shipment of seeds just arrived from the mainland!',
      ],
      afternoon: [
        'Take your time looking around the shelves, dear neighbor.',
        'Turnip seeds are popular today! Anything I can get for you?',
      ],
      evening: [
        'Closing up the ledger soon, but never too busy for a neighborly chat!',
        'Be sure to check your shipping bin before heading home to rest.',
      ],
      night: [
        'Stay safe walking home in the dark, dear. Have a peaceful night.',
        'Rest well tonight. Tomorrow is another wonderful day in CozyHaven.',
      ],
    },
  },
  nori: {
    npcId: 'nori',
    name: 'Nori',
    pitch: 1.15,
    rate: 0.82,
    volume: 0.92,
    preferredGender: 'female',
    voiceKeywords: ['female', 'samantha', 'zira', 'victoria', 'en'],
    formantTone: 260,
    catchphrasePool: {
      morning: [
        'U-um... hello there... the dawn colors are... truly breathtaking today...',
        'Look at how the soft rose pink touches the grass blades...',
      ],
      afternoon: [
        'I\'m trying to mix a watercolor palette that matches your strawberry patch...',
        'Quiet afternoons are my favorite... everything feels so still and honest...',
      ],
      evening: [
        'The amber twilight on the water... I wish I could capture it forever...',
        'S-sorry... I was lost in thought watching the ripples by the pier...',
      ],
      night: [
        'The night sky is like deep indigo velvet... rest well, sweet friend...',
        'U-um... thank you for stopping to talk with me today...',
      ],
    },
  },
};

export class VoiceAIEngine {
  private static instance: VoiceAIEngine;
  private isVoiceEnabled: boolean = true;
  private speechRateMultiplier: number = 1.0;
  private isSpeakingNow: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private babbleInterval: any = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  public static getInstance(): VoiceAIEngine {
    if (!VoiceAIEngine.instance) {
      VoiceAIEngine.instance = new VoiceAIEngine();
    }
    return VoiceAIEngine.instance;
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public setSpeechRateMultiplier(mult: number) {
    this.speechRateMultiplier = Math.max(0.7, Math.min(1.4, mult));
  }

  public getSpeechRateMultiplier(): number {
    return this.speechRateMultiplier;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.babbleInterval) {
      clearInterval(this.babbleInterval);
      this.babbleInterval = null;
    }
    this.isSpeakingNow = false;
    this.currentUtterance = null;
    EventBus.emit('VOICE_AI_STATE', { isSpeaking: false, npcId: null });
  }

  private pickBestVoice(profile: NPCVoiceProfile): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    if (this.availableVoices.length === 0) return null;

    // Filter by keyword preference
    for (const kw of profile.voiceKeywords) {
      const match = this.availableVoices.find((v) =>
        v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    // Fallback: pick matching English or default
    const englishVoice = this.availableVoices.find((v) => v.lang.startsWith('en'));
    return englishVoice || this.availableVoices[0];
  }

  public speakNPCLine(npcId: string, text: string, onEnd?: () => void) {
    if (!this.isVoiceEnabled) return;

    this.stopSpeaking();

    const profile = NPC_VOICE_PROFILES[npcId] || NPC_VOICE_PROFILES['milo'];
    const chosenVoice = this.pickBestVoice(profile);

    this.isSpeakingNow = true;
    EventBus.emit('VOICE_AI_STATE', { isSpeaking: true, npcId, text });

    // Procedural voice babble accompaniment / fallback
    this.startProceduralBabble(profile);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      if (chosenVoice) utter.voice = chosenVoice;
      utter.pitch = profile.pitch;
      utter.rate = profile.rate * this.speechRateMultiplier;
      utter.volume = profile.volume;

      utter.onend = () => {
        this.stopSpeaking();
        if (onEnd) onEnd();
      };

      utter.onerror = () => {
        this.stopSpeaking();
        if (onEnd) onEnd();
      };

      this.currentUtterance = utter;
      window.speechSynthesis.speak(utter);
    } else {
      // Audio-only fallback duration
      const durationMs = Math.max(1500, Math.min(6000, text.length * 55));
      setTimeout(() => {
        this.stopSpeaking();
        if (onEnd) onEnd();
      }, durationMs);
    }
  }

  private startProceduralBabble(profile: NPCVoiceProfile) {
    if (this.babbleInterval) clearInterval(this.babbleInterval);

    // Chirp subtle vowel formants every 120ms
    let count = 0;
    this.babbleInterval = setInterval(() => {
      if (!this.isSpeakingNow) {
        clearInterval(this.babbleInterval);
        return;
      }
      count++;
      // Vowel variations (+- 30Hz)
      const baseFreq = profile.formantTone;
      const variation = (Math.sin(count * 0.8) * 0.15 + (Math.random() - 0.5) * 0.1) * baseFreq;
      sound.playFormantVoice(baseFreq + variation, profile.pitch);
    }, 120);
  }

  public getRandomCatchphrase(npcId: string, timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
    const profile = NPC_VOICE_PROFILES[npcId] || NPC_VOICE_PROFILES['milo'];
    const pool = profile.catchphrasePool[timeOfDay] || profile.catchphrasePool.morning;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export const voiceAI = VoiceAIEngine.getInstance();
