import React, { useState, useEffect } from 'react';
import { EventBus } from '../domain/EventBus';

export const InteractionPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    const unsub = EventBus.on('INTERACTION_PROMPT', (text) => {
      setPrompt(text);
    });
    return unsub;
  }, []);

  if (!prompt) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce-subtle">
      <div className="cozy-panel px-4 py-1.5 bg-haven-900/90 text-haven-50 border-2 border-haven-400 text-xs font-black shadow-cozy-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>{prompt}</span>
      </div>
    </div>
  );
};
