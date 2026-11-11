import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !mongoose.isValidObjectId(userId) ||
    typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id'),
    Team.findById(teamId).select('_id'),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 400 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Team name and mascot are required'), { status: 400 });
  }

  const memberIds = members === undefined ? [] : members;
  if (!Array.isArray(memberIds) || memberIds.some((memberId) => typeof memberId !== 'string' || !mongoose.isValidObjectId(memberId))) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  const uniqueMemberIds = [...new Set(memberIds as string[])];
  const existingMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id');
  if (existingMembers.length !== uniqueMemberIds.length) {
    throw Object.assign(new Error('Team members must exist'), { status: 400 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map<string, number>();
  for (const total of totals) pointsByTeam.set(total._id.toString(), total.totalPoints);

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).select('_id fitnessGoal').lean();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.trim().toLowerCase();
  let suggestions = workouts.filter((workout) => workout.focus.trim().toLowerCase() === goal);
  let reason = `Recommended for your ${user.fitnessGoal} goal.`;

  if (suggestions.length === 0 && recentActivity) {
    const activityType = recentActivity.type.trim().toLowerCase();
    const activityFocus = ['run', 'cycle', 'walk'].includes(activityType) ? 'endurance' : activityType;
    suggestions = workouts.filter((workout) => workout.focus.trim().toLowerCase() === activityFocus);
    reason = `Recommended based on your recent ${recentActivity.type} activity.`;
  }

  return suggestions.map((workout) => ({ ...workout, reason }));
}

export { User };
