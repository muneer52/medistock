## Context

The inventory module already renders medicines in a list and uses a dedicated medicine form for creating and editing records. The current experience has no search entry point, and the add-medicine form requires users to type a full medicine name manually. The feature should be added without introducing a second, inconsistent suggestion mechanism.

## Goals / Non-Goals

**Goals:**
- Provide a search field inside the inventory module for medicine name lookup.
- Show autocomplete suggestions for existing medicine names while the user types.
- Use a threshold of more than 5 distinct users contributing the same medicine name before it is suggested.
- Reuse the same autocomplete source for both inventory search and the add-medicine form.
- Keep the UX fast and consistent across both entry points.

**Non-Goals:**
- Building a full global medicine catalog or external API integration.
- Supporting fuzzy matching beyond lightweight name-based matching.
- Introducing a separate admin-managed taxonomy.

## Decisions

1. **Shared suggestion service** → Create a single shared helper in the inventory domain layer that returns popular medicine names using a backend query and a threshold of 6+ distinct users.
   - *Alternative considered*: Separate client-side filtering in each component. Rejected: It would duplicate logic and make behavior inconsistent.

2. **Autocomplete at the input level** → Both the inventory search field and the medicine name field will use the same shared component behavior, with a dropdown rendered underneath the input.
   - *Alternative considered*: A separate search page. Rejected: It would fragment the workflow and add unnecessary navigation.

3. **Server-driven popularity filter** → Suggestions are fetched from a Supabase RPC or query that counts distinct users per medicine name before returning candidates.
   - *Alternative considered*: Client-side popularity derived from current inventory list only. Rejected: It would not be reliable across inventories or users.

4. **Minimal, scalable UI** → The autocomplete UI will render a compact list of up to 8 suggestions and select a value on click or keyboard selection.
   - *Alternative considered*: Large, complex dropdowns with heavy client-side state. Rejected: It adds visual noise and overhead.

## Risks / Trade-offs

- **Risk**: The popularity threshold may initially return no suggestions for less common medicines.
  - *Mitigation*: Keep the threshold explicit and allow the user to type a custom value when no suggestion matches.

- **Risk**: Cross-inventory popularity queries can become expensive if implemented naively.
  - *Mitigation*: Use a dedicated backend query with filtering and a limit on returned results.

- **Risk**: The UI could feel inconsistent if one entry point uses a different debounce or suggestion behavior.
  - *Mitigation*: Share the same hook/component implementation across both surfaces.

## Migration Plan

1. Add a shared suggestion API in the inventory domain layer.
2. Build a reusable autocomplete input component for medicine name entry.
3. Integrate the shared autocomplete into the inventory search view and add-medicine form.
4. Validate the user experience for empty states, selection, and no-result scenarios.
5. Verify the feature works with the existing inventory data model and remains backward compatible.

**Rollback**: Remove the shared autocomplete integration from inventory search and the medicine form and revert to plain text inputs.

## Open Questions

- Should the search support partial matching beyond prefix matching? (Recommended: start with prefix matching and expand later if needed)
- Should the autocomplete be available on edit mode as well as create mode? (Recommended: yes, for consistency)
