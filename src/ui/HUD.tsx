import React, { useState, useEffect } from 'react';
import { EventBus } from '../domain/EventBus';
import { gameState, TUTORIAL_STAGES } from '../domain/GameState';
import { mpClient } from '../network/MultiplayerClient';
import { GameTime, WeatherType, TutorialProgress, GameViewMode } from '../types/game';
import {
  Coins,
  Sun,
  CloudRain,
  Cloud,
  CloudFog,
  Zap,
  Backpack,
  Store,
  Scroll,
  Landmark,
  Map as MapIcon,
  Calendar as CalendarIcon,
  Settings,
  Bed,
  Utensils,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Box,
  Eye,
  Layers,
  BookOpen,
} from 'lucide-react';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

interface HUDProps {
  onOpenModal: (modal: string) => void;
  viewMode?: GameViewMode;
  onToggleViewMode?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onOpenModal, viewMode = '2d', onToggleViewMode }) => {
  const [time, setTime] = useState<GameTime>(gameState.data.time);
  const [weather, setWeather] = useState<WeatherType>(gameState.data.weather);
  const [coins, setCoins] = useState<number>(gameState.data.player.coins);
  const [energy, setEnergy] = useState<number>(gameState.data.player.energy);
  const [maxEnergy, setMaxEnergy] = useState<number>(gameState.data.player.maxEnergy);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [mpStatus, setMpStatus] = useState(mpClient.getStatus());
  const [tutorial, setTutorial] = useState<TutorialProgress | undefined>(gameState.data.tutorial);
  const [isTutorialCollapsed, setIsTutorialCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const unsubTime = EventBus.on('TIME_TICK', (data) => {
      setTime({ ...data });
      setWeather(data.weather);
    });

    const unsubCoins = EventBus.on('COINS_CHANGED', (newCoins) => {
      setCoins(newCoins);
    });

    const unsubEnergy = EventBus.on('ENERGY_CHANGED', (cur, max) => {
      setEnergy(cur);
      setMaxEnergy(max);
    });

    const unsubMp = EventBus.on('MP_STATUS_CHANGED', (newMp) => {
      setMpStatus({ ...newMp });
    });

    const unsubTutorial = EventBus.on('TUTORIAL_UPDATED', (tut: TutorialProgress) => {
      setTutorial({ ...tut });
    });

    const unsubNotify = EventBus.on('SHOW_NOTIFICATION', (toast) => {
      const id = `${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });

    return () => {
      unsubTime();
      unsubCoins();
      unsubEnergy();
      unsubMp();
      unsubTutorial();
      unsubNotify();
    };
  }, []);

  const formatHour = (hour: number, minute: number) => {
    const displayHour = hour >= 24 ? hour - 24 : hour;
    const period = hour >= 12 && hour < 24 ? 'PM' : 'AM';
    const h12 = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;
    const minStr = minute < 10 ? `0${minute}` : minute;
    return `${h12}:${minStr} ${period}`;
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-gray-300" />;
      case 'foggy':
        return <CloudFog className="w-5 h-5 text-slate-300" />;
      default:
        return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
    }
  };

  const seasonColors: Record<string, string> = {
    spring: 'bg-emerald-600 text-emerald-100',
    summer: 'bg-amber-600 text-amber-100',
    autumn: 'bg-orange-600 text-orange-100',
    winter: 'bg-cyan-600 text-cyan-100',
  };

  return (
    <>
      {/* Top Left: Clock, Calendar, Energy */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-auto">
        <div className="cozy-panel px-4 py-2 flex items-center gap-3">
          {/* Season & Day Badge */}
          <div className="flex flex-col items-center">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${seasonColors[time.season] || 'bg-emerald-600 text-white'}`}>
              {time.season}
            </span>
            <span className="text-xl font-black text-haven-900 leading-none mt-1">Day {time.day}</span>
          </div>

          <div className="w-[1px] h-8 bg-haven-300 mx-1" />

          {/* Time & Weather */}
          <div className="flex items-center gap-2">
            {getWeatherIcon()}
            <div>
              <div className="text-sm font-bold text-haven-900">{formatHour(time.hour, time.minute)}</div>
              <div className="text-[11px] font-semibold text-haven-600 capitalize">{time.timeOfDay}</div>
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="cozy-panel px-3 py-1.5 flex items-center gap-2 w-48">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold text-haven-800 mb-0.5">
              <span>Energy</span>
              <span>
                {energy}/{maxEnergy}
              </span>
            </div>
            <div className="w-full bg-haven-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  energy > 40 ? 'bg-emerald-500' : energy > 15 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (energy / maxEnergy) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Newcomer Tutorial Guide */}
        {tutorial && !tutorial.isCompleted && !tutorial.dismissed && (() => {
          const currentStageDef = TUTORIAL_STAGES.find((s) => s.id === tutorial.currentStage);
          if (!currentStageDef) return null;

          return (
            <div className="cozy-panel w-72 md:w-80 p-3 bg-haven-50/95 border-2 border-haven-600 shadow-cozy animate-fade-in pointer-events-auto">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-black text-haven-900 uppercase tracking-wider">
                    Guide • Stage {tutorial.currentStage}/{TUTORIAL_STAGES.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsTutorialCollapsed(!isTutorialCollapsed)}
                    className="p-1 rounded-md hover:bg-haven-200 text-haven-700 transition"
                    title={isTutorialCollapsed ? 'Expand Guide' : 'Collapse Guide'}
                  >
                    {isTutorialCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => gameState.dismissTutorial()}
                    className="p-1 rounded-md hover:bg-rose-100 text-haven-500 hover:text-rose-600 transition"
                    title="Dismiss Guide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!isTutorialCollapsed && (
                <div className="mt-1">
                  <h4 className="text-xs font-black text-haven-900 mb-0.5">{currentStageDef.title}</h4>
                  <p className="text-[11px] font-medium text-haven-700 leading-snug mb-2">{currentStageDef.instruction}</p>

                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[10px] font-bold text-haven-800">
                      <span>{currentStageDef.hint}</span>
                      <span>
                        {tutorial.stageProgress}/{currentStageDef.targetCount}
                      </span>
                    </div>
                    <div className="w-full bg-haven-200 h-2 rounded-full overflow-hidden border border-haven-300">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (tutorial.stageProgress / currentStageDef.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-haven-700 bg-haven-100/90 px-2 py-1 rounded-lg">
                    <span>Reward:</span>
                    <span className="text-amber-800 font-black">+{currentStageDef.rewardCoins} Haven Coins 🪙</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Top Right: Coins & Quick Actions */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Multiplayer Status Pill */}
        <button
          onClick={() => onOpenModal('multiplayer')}
          title="Multiplayer Lounge"
          className={`px-3 py-1.5 rounded-2xl border-2 flex items-center gap-2 shadow-cozy text-xs font-black transition active:scale-95 ${
            mpStatus.isConnected
              ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-950'
              : 'bg-haven-100 hover:bg-haven-200 border-haven-400 text-haven-800'
          }`}
        >
          <Users className="w-4 h-4 text-haven-700" />
          <span className="hidden sm:inline">
            {mpStatus.isConnected ? `${mpStatus.playerCount} Online` : 'Multiplayer'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              mpStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-haven-400'
            }`}
          />
        </button>

        {/* Haven Coins Counter */}
        <div className="cozy-panel px-4 py-2 flex items-center gap-2 shadow-cozy">
          <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center border-2 border-amber-600 shadow-sm">
            <Coins className="w-4 h-4 text-amber-950" />
          </div>
          <span className="text-lg font-black text-amber-950 font-mono tracking-tight">{coins.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 bg-haven-100/90 p-1.5 rounded-2xl border-2 border-haven-400 backdrop-blur-sm shadow-cozy">
          {/* 2D / 3D Perspective Mode Switcher */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              title={`Camera Mode: ${
                viewMode === '2d'
                  ? '2D Pixel Art'
                  : viewMode === '3d-iso'
                  ? '3D Isometric Low-Poly'
                  : '3D Top-Down Ortho'
              } [Press V]`}
              className={`p-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 font-black text-xs ${
                viewMode !== '2d'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-haven-200 hover:bg-haven-300 text-haven-800'
              }`}
            >
              {viewMode === '2d' ? (
                <Eye className="w-5 h-5 text-haven-700" />
              ) : viewMode === '3d-iso' ? (
                <Box className="w-5 h-5 text-emerald-100 animate-pulse" />
              ) : (
                <Layers className="w-5 h-5 text-cyan-100 animate-pulse" />
              )}
              <span className="hidden md:inline font-mono text-[11px]">
                {viewMode === '2d' ? '2D' : viewMode === '3d-iso' ? '3D ISO' : '3D TOP'}
              </span>
            </button>
          )}

          <button
            onClick={() => onOpenModal('inventory')}
            title="Backpack [Q]"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Backpack className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('cooking')}
            title="Kitchen Cooking"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Utensils className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('shop')}
            title="General Store"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Store className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('quest')}
            title="Quest Journal"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition relative"
          >
            <Scroll className="w-5 h-5" />
            {gameState.data.quests.some((q) => q.isCompleted && !q.isRewardClaimed) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => onOpenModal('museum')}
            title="Museum Index"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Landmark className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('map')}
            title="Island Map"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('calendar')}
            title="Calendar"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('guide')}
            title="Explorer's Guide & Manual [H]"
            className="p-2 rounded-xl bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-950 transition border border-amber-400/80 shadow-xs"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenModal('sleep_confirm')}
            title="Sleep until tomorrow"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Bed className="w-5 h-5 text-indigo-700" />
          </button>
          <button
            onClick={() => onOpenModal('settings')}
            title="Settings & Saves"
            className="p-2 rounded-xl bg-haven-200 hover:bg-haven-300 active:scale-95 text-haven-800 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Notification Toasts */}
      <div className="absolute top-20 right-4 z-40 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="cozy-panel px-4 py-2.5 shadow-cozy-lg flex items-center gap-3 animate-slide-in pointer-events-auto border-2 border-haven-600 bg-haven-50/95"
          >
            <div className="text-2xl shrink-0">{toast.icon || '✨'}</div>
            <div>
              <div className="text-xs font-black text-haven-900 uppercase tracking-wider">{toast.title}</div>
              <div className="text-xs font-semibold text-haven-700 leading-snug">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
