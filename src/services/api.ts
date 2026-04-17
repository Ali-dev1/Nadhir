import { supabase } from '../lib/supabase';
import type { Product, Order, OrderPayload, OrderStatus, StoreSettings, Category } from '../types';

export const NadhirService = {
  /**
   * PRODUCTS
   */
  async getProducts(): Promise<Product[]> {
    // Try cache first
    const cached = localStorage.getItem('nadhir_products');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 2 minutes for products (more frequent updates than settings)
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          return data;
        }
      } catch {
        localStorage.removeItem('nadhir_products');
      }
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, category, price_kes, image_url, image_urls, is_promotional, promo_price_kes, stock_quantity, low_stock_threshold, sizes_available')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const products = (data as unknown as Product[]) || [];

    // Update cache
    localStorage.setItem('nadhir_products', JSON.stringify({
      data: products,
      timestamp: Date.now()
    }));

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * CATEGORIES
   */
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCategory(payload: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * ORDERS
   */
  async createOrder(payload: OrderPayload): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  },

  async updateOrderArchived(orderId: string, archived: boolean): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq('id', orderId);

    if (error) throw error;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async initiateStkPush(orderId: string, phone: string, amount: number): Promise<{ checkoutRequestId: string }> {
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: { orderId, phone, amount }
    });

    if (error) throw error;
    return data;
  },

  async pollOrderStatus(checkoutId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('payment_status, id, customer_name')
      .eq('mpesa_checkout_request_id', checkoutId)
      .single();

    if (error) throw error;
    return data as Order;
  },

  async recordRefund(orderId: string, amount: number, reason: string): Promise<void> {
    const { error: refundError } = await supabase.from('refunds').insert([{
      order_id: orderId,
      amount_kes: amount,
      reason: reason || 'Customer refund',
    }]);

    if (refundError) throw refundError;

    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: 'refunded', status: 'cancelled' })
      .eq('id', orderId);

    if (orderError) throw orderError;
  },

  /**
   * STORE SETTINGS (CMS)
   */
  async getStoreSettings(): Promise<StoreSettings | null> {
    // Try cache first
    const cached = localStorage.getItem('nadhir_settings');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      } catch {
        localStorage.removeItem('nadhir_settings');
      }
    }

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // If table doesn't exist yet or no row, return null gracefully
      if (error.code === 'PGRST116' || error.code === '42P01') return null;
      throw error;
    }

    // Update cache
    localStorage.setItem('nadhir_settings', JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data as StoreSettings;
  },

  async updateStoreSettings(updates: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>): Promise<void> {
    // Clear cache on update
    localStorage.removeItem('nadhir_settings');

    // Get the single row's ID first
    const { data: existing } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existing) throw new Error('Store settings row not found. Run the SQL seed script first.');

    const { error } = await supabase
      .from('store_settings')
      .update(updates)
      .eq('id', existing.id);

    if (error) throw error;
  }
};
