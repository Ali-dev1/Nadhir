import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import { NadhirService } from '../services/api';

export type SortOption = 'newest' | 'price-low' | 'price-high';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  // Sync debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, sortBy, setSearchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await NadhirService.getProducts();
        setProducts(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to fetch products';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.fabric?.toLowerCase().includes(q)
      );
    }

    result = result.filter(p => {
      const price = p.is_promotional && p.promo_price_kes ? p.promo_price_kes : p.price_kes;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => {
          const pa = a.is_promotional && a.promo_price_kes ? a.promo_price_kes : a.price_kes;
          const pb = b.is_promotional && b.promo_price_kes ? b.promo_price_kes : b.price_kes;
          return pa - pb;
        });
        break;
      case 'price-high':
        result = [...result].sort((a, b) => {
          const pa = a.is_promotional && a.promo_price_kes ? a.promo_price_kes : a.price_kes;
          const pb = b.is_promotional && b.promo_price_kes ? b.promo_price_kes : b.price_kes;
          return pb - pa;
        });
        break;
      case 'newest':
      default:
        // Already sorted by ID or creation date descending from fetch maybe?
        break;
    }

    return result;
  }, [products, selectedCategory, debouncedSearch, sortBy, priceRange]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory('All');
    setSortBy('newest');
    setPriceRange([0, 50000]);
    clearSearch();
  }, [clearSearch]);

  return {
    products,
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
  };
};
