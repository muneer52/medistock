import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateEmailUpdate, validatePasswordUpdate } from '../lib/accountSettings';

interface AccountSettingsProps {
  currentEmail?: string;
  onBack: () => void;
}

export function AccountSettings({ currentEmail, onBack }: AccountSettingsProps) {
  const [email, setEmail] = useState(currentEmail ?? '');
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError('');
    setEmailMessage('');

    const validationMessage = validateEmailUpdate(email);
    if (validationMessage) {
      setEmailError(validationMessage);
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        setEmailError(error.message);
      } else {
        setEmailMessage('Please check your inbox to confirm the new email address.');
      }
    } catch (error) {
      setEmailError('Unable to update email right now. Please try again.');
      console.error(error);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    const validationMessage = validatePasswordUpdate(newPassword, confirmPassword, currentPassword);
    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    setPasswordLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail ?? email,
        password: currentPassword,
      });

      if (signInError || !signInData.session) {
        setPasswordError('Current password is incorrect.');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError('Unable to update password right now. Please try again.');
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const passwordFieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 pr-10 text-slate-100 outline-none focus:border-cyan-500';

  return (
    <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-100">Account settings</h3>
        <p className="mt-1 text-sm text-slate-400">Update your email address or change your password securely.</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleEmailUpdate} className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Mail className="h-4 w-4 text-cyan-400" />
            <span>Update email</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="new.email@example.com"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
            disabled={emailLoading}
          />
          <button
            type="submit"
            disabled={emailLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {emailLoading ? <Loader className="h-4 w-4 animate-spin" /> : null}
            Save email
          </button>
          {emailError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{emailError}</span>
            </div>
          ) : null}
          {emailMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{emailMessage}</span>
            </div>
          ) : null}
        </form>

        <form onSubmit={handlePasswordUpdate} className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <KeyRound className="h-4 w-4 text-cyan-400" />
            <span>Change password</span>
          </div>

          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              className={passwordFieldClass}
              disabled={passwordLoading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className={passwordFieldClass}
              disabled={passwordLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className={passwordFieldClass}
              disabled={passwordLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {passwordLoading ? <Loader className="h-4 w-4 animate-spin" /> : null}
            Update password
          </button>
          {passwordError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{passwordError}</span>
            </div>
          ) : null}
          {passwordMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{passwordMessage}</span>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
