# Análisis Técnico Completo - Tu Tiendita Digital

## 1. CONFIGURACIÓN Y SEGURIDAD

### Sitios Desplegados en Netlify
**Sitio Principal:**
- Nombre: `catalog-management-system` (inferido del package.json)
- URL de producción: `https://tutiendita.digital`
- URL de Netlify: `https://[site-id].netlify.app` (requiere acceso al dashboard para confirmar)

### Análisis de Políticas RLS

#### Tabla `users`
```sql
-- Políticas implementadas:
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT USING (true);
```

#### Tabla `products`
```sql
-- Políticas implementadas:
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);
```

#### Tabla `product_images`
```sql
-- Políticas implementadas:
CREATE POLICY "Users can view own product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product images" ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product images" ON product_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product images" ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);
```

#### Tabla `product_variants`
```sql
-- Políticas implementadas:
CREATE POLICY "Users can view own product variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (true);
```

## 2. GESTIÓN DE PRODUCTOS

### Mecanismo de Generación/Asignación de SKUs

#### Función de Generación Automática:
```typescript
export const generateUniqueSKU = async (baseName: string): Promise<string> => {
  try {
    const baseSku = baseName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
    
    if (!baseSku) {
      // Fallback si no hay caracteres válidos
      return `SKU${Date.now().toString().slice(-8)}`;
    }
    
    let counter = 1;
    let sku = baseSku;
    
    // Intenta hasta 999 variaciones
    while (counter <= 999) {
      const isValid = await validateSKU(sku);
      if (isValid) {
        return sku;
      }
      
      sku = `${baseSku}${counter.toString().padStart(3, '0')}`;
      counter++;
    }
    
    // Fallback final con timestamp
    return `SKU${Date.now().toString().slice(-8)}`;
  } catch (error) {
    console.error('Error generating unique SKU:', error);
    // Fallback último
    return `SKU${Date.now().toString().slice(-8)}`;
  }
};
```

#### Validación de SKU:
```typescript
export const validateSKU = async (sku: string, excludeProductId?: string): Promise<boolean> => {
  try {
    // Verifica SKUs principales de productos
    let productQuery = supabase
      .from('products')
      .select('id')
      .eq('main_sku', sku);

    if (excludeProductId) {
      productQuery = productQuery.neq('id', excludeProductId);
    }

    const productPromise = productQuery.maybeSingle();

    // Verifica SKUs de variantes
    const variantPromise = supabase
      .from('product_variants')
      .select('id')
      .eq('sku', sku)
      .maybeSingle();

    const [{ data: productData, error: productError }, { data: variantData, error: variantError }] = 
      await Promise.all([productPromise, variantPromise]);

    return !productData && !variantData;
  } catch (error: any) {
    console.error('Error validating SKU:', error);
    return false; // Asume inválido en caso de error
  }
};
```

### Lógica de Sincronización de Stock

**No hay sincronización automática entre `stock_quantity` en `products` y `product_variants`.**

- `products.stock_quantity`: Stock del producto base
- `product_variants.stock_quantity`: Stock independiente por variante
- **Cálculo total**: Se suma en el frontend para mostrar stock total

```typescript
const displayMetadata = useMemo(() => {
  return {
    totalStock: product.stockQuantity + (product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0),
    // ... otros campos
  };
}, [product.stockQuantity, product.variants]);
```

### Código de Filtrado por Categorías

```typescript
// En PublicCatalog.tsx
const categories = useMemo((): string[] => {
  return Array.from(new Set(availableProducts.filter(p => p.category).map(p => p.category!))).sort();
}, [availableProducts]);

const filteredProducts = useMemo((): Product[] => {
  return availableProducts.filter(product => 
    selectedCategory ? product.category === selectedCategory : true
  );
}, [availableProducts, selectedCategory]);

// Renderizado de filtros
<div className="flex items-center space-x-2 overflow-x-auto pb-2">
  <button
    onClick={() => handleCategoryChange('')}
    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      selectedCategory === '' 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    <span>Todos</span>
    {selectedCategory === '' && (
      <span className="text-xs">({availableProducts.length})</span>
    )}
  </button>
  {categories.map((category) => {
    const categoryCount = availableProducts.filter(p => p.category === category).length;
    return (
      <button
        key={category}
        onClick={() => handleCategoryChange(category)}
        className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          selectedCategory === category 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Tag className="h-3 w-3" />
        <span>{category}</span>
        <span className="text-xs">({categoryCount})</span>
      </button>
    );
  })}
</div>
```

## 3. EXPERIENCIA DE USUARIO

### Redirección sin Onboarding Completado

```typescript
// En App.tsx - ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading, connectionError } = useAuth();

  if (connectionError) {
    return <ConnectionError />;
  }

  if (loading) {
    return <LoadingState isLoading={true} message="Cargando..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // REDIRECCIÓN AUTOMÁTICA SI NO COMPLETÓ ONBOARDING
  if (!userProfile?.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
```

**Comportamiento**: Si un usuario autenticado intenta acceder a `/dashboard` sin completar el onboarding, se renderiza automáticamente el `OnboardingWizard` en lugar de redirigir a otra ruta.

### Datos Disponibles en Componente WhatsApp

```typescript
// En PublicCatalog.tsx
const generateWhatsAppUrl = useCallback((product: Product, selectedVariantId?: string) => {
  if (!storeOwner?.whatsappNumber) return '#';
  
  let message = `Hola! Te escribo por el producto '${product.name}'`;
  
  // DATOS DE VARIANTE DISPONIBLES:
  if (selectedVariantId && product.variants) {
    const variant = product.variants.find(v => v.id === selectedVariantId);
    if (variant) {
      message += ` - ${variant.name}`;
      // Disponible: variant.sku, variant.priceModifier, variant.stockQuantity
    }
  }
  
  message += ' que vi en tu catálogo.';
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${storeOwner.whatsappNumber}?text=${encodedMessage}`;
}, [storeOwner?.whatsappNumber]);

// DATOS DEL PRODUCTO DISPONIBLES:
// - product.id, product.name, product.description
// - product.mainSku, product.basePrice, product.stockQuantity
// - product.category, product.isAvailable
// - product.images (array completo con URLs)
// - product.variants (array completo con todos los campos)

// DATOS DE TIENDA DISPONIBLES:
// - storeOwner.storeName, storeOwner.whatsappNumber
```

## 4. MANEJO DE IMÁGENES

### Procesamiento/Compresión de Imágenes

**SÍ existe procesamiento automático:**

```typescript
// En ProductForm.tsx
const compressImage = useCallback(async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        const maxWidth = IMAGE_CONFIG.MAX_WIDTH; // 1200px
        const maxHeight = IMAGE_CONFIG.MAX_HEIGHT; // 1200px
        let { width, height } = img;

        // Redimensionamiento proporcional
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
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: IMAGE_CONFIG.FORMAT, // 'image/jpeg'
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          IMAGE_CONFIG.FORMAT, // 'image/jpeg'
          IMAGE_CONFIG.QUALITY  // 0.8 (80%)
        );
      } catch (error) {
        reject(error);
      }
    };

    img.src = URL.createObjectURL(file);
  });
}, []);
```

**Configuración de Compresión:**
```typescript
export const IMAGE_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
  QUALITY: 0.8,
  FORMAT: 'image/jpeg',
} as const;
```

### Credenciales de Azure AI

**NO están configuradas credenciales de Azure AI para moderación de contenido.**

El proyecto actualmente no incluye:
- Variables de entorno para Azure AI
- Integración con Azure Content Moderator
- Validación automática de contenido de imágenes

**Recomendación**: Para implementar moderación de contenido, se necesitarían:
```typescript
// Variables de entorno requeridas:
AZURE_AI_ENDPOINT=
AZURE_AI_KEY=
AZURE_AI_REGION=

// Integración en el flujo de subida de imágenes
const moderateImage = async (imageBlob: Blob) => {
  // Llamada a Azure Content Moderator API
  // Validación de contenido inapropiado
  // Retorno de resultado de moderación
};
```

## RESUMEN DE ESTADO ACTUAL

✅ **Funcional y Seguro:**
- RLS implementado correctamente en todas las tablas
- Sistema de SKUs únicos con validación cruzada
- Compresión automática de imágenes
- Filtrado por categorías optimizado

⚠️ **Áreas de Mejora:**
- No hay sincronización automática de stock entre producto base y variantes
- Falta moderación de contenido para imágenes
- No hay credenciales de Azure AI configuradas

🔧 **Configuración Pendiente:**
- Confirmación de URLs exactas de Netlify (requiere acceso al dashboard)
- Implementación de moderación de contenido
- Posible sincronización de inventarios si se requiere