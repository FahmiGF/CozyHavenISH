import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { sound } from '../../domain/SoundSynth';
import { NPCS_DATABASE } from '../../types/npcs';
import { CROPS_DATABASE } from '../../types/crops';
import { COOKING_RECIPES } from '../../types/cooking';
import {
  X,
  BookOpen,
  Keyboard,
  Sprout,
  Compass,
  Users,
  Fish,
  Utensils,
  Pickaxe,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

type GuideTab =
  | 'controls'
  | 'farming'
  | 'archipelago'
  | 'villagers'
  | 'fishing'
  | 'cooking'
  | 'mining'
  | 'achievements';

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('controls');
  const achievements = gameState.getAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleTabChange = (tab: GuideTab) => {
    sound.playSfx('click');
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 md:p-6 pointer-events-auto">
      <div className="cozy-panel w-full max-w-4xl max-h-[92vh] bg-haven-50 border-4 border-haven-800 p-4 md:p-6 shadow-2xl flex flex-col relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center border-2 border-amber-600 shadow-sm text-2xl">
              📖
            </div>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide flex items-center gap-2">
                CozyHaven Explorer's Field Guide & Manual
              </h2>
              <p className="text-xs font-semibold text-haven-600">
                Official guide to island life, farming, controls, archipelago secrets, and achievements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
            title="Close Guide [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-haven-200 shrink-0 scrollbar-none text-xs font-bold">
          <button
            onClick={() => handleTabChange('controls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'controls'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Controls</span>
          </button>
          <button
            onClick={() => handleTabChange('farming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'farming'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Farming & Crops</span>
          </button>
          <button
            onClick={() => handleTabChange('archipelago')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'archipelago'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Archipelago & Fast Travel</span>
          </button>
          <button
            onClick={() => handleTabChange('villagers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'villagers'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Villagers (12)</span>
          </button>
          <button
            onClick={() => handleTabChange('fishing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'fishing'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Fish className="w-4 h-4" />
            <span>Fishing</span>
          </button>
          <button
            onClick={() => handleTabChange('cooking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'cooking'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Cooking</span>
          </button>
          <button
            onClick={() => handleTabChange('mining')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'mining'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Pickaxe className="w-4 h-4" />
            <span>Mining</span>
          </button>
          <button
            onClick={() => handleTabChange('achievements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeTab === 'achievements'
                ? 'bg-haven-800 text-white shadow-sm'
                : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Achievements ({unlockedCount}/10)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          {/* 1. CONTROLS TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="bg-haven-100 p-4 rounded-2xl border-2 border-haven-300">
                <h3 className="text-sm font-black text-haven-900 mb-2 flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-haven-700" />
                  Primary Keyboard & Mouse Shortcuts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Walk / Move</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      W A S D / Arrow Keys
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Tool Action / Use Item</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [Space] or Left Click
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Talk to Villager / Inspect</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [E]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Hotbar Selection</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      Keys [1] - [9]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Toggle 2D / 3D Perspective</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [V]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Backpack & Inventory</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [Q]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Island Archipelago Map</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [M]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Quest Journal</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [Tab]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Explorer's Guide (This Menu)</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [H] or [F1]
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200">
                    <span className="font-semibold text-haven-700">Settings / Close Menu</span>
                    <kbd className="px-2 py-0.5 rounded bg-haven-200 border border-haven-400 font-mono font-bold text-haven-900">
                      [Escape]
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300">
                <h3 className="text-sm font-black text-amber-950 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Energy & Vitality Tips
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed mb-2">
                  Every tool use (tilling, watering, mining) expends stamina. Avoid exhausting yourself to 0 energy!
                </p>
                <ul className="text-xs text-amber-900 list-disc list-inside space-y-1">
                  <li><strong>Natural Hot Springs:</strong> Visit the hot springs at Whispering Forest for continuous +3 energy/second healing!</li>
                  <li><strong>Nourishing Food:</strong> Eat harvested crops or cook hot meals in the cottage kitchen.</li>
                  <li><strong>Restful Sleep:</strong> Sleep in your bed at the farmhouse to restore 100% full energy for the next day.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. FARMING TAB */}
          {activeTab === 'farming' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-300">
                <h3 className="text-sm font-black text-emerald-950 mb-2 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  The 4-Step Farming Cycle
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-center">
                    <div className="text-2xl mb-1">⛏️</div>
                    <h4 className="font-black text-emerald-950">1. Till the Soil</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">Select your Garden Hoe and press Space on dirt tiles.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-center">
                    <div className="text-2xl mb-1">🌱</div>
                    <h4 className="font-black text-emerald-950">2. Plant Seeds</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">Select seeds from your hotbar and plant in tilled plots.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <h4 className="font-black text-emerald-950">3. Water Daily</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">Water crops every morning. Rainy days water plots automatically!</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-center">
                    <div className="text-2xl mb-1">✨</div>
                    <h4 className="font-black text-emerald-950">4. Harvest & Profit</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">Harvest mature produce. Sell in the Shipping Bin or cook recipes.</p>
                  </div>
                </div>
              </div>

              <div className="bg-haven-100 p-4 rounded-2xl border-2 border-haven-300">
                <h3 className="text-sm font-black text-haven-900 mb-2">Island Crop Almanac</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.values(CROPS_DATABASE).map((crop) => (
                    <div key={crop.id} className="p-2.5 rounded-xl bg-white border border-haven-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-haven-950">{crop.name}</div>
                        <div className="text-[10px] text-haven-600">Growth: {crop.growthDays} days {crop.regrows ? '(Regrowable)' : ''}</div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 capitalize">
                        {crop.seasons.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ARCHIPELAGO & FAST TRAVEL TAB */}
          {activeTab === 'archipelago' && (
            <div className="space-y-4">
              <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-300">
                <h3 className="text-sm font-black text-sky-950 mb-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-600" />
                  Instant Fast Travel Across 8 Island Zones
                </h3>
                <p className="text-xs text-sky-900 leading-relaxed">
                  You can walk naturally through boundary gateways between islands, or press <strong>[M]</strong> anytime to open the <strong>Archipelago Navigator</strong>. Click <strong>"⛵ Travel"</strong> on any island card to fast travel instantly with zero loading delay!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300">
                  <h4 className="font-black text-emerald-950 flex items-center gap-1.5 mb-1">
                    🏡 Home Farm & Cottage
                  </h4>
                  <p className="text-emerald-800 text-[11px]">Your starter homestead with fertile tilled plots, cozy interior cottage, kitchen stove, and animal pasture.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300">
                  <h4 className="font-black text-amber-950 flex items-center gap-1.5 mb-1">
                    🏘️ Cozy Village Plaza
                  </h4>
                  <p className="text-amber-800 text-[11px]">Heart of island society with Rowan's General Store, town hall bulletin board, and lively villager gatherings.</p>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border-2 border-sky-300">
                  <h4 className="font-black text-sky-950 flex items-center gap-1.5 mb-1">
                    🌊 Bluebell Beach & Pier
                  </h4>
                  <p className="text-sky-800 text-[11px]">Sandy shoreline with Captain Finley's fishing pier, ocean tides, rare seashells, and marine life.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100/90 border-2 border-emerald-400">
                  <h4 className="font-black text-emerald-950 flex items-center gap-1.5 mb-1">
                    🌲 Whispering Forest & Hot Springs
                  </h4>
                  <p className="text-emerald-900 text-[11px]">Ancient timberland, tranquil Shinto Torii gate, and steaming thermal hot springs for rapid stamina healing.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border-2 border-slate-400">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5 mb-1">
                    ⛏️ Crystal Caverns & Mine
                  </h4>
                  <p className="text-slate-800 text-[11px]">Subterranean tunnels with stone boulders, rich iron and gold ore deposits, and glowing purple amethyst crystals.</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border-2 border-indigo-300">
                  <h4 className="font-black text-indigo-950 flex items-center gap-1.5 mb-1">
                    🏔️ Skyreach Summit
                  </h4>
                  <p className="text-indigo-900 text-[11px]">High altitude peak, astronomical observatory telescope, and pristine snow-dusted sanctuary.</p>
                </div>
                <div className="p-3 rounded-xl bg-lime-50 border-2 border-lime-300">
                  <h4 className="font-black text-lime-950 flex items-center gap-1.5 mb-1">
                    🍎 Whispering Orchard
                  </h4>
                  <p className="text-lime-900 text-[11px]">Lush fruit groves with rotating Dutch windmill, buzzing apiary honey bee hives, and peach/apple trees.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100 border-2 border-amber-400">
                  <h4 className="font-black text-amber-950 flex items-center gap-1.5 mb-1">
                    ☀️ Sunbaked Oasis & Dunes
                  </h4>
                  <p className="text-amber-900 text-[11px]">Exotic golden desert sands with ancient sun obelisk ruins, palm groves, and turquoise water spring.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. VILLAGERS TAB */}
          {activeTab === 'villagers' && (
            <div className="space-y-3">
              <div className="bg-haven-100 p-3 rounded-xl border border-haven-300 text-xs text-haven-800">
                Meet all 12 island inhabitants! Speak with them daily for +20 friendship points and discover their favorite gifts.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(NPCS_DATABASE).map((npc) => {
                  const state = gameState.data.npcs[npc.id];
                  return (
                    <div key={npc.id} className="p-3 rounded-xl bg-white border border-haven-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: npc.avatarColor }}
                          >
                            {npc.name[0]}
                          </span>
                          <div>
                            <div className="font-black text-haven-950 text-xs">{npc.name}</div>
                            <div className="text-[10px] text-haven-600">{npc.title}</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-haven-700 italic mb-2 line-clamp-2">"{npc.bio}"</p>
                      </div>
                      <div className="border-t border-haven-100 pt-1.5 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-haven-600">Home: {npc.schedule[0]?.mapId || 'village'}</span>
                        <span className="font-black text-rose-600">❤️ {state ? state.friendshipPoints : 0} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. FISHING TAB */}
          {activeTab === 'fishing' && (
            <div className="space-y-4">
              <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-300">
                <h3 className="text-sm font-black text-sky-950 mb-1 flex items-center gap-2">
                  <Fish className="w-4 h-4 text-sky-600" />
                  Angler's Guide
                </h3>
                <p className="text-xs text-sky-900 leading-relaxed mb-3">
                  Equip your Fishing Rod from your hotbar, stand facing the ocean or river, and press [Space] to cast your line.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200">
                    <span className="text-lg">🎣</span>
                    <h4 className="font-black text-sky-950 mt-1">1. Cast & Wait</h4>
                    <p className="text-[11px] text-sky-800">Watch the water ripples until an exclamation mark appears.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200">
                    <span className="text-lg">⚡</span>
                    <h4 className="font-black text-sky-950 mt-1">2. Strike!</h4>
                    <p className="text-[11px] text-sky-800">Press Space quickly when the fish bites to hook it.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200">
                    <span className="text-lg">🐟</span>
                    <h4 className="font-black text-sky-950 mt-1">3. Reel Rapidly</h4>
                    <p className="text-[11px] text-sky-800">Click rapidly to keep tension on the line and land your catch!</p>
                  </div>
                </div>
              </div>

              <div className="bg-haven-100 p-4 rounded-2xl border-2 border-haven-300">
                <h4 className="text-xs font-black text-haven-900 mb-2">Island Marine Species</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-haven-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-haven-950">Blue Carp</span>
                      <p className="text-[10px] text-haven-600">Freshwater rivers & lakes (All Day)</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800">45 🪙</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-haven-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-haven-950">Sun Bass</span>
                      <p className="text-[10px] text-haven-600">Warm beach coastlines (Morning & Day)</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800">65 🪙</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-haven-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-haven-950">Moonlight Salmon</span>
                      <p className="text-[10px] text-haven-600">Bioluminescent nocturnal rare catch (Night)</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800">140 🪙</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-haven-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-haven-950">Rainbow Trout</span>
                      <p className="text-[10px] text-haven-600">Deep waters & sparkling spring rivers</p>
                    </div>
                    <span className="font-mono font-bold text-amber-800">180 🪙</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. COOKING TAB */}
          {activeTab === 'cooking' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300">
                <h3 className="text-sm font-black text-amber-950 mb-1 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  Cottage Kitchen Cooking
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Interact with the stove in your farmhouse kitchen or click the chef hat button on the HUD to open the Kitchen Cooking menu. Prepare hearty meals to restore maximum energy!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {COOKING_RECIPES.map((recipe) => (
                  <div key={recipe.id} className="p-3 rounded-xl bg-white border border-haven-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{recipe.icon}</span>
                        <div>
                          <div className="font-black text-haven-950 text-xs">{recipe.name}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">+{recipe.energyRestored} Energy</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-haven-600 mb-2">{recipe.description}</p>
                    </div>
                    <div className="text-[10px] text-haven-700 bg-haven-50 p-1.5 rounded-lg border border-haven-100 font-medium">
                      Ingredients: {recipe.ingredients.map((ing) => `${ing.quantity}x ${ing.itemId.replace('seed_', '').replace('crop_', '').replace('mat_', '')}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. MINING TAB */}
          {activeTab === 'mining' && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-2xl border-2 border-slate-300">
                <h3 className="text-sm font-black text-slate-950 mb-1 flex items-center gap-2">
                  <Pickaxe className="w-4 h-4 text-slate-700" />
                  Mineral Veins & Pickaxe Mining
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Equip your sturdy pickaxe and delve into Crystal Caverns or clear boulders on your farm. Mine stone, iron ore, gold nuggets, and rare amethyst crystals used for crafting, building upgrades, and museum donations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-2xl mb-1">🪨</div>
                  <h4 className="font-black text-slate-900">Stone Node</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Common rock for paths & fences.</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-2xl mb-1">⛓️</div>
                  <h4 className="font-black text-slate-900">Iron Vein</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Sturdy metal for tool upgrades.</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-2xl mb-1">🪙</div>
                  <h4 className="font-black text-slate-900">Gold Vein</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Precious mineral of high trade value.</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-2xl mb-1">💎</div>
                  <h4 className="font-black text-slate-900">Amethyst Crystal</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Rare sparkling gemstone.</p>
                </div>
              </div>
            </div>
          )}

          {/* 8. ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="bg-gradient-to-r from-amber-100 to-emerald-100 p-4 rounded-2xl border-2 border-amber-300 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-haven-950 flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    Archipelago Mastery & Badges
                  </h3>
                  <p className="text-xs font-semibold text-haven-700">
                    Unlock badges as you farm, fish, cook, explore, and befriend villagers.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-amber-950">
                    {unlockedCount} / {achievements.length}
                  </div>
                  <span className="text-[10px] font-bold text-haven-600 uppercase tracking-wider">Unlocked</span>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map(({ definition, unlocked, unlockedAt }) => (
                  <div
                    key={definition.id}
                    className={`p-3 rounded-xl border-2 transition flex items-start gap-3 ${
                      unlocked
                        ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-haven-100/70 border-haven-300 text-haven-700 opacity-75'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                        unlocked ? 'bg-amber-300 border-2 border-amber-500' : 'bg-haven-200 border-2 border-haven-400'
                      }`}
                    >
                      {definition.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-xs text-haven-950">{definition.title}</h4>
                        {unlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-haven-500">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-haven-700 mt-0.5">{definition.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-amber-800">Reward: +{definition.rewardCoins} 🪙</span>
                        {unlocked && unlockedAt && (
                          <span className="text-haven-500 font-mono text-[9px]">
                            {new Date(unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-haven-200 flex items-center justify-between text-xs font-semibold text-haven-600 shrink-0">
          <span>Tip: Press [H] anytime during your adventure to reference this guide.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-haven-800 hover:bg-haven-900 text-white font-black text-xs transition active:scale-95"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
