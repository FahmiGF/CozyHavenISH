import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 3001;
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', server: 'CozyHaven Multiplayer Server', version: '1.0.0' }));
});

const wss = new WebSocketServer({ server });

const rooms = new Map();
const roomWorldStates = new Map();

function getOrCreateRoom(roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, new Map());
    roomWorldStates.set(roomCode, { farmTiles: {}, crops: [] });
  }
  return rooms.get(roomCode);
}

function broadcastToRoom(roomCode, message, excludeId) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const payload = JSON.stringify(message);

  for (const [id, player] of room) {
    if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  let session = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'JOIN') {
        const roomCode = (msg.roomCode || 'haven-main').trim().toLowerCase();
        const room = getOrCreateRoom(roomCode);

        session = {
          id: msg.playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: msg.name || 'Cozy Farmer',
          roomCode,
          mapId: msg.mapId || 'farm',
          x: msg.x || 320,
          y: msg.y || 240,
          direction: msg.direction || 'down',
          isMoving: false,
          activeItem: msg.activeItem || null,
          customization: msg.customization || {
            shirtColor: '#10b981',
            hairColor: '#78350f',
            hairStyle: 'cozy_tousled',
            skinColor: '#fcd34d',
          },
          ws,
          lastPing: Date.now(),
        };

        room.set(session.id, session);

        const otherPlayers = Array.from(room.values())
          .filter((p) => p.id !== session.id)
          .map((p) => ({
            id: p.id,
            name: p.name,
            mapId: p.mapId,
            x: p.x,
            y: p.y,
            direction: p.direction,
            isMoving: p.isMoving,
            activeItem: p.activeItem,
            customization: p.customization,
          }));

        const worldState = roomWorldStates.get(roomCode) || { farmTiles: {}, crops: [] };

        ws.send(
          JSON.stringify({
            type: 'WELCOME',
            playerId: session.id,
            roomCode,
            players: otherPlayers,
            worldState,
          })
        );

        broadcastToRoom(
          roomCode,
          {
            type: 'PLAYER_JOINED',
            player: {
              id: session.id,
              name: session.name,
              mapId: session.mapId,
              x: session.x,
              y: session.y,
              direction: session.direction,
              isMoving: session.isMoving,
              activeItem: session.activeItem,
              customization: session.customization,
            },
          },
          session.id
        );

        console.log(`[Multiplayer] Player ${session.name} (${session.id}) joined room "${roomCode}". Total in room: ${room.size}`);
      } else if (msg.type === 'MOVE' && session) {
        session.mapId = msg.mapId;
        session.x = msg.x;
        session.y = msg.y;
        session.direction = msg.direction;
        session.isMoving = msg.isMoving;
        session.activeItem = msg.activeItem;

        broadcastToRoom(
          session.roomCode,
          {
            type: 'PLAYER_MOVED',
            playerId: session.id,
            mapId: session.mapId,
            x: session.x,
            y: session.y,
            direction: session.direction,
            isMoving: session.isMoving,
            activeItem: session.activeItem,
          },
          session.id
        );
      } else if (msg.type === 'ACTION' && session) {
        const worldState = roomWorldStates.get(session.roomCode);
        if (worldState) {
          if (msg.action === 'till') {
            worldState.farmTiles[`${msg.tileX},${msg.tileY}`] = { tilled: true, watered: false };
          } else if (msg.action === 'water') {
            if (worldState.farmTiles[`${msg.tileX},${msg.tileY}`]) {
              worldState.farmTiles[`${msg.tileX},${msg.tileY}`].watered = true;
            }
          } else if (msg.action === 'plant') {
            worldState.crops.push(msg.crop);
          } else if (msg.action === 'harvest') {
            worldState.crops = worldState.crops.filter(
              (c) => !(c.tileX === msg.tileX && c.tileY === msg.tileY)
            );
          }
        }

        broadcastToRoom(
          session.roomCode,
          {
            type: 'WORLD_ACTION',
            playerId: session.id,
            playerName: session.name,
            action: msg.action,
            data: msg,
          },
          session.id
        );
      } else if (msg.type === 'CHAT' && session) {
        broadcastToRoom(session.roomCode, {
          type: 'CHAT_MESSAGE',
          playerId: session.id,
          playerName: session.name,
          text: msg.text,
          emote: msg.emote || null,
          timestamp: Date.now(),
        });
      } else if (msg.type === 'PING' && session) {
        session.lastPing = Date.now();
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (err) {
      console.error('[Multiplayer] Message parse error:', err);
    }
  });

  ws.on('close', () => {
    if (session) {
      const room = rooms.get(session.roomCode);
      if (room) {
        room.delete(session.id);
        broadcastToRoom(session.roomCode, {
          type: 'PLAYER_LEFT',
          playerId: session.id,
          name: session.name,
        });
        if (room.size === 0) {
          rooms.delete(session.roomCode);
          roomWorldStates.delete(session.roomCode);
        }
        console.log(`[Multiplayer] Player ${session.name} left. Remaining in "${session.roomCode}": ${room.size}`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[CozyHaven] Multiplayer Server running on ws://localhost:${PORT}`);
});
