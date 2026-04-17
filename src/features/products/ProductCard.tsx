import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatKES } from '../../lib/utils';
import { getImageUrl, getProductImages, handleImageError } from '../../lib/imageHelpers';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../hooks/useCartStore';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  
  const defaultSize = product.sizes_available?.[0] || 0;
  const images = getProductImages(product);
  const hasMultipleImages = images.length > 1;
  const isOutOfStock = product.stock_quantity <= 0;

  // Touch/swipe support
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // Auto-advance on hover OR touch hold
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      intervalRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % images.length);
      }, 3000); // Spec requested 3s auto-advance
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, hasMultipleImages, images.length]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addItem({ product, quantity: 1, selectedSize: defaultSize });
    setAdded(true);
    
    // Quick success animation
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const currentImage = images[activeIndex] || null;

  return (
    <div 
      data-testid="product-card" 
      data-category={product.category}
      className="group flex flex-col bg-white overflow-hidden transition-all duration-300 md:hover:shadow-[0_8px_32px_rgba(28,28,30,0.12)] border-0 md:border md:border-transparent cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setActiveIndex(0); }}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <div
        className="relative bg-ivory overflow-hidden w-full"
        style={{ aspectRatio: '3/4' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/product/${product.slug}`} className="block w-full h-full relative">
          {currentImage ? (
            <>
              {/* Blurred Backstop to gracefully handle mixed aspect ratios */}
              <img 
                src={getImageUrl(currentImage, 'card')} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-110 select-none"
                aria-hidden="true"
              />
              {/* Crisp Foreground Image */}
              <img 
                data-testid="main-product-image"
                src={getImageUrl(currentImage, 'card')} 
                alt={`${product.name} thumbnail`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-[center_20%] transition-transform duration-[600ms] ease-out group-hover:scale-105 active:scale-105"
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/20 font-serif text-sm">
              Nadhir Thobes
            </div>
          )}

          {/* Sold Out Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 transition-opacity">
              <span className="text-white text-[11px] uppercase tracking-[0.2em] font-medium" data-testid="out-of-stock-badge">Sold Out</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        {!isOutOfStock && product.is_promotional && (
          <div className="absolute top-2 left-2 bg-charcoal text-gold px-2 py-1 text-[10px] uppercase tracking-[0.1em] z-10">
            SALE
          </div>
        )}
        {!isOutOfStock && !product.is_promotional && (
          <div className="absolute top-2 left-2 bg-gold text-charcoal px-2 py-1 text-[10px] uppercase tracking-[0.1em] z-10">
            NEW
          </div>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? 'w-1.5 h-1.5 bg-gold'
                    : 'w-1 h-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div className="pt-2.5 pb-3.5 flex flex-col flex-grow relative">
        <Link to={`/product/${product.slug}`} className="block flex-grow">
          <p className="text-[9px] text-gold uppercase tracking-[0.2em] mb-1">{product.category}</p>
          <h3 className="font-serif text-[13px] text-charcoal leading-[1.2] line-clamp-2 pr-6">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-1.5 mt-1.5">
            {product.is_promotional && product.promo_price_kes ? (
              <>
                <span className="font-medium text-[14px] text-gold">{formatKES(product.promo_price_kes)}</span>
                <span className="text-[12px] text-charcoal/40 line-through">{formatKES(product.price_kes)}</span>
              </>
            ) : (
              <span className="font-medium text-[14px] text-gold">{formatKES(product.price_kes)}</span>
            )}
          </div>
        </Link>

        {/* Quick Add To Bag Action */}
        <button 
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="absolute bottom-3.5 right-0 p-1 text-charcoal/40 hover:text-gold transition-colors duration-200"
          aria-label="Add to bag"
        >
          {added ? (
            <CheckCircle2 className="w-5 h-5 text-gold animate-bounce" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
        </button>

        {/* Hover Add to Bag button just for Desktop */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button 
            disabled={isOutOfStock}
            onClick={(e) => {
              handleAddToCart(e);
              setCartOpen(true);
            }}
            className="w-full h-10 bg-charcoal text-ivory text-[11px] tracking-[0.1em] uppercase hover:bg-gold hover:text-charcoal transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
};
