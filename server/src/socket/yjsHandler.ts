import * as Y from 'yjs';
import { Server, Socket } from 'socket.io';
import { loadDocState, saveDocState } from '../services/yjsPersistence.js';

// In-memory Y.Doc store — one doc per room
const docs = new Map<string, Y.Doc>();
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function getOrCreateDoc(roomId: string): Promise<Y.Doc> {
  let doc = docs.get(roomId);
  if (doc) return doc;

  doc = new Y.Doc();
  docs.set(roomId, doc);

  // Try to load persisted state
  const state = await loadDocState(roomId);
  if (state) {
    Y.applyUpdate(doc, new Uint8Array(state));
  }

  return doc;
}

function debounceSave(roomId: string) {
  if (saveTimers.has(roomId)) {
    clearTimeout(saveTimers.get(roomId)!);
  }
  saveTimers.set(roomId, setTimeout(async () => {
    const doc = docs.get(roomId);
    if (doc) {
      const state = Y.encodeStateAsUpdate(doc);
      await saveDocState(roomId, Buffer.from(state));
    }
    saveTimers.delete(roomId);
  }, 2000)); // Save after 2s of inactivity
}

export function getDocText(roomId: string): string {
  const doc = docs.get(roomId);
  if (!doc) return '';
  return doc.getText('monaco').toString();
}

export function setupYjsHandler(io: Server, socket: Socket) {
  // Client requests initial sync
  socket.on('yjs:sync-request', async (roomId: string, stateVector: ArrayBuffer) => {
    const doc = await getOrCreateDoc(roomId);
    const sv = new Uint8Array(stateVector);
    const update = Y.encodeStateAsUpdate(doc, sv);
    socket.emit('yjs:sync-response', Buffer.from(update));
  });

  // Client sends an incremental update
  socket.on('yjs:update', async (roomId: string, update: ArrayBuffer) => {
    const doc = await getOrCreateDoc(roomId);
    Y.applyUpdate(doc, new Uint8Array(update));

    // Broadcast to all OTHER clients in the room
    socket.to(roomId).emit('yjs:update', update);

    // Debounce save to DB
    debounceSave(roomId);
  });

  // Awareness (cursor positions, user info)
  socket.on('yjs:awareness', (roomId: string, update: ArrayBuffer) => {
    socket.to(roomId).emit('yjs:awareness', update);
  });
}
