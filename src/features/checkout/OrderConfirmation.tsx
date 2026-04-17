import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatKES } from '../../lib/utils';
import { CheckCircle, MessageCircle, Package, Loader2 } from 'lucide-react';
import type { Order } from '../../types';

const STORE_PHONE = '254799999355'; // Replace with your actual WhatsApp number

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (error) throw error;
        setOrder(data as Order);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif text-charcoal mb-4">Order not found</h2>
        <p className="text-charcoal/60 mb-6">We couldn't find this order. Please check the link.</p>
        <Link to="/" className="btn-primary">Back to Store</Link>
      </div>
    );
  }

  const shortId = order.id.slice(-8).toUpperCase();
  const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(`Hi, my order ID is ${shortId}`)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-10">
        {/* Animated checkmark */}
        <div className="relative w-[100px] h-[100px] mx-auto mb-8">
          <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping opacity-30" />
          <div className="relative w-full h-full bg-gold/10 rounded-full flex items-center justify-center shadow-lg border border-gold/20">
            <CheckCircle className="w-12 h-12 text-gold animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={1} />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-3">Order Placed!</h1>
        <p className="text-charcoal/60">Thank you for shopping with Nadhir Thobes.</p>
      </div>

      <div className="bg-white border border-charcoal/10 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-charcoal/10">
          <div>
            <p className="text-xs text-charcoal/40 uppercase tracking-widest mb-1">Order ID</p>
            <p className="text-xl font-serif text-charcoal">#{shortId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-charcoal/40 uppercase tracking-widest mb-1">Status</p>
            <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-charcoal">
                {item.quantity}× {item.name}
                <span className="text-charcoal/50 ml-2">Size {item.size}</span>
              </span>
              <span className="text-charcoal/70">{formatKES(item.price_kes * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-charcoal/10 pt-4 space-y-2">
          {order.subtotal_kes && (
            <div className="flex justify-between text-sm text-charcoal/60">
              <span>Subtotal</span>
              <span>{formatKES(order.subtotal_kes)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-charcoal/60">
            <span>Delivery</span>
            <span>{formatKES(order.delivery_fee_kes || 300)}</span>
          </div>
          <div className="flex justify-between text-lg font-serif text-charcoal pt-2 border-t border-charcoal/10">
            <span>Total</span>
            <span className="text-gold">{formatKES(order.total_amount_kes)}</span>
          </div>
        </div>
      </div>

      {order.payment_method === 'mpesa_manual' && (
        <div className="bg-gold/10 border border-gold/30 p-6 mb-6 text-center">
          <h3 className="text-lg font-serif text-charcoal mb-2">Complete Your Payment</h3>
          <p className="text-charcoal/70 text-sm mb-4">Please pay via M-PESA Till Number:</p>
          <div className="inline-block bg-white border border-gold py-3 px-8 text-2xl font-bold tracking-widest text-charcoal mb-4">
            999999
          </div>
          <p className="text-xs text-charcoal/50">Send a WhatsApp message with the receipt to confirm your order.</p>
        </div>
      )}

      {order.payment_method === 'cod' && (
        <div className="bg-charcoal/5 p-6 text-center text-sm text-charcoal/70 mb-6">
          <h3 className="text-lg font-serif text-charcoal mb-2">Pay on Delivery</h3>
          <p className="text-charcoal/70 text-sm">Have the exact amount in cash or M-PESA ready when your package arrives.</p>
        </div>
      )}

      <div className="bg-charcoal/5 p-6 text-center text-sm text-charcoal/70 mb-6">
        <Package className="w-5 h-5 mx-auto mb-2 text-charcoal/40" />
        We'll send updates to <strong className="text-charcoal">{order.customer_phone}</strong>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-primary flex items-center justify-center gap-2 min-h-[48px] bg-green-600 hover:bg-green-700 hover:text-white"
        >
          <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
        </a>
        <Link to="/" className="flex-1 btn-outline text-center min-h-[48px]">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
