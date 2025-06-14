// FIXED: Centralized validation utilities with proper type safety

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('El correo electrónico es requerido');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('El formato del correo electrónico no es válido');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('La contraseña es requerida');
  } else if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStoreSlug = (slug: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!slug.trim()) {
    errors.push('La URL de la tienda es requerida');
  } else {
    if (slug.length < 3) {
      errors.push('La URL debe tener al menos 3 caracteres');
    }
    
    if (slug.length > 50) {
      errors.push('La URL no puede exceder 50 caracteres');
    }
    
    const slugRegex = /^[a-z0-9\-_]+$/;
    if (!slugRegex.test(slug)) {
      errors.push('La URL solo puede contener letras minúsculas, números, guiones y guiones bajos');
    }
    
    if (slug.startsWith('-') || slug.startsWith('_') || slug.endsWith('-') || slug.endsWith('_')) {
      errors.push('La URL no puede comenzar o terminar con guiones o guiones bajos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStoreName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('El nombre de la tienda es requerido');
  } else {
    if (name.trim().length < 2) {
      errors.push('El nombre de la tienda debe tener al menos 2 caracteres');
    }
    
    if (name.length > 100) {
      errors.push('El nombre de la tienda no puede exceder 100 caracteres');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateWhatsAppNumber = (number: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!number.trim()) {
    errors.push('El número de WhatsApp es requerido');
  } else {
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    if (cleanNumber.length < 10) {
      errors.push('El número de WhatsApp debe tener al menos 10 dígitos');
    }
    
    if (cleanNumber.length > 15) {
      errors.push('El número de WhatsApp no puede exceder 15 dígitos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProductName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('El nombre del producto es requerido');
  } else {
    if (name.trim().length < 2) {
      errors.push('El nombre del producto debe tener al menos 2 caracteres');
    }
    
    if (name.length > 100) {
      errors.push('El nombre del producto no puede exceder 100 caracteres');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSKU = (sku: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!sku.trim()) {
    errors.push('El SKU es requerido');
  } else {
    if (sku.trim().length < 3) {
      errors.push('El SKU debe tener al menos 3 caracteres');
    }
    
    if (sku.length > 50) {
      errors.push('El SKU no puede exceder 50 caracteres');
    }
    
    const skuRegex = /^[A-Z0-9\-_]+$/;
    if (!skuRegex.test(sku)) {
      errors.push('El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePrice = (price: string | number): ValidationResult => {
  const errors: string[] = [];
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    errors.push('El precio debe ser un número válido');
  } else if (numPrice < 0) {
    errors.push('El precio no puede ser negativo');
  } else if (numPrice > 999999999) {
    errors.push('El precio es demasiado alto');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStock = (stock: string | number): ValidationResult => {
  const errors: string[] = [];
  
  const numStock = typeof stock === 'string' ? parseInt(stock) : stock;
  
  if (isNaN(numStock)) {
    errors.push('La cantidad en stock debe ser un número válido');
  } else if (numStock < 0) {
    errors.push('La cantidad en stock no puede ser negativa');
  } else if (numStock > 999999) {
    errors.push('La cantidad en stock es demasiado alta');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const cleanSlug = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '') // Only allow letters, numbers, hyphens, underscores
    .replace(/[-_]{2,}/g, '-') // Replace multiple consecutive special chars with single hyphen
    .replace(/^[-_]+|[-_]+$/g, '') // Remove leading/trailing special chars
    .substring(0, 50); // Limit to 50 characters
};

export const cleanSKU = (input: string): string => {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9\-_]/g, '') // Only allow letters, numbers, hyphens, underscores
    .substring(0, 50); // Limit to 50 characters
};

export const formatWhatsAppNumber = (input: string): string => {
  return input.replace(/[^\d]/g, ''); // Remove all non-digit characters
};

// Comprehensive validation for forms
export const validateOnboardingForm = (data: {
  storeName: string;
  storeSlug: string;
  whatsappNumber: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateStoreName(data.storeName);
  const slugValidation = validateStoreSlug(data.storeSlug);
  const whatsappValidation = validateWhatsAppNumber(data.whatsappNumber);
  
  errors.push(...nameValidation.errors);
  errors.push(...slugValidation.errors);
  errors.push(...whatsappValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProductForm = (data: {
  name: string;
  mainSku: string;
  basePrice: string;
  stockQuantity: string;
  description?: string;
  category?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateProductName(data.name);
  const skuValidation = validateSKU(data.mainSku);
  const priceValidation = validatePrice(data.basePrice);
  const stockValidation = validateStock(data.stockQuantity);
  
  errors.push(...nameValidation.errors);
  errors.push(...skuValidation.errors);
  errors.push(...priceValidation.errors);
  errors.push(...stockValidation.errors);
  
  if (data.description && data.description.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }
  
  if (data.category && data.category.length > 50) {
    errors.push('La categoría no puede exceder 50 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};