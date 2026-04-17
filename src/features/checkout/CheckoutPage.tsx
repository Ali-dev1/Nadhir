import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../hooks/useCartStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { formatKES } from '../../lib/utils';
import { ShoppingBag, Truck, CreditCard, ArrowLeft, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { NadhirService } from '../../services/api';
import type { OrderStatus, PaymentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';

const DELIVERY_FEE = 300;

function formatPhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('+254')) return cleaned.slice(1);
  return cleaned;
}

function isValidKenyanPhone(phone: string): boolean {
  return /^(07|01)[0-9]{8}$/.test(phone);
}

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCartStore();
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    email: userProfile?.email || '',
    deliveryAddress: '',
    deliveryNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'initiated' | 'waiting' | 'success' | 'failed'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const stkEnabled = import.meta.env.VITE_ENABLE_STK_PUSH === 'true';
  const [paymentMethod, setPaymentMethod] = useState(stkEnabled ? 'mpesa_stk' : 'mpesa_manual');

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.is_promotional && item.product.promo_price_kes
      ? item.product.promo_price_kes
      : item.product.price_kes;
    return sum + price * item.quantity;
  }, 0);
  const total = subtotal + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-charcoal/20 mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-serif text-charcoal mb-4">Your bag is empty</h2>
        <p className="text-charcoal/60 mb-8">Add items to your bag before checking out.</p>
        <Link to="/" className="btn-primary">Browse Collection</Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidKenyanPhone(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid Kenyan number (07XX or 01XX)';
    }
    if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pollPaymentStatus = async (checkoutId: string, maxAttempts = 120) => {
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      setPollCount(attempts);
      try {
        const data = await NadhirService.pollOrderStatus(checkoutId);
        if (data.payment_status === 'paid') {
          clearInterval(pollInterval);
          setPaymentState('success');
          setTimeout(() => {
            clearCart();
            navigate(`/order-confirmation/${data.id}`);
          }, 1500);
          return;
        }
        if (data.payment_status === 'failed') {
          clearInterval(pollInterval);
          setPaymentState('failed');
          setPaymentError('Payment was declined. Please try again.');
          return;
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPaymentState('failed');
          setPaymentError('Payment verification timed out.');
        }
      } catch (err) {
        if (attempts >= maxAttempts) clearInterval(pollInterval);
      }
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (paymentMethod === 'mpesa_stk') {
      setPaymentState('initiated'); // Show the "Review & Confirm" UI
    } else {
      await handleFinalConfirm();
    }
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const phone = formatPhone(formData.phone.trim());
      const orderPayload = {
        customer_name: formData.fullName.trim(),
        customer_phone: phone,
        customer_email: formData.email.trim() || null,
        delivery_address: formData.deliveryAddress.trim(),
        delivery_notes: formData.deliveryNotes.trim() || null,
        subtotal_kes: subtotal,
        delivery_fee_kes: DELIVERY_FEE,
        total_amount_kes: total,
        status: 'pending' as OrderStatus,
        payment_method: paymentMethod,
        payment_status: 'unpaid' as PaymentStatus,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price_kes: item.product.is_promotional && item.product.promo_price_kes
            ? item.product.promo_price_kes
            : item.product.price_kes,
          size: item.selectedSize,
        })),
      };

      const data = await NadhirService.createOrder(orderPayload);
      setOrderId(data.id);
      
      if (paymentMethod === 'mpesa_stk') {
        const stkData = await NadhirService.initiateStkPush(data.id, phone, total);
        setPaymentState('waiting');
        setIsSubmitting(false);
        await pollPaymentStatus(stkData.checkoutRequestId);
      } else {
        setPaymentState('success');
        setTimeout(() => {
          clearCart();
          navigate(`/order-confirmation/${data.id}`);
        }, 1500);
      }
    } catch (err: unknown) {
      console.error("[CheckoutPage] Critical Error:", err);
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setPaymentState('idle');
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setPaymentState('waiting');
    setPaymentError(null);
    try {
      const phone = formatPhone(formData.phone.trim());
      const stkData = await NadhirService.initiateStkPush(orderId, phone, total);
      await pollPaymentStatus(stkData.checkoutRequestId);
    } catch (err: any) {
      setPaymentState('failed');
      setPaymentError(err.message || 'Retry failed.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 antialiased">
      {/* Review & Final Confirmation Overlay */}
      {paymentState === 'initiated' && (
        <div data-testid="mpesa-review-modal" className="fixed inset-0 bg-charcoal/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 md:p-12 border border-charcoal/10 shadow-2xl max-w-lg w-full">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-gold" />
              </div>
            </div>
            <h2 className="text-3xl font-serif text-charcoal text-center mb-4">Review Your Payment</h2>
            <p className="text-charcoal/60 text-center mb-10 leading-relaxed">
              We are ready to send an M-PESA prompt to your phone. Please verify the details below before we proceed.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center pb-4 border-b border-charcoal/5">
                <span className="text-charcoal/40 text-sm uppercase tracking-widest">Phone Number</span>
                <span className="text-charcoal font-bold font-mono">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-charcoal/5">
                <span className="text-charcoal/40 text-sm uppercase tracking-widest">Amount to Pay</span>
                <span className="text-xl font-serif text-charcoal">{formatKES(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                data-testid="place-order-btn"
                onClick={handleFinalConfirm}
                isLoading={isSubmitting}
                variant="secondary"
                size="lg"
                className="w-full h-16"
              >
                Send M-PESA Prompt
              </Button>
              <Button 
                onClick={() => setPaymentState('idle')}
                variant="ghost"
                className="w-full text-charcoal/40 hover:text-charcoal"
              >
                Go Back & Edit
              </Button>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-charcoal/30 uppercase tracking-[0.2em] leading-relaxed">
              Securely processed via Safaricom Daraja API
            </p>
          </div>
        </div>
      )}

      {/* Payment waiting overlay */}
      {paymentState === 'waiting' && (
        <div className="fixed inset-0 bg-charcoal/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-fade-in px-6">
          <div className="relative flex justify-center items-center mb-12 w-28 h-28">
            <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 bg-gold/30 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute inset-4 bg-gold rounded-full flex items-center justify-center z-10 shadow-[0_0_30px_rgba(201,168,76,0.6)]">
               <Smartphone className="w-8 h-8 text-charcoal animate-pulse" />
            </div>
          </div>
          <h2 className="text-[28px] md:text-[34px] font-serif text-gold mb-4 tracking-wide text-center">Awaiting M-PESA</h2>
          <p className="text-ivory/80 text-[14px] md:text-[16px] text-center max-w-[340px] leading-relaxed mb-10 font-light">
            Please check your phone <span className="text-ivory font-bold">{formData.phone}</span>.<br /> Enter your M-PESA PIN to securely authorize the payment.
          </p>
          <div className="flex flex-col items-center gap-4">
             <div className="flex gap-3">
               {[0,1,2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
               ))}
             </div>
             <p className="text-[9px] text-ivory/40 uppercase tracking-[0.2em] font-sans mt-4">Validating Request {pollCount}/120</p>
          </div>
        </div>
      )}

      {/* Payment success overlay */}
      {paymentState === 'success' && (
        <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center animate-fade-in">
          <div className="text-center max-w-sm px-6">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-8 animate-scale-in-out" />
            <h2 className="text-4xl font-serif text-charcoal mb-4">Payment Confirmed</h2>
            <p className="text-charcoal/50 leading-relaxed mb-8">
              Thank you for choosing Nadhir Thobes. Your artisan pieces are now being prepared for delivery.
            </p>
            <Loader size="sm" variant="inline" message="Generating your receipt..." />
          </div>
        </div>
      )}

      {/* Normal checkout form — only show when not in payment flow */}
      {paymentState === 'idle' && (
        <>
          <Link to="/" className="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal mb-10 text-xs uppercase tracking-widest transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Store
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-12 tracking-tight">Checkout</h1>

          <form data-testid="checkout-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              {/* Left: Form */}
              <div className="lg:col-span-3 space-y-12">
                {/* Delivery Details */}
                <div className="space-y-8">
                  <h2 className="text-xl font-serif text-charcoal flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gold" /> Delivery Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      data-testid="checkout-name"
                      label="Full Name *"
                      value={formData.fullName}
                      onChange={e => updateField('fullName', e.target.value)}
                      error={errors.fullName}
                      placeholder="The Sultan"
                    />
                    <Input
                      data-testid="checkout-phone"
                      label="Phone Number *"
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      error={errors.phone}
                      errorTestId="phone-error"
                      placeholder="07XX XXX XXX"
                    />
                  </div>

                  <Input
                    label="Email (optional)"
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    error={errors.email}
                    placeholder="nadhirthobes@gmail.com"
                  />

                  <Input
                    data-testid="checkout-address"
                    label="Delivery Address *"
                    isTextArea
                    value={formData.deliveryAddress}
                    onChange={e => updateField('deliveryAddress', e.target.value)}
                    error={errors.deliveryAddress}
                    placeholder="Area, Apartment name, House number"
                    rows={3}
                  />

                  <Input
                    label="Special Instructions (optional)"
                    isTextArea
                    value={formData.deliveryNotes}
                    onChange={e => updateField('deliveryNotes', e.target.value)}
                    placeholder="Gate code, specific landmarks, preferred hours..."
                    rows={2}
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-6 pt-6 border-t border-charcoal/5">
                  <h2 className="text-xl font-serif text-charcoal flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gold" /> Payment Method
                  </h2>

                  <div className="space-y-4">
                    {stkEnabled && (
                      <label className={`flex items-start p-5 border cursor-pointer transition-all ${paymentMethod === 'mpesa_stk' ? 'border-gold bg-gold/5' : 'border-charcoal/10 hover:border-charcoal/30'}`}>
                        <div className="flex items-center h-5 mt-0.5">
                          <input type="radio" name="paymentMethod" value="mpesa_stk" checked={paymentMethod === 'mpesa_stk'} onChange={() => setPaymentMethod('mpesa_stk')} className="w-4 h-4 text-gold focus:ring-gold border-gray-300" />
                        </div>
                        <div className="ml-4">
                          <span className="block text-sm font-bold text-charcoal">M-PESA Express</span>
                          <span className="block text-xs text-charcoal/50 mt-1">Receive a prompt on your phone instantly</span>
                        </div>
                      </label>
                    )}

                    <label className={`flex items-start p-5 border cursor-pointer transition-all ${paymentMethod === 'mpesa_manual' ? 'border-gold bg-gold/5' : 'border-charcoal/10 hover:border-charcoal/30'}`}>
                      <div className="flex items-center h-5 mt-0.5">
                        <input type="radio" name="paymentMethod" value="mpesa_manual" checked={paymentMethod === 'mpesa_manual'} onChange={() => setPaymentMethod('mpesa_manual')} className="w-4 h-4 text-gold focus:ring-gold border-gray-300" />
                      </div>
                      <div className="ml-4">
                        <span className="block text-sm font-bold text-charcoal">Pay via M-PESA</span>
                        <span className="block text-xs text-charcoal/50 mt-1">Send money manually to our Till Number</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-5 border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-charcoal/10 hover:border-charcoal/30'}`}>
                      <div className="flex items-center h-5 mt-0.5">
                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-gold focus:ring-gold border-gray-300" />
                      </div>
                      <div className="ml-4">
                        <span className="block text-sm font-bold text-charcoal">Pay on Delivery</span>
                        <span className="block text-xs text-charcoal/50 mt-1">Pay with cash or M-PESA when your order arrives</span>
                      </div>
                    </label>
                  </div>
                </div>

                {submitError && (
                  <div className="p-5 bg-rose-50 text-rose-600 text-sm border border-rose-100 flex items-center gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-2">
                <div data-testid="checkout-summary" className="bg-white p-8 border border-charcoal/10 shadow-xl sticky top-28">
                  <h2 className="text-xl font-serif text-charcoal mb-8 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gold" /> Order Summary
                  </h2>

                  <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item, idx) => {
                      const price = item.product.is_promotional && item.product.promo_price_kes
                        ? item.product.promo_price_kes
                        : item.product.price_kes;
                      return (
                        <div key={idx} className="flex gap-4 border-b border-charcoal/5 pb-6 last:border-0 last:pb-0">
                          <div className="w-16 h-20 bg-charcoal/5 shrink-0">
                            {item.product.image_url && (
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-serif text-charcoal truncate">{item.product.name}</p>
                              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">Size {item.selectedSize} × {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-gold">
                              {formatKES(price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-charcoal/10 pt-6 space-y-4">
                    <div className="flex justify-between text-sm text-charcoal/50">
                      <span>Subtotal</span>
                      <span>{formatKES(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-charcoal/50">
                      <span>Express Delivery</span>
                      <span>{formatKES(DELIVERY_FEE)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-serif text-charcoal pt-4 border-t border-charcoal/5">
                      <span>Total</span>
                      <span className="text-gold">{formatKES(total)}</span>
                    </div>
                  </div>

                  <Button
                    data-testid="place-order-btn"
                    type="submit"
                    className="w-full h-16 mt-8"
                    size="lg"
                    isLoading={isSubmitting}
                  >
                    {paymentMethod === 'mpesa_stk' ? 'Proceed to Payment' : 'Place Order'}
                  </Button>

                  <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex gap-2 items-center text-[10px] text-charcoal/30 uppercase tracking-[0.2em]">
                      <CreditCard className="w-3 h-3" /> Secure Checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </>
      )}

      {/* Payment failed state */}
      {paymentState === 'failed' && (
        <div className="max-w-2xl mx-auto py-12">
          <Button 
            variant="ghost" 
            onClick={() => setPaymentState('idle')}
            className="mb-10 text-charcoal/40 hover:text-charcoal px-0"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Review Details
          </Button>

          <div className="bg-white p-10 border border-charcoal/10 shadow-2xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-charcoal">Payment Required</h2>
                <p className="text-charcoal/40 text-sm mt-1 uppercase tracking-widest">
                  Transaction Reference #{orderId?.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 p-6 mb-10 text-center">
              <p className="text-rose-700 italic font-medium leading-relaxed">
                {paymentError || 'The M-PESA transaction was not completed. This often happens if the PIN wasn’t entered or the prompt expired.'}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleRetryPayment}
                className="w-full h-16"
                variant="secondary"
                size="lg"
              >
                Request New M-PESA Prompt
              </Button>
              <Link to="/faq#payment" className="block text-center text-xs text-charcoal/30 hover:text-charcoal uppercase tracking-widest py-4">
                Payment Help & Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
