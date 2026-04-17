import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { supabase } from '../../lib/supabase';
import { formatKES } from '../../lib/utils';
import { Package, User as UserIcon, LogOut, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderStepper } from '../../components/OrderStepper';
import type { Order, OrderStatus } from '../../types';

export const AccountPage: React.FC = () => {
  const { userProfile, signOut, checkSession } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      fetchOrders();
      setSettingsForm({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as Order[]);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settingsForm.full_name.trim(),
          phone: settingsForm.phone.trim(),
        })
        .eq('id', userProfile.id);

      if (error) throw error;
      setSaveMsg('Settings updated successfully.');
      await checkSession(); // refresh profile in store
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  if (!userProfile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 min-h-[70vh]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-72 space-y-4 shrink-0">
          <div className="bg-white p-6 shadow-sm border border-charcoal/5">
            <div className="w-14 h-14 bg-charcoal/10 rounded-full flex items-center justify-center text-charcoal mb-4">
              <UserIcon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-serif text-charcoal">{userProfile.full_name || 'Customer'}</h2>
            <p className="text-charcoal/50 text-xs uppercase tracking-widest mt-1">{userProfile.role}</p>
          </div>

          <nav className="bg-white border border-charcoal/5 overflow-hidden">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium border-b border-charcoal/5 transition-colors min-h-[48px] ${
                activeTab === 'orders' ? 'text-gold bg-gold/5' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <Package className="w-4 h-4" /> Order History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium border-b border-charcoal/5 transition-colors min-h-[48px] ${
                activeTab === 'settings' ? 'text-gold bg-gold/5' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <Settings className="w-4 h-4" /> Account Settings
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-charcoal/50 hover:text-red-500 transition-colors min-h-[48px]"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </nav>

          <Link to="/reset-password" className="block text-xs text-gold hover:underline px-1">
            Change Password
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'orders' && (
            <>
              <h2 className="text-2xl font-serif text-charcoal mb-6">Order History</h2>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-24 bg-charcoal/5 animate-pulse" />
                  <div className="h-24 bg-charcoal/5 animate-pulse" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 text-center border border-charcoal/5">
                  <Package className="w-12 h-12 mx-auto text-charcoal/20 mb-4" strokeWidth={1} />
                  <h3 className="text-xl font-serif text-charcoal">No orders yet</h3>
                  <p className="text-charcoal/50 mt-2 mb-6">When you place an order, it will appear here.</p>
                  <Link to="/" className="btn-primary text-sm">Browse Collection</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <div key={order.id} className="bg-white border border-charcoal/5 shadow-sm overflow-hidden">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full p-5 flex justify-between items-center text-left min-h-[64px]"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-charcoal/40 uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-charcoal/60 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-gold font-medium">{formatKES(order.total_amount_kes)}</p>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-medium ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                'bg-charcoal/5 text-charcoal/60'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-charcoal/40" /> : <ChevronDown className="w-4 h-4 text-charcoal/40" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-charcoal/5 p-5 space-y-5">
                            <OrderStepper currentStatus={order.status as OrderStatus} />

                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-charcoal/5 last:border-0">
                                  <span className="text-charcoal">
                                    {item.quantity}× {item.name}
                                    <span className="text-charcoal/40 ml-2">Size {item.size}</span>
                                  </span>
                                  <span className="text-charcoal/60">{formatKES(item.price_kes * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between text-sm pt-2">
                              <span className="text-charcoal/50">Total</span>
                              <span className="font-serif text-charcoal">{formatKES(order.total_amount_kes)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <h2 className="text-2xl font-serif text-charcoal mb-6">Account Settings</h2>
              <form onSubmit={handleSaveSettings} className="bg-white border border-charcoal/5 p-6 md:p-8 space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settingsForm.full_name}
                    onChange={e => setSettingsForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
                    placeholder="07XX XXX XXX"
                  />
                </div>
                {saveMsg && (
                  <p className={`text-sm ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</p>
                )}
                <button type="submit" disabled={saving} className="btn-primary min-h-[48px] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
