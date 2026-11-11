import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ActivityItem = { type: string; minutes: number; points: number };

type ActivityResponse = { activities?: ActivityItem[] };

export default function Activities() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    getJson<ActivityResponse>('/api/activities')
      .then((response) => {
        const activities = Array.isArray(response.activities) ? response.activities : [];
        if (active) setItems(activities);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => { active = false; };
  }, []);

  let content;
  if (hasError) content = <p role="alert">Unable to load activities.</p>;
  else if (items === null) content = <p role="status">Loading activities...</p>;
  else if (items.length === 0) content = <p role="status">No activities yet.</p>;
  else content = <ul className="list-unstyled mb-0">{items.map((activity, index) => <li key={`${activity.type}-${index}`}>{activity.type} | {activity.minutes} min | {activity.points} points</li>)}</ul>;

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p>{content}</div></section>;
}
