import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, Challenge, ChallengeStatus, VerificationMode } from '../domain/types';
import { canTransitionChallenge, canTransitionGame, isModeSupported, statusAfterSubmit } from '../domain/rules';
import { initialState } from '../services/gameService';

export type Action =
  | { type: 'LOGIN'; displayName: string; email: string }
  | { type: 'FINISH_ONBOARDING' }
  | { type: 'CREATE_GAME'; name: string; verificationMode: VerificationMode }
  | { type: 'START_GAME' }
  | { type: 'FINISH_GAME' }
  | { type: 'ACCEPT_CHALLENGE'; challengeId: string }
  | { type: 'CANCEL_CHALLENGE'; challengeId: string }
  | { type: 'SUBMIT_PHOTO'; challengeId: string; photoUri: string; capturedAt: string }
  | { type: 'VOTE'; challengeId: string; approve: boolean }
  | { type: 'RETRY_CHALLENGE'; challengeId: string }
  | { type: 'REVOTE_CHALLENGE'; challengeId: string };

const VOTES_NEEDED = 2;

function setStatus(state: AppState, id: string, to: ChallengeStatus): Challenge[] {
  return state.challenges.map((c) =>
    c.id === id && canTransitionChallenge(c.status, to) ? { ...c, status: to } : c,
  );
}

function award(state: AppState, challengeId: string): AppState['leaderboard'] {
  const ch = state.challenges.find((c) => c.id === challengeId);
  if (!ch || !state.user) return state.leaderboard;
  return state.leaderboard
    .map((e) => (e.userId === state.user!.id ? { ...e, points: e.points + ch.points } : e))
    .sort((a, b) => b.points - a.points);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: { id: 'me', displayName: action.displayName, email: action.email, onboarded: false } };
    case 'FINISH_ONBOARDING':
      return state.user ? { ...state, user: { ...state.user, onboarded: true } } : state;
    case 'CREATE_GAME': {
      // One active game per user: refuse while a non-finished game exists.
      if (!state.user || (state.game && state.game.status !== 'FINISHED')) return state;
      if (!isModeSupported(action.verificationMode)) return state;
      const me = { userId: state.user.id, displayName: state.user.displayName, ready: true };
      const bots = [
        { userId: 'u2', displayName: 'Mika', ready: true },
        { userId: 'u3', displayName: 'Jo', ready: false },
      ];
      const participants = [me, ...bots];
      return {
        ...state,
        game: { id: 'g1', name: action.name, status: 'LOBBY', verificationMode: action.verificationMode, hostId: state.user.id },
        participants,
        challenges: initialState.challenges,
        submissions: [],
        leaderboard: participants.map((p) => ({ userId: p.userId, displayName: p.displayName, points: 0 })),
      };
    }
    case 'START_GAME':
      return state.game && canTransitionGame(state.game.status, 'ACTIVE')
        ? { ...state, game: { ...state.game, status: 'ACTIVE' } }
        : state;
    case 'FINISH_GAME':
      return state.game && canTransitionGame(state.game.status, 'FINISHED')
        ? { ...state, game: { ...state.game, status: 'FINISHED' } }
        : state;
    case 'ACCEPT_CHALLENGE':
    case 'RETRY_CHALLENGE':
      if (state.game?.status !== 'ACTIVE') return state;
      return { ...state, challenges: setStatus(state, action.challengeId, 'ACTIVE') };
    case 'CANCEL_CHALLENGE':
      return { ...state, challenges: setStatus(state, action.challengeId, 'CANCELLED') };
    case 'SUBMIT_PHOTO': {
      if (!state.game || !state.user) return state;
      const target = statusAfterSubmit(state.game.verificationMode);
      const ch = state.challenges.find((c) => c.id === action.challengeId);
      if (!ch || ch.status !== 'ACTIVE') return state;
      const next = { ...state, challenges: state.challenges.map((c) => (c.id === ch.id ? { ...c, status: 'SUBMITTED' as const } : c)) };
      return {
        ...next,
        submissions: [
          ...state.submissions.filter((s) => s.challengeId !== ch.id),
          { id: 's' + Date.now(), challengeId: ch.id, userId: state.user.id, source: 'LIVE_CAPTURE', photoUri: action.photoUri, capturedAt: action.capturedAt, votesApprove: 0, votesReject: 0 },
        ],
        ...(target === 'APPROVED'
          ? { challenges: setStatus(next, ch.id, 'APPROVED'), leaderboard: award(state, ch.id) }
          : {}),
      };
    }
    case 'VOTE': {
      const ch = state.challenges.find((c) => c.id === action.challengeId);
      if (!ch || ch.status !== 'SUBMITTED') return state;
      const submissions = state.submissions.map((s) =>
        s.challengeId === ch.id
          ? { ...s, votesApprove: s.votesApprove + (action.approve ? 1 : 0), votesReject: s.votesReject + (action.approve ? 0 : 1) }
          : s,
      );
      const sub = submissions.find((s) => s.challengeId === ch.id)!;
      if (sub.votesApprove >= VOTES_NEEDED) {
        const approved = { ...state, submissions };
        return { ...approved, challenges: setStatus(state, ch.id, 'APPROVED'), leaderboard: award(state, ch.id) };
      }
      if (sub.votesReject >= VOTES_NEEDED) return { ...state, submissions, challenges: setStatus(state, ch.id, 'REJECTED') };
      return { ...state, submissions };
    }
    case 'REVOTE_CHALLENGE':
      return {
        ...state,
        challenges: setStatus(state, action.challengeId, 'SUBMITTED'),
        submissions: state.submissions.map((s) =>
          s.challengeId === action.challengeId ? { ...s, votesApprove: 0, votesReject: 0 } : s,
        ),
      };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
