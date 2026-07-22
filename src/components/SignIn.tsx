import React, { useState } from 'react';
import { Cloud, Mail, Lock, LogIn, UserPlus, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isStrongPassword } from '../lib/authValidation';
import { getOAuthErrorMessage } from '../lib/authErrors';

type AuthMode = 'signin' | 'signup' | 'recover';

/**
 * SignIn Component
 * 
 * Unified authentication interface supporting both Google OAuth and email/password authentication.
 * Users can toggle between sign-in, sign-up, and password recovery flows.
 * 
 * Features:
 * - Email/password sign-up with validation
 * - Email/password sign-in
 * - Password recovery request flow
 * - Google OAuth integration
 * - Real-time password strength indicator
 * - Comprehensive error handling
 * - Loading states for all authentication methods
 */
export function SignIn() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);


  /**
   * Validates email format using regex pattern
   * @param email - Email string to validate
   * @returns true if email format is valid
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates password meets a stronger security requirement.
   * @param password - Password string to validate
   * @returns true if password length and complexity requirements are met
   */
  const isValidPassword = (password: string): boolean => {
    return isStrongPassword(password);
  };

  /**
   * Returns color class for password strength indicator
   * @param password - Current password input value
   * @returns Tailwind color class based on password strength
   */
  const getPasswordStrengthColor = (password: string): string => {
    if (!password) return 'text-slate-400';
    if (!isStrongPassword(password)) return 'text-red-400';
    return 'text-green-400';
  };

  /**
   * Handles user registration with email and password
   * Validates input and calls Supabase auth.signUp()
   * On success, auth state listener automatically logs user in
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || !isValidPassword(password)) {
      setError('Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Email already registered. Try signing in instead.');
        } else {
          setError(signUpError.message);
        }
      }
      // On success, Supabase auth state change listener will handle login
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
      setMessage('Confirm your email address. Check your inbox for a confirmation email.')
      setSuccess(true);
    }
  };

  /**
   * Handles user login with email and password
   * Validates input and calls Supabase auth.signInWithPassword()
   * On success, auth state listener automatically redirects to dashboard
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError('Invalid email or password');
      }
      // On success, auth state change listener will handle redirect
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-in
   * Initiates OAuth flow with Supabase provider
   * On success, user is redirected to the app root with active session
   */
  // const handleGoogleSignIn = async () => {
  //   if (lockoutUntil && Date.now() < lockoutUntil) {
  //     setError('Too many authentication attempts. Please try again later.');
  //     return;
  //   }

  //   setError('');
  //   setMessage('');
  //   setLoading(true);
  //   setSuccess(false);
  //   try {
  //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: `${window.location.origin}`,
  //       },
  //     });
  //     if (oauthError) {
  //       setError(getOAuthErrorMessage(oauthError.message));
  //       const nextAttempts = failedAttempts + 1;
  //       setFailedAttempts(nextAttempts);
  //       if (nextAttempts >= 3) {
  //         setLockoutUntil(Date.now() + 30000);
  //       }
  //     }
  //   } catch (err) {
  //     setError(getOAuthErrorMessage(err instanceof Error ? err.message : ''));
  //     setFailedAttempts((prev) => prev + 1);
  //     console.error('Google OAuth error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      setError('Too many authentication attempts. Please try again later.');
      return;
    }

    setError('');
    setMessage('');
    setSuccess(false);

    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (recoveryError) {
        console.warn('Password recovery error:', recoveryError);
        setFailedAttempts((prev) => prev + 1);
        if (failedAttempts + 1 >= 3) {
          setLockoutUntil(Date.now() + 30000);
        }
      }

      setMessage(
        'If that email is registered, you will receive a password reset email shortly. Please check your inbox and spam folder.'
      );
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= 3) {
        setLockoutUntil(Date.now() + 30000);
      }
      console.error('Password recovery error:', err);
      setError('Unable to send recovery email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit =
    mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handlePasswordRecovery;
  const submitButtonText =
    mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send recovery email';
  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;
  const toggleText =
    mode === 'signin'
      ? "Don't have an account? Sign up"
      : mode === 'signup'
      ? 'Already have an account? Sign in'
      : 'Back to sign in';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 rounded-3xl bg-slate-900/70 px-5 py-4 shadow-lg shadow-cyan-500/10">
            <Cloud className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold">MediStock</h1>
              <p className="text-sm text-slate-400">Medical Inventory Management</p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-slate-950/95 p-8 shadow-[0_40px_120px_-50px_rgba(56,189,248,0.35)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-500/15 via-sky-500/10 to-indigo-500/10 blur-3xl"></div>
          {/* Message Display */}
          {message && (
            <div className={`mb-6 rounded-lg border ${!success? 'border-cyan-500/20 bg-cyan-500/10' : 'border-green-500/20 bg-green-500/10'} p-4 text-cyan-200`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {isLockedOut && (
            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200">
              <p className="text-sm">Too many attempts. Please wait 30 seconds before trying again.</p>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mb-6 flex gap-2 p-1 rounded-lg border border-slate-700 bg-slate-800/50">
            <button
              onClick={() => {
                setMode('signin');
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setMode('recover');
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'recover'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recover Password
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-slate-400">
              {mode === 'recover'
                ? 'Enter your email to receive password recovery instructions.'
                : 'Use your account email and password, or create a new account to get started.'}
            </p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  disabled={loading}
                />
              </div>
              {email && !isValidEmail(email) && (
                <p className="text-sm text-red-400 mt-1">Please enter a valid email</p>
              )}
            </div>

            {/* Password Input */}
            {mode !== 'recover' && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    disabled={loading}
                  />
                </div>
                {password && (
                  <p className={`text-sm mt-1 ${getPasswordStrengthColor(password)}`}>
                    {!isStrongPassword(password) ? '❌ Use 12+ characters with upper/lowercase, number, and special character' : '✓ Strong password'}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                isLockedOut ||
                !email ||
                !isValidEmail(email) ||
                (mode !== 'recover' && !password)
              }
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>
                    {mode === 'signin'
                      ? 'Signing in...'
                      : mode === 'signup'
                      ? 'Creating account...'
                      : 'Sending recovery email...'}
                  </span>
                </>
              ) : (
                <>
                  {mode === 'signin' ? (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Send recovery email</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-b border-slate-700"></div>
            <span className="text-sm text-slate-500">or</span>
            <div className="flex-1 border-b border-slate-700"></div>
          </div> */}

          {/* Google OAuth Button */}
          {/* <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-slate-700/60 bg-slate-900/95 hover:border-cyan-300 hover:bg-slate-800 text-slate-100 font-medium py-3 rounded-2xl transition-shadow shadow-lg shadow-slate-950/20 disabled:bg-slate-900 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button> */}

          {/* Toggle Text */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (mode === 'recover') {
                  setMode('signin');
                } else {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                }
                setError('');
                setMessage('');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {toggleText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
