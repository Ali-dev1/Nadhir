import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthState {
  userProfile: Profile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  isLoading: true,
  isAuthModalOpen: false,
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ userProfile: null, isLoading: false });
        return;
      }
      
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profError && profError.code !== 'PGRST116') {
        throw profError;
      }
        
      set({ userProfile: profile || null, isLoading: false });
    } catch (error) {
      console.error("Auth Exception:", error);
      set({ userProfile: null, isLoading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ userProfile: null });
  }
}));
