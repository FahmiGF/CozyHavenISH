import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { COOKING_RECIPES, RecipeDefinition } from '../../types/cooking';
import { ITEMS_DATABASE } from '../../types/items';
import { getItemEmoji } from '../Hotbar';
import { sound } from '../../domain/SoundSynth';
import { X, Utensils, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface CookingModalProps {
  onClose: () => void;
}

export const CookingModal: React.FC<CookingModalProps> = ({ onClose }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDefinition>(COOKING_RECIPES[0]);
  const [inventoryVersion, setInventoryVersion] = useState<number>(0);

  const getInventoryCount = (itemId: string): number => {
    return gameState.data.inventory.reduce((sum, slot) => {
      if (slot.item && slot.item.id === itemId) {
        return sum + slot.quantity;
      }
      return sum;
    }, 0);
  };

  const canCook = (recipe: RecipeDefinition): boolean => {
    return recipe.ingredients.every(
      (ing) => getInventoryCount(ing.itemId) >= ing.quantity
    );
  };

  const handleCook = () => {
    if (!canCook(selectedRecipe)) return;
    const success = gameState.cookRecipe(selectedRecipe.id);
    if (success) {
      setInventoryVersion((v) => v + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 border-2 border-amber-800 flex items-center justify-center text-2xl shadow-sm">
              🍳
            </div>
            <div>
              <h2 className="text-xl font-black text-haven-950">Farmhouse Kitchen</h2>
              <p className="text-xs font-bold text-haven-600">
                Cook delicious hearty meals using your fresh crops, eggs, and milk!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 border border-haven-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Grid & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: Recipe List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <h3 className="text-xs font-black text-haven-700 uppercase tracking-wider mb-1">
              Island Cookbook
            </h3>
            {COOKING_RECIPES.map((recipe) => {
              const affordable = canCook(recipe);
              const isSelected = selectedRecipe.id === recipe.id;
              return (
                <button
                  key={recipe.id}
                  onClick={() => {
                    sound.playSfx('click');
                    setSelectedRecipe(recipe);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-100 border-amber-600 shadow-sm'
                      : 'bg-white hover:bg-haven-100 border-haven-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{recipe.icon}</span>
                    <div>
                      <div className="text-sm font-black text-haven-950">{recipe.name}</div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        +{recipe.energyRestored} Energy
                      </div>
                    </div>
                  </div>
                  {affordable ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-haven-200 text-haven-600">
                      Need Items
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Selected Recipe Preview & Ingredients */}
          <div className="bg-white rounded-2xl border-2 border-haven-300 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedRecipe.icon}</span>
                <div>
                  <h4 className="text-base font-black text-haven-950">{selectedRecipe.name}</h4>
                  <span className="text-xs font-bold text-emerald-600">
                    Restores +{selectedRecipe.energyRestored} Energy
                  </span>
                </div>
              </div>

              <p className="text-xs text-haven-600 mb-4">{selectedRecipe.description}</p>

              {/* Ingredients List */}
              <h5 className="text-[11px] font-black text-haven-700 uppercase tracking-wider mb-2">
                Required Ingredients
              </h5>
              <div className="space-y-1.5 mb-4">
                {selectedRecipe.ingredients.map((ing) => {
                  const def = ITEMS_DATABASE[ing.itemId];
                  const currentCount = getInventoryCount(ing.itemId);
                  const hasEnough = currentCount >= ing.quantity;

                  return (
                    <div
                      key={ing.itemId}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold border ${
                        hasEnough
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getItemEmoji(ing.itemId)}</span>
                        <span>{def?.name || ing.itemId}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>
                          {currentCount} / {ing.quantity}
                        </span>
                        {hasEnough ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cook Button */}
            <button
              onClick={handleCook}
              disabled={!canCook(selectedRecipe)}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
                canCook(selectedRecipe)
                  ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border-2 border-amber-700 cursor-pointer'
                  : 'bg-haven-200 text-haven-400 border border-haven-300 cursor-not-allowed'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Cook {selectedRecipe.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
