## 1. Data and Access Setup

- [x] 1.1 Update Supabase schema to ensure `inventory_members` tracks membership and `medicines` is scoped by `inventory_id`
- [x] 1.2 Confirm `inventories` includes a unique `invite_code` and membership access rules
- [x] 1.3 Add or verify access checks so only inventory members can query or modify medicines

## 2. Inventory Collaboration Implementation

- [x] 2.1 Build a join-by-invite-code UI flow for users to enter an inventory code
- [x] 2.2 Implement the backend or Supabase query logic to validate invite codes and add members
- [x] 2.3 Add membership enforcement for inventory access across pages and operations

## 3. Medicine Inventory Management

- [x] 3.1 Implement medicine item creation and editing for the current inventory
- [x] 3.2 Add medicine deletion support and remove items from the list view
- [x] 3.3 Derive and display medicine status states: CRITICAL, LOW, OK

## 4. Verification and Cleanup

- [ ] 4.1 Validate add/edit/remove scenarios against the inventory-management spec
- [ ] 4.2 Validate invite code join and access enforcement against the inventory-collaboration spec
- [ ] 4.3 Review and update the change documentation if requirements shift during implementation
