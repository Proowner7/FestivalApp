import type { AppState } from '../domain/types';

// Replace with Supabase-backed implementation later. State shape stays the same.
export const gameService = {
  async loadInitialState(): Promise<AppState> {
    return initialState;
  },
};

export const initialState: AppState = {
  user: null,
  game: null,
  participants: [],
  challenges: [
    { id: 'c1', title: 'Group selfie at the main stage', description: 'Get at least 3 people in frame.', points: 10, status: 'AVAILABLE' },
    { id: 'c2', title: 'Funniest hat', description: 'Find someone with an outrageous hat.', points: 15, status: 'AVAILABLE' },
    { id: 'c3', title: 'Food truck feast', description: 'Snap your meal in front of a food truck.', points: 5, status: 'AVAILABLE' },
  ],
  submissions: [],
  leaderboard: [],
};
