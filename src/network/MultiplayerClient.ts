import { EventBus } from '../domain/EventBus';
import { gameState } from '../domain/GameState';

export interface RemotePlayer {
  id: string;
  name: string;
  mapId: string;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
  activeItem: string | null;
  customization: {
    shirtColor: string;
    hairColor: string;
    hairStyle: string;
    skinColor: string;
  };
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  emote?: string;
  timestamp: number;
}

export class MultiplayerClient {
  private static instance: MultiplayerClient;
  private ws: WebSocket | null = null;
  private serverUrl: string = 'ws://localhost:3001';
  private roomCode: string = 'haven-main';
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private myPlayerId: string = '';
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private chatHistory: ChatMessage[] = [];
  private lastMoveSent: number = 0;
  private pingInterval: any = null;

  private constructor() {
    // Determine default host if in browser
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || 'localhost';
      this.serverUrl = `ws://${host}:3001`;
    }

    // Auto-listen to local world actions and broadcast if connected
    EventBus.on('LOCAL_WORLD_ACTION', (data: any) => {
      if (this.isConnected && data && data.action) {
        this.sendWorldAction(data.action, data);
      }
    });
  }

  public static getInstance(): MultiplayerClient {
    if (!MultiplayerClient.instance) {
      MultiplayerClient.instance = new MultiplayerClient();
    }
    return MultiplayerClient.instance;
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      roomCode: this.roomCode,
      myPlayerId: this.myPlayerId,
      playerCount: this.remotePlayers.size + (this.isConnected ? 1 : 0),
      players: Array.from(this.remotePlayers.values()),
      chatHistory: this.chatHistory,
    };
  }

  public connect(roomCode: string = 'haven-main', customUrl?: string) {
    if (this.isConnected || this.isConnecting) return;

    if (customUrl) this.serverUrl = customUrl;
    this.roomCode = roomCode.trim().toLowerCase() || 'haven-main';
    this.isConnecting = true;
    EventBus.emit('MP_STATUS_CHANGED', this.getStatus());

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;

        // Send JOIN packet
        const myPlayer = gameState.data.player;
        const activeItem = gameState.getSelectedHotbarSlot()?.item?.id || null;

        this.sendPacket({
          type: 'JOIN',
          roomCode: this.roomCode,
          playerId: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: myPlayer.customization.name || 'Cozy Farmer',
          mapId: myPlayer.activeMap,
          x: myPlayer.x,
          y: myPlayer.y,
          direction: 'down',
          activeItem,
          customization: myPlayer.customization,
        });

        // Keepalive ping
        this.pingInterval = setInterval(() => {
          if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.sendPacket({ type: 'PING' });
          }
        }, 15000);

        EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Connected Online!',
          message: `Joined multiplayer room "${this.roomCode}".`,
          icon: '🌐',
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (err) {
          console.error('[MultiplayerClient] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.cleanup();
        EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
      };

      this.ws.onerror = () => {
        this.cleanup();
        EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
      };
    } catch (err) {
      this.cleanup();
      EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.cleanup();
    EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
    EventBus.emit('SHOW_NOTIFICATION', {
      title: 'Solo Mode',
      message: 'Disconnected from multiplayer server.',
      icon: '🏠',
    });
  }

  private cleanup() {
    this.isConnected = false;
    this.isConnecting = false;
    this.ws = null;
    this.remotePlayers.clear();
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendPacket(packet: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(packet));
    }
  }

  private handleServerMessage(msg: any) {
    if (msg.type === 'WELCOME') {
      this.myPlayerId = msg.playerId;
      this.remotePlayers.clear();
      if (Array.isArray(msg.players)) {
        msg.players.forEach((p: RemotePlayer) => {
          this.remotePlayers.set(p.id, p);
        });
      }
      EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
      EventBus.emit('MP_PLAYERS_SYNCED', Array.from(this.remotePlayers.values()));
    } else if (msg.type === 'PLAYER_JOINED') {
      this.remotePlayers.set(msg.player.id, msg.player);
      EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
      EventBus.emit('MP_PLAYER_JOINED', msg.player);
      EventBus.emit('SHOW_NOTIFICATION', {
        title: 'Player Joined',
        message: `${msg.player.name} joined the island!`,
        icon: '👋',
      });
    } else if (msg.type === 'PLAYER_MOVED') {
      const existing = this.remotePlayers.get(msg.playerId);
      if (existing) {
        existing.mapId = msg.mapId;
        existing.x = msg.x;
        existing.y = msg.y;
        existing.direction = msg.direction;
        existing.isMoving = msg.isMoving;
        existing.activeItem = msg.activeItem;
        EventBus.emit('MP_PLAYER_MOVED', msg);
      }
    } else if (msg.type === 'PLAYER_LEFT') {
      const p = this.remotePlayers.get(msg.playerId);
      this.remotePlayers.delete(msg.playerId);
      EventBus.emit('MP_STATUS_CHANGED', this.getStatus());
      EventBus.emit('MP_PLAYER_LEFT', msg.playerId);
      if (p) {
        EventBus.emit('SHOW_NOTIFICATION', {
          title: 'Player Left',
          message: `${p.name} left the island.`,
          icon: '🏃',
        });
      }
    } else if (msg.type === 'WORLD_ACTION') {
      // Sync world action into local GameState
      this.applyRemoteWorldAction(msg.action, msg.data);
      EventBus.emit('MP_WORLD_ACTION', msg);
    } else if (msg.type === 'CHAT_MESSAGE') {
      const chatItem: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random()}`,
        playerId: msg.playerId,
        playerName: msg.playerName,
        text: msg.text,
        emote: msg.emote,
        timestamp: msg.timestamp || Date.now(),
      };
      this.chatHistory.push(chatItem);
      if (this.chatHistory.length > 50) this.chatHistory.shift();
      EventBus.emit('MP_CHAT_MESSAGE', chatItem);
    }
  }

  private applyRemoteWorldAction(action: string, data: any) {
    if (action === 'till') {
      const key = `${data.tileX},${data.tileY}`;
      gameState.data.farmTiles[key] = { tilled: true, watered: false };
      EventBus.emit('SOIL_ACTION', 'till', data.tileX, data.tileY);
    } else if (action === 'water') {
      const key = `${data.tileX},${data.tileY}`;
      if (gameState.data.farmTiles[key]) {
        gameState.data.farmTiles[key].watered = true;
      }
      const crop = gameState.data.crops.find((c) => c.tileX === data.tileX && c.tileY === data.tileY);
      if (crop) crop.isWatered = true;
      EventBus.emit('SOIL_ACTION', 'water', data.tileX, data.tileY);
    } else if (action === 'plant' && data.crop) {
      gameState.data.crops.push(data.crop);
      EventBus.emit('SOIL_ACTION', 'plant', data.tileX, data.tileY, data.crop);
    } else if (action === 'harvest') {
      gameState.data.crops = gameState.data.crops.filter(
        (c) => !(c.tileX === data.tileX && c.tileY === data.tileY)
      );
      EventBus.emit('SOIL_ACTION', 'clear', data.tileX, data.tileY);
    } else if (action === 'mine') {
      EventBus.emit('REMOTE_MINE_ACTION', data);
    }
  }

  // Throttled position update (20Hz max)
  public sendMovement(x: number, y: number, mapId: string, direction: string, isMoving: boolean) {
    if (!this.isConnected) return;
    const now = Date.now();
    if (now - this.lastMoveSent < 50) return; // 50ms throttle

    this.lastMoveSent = now;
    const activeItem = gameState.getSelectedHotbarSlot()?.item?.id || null;

    this.sendPacket({
      type: 'MOVE',
      mapId,
      x: Math.round(x),
      y: Math.round(y),
      direction,
      isMoving,
      activeItem,
    });
  }

  public sendWorldAction(action: 'till' | 'water' | 'plant' | 'harvest' | 'place_furniture' | 'mine', payload: any) {
    if (!this.isConnected) return;
    this.sendPacket({
      type: 'ACTION',
      action,
      ...payload,
    });
  }

  public sendChatMessage(text: string, emote?: string) {
    if (!this.isConnected) return;
    this.sendPacket({
      type: 'CHAT',
      text,
      emote,
    });
  }
}

export const mpClient = MultiplayerClient.getInstance();
