import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatKES } from '../../lib/utils';
import { Activity, PackageX, TrendingUp, Users, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Order, Product } from '../../types';
import { getImageUrl, handleImageError } from '../../lib/imageHelpers';

interface TopProduct {
  name: string;
  units: number;
}

interface OrderItem {
  name: string;
  quantity: number;
  price_kes: number;
  size?: number | string;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    pendingOrders: 0,
    outOfStock: 0,
    newCustomers: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    categoryRevenue: [] as { name: string; value: number }[],
  });
  const [liveFeed, setLiveFeed] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
 
  const fetchInitialData = async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
 
      // Revenue + order count this month (paid orders)
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total_amount_kes, items, payment_status')
        .gte('created_at', monthStart);
 
      const paidOrders = monthOrders?.filter(o => o.payment_status === 'paid') || [];
      const allOrders = monthOrders || [];
      const totalRev = paidOrders.reduce((acc, row) => acc + row.total_amount_kes, 0);
      const totalOrderCount = allOrders.length;
      const avgValue = totalOrderCount > 0 ? Math.round(totalRev / Math.max(paidOrders.length, 1)) : 0;
 
      // Category Revenue & Top Products
      const productMap: Record<string, number> = {};
      const catMap: Record<string, number> = {
        'Omani': 0, 'Moroccan': 0, 'Saudi': 0, 'Emirati': 0, 'Arab Perfumes': 0
      };
 
      allOrders.forEach(order => {
        if (Array.isArray(order.items)) {
          (order.items as unknown as OrderItem[]).forEach((item: OrderItem) => {
            // Units sold
            productMap[item.name] = (productMap[item.name] || 0) + item.quantity;
            
            // Revenue by category (heuristic: check if name contains perfume-like keywords if category isn't in item)
            // Ideally we'd fetch product categories join, but for MVP we use a simple check or assume item has metadata
            // Let's assume item name or price helps, or better: just track units for now.
            // Actually, we can fetch all products to map names to categories.
          });
        }
      });
 
      const { data: productsData } = await supabase.from('products').select('name, category');
      const nameToCat = new Map(productsData?.map(p => [p.name, p.category]));
 
      paidOrders.forEach(order => {
        (order.items as unknown as OrderItem[]).forEach((item: OrderItem) => {
          const cat = nameToCat.get(item.name) || 'Omani';
          catMap[cat] = (catMap[cat] || 0) + (item.price_kes * item.quantity);
        });
      });
 
      const topProds = Object.entries(productMap)
        .map(([name, units]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, units }))
        .sort((a, b) => b.units - a.units)
        .slice(0, 5);
 
      const catRevData = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
 
      // Pending orders
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'processing']);
 
      // Out of stock
      const { count: oosCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 0);
 
      // Low stock products
      const { data: lowStock } = await supabase
        .from('products')
        .select('*')
        .gt('stock_quantity', 0)
        .lte('stock_quantity', 5)
        .order('stock_quantity', { ascending: true });
 
      // New customers today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: customersData } = await supabase
        .from('orders')
        .select('customer_phone')
        .gte('created_at', today.toISOString());
      const uniqueCustomers = new Set(customersData?.map(d => d.customer_phone)).size;
 
      setMetrics({
        revenue: totalRev,
        pendingOrders: pendingCount || 0,
        outOfStock: oosCount || 0,
        newCustomers: uniqueCustomers,
        totalOrders: totalOrderCount,
        avgOrderValue: avgValue,
        categoryRevenue: catRevData,
      });
 
      setTopProducts(topProds);
      setLowStockProducts((lowStock as Product[]) || []);
 
      // Recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
 
      if (recentOrders) setLiveFeed(recentOrders as Order[]);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchInitialData();
 
    let orderChannel: ReturnType<typeof supabase.channel> | null = null;
    
    // Defer subscription to avoid React StrictMode (or fast navigation) immediately 
    // creating and destroying a channel, which causes the "WebSocket is closed 
    // before the connection is established" console error.
    const timer = setTimeout(() => {
      orderChannel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          // Refresh everything on any order change (INSERT, UPDATE) to keep financials accurate
          fetchInitialData();
        })
        .subscribe();
    }, 250);
 
    return () => { 
      clearTimeout(timer);
      if (orderChannel) {
        supabase.removeChannel(orderChannel); 
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin text-gold"><Activity className="w-8 h-8" /></div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Revenue (This Month)', value: formatKES(metrics.revenue), icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'Orders (This Month)', value: metrics.totalOrders.toString(), icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
    { label: 'Avg. Order Value', value: formatKES(metrics.avgOrderValue), icon: Activity, color: 'bg-purple-100 text-purple-700' },
    { label: 'Pending Orders', value: metrics.pendingOrders.toString(), icon: PackageX, color: 'bg-orange-100 text-orange-700' },
    { label: 'Out of Stock', value: metrics.outOfStock.toString(), icon: PackageX, color: 'bg-red-100 text-red-700' },
    { label: 'Customers Today', value: metrics.newCustomers.toString(), icon: Users, color: 'bg-gold/20 text-gold' },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-charcoal">Command Center</h1>
        <p className="text-charcoal/60 text-sm mt-1">Real-time metrics and analytics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map(card => (
          <div key={card.label} className="bg-white p-5 shadow-sm border border-charcoal/5 rounded flex items-start gap-4">
            <div className={`${card.color} p-3 rounded-lg`}><card.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-xl font-serif text-charcoal">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category Chart */}
        <div className="bg-white shadow-sm border border-charcoal/5 rounded p-6">
          <h2 className="font-serif text-lg text-charcoal mb-4">Revenue by Category (KES)</h2>
          {metrics.categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.categoryRevenue} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                   formatter={(value: any) => formatKES(Number(value || 0))}
                   contentStyle={{ fontSize: 12, borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" fill="#C5A059" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-charcoal/30">
              <PackageX className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm italic">No category data for this period</p>
            </div>
          )}
        </div>
 
        {/* Top Products Chart */}
        <div className="bg-white shadow-sm border border-charcoal/5 rounded p-6">
          <h2 className="font-serif text-lg text-charcoal mb-4">Top Pieces by Volume</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: '4px' }} />
                <Bar dataKey="units" fill="#2D2D2D" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-charcoal/40 text-sm italic py-8 text-center">No sales data yet</p>
          )}
        </div>
      </div>

      {/* Live Feed */}
      <div className="bg-white shadow-sm border border-charcoal/5 rounded overflow-hidden">
        <div className="bg-charcoal/5 px-6 py-4 border-b border-charcoal/10 flex justify-between items-center">
          <h2 className="font-serif text-lg flex items-center gap-2 text-charcoal">
            <Activity className="w-4 h-4 text-green-600 animate-pulse" /> Live Order Feed
          </h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Secure Node
          </span>
        </div>
 
        {/* Low Stock Alerts - Restored Row */}
        <div className="p-6 border-b border-charcoal/5 bg-amber-50/30">
          <h2 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Critical Inventory Alerts
          </h2>
          {lowStockProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map(p => (
                <div key={p.id} className="bg-white p-3 border border-amber-200 rounded flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-charcoal/5 rounded overflow-hidden shrink-0">
                      {(p.image_urls?.[0] || p.image_url) && (
                        <img 
                          src={getImageUrl(p.image_urls?.[0] || p.image_url || '', 'thumb')} 
                          alt={p.name} 
                          className="w-full h-full object-cover" 
                          onError={handleImageError}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-charcoal truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-charcoal/40 text-xs italic text-center py-2">Inventory levels are currently optimal.</p>
          )}
        </div>
        <div className="divide-y divide-charcoal/5">
          {liveFeed.length === 0 ? (
            <div className="p-8 text-center text-charcoal/40 text-sm">Waiting for incoming transactions...</div>
          ) : (
            liveFeed.map(order => (
              <div key={order.id} className="p-4 px-6 hover:bg-ivory/30 transition-colors flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-charcoal/5 w-10 h-10 flex items-center justify-center rounded-full text-charcoal/60 font-medium text-sm">
                    {order.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-charcoal">{order.customer_name}</p>
                    <p className="text-xs text-charcoal/60">{order.customer_phone} • {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatKES(order.total_amount_kes)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-charcoal/40">{order.items.length} item(s)</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
