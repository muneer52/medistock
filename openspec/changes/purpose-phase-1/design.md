## Context

MediStock is a minimal PWA for shared medical inventory tracking. The first phase focuses on delivering the core MVP capabilities referenced in the requirements document: shared inventory membership, medicine item lifecycle management, and status-based stock visibility.

## Goals / Non-Goals

**Goals:**
- Define a practical implementation approach for inventory collaboration and medicine inventory management.
- Align the architecture with Supabase-based backend storage and React front-end expectations.
- Minimize scope to the phase-1 MVP features while preserving a clean path for later PWA/offline work.

**Non-Goals:**
- Full offline-first PWA synchronization and background sync.
- Granular role-based permissions beyond simple invite-code membership.
- Advanced inventory analytics, reporting, or alerts beyond low-stock status.

## Decisions

- **Use Supabase as the primary backend data platform**: The project already targets Supabase for PostgreSQL and auth, so the design will keep business logic in the app while relying on Supabase row-level access control for inventory membership.
- **Model inventory membership with `inventory_members`**: A dedicated join table will represent shared inventory participants and simplify access checks on medicine operations.
- **Keep status logic in the frontend and backend**: Medicine status categories (`CRITICAL`, `LOW`, `OK`) are derived from stored `quantity` and `threshold`; implementing the same rule on both sides ensures consistent UI and API behavior.
- **Use invite code as the access mechanism**: The `invite_code` remains the canonical way to join an inventory, avoiding additional approval workflow complexity.

## Risks / Trade-offs

- [Risk] Client-side dependency on Supabase auth and membership data could expose UI state before server validation.
  → Mitigation: enforce membership checks in database queries or server-side functions and show a guarded loading/error state during join operations.
- [Risk] Simple invite-code access may lack security if codes are shared inadvertently.
  → Mitigation: keep codes unguessable and document that possession of the code is equivalent to access.
- [Risk] Storing low-stock thresholds increases schema complexity.
  → Mitigation: use default threshold behavior only when the user provides a threshold, and clearly label the threshold field in UI.

## Migration Plan

1. Implement `inventory_members` membership checks and invite-code join flow.
2. Add medicine CRUD endpoints or Supabase queries scoped to the current inventory.
3. Surface medicine status in the dashboard with the three color states.
4. Validate through manual scenario tests for join, add/edit/remove, and low-stock behavior.

## Open Questions

- Should the invite code be rotated or regenerated in phase 1, or is it fixed once created?
- Will inventory owners be distinguished from members in a later phase, or is all membership equal for phase 1?
