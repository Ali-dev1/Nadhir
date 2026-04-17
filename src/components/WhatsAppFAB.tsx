import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../lib/whatsapp';

const STORE_PHONE = '254799999355';

export const WhatsAppFAB: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  const whatsappUrl = useMemo(() => {
    let context: any = { page: 'home' };

    if (location.pathname.startsWith('/product/')) {
      context = { page: 'product', productName: params.slug?.replace(/-/g, ' ') };
    } else if (location.pathname.startsWith('/checkout')) {
      context = { page: 'checkout' };
    } else if (location.pathname.startsWith('/order-confirmation')) {
      context = { page: 'order-confirmation', orderId: params.orderId };
    } else if (location.pathname === '/collections') {
      context = { page: 'collections' };
    } else if (location.pathname === '/account') {
      context = { page: 'account' };
    }

    return getWhatsAppUrl(STORE_PHONE, context);
  }, [location.pathname, params]);

  const tooltipText = useMemo(() => {
    if (location.pathname.startsWith('/product/')) return "Inquire about this piece";
    if (location.pathname.startsWith('/checkout')) return "Payment Assistance";
    if (location.pathname.startsWith('/order-confirmation')) return "Delivery Support";
    return "Nadhir Concierge";
  }, [location.pathname]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[85px] md:bottom-8 right-5 md:right-8 z-[100] group flex items-center gap-3"
      aria-label="Chat on WhatsApp"
    >
      <div className="bg-white px-5 py-2.5 rounded-full shadow-lg border border-gold/10 scale-0 group-hover:scale-100 transition-all origin-right duration-500 hidden md:block">
        <p className="text-[10px] font-bold text-charcoal uppercase tracking-[0.2em] whitespace-nowrap font-sans">
          {tooltipText}
        </p>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-[#25D366]/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="w-[52px] h-[52px] md:w-14 md:h-14 bg-[#111111] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gold hover:scale-105 transition-all duration-300 relative z-10 border border-white/10 group-hover:text-charcoal">
          <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
    </a>
  );
};
