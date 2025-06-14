import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface ImageCarouselProps {
  images: Array<{ id: string; imageUrl: string }>;
  productName: string;
  isAvailable?: boolean;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  productName,
  isAvailable = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Refs for image optimization
  const imageRefs = useRef<Map<number, HTMLImageElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && containerRef.current) {
              // Preload adjacent images when container is visible
              preloadAdjacentImages();
            }
          });
        },
        { threshold: 0.1 }
      );
      
      if (containerRef.current) {
        observerRef.current.observe(containerRef.current);
      }
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Preload adjacent images for smoother navigation
  const preloadAdjacentImages = useCallback(() => {
    if (!images || images.length <= 1) return;
    
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    // Preload next and previous images
    [nextIndex, prevIndex].forEach(index => {
      const imageUrl = images[index]?.imageUrl;
      if (imageUrl && !imageErrors.has(imageUrl)) {
        const img = new Image();
        img.src = imageUrl;
      }
    });
  }, [images, currentIndex, imageErrors]);

  // Navigation functions
  const nextImage = useCallback(() => {
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images]);

  const prevImage = useCallback(() => {
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images]);

  // Image loading handlers
  const handleImageLoad = useCallback((imageUrl: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback((imageUrl: string) => {
    setImageLoading(prev => new Set(prev).add(imageUrl));
  }, []);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Get current image
  const currentImage = images?.[currentIndex];
  const hasMultipleImages = images && images.length > 1;

  // Generate responsive image sources
  const getResponsiveImageSrc = useCallback((imageUrl: string) => {
    // This function would normally transform the URL to get different sizes
    // For example: /image.jpg -> /image-small.jpg, /image-medium.jpg, etc.
    // For this implementation, we'll simulate it with a query parameter
    
    const getImageWithSize = (url: string, size: string) => {
      // In a real implementation, you would generate different sized images
      // Here we're just adding a query parameter to simulate different sizes
      const urlObj = new URL(url);
      urlObj.searchParams.set('size', size);
      return urlObj.toString();
    };
    
    return {
      small: getImageWithSize(imageUrl, 'small'), // 150x150
      medium: getImageWithSize(imageUrl, 'medium'), // 300x300
      large: getImageWithSize(imageUrl, 'large'), // 600x600
      original: imageUrl
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative aspect-square bg-gray-100 overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentImage && !imageErrors.has(currentImage.imageUrl) ? (
        <>
          {imageLoading.has(currentImage.imageUrl) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Responsive Image with srcSet */}
          <img
            ref={el => el && imageRefs.current.set(currentIndex, el)}
            srcSet={`
              ${getResponsiveImageSrc(currentImage.imageUrl).small} 150w,
              ${getResponsiveImageSrc(currentImage.imageUrl).medium} 300w,
              ${getResponsiveImageSrc(currentImage.imageUrl).large} 600w
            `}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={currentImage.imageUrl}
            alt={`${productName} - imagen ${currentIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading.has(currentImage.imageUrl) ? 'opacity-0' : 'opacity-100'
            } ${!isAvailable ? 'filter grayscale' : ''}`}
            onLoadStart={() => handleImageLoadStart(currentImage.imageUrl)}
            onLoad={() => handleImageLoad(currentImage.imageUrl)}
            onError={() => handleImageError(currentImage.imageUrl)}
            loading="lazy"
            width={600}
            height={600}
          />
          
          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                      index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                    aria-label={`Ver imagen ${index + 1} de ${images?.length}`}
                  />
                ))}
              </div>

              {/* Swipe indicator for mobile */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full sm:hidden">
                Desliza
              </div>
            </>
          )}
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          !isAvailable ? 'filter grayscale' : ''
        }`}>
          <Package className="h-12 w-12 text-gray-400" aria-hidden="true" />
        </div>
      )}
      
      {!isAvailable && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Agotado
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageCarousel);