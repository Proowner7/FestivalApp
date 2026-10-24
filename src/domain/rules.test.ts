import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionChallenge, canTransitionGame, isModeSupported, statusAfterSubmit } from './rules';

test('game lifecycle', () => {
  assert.ok(canTransitionGame('DRAFT', 'LOBBY'));
  assert.ok(!canTransitionGame('FINISHED', 'ACTIVE'));
});

test('rejected challenges can retry, vote or cancel', () => {
  for (const to of ['ACTIVE', 'SUBMITTED', 'CANCELLED'] as const) {
    assert.ok(canTransitionChallenge('REJECTED', to));
  }
  assert.ok(!canTransitionChallenge('APPROVED', 'ACTIVE'));
});

test('verification modes', () => {
  assert.ok(isModeSupported('VOTE'));
  assert.ok(!isModeSupported('AI'));
  assert.equal(statusAfterSubmit('NONE'), 'APPROVED');
  assert.equal(statusAfterSubmit('VOTE'), 'SUBMITTED');
});
