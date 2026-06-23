import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { getSocket } from '../lib/socket';
import { SocketIOProvider } from '../lib/yjsSocketProvider';
import { DEFAULT_CODE } from '../lib/themes';
import CollaborativeEditor from '../components/Editor/CollaborativeEditor';
import OutputPanel from '../components/Terminal/OutputPanel';
import RoomHeader from '../components/Room/RoomHeader';
import ParticipantList from '../components/Room/ParticipantList';
import LanguageSelector from '../components/Editor/LanguageSelector';
import { Copy, Share2 } from 'lucide-react';

interface User {
  socketId: string;
  username: string;
  cursorColor: string;
}

interface RoomInfo {
  id: string;
  slug: string;
  name: string;
  language: string;
}

interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [myColor, setMyColor] = useState('#58a6ff');
  const [language, setLanguage] = useState('javascript');
  const [stdin, setStdin] = useState('');
  const [activeLanguages, setActiveLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string; color: string }[]>([]);
  const [nickname, setNickname] = useState('');
  const [needsNickname, setNeedsNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<SocketIOProvider | null>(null);
  const socketRef = useRef(getSocket());
  const toastIdRef = useRef(0);

  const addToast = useCallback((text: string, color: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, text, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const joinRoom = useCallback((name: string) => {
    if (!slug) return;
    const socket = socketRef.current;
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    socket.emit('room:join', { roomSlug: slug, username: name }, (response: any) => {
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      setRoomInfo(response.room);
      setUsers(response.users);
      setMyColor(response.cursorColor);
      setLanguage(response.room.language);

      // Set up Yjs provider
      const provider = new SocketIOProvider(socket, response.roomId, ydoc, {
        name,
        color: response.cursorColor,
      });
      providerRef.current = provider;

      // Track active languages
      const checkActiveLanguages = () => {
        const langs = ['javascript', 'python', 'cpp', 'c', 'java', 'go'];
        const active = langs.filter(l => ydoc.getText(`monaco-${l}`).length > 0);
        setActiveLanguages(active);
      };
      
      ydoc.on('update', checkActiveLanguages);
      
      // Wait for provider sync, then insert default code for the initial language if it's completely empty
      // and if we are the one who created the room (the only person in it).
      // We check this by seeing if our clientID is the only one.
      provider.onSync(() => {
        const yText = ydoc.getText(`monaco-${response.room.language}`);
        const allIds = Array.from(provider.awareness.getStates().keys());
        if (yText.length === 0 && DEFAULT_CODE[response.room.language] && allIds.length <= 1) {
          yText.insert(0, DEFAULT_CODE[response.room.language]);
        }
        checkActiveLanguages();
      });

      setLoading(false);
    });

    // Listen for user events
    socket.on('room:user-joined', (user: User) => {
      setUsers(prev => [...prev.filter(u => u.socketId !== user.socketId), user]);
      addToast(`${user.username} joined`, user.cursorColor);
    });

    socket.on('room:user-left', ({ socketId }: { socketId: string }) => {
      setUsers(prev => {
        const leaving = prev.find(u => u.socketId === socketId);
        if (leaving) addToast(`${leaving.username} left`, leaving.cursorColor);
        return prev.filter(u => u.socketId !== socketId);
      });
    });

    socket.on('room:language-changed', ({ language: lang }: { language: string }) => {
      setLanguage(lang);
    });
  }, [slug, addToast]);

  useEffect(() => {
    const saved = sessionStorage.getItem('syncforge_nickname');
    if (saved) {
      setNickname(saved);
      joinRoom(saved);
    } else {
      setNeedsNickname(true);
      setLoading(false);
    }

    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
      const socket = socketRef.current;
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.off('room:language-changed');
    };
  }, [joinRoom]);

  const handleNicknameSubmit = () => {
    if (!nicknameInput.trim()) return;
    const name = nicknameInput.trim();
    setNickname(name);
    sessionStorage.setItem('syncforge_nickname', name);
    setNeedsNickname(false);
    setLoading(true);
    joinRoom(name);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    
    // Explicitly insert default code if the user clicks the language
    // and it hasn't been used yet.
    if (ydocRef.current) {
      const yText = ydocRef.current.getText(`monaco-${lang}`);
      if (yText.length === 0 && DEFAULT_CODE[lang]) {
        yText.insert(0, DEFAULT_CODE[lang]);
      }
    }

    if (roomInfo) {
      const url = import.meta.env.VITE_API_URL || '';
      socketRef.current.emit('room:language-change', { roomId: roomInfo.id, language: lang });
      fetch(`${url}/api/rooms/${roomInfo.id}/language`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      }).catch(() => {});
    }
  };

  const handleRun = async () => {
    if (!ydocRef.current || !roomInfo) return;
    const code = ydocRef.current.getText(`monaco-${language}`).toString();
    if (!code.trim()) return;

    setExecuting(true);
    setExecutionResult(null);
    try {
      const url = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${url}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin, roomId: roomInfo.id }),
      });
      const result = await res.json();
      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        output: '',
        error: 'Failed to connect to execution server. Is Docker running?',
        exitCode: -1,
        executionTimeMs: 0,
        timedOut: false,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Nickname prompt
  if (needsNickname) {
    return (
      <div className="home-page">
        <div className="home-bg-grid" />
        <div className="home-glow home-glow-1" />
        <div className="home-glow home-glow-2" />
        <div className="modal animate-slideInUp" style={{ position: 'relative', zIndex: 1 }}>
          <h2>Enter Your Nickname</h2>
          <p>Choose a name for this coding session.</p>
          <div className="modal-field">
            <input
              className="input"
              placeholder="e.g. Alice"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNicknameSubmit()}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back</button>
            <button className="btn btn-primary" onClick={handleNicknameSubmit}>Join Session</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Connecting to room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="loading-text" style={{ color: '#f85149' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="room-layout">
      <RoomHeader
        roomName={roomInfo?.name || ''}
        roomSlug={roomInfo?.slug || ''}
        users={users}
        onRun={handleRun}
        executing={executing}
        language={language}
        copied={copied}
        onCopyLink={handleCopyLink}
        onMenuClick={() => setShowSidebar(!showSidebar)}
      />

      <div className="room-body">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
        )}
        
        {/* Sidebar */}
        <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
          <div className="sidebar-section">
            <div className="sidebar-section-title">Language</div>
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>
          
          {activeLanguages.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Open Files</div>
              <div className="active-languages-list">
                {activeLanguages.map(lang => (
                  <button 
                    key={lang}
                    className={`btn btn-ghost file-tab ${lang === language ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      fontSize: '13px', 
                      padding: '6px 12px',
                      background: lang === language ? '#264f7830' : 'transparent',
                      borderLeft: lang === language ? '2px solid #58a6ff' : '2px solid transparent',
                      borderRadius: '0 4px 4px 0'
                    }}
                  >
                    {lang === 'javascript' ? '🟨 main.js' :
                     lang === 'python' ? '🐍 main.py' :
                     lang === 'cpp' ? '⚡ main.cpp' :
                     lang === 'c' ? '🔧 main.c' :
                     lang === 'java' ? '☕ Main.java' :
                     lang === 'go' ? '🐹 main.go' : lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-section" style={{ flex: 1 }}>
            <div className="sidebar-section-title">Participants</div>
            <ParticipantList users={users} mySocketId={socketRef.current.id || ''} />
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-title">Share</div>
            <div className="share-link">
              <input className="share-link-input" value={roomInfo?.slug || ''} readOnly />
              <button className="btn btn-ghost btn-icon" onClick={handleCopyLink} title="Copy link">
                {copied ? '✓' : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Editor + Output */}
        <div className="editor-area">
          <div className="editor-container">
            {ydocRef.current && providerRef.current && (
              <CollaborativeEditor
                ydoc={ydocRef.current}
                provider={providerRef.current}
                language={language}
                defaultCode={DEFAULT_CODE[language] || ''}
              />
            )}
          </div>
          <OutputPanel 
            result={executionResult} 
            executing={executing} 
            language={language}
            stdin={stdin}
            onStdinChange={setStdin}
          />
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className="toast">
              <span className="toast-dot" style={{ background: t.color }} />
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
