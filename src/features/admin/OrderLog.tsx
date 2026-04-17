import React, { useState, useEffect, useMemo } from 'react';
import { NadhirService } from '../../services/api';
import type { Order } from '../../types';
import { 
  Search, 
  Download, 
  Calendar,
} from 'lucide-react';
import { formatKES } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

export const OrderLog: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await NadhirService.getOrders();
      // In the log, we show ALL orders including active ones, for auditing
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  }, [orders, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Items', 'Total (KES)', 'Status', 'Payment'];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_phone,
      o.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
      o.total_amount_kes,
      o.status,
      o.payment_status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nadhir_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-charcoal/5 w-1/4 rounded"></div>
        <div className="h-64 bg-charcoal/5 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold mb-1">Audit Trail</h2>
          <h1 className="text-2xl font-serif text-charcoal font-medium">Historical Order Log</h1>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-charcoal text-ivory px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
        <input 
          type="text"
          placeholder="Search by ID, Name or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-charcoal/10 outline-none focus:border-gold transition-colors text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-charcoal/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 border-b border-charcoal/10">
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Order Artifact</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Date</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Vested Client</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Inventory</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Value</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-charcoal/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-ivory/50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-[11px] text-charcoal uppercase">#{order.id.split('-')[0]}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-charcoal/60">
                      <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-charcoal">{order.customer_name}</span>
                      <span className="text-[10px] text-charcoal/40">{order.customer_phone}</span>
                    </div>
                  </td>
                   <td className="p-4">
                    <span className="text-xs text-charcoal/60">{order.items.length} items</span>
                  </td>
                  <td className="p-4 font-medium text-charcoal text-sm">
                    {formatKES(order.total_amount_kes)}
                  </td>
                  <td className="p-4">
                    <Badge label={order.status.toUpperCase()} variant={
                      order.status === 'delivered' ? 'success' : 
                      order.status === 'cancelled' ? 'error' : 'default'
                    } size="sm" />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-charcoal/30 italic font-serif">
                    No matching records found in the audit trail.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
