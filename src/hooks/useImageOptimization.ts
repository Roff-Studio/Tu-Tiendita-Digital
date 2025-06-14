import { useState, useCallback, useEffect } from 'react';
import { compressImage } from '../utils/imageOptimizer';
import { checkWebPSupport } from '../utils/imageUtils';

interface UseImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preferWebP?: boolean;
}

interface OptimizationResult {
  optimizedFile: File | null;
  optimizedUrl: string | null;
  isOptimizing: boolean;
  error: Error | null;
  supportsWebP: boolean;
}

/**
 * Custom hook for client-side image optimization
 */
export const useImageOptimization = (
  options: UseImageOptimizationOptions = {}
): [
  (file: File) => Promise<File>,
  OptimizationResult
] => {
  const [result, setResult] = useState<OptimizationResult>({
    optimizedFile: null,
    optimizedUrl: null,
    isOptimizing: false,
    error: null,
    supportsWebP: false
  });
  
  // Check WebP support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const webpSupported = await checkWebPSupport();
      setResult(prev => ({ ...prev, supportsWebP: webpSupported }));
    };
    
    checkSupport();
  }, []);
  
  // Optimize image function
  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    try {
      setResult(prev => ({ ...prev, isOptimizing: true, error: null }));
      
      const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        preferWebP = true
      } = options;
      
      // Determine format based on WebP support
      const format = (preferWebP && result.supportsWebP) 
        ? 'image/webp' 
        : file.type || 'image/jpeg';
      
      // Compress the image
      const optimizedFile = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality,
        format
      });
      
      // Create a URL for preview
      const optimizedUrl = URL.createObjectURL(optimizedFile);
      
      setResult({
        optimizedFile,
        optimizedUrl,
        isOptimizing: false,
        error: null,
        supportsWebP: result.supportsWebP
      });
      
      return optimizedFile;
    } catch (error: any) {
      console.error('Image optimization error:', error);
      
      setResult({
        optimizedFile: null,
        optimizedUrl: null,
        isOptimizing: false,
        error: new Error(error.message || 'Error optimizing image'),
        supportsWebP: result.supportsWebP
      });
      
      // Return original file as fallback
      return file;
    }
  }, [options, result.supportsWebP]);
  
  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      if (result.optimizedUrl) {
        URL.revokeObjectURL(result.optimizedUrl);
      }
    };
  }, [result.optimizedUrl]);
  
  return [optimizeImage, result];
};

/**
 * Custom hook for batch image optimization
 */
export const useBatchImageOptimization = (
  options: UseImageOptimizationOptions = {}
): [
  (files: File[]) => Promise<File[]>,
  {
    optimizedFiles: File[];
    isOptimizing: boolean;
    progress: number;
    error: Error | null;
  }
] => {
  const [state, setState] = useState({
    optimizedFiles: [] as File[],
    isOptimizing: false,
    progress: 0,
    error: null as Error | null
  });
  
  const [optimizeImage] = useImageOptimization(options);
  
  // Batch optimize function
  const batchOptimize = useCallback(async (files: File[]): Promise<File[]> => {
    if (files.length === 0) return [];
    
    try {
      setState({
        optimizedFiles: [],
        isOptimizing: true,
        progress: 0,
        error: null
      });
      
      const optimizedFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const optimized = await optimizeImage(files[i]);
        optimizedFiles.push(optimized);
        
        // Update progress
        setState(prev => ({
          ...prev,
          optimizedFiles: [...prev.optimizedFiles, optimized],
          progress: Math.round(((i + 1) / files.length) * 100)
        }));
      }
      
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        progress: 100
      }));
      
      return optimizedFiles;
    } catch (error: any) {
      console.error('Batch image optimization error:', error);
      
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: new Error(error.message || 'Error optimizing images')
      }));
      
      // Return original files as fallback
      return files;
    }
  }, [optimizeImage]);
  
  return [batchOptimize, state];
};