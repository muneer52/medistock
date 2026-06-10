## 1. Authentication UI

- [x] 1.1 Add a "Forgot Password?" option to the existing sign-in screen
- [x] 1.2 Add UI state for recovery submission, confirmation, and validation errors

## 2. Password Recovery Logic

- [x] 2.1 Implement `supabase.auth.resetPasswordForEmail` for recovery requests
- [x] 2.2 Use generic messaging for both registered and unregistered email submission

## 3. Testing and Validation

- [x] 3.1 Verify the recovery flow validates email format before sending requests
- [ ] 3.2 Verify the reset email is sent successfully using Supabase
- [ ] 3.3 Verify the user can complete recovery and sign in after resetting the password

## 4. Documentation

- [x] 4.1 Update any auth docs or comments to reflect the new recovery feature
- [x] 4.2 Add a brief note explaining Supabase password recovery behavior in the design doc if needed
