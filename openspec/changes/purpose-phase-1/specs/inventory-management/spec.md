## ADDED Requirements

### Requirement: Medicine inventory management
The system SHALL allow users to add, edit, and remove medicine items within a shared inventory.

#### Scenario: Add a medicine item
- **WHEN** a signed-in inventory member submits a valid medicine form
- **THEN** the system SHALL create a new medicine record for the current inventory
- **THEN** the new medicine SHALL appear in the inventory medicine list

#### Scenario: Edit a medicine item
- **WHEN** a signed-in inventory member updates an existing medicine item
- **THEN** the system SHALL persist the updated name, category, quantity, threshold, and expiry date
- **THEN** the system SHALL reflect the updated values in the list view

#### Scenario: Remove a medicine item
- **WHEN** a signed-in inventory member deletes a medicine item
- **THEN** the system SHALL remove the item from the inventory and list view

### Requirement: Status classification for medicines
The system SHALL classify medicine stock using the stored `quantity` and `threshold` values.

#### Scenario: Critical stock status
- **WHEN** a medicine item has `quantity == 0`
- **THEN** the UI SHALL mark the item as **CRITICAL** and display the critical indicator

#### Scenario: Low stock status
- **WHEN** a medicine item has `quantity <= threshold` and `quantity > 0`
- **THEN** the UI SHALL mark the item as **LOW** and display the low-stock indicator

#### Scenario: OK stock status
- **WHEN** a medicine item has `quantity > threshold`
- **THEN** the UI SHALL mark the item as **OK** and display the normal indicator
