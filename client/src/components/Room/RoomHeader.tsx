import { Play, Copy, Check, Share2 } from 'lucide-react';

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
}

export default function RoomHeader({ roomName, roomSlug, users, onRun, executing, language, copied, onCopyLink }: Props) {
  return (
    <div className="room-header">
      <div className="room-header-left">
        <span className="room-header-logo">SyncForge</span>
        <span className="room-header-divider" />
        <span className="room-header-name">{roomName}</span>
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

        {/* Copy link button */}
        <button className="btn btn-ghost btn-sm" onClick={onCopyLink} title="Copy share link">
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Copied!' : 'Share'}
        </button>

        {/* Run button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onRun}
          disabled={executing}
          style={{ minWidth: 80 }}
        >
          {executing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Play size={14} />}
          {executing ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
}
