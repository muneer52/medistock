import { describe, expect, it } from 'vitest';
import { isStrongPassword } from './authValidation';

describe('isStrongPassword', () => {
  it('accepts a longer password with mixed character classes', () => {
    expect(isStrongPassword('SecurePass123!')).toBe(true);
  });

  it('rejects passwords that are too short or lack complexity', () => {
    expect(isStrongPassword('password123')).toBe(false);
    expect(isStrongPassword('short')).toBe(false);
  });
});
