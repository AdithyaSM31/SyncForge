import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';
import type { Socket } from 'socket.io-client';

/**
 * Custom Socket.io-based Yjs provider.
 * Replaces y-websocket so we can use Socket.io's Redis adapter
 * for horizontal WebSocket scaling.
 */
export class SocketIOProvider {
  doc: Y.Doc;
  awareness: Awareness;
  socket: Socket;
  roomId: string;
  synced: boolean = false;
  private _updateHandler: (update: Uint8Array, origin: unknown) => void;
  private _awarenessHandler: (changes: { added: number[]; updated: number[]; removed: number[] }) => void;
  private _onSyncCallbacks: (() => void)[] = [];
  private _destroyed = false;

  constructor(socket: Socket, roomId: string, doc: Y.Doc, userInfo: { name: string; color: string }) {
    this.doc = doc;
    this.socket = socket;
    this.roomId = roomId;
    this.awareness = new Awareness(doc);

    // Set local awareness state (cursor info)
    this.awareness.setLocalStateField('user', {
      name: userInfo.name,
      color: userInfo.color,
    });

    // --- Outgoing: Local doc updates → server ---
    this._updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin !== this && !this._destroyed) {
        this.socket.emit('yjs:update', this.roomId, update);
      }
    };
    this.doc.on('update', this._updateHandler);

    // --- Outgoing: Local awareness changes → server ---
    this._awarenessHandler = ({ added, updated, removed }) => {
      if (this._destroyed) return;
      const changedClients = [...added, ...updated, ...removed];
      const encodedUpdate = encodeAwarenessUpdate(this.awareness, changedClients);
      this.socket.emit('yjs:awareness', this.roomId, encodedUpdate);
    };
    this.awareness.on('update', this._awarenessHandler);

    // --- Incoming: Server → local doc ---
    this.socket.on('yjs:sync-response', (update: ArrayBuffer) => {
      if (this._destroyed) return;
      Y.applyUpdate(this.doc, new Uint8Array(update), this);
      this.synced = true;
      this._onSyncCallbacks.forEach(cb => cb());
      this._onSyncCallbacks = [];
    });

    this.socket.on('yjs:update', (update: ArrayBuffer) => {
      if (this._destroyed) return;
      Y.applyUpdate(this.doc, new Uint8Array(update), this);
    });

    this.socket.on('yjs:awareness', (update: ArrayBuffer) => {
      if (this._destroyed) return;
      applyAwarenessUpdate(this.awareness, new Uint8Array(update), this);
    });

    // Request initial sync from server
    const sv = Y.encodeStateVector(this.doc);
    this.socket.emit('yjs:sync-request', this.roomId, sv);
  }

  onSync(cb: () => void) {
    if (this.synced) {
      cb();
    } else {
      this._onSyncCallbacks.push(cb);
    }
  }

  destroy() {
    this._destroyed = true;
    this.doc.off('update', this._updateHandler);
    this.awareness.off('update', this._awarenessHandler);
    removeAwarenessStates(this.awareness, [this.doc.clientID], this);
    this.socket.off('yjs:sync-response');
    this.socket.off('yjs:update');
    this.socket.off('yjs:awareness');
    this.awareness.destroy();
  }
}
