import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../state/store';
import { useNav } from '../navigation';
import { Button, Card, Input, Screen, T } from '../components/ui';
import { captureLivePhoto, ONLY_LIVE_CAPTURE_RULE } from '../services/camera';
import { colors } from '../theme';
import type { ChallengeStatus } from '../domain/types';

const statusColor: Record<ChallengeStatus, string> = {
  AVAILABLE: colors.muted, ACTIVE: colors.accent, SUBMITTED: colors.accent,
  APPROVED: colors.ok, REJECTED: colors.bad, CANCELLED: colors.muted,
};

export function LoginScreen() {
  const { dispatch } = useStore();
  const nav = useNav();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <Screen title="Welcome to Plurr" showBack={false}>
      <T.muted>Festival photo challenges with your crew. (Mock auth — no backend yet.)</T.muted>
      <Input placeholder="Display name" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Button label="Log in / Register" disabled={!name.trim()} onPress={() => {
        dispatch({ type: 'LOGIN', displayName: name.trim(), email });
        nav.reset({ name: 'Onboarding' });
      }} />
    </Screen>
  );
}

export function OnboardingScreen() {
  const { dispatch } = useStore();
  const nav = useNav();
  return (
    <Screen title="How Plurr works" showBack={false}>
      <Card><T.body>1. Start or join a game with friends.</T.body></Card>
      <Card><T.body>2. Take on festival challenges.</T.body></Card>
      <Card><T.body>3. {ONLY_LIVE_CAPTURE_RULE}</T.body></Card>
      <Card><T.body>4. Your crew votes to verify. Photos are private to your game by default.</T.body></Card>
      <Button label="Let's go" onPress={() => { dispatch({ type: 'FINISH_ONBOARDING' }); nav.reset({ name: 'Home' }); }} />
    </Screen>
  );
}

export function HomeScreen() {
  const { state } = useStore();
  const nav = useNav();
  const g = state.game;
  const inGame = g && g.status !== 'FINISHED';
  return (
    <Screen title={`Hey ${state.user?.displayName ?? ''} 🎪`} showBack={false}>
      {g ? <Card><T.strong>{g.name}</T.strong><T.muted>Status: {g.status} · Verification: {g.verificationMode}</T.muted></Card> : <T.muted>No active game yet.</T.muted>}
      {!inGame && <Button label="Create a game" onPress={() => nav.navigate({ name: 'GameSetup' })} />}
      {g?.status === 'LOBBY' && <Button label="Open lobby" onPress={() => nav.navigate({ name: 'Lobby' })} />}
      {g?.status === 'ACTIVE' && <Button label="Challenges" onPress={() => nav.navigate({ name: 'Challenges' })} />}
      {g && <Button kind="ghost" label="Leaderboard" onPress={() => nav.navigate({ name: 'Leaderboard' })} />}
      <Button kind="ghost" label="My photos" onPress={() => nav.navigate({ name: 'MyPhotos' })} />
      <Button kind="ghost" label="Profile" onPress={() => nav.navigate({ name: 'Profile' })} />
    </Screen>
  );
}

export function GameSetupScreen() {
  const { dispatch } = useStore();
  const nav = useNav();
  const [name, setName] = useState('Festival Friday');
  const [mode, setMode] = useState<'NONE' | 'VOTE'>('VOTE');
  return (
    <Screen title="Game setup">
      <Input value={name} onChangeText={setName} placeholder="Game name" />
      <T.muted>Verification mode (AI / HYBRID coming later)</T.muted>
      <View>
        <Button kind={mode === 'VOTE' ? 'primary' : 'ghost'} label="VOTE – friends verify" onPress={() => setMode('VOTE')} />
        <Button kind={mode === 'NONE' ? 'primary' : 'ghost'} label="NONE – auto-approve" onPress={() => setMode('NONE')} />
      </View>
      <Button label="Create game" disabled={!name.trim()} onPress={() => {
        dispatch({ type: 'CREATE_GAME', name: name.trim(), verificationMode: mode });
        nav.reset({ name: 'Home' });
        nav.navigate({ name: 'Lobby' });
      }} />
    </Screen>
  );
}

export function LobbyScreen() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  return (
    <Screen title={state.game?.name ?? 'Lobby'}>
      <T.muted>Lobby – waiting for players (mock participants)</T.muted>
      {state.participants.map((p) => (
        <Card key={p.userId}><T.body>{p.displayName} {p.ready ? '✅ ready' : '⏳ not ready'}</T.body></Card>
      ))}
      <Button label="Start game" disabled={state.game?.status !== 'LOBBY'} onPress={() => { dispatch({ type: 'START_GAME' }); nav.reset({ name: 'Home' }); nav.navigate({ name: 'Challenges' }); }} />
    </Screen>
  );
}

export function ChallengesScreen() {
  const { state, dispatch } = useStore();
  const nav = useNav();
  return (
    <Screen title="Challenges">
      {state.challenges.map((c) => (
        <Card key={c.id}>
          <T.strong>{c.title} · {c.points} pts</T.strong>
          <T.body>Status: <T.muted>{c.status}</T.muted></T.body>
          <Button kind="ghost" label="Details" onPress={() => nav.navigate({ name: 'ChallengeDetail', challengeId: c.id })} />
        </Card>
      ))}
      <Button kind="danger" label="Finish game" onPress={() => { dispatch({ type: 'FINISH_GAME' }); nav.reset({ name: 'Home' }); nav.navigate({ name: 'Leaderboard' }); }} />
    </Screen>
  );
}

export function ChallengeDetailScreen({ challengeId }: { challengeId: string }) {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const c = state.challenges.find((x) => x.id === challengeId);
  if (!c) return <Screen title="Not found"><T.body>Unknown challenge</T.body></Screen>;
  return (
    <Screen title={c.title}>
      <T.body>{c.description}</T.body>
      <T.muted>{c.points} points · {c.status}</T.muted>
      <T.muted>{ONLY_LIVE_CAPTURE_RULE}</T.muted>
      {c.status === 'AVAILABLE' && <Button label="Accept challenge" onPress={() => dispatch({ type: 'ACCEPT_CHALLENGE', challengeId })} />}
      {c.status === 'ACTIVE' && <Button label="Take live photo" onPress={() => nav.navigate({ name: 'Camera', challengeId })} />}
      {(c.status === 'SUBMITTED' || c.status === 'REJECTED' || c.status === 'APPROVED') && <Button label="Verification status" onPress={() => nav.navigate({ name: 'Verification', challengeId })} />}
      {(c.status === 'AVAILABLE' || c.status === 'ACTIVE') && <Button kind="danger" label="Cancel challenge" onPress={() => dispatch({ type: 'CANCEL_CHALLENGE', challengeId })} />}
    </Screen>
  );
}

export function CameraScreen({ challengeId }: { challengeId: string }) {
  const { dispatch } = useStore();
  const nav = useNav();
  return (
    <Screen title="Camera">
      <Card><T.body>📷 Mock live camera viewfinder</T.body><T.muted>{ONLY_LIVE_CAPTURE_RULE}</T.muted></Card>
      <Button label="Capture" onPress={async () => {
        const p = await captureLivePhoto();
        dispatch({ type: 'SUBMIT_PHOTO', challengeId, photoUri: p.uri, capturedAt: p.capturedAt });
        nav.back();
        nav.navigate({ name: 'Verification', challengeId });
      }} />
    </Screen>
  );
}

export function VerificationScreen({ challengeId }: { challengeId: string }) {
  const { state, dispatch } = useStore();
  const nav = useNav();
  const c = state.challenges.find((x) => x.id === challengeId);
  const sub = state.submissions.find((x) => x.challengeId === challengeId);
  if (!c) return <Screen title="Not found"><T.body>Unknown challenge</T.body></Screen>;
  return (
    <Screen title="Verification">
      <Card>
        <T.strong>{c.title}</T.strong>
        <T.body>Status: {c.status}</T.body>
        {sub && <T.muted>Votes: 👍 {sub.votesApprove} · 👎 {sub.votesReject} (mode {state.game?.verificationMode})</T.muted>}
      </Card>
      {c.status === 'SUBMITTED' && (
        <>
          <T.muted>Simulate crew votes (2 needed):</T.muted>
          <Button label="Friend approves" onPress={() => dispatch({ type: 'VOTE', challengeId, approve: true })} />
          <Button kind="danger" label="Friend rejects" onPress={() => dispatch({ type: 'VOTE', challengeId, approve: false })} />
        </>
      )}
      {c.status === 'REJECTED' && (
        <>
          <T.muted>Rejected. Choose what to do next:</T.muted>
          <Button label="Retry with a new photo" onPress={() => { dispatch({ type: 'RETRY_CHALLENGE', challengeId }); nav.back(); }} />
          <Button kind="ghost" label="Put it to a new vote" onPress={() => dispatch({ type: 'REVOTE_CHALLENGE', challengeId })} />
          <Button kind="danger" label="Cancel challenge" onPress={() => { dispatch({ type: 'CANCEL_CHALLENGE', challengeId }); nav.back(); }} />
        </>
      )}
      {c.status === 'APPROVED' && <T.strong>🎉 Approved! +{c.points} pts</T.strong>}
    </Screen>
  );
}

export function LeaderboardScreen() {
  const { state } = useStore();
  return (
    <Screen title="Leaderboard">
      {state.leaderboard.length === 0 && <T.muted>No game yet.</T.muted>}
      {state.leaderboard.map((e, i) => (
        <Card key={e.userId}><T.body>{i + 1}. {e.displayName} — {e.points} pts</T.body></Card>
      ))}
    </Screen>
  );
}

export function ProfileScreen() {
  const { state } = useStore();
  const nav = useNav();
  return (
    <Screen title="Profile">
      <Card><T.strong>{state.user?.displayName}</T.strong><T.muted>{state.user?.email || 'no email'}</T.muted></Card>
      <T.muted>Privacy: photos are only visible to participants of your game.</T.muted>
      <Button kind="ghost" label="Log out" onPress={() => nav.reset({ name: 'Login' })} />
    </Screen>
  );
}

export function MyPhotosScreen() {
  const { state } = useStore();
  const mine = state.submissions.filter((s) => s.userId === state.user?.id);
  return (
    <Screen title="My photos">
      {mine.length === 0 && <T.muted>No photos yet.</T.muted>}
      {mine.map((s) => {
        const ch = state.challenges.find((c) => c.id === s.challengeId);
        return (
          <Card key={s.id}>
            <T.body>🖼️ {ch?.title}</T.body>
            <T.muted>{ch?.status} · live capture at {s.capturedAt}</T.muted>
          </Card>
        );
      })}
    </Screen>
  );
}
