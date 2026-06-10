## Context

The app currently supports inventory creation, joining by invite code, and a pending membership approval flow. Owners can approve or reject pending requests, but the owner removal and inventory deletion UX is not fully surfaced, and members cannot leave an inventory they no longer need.

## Goals / Non-Goals

**Goals:**
- Provide owners with a clear, secure way to remove approved members.
- Provide owners with a safe inventory deletion workflow that confirms destructive action.
- Allow approved members to leave an inventory without owner involvement.

**Non-Goals:**
- Implementing a full audit trail or soft-delete history for inventories.
- Supporting owner-less inventory deletion.
- Creating a complex multi-step transfer-of-ownership flow.

## Decisions

- Use Supabase RPC functions for inventory deletion and member departure rather than client-side deletion logic.
  - Rationale: ensures access control is enforced server-side and keeps user-facing actions simple.
- Add owner delete inventory controls in the inventory details view to keep all inventory actions together.
- Add a member leave button in the inventory details view for collaborators, with confirmation messaging.
- Keep the removal and deletion flows modal-less and confirmation-driven, using browser `confirm()` for MVP.

## Risks / Trade-offs

- [Risk] Deleting an inventory is destructive and could remove data unexpectedly.
  → Mitigation: require explicit confirmation and confirm only for owners.
- [Risk] Member leave action could be confused with sign-out.
  → Mitigation: label the action clearly and include user-facing wording like "Leave inventory".
- [Risk] Owner remove member and delete inventory actions could introduce stale UI state.
  → Mitigation: refresh inventory details after the action completes.

## Migration Plan

1. Add the required Supabase RPC wrapper(s) in `src/lib/inventory.ts`.
2. Add UI buttons and confirmation flows in `InventoryDetails.tsx` and/or `ApprovalDashboard.tsx`.
3. Test owner remove member, delete inventory, and member leave flows locally.
4. Deploy with no schema change aside from new RPC functions.

## Open Questions

- Should delete inventory also remove all associated medicines and memberships, or only mark the inventory inactive?
- Should member leave be available for pending requests or only approved members?
