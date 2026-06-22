import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Globe, Play, Shield } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim() || !nickname.trim()) return;
    setLoading(true);
    try {
      const url = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${url}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim() }),
      });
      const room = await res.json();
      sessionStorage.setItem('syncforge_nickname', nickname.trim());
      navigate(`/room/${room.slug}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!joinCode.trim() || !joinNickname.trim()) return;
    sessionStorage.setItem('syncforge_nickname', joinNickname.trim());
    navigate(`/room/${joinCode.trim()}`);
  };

  return (
    <div className="home-page">
      <div className="home-bg-grid" />
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />

      <div className="home-content">
        <h1 className="home-logo">SyncForge</h1>
        <p className="home-tagline">
          <strong>Real-time collaborative code editor</strong> with live multi-user sync,
          shared cursors, and sandboxed execution.
        </p>

        <div className="home-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
            <Code2 size={20} /> Create Room
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setShowJoin(true)}>
            <Users size={20} /> Join Room
          </button>
        </div>

        <div className="home-card">
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>
              <Zap size={20} />
            </div>
            <h3>CRDT-Powered Sync</h3>
            <p>Conflict-free replicated data types ensure edits merge perfectly — no conflicts, ever.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
              <Globe size={20} />
            </div>
            <h3>Horizontally Scalable</h3>
            <p>Redis pub/sub broadcasts across Node.js instances — scales to thousands of users.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: 'rgba(63,185,80,0.1)', color: '#3fb950' }}>
              <Shield size={20} />
            </div>
            <h3>Sandboxed Execution</h3>
            <p>Docker containers with strict resource limits run your code safely in isolation.</p>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal animate-slideInUp" onClick={(e) => e.stopPropagation()}>
            <h2>Create a Room</h2>
            <p>Set up a collaborative coding session.</p>
            <div className="modal-field">
              <label>Room Name</label>
              <input
                className="input"
                placeholder="e.g. Interview Session"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label>Your Nickname</label>
              <input
                className="input"
                placeholder="e.g. Alice"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? <span className="spinner" /> : <Play size={16} />}
                {loading ? 'Creating...' : 'Create & Enter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal animate-slideInUp" onClick={(e) => e.stopPropagation()}>
            <h2>Join a Room</h2>
            <p>Enter a room code to join an existing session.</p>
            <div className="modal-field">
              <label>Room Code</label>
              <input
                className="input"
                placeholder="e.g. abc12def"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label>Your Nickname</label>
              <input
                className="input"
                placeholder="e.g. Bob"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowJoin(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleJoin}>
                <Users size={16} /> Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
