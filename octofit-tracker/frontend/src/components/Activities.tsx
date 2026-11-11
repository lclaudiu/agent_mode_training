import { CapabilityCard } from './CapabilityCard.js';

type ActivityItem = { type: string; minutes: number; points: number };

export default function Activities() {
  return <CapabilityCard<ActivityItem>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    resourceKey="activities"
    emptyText="No activities yet."
    renderItem={(activity) => <>{activity.type} | {activity.minutes} min | {activity.points} points</>}
  />;
}
