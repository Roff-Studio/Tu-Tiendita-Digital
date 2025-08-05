/**
 * Image optimization utilities for Tu Tiendita Digital
 * Handles image compression, format conversion, and responsive image generation
 */

import { IMAGE_CONFIG } from './constants';

/**
 * Compresses an image and optionally converts it to WebP format
 * @param file Original image file
 * @param options Compression options
 * @returns Promise with compressed image file
 */
export const compressImage = async (
  file: File, 
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<File> => {
  const {
    maxWidth = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight = IMAGE_CONFIG.MAX_HEIGHT,
    quality = IMAGE_CONFIG.QUALITY,
    format = IMAGE_CONFIG.FORMAT
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const cleanup = () => {
      canvas.remove();
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onload = () => {
      try {
        // Calculate optimal dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to specified format (WebP preferred)
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              // Generate a new filename with the correct extension
              const fileExtension = format.split('/')[1] || 'jpeg';
              const fileName = `${file.name.split('.')[0]}.${fileExtension}`;
              
              const compressedFile = new File([blob], fileName, {
                type: format,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          format,
          quality
        );
      } catch (error) {
        cleanup();
        console.error('Image compression error:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      cleanup();
      console.error('Error loading image for compression:', error);
      reject(new Error('Error al cargar la imagen para compresión'));
    };

    const blobUrl = URL.createObjectURL(file);
    img.src = blobUrl;
  });
};

/**
 * Generates multiple sizes of an image for responsive loading
 * @param file Original image file
 * @returns Promise with an object containing different sized images
 */
export const generateResponsiveImages = async (
  file: File
): Promise<{
  thumbnail: File;
  medium: File;
  large: File;
  original: File;
}> => {
  try {
    // Generate WebP versions at different sizes
    const thumbnail = await compressImage(file, {
      maxWidth: 150,
      maxHeight: 150,
      quality: 0.8,
      format: 'image/webp'
    });
    
    const medium = await compressImage(file, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.8,
      format: 'image/webp'
    });
    
    const large = await compressImage(file, {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.8,
      format: 'image/webp'
    });
    
    // Also compress the original but keep its dimensions
    const original = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/webp'
    });
    
    return {
      thumbnail,
      medium,
      large,
      original
    };
  } catch (error) {
    console.error('Error generating responsive images:', error);
    throw new Error('Error al generar imágenes responsivas');
  }
};

/**
 * Checks if WebP format is supported by the browser
 * @returns Promise that resolves to boolean indicating WebP support
 */
export const isWebPSupported = async (): Promise<boolean> => {
  // Feature detection for WebP
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
 * Creates a placeholder image while the real image loads
 * @param width Width of the placeholder
 * @param height Height of the placeholder
 * @param color Background color
 * @returns Data URL for the placeholder image
 */
export const createPlaceholderImage = (
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
 * Lazy loads images using Intersection Observer
 * @param imageElements Array of image elements to observe
 */
export const setupLazyLoading = (imageElements: NodeListOf<HTMLImageElement>): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    Array.from(imageElements).forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) img.src = src;
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.getAttribute('data-src');
        const dataSrcSet = img.getAttribute('data-srcset');
        
        if (dataSrc) img.src = dataSrc;
        if (dataSrcSet) img.srcset = dataSrcSet;
        
        img.classList.remove('opacity-0');
        img.classList.add('opacity-100');
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
  
  imageElements.forEach(img => {
    imageObserver.observe(img);
  });
};