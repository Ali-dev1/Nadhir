import React, { useState } from 'react';
import type { Order, OrderStatus } from '../../types';
import { formatKES } from '../../lib/utils';
import { X, Printer, MessageSquare, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
}

const STEPS: { label: string; value: OrderStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
];

export const OrderDetailsModal: React.FC<Props> = ({ isOpen, onClose, order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const currentStepIdx = STEPS.findIndex(s => s.value === order.status);
  const isCancelled = order.status === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppNotify = () => {
    const shortId = order.id.split('-')[0].toUpperCase();
    const name = order.customer_name.split(' ')[0];
    const message = `Hi ${name}, your Nadhir Thobes order #${shortId} is on its way! 🚚\n\nTrack your order status: https://nadhir.vercel.app/order/${order.id}\n\nQuestions? Reply to this message.`;
    const encodedMsg = encodeURIComponent(message);
    const phone = order.customer_phone.replace(/\+/g, '').replace(/\s/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (updating) return;
    try {
      setUpdating(true);
      await onStatusUpdate(order.id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-ivory w-full max-w-2xl shadow-xl border border-charcoal/10 print:shadow-none print:border-none print:max-w-none relative print:w-[10cm] print:m-0 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-charcoal/10 bg-white sticky top-0 z-10 print:hidden">
          <div className="flex flex-col">
            <h2 className="text-xl font-serif text-charcoal tracking-wide">Order Artifact #{order.id.split('-')[0].toUpperCase()}</h2>
            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">Authenticated Boutique Record</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-charcoal/30 hover:text-charcoal transition-colors"
              title="Print Label"
            >
              <Printer size={20}/>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-charcoal/30 hover:text-red-500 transition-colors"
            >
              <X size={20}/>
            </button>
          </div>
        </div>
 
        <div className="overflow-y-auto flex-grow custom-scrollbar">
          {/* VISUAL STEPPER */}
          {!isCancelled && (
            <div className="p-8 bg-white border-b border-charcoal/5 print:hidden">
              <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-8 text-center">Logistics Pipeline</p>
              <div className="flex justify-between items-center relative max-w-md mx-auto">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-charcoal/5 -z-0" />
                {STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  
                  return (
                    <button
                      key={step.value}
                      disabled={updating}
                      onClick={() => handleStatusChange(step.value)}
                      className="relative z-10 flex flex-col items-center group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isCompleted ? 'bg-gold border-gold text-charcoal' :
                        isActive ? 'bg-charcoal border-charcoal text-gold scale-110 shadow-lg' :
                        'bg-white border-charcoal/10 text-charcoal/20 group-hover:border-gold group-hover:text-gold'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={18} /> : 
                         isActive ? <Circle size={14} fill="currentColor" /> :
                         <span className="text-[10px] font-bold">{idx + 1}</span>}
                      </div>
                      <span className={`absolute -bottom-8 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.15em] transition-colors ${
                        isActive ? 'text-charcoal' : 'text-charcoal/30 group-hover:text-gold'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="h-10" />
            </div>
          )}

          {isCancelled && (
            <div className="p-8 bg-red-50/50 border-b border-red-100 flex items-center justify-center gap-4 print:hidden">
              <Badge label="ORDER VOID / CANCELLED" variant="error" />
              <button 
                onClick={() => handleStatusChange('pending')}
                className="text-[10px] font-bold text-charcoal/40 hover:text-charcoal uppercase tracking-widest flex items-center gap-2 transition-colors"
                disabled={updating}
              >
                Re-activate Order
              </button>
            </div>
          )}

          {/* Details Content */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
               <div className="bg-white p-6 border border-charcoal/5 shadow-sm rounded-sm">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4">Vested Client</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-serif text-charcoal leading-none mb-1">{order.customer_name}</p>
                    <p className="text-xs text-charcoal/40 font-mono italic">{order.customer_email}</p>
                  </div>
                  <div className="flex flex-col gap-1 pt-3 border-t border-charcoal/5">
                    <span className="text-[9px] text-charcoal/30 uppercase font-bold tracking-[0.2em]">Contact</span>
                    <a href={`tel:${order.customer_phone}`} className="text-xs text-gold font-bold hover:underline">{order.customer_phone}</a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border border-charcoal/5 shadow-sm rounded-sm">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4">Transaction Artifact</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-charcoal/40">Method</span>
                    <span className="font-bold uppercase tracking-widest border-b border-gold/30">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-charcoal/40">Status</span>
                    <Badge label={order.payment_status} variant={order.payment_status === 'paid' ? 'success' : 'error'} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-charcoal/40">Total Value</span>
                    <span className="text-lg font-serif text-charcoal">{formatKES(order.total_amount_kes)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-charcoal/5 shadow-sm rounded-sm">
               <div className="flex justify-between items-end mb-6">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Inventory Log</p>
                <span className="text-[10px] text-charcoal/30 uppercase tracking-widest">{order.items.length} units total</span>
               </div>
               <div className="divide-y divide-charcoal/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ivory flex items-center justify-center text-charcoal/20 font-serif border border-charcoal/5">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal uppercase tracking-wide">{item.name}</p>
                        <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">Size {item.size} • Qty {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
               </div>
            </div>

            <div className="bg-charcoal text-ivory p-8 rounded-sm shadow-xl print:m-0 print:text-charcoal print:bg-white print:p-0 print:shadow-none print:border-t-2 print:border-dashed print:border-charcoal/20">
               <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-6 px-1">Logistics Coordination</p>
               <div className="space-y-6">
                  <div className="bg-ivory/5 p-5 border border-ivory/5 print:bg-white print:border-charcoal/10">
                    <p className="text-[9px] text-ivory/40 uppercase tracking-[0.3em] mb-2 font-bold">Delivery Protocol</p>
                    <p className="text-sm font-light leading-relaxed tracking-wide italic">{order.delivery_address || 'Collection at Boutique Required'}</p>
                  </div>
                  {order.delivery_notes && (
                    <div className="px-1">
                      <p className="text-[9px] text-ivory/40 uppercase tracking-[0.3em] mb-2 font-bold">Special Memoranda</p>
                      <p className="text-xs text-ivory/60 italic font-serif leading-relaxed">"{order.delivery_notes}"</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-charcoal/10 bg-white flex justify-between items-center print:hidden">
          <button 
            onClick={onClose}
            className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-charcoal transition-colors"
          >
            Close Artifact
          </button>
          <div className="flex gap-3">
             <Button
                onClick={handleWhatsAppNotify}
                variant="primary"
                size="sm"
                className="h-11 px-8 text-[10px] tracking-widest"
                disabled={updating}
                 leftIcon={<MessageSquare size={14} />}
             >
                Concierge Dispatch
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
