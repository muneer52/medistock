## ADDED Requirements

### Requirement: Owner can remove approved members
The system SHALL allow an inventory owner to remove an approved member from their inventory.

#### Scenario: Owner removes approved member
- **WHEN** the owner selects an approved member and confirms removal
- **THEN** the member is removed from the inventory membership list and no longer has access

#### Scenario: Owner removes member with confirmation
- **WHEN** the owner triggers member removal
- **THEN** the system asks for explicit confirmation before performing the removal
