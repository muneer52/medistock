import { describe, expect, it } from 'vitest';
import { getOAuthErrorMessage } from './authErrors';

describe('getOAuthErrorMessage', () => {
  it('returns an actionable message when the Google provider is disabled', () => {
    expect(getOAuthErrorMessage('Unsupported provider: provider is not enabled')).toContain('Google sign-in is not enabled');
  });

  it('returns a generic fallback for unknown OAuth errors', () => {
    expect(getOAuthErrorMessage('Unexpected issue')).toBe('Google sign-in failed. Please try again.');
  });
});
