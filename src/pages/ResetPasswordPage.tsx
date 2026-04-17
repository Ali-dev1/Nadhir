import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'request' | 'sending' | 'sent' | 'update' | 'updating' | 'done'>('request');
  const [error, setError] = useState('');

  // Check if we arrived via a reset link (has access_token in hash)
  const isResetMode = window.location.hash.includes('type=recovery');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    setStatus('sending');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setStatus('sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
      setStatus('request');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setStatus('updating');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setStatus('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      setStatus('update');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Request Reset Form */}
        {!isResetMode && status !== 'sent' && (
          <div className="bg-white p-8 border border-charcoal/10 shadow-sm">
            <div className="text-center mb-6">
              <KeyRound className="w-10 h-10 text-gold mx-auto mb-3" />
              <h1 className="text-2xl font-serif text-charcoal">Reset Password</h1>
              <p className="text-sm text-charcoal/60 mt-2">Enter your email to receive a reset link.</p>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 border border-red-100">{error}</p>}

            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" disabled={status === 'sending'} className="w-full btn-primary min-h-[48px] disabled:opacity-50">
                {status === 'sending' ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</span>
                ) : (
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Send Reset Link</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-charcoal/50 mt-6">
              Remember your password? <Link to="/admin/login" className="text-gold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Email Sent Confirmation */}
        {status === 'sent' && (
          <div className="bg-white p-8 border border-charcoal/10 shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-charcoal mb-2">Check Your Email</h2>
            <p className="text-charcoal/60 text-sm">
              We've sent a password reset link to <strong className="text-charcoal">{email}</strong>. 
              Click the link in the email to set a new password.
            </p>
          </div>
        )}

        {/* Update Password Form (after clicking reset link) */}
        {isResetMode && status !== 'done' && (
          <div className="bg-white p-8 border border-charcoal/10 shadow-sm">
            <div className="text-center mb-6">
              <KeyRound className="w-10 h-10 text-gold mx-auto mb-3" />
              <h1 className="text-2xl font-serif text-charcoal">Set New Password</h1>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 border border-red-100">{error}</p>}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={status === 'updating'} className="w-full btn-primary min-h-[48px] disabled:opacity-50">
                {status === 'updating' ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          </div>
        )}

        {/* Password Updated */}
        {status === 'done' && (
          <div className="bg-white p-8 border border-charcoal/10 shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-charcoal mb-2">Password Updated!</h2>
            <p className="text-charcoal/60 text-sm mb-6">Your password has been changed successfully.</p>
            <Link to="/" className="btn-primary">Back to Store</Link>
          </div>
        )}
      </div>
    </div>
  );
};
