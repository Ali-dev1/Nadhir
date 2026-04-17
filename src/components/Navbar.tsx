import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Home, Grid } from 'lucide-react';
import { useCartStore } from '../hooks/useCartStore';
import { useAuthStore } from '../hooks/useAuthStore';

export const Navbar: React.FC = () => {
  const { items, setCartOpen } = useCartStore();
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleAuthNavigation = () => {
    if (userProfile) navigate('/account');
    else navigate('/login');
  };

  const isHomePage = location.pathname === '/';
  const isCollectionPage = location.pathname === '/collections' || location.hash === '#collection';
  const isAcct = location.pathname.startsWith('/account') || location.pathname === '/login';

  const handleHomeClick = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleCollectionsClick = () => {
    if (isHomePage) {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  return (
    <>
      {/* === DESKTOP NAVBAR (>= 768px) === */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-ivory/90 backdrop-blur-md h-[72px] items-center" style={{ borderBottom: '1px solid rgba(28,28,30,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-1 flex items-center">
            <span 
              onClick={() => navigate('/')}
              className="font-sans text-[14px] text-charcoal font-bold tracking-[0.15em] uppercase cursor-pointer"
              title="Nadhir Thobes"
            >
              NADHIR THOBES
            </span>
          </div>

          {/* Links */}
          <div className="flex-1 flex justify-center space-x-10">
            <Link to="/collections" className="font-sans text-[13px] tracking-[0.1em] text-charcoal/70 hover:text-gold transition-colors duration-200 uppercase">Collections</Link>
            <Link to="/collections?category=Arab+Perfumes" className="font-sans text-[13px] tracking-[0.1em] text-charcoal/70 hover:text-gold transition-colors duration-200 uppercase">Perfumes</Link>
            <Link to="/about" className="font-sans text-[13px] tracking-[0.1em] text-charcoal/70 hover:text-gold transition-colors duration-200 uppercase">About</Link>
            <Link to="/contact" className="font-sans text-[13px] tracking-[0.1em] text-charcoal/70 hover:text-gold transition-colors duration-200 uppercase">Contact</Link>
          </div>

          {/* Actions */}
          <div className="flex-1 flex justify-end items-center space-x-8">
            <button onClick={() => navigate('/collections')} className="text-charcoal hover:text-gold transition-colors" aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={handleAuthNavigation} className="text-charcoal hover:text-gold transition-colors" aria-label="Account">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => setCartOpen(true)} className="text-charcoal hover:text-gold transition-colors relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span data-testid="cart-count-badge" className="absolute -top-1.5 -right-2 bg-gold text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* === MOBILE NAVBAR (< 768px) === */}
      <nav 
        className="md:hidden sticky top-0 z-50 bg-ivory h-[60px] flex items-center justify-between px-5 overflow-hidden" 
        style={{ borderBottom: '1px solid rgba(28,28,30,0.08)' }}
      >
        {/* Left: N Monogram */}
        <div 
          className="flex items-center w-12 cursor-pointer h-full" 
          onClick={() => navigate('/')}
        >
          <span className="font-serif text-[28px] text-gold leading-none" style={{ position: 'relative', top: '2px' }}>N</span>
        </div>

        {/* Center: Wordmark */}
        <Link to="/" className="text-charcoal flex-1 text-center truncate font-sans text-[11px] tracking-[0.2em] font-medium uppercase">
          Nadhir Thobes
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center justify-end w-auto space-x-5">
          <button onClick={() => navigate('/collections')} className="text-charcoal">
            <Search className="w-6 h-6" strokeWidth={1.2} />
          </button>
          <button onClick={() => setCartOpen(true)} className="text-charcoal relative">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.2} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gold text-white text-[9px] font-bold h-[16px] w-[16px] flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* === MOBILE BOTTOM TAB BAR === */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-[60] pb-safe"
        style={{ 
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          borderTop: '1px solid rgba(28,28,30,0.06)'
        }}
      >
        <div className="flex justify-between items-center h-[64px] px-2 relative">
          <button 
            onClick={handleHomeClick} 
            className={`flex-1 h-full min-h-[56px] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 ${isHomePage ? 'text-gold' : 'text-charcoal/40'}`}
          >
            <Home className="w-5 h-5" strokeWidth={isHomePage ? 2.5 : 1.5} />
            <span className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium">Home</span>
          </button>
          <button 
            onClick={handleCollectionsClick} 
            className={`flex-1 h-full min-h-[56px] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 ${isCollectionPage ? 'text-gold' : 'text-charcoal/40'}`}
          >
            <Grid className="w-5 h-5" strokeWidth={isCollectionPage ? 2.5 : 1.5} />
            <span className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium">Collection</span>
          </button>
          <button 
            onClick={() => setCartOpen(true)} 
            className={`flex-1 h-full min-h-[56px] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 text-charcoal/40 relative`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-charcoal text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium">Bag</span>
          </button>
          <button 
            onClick={handleAuthNavigation} 
            className={`flex-1 h-full min-h-[56px] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 ${isAcct ? 'text-gold' : 'text-charcoal/40'}`}
          >
            <User className="w-5 h-5" strokeWidth={isAcct ? 2.5 : 1.5} />
            <span className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium">Account</span>
          </button>
        </div>
      </div>
    </>
  );
};

