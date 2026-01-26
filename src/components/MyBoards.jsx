import { useState } from 'react'
import ConceptsGuide from './ConceptsGuide'
import './MyBoards.css'

const MyBoards = ({ discoveredConcepts }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <>
      <div className="my-boards-container">
        <div className="my-boards-header">
          <button 
            className="help-button"
            onClick={() => setIsGuideOpen(true)}
            title="Open guide"
          >
            ?
          </button>
          <h2 className="my-boards-title">MY BOARDS</h2>
          <button className="settings-button">⚙️</button>
        </div>

        <div className="board-card">
          <div className="board-info">
            <span className="board-avatar">M</span>
            <div className="board-details">
              <h3 className="board-name">Miqueas's board</h3>
              <div className="board-stats">
                <span>{discoveredConcepts} concepts</span>
                <span>18 recipes</span>
              </div>
            </div>
          </div>
        </div>

        <button className="create-board-button">+ Create new board</button>
      </div>

      {/* Modal de guía */}
      <ConceptsGuide 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
    </>
  )
}

export default MyBoards