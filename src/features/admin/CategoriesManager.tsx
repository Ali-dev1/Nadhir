import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';
import { PlusCircle, Pencil, Trash2, CheckCircle2, XCircle, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { NadhirService } from '../../services/api';
import { processProductImage } from '../../lib/imageProcessor';
import { getImageUrl, handleImageError } from '../../lib/imageHelpers';
import { useToast } from '../../components/admin/Toast';

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await NadhirService.getCategories();
      setCategories(data);
    } catch (e: any) {
      showToast('Error fetching categories: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!editingCategory?.name) {
      showToast('Please enter a category name before uploading an image.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const processed = await processProductImage(file);
      const ext = processed.name.split('.').pop() || 'jpg';
      const slug = editingCategory.slug || generateSlug(editingCategory.name);
      const path = `categories/${slug}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(path, processed, { upsert: true, contentType: processed.type });

      if (error) throw new Error(error.message);

      setEditingCategory((prev: Partial<Category> | null) => prev ? { ...prev, image_url: data.path } : null);
      showToast('Image uploaded successfully.', 'success');
    } catch (e: any) {
      showToast('Error uploading image: ' + e.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingCategory?.name) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      const slug = editingCategory.slug || generateSlug(editingCategory.name);
      const payload = {
        name: editingCategory.name,
        slug,
        image_url: editingCategory.image_url || null,
        is_active: editingCategory.is_active ?? true,
        sort_order: editingCategory.sort_order || 0
      };

      if (editingCategory.id) {
        await NadhirService.updateCategory(editingCategory.id, payload);
        showToast('Category updated.', 'success');
      } else {
        await NadhirService.createCategory(payload);
        showToast('Category created.', 'success');
      }

      setEditingCategory(null);
      fetchCategories();
      // Bust cache
      localStorage.removeItem('nadhir_categories');
    } catch (e: any) {
      showToast('Error saving category: ' + e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products using this category might lose their grouping.')) return;
    try {
      await NadhirService.deleteCategory(id);
      showToast('Category deleted.', 'success');
      fetchCategories();
      localStorage.removeItem('nadhir_categories');
    } catch (e: any) {
      showToast('Error deleting category: ' + e.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-charcoal flex items-center gap-2">
          Collections Management
        </h2>
        <button 
          onClick={() => setEditingCategory({ name: '', is_active: true })}
          className="flex items-center gap-2 bg-charcoal text-ivory px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New Collection
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white border border-charcoal/10 overflow-hidden shadow-sm flex flex-col group">
              <div className="relative aspect-[3/2] bg-charcoal/5">
                {cat.image_url ? (
                  <img src={getImageUrl(cat.image_url, 'card')} alt={cat.name} className="w-full h-full object-cover" onError={handleImageError} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {!cat.is_active && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-charcoal text-white text-[10px] uppercase tracking-widest px-2 py-1 font-bold">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-lg text-charcoal truncate">{cat.name}</h3>
                  <p className="text-[10px] text-charcoal/50 font-mono mt-1 mb-4">/{cat.slug}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-charcoal/5 pt-4">
                  <button onClick={() => setEditingCategory(cat)} className="text-charcoal/60 hover:text-gold p-1 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-400/60 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ivory w-full max-w-lg p-6 rounded shadow-2xl relative">
            <button onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal"><XCircle className="w-5 h-5" /></button>
            <h3 className="text-2xl font-serif text-charcoal mb-6">{editingCategory.id ? 'Edit Collection' : 'New Collection'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1">Collection Name</label>
                <input 
                  type="text" 
                  value={editingCategory.name || ''} 
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value, slug: editingCategory.slug || generateSlug(e.target.value) })}
                  className="w-full border border-charcoal/20 p-3 bg-white outline-none focus:border-gold"
                  placeholder="e.g. Shoes"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1">URL Slug</label>
                <input 
                  type="text" 
                  value={editingCategory.slug || ''} 
                  onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full border border-charcoal/20 p-3 bg-white/50 outline-none focus:border-gold font-mono text-sm text-charcoal/60"
                  placeholder="e.g. shoes"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1">Collection Image</label>
                <div className="flex items-center gap-4">
                  {editingCategory.image_url && (
                    <img src={getImageUrl(editingCategory.image_url, 'thumb')} alt="" className="w-16 h-16 object-cover border border-charcoal/10" onError={handleImageError} />
                  )}
                  <div className="flex-1 relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                    />
                    <div className={`w-full border-2 border-dashed ${uploadingImage ? 'border-gold bg-gold/5' : 'border-charcoal/20 hover:border-gold'} p-4 flex justify-center items-center text-charcoal/40 transition-colors`}>
                      {uploadingImage ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : <span className="text-xs uppercase font-bold tracking-widest flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Upload Photo</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={editingCategory.is_active} 
                  onChange={e => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                  className="w-4 h-4 accent-gold"
                />
                <label htmlFor="isActive" className="text-sm text-charcoal font-medium">Visible on Storefront</label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setEditingCategory(null)} className="text-xs uppercase font-bold tracking-widest text-charcoal/40 hover:text-charcoal px-4">Cancel</button>
              <button onClick={handleSave} disabled={uploadingImage} className="bg-charcoal text-ivory px-6 py-3 text-xs uppercase font-bold tracking-widest hover:bg-gold transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Save Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
