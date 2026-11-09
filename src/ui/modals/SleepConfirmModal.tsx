import React from 'react';
import { gameState } from '../../domain/GameState';
import { sound } from '../../domain/SoundSynth';
import { X, Moon, Bed } from 'lucide-react';

interface SleepConfirmModalProps {
  onClose: () => void;
}

export const SleepConfirmModal: React.FC<SleepConfirmModalProps> = ({ onClose }) => {
  const handleSleep = () => {
    onClose();
    gameState.sleepAndPassDay();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-sm bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center mx-auto mb-3 text-indigo-700">
          <Moon className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-haven-950 mb-1">Rest for the Night?</h3>
        <p className="text-xs font-semibold text-haven-600 mb-5 leading-relaxed">
          Sleeping will save your progress, restore full energy, sell items in your shipping bin, and advance the calendar day!
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-haven-200 hover:bg-haven-300 text-haven-800 rounded-xl text-xs font-black transition"
          >
            Stay Awake
          </button>
          <button
            onClick={handleSleep}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-cozy flex items-center justify-center gap-1.5 transition"
          >
            <Bed className="w-4 h-4" />
            <span>Sleep Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
