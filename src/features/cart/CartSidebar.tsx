import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../hooks/useCartStore';
import { formatKES } from '../../lib/utils';
import { getImageUrl, handleImageError } from '../../lib/imageHelpers';
import { X, Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { items, isCartOpen, setCartOpen, removeItem, addItem } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleClose = () => setCartOpen(false);

  const total = items.reduce((sum, item) => {
    const price = item.product.is_promotional && item.product.promo_price_kes 
      ? item.product.promo_price_kes 
      : item.product.price_kes;
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    setCartOpen(false);
    setTimeout(() => {
      navigate('/checkout');
      setIsCheckingOut(false);
    }, 300);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[90] transition-opacity"
        onClick={handleClose}
      />
      
      <div 
        data-testid="cart-sidebar" 
        className="fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300 border-l border-charcoal/5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-charcoal/5">
          <h2 className="font-serif text-[22px] flex items-center gap-3 text-charcoal">
            Your Bag
            <span className="bg-ivory text-charcoal text-[11px] font-sans px-2.5 py-1 tracking-[0.1em] font-medium">
              {items.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
            </span>
          </h2>
          <button onClick={handleClose} className="p-2 text-charcoal/40 hover:text-charcoal transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-grow overflow-y-auto px-6 py-6 no-scrollbar">
          {items.length === 0 ? (
            <div data-testid="cart-empty" className="flex flex-col items-center justify-center h-full text-charcoal/40 font-serif space-y-6">
              <ShoppingBag className="w-16 h-16 stroke-[0.5]" />
              <p className="text-[20px] italic">Your bag is empty.</p>
              <button 
                onClick={handleClose}
                className="mt-4 border-b border-gold text-gold text-[11px] uppercase tracking-widest pb-1 font-sans"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item, idx) => {
                const price = item.product.is_promotional && item.product.promo_price_kes 
                              ? item.product.promo_price_kes 
                              : item.product.price_kes;
                const heroImage = item.product.image_url 
                                  ? getImageUrl(item.product.image_url, 'thumb') 
                                  : undefined;
                return (
                  <div key={`${item.product.id}-${item.selectedSize}-${idx}`} data-testid="cart-item" className="flex gap-5 border-b border-charcoal/5 pb-8 last:border-0 last:pb-0">
                    {/* Item Image */}
                    <div className="w-[90px] aspect-[3/4] bg-ivory shrink-0 border border-charcoal/5 group cursor-pointer" onClick={() => { handleClose(); navigate(`/product/${item.product.slug}`); }}>
                      {heroImage ? (
                        <img src={heroImage} alt={item.product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" onError={handleImageError} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-charcoal/30 uppercase tracking-widest font-sans">
                          No Img
                        </div>
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-grow flex flex-col py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-1 font-sans">{item.product.category}</p>
                          <h3 className="font-serif text-[17px] text-charcoal leading-tight cursor-pointer hover:text-gold transition-colors" onClick={() => { handleClose(); navigate(`/product/${item.product.slug}`); }}>
                            {item.product.name}
                          </h3>
                        </div>
                        <button 
                          data-testid="remove-cart-item"
                          onClick={() => removeItem(item.product.id, item.selectedSize)}
                          className="text-charcoal/30 hover:text-charcoal transition-colors p-1 -mt-1 -mr-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 text-[11px] text-charcoal/50 uppercase tracking-[0.1em] font-sans">
                        Size: <span className="text-charcoal font-medium">{item.selectedSize}</span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-auto pt-4">
                        <div className="flex items-center border border-charcoal/15 bg-white">
                          <button 
                            onClick={() => {
                              if (item.quantity > 1) {
                                addItem({ ...item, quantity: -1 });
                              } else {
                                removeItem(item.product.id, item.selectedSize);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:bg-ivory transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-[12px] font-medium text-center text-charcoal font-sans">{item.quantity}</span>
                          <button 
                            onClick={() => addItem({ ...item, quantity: 1 })}
                            className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:bg-ivory transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-serif font-medium text-[16px] text-charcoal">{formatKES(price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-charcoal/10 bg-ivory/50 px-6 py-6 pb-safe">
            <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.15em] text-charcoal/60 font-sans justify-center bg-white p-2 border border-charcoal/5">
              <ShieldCheck className="w-4 h-4 text-gold" />
              Secure Checkout & Data Protection
            </div>
            
            <div className="flex justify-between items-end mb-6">
              <span className="font-serif text-[18px] text-charcoal/60">Subtotal</span>
              <div className="text-right">
                <span data-testid="cart-total" className="font-serif text-[26px] text-charcoal block leading-none">{formatKES(total)}</span>
                <span className="text-[10px] text-charcoal/40 uppercase tracking-[0.1em] font-sans mt-1 block">
                  Taxes and shipping calculated at checkout
                </span>
              </div>
            </div>
            
            <button
              data-testid="checkout-btn"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full h-[56px] flex items-center justify-center bg-charcoal text-white text-[12px] uppercase tracking-[0.2em] font-sans font-bold hover:bg-gold transition-colors disabled:opacity-50"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
