import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardItem = { teamName: string; totalPoints: number; rank: number };

type LeaderboardResponse = { leaderboard?: LeaderboardItem[] };

export default function Leaderboard() {
  const [items, setItems] = useState<LeaderboardItem[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((response) => {
        const leaderboard = Array.isArray(response.leaderboard) ? response.leaderboard : [];
        if (active) setItems(leaderboard);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => { active = false; };
  }, []);

  let content;
  if (hasError) content = <p role="alert">Unable to load leaderboard.</p>;
  else if (items === null) content = <p role="status">Loading leaderboard...</p>;
  else if (items.length === 0) content = <p role="status">No rankings yet.</p>;
  else content = <ul className="list-unstyled mb-0">{items.map((team, index) => <li key={`${team.teamName}-${index}`}>#{team.rank} {team.teamName} | {team.totalPoints} points</li>)}</ul>;

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p>{content}</div></section>;
}
