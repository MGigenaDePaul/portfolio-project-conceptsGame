import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardsApi } from '../api/leaderboards';
import { useUser } from '../context/UserContext';
import './Leaderboard.css';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <div className='rank-badge rank-gold'>1</div>;
  if (rank === 2) return <div className='rank-badge rank-silver'>2</div>;
  if (rank === 3) return <div className='rank-badge rank-bronze'>3</div>;
  return <span className='rank-number'>#{rank}</span>;
};

const Leaderboard = () => {
  const { user } = useUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    leaderboardsApi
      .getGlobal()
      .then(setRows)
      .catch((err) => setError(err.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className='lb-page'>
      <div className='lb-header'>
        <Link to='/' className='lb-back'>← Back to game</Link>
        <h1 className='lb-title'>Global Leaderboard</h1>
        <p className='lb-subtitle'>Ranked by most discoveries · tiebreak by lowest complexity</p>
      </div>

      <div className='lb-content'>
        {loading && (
          <div className='lb-loading'>
            <div className='lb-spinner' />
            <span>Loading leaderboard…</span>
          </div>
        )}

        {error && (
          <div className='lb-error'>⚠️ {error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className='lb-empty'>No boards yet. Be the first to play!</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <table className='lb-table'>
            <thead>
              <tr>
                <th className='col-rank'>RANK</th>
                <th className='col-board'>PLAYER</th>
                <th className='col-disc'>DISCOVERIES</th>
                <th className='col-cx'>COMPLEXITY</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isYou = user && row.user_id === user.id;
                return (
                  <tr key={row.board_id} className={isYou ? 'lb-row-you' : ''}>
                    <td className='col-rank'>
                      <RankBadge rank={row.rank} />
                    </td>
                    <td className='col-board'>
                      {row.username}
                      {isYou && <span className='you-badge'>YOU</span>}
                    </td>
                    <td className='col-disc'>
                      <span className='disc-value'>{row.discoveries}</span>
                    </td>
                    <td className='col-cx'>{row.total_complexity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
