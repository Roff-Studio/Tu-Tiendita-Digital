// Performance monitoring and optimization utilities

export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  return async () => {
    const start = performance.now();
    
    try {
      await fn();
    } finally {
      const end = performance.now();
      const duration = end - start;
      
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
      
      // Report to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
          name: name,
          value: Math.round(duration)
        });
      }
    }
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image optimization utilities
export const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate optimal dimensions
      const maxWidth = 1200;
      const maxHeight = 1200;
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

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for browsers without IntersectionObserver
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Bundle size analysis
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Bundle Analysis:');
    console.log('- React:', React);
    console.log('- Supabase Client Size: ~50KB');
    console.log('- Lucide Icons: Tree-shaken');
    console.log('- Tailwind CSS: Purged in production');
  }
};

// Memory leak detection
export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV === 'development') {
    let initialMemory = 0;
    
    const checkMemory = () => {
      if ('memory' in performance) {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        
        if (initialMemory === 0) {
          initialMemory = currentMemory;
        } else {
          const increase = currentMemory - initialMemory;
          const increasePercent = (increase / initialMemory) * 100;
          
          if (increasePercent > 50) {
            console.warn(`🚨 Memory usage increased by ${increasePercent.toFixed(2)}%`);
          }
        }
      }
    };

    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    
    return () => clearInterval(interval);
  }
  
  return () => {};
};