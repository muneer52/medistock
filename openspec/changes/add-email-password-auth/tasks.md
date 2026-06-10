## 1. Update Authentication UI

- [x] 1.1 Create new `src/components/SignIn.tsx` component with email/password form
- [x] 1.2 Add email input field with validation (required, proper format)
- [x] 1.3 Add password input field with strength indicator (min 8 chars validation)
- [x] 1.4 Add sign-up/sign-in toggle UI to switch between modes on same screen
- [x] 1.5 Integrate Google OAuth button alongside email/password form
- [x] 1.6 Add error message display for login failures and validation errors
- [x] 1.7 Add loading state indicator during sign-in/sign-up process

## 2. Implement Email/Password Authentication

- [x] 2.1 Implement `signUp()` function calling `supabase.auth.signUp({ email, password })`
- [x] 2.2 Implement `signIn()` function calling `supabase.auth.signInWithPassword({ email, password })`
- [x] 2.3 Handle Supabase auth responses and errors (duplicate email, weak password, etc.)
- [x] 2.4 Update `SignIn.tsx` to call these functions on form submission
- [x] 2.5 Auto-redirect to dashboard after successful login/signup

## 3. Add Sign-Out Functionality

- [x] 3.1 Add "Sign Out" button to header in `src/App.tsx`
- [x] 3.2 Position button in top-right area next to user email display
- [x] 3.3 Wire button to call `signOut()` from `useAuth()` hook
- [x] 3.4 Redirect user to login screen after successful sign-out
- [x] 3.5 Ensure button is hidden when user is not authenticated

## 4. Verify Auth Context Compatibility

- [x] 4.1 Verify existing `signOut()` in auth context works for email/password sessions
- [x] 4.2 Confirm `useAuth()` hook returns consistent user object for both OAuth and email/password
- [x] 4.3 Test session persistence on page refresh for email/password users
- [x] 4.4 Verify auth state changes trigger proper UI updates across all pages

## 5. Testing & Validation

- [ ] 5.1 Test email/password sign-up with valid credentials
- [ ] 5.2 Test sign-up fails with duplicate email
- [ ] 5.3 Test sign-up fails with weak password
- [ ] 5.4 Test email/password sign-in with correct credentials
- [ ] 5.5 Test sign-in fails with wrong password
- [ ] 5.6 Test sign-out button is visible and functional
- [ ] 5.7 Test redirect to login screen after sign-out
- [ ] 5.8 Test Google OAuth still works after changes
- [ ] 5.9 Test session persists on page refresh for both auth methods
- [ ] 5.10 Verify form validation provides helpful error messages

## 6. Cleanup & Documentation

- [x] 6.1 Remove any old/unused login components if applicable
- [x] 6.2 Update comments in `src/lib/auth.tsx` documenting multi-method support
- [x] 6.3 Add JSDoc comments to SignIn component functions
- [ ] 6.4 Test on mobile viewport for responsive design
- [ ] 6.5 Final review of error messages and user-facing copy
