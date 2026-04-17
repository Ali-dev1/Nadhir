import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { formatKES } from '../../lib/utils';
import { useCartStore } from '../../hooks/useCartStore';
import { getImageUrl, getProductImages, handleImageError } from '../../lib/imageHelpers';
import { 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SizeGuide } from './SizeGuide';
import { ProductCard } from './ProductCard';
import { NadhirService } from '../../services/api';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isGuideOpen, setGuideOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (!slug) return;
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (err) throw err;
        setProduct(data as Product);
        if (data.sizes_available && data.sizes_available.length > 0) {
          setSelectedSize(data.sizes_available[0]);
        }

        // Fetch related products
        try {
          const allProducts = await NadhirService.getProducts();
          const related = allProducts
            .filter(p => p.category === data.category && p.id !== data.id)
            .slice(0, 4);
          setRelatedProducts(related);
        } catch {
          // Ignore related products errors
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-6" />
        <h2 className="text-2xl font-serif text-charcoal mb-4">Product Not Found</h2>
        <p className="text-charcoal/60 mb-8">{error || "We couldn't find the piece you're looking for."}</p>
        <button onClick={() => navigate('/#collection')} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>
      </div>
    );
  }

  const images = getProductImages(product);
  const isOutOfStock = product.stock_quantity <= 0;
  const currentPrice = product.is_promotional && product.promo_price_kes ? product.promo_price_kes : product.price_kes;

  const handleAddToCart = () => {
    if (selectedSize === null || isOutOfStock) return;
    setIsAdding(true);
    addItem({ product, quantity: 1, selectedSize });
    
    // Slight delay to show added state before opening sidebar
    setTimeout(() => {
      setIsAdding(false);
      setCartOpen(true);
    }, 400);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (images.length <= 1) return;

    if (distance > swipeThreshold) {
      setActiveImageIndex(prev => (prev + 1) % images.length);
    } else if (distance < -swipeThreshold) {
      setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
    setTouchStart(null);
  };

  return (
    <div data-testid="product-detail" className="bg-ivory pt-6 pb-[120px] lg:pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar font-sans">
          <span className="hover:text-gold transition-colors cursor-pointer" onClick={() => navigate('/#collection')}>Collection</span>
          <ChevronRight className="w-3 h-3" />
          <span 
            className="hover:text-gold transition-colors cursor-pointer" 
            onClick={() => navigate(`/?category=${product.category}`)}
          >
            {product.category}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal truncate max-w-[150px] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-20">
          {/* Gallery */}
          <div data-testid="product-image-gallery" className="space-y-4">
            <div 
              className="relative aspect-[3/4] bg-ivory border border-charcoal/5 overflow-hidden group select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {images.length > 0 ? (
                <>
                  <img 
                    src={getImageUrl(images[activeImageIndex], 'gallery')} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-110 select-none"
                    aria-hidden="true"
                  />
                  <img 
                    data-testid="main-product-image"
                    src={getImageUrl(images[activeImageIndex], 'gallery')} 
                    alt={product.name} 
                    className="relative w-full h-full object-cover object-[center_20%] transition-transform duration-1000 group-hover:scale-105"
                    loading="eager"
                    onError={handleImageError}
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal/[0.02]">
                  <ShoppingBag className="w-12 h-12 text-charcoal/10 mb-4 stroke-[0.5]" />
                  <div className="text-charcoal/20 font-serif text-[22px] tracking-[0.4em] uppercase">
                    Nadhir
                  </div>
                </div>
              )}
              
              {/* Badges */}
              {product.is_promotional && (
                <div className="absolute top-4 left-4 bg-gold text-white text-[10px] font-sans font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg z-10">
                  Exclusive
                </div>
              )}

              {/* Minimal Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-charcoal text-[9px] font-sans font-bold px-3 py-1.5 shadow z-10 tracking-widest">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
              
              {images.length > 1 && (
                <div className="absolute inset-x-2 lg:inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev - 1 + images.length) % images.length)}
                    className="p-3 bg-white/90 backdrop-blur-sm border border-charcoal/10 rounded-full pointer-events-auto hover:bg-gold hover:text-white transition-all shadow-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev + 1) % images.length)}
                    className="p-3 bg-white/90 backdrop-blur-sm border border-charcoal/10 rounded-full pointer-events-auto hover:bg-gold hover:text-white transition-all shadow-xl"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    data-testid="image-thumbnail"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-[70px] aspect-[3/4] overflow-hidden transition-all flex-shrink-0 relative ${
                      activeImageIndex === idx 
                        ? 'ring-1 ring-gold ring-offset-2 opacity-100' 
                        : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img src={getImageUrl(img, 'thumb')} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-125" />
                    <img src={getImageUrl(img, 'thumb')} alt={`${product.name} ${idx + 1}`} className="relative w-full h-full object-cover object-[center_20%]" onError={handleImageError} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="border-b border-charcoal/10 pb-8 mb-8">
              <p className="text-gold tracking-[0.2em] uppercase text-[10px] mb-3 font-sans">{product.category}</p>
              <h1 data-testid="product-name" className="text-[32px] md:text-[44px] font-serif text-charcoal leading-[1.1] mb-5 tracking-tight">{product.name}</h1>
              
              {/* Price Hierarchy */}
              <div className="flex items-end gap-3">
                <span data-testid="product-price" className="text-[26px] font-serif text-charcoal leading-none">
                  {formatKES(currentPrice)}
                </span>
                {product.is_promotional && product.compare_price_kes && (
                  <span className="text-charcoal/40 line-through text-[16px] font-serif leading-none mb-1">
                    {formatKES(product.compare_price_kes)}
                  </span>
                )}
                {product.is_promotional && product.compare_price_kes && (
                  <span className="text-[10px] bg-red-900/5 text-red-700 px-2 py-1 uppercase tracking-widest font-sans font-bold mb-1 ml-2">
                    Save {Math.round((1 - currentPrice / product.compare_price_kes) * 100)}%
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-10">
              {/* Description */}
              <div>
                <p className="text-[15px] md:text-[16px] text-charcoal/80 leading-[1.8] font-light">
                  {product.description || "Sophomore tailoring meets traditional silhouette. This piece from the Nadhir Thobes collection is crafted with meticulous attention to detail, ensuring comfort and prestige for all formal and spiritual occasions."}
                </p>
              </div>

              {/* Fabric Specs */}
              {product.fabric && (
                <div className="flex items-center gap-3 text-[13px] text-charcoal bg-white border border-charcoal/5 p-4 uppercase tracking-[0.1em] font-sans shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span className="text-charcoal/60">Material:</span> <span className="font-medium text-charcoal">{product.fabric}</span>
                </div>
              )}

              {/* Sizing */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-charcoal/60 font-sans font-medium">Select Size</h3>
                  <button 
                    data-testid="size-guide-btn"
                    onClick={() => setGuideOpen(true)}
                    className="text-[10px] uppercase tracking-[0.1em] text-charcoal hover:text-gold transition-colors flex items-center gap-1.5 font-sans pb-0.5 border-b border-charcoal/20 hover:border-gold"
                  >
                    <HelpCircle className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                
                {product.sizes_available && product.sizes_available.length > 0 && product.sizes_available[0] !== 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.sizes_available.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-[48px] flex items-center justify-center border transition-all text-[15px] font-sans ${
                          selectedSize === size
                            ? 'bg-charcoal text-ivory border-charcoal shadow-md'
                            : 'bg-white border-charcoal/15 text-charcoal hover:border-charcoal/40 hover:bg-ivory/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                   <div className="text-[13px] font-sans text-charcoal/60 italic">Standard Signature Sizing</div>
                )}
              </div>

              {/* Add to Cart Desktop Target */}
              <div id="desktop-add-to-cart" className="pt-4 space-y-4">
                <button
                  data-testid="add-to-cart-btn"
                  disabled={isOutOfStock || selectedSize === null || isAdding}
                  onClick={handleAddToCart}
                  className="w-full h-[60px] bg-charcoal hover:bg-gold text-ivory text-[13px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 disabled:hover:bg-charcoal font-sans"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    isOutOfStock ? 'Currently Out of Stock' : (
                      <>
                        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                        Add to Shopping Bag
                      </>
                    )
                  )}
                </button>
                
                <p className="text-center text-[10px] text-charcoal/40 uppercase tracking-[0.15em] font-sans flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout with M-PESA
                </p>
              </div>

              {/* Luxury Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-charcoal/10">
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-gold shrink-0" strokeWidth={1} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal mb-1.5 font-sans">Premium Shipping</p>
                    <p className="text-[13px] text-charcoal/60 leading-relaxed font-light">Same day delivery via trusted concierges within Nairobi Metropolitan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RotateCcw className="w-6 h-6 text-gold shrink-0" strokeWidth={1} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal mb-1.5 font-sans">Bespoke Returns</p>
                    <p className="text-[13px] text-charcoal/60 leading-relaxed font-light">7-day tailored exchange guarantee for pristine garments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SizeGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />

      {/* Related Products - Horizontal Scroll on Mobile */}
      {relatedProducts.length > 0 && (
        <div className="bg-white py-16 md:py-24 border-t border-charcoal/5 mt-16 md:mt-24">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <h2 className="text-[26px] md:text-[32px] font-serif text-charcoal mb-10 text-center tracking-tight">You May Also Like</h2>
            
            {/* Mobile: Horizontal scroll | Desktop: Grid */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-5 px-5 gap-4">
              {relatedProducts.map(p => (
                <div key={p.id} className="snap-start shrink-0 w-[240px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            <div data-testid="related-products" className="hidden md:grid md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA Bar (Mobile only) */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-charcoal/10 p-4 pb-safe z-40 transition-transform duration-500 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.05)] ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 pr-2">
            <h4 className="text-[12px] font-serif text-charcoal truncate">{product.name}</h4>
            <p className="text-[14px] font-serif text-gold font-medium">{formatKES(currentPrice)}</p>
          </div>
          <button
            disabled={isOutOfStock || selectedSize === null || isAdding}
            onClick={handleAddToCart}
            className="h-[48px] px-8 bg-charcoal hover:bg-gold text-ivory text-[11px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-30 font-sans"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : (isOutOfStock ? 'Sold Out' : 'Add to Bag')}
          </button>
        </div>
      </div>
    </div>
  );
};

