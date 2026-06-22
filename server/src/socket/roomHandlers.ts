import { Server, Socket } from 'socket.io';
import { getRoomBySlug, createSession, endSession } from '../services/roomService.js';

// User cursor color palette — vibrant, distinguishable colors
const CURSOR_COLORS = [
  '#f97316', '#06b6d4', '#a855f7', '#22c55e',
  '#ef4444', '#eab308', '#ec4899', '#14b8a6',
  '#6366f1', '#f43f5e', '#84cc16', '#0ea5e9',
];

// Track active users per room
const roomUsers = new Map<string, Map<string, { username: string; cursorColor: string; sessionId?: string }>>();

function getColorForRoom(roomId: string): string {
  const users = roomUsers.get(roomId);
  const usedColors = new Set(Array.from(users?.values() || []).map(u => u.cursorColor));
  const available = CURSOR_COLORS.find(c => !usedColors.has(c));
  return available || CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

export function setupRoomHandlers(io: Server, socket: Socket) {
  socket.on('room:join', async (data: { roomSlug: string; username: string }, callback) => {
    try {
      const { roomSlug, username } = data;

      // Verify room exists
      const room = await getRoomBySlug(roomSlug);
      if (!room) {
        callback?.({ error: 'Room not found' });
        return;
      }

      // Assign cursor color
      const cursorColor = getColorForRoom(room.id);

      // Track user
      if (!roomUsers.has(room.id)) {
        roomUsers.set(room.id, new Map());
      }
      roomUsers.get(room.id)!.set(socket.id, { username, cursorColor });

      // Create session record
      const session = await createSession(room.id, username, cursorColor);
      roomUsers.get(room.id)!.get(socket.id)!.sessionId = session.id;

      // Join Socket.io room
      await socket.join(room.id);

      // Notify others
      socket.to(room.id).emit('room:user-joined', {
        socketId: socket.id,
        username,
        cursorColor,
      });

      // Get all users in room
      const users = Array.from(roomUsers.get(room.id)!.entries()).map(([sid, u]) => ({
        socketId: sid,
        username: u.username,
        cursorColor: u.cursorColor,
      }));

      callback?.({
        success: true,
        roomId: room.id,
        room: { id: room.id, slug: room.slug, name: room.name, language: room.language },
        cursorColor,
        users,
      });
    } catch (err) {
      console.error('room:join error:', err);
      callback?.({ error: 'Failed to join room' });
    }
  });

  socket.on('room:language-change', (data: { roomId: string; language: string }) => {
    socket.to(data.roomId).emit('room:language-changed', { language: data.language });
  });

  socket.on('disconnect', async () => {
    // Clean up user from all rooms
    for (const [roomId, users] of roomUsers.entries()) {
      const userData = users.get(socket.id);
      if (userData) {
        users.delete(socket.id);
        if (userData.sessionId) {
          await endSession(userData.sessionId).catch(() => {});
        }
        socket.to(roomId).emit('room:user-left', { socketId: socket.id });
        if (users.size === 0) {
          roomUsers.delete(roomId);
        }
      }
    }
  });
}

export function getRoomUsers(roomId: string) {
  return roomUsers.get(roomId);
}
