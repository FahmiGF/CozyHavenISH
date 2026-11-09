import React, { useState } from 'react';
import { gameState } from '../../domain/GameState';
import { QuestDefinition } from '../../types/quests';
import { getItemEmoji } from '../Hotbar';
import { X, CheckCircle2, Circle, Trophy, Coins, Gift } from 'lucide-react';

interface QuestModalProps {
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ onClose }) => {
  const [quests, setQuests] = useState<QuestDefinition[]>(gameState.data.quests);
  const [selectedQuestId, setSelectedQuestId] = useState<string>(quests[0]?.id || '');

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || quests[0];

  const handleClaim = (questId: string) => {
    const success = gameState.claimQuestReward(questId);
    if (success) {
      setQuests([...gameState.data.quests]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <div>
              <h2 className="text-xl font-black text-haven-950 uppercase tracking-wide">Island Journal & Quests</h2>
              <p className="text-xs font-semibold text-haven-600">Complete tasks to help the island community thrive.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-haven-200 hover:bg-rose-100 text-haven-800 hover:text-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quests List (Left col) */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {quests.map((quest) => {
              const isSelected = quest.id === selectedQuestId;
              return (
                <button
                  key={quest.id}
                  onClick={() => setSelectedQuestId(quest.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 shadow-sm'
                      : 'bg-white border-haven-300 hover:border-haven-400'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                      {quest.category}
                    </span>
                    <h4 className="text-xs font-black text-haven-900 leading-tight">{quest.title}</h4>
                  </div>
                  <div>
                    {quest.isRewardClaimed ? (
                      <span className="text-xs text-emerald-600 font-bold">Claimed</span>
                    ) : quest.isCompleted ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                    ) : (
                      <span className="text-xs text-haven-400 font-bold">In Progress</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quest Details (Right 2 cols) */}
          <div className="md:col-span-2 cozy-panel p-4 bg-white border-2 border-haven-300 flex flex-col justify-between">
            {selectedQuest ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-haven-200 text-haven-700">
                    {selectedQuest.type.toUpperCase()} QUEST
                  </span>
                  <span className="text-xs font-bold text-haven-500">From: {selectedQuest.giverName}</span>
                </div>

                <h3 className="text-base font-black text-haven-950 mb-1">{selectedQuest.title}</h3>
                <p className="text-xs text-haven-700 font-medium mb-4 leading-relaxed">
                  {selectedQuest.description}
                </p>

                {/* Objectives Checklist */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-black text-haven-800 uppercase tracking-wide">Objectives:</h4>
                  {selectedQuest.objectives.map((obj) => {
                    const isDone = obj.currentCount >= obj.targetCount;
                    return (
                      <div
                        key={obj.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-haven-50 border border-haven-200 text-xs font-bold"
                      >
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-haven-400 shrink-0" />
                          )}
                          <span className={isDone ? 'line-through text-haven-500' : 'text-haven-900'}>
                            {obj.description}
                          </span>
                        </div>
                        <span className="font-mono text-haven-600">
                          {obj.currentCount}/{obj.targetCount}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Rewards Card */}
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rewards:</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-950">
                    {selectedQuest.rewards.coins > 0 && (
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>🪙 {selectedQuest.rewards.coins} Coins</span>
                      </span>
                    )}
                    {selectedQuest.rewards.items?.map((item) => (
                      <span key={item.itemId} className="flex items-center gap-1">
                        <span>{getItemEmoji(item.itemId)}</span>
                        <span>
                          {item.quantity}x {item.itemId.replace('seed_', '').replace('crop_', '')}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Claim Button */}
                <button
                  onClick={() => handleClaim(selectedQuest.id)}
                  disabled={!selectedQuest.isCompleted || selectedQuest.isRewardClaimed}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-black tracking-wide shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>
                    {selectedQuest.isRewardClaimed
                      ? 'Reward Already Claimed'
                      : selectedQuest.isCompleted
                      ? 'Claim Rewards Now!'
                      : 'Objectives Incomplete'}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
