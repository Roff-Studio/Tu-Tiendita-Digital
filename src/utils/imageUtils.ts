/**
 * Client-side image utility functions for Tu Tiendita Digital
 */

/**
 * Generates a responsive image URL for different sizes
 * @param originalUrl The original image URL
 * @param size The desired size (thumbnail, medium, large)
 * @returns URL for the requested size, or original if size-specific URL can't be generated
 */
export const getResponsiveImageUrl = (
  originalUrl: string,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'
): string => {
  if (!originalUrl) return '';
  if (size === 'original') return originalUrl;
  
  try {
    // Check if this is already a size-specific URL
    if (originalUrl.includes('-thumbnail.') || 
        originalUrl.includes('-medium.') || 
        originalUrl.includes('-large.')) {
      // Replace the current size with the requested size
      return originalUrl
        .replace('-thumbnail.', `-${size}.`)
        .replace('-medium.', `-${size}.`)
        .replace('-large.', `-${size}.`);
    }
    
    // For URLs that don't already have a size suffix
    const urlObj = new URL(originalUrl);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Insert size before extension
    const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const extension = filename.substring(filename.lastIndexOf('.'));
    const newFilename = `${filenameWithoutExt}-${size}${extension}`;
    
    pathParts[pathParts.length - 1] = newFilename;
    urlObj.pathname = pathParts.join('/');
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Error generating responsive image URL:', error);
    return originalUrl;
  }
};

/**
 * Checks if the browser supports WebP format
 * @returns Promise that resolves to a boolean indicating WebP support
 */
export const checkWebPSupport = async (): Promise<boolean> => {
  if (!self.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  try {
    return await createImageBitmap(blob).then(() => true, () => false);
  } catch (e) {
    return false;
  }
};

/**
 * Generates a placeholder image data URL
 * @param width Width of the placeholder
 * @param height Height of the placeholder
 * @param color Background color
 * @returns Data URL for the placeholder image
 */
export const generatePlaceholderImage = (
  width: number = 300,
  height: number = 300,
  color: string = '#f3f4f6'
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add a subtle pattern
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, width / 2, height / 2);
    ctx.fillRect(width / 2, height / 2, width / 2, height / 2);
  }
  
  return canvas.toDataURL('image/png', 0.1);
};

/**
 * Calculates the aspect ratio for an image
 * @param width Image width
 * @param height Image height
 * @returns CSS aspect ratio value (e.g., "1/1", "4/3", "16/9")
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  if (!width || !height) return '1/1';
  
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Sets up lazy loading for images using Intersection Observer
 * @param container Container element to observe for images
 */
export const setupLazyLoading = (container: HTMLElement): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    const images = container.querySelectorAll('img[data-src]');
    Array.from(images).forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) img.setAttribute('src', src);
      img.removeAttribute('data-src');
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.getAttribute('data-src');
        const dataSrcSet = img.getAttribute('data-srcset');
        const dataSizes = img.getAttribute('data-sizes');
        
        if (dataSrc) img.src = dataSrc;
        if (dataSrcSet) img.srcset = dataSrcSet;
        if (dataSizes) img.sizes = dataSizes;
        
        img.classList.remove('opacity-0');
        img.classList.add('opacity-100');
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
  
  const images = container.querySelectorAll('img[data-src]');
  images.forEach(img => {
    imageObserver.observe(img);
  });
};