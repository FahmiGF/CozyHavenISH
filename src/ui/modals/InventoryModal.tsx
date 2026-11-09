import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { InventorySlot, ItemCategory } from '../../types/items';
import { getItemEmoji } from '../Hotbar';
import { sound } from '../../domain/SoundSynth';
import { EventBus } from '../../domain/EventBus';
import { X, ArrowUpDown, Trash2, Armchair, Utensils } from 'lucide-react';

interface InventoryModalProps {
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ onClose }) => {
  const [inventory, setInventory] = useState<InventorySlot[]>(gameState.data.inventory);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedSlot = selectedSlotIndex !== null ? inventory[selectedSlotIndex] : null;
  const selectedItem = selectedSlot?.item;

  const handleConsume = () => {
    if (!selectedSlot || !selectedItem || !selectedItem.energyBonus) return;
    const bonus = selectedItem.energyBonus;
    gameState.data.player.energy = Math.min(
      gameState.data.player.maxEnergy,
      gameState.data.player.energy + bonus
    );
    gameState.removeItem(selectedSlot.slotIndex, 1);
    sound.playSfx('harvest');
    EventBus.emit('ENERGY_CHANGED', gameState.data.player.energy, gameState.data.player.maxEnergy);
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Yum!',
      message: `Ate ${selectedItem.name}! Restored +${bonus} Energy.`,
      icon: '😋',
    });
    setInventory([...gameState.data.inventory]);
  };

  const handlePlaceFurniture = () => {
    if (!selectedSlot || !selectedItem || selectedItem.category !== 'furniture') return;
    onClose();
    EventBus.emit('START_FURNITURE_PLACEMENT', selectedItem.id);
  };

  const handleTrash = () => {
    if (!selectedSlot || !selectedItem) return;
    gameState.removeItem(selectedSlot.slotIndex, selectedSlot.quantity);
    sound.playSfx('click');
    setInventory([...gameState.data.inventory]);
  };

  const handleSort = () => {
    // Group identical stackables, sort by category then name
    sound.playSfx('click');
    const items = gameState.data.inventory.filter((s) => s.item !== null);
    items.sort((a, b) => {
      if (a.item!.category !== b.item!.category) {
        return a.item!.category.localeCompare(b.item!.category);
      }
      return a.item!.name.localeCompare(b.item!.name);
    });

    const newInv: InventorySlot[] = Array.from({ length: 24 }, (_, i) => ({
      slotIndex: i,
      item: items[i]?.item || null,
      quantity: items[i]?.quantity || 0,
      quality: items[i]?.quality,
    }));

    gameState.data.inventory = newInv;
    setInventory([...newInv]);
    EventBus.emit('INVENTORY_UPDATED', newInv);
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'tool', label: 'Tools' },
    { id: 'seed', label: 'Seeds' },
    { id: 'crop', label: 'Crops' },
    { id: 'material', label: 'Materials' },
    { id: 'forage', label: 'Forage' },
    { id: 'fish', label: 'Fish' },
    { id: 'bug', label: 'Bugs' },
    { id: 'furniture', label: 'Furniture' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">Backpack Inventory</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSort}
              className="px-3 py-1 bg-haven-200 hover:bg-haven-300 text-haven-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-haven-400"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                categoryFilter === cat.id
                  ? 'bg-haven-800 text-white shadow-xs'
                  : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid and Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 24-slot Backpack Grid (2 columns on left) */}
          <div className="md:col-span-2 grid grid-cols-6 gap-2 bg-haven-100 p-3 rounded-2xl border-2 border-haven-300">
            {inventory.map((slot, idx) => {
              const item = slot.item;
              const matchesFilter =
                categoryFilter === 'all' || (item && item.category === categoryFilter);
              const isSelected = selectedSlotIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSlotIndex(idx);
                    sound.playSfx('click');
                  }}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center relative transition-all ${
                    isSelected
                      ? 'bg-amber-100 border-3 border-amber-600 shadow-md ring-2 ring-amber-400 scale-105'
                      : 'bg-white border-2 border-haven-300 hover:border-haven-400'
                  } ${!matchesFilter ? 'opacity-30' : 'opacity-100'}`}
                >
                  {item && (
                    <span className="text-2xl select-none" title={item.name}>
                      {getItemEmoji(item.id)}
                    </span>
                  )}
                  {slot.quantity > 1 && (
                    <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-haven-900 bg-haven-200/95 px-1 rounded-sm font-mono">
                      {slot.quantity}
                    </span>
                  )}
                  {slot.quality && slot.quality !== 'normal' && (
                    <span className="absolute top-0.5 right-1 text-[10px] text-amber-500">★</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Item Details Card (Right Column) */}
          <div className="cozy-panel p-4 bg-white border-2 border-haven-400 flex flex-col justify-between">
            {selectedItem ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 bg-haven-100 rounded-xl border border-haven-300">
                      {getItemEmoji(selectedItem.id)}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-haven-900 leading-tight">{selectedItem.name}</h3>
                      <span className="text-[10px] font-bold text-haven-600 uppercase tracking-wide">
                        {selectedItem.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-haven-700 font-medium leading-relaxed mb-3">
                    {selectedItem.description}
                  </p>

                  <div className="space-y-1.5 text-xs bg-haven-50 p-2.5 rounded-xl border border-haven-200 mb-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-haven-600">Sell Value:</span>
                      <span className="font-bold text-amber-700">🪙 {selectedItem.sellPrice} Coins</span>
                    </div>
                    {selectedItem.energyBonus && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-haven-600">Energy Gain:</span>
                        <span className="font-bold text-emerald-600">⚡ +{selectedItem.energyBonus} Energy</span>
                      </div>
                    )}
                    {selectedSlot?.quality && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-haven-600">Quality:</span>
                        <span className="font-bold capitalize text-amber-600">{selectedSlot.quality}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contextual Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-haven-200">
                  {selectedItem.energyBonus && (
                    <button
                      onClick={handleConsume}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Eat / Restore Energy</span>
                    </button>
                  )}

                  {selectedItem.category === 'furniture' && (
                    <button
                      onClick={handlePlaceFurniture}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm"
                    >
                      <Armchair className="w-4 h-4" />
                      <span>Place in Room</span>
                    </button>
                  )}

                  <button
                    onClick={handleTrash}
                    className="w-full py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Item</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-haven-400">
                <span className="text-4xl mb-2">🌿</span>
                <p className="text-xs font-bold">Select an item from your backpack to inspect its details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
