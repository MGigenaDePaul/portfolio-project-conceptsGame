import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './FullGuide.css'

const FullGuide = () => {
  const location = useLocation()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  // Determine active tab based on current route
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
                Try combining the two concepts below:
              </p>

              {/* Interactive Demo Box */}
              <div className="demo-box">
                <button className="reset-button">🔄 Reset</button>
                <div className="demo-area">
                  <div className="demo-warning">
                    CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT. DISCOVERED
                    CONCEPTS WILL BE LOST
                  </div>
                  <div className="demo-concepts">
                    <div className="demo-bubble demo-bubble-earth">
                      <span className="bubble-emoji">🌍</span>
                      <span className="bubble-name">Earth</span>
                    </div>
                    <div className="demo-bubble demo-bubble-mud">
                      <span className="bubble-emoji">🟤</span>
                      <span className="bubble-name">Mud</span>
                    </div>
                  </div>
                </div>
              </div>

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
                  <span className="badge-number">1</span>
                </span>
              </p>

              <p className="section-text">
                To compute the complexity of a new concept, you must take the{' '}
                <span className="underline-text">
                  maximum complexity of the two ingredients plus 1
                </span>
                , for example:
              </p>

              {/* Complexity Diagram */}
              <div className="complexity-diagram">
                <div className="diagram-visual">
                  <div className="diagram-left">
                    <div className="complexity-badge-large cb-sea">
                      <span className="cb-emoji">🌊</span>
                      <span className="cb-name">Sea</span>
                      <span className="cb-number">6</span>
                    </div>
                    <div className="diagram-line"></div>
                  </div>
                  <div className="diagram-right">
                    <div className="complexity-badge-large cb-beach">
                      <span className="cb-emoji">🏖️</span>
                      <span className="cb-name">Beach</span>
                      <span className="cb-number">15</span>
                    </div>
                  </div>
                  <div className="diagram-bottom">
                    <div className="complexity-badge-large cb-sun">
                      <span className="cb-emoji">☀️</span>
                      <span className="cb-name">Sun</span>
                      <span className="cb-number">14</span>
                    </div>
                    <div className="diagram-line-bottom"></div>
                  </div>
                </div>
              </div>

              <p className="section-text">
                This way, each board has its own tree of concepts where each
                can have different complexities. This leads to interesting
                competitions, where you may be the only one holding the lowest
                complexity!
              </p>

              {/* Cascade Effect */}
              <div className="cascade-section">
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

                <div className="cascade-example">
                  <div className="cascade-change">
                    <div className="complexity-badge-medium cbm-sun-old">
                      <span className="cbm-emoji">☀️</span>
                      <span className="cbm-name">Sun</span>
                      <span className="cbm-number">14</span>
                    </div>
                    <span className="arrow-symbol">→</span>
                    <div className="complexity-badge-medium cbm-sun-new">
                      <span className="cbm-emoji">☀️</span>
                      <span className="cbm-name">Sun</span>
                      <span className="cbm-number">8</span>
                    </div>
                  </div>
                </div>

                <p className="section-text">
                  then the complexity of Beach will improve as well, since you
                  know that <em>Sea + Sun = Beach</em>:
                </p>

                <div className="cascade-example">
                  <div className="cascade-change">
                    <div className="complexity-badge-medium cbm-beach-old">
                      <span className="cbm-emoji">🏖️</span>
                      <span className="cbm-name">Beach</span>
                      <span className="cbm-number">15</span>
                    </div>
                    <span className="arrow-symbol">→</span>
                    <div className="complexity-badge-medium cbm-beach-new">
                      <span className="cbm-emoji">🏖️</span>
                      <span className="cbm-name">Beach</span>
                      <span className="cbm-number">9</span>
                    </div>
                  </div>
                </div>

                <p className="section-text cascade-highlight">
                  This creates a <span className="purple-text">cascade effect</span> where
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
                tiers of increasing difficulty. Examples include Colors, Fruits,
                Famous Scientists, and many, <strong>many</strong> more.
              </p>

              {/* Collection Example */}
              <div className="collection-example">
                <div className="collection-header">
                  <span className="collection-icon">🍎</span>
                  <h3 className="collection-title">Fruits (example)</h3>
                </div>

                {/* Progress Bars */}
                <div className="collection-progress">
                  <div className="progress-bar pb-easy">
                    <div className="progress-label">
                      <span className="progress-tier">EASY</span>
                      <span className="progress-count progress-done">✓ 4</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill pf-easy"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="progress-bar pb-medium">
                    <div className="progress-label">
                      <span className="progress-tier">MEDIUM</span>
                      <span className="progress-count">3 of 5</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill pf-medium"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="progress-bar pb-hard">
                    <div className="progress-label">
                      <span className="progress-tier">HARD</span>
                      <span className="progress-count">1 of 3</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill pf-hard"
                        style={{ width: '33%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Concept Lists */}
                <div className="concepts-list">
                  <div className="tier-group">
                    <div className="tier-label tier-easy">EASY</div>
                    <div className="concept-pills">
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍎 Apple</span>
                        <span className="cp-complexity">6</span>
                      </div>
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍊 Orange</span>
                        <span className="cp-complexity">9</span>
                      </div>
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍐 Pear</span>
                        <span className="cp-complexity">9</span>
                      </div>
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍌 Banana</span>
                        <span className="cp-complexity">23</span>
                      </div>
                    </div>
                  </div>

                  <div className="tier-group">
                    <div className="tier-label tier-medium">
                      MEDIUM <span className="remaining">2 remaining</span>
                    </div>
                    <div className="concept-pills">
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🥭 Mango</span>
                        <span className="cp-complexity">11</span>
                      </div>
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍍 Pineapple</span>
                        <span className="cp-complexity">18</span>
                      </div>
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">🍉 Watermelon</span>
                        <span className="cp-complexity">21</span>
                      </div>
                      <div className="concept-pill cp-locked">Coconut</div>
                      <div className="concept-pill cp-locked">Kiwi</div>
                    </div>
                  </div>

                  <div className="tier-group">
                    <div className="tier-label tier-hard">
                      HARD <span className="remaining">2 remaining</span>
                    </div>
                    <div className="concept-pills">
                      <div className="concept-pill cp-discovered">
                        <span className="cp-content">⭐ Starfruit</span>
                        <span className="cp-complexity">12</span>
                      </div>
                      <div className="concept-pill cp-locked">Guava</div>
                      <div className="concept-pill cp-locked">Pomegranate</div>
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
                <strong>a leaderboard for each collection</strong>, and{' '}
                <strong>a global leaderboard</strong> where boards are ranked
                across all collections.
              </p>
              <p className="section-text">Leaderboards are sorted like this:</p>

              <div className="leaderboard-rules">
                <div className="rule-item">
                  <span className="rule-icon discovered-icon">
                    ✦ DISCOVERED:
                  </span>
                  <span className="rule-text">
                    First, the leaderboard is sorted by the{' '}
                    <strong>number of concepts discovered</strong> in the
                    collection or across all collections if it's the global
                    leaderboard. The more discoveries the better.
                  </span>
                </div>
                <div className="rule-item">
                  <span className="rule-icon complexity-icon">
                    ✦ COMPLEXITY:
                  </span>
                  <span className="rule-text">
                    Then, as tiebreak, the leaderboard is sorted by the{' '}
                    <strong>sum of complexities</strong> of the discovered
                    concepts. The lower the complexity, the better.
                  </span>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="leaderboard-table">
                <div className="leaderboard-header">
                  <div className="lb-col lb-rank">RANK</div>
                  <div className="lb-col lb-board">BOARD</div>
                  <div className="lb-col lb-discovered">✦ DISCOVERED</div>
                  <div className="lb-col lb-complexity">✦ COMPLEXITY</div>
                </div>

                <div className="leaderboard-rows">
                  <div className="lb-row lb-row-1">
                    <div className="lb-col lb-rank">
                      <div className="rank-badge rank-1">1</div>
                    </div>
                    <div className="lb-col lb-board">speedrunner_99</div>
                    <div className="lb-col lb-discovered">
                      <span className="lb-green">✓ 25</span>/25
                    </div>
                    <div className="lb-col lb-complexity lb-purple">345</div>
                  </div>

                  <div className="lb-row lb-row-2">
                    <div className="lb-col lb-rank">
                      <div className="rank-badge rank-2">2</div>
                    </div>
                    <div className="lb-col lb-board">concept_master</div>
                    <div className="lb-col lb-discovered">17/25</div>
                    <div className="lb-col lb-complexity lb-purple">152</div>
                  </div>

                  <div className="lb-row lb-row-3">
                    <div className="lb-col lb-rank">
                      <div className="rank-badge rank-3">3</div>
                    </div>
                    <div className="lb-col lb-board">element_hunter</div>
                    <div className="lb-col lb-discovered">17/25</div>
                    <div className="lb-col lb-complexity lb-purple">164</div>
                  </div>

                  <div className="lb-row lb-separator">
                    <div className="lb-col lb-full-width">
                      ⋮ <span className="separator-text">38 other boards</span>
                    </div>
                  </div>

                  <div className="lb-row lb-row-user">
                    <div className="lb-col lb-rank">
                      <div className="rank-number">#42</div>
                    </div>
                    <div className="lb-col lb-board">
                      fun_enjoyer <span className="you-badge">YOU</span>
                    </div>
                    <div className="lb-col lb-discovered">8/25</div>
                    <div className="lb-col lb-complexity lb-purple">267</div>
                  </div>
                </div>
              </div>

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

              {/* Multiplayer Demo */}
              <div className="multiplayer-demo">
                <div className="mp-bubble mp-bubble-1">
                  <span className="mp-cursor">▲</span>
                  <span className="mp-name mp-name-steve">Steve</span>
                </div>
                <div className="mp-bubble mp-bubble-2">
                  <span className="mp-emoji">💧</span>
                  <span className="mp-text">Water</span>
                </div>
                <div className="mp-bubble mp-bubble-3">
                  <span className="mp-emoji">🔥</span>
                  <span className="mp-text">Fire</span>
                </div>
                <div className="mp-bubble mp-bubble-4">
                  <span className="mp-cursor">▲</span>
                  <span className="mp-name mp-name-alex">Alex</span>
                </div>
              </div>

              <button
                className="technical-details-toggle"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                ▶ Show technical details & facts
              </button>

              {showTechnicalDetails && (
                <div className="technical-details">
                  <p>Technical implementation details would go here...</p>
                </div>
              )}
            </section>

            {/* Ready to Play */}
            <div className="ready-to-play">
              <p className="ready-text">Ready to play?</p>
              <Link to="/" className="lets-go-button">
                Let's go →
              </Link>
            </div>
          </>
        )}

        {activeTab === 'faq' && (
          <div className="tab-content">
            <h2>FAQ</h2>
            <p>Frequently Asked Questions content...</p>
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