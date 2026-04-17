import React, { useRef } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { Search, X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { formatKES } from '../../lib/utils';
import { SizeGuide } from './SizeGuide';

export const CollectionsPage: React.FC = () => {
  const {
    loading,
    searchInput,
    setSearchInput,
    setSelectedCategory,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    filteredProducts,
    products,
    resetFilters
  } = useProducts();

  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = [
    { 
      id: 'Omani', 
      name: 'Omani Kanzus', 
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=1200',
      count: products.filter(p => p.category === 'Omani').length
    },
    { 
      id: 'Moroccan', 
      name: 'Moroccan Kanzus', 
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07dee3?auto=format&fit=crop&q=80&w=1200',
      count: products.filter(p => p.category === 'Moroccan').length
    },
    { 
      id: 'Arab Perfumes', 
      name: 'Arab Fragrances', 
      image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1200',
      count: products.filter(p => p.category === 'Arab Perfumes').length
    },
    { 
      id: 'All', 
      name: 'All Pieces', 
      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=1200',
      count: products.length
    }
  ];

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 font-serif text-charcoal/50 italic tracking-widest uppercase">Loading Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* HEADER SECTION */}
      <div className="bg-[#111111] h-[180px] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-[32px] md:text-[42px] font-serif text-ivory tracking-wide">The Collection</h1>
        <p className="text-[13px] text-ivory/50 italic mt-3 font-serif max-w-md uppercase tracking-wider">
          Kanzus & Fragrances for the Modern Nairobi Gentleman
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-12">
        {/* CATEGORY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              data-testid="category-card"
              onClick={() => handleCategoryClick(cat.id)}
              className="relative aspect-[3/2] overflow-hidden group cursor-pointer border border-charcoal/5"
            >
              <img 
                src={cat.image} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                 <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] mb-1">
                   {cat.count} PIECES
                 </p>
                 <h3 className="text-[18px] md:text-[22px] font-serif text-white tracking-wide">
                   {cat.name}
                 </h3>
                 <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Now <ChevronRight className="w-3 h-3" />
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div id="collection-grid" ref={gridRef} className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center mb-12 scroll-mt-32">
          <div className="w-full md:w-[400px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input
              data-testid="search-input"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, fabric..."
              className="w-full h-[48px] bg-white border border-charcoal/10 pl-12 pr-12 text-[14px] text-charcoal outline-none focus:border-gold transition-all"
            />
            {searchInput && (
              <button 
                onClick={() => setSearchInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-6">
            <span className="text-[11px] text-charcoal/40 tracking-[0.1em] uppercase font-bold">
              {filteredProducts.length} pieces found
            </span>
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 h-[48px] px-6 bg-white border border-charcoal/10 text-[11px] text-charcoal uppercase tracking-[0.1em] font-bold hover:bg-charcoal hover:text-ivory transition-all"
            >
              FILTERS <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[24px]">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div data-testid="no-results" className="py-32 text-center flex flex-col items-center">
            <p className="text-xl font-serif text-charcoal/40 italic mb-6">
              Nothing matches your current selection.
            </p>
            <button
              onClick={() => resetFilters()}
              className="text-[13px] text-gold hover:text-charcoal transition-colors underline font-sans uppercase tracking-widest font-bold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* FILTER DRAWER - Reuse mobile filter styles */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-full md:w-[480px] bg-white h-[70vh] md:h-auto md:max-h-[80vh] overflow-y-auto flex flex-col p-8 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-serif">Refine Collection</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-12 mb-auto">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-charcoal/40">Sort By</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { val: 'newest', label: 'Newest Arrivals' },
                    { val: 'price-low', label: 'Price: Low to High' },
                    { val: 'price-high', label: 'Price: High to Low' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      onClick={() => setSortBy(opt.val as any)}
                      className={`text-left text-sm uppercase tracking-wider py-1 ${sortBy === opt.val ? 'text-gold font-bold' : 'text-charcoal/60'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-charcoal/40">Price Threshold</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={30000}
                    step={1000}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="flex-1 accent-gold"
                  />
                  <span className="text-sm font-mono min-w-[80px] text-right">{formatKES(priceRange[1])}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowFilters(false)}
              className="mt-12 w-full h-14 bg-charcoal text-ivory text-[11px] uppercase tracking-widest font-bold hover:bg-gold transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      )}

      <SizeGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};
