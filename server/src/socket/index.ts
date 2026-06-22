import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server as HTTPServer } from 'http';
import { getRedisClients } from '../config/redis.js';
import { setupRoomHandlers } from './roomHandlers.js';
import { setupYjsHandler } from './yjsHandler.js';

let io: Server;

export function getIO(): Server {
  return io;
}

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    maxHttpBufferSize: 5e6, // 5MB for large doc syncs
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Attach Redis adapter for horizontal scaling if enabled
  const redisClients = getRedisClients();
  if (redisClients) {
    io.adapter(createAdapter(redisClients.pub, redisClients.sub));
    console.log('  ✅ Socket.io Redis adapter attached');
  }

  io.on('connection', (socket) => {
    console.log(`  🔌 Client connected: ${socket.id}`);

    setupRoomHandlers(io, socket);
    setupYjsHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`  ❌ Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
