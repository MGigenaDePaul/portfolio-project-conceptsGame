// src/components/MyBoards.jsx
import { useState, useEffect } from 'react'
import ConceptsGuide from './ConceptsGuide'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { boardsApi } from '../api/boards'
import './MyBoards.css'

const MyBoards = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const { user, quickRegister } = useUser()

  // If user exists, load their single board
  useEffect(() => {
    if (!user) return

    const loadBoard = async () => {
      setLoading(true)
      setError(null)
      try {
        const boards = await boardsApi.getByUser(user.id)
        if (boards.length > 0) {
          setBoard(boards[0]) // Always use the first (only) board
        }
      } catch (err) {
        console.error('Failed to load board:', err)
        setError('Failed to load board')
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [user])

  const handlePlay = async () => {
    // If user already has a board, go directly
    if (board) {
      navigate(`/board/${board.id}`)
      return
    }

    setCreating(true)
    setError(null)

    try {
      // If no user yet, quick-create one
      let currentUser = user
      if (!currentUser) {
        const name = prompt('Enter your name to start:')
        if (!name || !name.trim()) {
          setCreating(false)
          return
        }
        currentUser = await quickRegister(name.trim())
      }

      // Create the single board for this user
      const newBoard = await boardsApi.create(
        `${currentUser.username}'s board`,
        currentUser.id,
      )

      setBoard(newBoard)
      navigate(`/board/${newBoard.id}`)
    } catch (err) {
      console.error('Failed to create board:', err)
      setError(err.message || 'Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {/* Header buttons */}
      <div className='my-boards-header-standalone'>
        <button
          className='help-button'
          onClick={() => setIsGuideOpen(true)}
          title='Open guide'
        >
          ?
        </button>
        <h2 className='my-boards-title'>MY BOARDS</h2>
        <button className='settings-button'>⚙️</button>
      </div>

      {/* Single board */}
      <div className='my-boards-container'>
        {error && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 90, 90, 0.15)',
              border: '1px solid rgba(255, 90, 90, 0.3)',
              borderRadius: '5px',
              fontSize: '12px',
              color: 'rgba(255, 90, 90, 0.9)',
              pointerEvents: 'auto',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              padding: '12px',
              fontSize: '13px',
              color: 'rgba(200, 209, 219, 0.6)',
              pointerEvents: 'auto',
            }}
          >
            Loading...
          </div>
        )}

        {/* Show existing board if user has one */}
        {!loading && board && (
          <button
            onClick={() => navigate(`/board/${board.id}`)}
            className='board-card'
          >
            <div className='board-info'>
              <span className='board-avatar'>
                {board.name?.charAt(0)?.toUpperCase() || 'B'}
              </span>
              <div className='board-details'>
                <h3 className='board-name'>{board.name}</h3>
                <div className='board-stats'>
                  <span>
                    {new Date(board.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Show play/create button if no board yet */}
        {!loading && !board && (
          <button
            className='create-board-button'
            onClick={handlePlay}
            disabled={creating}
          >
            {creating ? 'Creating...' : '▶ Play'}
          </button>
        )}
      </div>

      <ConceptsGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  )
}

export default MyBoards