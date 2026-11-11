import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type TeamItem = { name: string; members: string[] };

type TeamResponse = { teams?: TeamItem[] };

export default function Teams() {
  const [items, setItems] = useState<TeamItem[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    getJson<TeamResponse>('/api/teams')
      .then((response) => {
        const teams = Array.isArray(response.teams) ? response.teams : [];
        if (active) setItems(teams);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => { active = false; };
  }, []);

  let content;
  if (hasError) content = <p role="alert">Unable to load teams.</p>;
  else if (items === null) content = <p role="status">Loading teams...</p>;
  else if (items.length === 0) content = <p role="status">No teams yet.</p>;
  else content = <ul className="list-unstyled mb-0">{items.map((team, index) => <li key={`${team.name}-${index}`}>{team.name} | Members: {team.members.join(', ') || 'None'}</li>)}</ul>;

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p>{content}</div></section>;
}
