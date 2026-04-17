import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Layouts
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { AdminLayout } from './features/admin/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MaintenanceGate } from './components/MaintenanceGate';
import ScrollToTop from './components/ScrollToTop';

// Lazy Loaded Features (Code Splitting)
const ProductList = lazy(() => import('./features/products/ProductList').then(m => ({ default: m.ProductList })));
const ProductDetail = lazy(() => import('./features/products/ProductDetail').then(m => ({ default: m.ProductDetail })));
const AccountPage = lazy(() => import('./features/account/AccountPage').then(m => ({ default: m.AccountPage })));
const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmation = lazy(() => import('./features/checkout/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const CollectionsPage = lazy(() => import('./features/products/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));

// Storefront Pages
const FAQPage = lazy(() => import('./features/storefront/FAQPage').then(m => ({ default: m.FAQPage })));
const AboutPage = lazy(() => import('./features/storefront/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./features/storefront/ContactPage').then(m => ({ default: m.ContactPage })));
const TermsPage = lazy(() => import('./features/storefront/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./features/storefront/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const ReturnsPage = lazy(() => import('./features/storefront/ReturnsPage').then(m => ({ default: m.ReturnsPage })));

// Admin
const Login = lazy(() => import('./features/admin/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./features/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Inventory = lazy(() => import('./features/admin/Inventory').then(m => ({ default: m.Inventory })));
const Orders = lazy(() => import('./features/admin/Orders').then(m => ({ default: m.Orders })));
const OrderLog = lazy(() => import('./features/admin/OrderLog').then(m => ({ default: m.OrderLog })));
const StoreSettings = lazy(() => import('./features/admin/StoreSettings').then(m => ({ default: m.StoreSettingsPage })));

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-gold" />
    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-bold animate-pulse">Loading Prestige...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="relative min-h-screen flex flex-col font-sans text-charcoal bg-ivory">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Storefront — wrapped in MaintenanceGate */}
            <Route path="/" element={
              <MaintenanceGate>
                <StorefrontLayout />
              </MaintenanceGate>
            }>
              <Route index element={<ProductList />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="returns" element={<ReturnsPage />} />
            </Route>

            {/* Admin / Portal Auth — OUTSIDE MaintenanceGate */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Admin Secure Area */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<Orders />} />
                <Route path="order-log" element={<OrderLog />} />
                <Route path="settings" element={<StoreSettings />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
