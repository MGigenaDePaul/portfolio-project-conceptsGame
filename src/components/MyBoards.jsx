import './MyBoards.css'

const MyBoards = ({ discoveredConcepts, onCombine, selectedA, selectedB }) => {
  const canCombine = selectedA && selectedB

  return (
    <div className="my-boards-container">
      <div className="my-boards-header">
        <button className="help-button">?</button>
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

      <button className="create-board-button">
        + Create new board
      </button>

      {canCombine && (
        <button className="combine-button" onClick={onCombine}>
          🔮 Combine
        </button>
      )}

      {selectedA || selectedB ? (
        <div className="selected-concepts">
          <div className="selected-slot">
            {selectedA ? `${selectedA.emoji} ${selectedA.name}` : '—'}
          </div>
          <span className="plus-sign">+</span>
          <div className="selected-slot">
            {selectedB ? `${selectedB.emoji} ${selectedB.name}` : '—'}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MyBoards