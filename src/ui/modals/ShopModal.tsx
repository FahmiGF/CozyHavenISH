import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { ITEMS_DATABASE, ItemDefinition } from '../../types/items';
import { getItemEmoji } from '../Hotbar';
import { sound } from '../../domain/SoundSynth';
import { X, ShoppingBag, Coins, ArrowRightLeft } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [coins, setCoins] = useState<number>(gameState.data.player.coins);
  const [selectedBuyItem, setSelectedBuyItem] = useState<ItemDefinition | null>(
    ITEMS_DATABASE['seed_turnip']
  );
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [selectedSellIndex, setSelectedSellIndex] = useState<number | null>(null);

  // Shop catalog (seeds, tools, furniture)
  const shopCatalog = Object.values(ITEMS_DATABASE).filter(
    (item) => item.buyPrice && item.buyPrice > 0
  );

  const sellableSlots = gameState.data.inventory.filter(
    (slot) => slot.item && slot.item.sellPrice > 0 && slot.item.category !== 'tool'
  );

  const handleBuy = () => {
    if (!selectedBuyItem || !selectedBuyItem.buyPrice) return;
    const success = gameState.buyItem(selectedBuyItem.id, buyQuantity);
    if (success) {
      setCoins(gameState.data.player.coins);
    }
  };

  const handleSell = (slotIndex: number) => {
    const success = gameState.sellItem(slotIndex, 1);
    if (success) {
      setCoins(gameState.data.player.coins);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-3xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header with Maple's shop banner */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">
                Maple's General Store
              </h2>
              <p className="text-xs font-semibold text-haven-600">Fresh seeds, hearty tools, and cozy decor.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
              <Coins className="w-4 h-4 text-amber-700" />
              <span className="font-mono font-black text-amber-950 text-sm">{coins.toLocaleString()} Coins</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab('buy')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              tab === 'buy'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy Catalog</span>
          </button>
          <button
            onClick={() => setTab('sell')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              tab === 'sell'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-haven-200 text-haven-800 hover:bg-haven-300'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Sell Produce ({sellableSlots.length})</span>
          </button>
        </div>

        {/* Tab 1: Buy */}
        {tab === 'buy' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Catalog List (Left 2 cols) */}
            <div className="md:col-span-2 max-h-80 overflow-y-auto space-y-2 pr-2">
              {shopCatalog.map((item) => {
                const isSelected = selectedBuyItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedBuyItem(item);
                      setBuyQuantity(1);
                      sound.playSfx('click');
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-sm'
                        : 'bg-white border-haven-300 hover:border-haven-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-haven-100 rounded-lg border border-haven-200">
                        {getItemEmoji(item.id)}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-haven-900 leading-tight">{item.name}</h4>
                        <span className="text-[10px] font-semibold text-haven-500 uppercase">{item.category}</span>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-black text-amber-700 flex items-center gap-1">
                      <span>🪙 {item.buyPrice}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Buy Inspector (Right col) */}
            <div className="cozy-panel p-4 bg-white border-2 border-haven-300 flex flex-col justify-between">
              {selectedBuyItem ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 bg-haven-100 rounded-xl border border-haven-300">
                      {getItemEmoji(selectedBuyItem.id)}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-haven-900 leading-tight">{selectedBuyItem.name}</h3>
                      <span className="text-[10px] font-bold text-haven-600 uppercase">
                        {selectedBuyItem.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-haven-700 font-medium mb-4 leading-relaxed">
                    {selectedBuyItem.description}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="space-y-2 bg-haven-50 p-3 rounded-xl border border-haven-200 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-haven-700">
                      <span>Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                          className="w-6 h-6 rounded bg-haven-200 hover:bg-haven-300 flex items-center justify-center font-black"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-black">{buyQuantity}</span>
                        <button
                          onClick={() => setBuyQuantity(buyQuantity + 1)}
                          className="w-6 h-6 rounded bg-haven-200 hover:bg-haven-300 flex items-center justify-center font-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-haven-200">
                      <span>Total Cost:</span>
                      <span className="font-black text-amber-800 font-mono">
                        🪙 {(selectedBuyItem.buyPrice! * buyQuantity).toLocaleString()} Coins
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={coins < selectedBuyItem.buyPrice! * buyQuantity}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-wide shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Purchase ({buyQuantity})</span>
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-bold text-haven-400">
                  Select an item from the catalog.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Sell */}
        {tab === 'sell' && (
          <div className="space-y-3">
            {sellableSlots.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {sellableSlots.map((slot) => {
                  const item = slot.item!;
                  return (
                    <div
                      key={slot.slotIndex}
                      className="p-3 bg-white rounded-xl border border-haven-300 flex items-center justify-between hover:border-haven-400 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getItemEmoji(item.id)}</span>
                        <div>
                          <h4 className="text-xs font-black text-haven-900 leading-tight">
                            {item.name} {slot.quality && slot.quality !== 'normal' && `(${slot.quality})`}
                          </h4>
                          <span className="text-[10px] font-semibold text-haven-500">
                            Carrying: {slot.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-amber-700 font-mono">
                          🪙 {item.sellPrice} Coins / ea
                        </span>
                        <button
                          onClick={() => handleSell(slot.slotIndex)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition"
                        >
                          Sell 1x
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-haven-500 font-bold text-xs">
                No sellable produce or foraged goods in your backpack. Harvest crops or forage to sell!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
