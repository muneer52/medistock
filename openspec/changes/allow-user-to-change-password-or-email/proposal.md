## Why

Authenticated users currently have no way to update their account credentials after sign-up. That makes password recovery and profile maintenance difficult, especially when a user wants to change their email address or reset a password without creating a new account.

## What Changes

- Users can update their email address from an account settings experience
- Users can change their password from an account settings experience
- The UI provides clear validation, success, and error states for each action
- Existing authentication flows remain compatible with Supabase-based sessions

## Capabilities

### New Capabilities
- `account-email-update`: Authenticated users can request an email change and receive confirmation guidance
- `account-password-update`: Authenticated users can change their password from a secure settings form

### Modified Capabilities
- `auth-context`: Existing authentication context will support account security actions without breaking the current sign-in and sign-out flows

## Impact

- **Frontend**: New account settings UI and validation for email/password updates
- **Backend**: Supabase Auth integration for updating email and password securely
- **User Flow**: Signed-in users can manage account credentials directly inside the app
- **Security**: Password and email update actions should follow Supabase auth best practices and require re-authentication when needed
