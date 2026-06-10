## ADDED Requirements

### Requirement: User sign-out button
The system SHALL provide a "Sign Out" button in the main dashboard header that terminates the user's session.

#### Scenario: Sign-out from dashboard
- **WHEN** authenticated user clicks "Sign Out" button in header
- **THEN** user session is terminated and user is redirected to login screen

#### Scenario: Button visibility
- **WHEN** user is authenticated and viewing the dashboard
- **THEN** "Sign Out" button is visible in the top-right header area

#### Scenario: Button hidden on login screen
- **WHEN** user is on the login/registration screen
- **THEN** "Sign Out" button is not displayed

### Requirement: Session termination
The system SHALL clear all session data when user signs out.

#### Scenario: Session cleared after sign-out
- **WHEN** user signs out
- **THEN** Supabase session is terminated and user auth context is reset to null

#### Scenario: Cannot access protected routes after sign-out
- **WHEN** user signs out and browser is refreshed
- **THEN** dashboard is not accessible; user is redirected to login screen

### Requirement: Sign-out confirmation (optional)
The system SHOULD provide clear feedback when sign-out succeeds.

#### Scenario: Immediate redirect after sign-out
- **WHEN** user clicks "Sign Out"
- **THEN** user sees a brief loading state and is redirected to login screen within 1 second
