import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Board.css'

const Board = () => {
  // Mock data - replace with real data later
  const [selectedCollection] = useState('States of Matter')
  
  const concepts = [
    // UNCATEGORIZED
    { id: 1, name: 'Combustion', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 805, y: 100 } },
    { id: 2, name: 'Eruption', emoji: '🌋', category: 'UNCATEGORIZED', position: { x: 560, y: 113 } },
    { id: 3, name: 'Bioluminescence', emoji: '💧', category: 'UNCATEGORIZED', position: { x: 368, y: 144 } },
    { id: 4, name: 'Lava Ocean', emoji: '🌊', category: 'UNCATEGORIZED', position: { x: 212, y: 187 } },
    { id: 5, name: 'Wildfire', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 410, y: 209 } },
    { id: 6, name: 'Pyrocumulus', emoji: '☁️', category: 'UNCATEGORIZED', position: { x: 590, y: 187 } },
    { id: 7, name: 'Ash Cloud', emoji: '☁️', category: 'UNCATEGORIZED', position: { x: 713, y: 163 } },
    { id: 8, name: 'Sun', emoji: '☀️', category: 'UNCATEGORIZED', position: { x: 581, y: 244 } },
    { id: 9, name: 'Wildfire', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 711, y: 246 } },
    { id: 10, name: 'Sun', emoji: '☀️', category: 'UNCATEGORIZED', position: { x: 295, y: 277 } },
    { id: 11, name: 'Pollution', emoji: '☣️', category: 'UNCATEGORIZED', position: { x: 413, y: 277 } },
    { id: 12, name: 'Stratosphere', emoji: '🌍', category: 'UNCATEGORIZED', position: { x: 520, y: 294 } },
    { id: 13, name: 'Lava', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 837, y: 265 } },
    { id: 14, name: 'Bioluminescence', emoji: '💧', category: 'UNCATEGORIZED', position: { x: 697, y: 343 } },
    { id: 15, name: 'Dystopia', emoji: '🏙️', category: 'UNCATEGORIZED', position: { x: 384, y: 359 } },
    { id: 16, name: 'Blaze', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 560, y: 383 } },
    { id: 17, name: 'Geothermal', emoji: '🌡️', category: 'UNCATEGORIZED', position: { x: 775, y: 394 } },
    { id: 18, name: 'Ash Cloud', emoji: '☁️', category: 'UNCATEGORIZED', position: { x: 180, y: 391 } },
    { id: 19, name: 'Altitude', emoji: '⛰️', category: 'UNCATEGORIZED', position: { x: 897, y: 449 } },
    { id: 20, name: 'Volcano', emoji: '🌋', category: 'UNCATEGORIZED', position: { x: 311, y: 450 } },
    { id: 21, name: 'Mist', emoji: '🌫️', category: 'UNCATEGORIZED', position: { x: 541, y: 451 } },
    { id: 22, name: 'Eruption', emoji: '🌋', category: 'UNCATEGORIZED', position: { x: 728, y: 456 } },
    { id: 23, name: 'Lava', emoji: '🔥', category: 'UNCATEGORIZED', position: { x: 837, y: 508 } },
    { id: 24, name: 'Sea', emoji: '🌊', category: 'UNCATEGORIZED', position: { x: 618, y: 512 } },
    { id: 25, name: 'Cumulus', emoji: '☁️', category: 'UNCATEGORIZED', position: { x: 131, y: 524 } },
    { id: 26, name: 'Terra Cotta', emoji: '🏺', category: 'UNCATEGORIZED', position: { x: 321, y: 529 } },
    { id: 27, name: 'Water Vapor', emoji: '💨', category: 'UNCATEGORIZED', position: { x: 591, y: 571 } },
    { id: 28, name: 'Atmosphere', emoji: '🌍', category: 'UNCATEGORIZED', position: { x: 817, y: 600 } },
    { id: 29, name: 'Magma', emoji: '🌋', category: 'UNCATEGORIZED', position: { x: 207, y: 613 } },
    { id: 30, name: 'Magma', emoji: '🌋', category: 'UNCATEGORIZED', position: { x: 581, y: 657 } },
    { id: 31, name: 'Sky', emoji: '☁️', category: 'UNCATEGORIZED', position: { x: 440, y: 692 } },
  ]

  const categories = {
    'UNCATEGORIZED': [
      { name: 'Combustion', emoji: '🔥' },
      { name: 'Altitude', emoji: '⛰️' },
      { name: 'Geothermal', emoji: '🌡️' },
      { name: 'Blaze', emoji: '🔥' },
      { name: 'Dystopia', emoji: '🏙️' },
      { name: 'Bioluminescence', emoji: '💧' },
      { name: 'Mist', emoji: '🌫️' },
      { name: 'Ash Cloud', emoji: '☁️' },
      { name: 'Inferno', emoji: '💥' },
      { name: 'Sun', emoji: '☀️' },
      { name: 'Mudpit', emoji: '🟤' },
      { name: 'Yellowstone', emoji: '🌋' },
      { name: 'Air', emoji: '🌬️' },
      { name: 'Earth', emoji: '🌍' },
      { name: 'Fire', emoji: '🔥' },
      { name: 'Water', emoji: '💧' },
    ],
    'METEOROLOGY': [
      { name: 'Stratosphere', emoji: '🌍' },
      { name: 'Pyrocumulus', emoji: '☁️' },
      { name: 'Cumulus', emoji: '☁️' },
      { name: 'Humidity', emoji: '💧' },
    ],
    'MATERIAL': [
      { name: 'Terra Cotta', emoji: '🏺' },
      { name: 'Clay', emoji: '🟤' },
      { name: 'Sludge', emoji: '🟤' },
      { name: 'Mud', emoji: '🟤' },
    ],
    'GAS': [
      { name: 'Water Vapor', emoji: '💨' },
      { name: 'Oxygen', emoji: '🧪' },
      { name: 'Vapor', emoji: '💨' },
      { name: 'Steam', emoji: '☁️' },
      { name: 'Smoke', emoji: '💨' },
      { name: 'Plasma', emoji: '⚡' },
    ],
    'NATURE': [
      { name: 'Cloud', emoji: '☁️' },
      { name: 'Mountain', emoji: '⛰️' },
      { name: 'Ocean', emoji: '🌊' },
      { name: 'Ash', emoji: '🌫️' },
      { name: 'Sky', emoji: '☁️' },
    ],
    'ENVIRONMENT': [
      { name: 'Sea', emoji: '🌊' },
      { name: 'Dust', emoji: '💨' },
      { name: 'Wildfire', emoji: '🔥' },
      { name: 'Toxic Waste', emoji: '☣️' },
      { name: 'Pollution', emoji: '☣️' },
      { name: 'Smog', emoji: '🌫️' },
      { name: 'Ecosystem', emoji: '🌿' },
      { name: 'Biosphere', emoji: '🌍' },
    ],
  }

  return (
    <div className="myboards-container">
      {/* Sidebar */}
      <div className="myboards-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">📚</span>
          <span className="sidebar-title">MY COLLECTION</span>
        </div>
        
        <div className="collection-item active">
          <span className="collection-emoji">🧪</span>
          <span className="collection-name">{selectedCollection}</span>
          <span className="collection-indicator">🟢</span>
        </div>
      </div>

      {/* Main board area */}
      <div className="board-main">
        {/* Top toolbar */}
        <div className="board-toolbar">
          <button className="toolbar-btn" title="Undo">
            <span>↶</span>
          </button>
          <button className="toolbar-btn" title="Collections">
            <span>📊</span>
          </button>
          <button className="toolbar-btn" title="Home">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <span>🏠</span>
            </Link>
          </button>
          <button className="toolbar-btn" title="Settings">
            <span>⚙️</span>
          </button>
        </div>

        {/* Concepts scattered on board */}
        <div className="board-canvas">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className="board-concept"
              style={{
                left: `${concept.position.x}px`,
                top: `${concept.position.y}px`,
              }}
            >
              <span className="board-concept-emoji">{concept.emoji}</span>
              <span className="board-concept-name">{concept.name}</span>
            </div>
          ))}

          {/* Warning message at bottom */}
          <div className="board-warning">
            <p>CONCEPTS IS STILL UNDER HEAVY</p>
            <p>DEVELOPMENT. DISCOVERED CONCEPTS</p>
            <p>WILL BE LOST</p>
          </div>
        </div>
      </div>

      {/* Knowledge sidebar */}
      <div className="knowledge-sidebar">
        <div className="knowledge-header">
          <h2 className="knowledge-title">Knowledge</h2>
          <p className="knowledge-count">53 concepts</p>
        </div>

        <div className="knowledge-search">
          <input
            type="text"
            placeholder="Search everything... (Control + F)"
            className="knowledge-search-input"
          />
          <button className="knowledge-filter-btn">☰</button>
        </div>

        <div className="knowledge-categories">
          {Object.entries(categories).map(([categoryName, items]) => (
            <div key={categoryName} className="knowledge-category">
              <div className="category-header">
                <span className="category-name">{categoryName}</span>
                <span className="category-count">{items.length}</span>
              </div>
              <div className="category-items">
                {items.map((item, idx) => (
                  <div key={idx} className="category-item">
                    <span className="category-item-emoji">{item.emoji}</span>
                    <span className="category-item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Board