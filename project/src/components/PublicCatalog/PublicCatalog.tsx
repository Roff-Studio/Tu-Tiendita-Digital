import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicCatalogData, Product } from '../../lib/supabase';
import { MessageCircle, Store, Image as ImageIcon, Tag, Filter, X, ChevronLeft, ChevronRight, Package, DollarSign, ToggleLeft, ToggleRight, Users, ShoppingCart, Loader } from 'lucide-react';
import useProductSelection from '../../hooks/useProductSelection';
import ProductSelectionCard from './ProductSelectionCard';
import FloatingActionButton from './FloatingActionButton';
import SelectionSummary from './SelectionSummary';
import AboutUsTrigger from '../Brand/AboutUsTrigger';
import AboutUsModal from '../Brand/AboutUsModal';
import ImageCarousel from './ImageCarousel';
import ProductVariantSelector from './ProductVariantSelector';
import FilterSection from './FilterSection';
import ProductCard from './ProductCard';
import ErrorBoundary from '../common/ErrorBoundary';
import { useInView } from '../../hooks/useInView';

interface StoreOwner {
  storeName: string;
  whatsappNumber: string;
}

interface PublicCatalogProps {}

const PRODUCTS_PER_PAGE = 20;

const PublicCatalog: React.FC<PublicCatalogProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeOwner, setStoreOwner] = useState<StoreOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectionMode, setSelectionMode] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSelectionSummary, setShowSelectionSummary] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs for cleanup and pagination
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadMoreVisible = useInView(loadMoreRef);

  // Product selection hook
  const {
    selectedProducts,
    totalCount,
    totalItems,
    isSelected,
    getSelectedProduct,
    addProduct,
    removeProduct,
    updateQuantity,
    clearSelection,
    generateWhatsAppUrl
  } = useProductSelection();

  // Fetch initial data
  useEffect(() => {
    mountedRef.current = true;

    const fetchInitialData = async () => {
      if (!slug) {
        if (mountedRef.current) {
          setError('URL de tienda no válida');
          setInitialLoading(false);
        }
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        console.log('🚀 Fetching initial catalog data for:', slug);

        const { storeOwner: owner, products: initialProducts } = await fetchPublicCatalogData(slug, 1, PRODUCTS_PER_PAGE);

        if (signal.aborted || !mountedRef.current) return;

        setStoreOwner(owner);
        setProducts(initialProducts);
        setHasMore(initialProducts.length === PRODUCTS_PER_PAGE);

        // Update page title and meta tags for SEO
        document.title = `${owner.storeName} - Catálogo de Productos`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', `Explora el catálogo de productos de ${owner.storeName}. Encuentra los mejores productos y contacta directamente por WhatsApp.`);
        }

      } catch (error: any) {
        if (!signal.aborted && mountedRef.current) {
          console.error('Error fetching store data:', error);
          setError(error.message || 'Error al cargar la tienda');
        }
      } finally {
        if (!signal.aborted && mountedRef.current) {
          setInitialLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      console.log('🧹 PublicCatalog: Cleaning up...');
      mountedRef.current = false;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [slug]);

  // Load more products when scrolling
  useEffect(() => {
    if (isLoadMoreVisible && hasMore && !loadingMore && !initialLoading) {
      loadMoreProducts();
    }
  }, [isLoadMoreVisible, hasMore, loadingMore, initialLoading]);

  // Load more products
  const loadMoreProducts = useCallback(async () => {
    if (!slug || !hasMore || loadingMore || initialLoading) return;

    setLoadingMore(true);
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const nextPage = page + 1;
      console.log(`🔄 Loading more products (page ${nextPage})...`);

      const { products: newProducts } = await fetchPublicCatalogData(slug, nextPage, PRODUCTS_PER_PAGE);

      if (signal.aborted || !mountedRef.current) return;

      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      if (!signal.aborted && mountedRef.current) {
        console.error('Error loading more products:', error);
      }
    } finally {
      if (!signal.aborted && mountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [slug, page, hasMore, loadingMore, initialLoading]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
    // Reset pagination when changing category
    setPage(1);
    setHasMore(true);
    setProducts([]);
    setLoading(true);

    // Fetch products with the new category filter
    const fetchCategoryProducts = async () => {
      if (!slug) return;

      try {
        const { products: filteredProducts } = await fetchPublicCatalogData(
          slug,
          1,
          PRODUCTS_PER_PAGE,
          category
        );

        if (mountedRef.current) {
          setProducts(filteredProducts);
          setHasMore(filteredProducts.length === PRODUCTS_PER_PAGE);
          setLoading(false);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.error('Error fetching category products:', error);
          setLoading(false);
        }
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  // Toggle category filter visibility
  const toggleCategoryFilter = useCallback(() => {
    setShowCategoryFilter(prev => !prev);
  }, []);

  // Product selection handlers
  const handleAddToSelection = useCallback((product: Product, variantId?: string, quantity?: number) => {
    addProduct(product, variantId, quantity);
  }, [addProduct]);

  const handleRemoveFromSelection = useCallback((productId: string, variantId?: string) => {
    removeProduct(productId, variantId);
  }, [removeProduct]);

  const handleUpdateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    updateQuantity(productId, variantId, quantity);
  }, [updateQuantity]);

  const handleSendWhatsApp = useCallback(() => {
    if (storeOwner) {
      console.log('WhatsApp message sent with', totalCount, 'products');
    }
  }, [storeOwner, totalCount]);

  // Generate WhatsApp URL for single product
  const generateWhatsAppUrlSingle = useCallback((product: Product, selectedVariantId?: string) => {
    if (!storeOwner?.whatsappNumber) return '#';

    let message = `Hola! Te escribo por el producto '${product.name}'`;

    // Add variant information if selected
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (variant) {
        message += ` - ${variant.name}`;
      }
    }

    message += ' que vi en tu catálogo.';

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${storeOwner.whatsappNumber}?text=${encodedMessage}`;
  }, [storeOwner?.whatsappNumber]);

  // Memoized values
  const availableProducts = useMemo(() => {
    return products.filter(p => p.isAvailable);
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(new Set(availableProducts.filter(p => p.category).map(p => p.category!))).sort();
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    // If we're using the API-based filtering, the products are already filtered
    if (selectedCategory) {
      return availableProducts;
    }
    return availableProducts;
  }, [availableProducts, selectedCategory]);

  const productStats = useMemo(() => {
    return {
      total: filteredProducts.length,
      hasCategory: selectedCategory !== '',
      hasMore: hasMore
    };
  }, [filteredProducts.length, selectedCategory, hasMore]);

  // Generate WhatsApp URL for multiple products
  const whatsAppUrl = useMemo(() => {
    return storeOwner ? generateWhatsAppUrl(storeOwner) : '#';
  }, [storeOwner, generateWhatsAppUrl]);

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando catálogo...</h2>
          <p className="text-gray-600">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">{error}</h2>
            <p className="text-red-600">Verifica que la URL sea correcta</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Store className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{storeOwner?.storeName}</h1>
              </div>
              <p className="text-gray-600 text-lg">Catálogo de productos</p>

              {/* ENHANCED: Prominent Selection Mode Toggle */}
              <div className="flex items-center justify-center space-x-6 mt-6">
                <p className="text-sm text-gray-500">
                  {productStats.total} producto{productStats.total !== 1 ? 's' : ''} disponible{productStats.total !== 1 ? 's' : ''}
                  {productStats.hasCategory && ` en "${selectedCategory}"`}
                </p>

                {/* ENHANCED: Prominent Selection Mode Toggle Button */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-6 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    {selectionMode ? (
                      <Users className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 text-gray-500" />
                    )}
                    <span className={`font-medium text-sm ${selectionMode ? 'text-blue-700' : 'text-gray-600'}`}>
                      Selección Múltiple
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectionMode(!selectionMode)}
                    className={`flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 ${
                      selectionMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={selectionMode ? 'Cambiar a selección individual' : 'Cambiar a selección múltiple'}
                  >
                    {selectionMode ? (
                      <>
                        <ToggleRight className="h-5 w-5" />
                        <span className="text-sm font-medium">Activo</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Inactivo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ENHANCED: Helper Text for Selection Mode */}
              {selectionMode && (
                <div className="mt-3 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Selecciona múltiples productos y envía todo por WhatsApp</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Filter Section Component */}
        <FilterSection
          categories={categories}
          selectedCategory={selectedCategory}
          showCategoryFilter={showCategoryFilter}
          toggleCategoryFilter={toggleCategoryFilter}
          handleCategoryChange={handleCategoryChange}
          availableProducts={availableProducts}
        />

        {/* Enhanced Products Grid */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                {selectedCategory
                  ? `No hay productos disponibles en "${selectedCategory}"`
                  : availableProducts.length === 0
                    ? 'No hay productos disponibles'
                    : 'No hay productos en esta categoría'
                }
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedCategory
                  ? 'Prueba con otra categoría'
                  : 'Esta tienda aún no tiene productos disponibles en su catálogo'
                }
              </p>
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ErrorBoundary key={product.id}>
                    {selectionMode ? (
                      <ProductSelectionCard
                        product={product}
                        isSelected={isSelected(product.id)}
                        selectedProduct={getSelectedProduct(product.id)}
                        onAddToSelection={handleAddToSelection}
                        onRemoveFromSelection={handleRemoveFromSelection}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ) : (
                      <ProductCard
                        product={product}
                        generateWhatsAppUrlSingle={generateWhatsAppUrlSingle}
                      />
                    )}
                  </ErrorBoundary>
                ))}
              </div>

              {/* Load More Section */}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center mt-8 pb-8"
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Cargando más productos...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMoreProducts}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Cargar más productos
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* Floating Action Button - only show in selection mode */}
        {selectionMode && (
          <FloatingActionButton
            totalCount={totalCount}
            totalItems={totalItems}
            onClick={() => setShowSelectionSummary(true)}
          />
        )}

        {/* Selection Summary Modal */}
        <SelectionSummary
          isOpen={showSelectionSummary}
          onClose={() => setShowSelectionSummary(false)}
          selectedProducts={selectedProducts}
          totalCount={totalCount}
          totalItems={totalItems}
          onRemoveProduct={handleRemoveFromSelection}
          onUpdateQuantity={handleUpdateQuantity}
          onClearSelection={clearSelection}
          onSendWhatsApp={handleSendWhatsApp}
          whatsAppUrl={whatsAppUrl}
          storeName={storeOwner?.storeName || ''}
        />

        {/* About Us Modal */}
        <AboutUsModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />

        {/* Floating About Us Trigger */}
        <AboutUsTrigger
          onClick={() => setShowAboutModal(true)}
          variant="floating"
        />

        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Brand */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Store className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Tu Tiendita Digital</span>
                </div>
                <p className="text-sm text-gray-600">
                  Democratizando el comercio digital para emprendedores latinoamericanos.
                </p>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a
                      href="/privacidad"
                      className="hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidad
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terminos"
                      className="hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Términos de Servicio
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contacto</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>contacto@roffstudio.com</li>
                  <li>roberto.vt@roffstudio.com</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 text-center">
              <p className="text-sm text-gray-500">
                © 2025 Tu Tiendita Digital. Hecho con ❤️ para emprendedores. By{' '}
                <a
                  href="https://www.roffstudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ROFF Studio
                </a>.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default PublicCatalog;