import { Play, Copy, Check, Share2, Menu, LogOut } from 'lucide-react';

interface User {
  socketId: string;
  username: string;
  cursorColor: string;
}

interface Props {
  roomName: string;
  roomSlug: string;
  users: User[];
  onRun: () => void;
  executing: boolean;
  language: string;
  copied: boolean;
  onCopyLink: () => void;
  onMenuClick?: () => void;
  onLeave: () => void;
}

export default function RoomHeader({ roomName, roomSlug, users, onRun, executing, language, copied, onCopyLink, onMenuClick, onLeave }: Props) {
  return (
    <div className="room-header">
      <div className="room-header-left">
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <span className="room-header-logo">SyncForge</span>
        <span className="room-header-divider desktop-only" />
        <span className="room-header-name desktop-only">{roomName}</span>
      </div>

      <div className="room-header-right">
        {/* User avatars */}
        <div className="user-avatars">
          {users.map((user) => (
            <div
              key={user.socketId}
              className="user-avatar"
              style={{ background: user.cursorColor }}
              title={user.username}
            >
              {user.username[0]?.toUpperCase()}
              <span className="user-avatar-tooltip">{user.username}</span>
            </div>
          ))}
        </div>

        {/* Leave Room button */}
        <button className="btn btn-ghost btn-sm" onClick={onLeave} title="Leave room">
          <LogOut size={14} />
          <span className="desktop-only">Leave</span>
        </button>

        {/* Copy link button */}
        <button className="btn btn-ghost btn-sm" onClick={onCopyLink} title="Copy share link">
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          <span className="desktop-only">{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Run button */}
        <button
          className="btn btn-primary btn-sm run-btn"
          onClick={onRun}
          disabled={executing}
        >
          {executing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Play size={14} />}
          <span className="desktop-only">{executing ? 'Running...' : 'Run'}</span>
        </button>
      </div>
    </div>
  );
}
