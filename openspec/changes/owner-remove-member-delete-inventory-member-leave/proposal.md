## Why

Owners need direct control over their inventory membership and lifecycle, while collaborators need a safe way to leave a shared inventory. Without owner-level deletion and member exit support, stale inventories and unwanted memberships can persist indefinitely.

## What Changes

- Add explicit owner controls for removing an approved member from an inventory.
- Add owner controls for deleting an inventory entirely.
- Add a member self-service leave flow for approved inventory collaborators.

## Capabilities

### New Capabilities
- `owner-member-management`: Owner-directed member removal and membership management.
- `inventory-deletion`: Owner-directed deletion of an inventory and its membership context.
- `member-leave`: Member self-service leave flow for approved inventory collaborators.

### Modified Capabilities
- `<existing-name>`: <what requirement is changing>

## Impact

- `src/components/ApprovalDashboard.tsx` may be updated to better surface owner member removal controls.
- `src/components/InventoryDetails.tsx` will likely need owner delete inventory and member leave actions.
- `src/lib/inventory.ts` may need new API wrappers for delete inventory and leave inventory flows.
- Supabase stored procedures may need a new inventory deletion RPC and a member leave RPC if not already available.
