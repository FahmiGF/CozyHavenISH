import React, { useState, useEffect } from 'react';
import { gameState } from '../domain/GameState';
import { EventBus } from '../domain/EventBus';
import { InventorySlot } from '../types/items';

export const Hotbar: React.FC = () => {
  const [inventory, setInventory] = useState<InventorySlot[]>(gameState.data.inventory);
  const [selectedIndex, setSelectedIndex] = useState<number>(gameState.data.hotbarSelectedIndex);

  useEffect(() => {
    const unsubInv = EventBus.on('INVENTORY_UPDATED', (newInv) => {
      setInventory([...newInv]);
    });

    const unsubTool = EventBus.on('ACTIVE_TOOL_CHANGED', (idx) => {
      setSelectedIndex(idx);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check numeric keys 1..9
      if (e.key >= '1' && e.key <= '9') {
        const slotIdx = parseInt(e.key) - 1;
        gameState.setHotbarSelectedIndex(slotIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubInv();
      unsubTool();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const hotbarSlots = inventory.slice(0, 9);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="cozy-panel px-3 py-2 flex items-center gap-2 shadow-cozy-lg bg-haven-100/95 border-4 border-haven-700">
        {hotbarSlots.map((slot, index) => {
          const isSelected = index === selectedIndex;
          const item = slot.item;

          return (
            <button
              key={index}
              onClick={() => gameState.setHotbarSelectedIndex(index)}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-100 border-3 border-amber-600 scale-105 shadow-md ring-2 ring-amber-400'
                  : 'bg-haven-50/90 border-2 border-haven-300 hover:border-haven-400'
              }`}
            >
              {/* Slot Index Key Badge [1..9] */}
              <span className="absolute top-0.5 left-1 text-[9px] font-black text-haven-500 font-mono">
                {index + 1}
              </span>

              {/* Item Icon */}
              {item && (
                <div className="w-8 h-8 flex items-center justify-center">
                  <div
                    className="w-7 h-7 pixel-art bg-contain bg-no-repeat bg-center"
                    style={{
                      // Placeholder icon renderer or emoji fallback
                      backgroundImage: `url("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%22.9em%22 font-size=%2220%22>${getItemEmoji(
                        item.id
                      )}</text></svg>")`,
                    }}
                  />
                </div>
              )}

              {/* Quantity Badge */}
              {slot.quantity > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-haven-900 bg-haven-200/90 px-1 rounded-sm font-mono shadow-xs">
                  {slot.quantity}
                </span>
              )}

              {/* Quality Star */}
              {slot.quality && slot.quality !== 'normal' && (
                <span
                  className={`absolute top-0.5 right-1 text-[10px] ${
                    slot.quality === 'silver'
                      ? 'text-slate-400'
                      : slot.quality === 'gold'
                      ? 'text-amber-500'
                      : 'text-purple-500'
                  }`}
                  title={`${slot.quality} quality`}
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function getItemEmoji(itemId: string): string {
  if (itemId.includes('hoe')) return '⛏️';
  if (itemId.includes('can')) return '💧';
  if (itemId.includes('axe')) return '🪓';
  if (itemId.includes('pickaxe')) return '⛏️';
  if (itemId.includes('rod')) return '🎣';
  if (itemId.includes('net')) return '🦗';
  if (itemId.includes('seed')) return '🌱';
  if (itemId.includes('turnip')) return '🥟';
  if (itemId.includes('carrot')) return '🥕';
  if (itemId.includes('potato')) return '🥔';
  if (itemId.includes('tomato')) return '🍅';
  if (itemId.includes('strawberry')) return '🍓';
  if (itemId.includes('pumpkin')) return '🎃';
  if (itemId.includes('sunflower')) return '🌻';
  if (itemId.includes('bluerose')) return '🌹';
  if (itemId.includes('wood')) return '🪵';
  if (itemId.includes('stone')) return '🪨';
  if (itemId.includes('iron')) return '🔩';
  if (itemId.includes('clay')) return '🧱';
  if (itemId.includes('wildberry')) return '🫐';
  if (itemId.includes('mushroom')) return '🍄';
  if (itemId.includes('seashell')) return '🐚';
  if (itemId.includes('fish')) return '🐟';
  if (itemId.includes('butterfly')) return '🦋';
  if (itemId.includes('ladybug')) return '🐞';
  if (itemId.includes('dragonfly')) return '🪰';
  if (itemId.includes('firefly')) return '✨';
  if (itemId.includes('furn_chair')) return '🪑';
  if (itemId.includes('furn_table')) return '🪵';
  if (itemId.includes('furn_bed')) return '🛏️';
  if (itemId.includes('furn_bookshelf')) return '📚';
  if (itemId.includes('furn_pot')) return '🪴';
  if (itemId.includes('furn_lamp')) return '🏮';
  if (itemId.includes('furn_sprinkler')) return '🚿';
  if (itemId.includes('furn_campfire')) return '🔥';
  if (itemId.includes('pie')) return '🥧';
  if (itemId.includes('salad')) return '🥗';
  return '📦';
}
