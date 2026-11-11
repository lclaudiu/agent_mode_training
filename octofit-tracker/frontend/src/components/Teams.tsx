import { CapabilityCard } from './CapabilityCard.js';

type TeamItem = { name: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<TeamItem>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    resourceKey="teams"
    emptyText="No teams yet."
    renderItem={(team) => <>{team.name} | Members: {team.members.join(', ') || 'None'}</>}
  />;
}
