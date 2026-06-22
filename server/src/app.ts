import express from 'express';
import cors from 'cors';
import { roomsRouter } from './routes/rooms.js';
import { executeRouter } from './routes/execute.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/rooms', roomsRouter);
app.use('/api/execute', executeRouter);

export { app };
