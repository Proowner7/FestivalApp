import type { ChallengeStatus, GameStatus, VerificationMode } from './types';

export const ONLY_LIVE_CAPTURE_RULE =
  'Only live photos taken in the app count as proof. Gallery uploads are not allowed.';

export const SUPPORTED_VERIFICATION_MODES: VerificationMode[] = ['NONE', 'VOTE'];

export const GAME_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  DRAFT: ['LOBBY'],
  LOBBY: ['ACTIVE'],
  ACTIVE: ['FINISHED'],
  FINISHED: [],
};

export const CHALLENGE_TRANSITIONS: Record<ChallengeStatus, ChallengeStatus[]> = {
  AVAILABLE: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  // After rejection: retry (ACTIVE), vote (SUBMITTED again) or cancel.
  REJECTED: ['ACTIVE', 'SUBMITTED', 'CANCELLED'],
  APPROVED: [],
  CANCELLED: [],
};

export function canTransitionGame(from: GameStatus, to: GameStatus): boolean {
  return GAME_TRANSITIONS[from].includes(to);
}

export function canTransitionChallenge(from: ChallengeStatus, to: ChallengeStatus): boolean {
  return CHALLENGE_TRANSITIONS[from].includes(to);
}

export function isModeSupported(mode: VerificationMode): boolean {
  return SUPPORTED_VERIFICATION_MODES.includes(mode);
}

/** Status a submission gets right after capture, depending on the verification mode. */
export function statusAfterSubmit(mode: VerificationMode): ChallengeStatus {
  return mode === 'NONE' ? 'APPROVED' : 'SUBMITTED';
}
