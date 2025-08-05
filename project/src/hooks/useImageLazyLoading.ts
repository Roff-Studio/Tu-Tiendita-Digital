import { useEffect, useRef, useState, RefObject } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Custom hook for lazy loading images using Intersection Observer
 * @param elementRef Reference to the element to observe
 * @param options Configuration options for the Intersection Observer
 * @returns Object with loading state and visibility state
 */
export function useImageLazyLoading(
  elementRef: RefObject<HTMLElement>,
  options: UseLazyLoadingOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const {
    rootMargin = '200px 0px',
    threshold = 0.01,
    triggerOnce = true
  } = options;
  
  useEffect(() => {
    // Skip if element ref is not available or if already loaded and triggerOnce is true
    if (!elementRef.current || (isLoaded && triggerOnce)) {
      return;
    }
    
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (triggerOnce) {
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        } else {
          if (!triggerOnce) {
            setIsVisible(false);
          }
        }
      },
      { rootMargin, threshold }
    );
    
    observer.observe(elementRef.current);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, rootMargin, threshold, triggerOnce, isLoaded]);
  
  // Function to mark as loaded
  const markAsLoaded = () => {
    setIsLoaded(true);
    
    // If triggerOnce is true, disconnect the observer
    if (triggerOnce && observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  };
  
  return {
    isVisible,
    isLoaded,
    markAsLoaded
  };
}

/**
 * Custom hook for lazy loading a collection of images
 * @param containerRef Reference to the container element
 * @param options Configuration options for the Intersection Observer
 * @returns Function to set up lazy loading for images
 */
export function useImagesLazyLoading(
  containerRef: RefObject<HTMLElement>,
  options: UseLazyLoadingOptions = {}
) {
  useEffect(() => {
    if (!containerRef.current) return;
    
    const {
      rootMargin = '200px 0px',
      threshold = 0.01,
      triggerOnce = true
    } = options;
    
    // Find all images with data-src attribute
    const images = containerRef.current.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
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
            
            if (triggerOnce) {
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin, threshold }
    );
    
    images.forEach(img => {
      observer.observe(img);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [containerRef, options]);
  
  // Function to manually set up lazy loading
  const setupLazyLoading = (container: HTMLElement) => {
    const {
      rootMargin = '200px 0px',
      threshold = 0.01,
      triggerOnce = true
    } = options;
    
    const images = container.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
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
            
            if (triggerOnce) {
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin, threshold }
    );
    
    images.forEach(img => {
      observer.observe(img);
    });
    
    return () => {
      observer.disconnect();
    };
  };
  
  return { setupLazyLoading };
}