interface User {
  socketId: string;
  username: string;
  cursorColor: string;
}

interface Props {
  users: User[];
  mySocketId: string;
}

export default function ParticipantList({ users, mySocketId }: Props) {
  return (
    <div className="participant-list">
      {users.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 10px' }}>
          No participants yet
        </p>
      )}
      {users.map((user) => (
        <div key={user.socketId} className="participant">
          <span className="participant-dot" style={{ background: user.cursorColor }} />
          <span className="participant-name">{user.username}</span>
          {user.socketId === mySocketId && (
            <span className="participant-you">(you)</span>
          )}
        </div>
      ))}
    </div>
  );
}
