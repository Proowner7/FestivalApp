export type GameStatus = 'DRAFT' | 'LOBBY' | 'ACTIVE' | 'FINISHED';

export type ChallengeStatus =
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

// NONE and VOTE are implemented in the prototype; AI and HYBRID are reserved.
export type VerificationMode = 'NONE' | 'VOTE' | 'AI' | 'HYBRID';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  onboarded: boolean;
}

export interface Participant {
  userId: string;
  displayName: string;
  ready: boolean;
}

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  verificationMode: VerificationMode;
  hostId: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  status: ChallengeStatus;
}

/** Proof is always a live capture; gallery uploads are not representable. */
export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  source: 'LIVE_CAPTURE';
  photoUri: string; // mock placeholder until real storage exists
  capturedAt: string;
  votesApprove: number;
  votesReject: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  points: number;
}

export interface AppState {
  user: UserProfile | null;
  game: Game | null; // one active game per user
  participants: Participant[];
  challenges: Challenge[];
  submissions: Submission[];
  leaderboard: LeaderboardEntry[];
}
