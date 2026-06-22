import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Globe, Play, Shield } from 'lucide-react';
import LineWaves from '../components/Background/LineWaves';

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
      {/* WebGL Background */}
      <div className="home-bg-canvas">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-46}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={0.15}
          color1="#0e089c"
          color2="#5802a9"
          color3="#00c1e2"
          enableMouseInteraction={true}
          mouseInfluence={1.4}
        />
      </div>

      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <Code2 size={20} />
          <span>SyncForge</span>
        </div>
        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowCreate(true); }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="home-content">
        <div className="home-pill">
          <span className="home-pill-dot" />
          Real-time. Collaborative. Effortless.
        </div>

        <h1 className="home-logo">SyncForge</h1>

        <p className="home-tagline">
          Real-time collaborative code editor with live multi-user sync,
          <strong> shared cursors</strong>, and sandboxed execution.
        </p>

        <div className="home-actions">
          <button className="btn btn-hero-primary" onClick={() => setShowCreate(true)}>
            <Code2 size={18} /> Create Room
          </button>
          <button className="btn btn-hero-secondary" onClick={() => setShowJoin(true)}>
            <Users size={18} /> Join Room
          </button>
        </div>

        {/* Feature Cards */}
        <div id="features" className="home-card">
          <div className="feature-card">
            <div className="feature-card-icon feature-icon-blue">
              <Zap size={22} />
            </div>
            <div className="feature-card-content">
              <h3>CRDT-Powered Sync</h3>
              <p>Conflict-free replicated data types ensure edits merge perfectly — no conflicts, ever.</p>
            </div>
            <div className="feature-badge feature-badge-blue">
              <span className="feature-badge-dot" /> Live Sync
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon feature-icon-purple">
              <Globe size={22} />
            </div>
            <div className="feature-card-content">
              <h3>Horizontally Scalable</h3>
              <p>Redis pub/sub broadcasts across Node.js instances — scales to thousands of users.</p>
            </div>
            <div className="feature-badge feature-badge-green">
              <span className="feature-badge-dot" /> High Availability
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon feature-icon-cyan">
              <Shield size={22} />
            </div>
            <div className="feature-card-content">
              <h3>Sandboxed Execution</h3>
              <p>Docker containers with strict resource limits run your code safely in isolation.</p>
            </div>
            <div className="feature-badge feature-badge-orange">
              <span className="feature-badge-dot" /> Secure by Default
            </div>
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
