import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };

type WorkoutResponse = { suggestions?: WorkoutSuggestion[] };

export default function Workouts() {
  const [items, setItems] = useState<WorkoutSuggestion[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    getJson<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then((response) => {
        const suggestions = Array.isArray(response.suggestions) ? response.suggestions : [];
        if (active) setItems(suggestions);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => { active = false; };
  }, []);

  let content;
  if (hasError) content = <p role="alert">Unable to load workout suggestions.</p>;
  else if (items === null) content = <p role="status">Loading workout suggestions...</p>;
  else if (items.length === 0) content = <p role="status">No workout suggestions yet.</p>;
  else content = <ul className="list-unstyled mb-0">{items.map((workout, index) => <li key={`${workout.title}-${index}`}>{workout.title}{workout.focus ? ` | ${workout.focus}` : ''}{workout.reason ? ` | ${workout.reason}` : ''}</li>)}</ul>;

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p>{content}</div></section>;
}
