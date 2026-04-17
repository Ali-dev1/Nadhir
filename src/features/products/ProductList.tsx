import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { SizeGuide } from './SizeGuide';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { formatKES } from '../../lib/utils';
import { Hero } from './Hero';
import { useProducts, type SortOption } from '../../hooks/useProducts';

export const ProductList: React.FC = () => {
  const {
    loading,
    error,
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    filteredProducts,
    clearSearch,
    resetFilters
  } = useProducts();

  const [isGuideOpen, setGuideOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Omani', 'Moroccan', 'Saudi', 'Emirati', 'Arab Perfumes'];

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (showFilters && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFilters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 font-serif text-charcoal/50 italic tracking-widest">Loading Collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-serif">
        <p>Something went wrong loading the collection.</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <div id="collection" className="max-w-[1400px] mx-auto w-full pt-16 pb-24">
        
        {/* PAGE HEADER */}
        <div className="mb-8 px-5">
          <h1 className="text-[28px] md:text-[40px] font-serif text-charcoal text-center leading-[1.1]">The Nadhir Thobes Collection</h1>
          <p className="text-[13px] text-charcoal/50 italic text-center mt-2 font-serif">Impeccable tailoring meets rare fragrances</p>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="mb-6 md:mb-10 w-full overflow-x-auto no-scrollbar border-b border-charcoal/5">
          <div className="flex px-5 space-x-2 md:justify-center min-w-min">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  data-testid={`category-${cat.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 h-[40px] text-[11px] uppercase tracking-[0.15em] font-sans transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-gold text-charcoal border-b-2'
                      : 'border-transparent text-charcoal/40 hover:text-charcoal/70'
                  }`}
                >
                  {cat === 'All' ? 'ALL' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="px-5 mb-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="w-full md:w-[400px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <input
              data-testid="search-input"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, fabric..."
              className="w-full h-[48px] bg-warm-grey pl-12 pr-12 text-[14px] text-charcoal placeholder:text-charcoal/40 font-sans border-b-2 border-transparent focus:border-charcoal focus:bg-white outline-none transition-all rounded-none"
            />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/80 p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex justify-between md:justify-end items-center mt-2 md:mt-0">
            <span className="text-[11px] text-charcoal/40 tracking-[0.05em] uppercase font-sans md:mr-6">
              {filteredProducts.length} pieces
            </span>
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 text-[11px] text-charcoal/60 uppercase tracking-[0.1em] font-sans hover:text-charcoal transition-colors ml-auto md:ml-0"
            >
              FILTERS <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BOTTOM SHEET FILTERS (Mobile & Desktop Overlay) */}
        {showFilters && (
          <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setShowFilters(false)}
            />
            
            {/* Sheet Content */}
            <div className="relative w-full md:w-[480px] bg-white rounded-t-[20px] md:rounded-[0px] h-[60vh] md:h-auto min-h-[400px] max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              {/* Drag Handle (Mobile only) */}
              <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-9 h-1 bg-charcoal/20 rounded-full" />
              </div>
              
              <div className="px-6 py-4 flex justify-between items-center border-b border-charcoal/5">
                <h2 className="text-[16px] font-serif text-charcoal">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 text-charcoal/40 hover:text-charcoal"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-8">
                {/* Sort Order */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50 font-bold mb-4 font-sans">Sort By</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { value: 'newest', label: 'Newest Arrivals' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortBy === opt.value ? 'border-gold bg-gold' : 'border-charcoal/20 group-hover:border-charcoal/40'}`}>
                          {sortBy === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="sort" 
                          value={opt.value} 
                          checked={sortBy === opt.value}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="hidden"
                        />
                        <span className={`text-[14px] font-sans ${sortBy === opt.value ? 'text-charcoal' : 'text-charcoal/70'}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-charcoal/50 font-bold mb-4 font-sans">Price Range</h3>
                  <p className="text-[14px] text-charcoal font-sans mb-4">
                    {formatKES(priceRange[0])} — {formatKES(priceRange[1])}
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      data-testid="price-min-slider"
                      type="range"
                      min={0}
                      max={50000}
                      step={500}
                      value={priceRange[0]}
                      onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="flex-1 accent-gold"
                    />
                    <input
                      data-testid="price-max-slider"
                      type="range"
                      min={0}
                      max={50000}
                      step={500}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="flex-1 accent-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-charcoal/5 bg-white pb-safe flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full h-[52px] bg-gold text-charcoal text-[12px] uppercase tracking-[0.1em] font-sans font-medium"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => { setSortBy('newest'); setPriceRange([0,50000]); }}
                  className="w-full text-center text-[12px] text-charcoal/50 font-sans hover:text-charcoal"
                >
                  Clear settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="px-5 md:px-0 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[24px]">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div data-testid="no-results" className="py-[80px] px-5 text-center flex flex-col items-center justify-center">
            <span className="font-serif text-[48px] text-charcoal/10 mb-4 leading-none">N</span>
            <p className="text-[18px] font-serif text-charcoal/50 italic mb-6">
              {debouncedSearch
                ? `Nothing found for "${debouncedSearch}"`
                : 'No pieces match your aesthetic.'}
            </p>
            <button
              onClick={() => { resetFilters(); setShowFilters(false); }}
              className="text-[13px] text-gold hover:text-charcoal transition-colors underline font-sans"
            >
              Clear search
            </button>
          </div>
        )}

        <SizeGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
      </div>

      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};
