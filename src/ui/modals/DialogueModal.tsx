import React, { useState, useEffect } from 'react';
import { gameState } from '../../domain/GameState';
import { NPCS_DATABASE, NPCDialogueLine, NPCDialogueChoice } from '../../types/npcs';
import { getItemEmoji } from '../Hotbar';
import { sound } from '../../domain/SoundSynth';
import { voiceAI, NPC_VOICE_PROFILES } from '../../domain/VoiceAI';
import { X, Heart, Gift, MessageCircle, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface DialogueModalProps {
  npcId: string;
  onClose: () => void;
}

const NPC_AVATAR_ICONS: Record<string, string> = {
  milo: '🧑‍🌾',
  luna: '🌿',
  oliver: '⚓',
  poppy: '🧁',
  theo: '🧭',
  maple: '🏪',
  nori: '🎨',
};

export const DialogueModal: React.FC<DialogueModalProps> = ({ npcId, onClose }) => {
  const npcDef = NPCS_DATABASE[npcId];
  const npcState = gameState.data.npcs[npcId];

  const [activeDialogueIndex, setActiveDialogueIndex] = useState<number>(0);
  const [responseOverride, setResponseOverride] = useState<string | null>(null);
  const [isGiftMode, setIsGiftMode] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(voiceAI.getVoiceEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(
    Math.min(10, Math.floor((npcState?.friendshipPoints || 0) / 250))
  );

  const currentLine: NPCDialogueLine = npcDef?.dialogues[activeDialogueIndex] || npcDef?.dialogues[0];
  const activeText = responseOverride || currentLine?.text || '';

  // Trigger Voice AI speech on mount and whenever text changes
  useEffect(() => {
    if (!npcDef || isGiftMode) return;
    setIsSpeaking(true);
    voiceAI.speakNPCLine(npcId, activeText, () => {
      setIsSpeaking(false);
    });

    return () => {
      voiceAI.stopSpeaking();
    };
  }, [npcId, activeText, isGiftMode]);

  const handleReplayVoice = () => {
    setIsSpeaking(true);
    voiceAI.speakNPCLine(npcId, activeText, () => {
      setIsSpeaking(false);
    });
  };

  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    voiceAI.setVoiceEnabled(next);
    if (!next) {
      voiceAI.stopSpeaking();
      setIsSpeaking(false);
    } else {
      handleReplayVoice();
    }
  };

  if (!npcDef || !npcState) return null;

  const handleChoice = (choice: NPCDialogueChoice) => {
    sound.playSfx('dialogue');
    setResponseOverride(choice.response);
    if (choice.friendshipDelta) {
      npcState.friendshipPoints = Math.min(
        2500,
        npcState.friendshipPoints + choice.friendshipDelta
      );
      setHearts(Math.min(10, Math.floor(npcState.friendshipPoints / 250)));
    }
  };

  const handleGiveGift = (slotIndex: number) => {
    const success = gameState.giftNPC(npcId, slotIndex);
    if (success) {
      setIsGiftMode(false);
      setHearts(Math.min(10, Math.floor(npcState.friendshipPoints / 250)));
    }
  };

  const giftableSlots = gameState.data.inventory.filter((s) => s.item !== null);
  const avatarIcon = NPC_AVATAR_ICONS[npcId] || '🧑‍🌾';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 bg-black/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-5 shadow-2xl relative animate-slide-in">
        {/* Top Controls: Voice & Close */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Voice AI: On' : 'Voice AI: Muted'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
              isVoiceEnabled
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                : 'bg-haven-200 border-haven-300 text-haven-600 hover:bg-haven-300'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'AI Voice' : 'Muted'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 border border-haven-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NPC Profile Header */}
        <div className="flex items-center gap-4 pb-3 border-b border-haven-300 mb-3">
          {/* Avatar Box with speaking bounce indicator */}
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border-3 border-haven-700 shadow-md shrink-0 transition-transform ${
                isSpeaking ? 'scale-105 ring-4 ring-emerald-400 animate-pulse' : ''
              }`}
              style={{ backgroundColor: npcDef.avatarColor }}
            >
              <span className="text-3xl">{avatarIcon}</span>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white items-center justify-center text-[8px] text-white font-bold">♪</span>
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-haven-950">{npcDef.name}</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-haven-200 text-haven-700 uppercase">
                {npcDef.title}
              </span>
            </div>

            {/* Friendship Hearts (0..10) */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < hearts ? 'text-rose-500 fill-rose-500' : 'text-haven-300'
                  }`}
                />
              ))}
              <span className="text-[10px] font-bold text-haven-500 ml-1">
                ({npcState.friendshipPoints}/2500)
              </span>
            </div>
          </div>

          {/* Gift Button */}
          {!npcState.giftedToday && (
            <button
              onClick={() => setIsGiftMode(!isGiftMode)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition mr-20 sm:mr-0"
            >
              <Gift className="w-4 h-4" />
              <span>{isGiftMode ? 'Back to Chat' : 'Offer Gift'}</span>
            </button>
          )}
        </div>

        {/* Dialogue Body or Gift Selection */}
        {!isGiftMode ? (
          <div>
            {/* Speech text with Audio Waveform */}
            <div className="min-h-16 text-sm text-haven-900 font-semibold leading-relaxed mb-3 p-3.5 bg-white rounded-xl border border-haven-200 shadow-inner relative">
              <p className="animate-fade-in pr-16">{activeText}</p>

              {/* Speech Controls & Audio Waveform */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-haven-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-haven-500 uppercase tracking-wider">Voice:</span>
                  {/* Procedural Waveform Bars */}
                  <div className="flex items-center gap-0.5 h-4 px-1">
                    {[1, 2, 3, 4, 5, 6].map((bar) => (
                      <span
                        key={bar}
                        className={`w-1 bg-emerald-500 rounded-full transition-all duration-150 ${
                          isSpeaking
                            ? `animate-bounce h-${(bar % 3) + 2}`
                            : 'h-1 opacity-30'
                        }`}
                        style={{
                          height: isSpeaking ? `${((bar * 3) % 12) + 4}px` : '4px',
                          animationDelay: `${bar * 60}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleReplayVoice}
                  title="Replay Voice Line"
                  className="px-2 py-1 bg-haven-100 hover:bg-haven-200 text-haven-700 text-[11px] font-bold rounded-lg border border-haven-300 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>
            </div>

            {/* Choice Buttons */}
            {currentLine.choices && !responseOverride && (
              <div className="space-y-1.5">
                {currentLine.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left px-3.5 py-2 rounded-xl bg-haven-100 hover:bg-haven-200 border border-haven-300 hover:border-haven-500 text-xs font-bold text-haven-900 flex items-center justify-between transition group shadow-xs"
                  >
                    <span>💬 {choice.text}</span>
                    <span className="text-haven-400 group-hover:text-haven-700">➔</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-xs font-black text-haven-800 uppercase mb-2">
              Select an item from your backpack to gift {npcDef.name}:
            </h4>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-haven-200">
              {giftableSlots.map((slot) => (
                <button
                  key={slot.slotIndex}
                  onClick={() => handleGiveGift(slot.slotIndex)}
                  className="aspect-square flex flex-col items-center justify-center p-1 bg-haven-100 hover:bg-amber-100 border-2 border-haven-300 hover:border-amber-500 rounded-xl transition group relative"
                >
                  <span className="text-2xl group-hover:scale-110 transition">
                    {getItemEmoji(slot.item?.id || '')}
                  </span>
                  <span className="text-[10px] font-black text-haven-800 line-clamp-1 mt-0.5">
                    {slot.item?.name}
                  </span>
                  <span className="absolute bottom-1 right-1 text-[9px] font-black px-1 rounded bg-haven-300 text-haven-900">
                    x{slot.quantity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
