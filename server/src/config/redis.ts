import { Redis } from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;
let redisSub: Redis | null = null;

export function getRedisClients(): { pub: Redis; sub: Redis } | null {
  if (!env.REDIS_ENABLED) return null;

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redisSub = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => console.error('[Redis Pub] Error:', err.message));
    redisSub.on('error', (err) => console.error('[Redis Sub] Error:', err.message));
  }

  return { pub: redisClient, sub: redisSub! };
}
