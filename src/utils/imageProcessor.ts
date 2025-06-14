/**
 * Server-side image processing utilities for Tu Tiendita Digital
 * Handles image optimization, format conversion, and storage
 */

import { supabase } from '../lib/supabase';
import { compressImage } from './imageOptimizer';

/**
 * Uploads an image to Supabase Storage with optimizations
 * @param file Image file to upload
 * @param userId User ID for storage path
 * @param generateSizes Whether to generate multiple sizes
 * @returns Object with URLs for all generated images
 */
export const uploadOptimizedImage = async (
  file: File,
  userId: string,
  generateSizes: boolean = true
): Promise<{
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
}> => {
  try {
    // Compress the original image to WebP
    const compressedFile = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/webp'
    });
    
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomString}.webp`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload the compressed original
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('products')
      .upload(filePath, compressedFile);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: originalUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
      
    const originalUrl = originalUrlData.publicUrl;
    
    // If we don't need multiple sizes, return just the original
    if (!generateSizes) {
      return { original: originalUrl };
    }
    
    // Generate and upload different sizes in parallel
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'medium', width: 300, height: 300 },
      { name: 'large', width: 600, height: 600 }
    ];
    
    const sizeUploads = await Promise.all(
      sizes.map(async (size) => {
        try {
          // Compress to specific size
          const sizedFile = await compressImage(file, {
            maxWidth: size.width,
            maxHeight: size.height,
            quality: 0.8,
            format: 'image/webp'
          });
          
          // Upload with size in filename
          const sizedFileName = `${timestamp}-${randomString}-${size.name}.webp`;
          const sizedFilePath = `${userId}/${sizedFileName}`;
          
          await supabase.storage
            .from('products')
            .upload(sizedFilePath, sizedFile);
            
          // Get public URL
          const { data: sizedUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(sizedFilePath);
            
          return { 
            size: size.name, 
            url: sizedUrlData.publicUrl 
          };
        } catch (error) {
          console.error(`Error uploading ${size.name} image:`, error);
          return { size: size.name, url: null };
        }
      })
    );
    
    // Collect all URLs
    const result: Record<string, string> = { original: originalUrl };
    
    sizeUploads.forEach(upload => {
      if (upload.url) {
        result[upload.size] = upload.url;
      }
    });
    
    return result as any;
  } catch (error) {
    console.error('Error in uploadOptimizedImage:', error);
    throw new Error('Error al subir y optimizar la imagen');
  }
};

/**
 * Processes an existing image URL to generate optimized versions
 * @param imageUrl Original image URL
 * @param userId User ID for storage path
 * @returns Object with URLs for all generated images
 */
export const processExistingImage = async (
  imageUrl: string,
  userId: string
): Promise<{
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
}> => {
  try {
    // Fetch the original image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch original image');
    
    const blob = await response.blob();
    const file = new File([blob], 'original-image.jpg', { type: blob.type });
    
    // Use the same upload function to process and store optimized versions
    return await uploadOptimizedImage(file, userId, true);
  } catch (error) {
    console.error('Error processing existing image:', error);
    // Return the original URL if optimization fails
    return { original: imageUrl };
  }
};

/**
 * Batch processes multiple images for a product
 * @param images Array of image files or URLs
 * @param userId User ID for storage path
 * @returns Array of objects with optimized image URLs
 */
export const batchProcessImages = async (
  images: Array<File | string>,
  userId: string
): Promise<Array<{
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
}>> => {
  try {
    // Process images in sequence to avoid overwhelming storage
    const results = [];
    
    for (const image of images) {
      if (typeof image === 'string') {
        // Process existing URL
        const result = await processExistingImage(image, userId);
        results.push(result);
      } else {
        // Process new file
        const result = await uploadOptimizedImage(image, userId, true);
        results.push(result);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in batch processing images:', error);
    throw new Error('Error al procesar múltiples imágenes');
  }
};

/**
 * Deletes all size variants of an image
 * @param imageUrl URL of any size variant
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImageWithVariants = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the base filename without size suffix
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Extract the base part of the filename (before size suffix)
    const baseFilenameMatch = filename.match(/^(.+?)(?:-(?:thumbnail|medium|large))?\.webp$/);
    
    if (!baseFilenameMatch) {
      // If pattern doesn't match, just delete the single file
      const path = url.pathname.split('/').slice(-2).join('/');
      await supabase.storage.from('products').remove([path]);
      return;
    }
    
    const baseFilename = baseFilenameMatch[1];
    const userId = pathParts[pathParts.length - 2];
    
    // Generate paths for all variants
    const variantPaths = [
      `${userId}/${baseFilename}.webp`,
      `${userId}/${baseFilename}-thumbnail.webp`,
      `${userId}/${baseFilename}-medium.webp`,
      `${userId}/${baseFilename}-large.webp`
    ];
    
    // Delete all variants
    await supabase.storage.from('products').remove(variantPaths);
  } catch (error) {
    console.error('Error deleting image variants:', error);
    throw new Error('Error al eliminar las variantes de la imagen');
  }
};