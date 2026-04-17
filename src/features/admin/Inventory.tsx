import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { formatKES } from '../../lib/utils';
import { PlusCircle, Edit2, Trash2, Copy, Search } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { getImageUrl, handleImageError } from '../../lib/imageHelpers';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data as Product[]);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleEdit = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Error deleting');
    }
  };

  const duplicateProduct = async (product: Product) => {
    setDuplicating(product.id);
    try {
      const newSlug = `${product.slug}-copy-${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: `${product.name} (Copy)`,
          slug: newSlug,
          description: product.description,
          price_kes: product.price_kes,
          compare_price_kes: product.compare_price_kes,
          image_url: product.image_url,
          image_urls: product.image_urls,
          category: product.category,
          sizes_available: product.sizes_available,
          fabric: product.fabric,
          stock_quantity: product.stock_quantity,
          low_stock_threshold: product.low_stock_threshold,
          is_active: false, // Inactive by default
          is_promotional: false,
          promo_price_kes: null,
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setProducts(prev => [data as Product, ...prev]);
        setEditingProduct(data as Product);
        setIsModalOpen(true);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate');
    } finally {
      setDuplicating(null);
    }
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    : products;

  if (loading) return <div className="p-8 text-charcoal/50 font-serif animate-pulse">Loading Inventory...</div>;

  return (
    <div data-testid="inventory-list" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal">Inventory Management</h1>
          <p className="text-charcoal/60 text-sm mt-1">{products.length} products total</p>
        </div>
        <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 min-h-[44px]">
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
        <input
          type="search"
          autoComplete="off"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-charcoal/15 focus:border-gold outline-none bg-white"
        />
      </div>

      <div className="bg-white shadow border border-charcoal/5 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-charcoal/5 text-charcoal/80 uppercase tracking-widest text-xs border-b border-charcoal/10">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-ivory/30 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 aspect-[3/4] bg-charcoal/10 rounded overflow-hidden shrink-0">
                      {(product.image_urls?.[0] || product.image_url) && (
                        <img 
                          src={getImageUrl(product.image_urls?.[0] || product.image_url || '', 'thumb')} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center" 
                          onError={handleImageError}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="truncate max-w-[180px]">{product.name}</span>
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${product.is_active ? 'text-green-600' : 'text-charcoal/30'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-charcoal/40 italic">{product.slug}</td>
                <td className="px-6 py-4 text-charcoal/60">{product.category}</td>
                <td className="px-6 py-4">
                  {product.is_promotional && product.promo_price_kes ? (
                    <div className="flex flex-col">
                      <span className="text-red-500 font-bold">{formatKES(product.promo_price_kes)}</span>
                      <span className="text-xs line-through text-charcoal/40">{formatKES(product.price_kes)}</span>
                    </div>
                  ) : (
                    <span className="text-gold font-medium">{formatKES(product.price_kes)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    product.stock_quantity > (product.low_stock_threshold || 5) ? 'bg-green-100 text-green-700' :
                    product.stock_quantity > 0 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs ${product.is_active ? 'text-green-600' : 'text-charcoal/40'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 text-charcoal/50 hover:text-gold transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateProduct(product)}
                      disabled={duplicating === product.id}
                      className="p-2 text-charcoal/50 hover:text-blue-500 transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-charcoal/50 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-charcoal/40 font-serif italic">
                  {search ? `No products matching "${search}"` : 'No inventory available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSuccess={fetchInventory}
      />
    </div>
  );
};
