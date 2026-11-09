import React from 'react';
import { gameState } from '../../domain/GameState';
import { NPCS_DATABASE } from '../../types/npcs';
import { X, Navigation, MapPin, Sparkles, Waves, Flame, Pickaxe } from 'lucide-react';
import { MapId } from '../../types/game';

interface MapModalProps {
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ onClose }) => {
  const currentMap = gameState.data.player.activeMap;

  const getVillagersInMap = (mapId: MapId) => {
    return Object.values(NPCS_DATABASE).filter((npc) => {
      const state = gameState.data.npcs[npc.id];
      return state && state.currentMap === mapId;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-3xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                Island Navigator & World Map
              </h2>
              <p className="text-xs font-semibold text-haven-600">
                Explore CozyHaven's interconnected zones, active villagers, and resources.
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

        {/* Map Visual Diagram */}
        <div className="relative w-full h-84 bg-gradient-to-br from-emerald-100 via-sky-100 to-amber-100 rounded-2xl border-3 border-haven-400 overflow-hidden shadow-inner p-4">
          {/* Subtle grid and decorative ocean water backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

          {/* ZONE 1: Crystal Caverns / Mine (Top-Left) */}
          <div
            className={`absolute top-4 left-6 w-44 h-32 rounded-2xl border-2 p-2.5 flex flex-col justify-between transition shadow-sm ${
              currentMap === 'mine'
                ? 'bg-slate-800 text-white border-amber-400 ring-2 ring-amber-300'
                : 'bg-slate-700/80 text-slate-100 border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <Pickaxe className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider block">Crystal Caverns</span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium block">Iron, Gold & Amethyst Veins</span>
            </div>

            {/* Villagers in Mine */}
            <div className="flex items-center gap-1">
              {getVillagersInMap('mine').map((npc) => (
                <span
                  key={npc.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs border border-white/50"
                  style={{ backgroundColor: npc.avatarColor }}
                  title={`${npc.name} (${npc.title})`}
                >
                  {npc.name[0]}
                </span>
              ))}
            </div>

            {currentMap === 'mine' && (
              <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black self-start shadow-xs animate-bounce">
                <Navigation className="w-3 h-3 text-slate-950" />
                <span>You are here</span>
              </div>
            )}
          </div>

          {/* ZONE 2: Whispering Forest (Top-Center) */}
          <div
            className={`absolute top-4 left-54 w-48 h-32 rounded-2xl border-2 p-2.5 flex flex-col justify-between transition shadow-sm ${
              currentMap === 'forest'
                ? 'bg-emerald-800/90 text-white border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-emerald-900/60 text-emerald-100 border-emerald-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-black uppercase tracking-wider block">Whispering Forest</span>
              </div>
              <span className="text-[10px] text-emerald-200 font-medium block">Hot Springs ♨️ & Pine Forage</span>
            </div>

            {/* Villagers in Forest */}
            <div className="flex items-center gap-1">
              {getVillagersInMap('forest').map((npc) => (
                <span
                  key={npc.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs border border-white/50"
                  style={{ backgroundColor: npc.avatarColor }}
                  title={`${npc.name} (${npc.title})`}
                >
                  {npc.name[0]}
                </span>
              ))}
            </div>

            {currentMap === 'forest' && (
              <div className="flex items-center gap-1 bg-white text-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-black self-start shadow-xs animate-bounce">
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>You are here</span>
              </div>
            )}
          </div>

          {/* ZONE 3: Home Farm & Cottage (Bottom-Left) */}
          <div
            className={`absolute bottom-4 left-6 w-48 h-42 rounded-2xl border-2 p-2.5 flex flex-col justify-between transition shadow-sm ${
              currentMap === 'farm' || currentMap === 'house'
                ? 'bg-emerald-200/90 border-emerald-600 ring-2 ring-emerald-400'
                : 'bg-emerald-100/70 border-emerald-300'
            }`}
          >
            <div>
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Home Homestead
              </span>
              <span className="text-[10px] font-bold text-emerald-700">Cottage, Farmland & Barn</span>
            </div>

            {/* Cottage Interior Indicator */}
            {currentMap === 'house' && (
              <div className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs self-start animate-pulse">
                Inside Cottage 🏠
              </div>
            )}

            {/* Villagers in Farm */}
            <div className="flex items-center gap-1">
              {getVillagersInMap('farm').map((npc) => (
                <span
                  key={npc.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs border border-white/50"
                  style={{ backgroundColor: npc.avatarColor }}
                  title={`${npc.name} (${npc.title})`}
                >
                  {npc.name[0]}
                </span>
              ))}
            </div>

            {currentMap === 'farm' && (
              <div className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-md text-emerald-900 text-[10px] font-black self-start shadow-xs animate-bounce">
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>You are here</span>
              </div>
            )}
          </div>

          {/* ZONE 4: Cozy Village (Center-East) */}
          <div
            className={`absolute bottom-4 left-58 w-44 h-42 rounded-2xl border-2 p-2.5 flex flex-col justify-between transition shadow-sm ${
              currentMap === 'village'
                ? 'bg-amber-100/95 border-amber-600 ring-2 ring-amber-400'
                : 'bg-amber-50/70 border-amber-300'
            }`}
          >
            <div>
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                Cozy Village
              </span>
              <span className="text-[10px] font-bold text-amber-800">General Store & Town Cafe</span>
            </div>

            {/* Villagers in Village */}
            <div className="flex flex-wrap gap-1 bg-white/80 p-1 rounded-lg border border-amber-200">
              {getVillagersInMap('village').map((npc) => (
                <span
                  key={npc.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs"
                  style={{ backgroundColor: npc.avatarColor }}
                  title={`${npc.name} (${npc.title})`}
                >
                  {npc.name[0]}
                </span>
              ))}
            </div>

            {currentMap === 'village' && (
              <div className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-md text-amber-950 text-[10px] font-black self-start shadow-xs animate-bounce">
                <Navigation className="w-3 h-3 text-amber-600" />
                <span>You are here</span>
              </div>
            )}
          </div>

          {/* ZONE 5: Bluebell Beach & Pier (Far-Right) */}
          <div
            className={`absolute top-10 right-4 w-44 h-64 rounded-2xl border-2 p-2.5 flex flex-col justify-between transition shadow-sm ${
              currentMap === 'beach'
                ? 'bg-sky-200/95 border-sky-600 ring-2 ring-sky-400'
                : 'bg-sky-100/70 border-sky-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-700" />
                <span className="text-xs font-black text-sky-950 uppercase tracking-wider block">Bluebell Beach</span>
              </div>
              <span className="text-[10px] font-bold text-sky-800">Wooden Pier & Deep Sea Fishing</span>
            </div>

            {/* Villagers on Beach */}
            <div className="flex flex-wrap gap-1 bg-white/80 p-1 rounded-lg border border-sky-200">
              {getVillagersInMap('beach').map((npc) => (
                <span
                  key={npc.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs"
                  style={{ backgroundColor: npc.avatarColor }}
                  title={`${npc.name} (${npc.title})`}
                >
                  {npc.name[0]}
                </span>
              ))}
            </div>

            {currentMap === 'beach' && (
              <div className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-md text-sky-950 text-[10px] font-black self-start shadow-xs animate-bounce">
                <Navigation className="w-3 h-3 text-sky-600" />
                <span>You are here</span>
              </div>
            )}
          </div>
        </div>

        {/* Legend & Navigation Tips */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-bold text-haven-700 gap-2 border-t border-haven-200 pt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Farm</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Village</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Beach</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
              <span>Forest</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Caverns</span>
            </div>
          </div>
          <span className="text-haven-500 text-[11px]">Walk to screen borders to travel between zones</span>
        </div>
      </div>
    </div>
  );
};
