import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardItem = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardItem>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    resourceKey="leaderboard"
    emptyText="No rankings yet."
    renderItem={(team) => <>#{team.rank} {team.teamName} | {team.totalPoints} points</>}
  />;
}
