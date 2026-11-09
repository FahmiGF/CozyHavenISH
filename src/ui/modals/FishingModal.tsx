import React, { useState, useEffect } from 'react';
import { gameState } from '../../domain/GameState';
import { sound } from '../../domain/SoundSynth';
import { getItemEmoji } from '../Hotbar';
import { X, Fish, Anchor } from 'lucide-react';

interface FishingModalProps {
  onClose: () => void;
}

export const FishingModal: React.FC<FishingModalProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'waiting' | 'bite' | 'reeling' | 'caught'>('waiting');
  const [progress, setProgress] = useState<number>(30);
  const [caughtFish, setCaughtFish] = useState<string | null>(null);

  useEffect(() => {
    // Wait 1.5 - 3 seconds for fish to bite
    const biteTimer = setTimeout(() => {
      sound.playSfx('fish_bite');
      setPhase('bite');
    }, 1800);

    return () => clearTimeout(biteTimer);
  }, []);

  const handleHook = () => {
    if (phase === 'bite') {
      sound.playSfx('click');
      setPhase('reeling');
    }
  };

  const handleReelClick = () => {
    if (phase !== 'reeling') return;
    sound.playSfx('step');
    setProgress((prev) => {
      const next = prev + 15;
      if (next >= 100) {
        completeCatch();
        return 100;
      }
      return next;
    });
  };

  // Passive line drop if not clicking fast enough
  useEffect(() => {
    if (phase !== 'reeling') return;
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 4));
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  const completeCatch = () => {
    const isNight = gameState.data.time.timeOfDay === 'night';
    const roll = Math.random();
    let picked = 'fish_bluecarp';

    if (roll < 0.45) picked = 'fish_bluecarp';
    else if (roll < 0.75) picked = 'fish_sunbass';
    else if (isNight && roll < 0.92) picked = 'fish_moonlight_salmon';
    else picked = 'fish_rainbow_trout';

    setCaughtFish(picked);
    setPhase('caught');
    sound.playSfx('harvest');
    gameState.addItem(picked, 1);
    gameState.data.statistics.fishCaught += 1;
    gameState.checkQuestProgress('catch_fish', picked, 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-md bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Fish className="w-7 h-7 text-sky-600" />
          <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
            Angler's Minigame
          </h2>
        </div>

        {phase === 'waiting' && (
          <div className="py-8 space-y-3">
            <div className="text-4xl animate-bounce">🎣</div>
            <p className="text-sm font-bold text-haven-700">Casting line... waiting for a bite...</p>
            <div className="w-32 h-1.5 bg-haven-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}

        {phase === 'bite' && (
          <div className="py-6 space-y-4">
            <div className="text-4xl text-rose-500 font-black animate-ping">❗</div>
            <p className="text-sm font-black text-rose-600">FISH ON THE HOOK! QUICK, PULL!</p>
            <button
              onClick={handleHook}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 font-black text-sm rounded-2xl shadow-cozy border-2 border-amber-700 uppercase tracking-wider"
            >
              HOOK FISH!
            </button>
          </div>
        )}

        {phase === 'reeling' && (
          <div className="py-4 space-y-4">
            <p className="text-xs font-bold text-haven-600">Click rapidly to reel the fish into your net!</p>

            {/* Reel progress bar */}
            <div className="w-full bg-haven-200 h-6 rounded-full overflow-hidden p-1 border-2 border-haven-400">
              <div
                className="h-full bg-emerald-500 transition-all duration-100 rounded-full flex items-center justify-end pr-2 text-[10px] font-black text-white"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>

            <button
              onClick={handleReelClick}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base rounded-2xl shadow-cozy border-2 border-emerald-800 uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Anchor className="w-5 h-5" />
              <span>REEL IN! (CLICK FAST)</span>
            </button>
          </div>
        )}

        {phase === 'caught' && caughtFish && (
          <div className="py-6 space-y-4">
            <span className="text-5xl block animate-bounce">{getItemEmoji(caughtFish)}</span>
            <div>
              <h3 className="text-lg font-black text-emerald-900">
                You caught a {caughtFish.replace('fish_', '').replace('_', ' ').toUpperCase()}!
              </h3>
              <p className="text-xs font-bold text-haven-600">Added to your backpack. You can donate it to the museum or sell it!</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-sm uppercase tracking-wide"
            >
              Awesome!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
