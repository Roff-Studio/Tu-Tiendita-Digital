import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Product, ProductVariant, validateSKU, generateUniqueSKU } from '../../lib/supabase';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import LoadingState from '../common/LoadingState';
import VariantManager from './VariantManager';
import { 
  validateProductForm, 
  validateProductName, 
  validateSKU as validateSKUUtil, 
  validatePrice, 
  validateStock,
  cleanSKU 
} from '../../utils/validation';
import { 
  VALIDATION_LIMITS, 
  IMAGE_CONFIG, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  TIMEOUTS 
} from '../../utils/constants';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Tag, Hash, ArrowLeft, Trash2, ChevronUp, ChevronDown, Package } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSave: () => void;
}

interface ImageUpload {
  id?: string;
  file?: File;
  url: string;
  position: number;
  uploading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // FIXED: Enhanced form state with proper validation
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [mainSku, setMainSku] = useState(product?.mainSku || '');
  const [basePrice, setBasePrice] = useState(product?.basePrice?.toString() || '');
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [position, setPosition] = useState(product?.position?.toString() || '');
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skuValidating, setSkuValidating] = useState(false);
  const [skuValid, setSkuValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // FIXED: Memory management with refs
  const mountedRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // FIXED: Enhanced async operation with proper error handling
  const {
    loading: saveLoading,
    error: saveError,
    execute: saveProduct
  } = useAsyncOperation(async () => {
    if (!user) throw new Error('Usuario no autenticado');
    
    // FIXED: Comprehensive validation before submission
    const formData = {
      name: name.trim(),
      mainSku: mainSku.trim(),
      basePrice,
      stockQuantity,
      description: description.trim(),
      category: category.trim()
    };

    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    // Additional business logic validation
    if (skuValid === false) {
      throw new Error('El SKU principal ya está en uso');
    }

    if (images.some(img => img.uploading)) {
      throw new Error('Espera a que terminen de subir todas las imágenes');
    }

    // Validate variant SKUs
    for (const variant of variants) {
      const isVariantSkuValid = await validateSKU(variant.sku);
      if (!isVariantSkuValid) {
        throw new Error(`El SKU de variante "${variant.sku}" ya está en uso`);
      }
    }

    const basePriceNum = parseFloat(basePrice);
    const stockQtyNum = parseInt(stockQuantity);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      main_sku: formData.mainSku,
      base_price: basePriceNum,
      stock_quantity: stockQtyNum,
      category: formData.category || null,
      position: position ? Number(position) : null,
      is_available: product?.isAvailable ?? true,
      display_price: `$${basePriceNum.toLocaleString()}`,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    return await handleProductSave(productData);
  });

  // FIXED: Enhanced product save with transaction handling
  const handleProductSave = async (productData: any) => {
    let finalProductId = product?.id;

    if (product?.id) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);

      if (error) throw error;
    } else {
      // Create new product
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      finalProductId = data.id;
    }

    if (!finalProductId) throw new Error('No se pudo obtener el ID del producto');

    // Handle variants with proper cleanup
    if (product?.id) {
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', product.id);
    }

    if (variants.length > 0) {
      const variantData = variants.map(variant => ({
        product_id: finalProductId,
        name: variant.name,
        sku: variant.sku,
        price_modifier: variant.priceModifier,
        stock_quantity: variant.stockQuantity,
        is_available: variant.isAvailable,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantData);

      if (variantError) throw variantError;
    }

    // Handle images with proper cleanup
    if (product?.id) {
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', product.id);
    }

    if (images.length > 0) {
      const imageData = images
        .filter(img => !img.uploading && !img.file)
        .map((img, index) => ({
          product_id: finalProductId,
          image_url: img.url,
          position: index
        }));

      if (imageData.length > 0) {
        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageData);

        if (imageError) throw imageError;
      }
    }

    return finalProductId;
  };

  // FIXED: Enhanced SKU validation with proper cleanup
  const validateMainSku = useCallback(async (sku: string) => {
    if (!sku.trim() || sku.length < VALIDATION_LIMITS.SKU_MIN_LENGTH || !mountedRef.current) {
      setSkuValid(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setSkuValidating(true);
    try {
      const isValid = await validateSKU(sku.trim(), product?.id);
      
      if (!signal.aborted && mountedRef.current) {
        setSkuValid(isValid);
      }
    } catch (error) {
      if (!signal.aborted && mountedRef.current) {
        console.error('SKU validation error:', error);
        setSkuValid(false);
      }
    } finally {
      if (!signal.aborted && mountedRef.current) {
        setSkuValidating(false);
      }
    }
  }, [product?.id]);

  // FIXED: Enhanced SKU generation with proper error handling
  const generateSkuFromName = useCallback(async () => {
    if (!name.trim() || !mountedRef.current) return;
    
    try {
      const generatedSku = await generateUniqueSKU(name);
      if (mountedRef.current) {
        setMainSku(generatedSku);
        setSkuValid(true);
      }
    } catch (error) {
      console.error('SKU generation error:', error);
      if (mountedRef.current) {
        setError('Error al generar SKU automático');
      }
    }
  }, [name]);

  // FIXED: Enhanced image validation with comprehensive checks
  const validateImageFile = useCallback((file: File): string | null => {
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF)';
    }

    if (file.size > VALIDATION_LIMITS.IMAGE_MAX_SIZE) {
      return 'La imagen debe ser menor a 5MB';
    }

    return null;
  }, []);

  // FIXED: Enhanced image compression with proper error handling
  const compressImage = useCallback(async (file: File): Promise<File> => {
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
          const maxWidth = IMAGE_CONFIG.MAX_WIDTH;
          const maxHeight = IMAGE_CONFIG.MAX_HEIGHT;
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

          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: IMAGE_CONFIG.FORMAT,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            IMAGE_CONFIG.FORMAT,
            IMAGE_CONFIG.QUALITY
          );
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Error al cargar la imagen'));
      };

      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);
      img.src = blobUrl;
    });
  }, []);

  // FIXED: Enhanced image upload with proper cleanup and error handling
  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!user || !mountedRef.current) return;

    const newFiles = Array.from(files);
    
    if (images.length + newFiles.length > VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT) {
      setError(`Solo puedes subir máximo ${VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT} imágenes. Actualmente tienes ${images.length}.`);
      return;
    }

    setError('');

    for (const file of newFiles) {
      if (!mountedRef.current) break;

      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Create blob URL and track it
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);

      const tempImage: ImageUpload = {
        file,
        url: blobUrl,
        position: images.length,
        uploading: true
      };

      setImages(prev => [...prev, tempImage]);

      try {
        const compressedFile = await compressImage(file);
        
        if (!mountedRef.current) {
          // Cleanup if component unmounted
          URL.revokeObjectURL(blobUrl);
          blobUrlsRef.current.delete(blobUrl);
          return;
        }

        const fileExt = compressedFile.name.split('.').pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        if (mountedRef.current) {
          setImages(prev => prev.map(img => {
            if (img.file === file) {
              // Cleanup blob URL
              URL.revokeObjectURL(img.url);
              blobUrlsRef.current.delete(img.url);
              return { ...img, url: data.publicUrl, uploading: false, file: undefined };
            }
            return img;
          }));

          setSuccess(SUCCESS_MESSAGES.IMAGE_UPLOADED);
          setTimeout(() => {
            if (mountedRef.current) {
              setSuccess('');
            }
          }, TIMEOUTS.TOAST_DURATION);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        
        if (mountedRef.current) {
          setImages(prev => prev.filter(img => {
            if (img.file === file) {
              // Cleanup blob URL
              URL.revokeObjectURL(img.url);
              blobUrlsRef.current.delete(img.url);
              return false;
            }
            return true;
          }));
          setError('Error al subir la imagen. Intenta nuevamente.');
        }
      }
    }
  }, [user, images.length, validateImageFile, compressImage]);

  // FIXED: Enhanced form validation with real-time feedback
  const validateField = useCallback((field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'name':
        const nameValidation = validateProductName(value);
        if (!nameValidation.isValid) {
          errors.name = nameValidation.errors[0];
        }
        break;
      case 'mainSku':
        const skuValidation = validateSKUUtil(value);
        if (!skuValidation.isValid) {
          errors.mainSku = skuValidation.errors[0];
        }
        break;
      case 'basePrice':
        const priceValidation = validatePrice(value);
        if (!priceValidation.isValid) {
          errors.basePrice = priceValidation.errors[0];
        }
        break;
      case 'stockQuantity':
        const stockValidation = validateStock(value);
        if (!stockValidation.isValid) {
          errors.stockQuantity = stockValidation.errors[0];
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field] || ''
    }));
  }, []);

  // FIXED: Enhanced input handlers with validation
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    validateField('name', value);
  }, [validateField]);

  const handleSkuChange = useCallback((value: string) => {
    const cleanedSku = cleanSKU(value);
    setMainSku(cleanedSku);
    validateField('mainSku', cleanedSku);
    
    // Clear previous timeout
    if (skuTimeoutRef.current) {
      clearTimeout(skuTimeoutRef.current);
      skuTimeoutRef.current = null;
    }
    
    // Debounce SKU validation
    if (cleanedSku.length >= VALIDATION_LIMITS.SKU_MIN_LENGTH) {
      skuTimeoutRef.current = setTimeout(() => {
        validateMainSku(cleanedSku);
      }, TIMEOUTS.SLUG_CHECK_DEBOUNCE);
    } else {
      setSkuValid(null);
    }
  }, [validateField, validateMainSku]);

  const handlePriceChange = useCallback((value: string) => {
    setBasePrice(value);
    validateField('basePrice', value);
  }, [validateField]);

  const handleStockChange = useCallback((value: string) => {
    setStockQuantity(value);
    validateField('stockQuantity', value);
  }, [validateField]);

  // FIXED: Enhanced file selection with proper cleanup
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && mountedRef.current) {
      handleImageUpload(files);
    }
    // Reset input
    e.target.value = '';
  }, [handleImageUpload]);

  // FIXED: Enhanced image management with proper cleanup
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const imageToRemove = prev[index];
      
      // Cleanup blob URL if it exists
      if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
        blobUrlsRef.current.delete(imageToRemove.url);
      }
      
      const newImages = prev.filter((_, i) => i !== index);
      // Reorder positions
      return newImages.map((img, i) => ({ ...img, position: i }));
    });
  }, []);

  const moveImage = useCallback((index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev;
      
      // Swap images
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      
      // Update positions
      return newImages.map((img, i) => ({ ...img, position: i }));
    });
  }, []);

  // FIXED: Enhanced form submission with comprehensive validation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mountedRef.current) return;

    // Clear previous errors
    setError('');
    setValidationErrors({});

    // Comprehensive validation
    const formData = {
      name: name.trim(),
      mainSku: mainSku.trim(),
      basePrice,
      stockQuantity,
      description: description.trim(),
      category: category.trim()
    };

    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    if (skuValid === false) {
      setError('El SKU principal ya está en uso');
      return;
    }

    if (images.some(img => img.uploading)) {
      setError('Espera a que terminen de subir todas las imágenes');
      return;
    }

    try {
      await saveProduct();
      if (mountedRef.current) {
        onSave();
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (mountedRef.current) {
        setError(error.message || saveError?.message || ERROR_MESSAGES.SERVER_ERROR);
      }
    }
  }, [name, mainSku, basePrice, stockQuantity, description, category, position, skuValid, images, variants, saveProduct, onSave, onClose, saveError]);

  // FIXED: Enhanced back button handler with navigation fallback
  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Use navigate(-1) for proper back navigation
      navigate(-1);
    }
  }, [onClose, navigate]);

  // FIXED: Initialize images from product with proper cleanup
  useEffect(() => {
    mountedRef.current = true;

    if (product?.images) {
      setImages(product.images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        position: img.position
      })));
    }

    // FIXED: Comprehensive cleanup
    return () => {
      console.log('🧹 ProductForm: Cleaning up...');
      mountedRef.current = false;
      
      // Clear timeouts
      if (skuTimeoutRef.current) {
        clearTimeout(skuTimeoutRef.current);
        skuTimeoutRef.current = null;
      }
      
      // Abort pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // CRITICAL: Cleanup all blob URLs to prevent memory leaks
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, [product]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="Volver"
              disabled={saveLoading}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {product ? 'Editar producto' : 'Nuevo producto'}
            </h2>
          </div>
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Cerrar formulario"
            disabled={saveLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {(error || saveError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error || saveError?.message}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <LoadingState isLoading={saveLoading} message="Guardando producto...">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Product Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Información Básica</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del producto *
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Ej: Torta de chocolate"
                      required
                      disabled={saveLoading}
                      maxLength={VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{name.length}/{VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH} caracteres</p>
                      {validationErrors.name && (
                        <p className="text-xs text-red-600">{validationErrors.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="main-sku" className="block text-sm font-medium text-gray-700 mb-2">
                      SKU Principal *
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          id="main-sku"
                          type="text"
                          value={mainSku}
                          onChange={(e) => handleSkuChange(e.target.value)}
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 transition-colors ${
                            validationErrors.mainSku || skuValid === false 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          placeholder="Ej: TORTA001"
                          required
                          disabled={saveLoading}
                          maxLength={VALIDATION_LIMITS.SKU_MAX_LENGTH}
                        />
                        {skuValidating && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        {!skuValidating && skuValid === true && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {!skuValidating && skuValid === false && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={generateSkuFromName}
                        disabled={!name.trim() || saveLoading}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Auto
                      </button>
                    </div>
                    <div className="mt-1">
                      {validationErrors.mainSku && (
                        <p className="text-xs text-red-600">{validationErrors.mainSku}</p>
                      )}
                      {skuValid === false && (
                        <p className="text-xs text-red-600">Este SKU ya está en uso</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="base-price" className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Base *
                    </label>
                    <input
                      id="base-price"
                      type="number"
                      value={basePrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.basePrice ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="25000"
                      required
                      disabled={saveLoading}
                      min="0"
                      max={VALIDATION_LIMITS.PRICE_MAX_VALUE}
                      step="0.01"
                    />
                    {validationErrors.basePrice && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.basePrice}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="stock-quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad en Stock *
                    </label>
                    <input
                      id="stock-quantity"
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => handleStockChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.stockQuantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="100"
                      required
                      disabled={saveLoading}
                      min="0"
                      max={VALIDATION_LIMITS.STOCK_MAX_VALUE}
                      step="1"
                    />
                    {validationErrors.stockQuantity && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.stockQuantity}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span>Categoría</span>
                      </div>
                    </label>
                    <input
                      id="product-category"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ej: Postres, Bebidas"
                      disabled={saveLoading}
                      maxLength={VALIDATION_LIMITS.PRODUCT_CATEGORY_MAX_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">{category.length}/{VALIDATION_LIMITS.PRODUCT_CATEGORY_MAX_LENGTH} caracteres</p>
                  </div>

                  <div>
                    <label htmlFor="product-position" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-4 w-4" />
                        <span>Posición</span>
                      </div>
                    </label>
                    <input
                      id="product-position"
                      type="number"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="1, 2, 3..."
                      disabled={saveLoading}
                      min="0"
                      step="1"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      id="product-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Describe tu producto..."
                      disabled={saveLoading}
                      maxLength={VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MAX_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/{VALIDATION_LIMITS.PRODUCT_DESCRIPTION_MAX_LENGTH} caracteres</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Multi-Image Upload */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Imágenes del producto (máximo {VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT})</span>
                </h3>
                
                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {image.uploading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <img
                              src={image.url}
                              alt={`Producto ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        
                        {!image.uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up')}
                                  className="p-1 bg-white rounded-full text-gray-600 hover:text-blue-600"
                                  title="Mover arriba"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down')}
                                  className="p-1 bg-white rounded-full text-gray-600 hover:text-blue-600"
                                  title="Mover abajo"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1 bg-white rounded-full text-gray-600 hover:text-red-600"
                                title="Eliminar imagen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {images.length < VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="Subir imágenes del producto"
                  >
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {images.length === 0 ? 'Toca para subir imágenes' : 'Agregar más imágenes'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP, GIF (máx. 5MB cada una) - {images.length}/{VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT}
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_CONFIG.ALLOWED_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  disabled={saveLoading || images.length >= VALIDATION_LIMITS.MAX_IMAGES_PER_PRODUCT}
                />
              </div>

              {/* NUEVO: Variant Management con precio base */}
              <VariantManager
                variants={variants}
                onVariantsChange={setVariants}
                disabled={saveLoading}
                basePrice={parseFloat(basePrice) || 0}
              />

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  disabled={saveLoading}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={
                    saveLoading || 
                    !name.trim() || 
                    !mainSku.trim() || 
                    !basePrice.trim() || 
                    !stockQuantity.trim() || 
                    skuValid === false || 
                    images.some(img => img.uploading) ||
                    Object.values(validationErrors).some(error => error)
                  }
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </LoadingState>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;