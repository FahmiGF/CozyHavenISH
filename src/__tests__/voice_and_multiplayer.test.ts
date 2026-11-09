import { describe, it, expect } from 'vitest';
import { voiceAI, NPC_VOICE_PROFILES } from '../domain/VoiceAI';
import { mpClient } from '../network/MultiplayerClient';

describe('Voice AI and Multiplayer Client', () => {
  it('should have unique voice profiles and frequencies for all 7 NPCs', () => {
    const npcs = ['milo', 'luna', 'oliver', 'poppy', 'theo', 'maple', 'nori'];

    npcs.forEach((npcId) => {
      const profile = NPC_VOICE_PROFILES[npcId];
      expect(profile).toBeDefined();
      expect(profile.pitch).toBeGreaterThan(0.4);
      expect(profile.rate).toBeGreaterThan(0.5);
      expect(profile.formantTone).toBeGreaterThan(50);
      expect(profile.catchphrasePool.morning.length).toBeGreaterThan(0);
      expect(profile.catchphrasePool.night.length).toBeGreaterThan(0);
    });

    // Verify distinct pitches for different characters
    expect(NPC_VOICE_PROFILES.oliver.pitch).toBeLessThan(NPC_VOICE_PROFILES.poppy.pitch);
    expect(NPC_VOICE_PROFILES.oliver.formantTone).toBeLessThan(NPC_VOICE_PROFILES.poppy.formantTone);
  });

  it('should provide random catchphrases according to time of day', () => {
    const morningLine = voiceAI.getRandomCatchphrase('milo', 'morning');
    expect(typeof morningLine).toBe('string');
    expect(morningLine.length).toBeGreaterThan(5);

    const nightLine = voiceAI.getRandomCatchphrase('luna', 'night');
    expect(typeof nightLine).toBe('string');
    expect(nightLine.length).toBeGreaterThan(5);
  });

  it('should manage voice settings toggles', () => {
    voiceAI.setVoiceEnabled(true);
    expect(voiceAI.getVoiceEnabled()).toBe(true);

    voiceAI.setVoiceEnabled(false);
    expect(voiceAI.getVoiceEnabled()).toBe(false);
    voiceAI.setVoiceEnabled(true);
  });

  it('should initialize multiplayer client with valid default status', () => {
    const status = mpClient.getStatus();
    expect(status.isConnected).toBe(false);
    expect(status.roomCode).toBe('haven-main');
    expect(Array.isArray(status.players)).toBe(true);
    expect(Array.isArray(status.chatHistory)).toBe(true);
  });
});
