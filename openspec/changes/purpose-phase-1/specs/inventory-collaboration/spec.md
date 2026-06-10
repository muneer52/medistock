## ADDED Requirements

### Requirement: Join inventory by invite code
The system SHALL allow a user to join an existing inventory by entering its unique invite code.

#### Scenario: Join with valid invite code
- **WHEN** a signed-in user submits a valid invite code for an existing inventory
- **THEN** the system SHALL add the user to the inventory_members table for that inventory
- **THEN** the user SHALL have access to view and manage medicines for that inventory

#### Scenario: Join with invalid invite code
- **WHEN** a signed-in user submits an invite code that does not match any inventory
- **THEN** the system SHALL show an error message indicating the code is invalid
- **THEN** the user SHALL not be added to any inventory

### Requirement: Inventory member access enforcement
The system SHALL restrict inventory medicine operations to inventory members only.

#### Scenario: Member accesses inventory medicines
- **WHEN** a user is a member of an inventory
- **THEN** the system SHALL allow read and write operations on medicines within that inventory

#### Scenario: Non-member is blocked
- **WHEN** a user is not a member of an inventory
- **THEN** the system SHALL prevent access to that inventory's medicine list and operations
- **THEN** the user SHALL receive an access denied response or message
