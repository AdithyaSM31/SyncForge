<div align="center">

# ⚡ SyncForge

**Real-time Collaborative Code Editor**

A browser-based coding platform with live multi-user sync, shared cursors, and sandboxed execution — mirrors what FAANG uses in their own interview rounds.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-53b9ff?logo=capacitor&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-6366f1)
![Docker](https://img.shields.io/badge/Docker-Sandbox-2496ED?logo=docker&logoColor=white)

### 🌍 [Live Web Demo](https://sync-forge-client.vercel.app/)
*(Backend running on Render, may take 50s to wake up from cold boot)*

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                 │
│  React · Monaco Editor · Yjs CRDT · Awareness API        │
└────────────────┬────────────────────────────────────────┘
                 │ WebSocket (Socket.io)
┌────────────────▼────────────────────────────────────────┐
│  Node.js Server                                          │
│  Socket.io · Yjs Sync · Express API                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐     │
│  │  Redis    │  │ Prisma   │  │  Docker Sandbox    │     │
│  │  Adapter  │  │ (SQLite) │  │  (Code Execution)  │     │
│  └──────────┘  └──────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| **CRDT-Powered Sync** | Yjs ensures conflict-free merging — no server-side OT needed |
| **Shared Cursors** | See collaborators' cursors and selections in real-time via Awareness API |
| **6 Languages** | JavaScript, Python, C++, C, Java, Go |
| **Docker Sandbox** | Isolated execution with `--cap-drop=ALL`, `--network=none`, memory/CPU/PID limits |
| **Native Android** | Cross-platform compatibility using Capacitor with mobile edge-to-edge layout |
| **WebGL UI** | Hardware-accelerated `LineWaves` interactive background shader |
| **Room System** | Create/join rooms with shareable codes, persistent document state |
| **Mobile-First** | Split-pane tabbed layouts, sliding sidebar drawers, and status bar safe zones |

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **Docker Desktop** (for code execution)
- **Redis** (optional, for horizontal scaling)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client & create database
cd server && npx prisma generate && npx prisma db push && cd ..

# 3. Copy environment config
cp .env.example server/.env

# 4. Start development servers
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

### Build Sandbox Images (Optional)

```bash
# Build Docker images for sandboxed code execution
docker build -t syncforge-sandbox-js ./sandbox/javascript
docker build -t syncforge-sandbox-python ./sandbox/python
docker build -t syncforge-sandbox-cpp ./sandbox/cpp
docker build -t syncforge-sandbox-c ./sandbox/c
docker build -t syncforge-sandbox-java ./sandbox/java
docker build -t syncforge-sandbox-go ./sandbox/go
```

If custom images aren't built, the server auto-pulls public base images (`node:20-alpine`, `python:3.12-alpine`, etc.).

## 🧠 Interview Talking Points

### CRDTs vs Operational Transforms

> "I chose **Yjs (CRDT)** over OT because CRDTs are **commutative and idempotent** — operations can arrive in any order and still converge. OT requires a central server to linearize operations, creating a bottleneck. With Yjs, each client applies operations locally with zero latency, and the CRDT math guarantees eventual consistency. The tradeoff is higher memory (tombstones for deletions), but for code docs under ~100KB it's negligible."

### Horizontal WebSocket Scaling with Redis Pub/Sub

> "A single Node.js instance handles ~10K concurrent WebSocket connections, but that's a single point of failure. I used `@socket.io/redis-adapter` so when Client A edits on Server 1, the update publishes to a Redis channel and all other server instances broadcast to their connected clients. Yjs doc state is debounced to the database, so any server can load a room's state without depending on a specific instance."

### Docker Sandbox Security

> "Code runs in ephemeral Docker containers with defense-in-depth: `--cap-drop=ALL` removes all Linux capabilities, `--network=none` prevents data exfiltration, `--memory=128m --pids-limit=50` prevents resource exhaustion and fork bombs, and containers are destroyed after execution. For production, I'd swap Docker for **gVisor** (`runsc` runtime) which intercepts syscalls at the application kernel level."

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, TypeScript, Monaco Editor |
| **Mobile** | Ionic Capacitor v6 (Android APK distribution) |
| **CRDT Engine** | Yjs + y-monaco + y-protocols (Awareness) |
| **Transport** | Socket.io with custom Yjs provider |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | Prisma ORM + SQLite (→ PostgreSQL) |
| **Execution** | Docker (dockerode) with security hardening |
| **Styling** | Vanilla CSS + WebGL (ogl) with custom design system |

## 📁 Project Structure

```
SyncForge/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Editor, Room, Terminal, Layout
│       ├── lib/             # Socket.io, Yjs provider, themes
│       └── pages/           # HomePage, RoomPage
├── server/                  # Node.js backend
│   └── src/
│       ├── socket/          # Socket.io + Yjs sync handlers
│       ├── services/        # Execution, Room, Persistence
│       ├── routes/          # REST API endpoints
│       └── config/          # Env, Redis setup
├── sandbox/                 # Docker images (JS, Python, C++, C, Java, Go)
└── docker-compose.yml       # Redis infrastructure
```

## 📝 License

MIT
