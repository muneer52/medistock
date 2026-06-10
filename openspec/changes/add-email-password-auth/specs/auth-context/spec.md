## ADDED Requirements

### Requirement: Multi-method authentication support
The system's auth context SHALL support both OAuth (Google) and email/password authentication methods transparently.

#### Scenario: User logged in via Google OAuth
- **WHEN** user authenticates via Google OAuth
- **THEN** auth context populates user object with email and metadata from Google session

#### Scenario: User logged in via email/password
- **WHEN** user authenticates via email/password
- **THEN** auth context populates user object with email and user ID from Supabase session

#### Scenario: Auth context works for both methods
- **WHEN** component calls useAuth() hook
- **THEN** user object is populated the same way regardless of login method (OAuth or email/password)

### Requirement: Sign-out functionality
The system's auth context SHALL provide a signOut() function that works for all authentication methods.

#### Scenario: Sign-out clears user session
- **WHEN** component calls signOut() from useAuth() hook
- **THEN** Supabase session is terminated and auth context user state is set to null

#### Scenario: Sign-out works after any login method
- **WHEN** user logged in via OAuth then calls signOut()
- **THEN** session is cleared successfully
- **WHEN** user logged in via email/password then calls signOut()
- **THEN** session is cleared successfully

### Requirement: Session persistence
The system's auth context SHALL maintain user session across page refreshes when valid session token exists.

#### Scenario: Session restored on page refresh
- **WHEN** authenticated user refreshes the browser
- **THEN** auth context restores user session from Supabase without requiring re-login
