## Why

Inventory users need a faster way to find medicines and avoid creating duplicate entries. A searchable medicine index with autocomplete will make the inventory experience more efficient, improve data quality, and help users quickly reuse trusted medicine names that already exist in the system.

## What Changes

- Add a medicine search experience inside the inventory module so users can search medicines by name.
- Add an autocomplete dropdown that suggests medicine names from existing inventory data.
- Restrict suggestions to medicine names that are used in the inventories of more than 5 users, so the list reflects popular and reliable choices.
- Reuse the same autocomplete behavior in the Add New Medicine form so users can choose a common medicine name instead of creating duplicates.
- Implement the feature with a shared, scalable data access pattern that supports fast lookups and consistent UX across both entry points.

## Capabilities

### New Capabilities
- `medicine-search`: Users can search medicines by name within the inventory module.
- `medicine-autocomplete`: Users see name suggestions while typing, based on a curated popularity threshold.
- `shared-medicine-suggestion`: The same suggestion source powers both inventory search and add-medicine entry.

### Modified Capabilities
- `inventory-management`: Inventory views will surface search and autocomplete support.
- `medicine-form`: The add-medicine workflow will include suggestion selection and duplicate avoidance.

## Impact

- **Frontend**: Inventory search UI and medicine form will gain shared autocomplete behavior.
- **Backend**: A new data access path will compute and return popular medicine names from cross-inventory usage.
- **User Flow**: Users can locate existing medicines faster and reduce duplicate entry mistakes.
- **Data Quality**: Only widely used medicine names are suggested, improving consistency and trust in the list.
