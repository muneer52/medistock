export function getOAuthErrorMessage(errorMessage?: string): string {
  const normalized = errorMessage?.toLowerCase() ?? '';

  if (normalized.includes('unsupported provider') || normalized.includes('provider is not enabled')) {
    return 'Google sign-in is not enabled in your Supabase project. Enable the Google provider in Authentication > Providers and configure the OAuth credentials.';
  }

  return 'Google sign-in failed. Please try again.';
}
