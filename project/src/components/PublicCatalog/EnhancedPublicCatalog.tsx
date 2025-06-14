import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicCatalogData, Product } from '../../lib/supabase';
import { Store, Filter, X, Tag, Grid, List, Search, SortAsc } from 'lucide-react';
import useProductSelection from '../../hooks/useProductSelection';
import ProductSelectionCard from './ProductSelectionCard';
import FloatingActionButton from './FloatingActionButton';
import SelectionSummary from './SelectionSummary';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

interface StoreOwner {
  storeName: string;
  whatsappNumber: string;
}

const EnhancedPublicCatalog: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeOwner, setStoreOwner] = useState<StoreOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSelectionSummary, setShowSelectionSummary] = useState(false);

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

  // Refs for cleanup
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch store data
  useEffect(() => {
    mountedRef.current = true;

    const fetchStoreData = async () => {
      if (!slug) {
        if (mountedRef.current) {
          setError('URL de tienda no válida');
          setLoading(false);
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
        console.log('🚀 Fetching enhanced public catalog for:', slug);
        
        const { storeOwner: owner, products: productsData } = await fetchPublicCatalogData(slug);

        if (signal.aborted || !mountedRef.current) return;

        setStoreOwner(owner);
        setProducts(productsData);

        // Update page title
        document.title = `${owner.storeName} - Catálogo de Productos`;

      } catch (error: any) {
        if (!signal.aborted && mountedRef.current) {
          console.error('Error fetching store data:', error);
          setError(error.message || 'Error al cargar la tienda');
        }
      } finally {
        if (!signal.aborted && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchStoreData();

    return () => {
      console.log('🧹 EnhancedPublicCatalog: Cleaning up...');
      mountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [slug]);

  // Filter and search logic
  const { categories, filteredProducts, productStats } = useMemo(() => {
    const availableProducts = products.filter(p => p.isAvailable);
    
    // Get unique categories
    const cats = Array.from(new Set(availableProducts.filter(p => p.category).map(p => p.category!))).sort();
    
    // Apply filters
    let filtered = availableProducts;
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.basePrice - b.basePrice;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    const stats = {
      total: filtered.length,
      hasFilters: selectedCategory !== '' || searchQuery.trim() !== ''
    };
    
    return {
      categories: cats,
      filteredProducts: filtered,
      productStats: stats
    };
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Event handlers
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setShowFilters(false);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((sort: 'name' | 'price' | 'newest') => {
    setSortBy(sort);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('newest');
  }, []);

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
      // Analytics could be tracked here
      console.log('WhatsApp message sent with', totalCount, 'products');
    }
  }, [storeOwner, totalCount]);

  // Generate WhatsApp URL
  const whatsAppUrl = useMemo(() => {
    return storeOwner ? generateWhatsAppUrl(storeOwner) : '#';
  }, [storeOwner, generateWhatsAppUrl]);

  if (loading) {
    return (
      <LoadingState 
        isLoading={true} 
        message="Cargando catálogo..." 
        fullScreen 
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-4">Verifica que la URL sea correcta</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{storeOwner?.storeName}</h1>
            <p className="text-gray-600 mt-2">Catálogo de productos</p>
            <p className="text-sm text-gray-500 mt-1">
              {productStats.total} producto{productStats.total !== 1 ? 's' : ''} disponible{productStats.total !== 1 ? 's' : ''}
              {productStats.hasFilters && ' (filtrados)'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Category Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                  {(selectedCategory || searchQuery) && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Activos
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {productStats.hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as 'name' | 'price' | 'newest')}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Más recientes</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="price">Precio menor a mayor</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    aria-label="Vista en cuadrícula"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    aria-label="Vista en lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Options */}
            {showFilters && categories.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === '' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({products.filter(p => p.isAvailable).length})
                  </button>
                  {categories.map((category) => {
                    const categoryCount = products.filter(p => p.isAvailable && p.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
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
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <EmptyState
            type="products"
            title={productStats.hasFilters ? "No se encontraron productos" : "No hay productos disponibles"}
            message={
              productStats.hasFilters 
                ? "Intenta ajustar los filtros de búsqueda para encontrar productos."
                : "Esta tienda aún no tiene productos disponibles en su catálogo."
            }
          />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }>
            {filteredProducts.map((product) => (
              <ProductSelectionCard
                key={product.id}
                product={product}
                isSelected={isSelected(product.id)}
                selectedProduct={getSelectedProduct(product.id)}
                onAddToSelection={handleAddToSelection}
                onRemoveFromSelection={handleRemoveFromSelection}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        totalCount={totalCount}
        totalItems={totalItems}
        onClick={() => setShowSelectionSummary(true)}
      />

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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-medium">Tu Tiendita Digital</span> - 
            <a 
              href="https://www.roffstudio.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-700 transition-colors ml-1"
            >
              ROFF Studio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedPublicCatalog;