## Why

Users who authenticate with email and password can currently sign in or sign up, but there is no way to recover access if they forget their password. This creates a usability dead end and increases support friction for user onboarding.

## What Changes

- Add a "Forgot Password?" pathway on the existing authentication screen.
- Add a password recovery request flow that sends a secure reset email via Supabase.
- Show clear success and error messaging for recovery requests without leaking account existence.
- Keep the backend flow managed by Supabase to avoid adding a custom reset page or extra authentication service.

## Capabilities

### New Capabilities
- `password-recovery`: Password recovery request and reset email flow for email/password users.

### Modified Capabilities
- `<existing-name>`: <what requirement is changing>

## Impact

- `src/components/SignIn.tsx` will be updated with a recovery flow and new UI state.
- `src/lib/auth.tsx` may be extended with helper methods for password recovery.
- Supabase auth configuration must support password reset email sending.
- No database schema changes are required.
