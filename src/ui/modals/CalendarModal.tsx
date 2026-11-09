import React from 'react';
import { gameState } from '../../domain/GameState';
import { NPCS_DATABASE } from '../../types/npcs';
import { X, Cake, Sparkles } from 'lucide-react';

interface CalendarModalProps {
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ onClose }) => {
  const time = gameState.data.time;

  const birthdaysThisSeason = Object.values(NPCS_DATABASE).filter(
    (npc) => npc.birthday.season === time.season
  );

  const daysInSeason = 28;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                Season of {time.season} (Year {time.year})
              </h2>
              <p className="text-xs font-semibold text-haven-600">
                Track village birthdays, blooming festivals, and weather shifts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 28-Day Grid (4 rows x 7 days) */}
        <div className="grid grid-cols-7 gap-2 bg-haven-100 p-3 rounded-2xl border-2 border-haven-300 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-[10px] font-black uppercase text-haven-600 pb-1">
              {d}
            </div>
          ))}

          {Array.from({ length: daysInSeason }, (_, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === time.day;
            const birthdayNpc = birthdaysThisSeason.find((npc) => npc.birthday.day === dayNum);
            const isFestival = dayNum === 13 || dayNum === 28;

            return (
              <div
                key={dayNum}
                className={`h-14 rounded-xl p-1 flex flex-col justify-between border-2 transition relative ${
                  isToday
                    ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400 font-black'
                    : 'bg-white border-haven-200 hover:border-haven-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-haven-800">{dayNum}</span>
                  {isToday && (
                    <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-200 px-1 rounded-sm">
                      Today
                    </span>
                  )}
                </div>

                {birthdayNpc && (
                  <div
                    className="flex items-center gap-1 text-[9px] font-bold text-pink-700 bg-pink-100 px-1 py-0.5 rounded-sm"
                    title={`${birthdayNpc.name}'s Birthday!`}
                  >
                    <Cake className="w-3 h-3 text-pink-500 shrink-0" />
                    <span className="truncate">{birthdayNpc.name}</span>
                  </div>
                )}

                {isFestival && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-100 px-1 py-0.5 rounded-sm">
                    <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                    <span>Festival</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
