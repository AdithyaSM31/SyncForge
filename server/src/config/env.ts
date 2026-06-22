import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  EXECUTION_TIMEOUT: parseInt(process.env.EXECUTION_TIMEOUT || '10000', 10),
  EXECUTION_MEMORY_MB: parseInt(process.env.EXECUTION_MEMORY_MB || '128', 10),
};
