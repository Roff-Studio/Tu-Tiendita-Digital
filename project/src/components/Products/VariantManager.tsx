import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ProductVariant, validateSKU, generateUniqueSKU } from '../../lib/supabase';
import { validateSKU as validateSKUUtil, cleanSKU } from '../../utils/validation';
import { VALIDATION_LIMITS, TIMEOUTS, ERROR_MESSAGES } from '../../utils/constants';
import { Plus, Trash2, AlertCircle, CheckCircle, Package2, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  disabled?: boolean;
  basePrice: number; // NUEVO: Precio base del producto para cálculos
}

interface VariantFormData {
  id?: string;
  name: string;
  sku: string;
  finalPrice: string; // NUEVO: Campo para precio final
  priceModifier: string;
  stockQuantity: string;
  isAvailable: boolean;
  skuValid?: boolean | null;
  skuValidating?: boolean;
  validationErrors?: Record<string, string>;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  onVariantsChange,
  disabled = false,
  basePrice = 0
}) => {
  const [variantForms, setVariantForms] = useState<VariantFormData[]>(
    variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      finalPrice: (basePrice + v.priceModifier).toString(),
      priceModifier: v.priceModifier.toString(),
      stockQuantity: v.stockQuantity.toString(),
      isAvailable: v.isAvailable,
      skuValid: true,
      validationErrors: {}
    }))
  );

  // FIXED: Memory management with refs
  const mountedRef = useRef(true);
  const skuTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());

  // NUEVO: Función para calcular el modificador de precio
  const calculatePriceModifier = useCallback((finalPrice: number): number => {
    return finalPrice - basePrice;
  }, [basePrice]);

  // NUEVO: Función para formatear la diferencia de precio
  const formatPriceDifference = useCallback((modifier: number) => {
    if (modifier === 0) return null;
    
    const absModifier = Math.abs(modifier);
    const sign = modifier > 0 ? '+' : '-';
    const color = modifier > 0 ? 'text-green-600' : 'text-red-600';
    const icon = modifier > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    
    return {
      text: `(${sign}$${absModifier.toLocaleString()})`,
      color,
      icon
    };
  }, []);

  // FIXED: Enhanced SKU validation with proper cleanup and local state checking
  const validateVariantSku = useCallback(async (sku: string, index: number) => {
    if (!sku.trim() || sku.length < VALIDATION_LIMITS.SKU_MIN_LENGTH || !mountedRef.current) {
      setVariantForms(prev => prev.map((form, i) => 
        i === index ? { ...form, skuValid: null } : form
      ));
      return;
    }

    // FIXED: Check for local duplicates first
    const isDuplicateLocal = variantForms.some((form, i) => 
      i !== index && form.sku.trim().toLowerCase() === sku.trim().toLowerCase()
    );

    if (isDuplicateLocal) {
      setVariantForms(prev => prev.map((form, i) => 
        i === index ? { ...form, skuValid: false, skuValidating: false } : form
      ));
      return;
    }

    // Cancel previous request for this index
    const existingController = abortControllersRef.current.get(index);
    if (existingController) {
      existingController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllersRef.current.set(index, controller);
    const signal = controller.signal;

    setVariantForms(prev => prev.map((form, i) => 
      i === index ? { ...form, skuValidating: true } : form
    ));

    try {
      const isValid = await validateSKU(sku.trim());
      
      if (!signal.aborted && mountedRef.current) {
        setVariantForms(prev => prev.map((form, i) => 
          i === index ? { ...form, skuValid: isValid, skuValidating: false } : form
        ));
      }
    } catch (error) {
      if (!signal.aborted && mountedRef.current) {
        console.error('SKU validation error:', error);
        setVariantForms(prev => prev.map((form, i) => 
          i === index ? { ...form, skuValid: false, skuValidating: false } : form
        ));
      }
    } finally {
      abortControllersRef.current.delete(index);
    }
  }, [variantForms]);

  // FIXED: Enhanced SKU generation with proper error handling
  const generateVariantSku = useCallback(async (name: string, index: number) => {
    if (!name.trim() || !mountedRef.current) return;
    
    try {
      const generatedSku = await generateUniqueSKU(name);
      if (mountedRef.current) {
        setVariantForms(prev => prev.map((form, i) => 
          i === index ? { ...form, sku: generatedSku, skuValid: true } : form
        ));
      }
    } catch (error) {
      console.error('SKU generation error:', error);
      if (mountedRef.current) {
        setVariantForms(prev => prev.map((form, i) => 
          i === index ? { 
            ...form, 
            validationErrors: { 
              ...form.validationErrors, 
              sku: 'Error al generar SKU automático' 
            } 
          } : form
        ));
      }
    }
  }, []);

  // NUEVO: Validación mejorada para precio final
  const validateVariantField = useCallback((index: number, field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'El nombre de la variante es requerido';
        } else if (value.length > 50) {
          errors.name = 'El nombre no puede exceder 50 caracteres';
        }
        break;
      case 'sku':
        const skuValidation = validateSKUUtil(value);
        if (!skuValidation.isValid) {
          errors.sku = skuValidation.errors[0];
        }
        break;
      case 'finalPrice':
        const price = parseFloat(value);
        if (!value.trim()) {
          errors.finalPrice = 'El precio final es requerido';
        } else if (isNaN(price)) {
          errors.finalPrice = 'Debe ser un número válido';
        } else if (price <= 0) {
          errors.finalPrice = 'El precio debe ser mayor a 0';
        } else if (price > VALIDATION_LIMITS.PRICE_MAX_VALUE) {
          errors.finalPrice = 'El precio es demasiado alto';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          errors.finalPrice = 'Máximo 2 decimales permitidos';
        }
        break;
      case 'stockQuantity':
        const stock = parseInt(value);
        if (isNaN(stock) || stock < 0) {
          errors.stockQuantity = 'Debe ser un número válido mayor o igual a 0';
        } else if (stock > VALIDATION_LIMITS.STOCK_MAX_VALUE) {
          errors.stockQuantity = 'La cantidad es demasiado alta';
        }
        break;
    }

    setVariantForms(prev => prev.map((form, i) => 
      i === index ? { 
        ...form, 
        validationErrors: { 
          ...form.validationErrors, 
          [field]: errors[field] || '' 
        } 
      } : form
    ));
  }, []);

  // FIXED: Enhanced variant update with validation
  const updateVariants = useCallback((forms: VariantFormData[]) => {
    const validVariants = forms
      .filter(form => {
        const hasRequiredFields = form.name.trim() && form.sku.trim() && form.finalPrice.trim();
        const hasNoValidationErrors = !Object.values(form.validationErrors || {}).some(error => error);
        return hasRequiredFields && hasNoValidationErrors;
      })
      .map(form => {
        const finalPrice = parseFloat(form.finalPrice) || 0;
        const priceModifier = calculatePriceModifier(finalPrice);
        
        return {
          id: form.id || '',
          productId: '',
          name: form.name.trim(),
          sku: form.sku.trim(),
          priceModifier: priceModifier,
          stockQuantity: parseInt(form.stockQuantity) || 0,
          isAvailable: form.isAvailable,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
    
    onVariantsChange(validVariants);
  }, [onVariantsChange, calculatePriceModifier]);

  const addVariant = useCallback(() => {
    const newVariant: VariantFormData = {
      name: '',
      sku: '',
      finalPrice: basePrice.toString(),
      priceModifier: '0',
      stockQuantity: '0',
      isAvailable: true,
      skuValid: null,
      validationErrors: {}
    };
    
    const newForms = [...variantForms, newVariant];
    setVariantForms(newForms);
    updateVariants(newForms);
  }, [variantForms, updateVariants, basePrice]);

  const removeVariant = useCallback((index: number) => {
    // Clear timeouts and abort controllers for this index
    const timeout = skuTimeoutsRef.current.get(index);
    if (timeout) {
      clearTimeout(timeout);
      skuTimeoutsRef.current.delete(index);
    }

    const controller = abortControllersRef.current.get(index);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(index);
    }

    const newForms = variantForms.filter((_, i) => i !== index);
    setVariantForms(newForms);
    updateVariants(newForms);
  }, [variantForms, updateVariants]);

  // NUEVO: Manejo específico para precio final
  const updateVariantFinalPrice = useCallback((index: number, finalPriceValue: string) => {
    const finalPrice = parseFloat(finalPriceValue) || 0;
    const priceModifier = calculatePriceModifier(finalPrice);

    const newForms = variantForms.map((form, i) => 
      i === index ? { 
        ...form, 
        finalPrice: finalPriceValue,
        priceModifier: priceModifier.toString()
      } : form
    );
    
    setVariantForms(newForms);
    updateVariants(newForms);
    validateVariantField(index, 'finalPrice', finalPriceValue);
  }, [variantForms, updateVariants, validateVariantField, calculatePriceModifier]);

  // FIXED: Enhanced variant form update with validation
  const updateVariantForm = useCallback((index: number, field: keyof VariantFormData, value: any) => {
    let processedValue = value;

    // Process specific fields
    if (field === 'sku') {
      processedValue = cleanSKU(value);
    }

    const newForms = variantForms.map((form, i) => 
      i === index ? { ...form, [field]: processedValue } : form
    );
    setVariantForms(newForms);
    updateVariants(newForms);

    // Validate field
    if (typeof processedValue === 'string') {
      validateVariantField(index, field, processedValue);
    }

    // Handle SKU validation with debouncing
    if (field === 'sku' && typeof processedValue === 'string') {
      // Clear previous timeout
      const existingTimeout = skuTimeoutsRef.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (processedValue.trim().length >= VALIDATION_LIMITS.SKU_MIN_LENGTH) {
        const timeoutId = setTimeout(() => {
          validateVariantSku(processedValue, index);
        }, TIMEOUTS.SLUG_CHECK_DEBOUNCE);
        
        skuTimeoutsRef.current.set(index, timeoutId);
      } else {
        setVariantForms(prev => prev.map((form, i) => 
          i === index ? { ...form, skuValid: null } : form
        ));
      }
    }
  }, [variantForms, updateVariants, validateVariantField, validateVariantSku]);

  // FIXED: Enhanced validation checks
  const hasInvalidSkus = variantForms.some(form => 
    form.sku.trim() && form.skuValid === false
  );

  const hasDuplicateSkus = () => {
    const skus = variantForms.map(form => form.sku.trim()).filter(Boolean);
    return skus.length !== new Set(skus).size;
  };

  const hasValidationErrors = variantForms.some(form => 
    Object.values(form.validationErrors || {}).some(error => error)
  );

  // FIXED: Proper cleanup in useEffect
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      console.log('🧹 VariantManager: Cleaning up...');
      mountedRef.current = false;
      
      // Clear all timeouts
      skuTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      skuTimeoutsRef.current.clear();
      
      // Abort all pending requests
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Package2 className="h-5 w-5" />
          <span>Variantes del Producto</span>
        </h3>
        <button
          type="button"
          onClick={addVariant}
          disabled={disabled}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Variante</span>
        </button>
      </div>

      {/* NUEVO: Información del precio base */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Precio Base del Producto</h4>
        </div>
        <p className="text-2xl font-bold text-blue-800">${basePrice.toLocaleString()}</p>
        <p className="text-sm text-blue-700 mt-1">
          Los precios de las variantes se calculan automáticamente basándose en este precio base.
        </p>
      </div>

      {variantForms.length === 0 ? (
        <div className="text-center py-8">
          <Package2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            No hay variantes configuradas. Las variantes te permiten ofrecer diferentes opciones del mismo producto.
          </p>
          <p className="text-sm text-gray-400">
            Ejemplos: Tallas (S, M, L), Colores (Rojo, Azul), Sabores (Chocolate, Vainilla)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* FIXED: Enhanced validation warnings */}
          {hasInvalidSkus && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">
                Algunos SKUs de variantes ya están en uso. Por favor, corrígelos antes de guardar.
              </p>
            </div>
          )}

          {hasDuplicateSkus() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-orange-600 text-sm">
                Hay SKUs duplicados entre las variantes. Cada SKU debe ser único.
              </p>
            </div>
          )}

          {hasValidationErrors && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-600 text-sm">
                Hay errores de validación en algunos campos. Por favor, corrígelos antes de continuar.
              </p>
            </div>
          )}

          {/* Variant Forms */}
          {variantForms.map((variant, index) => {
            const finalPrice = parseFloat(variant.finalPrice) || 0;
            const priceModifier = calculatePriceModifier(finalPrice);
            const priceDifference = formatPriceDifference(priceModifier);

            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Variante {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={disabled}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Eliminar variante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Variante *
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariantForm(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        variant.validationErrors?.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Ej: Talla M, Color Rojo"
                      disabled={disabled}
                      maxLength={50}
                    />
                    {variant.validationErrors?.name && (
                      <p className="text-xs text-red-600 mt-1">{variant.validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU de Variante *
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariantForm(index, 'sku', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 transition-colors ${
                            variant.validationErrors?.sku || variant.skuValid === false
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          placeholder="Ej: TORTA001-M"
                          disabled={disabled}
                          maxLength={VALIDATION_LIMITS.SKU_MAX_LENGTH}
                        />
                        {variant.skuValidating && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        {!variant.skuValidating && variant.skuValid === true && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                        {!variant.skuValidating && variant.skuValid === false && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => generateVariantSku(variant.name, index)}
                        disabled={!variant.name.trim() || disabled}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        Auto
                      </button>
                    </div>
                    {variant.validationErrors?.sku && (
                      <p className="text-xs text-red-600 mt-1">{variant.validationErrors.sku}</p>
                    )}
                    {variant.skuValid === false && !variant.validationErrors?.sku && (
                      <p className="text-xs text-red-600 mt-1">SKU ya en uso</p>
                    )}
                  </div>

                  {/* NUEVO: Campo de precio final con indicador visual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Final de Variante *
                      <span 
                        className="ml-1 text-gray-400 cursor-help" 
                        title="Ingresa el precio final que quieres para esta variante. El sistema calculará automáticamente la diferencia con el precio base."
                      >
                        ℹ️
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </div>
                      <input
                        type="number"
                        value={variant.finalPrice}
                        onChange={(e) => updateVariantFinalPrice(index, e.target.value)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                          variant.validationErrors?.finalPrice ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="0.00"
                        disabled={disabled}
                        step="0.01"
                        min="0.01"
                        max={VALIDATION_LIMITS.PRICE_MAX_VALUE}
                      />
                    </div>
                    
                    {/* NUEVO: Indicador visual de diferencia */}
                    {priceDifference && (
                      <div className={`flex items-center space-x-1 mt-1 text-xs ${priceDifference.color}`}>
                        {priceDifference.icon}
                        <span>{priceDifference.text}</span>
                      </div>
                    )}
                    
                    {variant.validationErrors?.finalPrice ? (
                      <p className="text-xs text-red-600 mt-1">{variant.validationErrors.finalPrice}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Precio base: ${basePrice.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock de Variante
                    </label>
                    <input
                      type="number"
                      value={variant.stockQuantity}
                      onChange={(e) => updateVariantForm(index, 'stockQuantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        variant.validationErrors?.stockQuantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="0"
                      disabled={disabled}
                      min="0"
                      max={VALIDATION_LIMITS.STOCK_MAX_VALUE}
                      step="1"
                    />
                    {variant.validationErrors?.stockQuantity && (
                      <p className="text-xs text-red-600 mt-1">{variant.validationErrors.stockQuantity}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={variant.isAvailable}
                      onChange={(e) => updateVariantForm(index, 'isAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={disabled}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Variante disponible
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {variantForms.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Información sobre Precios de Variantes</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Precio Final:</strong> Es el precio que verán los clientes para esta variante</li>
            <li>• <strong>Diferencia:</strong> Se calcula automáticamente comparando con el precio base (${basePrice.toLocaleString()})</li>
            <li>• <strong>Formato:</strong> Usa máximo 2 decimales (ej: 25.99)</li>
            <li>• <strong>Validación:</strong> El precio debe ser mayor a 0</li>
            <li>• <strong>Actualización:</strong> Los cambios se reflejan inmediatamente en el catálogo público</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VariantManager;