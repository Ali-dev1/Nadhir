import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../hooks/useAuthStore';
import { X, Lock, UserPlus, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { checkSession } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Handle Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      } else {
        // Handle Signup
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Wait for session to be established before inserting profile
        if (!authData.user) {
          setError("Signup failed to return user data.");
          setLoading(false);
          return;
        }

        // Failsafe: Manually ensure profile exists after a short delay
        // (This catches cases where SQL triggers are missing or delayed)
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', authData.user!.id)
              .single();
            
            if (!profile) {
              await supabase.from('profiles').insert([{
                id: authData.user!.id,
                full_name: fullName,
                role: 'customer'
              }]);
            }
          } catch (e) {
             // If trigger already did it, single() might work or error, 
             // but we've covered the base.
          }
        }, 1000);
      }

      await checkSession();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-ivory shadow-2xl w-full max-w-md border border-charcoal/10 relative overflow-hidden">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors p-2"
          aria-label="Close authentication window"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif text-charcoal mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-charcoal/60 text-sm">
              {isLogin 
                ? 'Sign in to access your Nadhir Thobes account.' 
                : 'Join our clientele for exclusive access to our luxury kanzu collections.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border border-red-100 italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-4 w-4 text-charcoal/40" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ivory/50 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-charcoal/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-ivory/50 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-charcoal/40" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-ivory/50 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-charcoal/10 text-center">
            <p className="text-charcoal/60 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-gold hover:text-charcoal transition-colors font-medium underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};
