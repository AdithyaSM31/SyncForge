import { Router } from 'express';
import { createRoom, getRoomBySlug, listRooms, updateRoomLanguage } from '../services/roomService.js';

export const roomsRouter = Router();

// Create a new room
roomsRouter.post('/', async (req, res) => {
  try {
    const { name, language } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }
    const room = await createRoom(name.trim(), language || 'javascript');
    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room by slug
roomsRouter.get('/:slug', async (req, res) => {
  try {
    const room = await getRoomBySlug(req.params.slug);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// List rooms
roomsRouter.get('/', async (_req, res) => {
  try {
    const rooms = await listRooms();
    res.json(rooms);
  } catch (err) {
    console.error('List rooms error:', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

// Update room language
roomsRouter.patch('/:id/language', async (req, res) => {
  try {
    const { language } = req.body;
    const room = await updateRoomLanguage(req.params.id, language);
    res.json(room);
  } catch (err) {
    console.error('Update language error:', err);
    res.status(500).json({ error: 'Failed to update language' });
  }
});
