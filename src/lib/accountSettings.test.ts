import { describe, expect, it } from 'vitest';
import { validateEmailUpdate, validatePasswordUpdate } from './accountSettings';

describe('accountSettings validators', () => {
  it('rejects an invalid email address', () => {
    expect(validateEmailUpdate('not-an-email')).toBe('Please enter a valid email address');
  });

  it('rejects password updates that are weak, mismatched, or missing the current password', () => {
    expect(validatePasswordUpdate('weak', 'weak', 'CurrentPass123!')).toBe('Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character');
    expect(validatePasswordUpdate('StrongPass123!', 'DifferentPass123!', 'CurrentPass123!')).toBe('New passwords do not match');
    expect(validatePasswordUpdate('StrongPass123!', 'StrongPass123!')).toBe('Please enter your current password');
  });

  it('accepts a strong matching password with the current password supplied', () => {
    expect(validatePasswordUpdate('StrongPass123!', 'StrongPass123!', 'CurrentPass123!')).toBeNull();
  });
});
