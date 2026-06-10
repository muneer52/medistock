## ADDED Requirements

### Requirement: Member can leave inventory
The system SHALL allow an approved inventory member to leave an inventory on their own.

#### Scenario: Member leaves inventory
- **WHEN** an approved member chooses to leave the inventory and confirms the action
- **THEN** the member is removed from the inventory and loses access immediately

#### Scenario: Leave inventory confirmation
- **WHEN** the member triggers the leave inventory action
- **THEN** the system requires explicit confirmation before removing the member from the inventory
