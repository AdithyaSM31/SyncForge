import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocketServer } from './socket/index.js';

const server = http.createServer(app);

// Initialize Socket.io with optional Redis adapter
initSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`\n  ⚡ SyncForge server running on http://localhost:${env.PORT}`);
  console.log(`  📡 WebSocket ready`);
  console.log(`  🗄️  Redis: ${env.REDIS_ENABLED ? 'enabled' : 'disabled (single instance mode)'}`);
  console.log(`  🌱 Environment: ${env.NODE_ENV}\n`);
});
