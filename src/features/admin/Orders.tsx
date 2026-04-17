import React, { useEffect, useState, useMemo } from 'react';
import { NadhirService } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import { formatKES } from '../../lib/utils';
import { Search, Package, Archive, ArchiveX } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { useToast } from '../../components/admin/Toast';

const TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Active', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Dispatched', value: 'dispatched' },
];

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await NadhirService.getOrders();
      setOrders(data.filter(o => !(o as any).archived_at));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await NadhirService.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err: unknown) {
      setOrders(originalOrders);
      showToast('Failed to update status. Reverting changes.', 'error');
    }
  };

  const handleArchiveOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast(`Order #${orderId.slice(0, 8).toUpperCase()} moved to log.`, 'info');

    try {
      if ((NadhirService as any).updateOrderArchived) {
        await (NadhirService as any).updateOrderArchived(orderId, true);
      }
    } catch (err) {
      console.warn('Archive failed on DB, but updated locally.');
    }
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'info';
      case 'processing': return 'warning';
      case 'dispatched': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== 'all') {
      result = result.filter(o => o.status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customer_name.toLowerCase().includes(q) || 
        o.customer_phone.includes(q) || 
        o.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 bg-charcoal/5 rounded w-1/3"></div>
        <div className="h-64 bg-charcoal/5 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold mb-1">Logistics</h2>
          <h1 className="text-3xl font-serif text-charcoal font-medium">Active Orders</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input 
            placeholder="Quick search client..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-charcoal/10 outline-none focus:border-gold text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-charcoal/5 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.value ? 'border-gold text-charcoal' : 'border-transparent text-charcoal/30 hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hidden lg:block bg-white border border-charcoal/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal/5 border-b border-charcoal/10">
              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">ID</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Client</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Items</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Total</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Status</th>
              <th className="p-4 text-right text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5 text-[13px]">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-ivory/50 transition-colors group">
                <td className="p-4 font-mono text-[11px] text-charcoal/40">#{order.id.slice(0,8).toUpperCase()}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-charcoal">{order.customer_name}</span>
                    <span className="text-[10px] text-charcoal/40">{order.customer_phone}</span>
                  </div>
                </td>
                <td className="p-4 text-charcoal/60">{order.items.length} pieces</td>
                <td className="p-4 font-medium">{formatKES(order.total_amount_kes)}</td>
                <td className="p-4">
                  <Badge label={order.status.toUpperCase()} variant={getStatusVariant(order.status)} size="sm" />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                      className="p-2 hover:bg-gold hover:text-charcoal transition-colors rounded text-charcoal/40"
                    >
                      <Package size={16} />
                    </button>
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <button 
                        onClick={() => handleArchiveOrder(order.id)}
                        className="p-2 hover:bg-charcoal hover:text-ivory transition-colors rounded text-charcoal/40"
                        title="Archive to Log"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-5 border border-charcoal/10 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest">#{order.id.slice(0,8).toUpperCase()}</span>
              <Badge label={order.status.toUpperCase()} variant={getStatusVariant(order.status)} size="sm" />
            </div>
            <div onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
              <h3 className="font-serif text-lg text-charcoal">{order.customer_name}</h3>
              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">{order.customer_phone} • {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-charcoal/5">
              <span className="font-medium text-charcoal">{formatKES(order.total_amount_kes)}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                  className="bg-ivory px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-charcoal/10"
                >
                  Manage
                </button>
                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button 
                    onClick={() => handleArchiveOrder(order.id)}
                    className="bg-charcoal text-ivory px-3 py-2 rounded"
                  >
                    <Archive size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-32 text-center bg-white border border-dashed border-charcoal/10">
          <ArchiveX className="mx-auto w-10 h-10 text-charcoal/10 mb-4" />
          <p className="text-xl font-serif text-charcoal/40 italic">No active orders in this section.</p>
        </div>
      )}

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};
