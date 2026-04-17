import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { userProfile, setAuthModalOpen } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      navigate('/account', { replace: true });
    } else {
      setAuthModalOpen(true);
    }
  }, [userProfile, navigate, setAuthModalOpen]);

  // If user closes modal without logging in, they'll stay on this page with a button to reopen
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      {!userProfile && (
        <>
          <h1 className="text-2xl font-serif text-charcoal mb-4">Sign In to Nadhir</h1>
          <p className="text-charcoal/60 mb-8 max-w-xs mx-auto">Access your orders, saved items and luxury preferences.</p>
          <button 
            onClick={() => setAuthModalOpen(true)}
            className="btn-primary px-12"
          >
            Open Login
          </button>
        </>
      )}
      {userProfile && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-sm text-charcoal/40 uppercase tracking-widest font-bold">Redirecting...</p>
        </div>
      )}
    </div>
  );
};
