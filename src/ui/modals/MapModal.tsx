import React from 'react';
import { gameState } from '../../domain/GameState';
import { NPCS_DATABASE } from '../../types/npcs';
import {
  X,
  Navigation,
  Pickaxe,
  Waves,
  Flame,
  Sun,
  Mountain,
  Apple,
  Home,
  Store,
} from 'lucide-react';
import { MapId } from '../../types/game';

interface MapModalProps {
  onClose: () => void;
}

interface ZoneCardConfig {
  id: MapId;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  bgActive: string;
  bgIdle: string;
  textColor: string;
  badgeCol: string;
}

export const MapModal: React.FC<MapModalProps> = ({ onClose }) => {
  const currentMap = gameState.data.player.activeMap;

  const handleFastTravel = (zoneId: MapId) => {
    gameState.fastTravelTo(zoneId);
    onClose();
  };

  const getVillagersInMap = (mapId: MapId) => {
    return Object.values(NPCS_DATABASE).filter((npc) => {
      const state = gameState.data.npcs[npc.id];
      return state && state.currentMap === mapId;
    });
  };

  const zones: ZoneCardConfig[] = [
    {
      id: 'summit',
      name: 'Skyreach Summit',
      tagline: 'Observatory & Wind Shrine',
      icon: <Mountain className="w-4 h-4 text-sky-300" />,
      bgActive: 'bg-slate-700 text-white border-sky-400 ring-2 ring-sky-300',
      bgIdle: 'bg-slate-800/80 text-slate-100 border-slate-600',
      textColor: 'text-sky-300',
      badgeCol: 'bg-sky-400 text-slate-950',
    },
    {
      id: 'mine',
      name: 'Crystal Caverns',
      tagline: 'Forge & Mineral Veins',
      icon: <Pickaxe className="w-4 h-4 text-amber-400" />,
      bgActive: 'bg-slate-900 text-white border-amber-400 ring-2 ring-amber-300',
      bgIdle: 'bg-slate-800/70 text-slate-200 border-slate-700',
      textColor: 'text-amber-300',
      badgeCol: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'forest',
      name: 'Whispering Forest',
      tagline: 'Hot Springs ♨️ & Torii Gate',
      icon: <Flame className="w-4 h-4 text-emerald-300" />,
      bgActive: 'bg-emerald-900 text-white border-emerald-400 ring-2 ring-emerald-300',
      bgIdle: 'bg-emerald-950/70 text-emerald-100 border-emerald-800',
      textColor: 'text-emerald-300',
      badgeCol: 'bg-emerald-400 text-emerald-950',
    },
    {
      id: 'farm',
      name: 'Home Homestead',
      tagline: 'Cottage, Crops & Pasture',
      icon: <Home className="w-4 h-4 text-emerald-600" />,
      bgActive: 'bg-emerald-100/95 border-emerald-600 ring-2 ring-emerald-400 text-emerald-950',
      bgIdle: 'bg-emerald-50/80 border-emerald-300 text-emerald-900',
      textColor: 'text-emerald-700',
      badgeCol: 'bg-emerald-600 text-white',
    },
    {
      id: 'village',
      name: 'Cozy Village',
      tagline: 'Plaza & General Store',
      icon: <Store className="w-4 h-4 text-amber-700" />,
      bgActive: 'bg-amber-100/95 border-amber-600 ring-2 ring-amber-400 text-amber-950',
      bgIdle: 'bg-amber-50/80 border-amber-300 text-amber-900',
      textColor: 'text-amber-800',
      badgeCol: 'bg-amber-600 text-white',
    },
    {
      id: 'beach',
      name: 'Bluebell Beach',
      tagline: 'Fishing Pier & Reefs',
      icon: <Waves className="w-4 h-4 text-sky-600" />,
      bgActive: 'bg-sky-100/95 border-sky-600 ring-2 ring-sky-400 text-sky-950',
      bgIdle: 'bg-sky-50/80 border-sky-300 text-sky-900',
      textColor: 'text-sky-700',
      badgeCol: 'bg-sky-600 text-white',
    },
    {
      id: 'orchard',
      name: 'Whispering Orchard',
      tagline: 'Windmill, Hives & Fruit',
      icon: <Apple className="w-4 h-4 text-rose-500" />,
      bgActive: 'bg-lime-100/95 border-lime-600 ring-2 ring-lime-400 text-lime-950',
      bgIdle: 'bg-lime-50/80 border-lime-300 text-lime-900',
      textColor: 'text-lime-700',
      badgeCol: 'bg-lime-600 text-white',
    },
    {
      id: 'desert',
      name: 'Sunbaked Oasis',
      tagline: 'Sun Obelisk & Dunes',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      bgActive: 'bg-amber-200/95 border-amber-700 ring-2 ring-amber-500 text-amber-950',
      bgIdle: 'bg-amber-100/70 border-amber-400 text-amber-900',
      textColor: 'text-amber-800',
      badgeCol: 'bg-amber-700 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-4xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                CozyHaven Archipelago Navigator
              </h2>
              <p className="text-xs font-semibold text-haven-600">
                8 interconnected island territories, landmarks, and live villager locations.
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

        {/* 8-Zone Grid Map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-br from-emerald-100 via-sky-100 to-amber-100 rounded-2xl border-3 border-haven-400 p-4 shadow-inner">
          {zones.map((zone) => {
            const isHere = currentMap === zone.id || (zone.id === 'farm' && currentMap === 'house');
            const villagers = getVillagersInMap(zone.id);

            return (
              <div
                key={zone.id}
                className={`rounded-xl border-2 p-3 flex flex-col justify-between transition shadow-sm min-h-[125px] ${
                  isHere ? zone.bgActive : zone.bgIdle
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {zone.icon}
                    <span className="text-xs font-black uppercase tracking-wider block truncate">
                      {zone.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold block ${zone.textColor}`}>
                    {zone.tagline}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {/* Villagers in Zone */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {villagers.map((npc) => (
                      <span
                        key={npc.id}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs border border-white/60"
                        style={{ backgroundColor: npc.avatarColor }}
                        title={`${npc.name} (${npc.title}): ${gameState.data.npcs[npc.id]?.currentActivity || 'Wandering'}`}
                      >
                        {npc.name[0]}
                      </span>
                    ))}
                    {villagers.length === 0 && (
                      <span className="text-[10px] opacity-60 italic">Quiet</span>
                    )}
                  </div>

                  {/* You Are Here Pill or Fast Travel Button */}
                  {isHere ? (
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black shadow-xs animate-bounce ${zone.badgeCol}`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Here</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFastTravel(zone.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-haven-800 hover:bg-haven-950 text-white shadow-xs transition hover:scale-105 active:scale-95"
                      title={`Fast travel to ${zone.name}`}
                    >
                      <span>⛵ Travel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend & Navigation Tips */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-bold text-haven-700 gap-2 border-t border-haven-200 pt-3">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Skyreach</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span>Caverns</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Forest</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Homestead</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Village</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Beach</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
              <span>Orchard</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Desert</span>
            </span>
          </div>
          <span className="text-haven-600 font-semibold text-[11px]">
            Walk across screen borders or press [V] to experience the island in 3D!
          </span>
        </div>
      </div>
    </div>
  );
};
