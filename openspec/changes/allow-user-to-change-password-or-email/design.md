## Context

The app already uses Supabase Auth for sign-in, sign-up, and sign-out. The current experience focuses on initial authentication, but it does not expose any way for a signed-in user to manage account credentials. We need to add safe, minimal account settings flows for changing email and password.

## Goals / Non-Goals

**Goals:**
- Allow authenticated users to update their email address
- Allow authenticated users to change their password
- Present validation and feedback clearly in the UI
- Keep the solution compatible with the existing React + Supabase auth setup

**Non-Goals:**
- Creating a full account-settings page with profile photo or other identity features
- Implementing multi-factor authentication
- Supporting external identity provider account linking

## Decisions

1. **Use Supabase Auth operations for credential updates** → Use `supabase.auth.updateUser({ email })` and `supabase.auth.updateUser({ password })` where supported.
   - *Alternative considered*: Custom backend storage. Rejected because Supabase Auth already provides the necessary APIs.

2. **Add a lightweight account settings panel** → Place the controls in the existing authenticated app experience, such as a settings section in the dashboard or header area.
   - *Alternative considered*: Separate dedicated settings page. Rejected for speed and minimal scope.

3. **Require current password or re-authentication for sensitive changes** → Password changes should be handled through secure flows and user confirmation where needed.
   - *Alternative considered*: Allow public password changes without verification. Rejected due to security concerns.

4. **Reuse existing form validation patterns** → Keep the UI consistent with the current sign-in experience and reuse existing password-strength logic.
   - *Alternative considered*: Introduce a separate validation system. Rejected to reduce maintenance.

## Risks / Trade-offs

- **Risk**: Email updates may require a confirmation step before the change is finalized.
  - *Mitigation*: Show clear messaging that the user may need to verify the new email address.

- **Risk**: Password updates may fail if the new password is weak or the user is not fully authenticated.
  - *Mitigation*: Use client-side validation and pass through Supabase errors to the UI.

## Migration Plan

1. Add a small account settings section in the authenticated UI.
2. Implement email update form and password update form with validation.
3. Wire the forms to Supabase Auth update methods.
4. Display success and error states to the user.
5. Verify that the existing sign-in, sign-out, and protected routes still work.

**Rollback**: Remove the account settings UI and revert the auth helper wiring if issues arise.
