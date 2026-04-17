/**
 * Image URL helper for Nadhir Luxury Boutique
 * Integrates with Supabase Image Transformation API
 */

const PLACEHOLDER = '/nadhir_placeholder.svg';

export type ImageSize = 'thumb' | 'card' | 'gallery';

export const getImageUrl = (
  storagePath: string | null | undefined,
  size: ImageSize = 'card'
): string => {
  if (!storagePath) {
    return PLACEHOLDER;
  }

  // Handle legacy full URLs
  if (storagePath.startsWith('http')) {
    return storagePath;
  }

  // Handle local public assets (e.g. /omani_kanzu.png)
  if (storagePath.startsWith('/')) {
    return storagePath;
  }

  const sizes = {
    thumb: 'width=120&quality=70&resize=contain',
    card: 'width=400&quality=80',
    gallery: 'width=800&quality=85',
  };

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!baseUrl) {
    return PLACEHOLDER;
  }

  // Clean storage path (remove leading slash if present)
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;

  return `${baseUrl}/storage/v1/render/image/public/products/${cleanPath}?${sizes[size]}`;
};

/**
 * Helper to get the full array of images for a product, 
 * ensuring backward compatibility with the old image_url column.
 */
export const getProductImages = (product: { image_urls?: string[]; image_url?: string | null }): string[] => {
  try {
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
      return product.image_urls;
    }
    if (product.image_url) {
      return [product.image_url];
    }
  } catch {
    // Safety: if product shape is unexpected, return empty
  }
  return [];
};

/**
 * onError handler for <img> tags — swaps to placeholder on load failure.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (!target.src.includes('nadhir_placeholder')) {
    target.src = PLACEHOLDER;
  }
};
