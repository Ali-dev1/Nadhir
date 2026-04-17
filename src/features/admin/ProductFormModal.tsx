import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, KanzuStyle } from '../../types';
import { X, UploadCloud, XCircle, Loader2 } from 'lucide-react';
import { getImageUrl, handleImageError } from '../../lib/imageHelpers';
import { processProductImage } from '../../lib/imageProcessor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Omani' as KanzuStyle,
    price_kes: '',
    image_url: '',
    image_urls: [] as string[],
    description: '',
    fabric: '',
    stock_quantity: 10,
    is_promotional: false,
    promo_price_kes: '',
    sizes_available: [52, 54, 56, 58] as number[],
    tags: [] as string[]
  });
 
  const [sizeInput, setSizeInput] = useState('');
  const [tagInput, setTagInput] = useState('');
 
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        category: product.category,
        price_kes: product.price_kes.toString(),
        image_url: product.image_url || '',
        image_urls: product.image_urls || [],
        description: product.description || '',
        fabric: product.fabric || '',
        stock_quantity: product.stock_quantity,
        is_promotional: product.is_promotional || false,
        promo_price_kes: product.promo_price_kes ? product.promo_price_kes.toString() : '',
        sizes_available: product.sizes_available || [],
        tags: product.tags || []
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category: 'Omani',
        price_kes: '',
        image_url: '',
        image_urls: [],
        description: '',
        fabric: '',
        stock_quantity: 10,
        is_promotional: false,
        promo_price_kes: '',
        sizes_available: [52, 54, 56, 58],
        tags: []
      });
    }
  }, [product, isOpen]);
 
  if (!isOpen) return null;
 
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };
 
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!formData.name) {
      alert('Please enter a product name first to organize images.');
      return;
    }

    setUploadingImage(true);
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const category = formData.category.toLowerCase().replace(/\s+/g, '-');
      
      const uploadImage = async (file: File, slug: string, index: number) => {
        const processed = await processProductImage(file);
        const ext = processed.name.split('.').pop() || 'jpg';
        const path = `${category}/${slug}/${index}_${Date.now()}.${ext}`;
        
        const { data, error } = await supabase.storage
          .from('products')
          .upload(path, processed, { 
            upsert: true,
            contentType: processed.type
          });
        
        if (error) throw new Error('Upload failed: ' + error.message);
        return data.path;
      };

      const confirmedPaths = [...formData.image_urls];
      // Process files sequentially to ensure order and not overwhelm memory
      for (let i = 0; i < files.length; i++) {
        const path = await uploadImage(files[i], slug, confirmedPaths.length);
        confirmedPaths.push(path);
      }
      
      setFormData({ 
        ...formData, 
        image_urls: confirmedPaths,
        image_url: formData.image_url || confirmedPaths[0]
      });
      
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown upload error';
      alert(`Error uploading image: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
    }
  };
 
  const removeImage = (path: string) => {
    const newPaths = formData.image_urls.filter(p => p !== path);
    setFormData({
      ...formData,
      image_urls: newPaths,
      image_url: newPaths[0] || ''
    });
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const newPaths = [...formData.image_urls];
    const item = newPaths.splice(draggedIdx, 1)[0];
    newPaths.splice(idx, 0, item);
    setFormData({
      ...formData,
      image_urls: newPaths,
      image_url: newPaths[0] || ''
    });
    setDraggedIdx(null);
  };
 
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({ ...formData, tags: [...formData.tags, tag] });
      }
      setTagInput('');
    }
  };
 
  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };
 
  const addSize = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const size = parseInt(sizeInput);
      if (!isNaN(size) && !formData.sizes_available.includes(size)) {
        setFormData({ ...formData, sizes_available: [...formData.sizes_available, size].sort((a,b)=>a-b) });
      }
      setSizeInput('');
    }
  };
 
  const removeSize = (sizeToRemove: number) => {
    setFormData({
      ...formData,
      sizes_available: formData.sizes_available.filter(s => s !== sizeToRemove)
    });
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 
    try {
      const finalSlug = formData.slug || generateSlug(formData.name);
      
      const payload: Partial<Product> = {
        name: formData.name,
        slug: finalSlug,
        category: formData.category,
        price_kes: parseInt(formData.price_kes),
        image_url: formData.image_url || (formData.image_urls[0] || null),
        image_urls: formData.image_urls,
        description: formData.description || null,
        fabric: formData.fabric || null,
        stock_quantity: formData.stock_quantity,
        is_promotional: formData.is_promotional,
        promo_price_kes: formData.is_promotional && formData.promo_price_kes ? parseInt(formData.promo_price_kes) : null,
        sizes_available: formData.sizes_available,
        tags: formData.tags
      };
 
      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown save error';
      alert(`Error saving product: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded shadow-xl border border-charcoal/10">
        <div className="flex justify-between items-center p-6 border-b border-charcoal/10 sticky top-0 bg-ivory z-10">
          <h2 className="text-2xl font-serif text-charcoal tracking-wide">
            {product ? 'Edit Piece' : 'Curate New Piece'}
          </h2>
          <button onClick={onClose} className="text-charcoal/50 hover:text-charcoal transition-colors p-1"><X className="w-5 h-5"/></button>
        </div>
 
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Multi-Image Gallery Manager */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em]">Gallery Showcase</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.image_urls.map((url, idx) => (
                <div 
                  key={idx} 
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className="relative aspect-[3/4] bg-white border border-charcoal/10 group shadow-sm overflow-hidden cursor-move"
                  title="Drag to reorder"
                >
                  <img src={getImageUrl(url, 'thumb')} alt={`Gallery ${idx}`} className="w-full h-full object-cover object-center pointer-events-none" onError={handleImageError} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute inset-x-0 bottom-0 bg-gold text-white text-[8px] font-bold uppercase text-center py-1 tracking-widest pointer-events-none">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              <div className="border-2 border-dashed border-charcoal/15 aspect-[3/4] flex items-center justify-center hover:border-gold hover:bg-gold/5 transition-all text-charcoal/30 relative cursor-pointer">
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait" 
                />
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                ) : (
                  <div className="text-center p-2">
                    <UploadCloud className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Images</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] text-charcoal/30 italic mt-2 leading-relaxed">
              Images are automatically resized and optimized for high-speed loading. Portrait photos (4:5 ratio) work best.
            </p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Display Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value, slug: formData.slug || generateSlug(e.target.value)})} 
                  className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal focus:border-gold outline-none shadow-sm" 
                  placeholder="e.g. Royal Omani Kanzu"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Unique Slug (URL)</label>
                <input 
                  required 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  className="w-full bg-white/50 border border-charcoal/10 p-3 text-xs text-charcoal/60 font-mono focus:border-gold outline-none" 
                  placeholder="royal-omani-kanzu"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Style Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as KanzuStyle})} 
                  className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal focus:border-gold outline-none shadow-sm"
                >
                  <option value="Omani">Omani</option>
                  <option value="Moroccan">Moroccan</option>
                  <option value="Saudi">Saudi</option>
                  <option value="Emirati">Emirati</option>
                  <option value="Arab Perfumes">Arab Perfumes</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Fabric Selection</label>
                <input 
                  value={formData.fabric} 
                  onChange={e => setFormData({...formData, fabric: e.target.value})} 
                  placeholder="E.g. Fine Japanese Silk Blend" 
                  className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal focus:border-gold outline-none shadow-sm"
                />
              </div>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Retail Price (KES)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 text-xs font-bold">KES</span>
                <input required type="number" min="0" value={formData.price_kes} onChange={e => setFormData({...formData, price_kes: e.target.value})} className="w-full bg-white border border-charcoal/10 pl-12 pr-4 py-3 text-sm text-charcoal focus:border-gold outline-none font-bold" />
              </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Inventory Depth (Units)</label>
               <input required type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})} className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal focus:border-gold outline-none" />
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Bespoke Sizes</label>
              <div className="flex flex-wrap gap-2 p-3 bg-white border border-charcoal/5 min-h-[50px] items-center shadow-inner">
                {formData.sizes_available.map(size => (
                  <span key={size} className="bg-charcoal text-ivory text-[10px] font-bold px-2 py-1 flex items-center gap-2">
                    {size} 
                    <button type="button" onClick={() => removeSize(size)} className="hover:text-gold transition-colors"><XCircle className="w-3 h-3" /></button>
                  </span>
                ))}
                <input 
                  type="number" 
                  placeholder="56..." 
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  onKeyDown={addSize}
                  className="bg-transparent border-none outline-none text-xs w-16 ml-2 placeholder:text-charcoal/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Collection Tags</label>
              <div className="flex flex-wrap gap-2 p-3 bg-white border border-charcoal/5 min-h-[50px] items-center shadow-inner">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-gold text-charcoal text-[9px] font-bold px-2 py-1 flex items-center gap-2">
                    #{tag} 
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors"><XCircle className="w-3 h-3" /></button>
                  </span>
                ))}
                <input 
                  placeholder="Ramadan..." 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="bg-transparent border-none outline-none text-xs w-24 ml-2 placeholder:text-charcoal/20"
                />
              </div>
            </div>
          </div>
 
          <div>
            <label className="block text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mb-2">Luxury Narrative (Description)</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows={4} 
              className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal/80 font-light focus:border-gold outline-none leading-relaxed"
              placeholder="Describe the craftsmanship, fabric feel, and prestige of this piece..."
            ></textarea>
          </div>
 
          <div className="bg-gold/5 p-6 border border-gold/20 space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-[0.3em] border-b border-gold/10 pb-2">Seasonal Promotions</h3>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_promotional" checked={formData.is_promotional} onChange={e => setFormData({...formData, is_promotional: e.target.checked})} className="w-4 h-4 accent-gold" />
              <label htmlFor="is_promotional" className="text-sm font-medium text-charcoal cursor-pointer">Enable Markdowns</label>
            </div>
            
            {formData.is_promotional && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Promotional Price (KES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 text-xs font-bold">KES</span>
                  <input required type="number" min="0" max={formData.price_kes} value={formData.promo_price_kes} onChange={e => setFormData({...formData, promo_price_kes: e.target.value})} className="w-3/4 bg-white border border-gold p-3 pl-12 text-sm text-charcoal font-bold" />
                </div>
              </div>
            )}
          </div>
 
          <div className="flex justify-end gap-6 pt-8 border-t border-charcoal/10 sticky bottom-0 bg-ivory py-4 z-10">
            <button type="button" onClick={onClose} className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal transition-colors">Discard Changes</button>
            <button 
              type="submit" 
              disabled={loading || uploadingImage} 
              className="bg-charcoal hover:bg-gold text-ivory px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-xl"
            >
              {loading ? 'Committing...' : 'Finalize & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
