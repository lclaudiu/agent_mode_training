# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Use these decisions to keep implementation changes within the tier boundaries.

- Presentation tier decision: Keep one page component per existing route and use the shared API client for all requests. Pages own loading, empty, success, and error presentation (including accessible status/alert roles); they do not contain persistence or business rules.
- Logic tier decision: Keep Express handlers thin and implement validation and capability behavior in `octofitService.ts`. Return deliberate 4xx responses for invalid input, malformed or unknown references, and unknown users; do not expose Mongoose cast errors as 500 responses.
- Data tier decision: Use Mongoose schemas to require each model's contract fields and represent user/team relationships with references. Keep seed data representative and idempotent; do not add authentication or move data access into the frontend.
- Activity tracking approach: Validate the activity type, positive minutes, and well-formed IDs that refer to existing users and teams before creating a record. Persist those references and inputs with computed points and an occurrence timestamp; list activities from the data tier.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, validate member references, and persist the team with its members. Listing teams should return their saved member data.
- Leaderboard approach: Sum activity points by team, order totals descending, and return each team's name, total, and 1-based rank. Include teams without activity with a zero total so every team can be ranked consistently.
- Workout suggestions approach: Resolve the user by email, use their fitness goal and recent activity to choose relevant saved workouts, and return a reason for the first suggestion. Return a deliberate 4xx when no user matches.

## Test plan

Run the narrowest contract suite for the tier being changed, then run all suites and builds before considering the implementation complete. Keep contract tests unchanged.

- Data tier: `npm run test:data --prefix octofit-tracker/backend` checks required fields, references, and seed idempotency. Failures point to schema or seed behavior.
- API logic: `npm run test:api --prefix octofit-tracker/backend` checks request validation, create/list behavior, computed activity data, leaderboard totals/ranks, and user-specific workout suggestions. Failures point to service behavior or HTTP error mapping.
- Presentation: `npm test --prefix octofit-tracker/frontend` checks API-backed rendering, the user-specific workout request, and accessible loading, empty, and error states. Failures point to route/page behavior or API-client integration.
- Backend build: `npm run build --prefix octofit-tracker/backend` checks TypeScript types and backend compilation.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` checks TypeScript types and the Vite production bundle.

Current starter baseline: the backend suite has 8 failing contract tests and 1 passing seed-idempotency test; the frontend suite has 15 failing presentation contract tests. These are expected gaps in the starter, not a passing implementation; rerun the affected suite after each tier is implemented.
