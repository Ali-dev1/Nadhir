import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { checkSession } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Direct, lightweight role check instead of full checkSession sync
      const { error: _profileError, data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user?.id)
        .single();

      if (profile?.role !== 'admin') {
        setError('Unauthorized Access: Admin privileges required.');
        await supabase.auth.signOut();
        return;
      }

      // Sync the store in background, but navigate immediately
      checkSession();
      navigate('/admin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 border border-charcoal/10 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <h2 className="text-2xl font-serif text-charcoal">Admin Access</h2>
          <p className="text-charcoal/60 mt-2 text-sm">Authorized personnel only.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100 italic">
            {error}
          </div>
        )}

        <form data-testid="admin-login-form" onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-ivory/50 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-ivory/50 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-4"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
