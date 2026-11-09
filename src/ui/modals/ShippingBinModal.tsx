import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { ShippedItem } from '../../types/game';
import { getItemEmoji } from '../Hotbar';
import { X, Package, Coins, ArrowDownCircle } from 'lucide-react';

interface ShippingBinModalProps {
  onClose: () => void;
}

export const ShippingBinModal: React.FC<ShippingBinModalProps> = ({ onClose }) => {
  const [shippingBin, setShippingBin] = useState<ShippedItem[]>(gameState.data.shippingBin);

  const depositCandidates = gameState.data.inventory.filter(
    (s) => s.item && s.item.category !== 'tool' && s.item.sellPrice > 0
  );

  const handleDeposit = (slotIndex: number) => {
    gameState.depositShippingBin(slotIndex, 1);
    setShippingBin([...gameState.data.shippingBin]);
  };

  const totalEstimate = shippingBin.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">Farm Shipping Bin</h2>
              <p className="text-xs font-semibold text-haven-600">
                Deposit produce and forage. Coins arrive tomorrow at 6:00 AM!
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

        {/* Current Shipping Bin contents */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-black text-haven-800 uppercase mb-2">
            <span>Deposited Items ({shippingBin.length})</span>
            <span className="text-amber-800 flex items-center gap-1 font-mono">
              <Coins className="w-3.5 h-3.5" />
              <span>Est. Payout: 🪙 {totalEstimate} Coins</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border-2 border-haven-300 max-h-48 overflow-y-auto space-y-1.5">
            {shippingBin.length > 0 ? (
              shippingBin.map((shipped, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200 text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getItemEmoji(shipped.itemId)}</span>
                    <span className="text-haven-900">
                      {shipped.quantity}x {shipped.itemId.replace('crop_', '').replace('forage_', '')}
                    </span>
                  </div>
                  <span className="font-mono text-amber-700">🪙 {shipped.totalPrice} Coins</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-haven-400 text-xs font-bold">
                The shipping bin is currently empty. Click an item below to deposit!
              </div>
            )}
          </div>
        </div>

        {/* Backpack Items to Deposit */}
        <div>
          <h4 className="text-xs font-black text-haven-800 uppercase mb-2">
            Click an item in your backpack to deposit:
          </h4>
          <div className="grid grid-cols-6 gap-2 bg-haven-100 p-2.5 rounded-2xl border-2 border-haven-300 max-h-40 overflow-y-auto">
            {depositCandidates.map((slot) => (
              <button
                key={slot.slotIndex}
                onClick={() => handleDeposit(slot.slotIndex)}
                className="w-12 h-12 rounded-xl bg-white hover:bg-amber-100 border-2 border-haven-300 hover:border-amber-500 flex items-center justify-center relative transition active:scale-95 shadow-xs"
                title={`Deposit ${slot.item?.name}`}
              >
                <span className="text-2xl">{getItemEmoji(slot.item!.id)}</span>
                {slot.quantity > 1 && (
                  <span className="absolute bottom-0.5 right-0.5 text-[9px] font-black bg-haven-200 px-1 rounded-sm">
                    {slot.quantity}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
