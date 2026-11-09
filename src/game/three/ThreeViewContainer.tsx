import React, { useEffect, useRef } from 'react';
import { CozyHaven3D } from './CozyHaven3D';
import { GameViewMode } from '../../types/game';
import { Box, Eye, Layers } from 'lucide-react';

interface ThreeViewContainerProps {
  mode: GameViewMode;
  onToggleView: () => void;
}

export const ThreeViewContainer: React.FC<ThreeViewContainerProps> = ({ mode, onToggleView }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CozyHaven3D | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new CozyHaven3D(mountRef.current, mode);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setViewMode(mode);
    }
  }, [mode]);

  return (
    <div className="absolute inset-0 z-0 w-full h-full pointer-events-auto">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* View Mode Indicator Pill Badge */}
      <div className="absolute bottom-20 left-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleView}
          className="cozy-panel px-3 py-1.5 flex items-center gap-2 bg-haven-900/85 hover:bg-haven-800 text-haven-100 border border-haven-600 rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          title="Press [V] to switch camera mode"
        >
          {mode === '3d-iso' ? (
            <>
              <Box className="w-4 h-4 text-emerald-400" />
              <span>3D Isometric Mode</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>3D Top-Down Ortho</span>
            </>
          )}
          <span className="bg-haven-800 text-haven-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
            V
          </span>
        </button>
      </div>
    </div>
  );
};
