## Why

Currently, the app only supports Google OAuth login, which limits accessibility for users without a Google account. Adding email/password authentication enables broader user adoption and provides users full control over their credentials. A sign-out feature is essential for shared and public device scenarios.

## What Changes

- Users can now register with an email and password
- Users can sign in with email and password credentials
- A sign-out button is added to the main dashboard header for easy session termination
- Login screen UI is refactored to support both OAuth and traditional auth methods
- Session state remains integrated with existing auth context

## Capabilities

### New Capabilities
- `email-password-auth`: User registration and login using email and password credentials with Supabase auth
- `user-logout`: Sign-out functionality accessible from the main dashboard header

### Modified Capabilities
- `auth-context`: Existing auth context will now support both OAuth and email/password login methods (requirement change: must handle manual password-based sessions)

## Impact

- **Frontend**: Auth UI components (login screen), header navigation, auth context hooks
- **Backend**: Supabase auth configuration (already supports email/password, no schema changes needed)
- **User Flow**: New users can join the system without Google account; existing OAuth users unaffected
- **Security**: Email/password auth adds credential storage considerations (handled by Supabase)
