## 1. Add Shared Medicine Suggestion Support

- [x] 1.1 Add a shared inventory helper for fetching popular medicine name suggestions based on more than 5 distinct users.
- [x] 1.2 Expose the helper through the inventory domain module so both UI entry points can reuse it.
- [x] 1.3 Ensure the helper handles empty results and network or RPC errors gracefully.

## 2. Build Shared Autocomplete UI

- [x] 2.1 Create a reusable autocomplete input component for medicine names.
- [x] 2.2 Support keyboard navigation, selection on click, and a clean no-results state.
- [x] 2.3 Debounce input queries to avoid unnecessary requests and keep the experience responsive.

## 3. Integrate into Inventory Search

- [x] 3.1 Add a search input to the inventory medicine list view.
- [x] 3.2 Filter the visible medicines by the selected or typed search value.
- [x] 3.3 Use the shared autocomplete suggestions while searching.

## 4. Integrate into Add Medicine Flow

- [x] 4.1 Replace the plain medicine name field in the add-medicine form with the shared autocomplete input.
- [x] 4.2 Ensure the same suggestion list appears during creation and editing.
- [x] 4.3 Preserve the existing submit flow while allowing manual entry when no suggestion matches.

## 5. Validation and Polish

- [x] 5.1 Verify that only names appearing in inventories of more than 5 users are suggested.
- [x] 5.2 Confirm the experience is consistent across inventory search and the add-medicine form.
- [x] 5.3 Review accessibility, focus handling, and responsive behavior.
