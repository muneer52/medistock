## Context

The current sign-in screen supports email/password login and account creation through Supabase. There is no password recovery or reset flow, which means users who forget their password cannot regain access without manual intervention.

## Goals / Non-Goals

**Goals:**
- Add a recovery flow for email/password users to request a password reset email.
- Keep the experience simple and secure by using Supabase password recovery functionality.
- Provide clear feedback for success and failure without revealing account state.

**Non-Goals:**
- Building a fully custom password reset page inside the app.
- Supporting recovery for OAuth-only users or passwordless auth.
- Changing authentication from Supabase to another provider.

## Decisions

- Use Supabase's built-in `resetPasswordForEmail` API rather than a custom token-based reset implementation.
  - Rationale: avoids adding complex routing, custom token handling, and additional backend logic.
  - Alternative considered: custom recovery page with `redirectTo` and local password reset form, but that is unnecessary for the first iteration.
- Add the recovery request UI to `src/components/SignIn.tsx`.
  - Rationale: this keeps authentication flows in one place and minimizes UI changes.
- Keep the recovery flow in the frontend and let Supabase manage email delivery and reset link generation.

## Risks / Trade-offs

- [Risk] The flow depends on Supabase email delivery and SMTP configuration.
  → Mitigation: verify Supabase auth email settings and use generic messaging for failures.
- [Risk] Using the Supabase-hosted reset page limits visual consistency with the app.
  → Mitigation: this is acceptable for an MVP; a custom reset page can be added later.
- [Risk] Users may submit invalid or unregistered emails.
  → Mitigation: validate email format client-side and show a generic confirmation message.

## Migration Plan

1. Implement password recovery UI and Supabase call in `SignIn.tsx`.
2. Test the recovery request flow in a local environment with Supabase credentials.
3. Confirm that a reset email is sent and that the Supabase reset link restores access.
4. Deploy with no database or schema changes.

## Open Questions

- Should the app later add a custom in-app reset page instead of relying on Supabase-hosted pages?
- If the app supports custom redirect behavior, should we add a `redirectTo` parameter in a follow-up change?
