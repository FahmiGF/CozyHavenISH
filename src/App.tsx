import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createCozyHavenGame } from './game/CozyHavenGame';
import { gameState } from './domain/GameState';
import { EventBus } from './domain/EventBus';
import { HUD } from './ui/HUD';
import { Hotbar } from './ui/Hotbar';
import { InteractionPrompt } from './ui/InteractionPrompt';
import { VirtualControls } from './ui/VirtualControls';
import { InventoryModal } from './ui/modals/InventoryModal';
import { ShopModal } from './ui/modals/ShopModal';
import { ShippingBinModal } from './ui/modals/ShippingBinModal';
import { DialogueModal } from './ui/modals/DialogueModal';
import { QuestModal } from './ui/modals/QuestModal';
import { MuseumModal } from './ui/modals/MuseumModal';
import { MapModal } from './ui/modals/MapModal';
import { CalendarModal } from './ui/modals/CalendarModal';
import { FishingModal } from './ui/modals/FishingModal';
import { SettingsModal } from './ui/modals/SettingsModal';
import { SleepConfirmModal } from './ui/modals/SleepConfirmModal';
import { ShippingReportModal } from './ui/modals/ShippingReportModal';
import { CookingModal } from './ui/modals/CookingModal';
import { MultiplayerModal } from './ui/modals/MultiplayerModal';
import { DayEarningsReport, GameViewMode } from './types/game';
import { ThreeViewContainer } from './game/three/ThreeViewContainer';

export const App: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<GameViewMode>('2d');

  const toggleViewMode = () => {
    setViewMode((prev) => {
      if (prev === '2d') return '3d-iso';
      if (prev === '3d-iso') return '3d-topdown';
      return '2d';
    });
  };

  useEffect(() => {
    // 1. Initialize GameState domain
    gameState.init();

    // 2. Initialize Phaser Game instance
    if (gameContainerRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = createCozyHavenGame(gameContainerRef.current);
    }

    // 3. EventBus modal listeners
    const unsubOpen = EventBus.on('OPEN_MODAL', (modalName: string, data?: any) => {
      setActiveModal(modalName);
      setModalData(data || null);
    });

    const unsubClose = EventBus.on('CLOSE_MODAL', () => {
      setActiveModal(null);
      setModalData(null);
    });

    const unsubToggleView = EventBus.on('TOGGLE_VIEW_MODE', () => {
      toggleViewMode();
    });

    // 4. Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'quest' ? null : 'quest'));
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveModal((prev) => (prev === 'map' ? null : 'map'));
      } else if (e.key === 'v' || e.key === 'V') {
        toggleViewMode();
      } else if (e.key === 'Escape') {
        setActiveModal((prev) => (prev ? null : 'settings'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubOpen();
      unsubClose();
      unsubToggleView();
      window.removeEventListener('keydown', handleKeyDown);

      // Clean up game instance on unmount to prevent double canvas
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-haven-950 font-cozy">
      {/* 2D Phaser Canvas Container */}
      <div
        ref={gameContainerRef}
        className={`absolute inset-0 z-0 w-full h-full transition-opacity duration-300 ${
          viewMode === '2d' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 3D Viewport (Isometric & Top-Down) */}
      {viewMode !== '2d' && (
        <ThreeViewContainer mode={viewMode} onToggleView={toggleViewMode} />
      )}

      {/* Top HUD (Clock, Coins, Energy, Navigation) */}
      <HUD
        onOpenModal={(modal) => setActiveModal(modal)}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
      />

      {/* Floating Interaction Prompt */}
      <InteractionPrompt />

      {/* Mobile Virtual Controls */}
      <VirtualControls />

      {/* Bottom Hotbar (Quick Slots 1-9) */}
      <Hotbar />

      {/* Modals Router */}
      {activeModal === 'inventory' && <InventoryModal onClose={closeModal} />}
      {activeModal === 'shop' && <ShopModal onClose={closeModal} />}
      {activeModal === 'shipping_bin' && <ShippingBinModal onClose={closeModal} />}
      {activeModal === 'dialogue' && (
        <DialogueModal npcId={modalData?.npcId || 'milo'} onClose={closeModal} />
      )}
      {activeModal === 'quest' && <QuestModal onClose={closeModal} />}
      {activeModal === 'museum' && <MuseumModal onClose={closeModal} />}
      {activeModal === 'map' && <MapModal onClose={closeModal} />}
      {activeModal === 'calendar' && <CalendarModal onClose={closeModal} />}
      {activeModal === 'fishing' && <FishingModal onClose={closeModal} />}
      {activeModal === 'cooking' && <CookingModal onClose={closeModal} />}
      {activeModal === 'multiplayer' && <MultiplayerModal onClose={closeModal} />}
      {activeModal === 'settings' && <SettingsModal onClose={closeModal} />}
      {activeModal === 'sleep_confirm' && <SleepConfirmModal onClose={closeModal} />}
      {activeModal === 'shipping_report' && (
        <ShippingReportModal
          report={modalData as DayEarningsReport}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
