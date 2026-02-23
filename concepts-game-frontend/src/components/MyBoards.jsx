// src/components/MyBoards.jsx
import { useState, useEffect } from 'react';
import ConceptsGuide from './ConceptsGuide';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { boardsApi } from '../api/boards';
import './MyBoards.css';

const MyBoards = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user, logout } = useUser();

  // If user exists, load their single board
  useEffect(() => {
    if (!user) return;

    const loadBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        const boards = await boardsApi.getByUser(user.id);
        if (boards.length > 0) {
          setBoard(boards[0]); // Always use the first (only) board
        }
      } catch (err) {
        console.error('Failed to load board:', err);
        setError('Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [user]);

  /* ── Create board (user is guaranteed logged-in) ── */
  const handleCreateBoard = async () => {
    setCreating(true);
    setError(null);
    try {
      const newBoard = await boardsApi.create(
        `${user.username}'s board`,
        user.id,
      );
      setBoard(newBoard);
      navigate(`/board/${newBoard.id}`);
    } catch (err) {
      console.error('Failed to create board:', err);
      setError(err.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    setBoard(null);
  };

  /* ── Logged-out state ── */
  if (!user) {
    return (
      <>
        <div className="my-boards-header-standalone">
          <button
            className="help-button"
            onClick={() => setIsGuideOpen(true)}
            title="Open guide"
          >
            ?
          </button>
          <h2 className="my-boards-title">MY BOARDS</h2>
          <div style={{ width: 32 }} /> {/* spacer for alignment */}
        </div>

        <div className="my-boards-container">
          <div className="auth-prompt">
            <p className="auth-prompt-text">Sign in to start combining</p>
            <div className="auth-prompt-buttons">
              <button
                className="auth-prompt-btn auth-prompt-login"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button
                className="auth-prompt-btn auth-prompt-register"
                onClick={() =>  {
                  console.log('CLICK FIRED');
                  navigate('/register');
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        <ConceptsGuide
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </>
    );
  }

  /* ── Logged-in state ── */
  return (
    <>
      <div className="my-boards-header-standalone">
        <button
          className="help-button"
          onClick={() => setIsGuideOpen(true)}
          title="Open guide"
        >
          ?
        </button>
        <h2 className="my-boards-title">MY BOARDS</h2>
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Log out"
        >
          ↪ Out
        </button>
      </div>

      <div className="my-boards-container">
        {error && (
          <div className="my-boards-error">⚠️ {error}</div>
        )}

        {loading && <div className="my-boards-loading">Loading…</div>}

        {!loading && board && (
          <button
            onClick={() => navigate(`/board/${board.id}`)}
            className="board-card"
          >
            <span className="board-card-name">{board.name}</span>
            <span className="board-card-arrow">→</span>
          </button>
        )}

        {!loading && !board && (
          <button
            className="create-board-button"
            onClick={handleCreateBoard}
            disabled={creating}
          >
            {creating ? 'Creating…' : '▶ Play'}
          </button>
        )}
      </div>

      <ConceptsGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export default MyBoards;