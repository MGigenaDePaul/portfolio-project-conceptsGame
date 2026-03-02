import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { roomsApi } from '../api/rooms';

export default function MultiplayerLobby() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const { code } = await roomsApi.create();
      navigate(`/multiplayer/${code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { code } = await roomsApi.join(joinCode.trim());
      navigate(`/multiplayer/${code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 Multiplayer</h1>
      <p style={styles.subtitle}>Play Concepts with friends in real-time</p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Create a Room</h2>
        <p style={styles.cardText}>Start a new room and invite friends with a code</p>
        <button onClick={handleCreate} disabled={loading} style={styles.createBtn}>
          {loading ? 'Creating...' : '✨ Create Room'}
        </button>
      </div>

      <div style={styles.divider}>
        <span style={styles.dividerText}>OR</span>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Join a Room</h2>
        <form onSubmit={handleJoin} style={styles.joinForm}>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={styles.input}
          />
          <button type="submit" disabled={loading || !joinCode.trim()} style={styles.joinBtn}>
            {loading ? 'Joining...' : '🚀 Join'}
          </button>
        </form>
      </div>

      <button onClick={() => navigate('/')} style={styles.backBtn}>
        ← Back to Home
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#fff',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#888',
    marginBottom: '2rem',
    fontSize: '1.1rem',
  },
  error: {
    background: '#ff4444',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
  },
  cardText: {
    color: '#888',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  createBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '12px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
    margin: '1.5rem 0',
  },
  dividerText: {
    color: '#555',
    padding: '0 1rem',
    fontSize: '0.9rem',
    margin: '0 auto',
  },
  joinForm: {
    display: 'flex',
    gap: '0.75rem',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #444',
    background: '#0a0a0f',
    color: '#fff',
    fontSize: '1.2rem',
    textAlign: 'center',
    letterSpacing: '4px',
    fontWeight: 'bold',
  },
  joinBtn: {
    background: '#4ECDC4',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: '2rem',
    background: 'transparent',
    color: '#888',
    border: '1px solid #333',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};