import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from './src/state/store';
import { NavProvider, useNav } from './src/navigation';
import * as S from './src/screens';

function Router() {
  const { route } = useNav();
  switch (route.name) {
    case 'Login': return <S.LoginScreen />;
    case 'Onboarding': return <S.OnboardingScreen />;
    case 'Home': return <S.HomeScreen />;
    case 'GameSetup': return <S.GameSetupScreen />;
    case 'Lobby': return <S.LobbyScreen />;
    case 'Challenges': return <S.ChallengesScreen />;
    case 'ChallengeDetail': return <S.ChallengeDetailScreen challengeId={route.challengeId} />;
    case 'Camera': return <S.CameraScreen challengeId={route.challengeId} />;
    case 'Verification': return <S.VerificationScreen challengeId={route.challengeId} />;
    case 'Leaderboard': return <S.LeaderboardScreen />;
    case 'Profile': return <S.ProfileScreen />;
    case 'MyPhotos': return <S.MyPhotosScreen />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <NavProvider>
        <StatusBar style="light" />
        <Router />
      </NavProvider>
    </StoreProvider>
  );
}
