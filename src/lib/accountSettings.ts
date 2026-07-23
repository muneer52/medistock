import { isStrongPassword } from './authValidation';

export function validateEmailUpdate(email: string): string | null {
  if (!email.trim()) {
    return 'Please enter a valid email address';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
}

export function validatePasswordUpdate(newPassword: string, confirmPassword: string, currentPassword?: string): string | null {
  if (!currentPassword?.trim()) {
    return 'Please enter your current password';
  }

  if (!isStrongPassword(newPassword)) {
    return 'Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character';
  }

  if (newPassword !== confirmPassword) {
    return 'New passwords do not match';
  }

  return null;
}
