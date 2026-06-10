## ADDED Requirements

### Requirement: Owner can delete inventory
The system SHALL allow an inventory owner to delete an inventory that they own.

#### Scenario: Owner deletes inventory
- **WHEN** the owner confirms the delete inventory action
- **THEN** the inventory is removed from the dashboard and all associated membership state is cleaned up

#### Scenario: Owner delete inventory confirmation
- **WHEN** the owner clicks delete inventory
- **THEN** the system requires explicit confirmation before deleting the inventory
