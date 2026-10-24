import React, { createContext, useContext, useState } from 'react';

export type Route =
  | { name: 'Login' }
  | { name: 'Onboarding' }
  | { name: 'Home' }
  | { name: 'GameSetup' }
  | { name: 'Lobby' }
  | { name: 'Challenges' }
  | { name: 'ChallengeDetail'; challengeId: string }
  | { name: 'Camera'; challengeId: string }
  | { name: 'Verification'; challengeId: string }
  | { name: 'Leaderboard' }
  | { name: 'Profile' }
  | { name: 'MyPhotos' };

interface Nav {
  route: Route;
  stack: Route[];
  navigate: (r: Route) => void;
  reset: (r: Route) => void;
  back: () => void;
}

const Ctx = createContext<Nav | null>(null);

/** Tiny stack navigator; swap for React Navigation when needed. */
export function NavProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'Login' }]);
  const nav: Nav = {
    route: stack[stack.length - 1],
    stack,
    navigate: (r) => setStack((s) => [...s, r]),
    reset: (r) => setStack([r]),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
  };
  return <Ctx.Provider value={nav}>{children}</Ctx.Provider>;
}

export function useNav() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used inside NavProvider');
  return v;
}
