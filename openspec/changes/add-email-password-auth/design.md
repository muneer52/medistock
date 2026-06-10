## Context

The app currently uses Google OAuth for authentication via Supabase. The auth context (`src/lib/auth.tsx`) manages user sessions and provides hooks for components to access user state. The login flow is minimal and only supports OAuth. There is no explicit logout UI; users must rely on browser session clearing.

Supabase natively supports email/password authentication without additional backend setup. The frontend needs to be refactored to present both auth methods and add a logout button to the main dashboard.

## Goals / Non-Goals

**Goals:**
- Enable email/password registration and login via Supabase auth
- Add a sign-out button to the dashboard header
- Update the login screen to support both OAuth and email/password methods
- Preserve existing user sessions and OAuth login flow
- Minimal changes to the auth context (backward compatible)

**Non-Goals:**
- Password reset / recovery flow
- Email verification / confirmation flow (optional for MVP)
- Multi-factor authentication
- Session timeout or idle detection
- OAuth provider switching

## Decisions

1. **Leverage Supabase email/password auth** → Use Supabase's built-in `signInWithPassword` and `signUp` methods. No additional backend required.
   - *Alternative considered*: Custom password hashing and database table. Rejected: Supabase handles this securely out of the box.

2. **Create a unified login component** → New `SignIn.tsx` component presents both OAuth (Google) and email/password forms on the same screen.
   - *Alternative considered*: Separate pages for OAuth vs email/password. Rejected: Single screen reduces friction and is simpler to maintain.

3. **Add sign-out to header** → Place a "Sign Out" button in the main dashboard header alongside the user email display.
   - *Alternative considered*: Settings menu or separate page. Rejected: Header placement is more discoverable and standard.

4. **Minimal auth context changes** → Keep the existing auth context structure; add optional email/password fields to the sign-up UI. The context's `signOut` function already works for all auth methods.
   - *Alternative considered*: Refactor auth context to separate OAuth from email/password logic. Rejected: Unnecessary complexity; Supabase handles both uniformly.

5. **No stored password recovery** → Initial MVP skips password reset. Users can log back in with email/password or use OAuth.
   - *Alternative considered*: Implement password reset flow. Deferred: Out of MVP scope.

## Risks / Trade-offs

- **Risk**: Email/password is less secure than OAuth if users reuse weak passwords.
  - *Mitigation*: Add password strength requirements in Supabase configuration and front-end form validation (min 8 chars, mixed case, number).

- **Risk**: Users may forget passwords and have no recovery path in MVP.
  - *Mitigation*: Document that users can always join with Google OAuth; password reset added in next phase.

- **Risk**: Sign-up form adds complexity to the login screen.
  - *Mitigation*: Keep form simple and concise; toggle between sign-in and sign-up modes on the same screen.

## Migration Plan

1. Update `src/lib/auth.tsx` to keep `signOut` working (already implemented).
2. Create new `src/components/SignIn.tsx` with dual auth forms.
3. Replace the current login page entry point (if it exists) with the new `SignIn.tsx` component.
4. Add "Sign Out" button to the header in `src/App.tsx`.
5. Test OAuth login still works; test email/password registration and login.
6. Deploy and monitor for auth errors.

**Rollback**: Remove `SignIn.tsx` component and revert `App.tsx` header changes. OAuth login remains available.

## Open Questions

- Should email verification be required before login? (Deferred for MVP; recommend adding in phase 3)
- Should we display password strength indicator during sign-up? (Nice-to-have; start simple)
- Should we pre-fill the email field if a user tries to join an inventory with that email? (Consider for future UX improvement)
