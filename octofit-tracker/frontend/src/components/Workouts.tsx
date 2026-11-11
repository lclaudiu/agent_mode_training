import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    resourceKey="suggestions"
    emptyText="No workout suggestions yet."
    renderItem={(workout) => <>{workout.title}{workout.focus ? ` | ${workout.focus}` : ''}{workout.reason ? ` | ${workout.reason}` : ''}</>}
  />;
}
