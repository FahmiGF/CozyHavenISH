import React, { useState } from 'react';
import { EventBus } from '../domain/EventBus';

export const VirtualControls: React.FC = () => {
  const [touchActive, setTouchActive] = useState<boolean>(false);

  const handleDpadPress = (dx: number, dy: number) => {
    EventBus.emit('VIRTUAL_MOVE', { x: dx, y: dy });
  };

  const handleDpadRelease = () => {
    EventBus.emit('VIRTUAL_MOVE', { x: 0, y: 0 });
  };

  return (
    <div className="md:hidden pointer-events-auto">
      {/* Virtual D-Pad (Bottom Left) */}
      <div className="absolute bottom-24 left-4 z-30 w-32 h-32 relative select-none">
        {/* Up */}
        <button
          onTouchStart={() => handleDpadPress(0, -1)}
          onTouchEnd={handleDpadRelease}
          onMouseDown={() => handleDpadPress(0, -1)}
          onMouseUp={handleDpadRelease}
          className="absolute top-0 left-10 w-12 h-10 bg-haven-800/80 active:bg-amber-600 rounded-t-xl border border-haven-600 flex items-center justify-center text-white text-xs font-bold"
        >
          ▲
        </button>
        {/* Down */}
        <button
          onTouchStart={() => handleDpadPress(0, 1)}
          onTouchEnd={handleDpadRelease}
          onMouseDown={() => handleDpadPress(0, 1)}
          onMouseUp={handleDpadRelease}
          className="absolute bottom-0 left-10 w-12 h-10 bg-haven-800/80 active:bg-amber-600 rounded-b-xl border border-haven-600 flex items-center justify-center text-white text-xs font-bold"
        >
          ▼
        </button>
        {/* Left */}
        <button
          onTouchStart={() => handleDpadPress(-1, 0)}
          onTouchEnd={handleDpadRelease}
          onMouseDown={() => handleDpadPress(-1, 0)}
          onMouseUp={handleDpadRelease}
          className="absolute top-10 left-0 w-10 h-12 bg-haven-800/80 active:bg-amber-600 rounded-l-xl border border-haven-600 flex items-center justify-center text-white text-xs font-bold"
        >
          ◀
        </button>
        {/* Right */}
        <button
          onTouchStart={() => handleDpadPress(1, 0)}
          onTouchEnd={handleDpadRelease}
          onMouseDown={() => handleDpadPress(1, 0)}
          onMouseUp={handleDpadRelease}
          className="absolute top-10 right-0 w-10 h-12 bg-haven-800/80 active:bg-amber-600 rounded-r-xl border border-haven-600 flex items-center justify-center text-white text-xs font-bold"
        >
          ▶
        </button>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-3 select-none">
        <button
          onClick={() => EventBus.emit('VIRTUAL_ACTION_SPACE')}
          className="w-14 h-14 rounded-full bg-emerald-600/90 active:bg-emerald-700 text-white font-black text-sm border-2 border-emerald-400 shadow-cozy flex items-center justify-center"
        >
          Tool
        </button>
        <button
          onClick={() => EventBus.emit('VIRTUAL_ACTION_E')}
          className="w-14 h-14 rounded-full bg-amber-600/90 active:bg-amber-700 text-white font-black text-sm border-2 border-amber-400 shadow-cozy flex items-center justify-center"
        >
          Action
        </button>
      </div>
    </div>
  );
};
