import { ONLY_LIVE_CAPTURE_RULE } from '../domain/rules';

export { ONLY_LIVE_CAPTURE_RULE };

/** Placeholder for expo-camera. Never reads from the gallery. */
export async function captureLivePhoto(): Promise<{ uri: string; capturedAt: string }> {
  return { uri: 'mock://live-capture/' + Date.now(), capturedAt: new Date().toISOString() };
}
