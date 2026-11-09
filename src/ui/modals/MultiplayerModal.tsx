import React, { useState, useEffect, useRef } from 'react';
import { mpClient, RemotePlayer, ChatMessage } from '../../network/MultiplayerClient';
import { gameState } from '../../domain/GameState';
import { EventBus } from '../../domain/EventBus';
import { sound } from '../../domain/SoundSynth';
import {
  X,
  Users,
  Wifi,
  WifiOff,
  Send,
  MessageSquare,
  Smile,
  Globe,
  Radio,
  CheckCircle,
} from 'lucide-react';

interface MultiplayerModalProps {
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState(mpClient.getStatus());
  const [roomInput, setRoomInput] = useState(status.roomCode || 'haven-main');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>(status.chatHistory);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubStatus = EventBus.on('MP_STATUS_CHANGED', (newStatus) => {
      setStatus({ ...newStatus });
      setChatLog([...newStatus.chatHistory]);
    });

    const unsubChat = EventBus.on('MP_CHAT_MESSAGE', (msg: ChatMessage) => {
      setChatLog((prev) => [...prev, msg]);
      sound.playSfx('dialogue');
    });

    return () => {
      unsubStatus();
      unsubChat();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleConnect = () => {
    sound.playSfx('click');
    mpClient.connect(roomInput);
  };

  const handleDisconnect = () => {
    sound.playSfx('click');
    mpClient.disconnect();
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !status.isConnected) return;
    sound.playSfx('click');
    mpClient.sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleSendEmote = (emote: string) => {
    if (!status.isConnected) return;
    sound.playSfx('click');
    mpClient.sendChatMessage(`*${emote}*`, emote);
  };

  const quickEmotes = ['👋', '❤️', '🌱', '🎉', '✨', '☕', '🐱', '🌾'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="cozy-panel w-full max-w-2xl bg-haven-50 border-4 border-haven-800 p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-haven-300 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 border-2 border-indigo-800 flex items-center justify-center text-2xl shadow-sm text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-haven-950">Multiplayer Lounge</h2>
                {status.isConnected ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online ({status.playerCount} Players)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-haven-200 text-haven-600 border border-haven-300">
                    Solo Offline
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-haven-600">
                Explore, farm, and chat with friends in real-time across the island!
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

        {/* Room Connection Bar */}
        <div className="bg-white rounded-2xl border-2 border-haven-300 p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Globe className="w-5 h-5 text-haven-500 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase text-haven-600 block">
                Island Room Code
              </label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toLowerCase())}
                disabled={status.isConnected || status.isConnecting}
                placeholder="e.g. haven-main"
                className="w-full text-sm font-bold text-haven-900 bg-haven-50 border border-haven-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            {status.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <WifiOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={status.isConnecting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition disabled:opacity-50"
              >
                <Wifi className="w-4 h-4" />
                <span>{status.isConnecting ? 'Connecting...' : 'Join Island Room'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content: Player List + Live Chat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Left: Online Players in Room */}
          <div className="sm:col-span-1 bg-white rounded-2xl border-2 border-haven-300 p-3 flex flex-col">
            <h3 className="text-xs font-black text-haven-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-haven-500" />
              <span>Island Neighbors ({status.playerCount})</span>
            </h3>

            <div className="space-y-1.5 flex-1 max-h-56 overflow-y-auto pr-1">
              {/* Local Player */}
              <div className="p-2 rounded-xl bg-haven-100 border border-haven-300 flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{
                    backgroundColor: gameState.data.player.customization.shirtColor || '#10b981',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-haven-950 truncate">
                    {gameState.data.player.customization.name} (You)
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 capitalize">
                    {gameState.data.player.activeMap}
                  </div>
                </div>
              </div>

              {/* Remote Players */}
              {status.players.map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-xl bg-white hover:bg-haven-50 border border-haven-200 flex items-center gap-2 transition"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: p.customization?.shirtColor || '#3b82f6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-haven-900 truncate">{p.name}</div>
                    <div className="text-[10px] font-bold text-haven-500 capitalize">{p.mapId}</div>
                  </div>
                </div>
              ))}

              {!status.isConnected && (
                <div className="text-center py-6 text-xs font-bold text-haven-500">
                  Connect to a room to see other online islanders!
                </div>
              )}
            </div>
          </div>

          {/* Right: Real-time Chat Log */}
          <div className="sm:col-span-2 bg-white rounded-2xl border-2 border-haven-300 p-3 flex flex-col justify-between h-72">
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
              {chatLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-haven-400 text-xs font-bold gap-1">
                  <MessageSquare className="w-6 h-6 opacity-40" />
                  <span>No chat messages yet. Say hello to your neighbors!</span>
                </div>
              ) : (
                chatLog.map((msg) => {
                  const isMe = msg.playerId === status.myPlayerId;
                  return (
                    <div
                      key={msg.id}
                      className={`text-xs p-2 rounded-xl border leading-relaxed ${
                        isMe
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-950 ml-6'
                          : 'bg-haven-50 border-haven-200 text-haven-950 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black opacity-70 mb-0.5">
                        <span>{msg.playerName}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="font-semibold">{msg.text}</div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Emote bar */}
            <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-black text-haven-500 uppercase mr-1">Emotes:</span>
              {quickEmotes.map((em) => (
                <button
                  key={em}
                  onClick={() => handleSendEmote(em)}
                  disabled={!status.isConnected}
                  className="px-2 py-0.5 bg-haven-100 hover:bg-haven-200 rounded-lg text-sm border border-haven-300 disabled:opacity-40 transition active:scale-95"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={status.isConnected ? 'Type a friendly message...' : 'Connect to chat...'}
                disabled={!status.isConnected}
                className="flex-1 text-xs font-bold text-haven-900 bg-haven-50 border border-haven-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!status.isConnected || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
