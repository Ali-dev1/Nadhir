export type KanzuStyle = 'Omani' | 'Moroccan' | 'Saudi' | 'Emirati' | 'Arab Perfumes';
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
  price_kes: number;
  compare_price_kes: number | null;
  image_url: string | null;
  image_urls: string[];
  category: KanzuStyle;
  sizes_available: number[];
  fabric: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_promotional: boolean;
  promo_price_kes: number | null;
  tags: string[];
}

export type Role = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price_kes: number;
  size: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  delivery_notes: string | null;
  status: OrderStatus;
  subtotal_kes: number;
  delivery_fee_kes: number;
  total_amount_kes: number;
  items: OrderItem[];
  payment_method: string;
  payment_reference: string | null;
  payment_status: PaymentStatus;
}

export interface OrderPayload {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  delivery_notes: string | null;
  status: OrderStatus;
  subtotal_kes: number;
  delivery_fee_kes: number;
  total_amount_kes: number;
  items: OrderItem[];
  payment_method: string;
  payment_status: PaymentStatus;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: number;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Refund {
  id: string;
  order_id: string;
  amount_kes: number;
  reason: string | null;
  refunded_by: string;
  created_at: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StoreSettings {
  id: string;
  hero_headline: string;
  hero_subtext: string;
  about_us_text: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  tiktok_url: string;
  faq_json: FAQItem[];
  maintenance_mode: boolean;
  is_live: boolean;
  updated_at: string;
}
