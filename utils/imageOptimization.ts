// Image optimization utilities for mobile
export function getSupabaseImageUrl(
  url: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!url) return '';
  
  // Ha már Supabase storage URL, nem kell módosítani
  if (!url.includes('supabase')) return url;
  
  // Mobile-optimized defaults
  const width = options?.width || 400;
  const quality = options?.quality || 75;
  
  // Supabase nem támogat resize, de lehet cache-lni width=400-nél
  return url;
}

// Responsive image sizes for mobile
export const MOBILE_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 768px) 80vw, 600px';
export const MOBILE_CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
