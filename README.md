# Plurr (FestivalApp)

Expo + React Native + TypeScript prototype of Plurr: festival photo challenges with friends.
All data is mocked in local state (no backend, auth or photo storage yet).

## Run
```
npm install
npm start        # then press i / a / w
npm run typecheck
npm test         # domain rule tests
```

## Structure
- `src/domain/types.ts` – entities and lifecycle enums (Game: DRAFT/LOBBY/ACTIVE/FINISHED; Challenge: AVAILABLE/ACTIVE/SUBMITTED/APPROVED/REJECTED/CANCELLED; verification NONE/VOTE, AI/HYBRID reserved)
- `src/domain/rules.ts` – transitions and blueprint rules (live capture only, one active game per user, retry/vote/cancel after rejection)
- `src/state/store.tsx` – reducer + context; `src/services/` – placeholders to swap for Supabase and expo-camera
- `src/screens/` – Login, Onboarding, Home, Game setup, Lobby, Challenges, Detail, Camera, Verification, Leaderboard, Profile, My photos
