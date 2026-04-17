import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { ToastProvider } from '../../components/admin/Toast';

const AdminLayoutContent: React.FC = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuthStore();

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Inventory', icon: Package, path: '/admin/inventory' },
    { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Order Log', icon: History, path: '/admin/order-log' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col bg-[#111111] text-ivory transition-all duration-300 border-r border-charcoal/20 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-ivory/5">
          {!isSidebarCollapsed && (
            <span className="font-serif text-[18px] text-gold tracking-widest font-bold">NADHIR</span>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-ivory/5 rounded-full transition-colors text-ivory/40 hover:text-ivory mx-auto md:mx-0"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 transition-all duration-200 group ${isActive ? 'bg-gold text-charcoal rounded' : 'text-ivory/40 hover:text-ivory hover:bg-ivory/5 rounded'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                {!isSidebarCollapsed && (
                  <span className="text-[13px] uppercase tracking-[0.1em] font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ivory/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 text-red-400/60 hover:text-red-400 hover:bg-red-900/10 transition-all rounded"
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="text-[13px] uppercase tracking-[0.1em]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-[60px] bg-[#111111] flex items-center justify-between px-5 z-[60] border-b border-ivory/5">
          <span className="font-serif text-[24px] text-gold">N</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-ivory/60 hover:text-ivory"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[60px] bg-charcoal/60 backdrop-blur-md z-[55] animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
            <nav className="bg-[#111111] p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 text-ivory/60 hover:text-gold border-b border-ivory/5"
                >
                  <item.icon size={20} />
                  <span className="text-sm uppercase tracking-widest">{item.label}</span>
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 text-red-500/60"
              >
                <LogOut size={20} />
                <span className="text-sm uppercase tracking-widest">Logout</span>
              </button>
            </nav>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-ivory p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10 hidden md:block">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold mb-1">Authenticated Access</h2>
              <h1 className="text-3xl font-serif text-charcoal">Welcome, {userProfile?.full_name?.split(' ')[0] || 'Admin'}</h1>
            </header>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <ToastProvider>
      <AdminLayoutContent />
    </ToastProvider>
  );
};
