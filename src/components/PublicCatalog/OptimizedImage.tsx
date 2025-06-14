import React, { useState, useEffect, useRef } from 'react';
import { getResponsiveImageUrl, generatePlaceholderImage } from '../../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (loading !== 'lazy' || !imgRef.current) {
      setIsInView(true);
      return;
    }
    
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true);
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        },
        { rootMargin: '200px 0px', threshold: 0.01 }
      );
      
      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }
    
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
        observerRef.current.disconnect();
      }
    };
  }, [loading]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };
  
  // Generate responsive image URLs
  const thumbnailSrc = getResponsiveImageUrl(src, 'thumbnail');
  const mediumSrc = getResponsiveImageUrl(src, 'medium');
  const largeSrc = getResponsiveImageUrl(src, 'large');
  const originalSrc = src;
  
  // Generate placeholder
  const placeholder = generatePlaceholderImage(width, height);
  
  // If there's an error, show placeholder
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-400"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* Placeholder or low-quality image */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      
      {/* Main image with srcSet for responsive loading */}
      {isInView && (
        <img
          ref={imgRef}
          src={originalSrc}
          srcSet={`
            ${thumbnailSrc} 150w,
            ${mediumSrc} 300w,
            ${largeSrc} 600w,
            ${originalSrc} 1200w
          `}
          sizes={`
            (max-width: 640px) 100vw,
            (max-width: 768px) 50vw,
            33vw
          `}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
        />
      )}
    </div>
  );
};

export default React.memo(OptimizedImage);