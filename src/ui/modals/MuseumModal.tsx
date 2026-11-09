import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { ITEMS_DATABASE } from '../../types/items';
import { getItemEmoji } from '../Hotbar';
import { X, Landmark, CheckCircle, HelpCircle } from 'lucide-react';

interface MuseumModalProps {
  onClose: () => void;
}

export const MuseumModal: React.FC<MuseumModalProps> = ({ onClose }) => {
  const [donations, setDonations] = useState<string[]>(gameState.data.museumDonations);
  const [tab, setTab] = useState<'aquarium' | 'insects' | 'botany'>('aquarium');

  const museumExhibits = {
    aquarium: [
      'fish_bluecarp',
      'fish_sunbass',
      'fish_moonlight_salmon',
      'fish_rainbow_trout',
    ],
    insects: [
      'bug_butterfly',
      'bug_ladybug',
      'bug_dragonfly',
      'bug_firefly',
    ],
    botany: [
      'forage_wildberry',
      'forage_mushroom',
      'forage_seashell',
      'crop_bluerose',
      'crop_sunflower',
      'crop_pumpkin',
    ],
  };

  // Find eligible items in backpack
  const eligibleBackpackSlots = gameState.data.inventory.filter((s) => {
    if (!s.item) return false;
    const allExhibits = [
      ...museumExhibits.aquarium,
      ...museumExhibits.insects,
      ...museumExhibits.botany,
    ];
    return allExhibits.includes(s.item.id) && !donations.includes(s.item.id);
  });

  const handleDonate = (slotIndex: number) => {
    const success = gameState.donateToMuseum(slotIndex);
    if (success) {
      setDonations([...gameState.data.museumDonations]);
    }
  };

  const currentList = museumExhibits[tab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                CozyHaven Community Museum
              </h2>
              <p className="text-xs font-semibold text-haven-600">
                Preserving island ecology and ancient botanical heritage. ({donations.length}/14 Donated)
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

        {/* Gallery Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab('aquarium')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
              tab === 'aquarium'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
            }`}
          >
            🐟 Aquarium Gallery
          </button>
          <button
            onClick={() => setTab('insects')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
              tab === 'insects'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
            }`}
          >
            🦋 Insectarium
          </button>
          <button
            onClick={() => setTab('botany')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
              tab === 'botany'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
            }`}
          >
            🌿 Botanical Garden
          </button>
        </div>

        {/* Exhibit Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 max-h-64 overflow-y-auto pr-1">
          {currentList.map((itemId) => {
            const isDonated = donations.includes(itemId);
            const itemDef = ITEMS_DATABASE[itemId];

            return (
              <div
                key={itemId}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition ${
                  isDonated
                    ? 'bg-white border-emerald-400 shadow-sm'
                    : 'bg-haven-100/60 border-haven-300 opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-haven-50 border border-haven-200 mb-2">
                  {isDonated ? (
                    <span className="text-2xl">{getItemEmoji(itemId)}</span>
                  ) : (
                    <HelpCircle className="w-6 h-6 text-haven-400" />
                  )}
                </div>

                <h4 className="text-xs font-black text-haven-900 leading-tight mb-1">
                  {isDonated ? itemDef?.name : '??? Unknown'}
                </h4>

                {isDonated ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Donated
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-haven-400">Undiscovered</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Donation action from Backpack */}
        <div className="p-3 bg-white rounded-2xl border-2 border-haven-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-haven-800 uppercase">
              Eligible Items to Donate (+50 Coins Stipend):
            </h4>
            <span className="text-[11px] font-bold text-amber-700">
              {eligibleBackpackSlots.length} Ready to Donate
            </span>
          </div>

          {eligibleBackpackSlots.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {eligibleBackpackSlots.map((slot) => (
                <button
                  key={slot.slotIndex}
                  onClick={() => handleDonate(slot.slotIndex)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-black transition active:scale-95"
                >
                  <span className="text-base">{getItemEmoji(slot.item!.id)}</span>
                  <span>Donate {slot.item?.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-haven-500">
              No new un-donated specimens in your backpack. Go fishing, forage, or catch bugs to donate!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
