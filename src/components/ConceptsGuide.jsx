import './ConceptsGuide.css';
import { Link } from 'react-router-dom';

const ConceptsGuide = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className='concepts-guide-overlay' onClick={onClose}>
      <div
        className='concepts-guide-modal'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='concepts-guide-header'>
          <h2>Concepts Guide</h2>
          <button className='close-button' onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className='concepts-guide-content'>
          {/* Intro */}
          <p className='intro-text'>
            Welcome to Concepts! You can also open{' '}
            <Link to='/guide' target='_blank' className='guide-link'>
              this guide in a new tab ↗
            </Link>
            .
          </p>

          {/* Index */}
          <section className='guide-section'>
            <h3>Index</h3>
            <div className='index-list'>
              <button
                onClick={() =>
                  document
                    .getElementById('the-game')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='index-item index-game'
              >
                The Game
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('complexity')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='index-item index-complexity'
              >
                Complexity
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('collections')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='index-item index-collections'
              >
                Collections
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('leaderboards')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='index-item index-leaderboards'
              >
                Leaderboards
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('multiplayer')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='index-item index-multiplayer'
              >
                Multiplayer
              </button>
            </div>
          </section>

          {/* The Game */}
          <section id='the-game' className='guide-section'>
            <h3 className='section-title'>The game</h3>
            <p>
              <strong>Concepts</strong> is a game about combining pairs of
              concepts to create new, derived concepts.
            </p>
            <p>
              Once you create a new board, you start with the four{' '}
              <span className='highlight-text'>classical elements</span>:
            </p>

            <div className='elements-row'>
              <div className='element-badge'>
                <span className='element-emoji'>🌍</span>
                <span className='element-name'>Earth</span>
              </div>
              <div className='element-badge'>
                <span className='element-emoji'>🌬️</span>
                <span className='element-name'>Air</span>
              </div>
              <div className='element-badge'>
                <span className='element-emoji'>🔥</span>
                <span className='element-name'>Fire</span>
              </div>
              <div className='element-badge'>
                <span className='element-emoji'>💧</span>
                <span className='element-name'>Water</span>
              </div>
            </div>

            <p>
              Starting from here, you can combine concepts to build anything you
              can imagine!
            </p>

            <p>
              Concepts extends the game <em>Infinity Craft</em> by Neal,
              introducing many new features: account syncing, multiplayer,
              collections, stats, leaderboards, concept complexity, and more!
              Keep reading to learn more or{' '}
              <a href='#' className='go-play-link'>
                go play now
              </a>
              !
            </p>
          </section>

          {/* Complexity */}
          <section id='complexity' className='guide-section'>
            <h3 className='section-title'>Complexity</h3>
            <p>
              The complexity is a number that indicates how many combinations
              are needed to reach a concept.
            </p>
            <p>
              The initial classical elements have a complexity of 1:{' '}
              <span className='complexity-badge'>
                <span className='element-emoji'>🌍</span> Earth{' '}
                <span className='complexity-number'>1</span>
              </span>
            </p>
            <p>
              To compute the complexity of a new concept, you must take the{' '}
              <strong>
                <u>maximum complexity of the two ingredients plus 1</u>
              </strong>
              , for example:
            </p>

            <div className='complexity-example'>
              <div className='complexity-diagram'>
                <div className='concept-node'>
                  <span className='element-emoji'>🌊</span> Sea{' '}
                  <span className='complexity-number green'>6</span>
                </div>
                <div className='arrow-down'>↓</div>
                <div className='concept-node result'>
                  <span className='element-emoji'>🏖️</span> Beach{' '}
                  <span className='complexity-number yellow'>15</span>
                </div>
                <div className='arrow-up'>↑</div>
                <div className='concept-node'>
                  <span className='element-emoji'>☀️</span> Sun{' '}
                  <span className='complexity-number yellow'>14</span>
                </div>
              </div>
            </div>

            <p>
              This way, each board has its own tree of concepts where each can
              have different complexities. This leads to interesting
              competitions, where you may be the only one holding the lowest
              complexity!
            </p>

            <h4 className='subsection-title'>✨ Cascade effect improvements</h4>
            <p>
              When you discover a better recipe (with lower complexity) for a
              concept, every recipe that depends on that concept will{' '}
              <strong>automatically recalculate</strong> and potentially
              improve!
            </p>
            <p>
              For example, assuming you already discovered the recipe from above
              (<em>Sea + Sun = Beach</em>), if you now discover a better recipe
              for Sun:
            </p>

            <div className='improvement-example'>
              <div className='concept-node'>
                <span className='element-emoji'>☀️</span> Sun{' '}
                <span className='complexity-number yellow'>14</span>
              </div>
              <span className='arrow-right'>→</span>
              <div className='concept-node'>
                <span className='element-emoji'>☀️</span> Sun{' '}
                <span className='complexity-number green'>8</span>
              </div>
            </div>

            <p>
              then the complexity of Beach will improve as well, since you know
              that <em>Sea + Sun = Beach</em>:
            </p>

            <div className='improvement-example'>
              <div className='concept-node'>
                <span className='element-emoji'>🏖️</span> Beach{' '}
                <span className='complexity-number yellow'>15</span>
              </div>
              <span className='arrow-right'>→</span>
              <div className='concept-node'>
                <span className='element-emoji'>🏖️</span> Beach{' '}
                <span className='complexity-number green'>9</span>
              </div>
            </div>

            <p>
              This creates a{' '}
              <span className='cascade-effect'>cascade effect</span> where a
              single discovery can improve dozens or even hundreds of concepts
              at once, making trying to discover novel recipes a fun challenge!
            </p>
          </section>

          {/* Collections */}
          <section id='collections' className='guide-section'>
            <h3 className='section-title'>Collections</h3>
            <p>
              Collections are themed groups of concepts organized into three
              tiers of increasing difficulty.
            </p>
            <p>
              Examples include Colors, Fruits, Famous Scientists, and many,{' '}
              <strong>many</strong> more.
            </p>

            <div className='collection-card'>
              <div className='collection-header'>
                <span className='collection-icon'>🍎</span>
                <span className='collection-name'>Fruits (example)</span>
              </div>

              <div className='collection-tier'>
                <div className='tier-header'>
                  <span className='tier-label easy'>EASY</span>
                  <span className='tier-progress'>✓ 4</span>
                </div>
                <div className='tier-progress-bar'>
                  <div
                    className='tier-progress-fill easy'
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              <div className='collection-tier'>
                <div className='tier-header'>
                  <span className='tier-label medium'>MEDIUM</span>
                  <span className='tier-progress'>3 of 5</span>
                </div>
                <div className='tier-progress-bar'>
                  <div
                    className='tier-progress-fill medium'
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>

              <div className='collection-tier'>
                <div className='tier-header'>
                  <span className='tier-label hard'>HARD</span>
                  <span className='tier-progress'>1 of 3</span>
                </div>
                <div className='tier-progress-bar'>
                  <div
                    className='tier-progress-fill hard'
                    style={{ width: '33%' }}
                  ></div>
                </div>
              </div>

              <div className='collection-concepts'>
                <h4 className='tier-label easy'>EASY</h4>
                <div className='concepts-grid'>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍎</span> Apple{' '}
                    <span className='complexity-number green'>6</span>
                  </div>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍊</span> Orange{' '}
                    <span className='complexity-number green'>9</span>
                  </div>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍐</span> Pear{' '}
                    <span className='complexity-number green'>9</span>
                  </div>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍌</span> Banana{' '}
                    <span className='complexity-number yellow'>23</span>
                  </div>
                </div>

                <h4 className='tier-label medium'>
                  MEDIUM <span className='remaining-text'>2 remaining</span>
                </h4>
                <div className='concepts-grid'>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🥭</span> Mango{' '}
                    <span className='complexity-number green'>11</span>
                  </div>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍍</span> Pineapple{' '}
                    <span className='complexity-number yellow'>18</span>
                  </div>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>🍉</span> Watermelon{' '}
                    <span className='complexity-number yellow'>21</span>
                  </div>
                  <div className='collection-concept undiscovered'>Coconut</div>
                  <div className='collection-concept undiscovered'>Kiwi</div>
                </div>

                <h4 className='tier-label hard'>
                  HARD <span className='remaining-text'>2 remaining</span>
                </h4>
                <div className='concepts-grid'>
                  <div className='collection-concept discovered'>
                    <span className='element-emoji'>⭐</span> Starfruit{' '}
                    <span className='complexity-number green'>12</span>
                  </div>
                  <div className='collection-concept undiscovered'>Guava</div>
                  <div className='collection-concept undiscovered'>
                    Pomegranate
                  </div>
                </div>
              </div>
            </div>

            <p>
              Track your progress as you discover each concept, and challenge
              yourself to achieve the lowest total complexity for a collection.
              Each difficulty has its own set of concepts to find, can you
              complete them all?
            </p>
          </section>

          {/* Leaderboards */}
          <section id='leaderboards' className='guide-section'>
            <h3 className='section-title'>Leaderboards</h3>
            <p>
              Every collection has a leaderboard where boards are ranked based
              on the concepts they have discovered. There is{' '}
              <strong>a leaderboard for each collection</strong>, and a{' '}
              <strong>global leaderboard</strong> where boards are ranked across
              all collections.
            </p>
            <p>Leaderboards are sorted like this:</p>
            <ul>
              <li>
                <strong className='discovered-label'>+ DISCOVERED:</strong>{' '}
                First, the leaderboard is sorted by the{' '}
                <strong>number of concepts discovered</strong> in the collection
                or across all collections if it's the global leaderboard. The
                more discoveries the better.
              </li>
              <li>
                <strong className='complexity-label'>+ COMPLEXITY:</strong>{' '}
                Then, as tiebreak, the leaderboard is sorted by the{' '}
                <strong>sum of complexities</strong> of the discovered concepts.
                The lower the complexity, the better.
              </li>
            </ul>

            <table className='leaderboard-table'>
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>BOARD</th>
                  <th className='discovered-column'>+ DISCOVERED</th>
                  <th className='complexity-column'>+ COMPLEXITY</th>
                </tr>
              </thead>
              <tbody>
                <tr className='rank-1'>
                  <td>
                    <div className='rank-badge gold'>1</div>
                  </td>
                  <td>speedrunner_99</td>
                  <td className='discovered-column'>
                    <span className='discovered-value'>✓ 25</span>
                    <span className='total-value'>/25</span>
                  </td>
                  <td className='complexity-column'>345</td>
                </tr>
                <tr className='rank-2'>
                  <td>
                    <div className='rank-badge silver'>2</div>
                  </td>
                  <td>concept_master</td>
                  <td className='discovered-column'>
                    <span className='discovered-value'>17</span>
                    <span className='total-value'>/25</span>
                  </td>
                  <td className='complexity-column'>152</td>
                </tr>
                <tr className='rank-3'>
                  <td>
                    <div className='rank-badge bronze'>3</div>
                  </td>
                  <td>element_hunter</td>
                  <td className='discovered-column'>
                    <span className='discovered-value'>17</span>
                    <span className='total-value'>/25</span>
                  </td>
                  <td className='complexity-column'>164</td>
                </tr>
                <tr className='rank-other'>
                  <td colSpan='4' className='other-boards'>
                    <span className='dots'>⋮</span>
                    <span>38 other boards</span>
                  </td>
                </tr>
                <tr className='rank-you'>
                  <td>#42</td>
                  <td>
                    fun_enjoyer <span className='you-badge'>YOU</span>
                  </td>
                  <td className='discovered-column'>
                    <span className='discovered-value'>8</span>
                    <span className='total-value'>/25</span>
                  </td>
                  <td className='complexity-column'>267</td>
                </tr>
              </tbody>
            </table>

            <p>Go get the lowest total complexity!</p>
          </section>

          {/* Multiplayer */}
          <section id='multiplayer' className='guide-section'>
            <h3 className='section-title'>Multiplayer</h3>
            <p>
              Play together in real-time! Invite friends to your board and
              discover concepts together!
            </p>

            <div className='multiplayer-demo'>
              <div className='multiplayer-cursor cursor-steve'>
                <span className='cursor-icon'>▶</span>
                <span className='cursor-name'>Steve</span>
              </div>
              <div className='multiplayer-concept'>
                <span className='element-emoji'>💨</span> Steam
              </div>
              <div className='multiplayer-cursor cursor-alex'>
                <span className='cursor-icon'>▶</span>
                <span className='cursor-name'>Alex</span>
              </div>
            </div>

            <p className='final-message'>
              Ready to play? Let's <strong>go find some concepts!</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConceptsGuide;
