## ADDED Requirements

### Requirement: Password recovery request
The system SHALL allow an email/password user to request a password reset email from the sign-in interface.

#### Scenario: Successful password recovery request
- **WHEN** the user enters a valid email address and clicks the password recovery button
- **THEN** the system sends a password reset email via Supabase and displays a confirmation message to the user

#### Scenario: Password recovery request with invalid email
- **WHEN** the user enters an invalid email format and submits the recovery request
- **THEN** the system displays a validation error without sending a recovery email

#### Scenario: Password recovery request with unregistered email
- **WHEN** the user enters an email address that is not registered
- **THEN** the system displays a generic confirmation message without revealing that the email is not registered

### Requirement: Secure recovery messaging
The system SHALL use generic success messaging so that attackers cannot determine whether a specific email address is registered.

#### Scenario: Generic recovery response
- **WHEN** a user submits a password recovery request
- **THEN** the system displays a response message that is identical for registered and unregistered emails
