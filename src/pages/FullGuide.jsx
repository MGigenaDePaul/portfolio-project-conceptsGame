import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './FullGuide.css'

const FullGuide = () => {
  const location = useLocation()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/faq') return 'faq'
    if (path === '/privacy') return 'privacy'
    if (path === '/terms') return 'terms'
    return 'guide'
  }

  const activeTab = getActiveTab()

  return (
    <div className="full-guide-container">
      {/* Header */}
      <div className="full-guide-header">
        <Link to="/" className="back-button">
          ← Go back to the game
        </Link>
        <h1 className="guide-main-title">Concepts Guide</h1>

        {/* Tabs */}
        <div className="guide-tabs">
          <Link
            to="/guide"
            className={`guide-tab ${activeTab === 'guide' ? 'active' : ''}`}
          >
            Guide
          </Link>
          <Link
            to="/faq"
            className={`guide-tab ${activeTab === 'faq' ? 'active' : ''}`}
          >
            FAQ
          </Link>
          <Link
            to="/privacy"
            className={`guide-tab ${activeTab === 'privacy' ? 'active' : ''}`}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className={`guide-tab ${activeTab === 'terms' ? 'active' : ''}`}
          >
            Terms and Conditions
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="full-guide-content">
        {activeTab === 'guide' && (
          <>
            {/* The Game Section */}
            <section className="guide-section">
              <h2 className="section-title">The game</h2>
              <p className="section-text">
                <strong>Concepts</strong> is a game about combining pairs of
                concepts to create new, derived concepts.
              </p>
              <p className="section-text">
                Once you create a new board, you start with the four{' '}
                <span className="highlight">classical elements</span>:
              </p>

              <div className="elements-row">
                <div className="element-badge element-earth">
                  <span className="element-emoji">🌍</span>
                  <span className="element-name">Earth</span>
                </div>
                <div className="element-badge element-air">
                  <span className="element-emoji">🌬️</span>
                  <span className="element-name">Air</span>
                </div>
                <div className="element-badge element-fire">
                  <span className="element-emoji">🔥</span>
                  <span className="element-name">Fire</span>
                </div>
                <div className="element-badge element-water">
                  <span className="element-emoji">💧</span>
                  <span className="element-name">Water</span>
                </div>
              </div>

              <p className="section-text">
                Starting from here, you can combine concepts to build anything
                you can imagine!
              </p>

              <p className="section-text">
                Concepts extends the game <em>Infinity Craft</em> by Neal,
                introducing many new features: account syncing, multiplayer,
                collections, stats, leaderboards, concept complexity, and more!
                Keep reading to learn more or{' '}
                <Link to="/" className="play-link">
                  go play now
                </Link>
                !
              </p>
            </section>

            {/* Complexity Section */}
            <section className="guide-section">
              <h2 className="section-title section-title-complexity">
                Complexity
              </h2>

              <p className="section-text">
                The complexity is a number that indicates how many combinations
                are needed to reach a concept.
              </p>

              <p className="section-text">
                The initial classical elements have a complexity of 1:{' '}
                <span className="inline-complexity-badge">
                  <span className="badge-emoji">🌍</span>
                  <span className="badge-name">Earth</span>
                  <span className="badge-complexity-number green">1</span>
                </span>
              </p>

              <p className="section-text">
                To compute the complexity of a new concept, you must take the{' '}
                <strong className="underline-emphasis">
                  maximum complexity of the two ingredients plus 1
                </strong>
                , for example:
              </p>

              {/* Complexity Diagram - Exact Screenshot Match */}
              <div className="complexity-diagram-box">
                <div className="complexity-diagram">
                  {/* Sea - Top */}
                  <div className="diagram-node node-sea">
                    <span className="node-emoji">🌊</span>
                    <span className="node-name">Sea</span>
                    <span className="node-complexity complexity-green">6</span>
                  </div>

                  {/* Connection Line from Sea to Beach */}
                  <svg
                    className="diagram-connector connector-sea"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0 0 Q 50 50 100 100"
                      stroke="#9aff6b"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>

                  {/* Beach - Right (Result) */}
                  <div className="diagram-node node-beach">
                    <span className="node-emoji">🏖️</span>
                    <span className="node-name">Beach</span>
                    <span className="node-complexity complexity-yellow">
                      15
                    </span>
                  </div>

                  {/* Connection Line from Sun to Beach */}
                  <svg
                    className="diagram-connector connector-sun"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0 100 Q 50 50 100 0"
                      stroke="#9aff6b"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>

                  {/* Sun - Bottom */}
                  <div className="diagram-node node-sun">
                    <span className="node-emoji">☀️</span>
                    <span className="node-name">Sun</span>
                    <span className="node-complexity complexity-yellow">
                      14
                    </span>
                  </div>
                </div>
              </div>

              <p className="section-text">
                This way, each board has its own tree of concepts where each can
                have different complexities. This leads to interesting
                competitions, where you may be the only one holding the lowest
                complexity!
              </p>

              {/* Cascade Effect */}
              <div className="cascade-subsection">
                <h3 className="subsection-title">
                  ✨ Cascade effect improvements
                </h3>

                <p className="section-text">
                  When you discover a better recipe (with lower complexity) for
                  a concept, every recipe that depends on that concept will{' '}
                  <strong>automatically recalculate</strong> and potentially
                  improve!
                </p>

                <p className="section-text">
                  For example, assuming you already discovered the recipe from
                  above (<em>Sea + Sun = Beach</em>), if you now discover a
                  better recipe for Sun:
                </p>

                {/* Sun Improvement */}
                <div className="improvement-row">
                  <div className="improvement-concept sun">
                    <span className="ic-emoji">☀️</span>
                    <span className="ic-name">Sun</span>
                    <span className="ic-complexity yellow">14</span>
                  </div>
                  <span className="improvement-arrow">→</span>
                  <div className="improvement-concept sun">
                    <span className="ic-emoji">☀️</span>
                    <span className="ic-name">Sun</span>
                    <span className="ic-complexity green">8</span>
                  </div>
                </div>

                <p className="section-text">
                  then the complexity of Beach will improve as well, since you
                  know that <em>Sea + Sun = Beach</em>:
                </p>

                {/* Beach Improvement */}
                <div className="improvement-row">
                  <div className="improvement-concept beach">
                    <span className="ic-emoji">🏖️</span>
                    <span className="ic-name">Beach</span>
                    <span className="ic-complexity yellow">15</span>
                  </div>
                  <span className="improvement-arrow">→</span>
                  <div className="improvement-concept beach">
                    <span className="ic-emoji">🏖️</span>
                    <span className="ic-name">Beach</span>
                    <span className="ic-complexity green">9</span>
                  </div>
                </div>

                <p className="section-text cascade-highlight">
                  This creates a{' '}
                  <strong className="cascade-text">cascade effect</strong> where
                  a single discovery can improve dozens or even hundreds of
                  concepts at once, making trying to discover novel recipes a
                  fun challenge!
                </p>
              </div>
            </section>

            {/* Collections Section */}
            <section className="guide-section">
              <h2 className="section-title section-title-collections">
                Collections
              </h2>
              <p className="section-text">
                Collections are themed groups of concepts organized into three
                tiers of increasing difficulty.
              </p>
              <p className="section-text">
                Examples include Colors, Fruits, Famous Scientists, and many,{' '}
                <strong>many</strong> more.
              </p>

              {/* Collection Card */}
              <div className="collection-card">
                <div className="collection-header">
                  <span className="collection-icon">🍎</span>
                  <h3 className="collection-name">Fruits (example)</h3>
                </div>

                {/* Progress Bars */}
                <div className="tier-progress">
                  <div className="tier-row">
                    <div className="tier-info">
                      <span className="tier-label easy">EASY</span>
                      <span className="tier-count complete">✓ 4</span>
                    </div>
                    <div className="tier-bar">
                      <div
                        className="tier-fill easy"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="tier-row">
                    <div className="tier-info">
                      <span className="tier-label medium">MEDIUM</span>
                      <span className="tier-count">3 of 5</span>
                    </div>
                    <div className="tier-bar">
                      <div
                        className="tier-fill medium"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="tier-row">
                    <div className="tier-info">
                      <span className="tier-label hard">HARD</span>
                      <span className="tier-count">1 of 3</span>
                    </div>
                    <div className="tier-bar">
                      <div
                        className="tier-fill hard"
                        style={{ width: '33%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Concept Lists */}
                <div className="collection-concepts">
                  <div className="concept-tier">
                    <h4 className="tier-label easy">EASY</h4>
                    <div className="concept-grid">
                      <div className="concept-item discovered apple">
                        <span>🍎 Apple</span>
                        <span className="item-complexity green">6</span>
                      </div>
                      <div className="concept-item discovered orange">
                        <span>🍊 Orange</span>
                        <span className="item-complexity green">9</span>
                      </div>
                      <div className="concept-item discovered pear">
                        <span>🍐 Pear</span>
                        <span className="item-complexity green">9</span>
                      </div>
                      <div className="concept-item discovered banana">
                        <span>🍌 Banana</span>
                        <span className="item-complexity yellow">23</span>
                      </div>
                    </div>
                  </div>

                  <div className="concept-tier">
                    <h4 className="tier-label medium">
                      MEDIUM <span className="remaining">2 remaining</span>
                    </h4>
                    <div className="concept-grid">
                      <div className="concept-item discovered mango">
                        <span>🥭 Mango</span>
                        <span className="item-complexity green">11</span>
                      </div>
                      <div className="concept-item discovered pineapple">
                        <span>🍍 Pineapple</span>
                        <span className="item-complexity yellow">18</span>
                      </div>
                      <div className="concept-item discovered watermelon">
                        <span>🍉 Watermelon</span>
                        <span className="item-complexity yellow">21</span>
                      </div>
                      <div className="concept-item locked">Coconut</div>
                      <div className="concept-item locked">Kiwi</div>
                    </div>
                  </div>

                  <div className="concept-tier">
                    <h4 className="tier-label hard">
                      HARD <span className="remaining">2 remaining</span>
                    </h4>
                    <div className="concept-grid">
                      <div className="concept-item discovered starfruit">
                        <span>⭐ Starfruit</span>
                        <span className="item-complexity green">12</span>
                      </div>
                      <div className="concept-item locked">Guava</div>
                      <div className="concept-item locked">Pomegranate</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="section-text">
                Track your progress as you discover each concept, and challenge
                yourself to achieve the lowest total complexity for a
                collection. Each difficulty has its own set of concepts to find,
                can you complete them all?
              </p>
            </section>

            {/* Leaderboards Section */}
            <section className="guide-section">
              <h2 className="section-title section-title-leaderboards">
                Leaderboards
              </h2>
              <p className="section-text">
                Every collection has a leaderboard where boards are ranked based
                on the concepts they have discovered. There is{' '}
                <strong>a leaderboard for each collection</strong>, and a{' '}
                <strong>global leaderboard</strong> where boards are ranked
                across all collections.
              </p>

              <p className="section-text">Leaderboards are sorted like this:</p>

              <ul className="leaderboard-rules">
                <li>
                  <strong className="rule-discovered">+ DISCOVERED:</strong>{' '}
                  First, the leaderboard is sorted by the{' '}
                  <strong>number of concepts discovered</strong> in the
                  collection or across all collections if it's the global
                  leaderboard. The more discoveries the better.
                </li>
                <li>
                  <strong className="rule-complexity">+ COMPLEXITY:</strong>{' '}
                  Then, as tiebreak, the leaderboard is sorted by the{' '}
                  <strong>sum of complexities</strong> of the discovered
                  concepts. The lower the complexity, the better.
                </li>
              </ul>

              {/* Leaderboard Table */}
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>BOARD</th>
                    <th className="th-discovered">+ DISCOVERED</th>
                    <th className="th-complexity">+ COMPLEXITY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="rank-badge rank-1">1</div>
                    </td>
                    <td>speedrunner_99</td>
                    <td className="td-discovered">
                      <span className="complete-check">✓ 25</span>/25
                    </td>
                    <td className="td-complexity">345</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="rank-badge rank-2">2</div>
                    </td>
                    <td>concept_master</td>
                    <td className="td-discovered">17/25</td>
                    <td className="td-complexity">152</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="rank-badge rank-3">3</div>
                    </td>
                    <td>element_hunter</td>
                    <td className="td-discovered">17/25</td>
                    <td className="td-complexity">164</td>
                  </tr>
                  <tr className="separator-row">
                    <td colSpan="4">
                      <span className="dots">⋮</span>
                      <span className="separator-text">38 other boards</span>
                    </td>
                  </tr>
                  <tr className="user-row">
                    <td>#42</td>
                    <td>
                      fun_enjoyer <span className="you-badge">YOU</span>
                    </td>
                    <td className="td-discovered">8/25</td>
                    <td className="td-complexity">267</td>
                  </tr>
                </tbody>
              </table>

              <p className="section-text">
                Go get the lowest total complexity!
              </p>
            </section>

            {/* Multiplayer Section */}
            <section className="guide-section">
              <h2 className="section-title section-title-multiplayer">
                Multiplayer
              </h2>
              <p className="section-text">
                Play together in real-time! Invite friends to your board and
                discover concepts together!
              </p>

              {/* Multiplayer Visual */}
              <div className="multiplayer-box">
                <div className="mp-cursor cursor-steve">
                  <span className="cursor-arrow">▶</span>
                  <span className="cursor-name">Steve</span>
                </div>
                <div className="mp-element">
                  <span className="mp-emoji">💨</span>
                  <span className="mp-name">Steam</span>
                </div>
                <div className="mp-cursor cursor-alex">
                  <span className="cursor-arrow">▶</span>
                  <span className="cursor-name">Alex</span>
                </div>
              </div>

              <p className="section-text final-cta">
                Ready to play? Let's <strong>go find some concepts!</strong>
              </p>
            </section>
          </>
        )}

        {activeTab === 'faq' && (
          <div className="faq-content">
            <h2 className="faq-title">Concepts FAQ</h2>

            <p className="faq-intro">
              Find answers to the most common questions about Concepts.
              <br />
              Can't find what you're looking for or have feedback? Contact us at{' '}
              <a href="mailto:support@conceptsgame.io" className="faq-email">
                support@conceptsgame.io
              </a>
            </p>

            {/* General Questions */}
            <section className="faq-section">
              <h3 className="faq-section-title">General Questions</h3>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Is Concepts free to play?
                </summary>
                <div className="faq-answer">
                  <p>
                    <strong>Yes!</strong> Concepts is completely free to play
                    and we intend to keep it that way!
                  </p>
                  <p>
                    <strong>However</strong>, we do have some operational costs,
                    which means we have to resort to some kind of monetization
                    :(
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Do I need an account to play?
                </summary>
                <div className="faq-answer">
                  <p>
                    <strong>Yes.</strong> This is necessary to keep track of all
                    the statistics we all love and to prevent abuse.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Can I play on mobile?
                </summary>
                <div className="faq-answer">
                  <p>
                    Yes! Concepts works on all modern browsers and devices. You
                    can even install it as a Progressive Web App (PWA) on your
                    phone / desktop.
                  </p>
                  <p>
                    Also, you can cross-play in multiplayer with friends no
                    matter the device!
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Light or dark mode?
                </summary>
                <div className="faq-answer">
                  <p>
                    Concepts was mostly developed in <strong>dark mode</strong>,
                    so it's optimized to look its best there.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Where can I send feedback / suggestions or report bugs?
                </summary>
                <div className="faq-answer">
                  <p>
                    You can reach out to us at{' '}
                    <a
                      href="mailto:support@conceptsgame.io"
                      className="inline-email"
                    >
                      support@conceptsgame.io
                    </a>
                    !
                  </p>
                  <p>
                    Please include as much detail as you can and a good email
                    subject like:
                  </p>
                  <ul className="faq-list">
                    <li>
                      <code>[BUG] XYZ Menu not opening</code>
                    </li>
                    <li>
                      <code>[SUGGESTION] Add the "Fruits" collection</code>
                    </li>
                    <li>
                      <code>[FEEDBACK] The game is too fun!</code>
                    </li>
                    <li>
                      <code>etc</code>
                    </li>
                  </ul>
                </div>
              </details>
            </section>

            {/* Game Questions */}
            <section className="faq-section">
              <h3 className="faq-section-title">Game Questions</h3>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Can I combine more than two concepts at once?
                </summary>
                <div className="faq-answer">
                  <p>
                    <strong>Nope</strong>, you can only combine two concepts at
                    a time 😉 Nice try though!
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Why there isn't a public tree of concepts?
                </summary>
                <div className="faq-answer">
                  <p>
                    Leaderboards are all about discovering the most efficient
                    recipes for concepts, so we keep the best recipes private to
                    maintain the competitive spirit!
                  </p>
                  <p>
                    If someone finds an amazing recipe, they're welcome to share
                    it if they want to.
                  </p>
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">
                  <span className="faq-arrow">▼</span>
                  Why leaderboards are based on collections?
                </summary>
                <div className="faq-answer">
                  <p>
                    We believe that having a common goal to compete toward makes
                    the game more meaningful than simply accumulating concepts
                    and recipes.
                  </p>
                  <p>
                    Also, we don't want to incentivize players to pair concepts
                    just to see the number go up. This way, players are
                    encouraged to find the most efficient recipes for concepts
                    in collections.
                  </p>
                </div>
              </details>
            </section>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="tab-content">
            <h2>Privacy Policy</h2>
            <p>Privacy Policy content...</p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="tab-content">
            <h2>Terms and Conditions</h2>
            <p>Terms and Conditions content...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FullGuide
