## 1. Backend API

- [x] 1.1 Add or verify Supabase RPC functions for owner inventory deletion and member leave
- [x] 1.2 Add corresponding wrappers in `src/lib/inventory.ts`

## 2. Owner UX

- [x] 2.1 Add owner-facing inventory deletion action to the inventory details view
- [x] 2.2 Ensure owner remove member actions are accessible and confirmed in approval/member management flows

## 3. Member UX

- [x] 3.1 Add a leave inventory action for approved collaborators
- [ ] 3.2 Confirm the member leave flow updates the UI and membership state correctly

## 4. Validation

- [ ] 4.1 Verify owner remove member works and the member is removed from inventory details
- [ ] 4.2 Verify owner inventory deletion works and the inventory disappears from the dashboard
- [ ] 4.3 Verify a member can leave an inventory and loses access after leaving
