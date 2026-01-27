import { useEffect } from 'react'
import './ConceptsGuide.css'

const ConceptsGuide = ({ isOpen, onClose }) => {
  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Función para abrir en nueva pestaña
  const openInNewTab = () => {
    const guideWindow = window.open('', '_blank')
    guideWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Concepts Guide</title>
        <style>
          body {
            margin: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            background: #171a1d;
            color: #c8d1db;
            padding: 40px;
            line-height: 1.6;
          }
          .guide-content {
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #fff;
            border-bottom: 2px solid #596773;
            padding-bottom: 16px;
          }
          h2 {
            color: #8b5cf6;
            margin-top: 32px;
          }
          .element-icons {
            display: flex;
            gap: 16px;
            margin: 16px 0;
          }
          .element-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(30, 35, 40, 0.9);
            border: 1px solid rgba(200, 209, 219, 0.15);
            border-radius: 24px;
          }
          .element-emoji { font-size: 24px; }
          ul { padding-left: 24px; }
          li { margin: 8px 0; }
          a { color: #8b5cf6; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="guide-content">
          <h1>Concepts Guide</h1>
          
          <section>
            <h2>🎮 The Game</h2>
            <p><strong>Concepts</strong> is a game about combining pairs of concepts to create new, derived concepts.</p>
            <p>Once you create a new board, you start with the four classical elements:</p>
            <div class="element-icons">
              <div class="element-item"><span class="element-emoji">🌍</span> Earth</div>
              <div class="element-item"><span class="element-emoji">🌬️</span> Air</div>
              <div class="element-item"><span class="element-emoji">🔥</span> Fire</div>
              <div class="element-item"><span class="element-emoji">💧</span> Water</div>
            </div>
            <p>Starting from here, you can combine concepts to build anything you can imagine!</p>
          </section>

          <section>
            <h2>🎯 How to Play</h2>
            <ul>
              <li><strong>Drag and Drop:</strong> Click and hold a concept bubble, then drag it onto another concept to combine them</li>
              <li><strong>Discover New Concepts:</strong> Successful combinations will create new concepts that appear on your board</li>
              <li><strong>Experiment:</strong> Not all combinations work, but there are hundreds of possible recipes to discover!</li>
              <li><strong>Build Your Collection:</strong> Keep combining to unlock more and more complex concepts</li>
            </ul>
          </section>

          <section>
            <h2>📊 Complexity</h2>
            <p>Each concept has a complexity level that indicates how many steps it takes to create from the base elements. The more complex a concept, the more combinations you had to discover to create it!</p>
          </section>

          <section>
            <h2>📚 Collections</h2>
            <p>Concepts are organized into thematic collections. As you play, you'll discover concepts across different categories like nature, technology, mythology, and more.</p>
          </section>

          <section>
            <h2>🏆 Leaderboards</h2>
            <p>Compete with other players to discover the most concepts and climb the global leaderboards. Can you discover them all?</p>
          </section>

          <section>
            <h2>👥 Multiplayer</h2>
            <p>Play with friends in multiplayer mode! Share your board and collaborate to discover new concepts together, or compete to see who can discover the most.</p>
          </section>

          <section>
            <h2>💡 Tips</h2>
            <ul>
              <li>Try combining similar concepts together</li>
              <li>Think about real-world relationships between things</li>
              <li>Don't be afraid to experiment with unusual combinations</li>
              <li>Some concepts can be created through multiple different recipes</li>
            </ul>
          </section>

          <section>
            <h2>⚠️ Development Notice</h2>
            <p style="color: rgba(255, 90, 90, 0.85); background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255, 90, 90, 0.35); border-radius: 6px; padding: 12px;">
              <strong>CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT.</strong> Discovered concepts may be lost between sessions. Save your progress by noting down your favorite combinations!
            </p>
          </section>
        </div>
      </body>
      </html>
    `)
    guideWindow.document.close()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay oscuro */}
      <div className="guide-overlay" onClick={onClose} />
      {/* Modal */}
      <div className="guide-modal">
        <div className="guide-header">
          <h2 className="guide-title">Concepts Guide</h2>
          <div className="guide-actions">
            <button
              className="guide-new-tab-btn"
              onClick={openInNewTab}
              title="Open in new tab"
            >
              ↗
            </button>
            <button
              className="guide-close-btn"
              onClick={onClose}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="guide-body">
          <p className="guide-welcome">
            Welcome to Concepts! You can also{' '}
            <button className="guide-link-btn" onClick={openInNewTab}>
              open this guide in a new tab ↗
            </button>
          </p>

          <section className="guide-section">
            <h3 className="guide-section-title">Index</h3>
            <ul className="guide-index">
              <li>
                <a href="#the-game">The Game</a>
              </li>
              <li>
                <a href="#complexity">Complexity</a>
              </li>
              <li>
                <a href="#collections">Collections</a>
              </li>
              <li>
                <a href="#leaderboards">Leaderboards</a>
              </li>
              <li>
                <a href="#multiplayer">Multiplayer</a>
              </li>
            </ul>
          </section>

          <section className="guide-section" id="the-game">
            <h3 className="guide-section-title">🎮 The Game</h3>
            <p>
              <strong>Concepts</strong> is a game about combining pairs of
              concepts to create new, derived concepts.
            </p>
            <p>
              Once you create a new board, you start with the four classical
              elements:
            </p>
            <div className="element-icons">
              <div className="element-item">
                <span className="element-emoji">🌍</span>
                <span>Earth</span>
              </div>
              <div className="element-item">
                <span className="element-emoji">🌬️</span>
                <span>Air</span>
              </div>
              <div className="element-item">
                <span className="element-emoji">🔥</span>
                <span>Fire</span>
              </div>
              <div className="element-item">
                <span className="element-emoji">💧</span>
                <span>Water</span>
              </div>
            </div>
            <p>
              Starting from here, you can combine concepts to build anything you
              can imagine!
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-section-title">🎯 How to Play</h3>
            <ul className="guide-list">
              <li>
                <strong>Drag and Drop:</strong> Click and hold a concept bubble,
                then drag it onto another concept to combine them
              </li>
              <li>
                <strong>Discover New Concepts:</strong> Successful combinations
                will create new concepts that appear on your board
              </li>
              <li>
                <strong>Experiment:</strong> Not all combinations work, but
                there are hundreds of possible recipes to discover!
              </li>
              <li>
                <strong>Build Your Collection:</strong> Keep combining to unlock
                more and more complex concepts
              </li>
            </ul>
          </section>

          <section className="guide-section" id="complexity">
            <h3 className="guide-section-title">📊 Complexity</h3>
            <p>
              Each concept has a complexity level that indicates how many steps
              it takes to create from the base elements. The more complex a
              concept, the more combinations you had to discover to create it!
            </p>
          </section>

          <section className="guide-section" id="collections">
            <h3 className="guide-section-title">📚 Collections</h3>
            <p>
              Concepts are organized into thematic collections. As you play,
              you'll discover concepts across different categories like nature,
              technology, mythology, and more.
            </p>
          </section>

          <section className="guide-section" id="leaderboards">
            <h3 className="guide-section-title">🏆 Leaderboards</h3>
            <p>
              Compete with other players to discover the most concepts and climb
              the global leaderboards. Can you discover them all?
            </p>
          </section>

          <section className="guide-section" id="multiplayer">
            <h3 className="guide-section-title">👥 Multiplayer</h3>
            <p>
              Play with friends in multiplayer mode! Share your board and
              collaborate to discover new concepts together, or compete to see
              who can discover the most.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-section-title">💡 Tips</h3>
            <ul className="guide-list">
              <li>Try combining similar concepts together</li>
              <li>Think about real-world relationships between things</li>
              <li>Don't be afraid to experiment with unusual combinations</li>
              <li>
                Some concepts can be created through multiple different recipes
              </li>
            </ul>
          </section>

          <section className="guide-section guide-warning">
            <h3 className="guide-section-title">⚠️ Development Notice</h3>
            <p className="warning-text">
              <strong>CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT.</strong>{' '}
              Discovered concepts may be lost between sessions. Save your
              progress by noting down your favorite combinations!
            </p>
          </section>
        </div>

        <div className="guide-footer">
          <button className="guide-footer-btn" onClick={onClose}>
            Close (Esc)
          </button>
        </div>
      </div>
    </>
  )
}

export default ConceptsGuide
