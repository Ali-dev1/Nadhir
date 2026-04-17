import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CartSidebar } from '../features/cart/CartSidebar';
import { AuthModal } from '../features/auth/AuthModal';
import { Footer } from '../components/Footer';
import { WhatsAppFAB } from '../components/WhatsAppFAB';
import { useAuthStore } from '../hooks/useAuthStore';

export const StorefrontLayout: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  return (
    <>
      <Navbar />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={() => setAuthModalOpen(false)} 
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <CartSidebar />
      <Footer />
      <WhatsAppFAB />
    </>
  );
};
