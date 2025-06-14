import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase, fetchProductsWithImages, Product } from '../../lib/supabase';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import Layout from '../Layout';
import ProductCard from '../Products/ProductCard';
import ProductForm from '../Products/ProductForm';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import ErrorBoundary from '../common/ErrorBoundary';
import { Plus, Package, ExternalLink, Filter, Grid, List, AlertCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // FIXED: Memory management with refs
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // CRITICAL FIX: Stable async operation that doesn't change on every render
  const {
    loading: productsLoading,
    error: productsError,
    execute: fetchProducts
  } = useAsyncOperation(
    useCallback(async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      console.log('🚀 Dashboard: Fetching products for user:', user.id);
      return await fetchProductsWithImages(user.id);
    }, [user?.id]) // FIXED: Only depend on user.id, not the entire user object
  );

  // MEMORY LEAK PREVENTION: Memoized callback functions with stable references
  const handleDataFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      console.log('📊 Dashboard: Starting data fetch...');
      const result = await fetchProducts();
      if (result && mountedRef.current) {
        console.log('✅ Dashboard: Products fetched successfully:', result.length);
        setProducts(result);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching products:', error);
      if (mountedRef.current) {
        showToast('Error al cargar los productos', 'error');
      }
    }
  }, [fetchProducts, showToast]); // FIXED: Stable dependencies

  const handleAddProduct = useCallback(() => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowProductForm(false);
    setEditingProduct(undefined);
  }, []);

  const handleProductUpdate = useCallback(() => {
    handleDataFetch();
    if (mountedRef.current) {
      showToast(
        editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
        'success'
      );
    }
  }, [handleDataFetch, showToast, editingProduct]);

  const handleRetryFetch = useCallback(() => {
    handleDataFetch();
  }, [handleDataFetch]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // CRITICAL FIX: Main useEffect with minimal, essential dependencies only
  useEffect(() => {
    mountedRef.current = true;

    // Guard: Only proceed if user.id exists
    if (!user?.id) {
      console.log('⏸️ Dashboard: No user ID, skipping initialization');
      return;
    }

    console.log('🎯 Dashboard: useEffect triggered for user:', user.id);

    const initializeData = async () => {
      if (mountedRef.current) {
        console.log('📊 Dashboard: Initializing data fetch...');
        await handleDataFetch();
      }
    };

    // Initial data fetch
    initializeData();

    // FIXED: Setup real-time subscription with proper cleanup
    const setupSubscription = () => {
      console.log('🔄 Dashboard: Setting up real-time subscription for user:', user.id);
      
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      subscriptionRef.current = supabase
        .channel(`products-${user.id}`) // Unique channel per user
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'products',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('🔄 Dashboard: Real-time update received:', payload);
            if (mountedRef.current) {
              handleDataFetch();
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    // FIXED: Comprehensive cleanup
    return () => {
      console.log('🧹 Dashboard: Cleaning up for user:', user.id);
      mountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, handleDataFetch]); // CRITICAL FIX: Only essential dependencies

  // STATE MANAGEMENT OPTIMIZATION: Memoized expensive calculations
  const categories = useMemo(() => {
    return Array.from(new Set(products.filter(p => p.category).map(p => p.category))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return selectedCategory 
      ? products.filter(p => p.category === selectedCategory)
      : products;
  }, [products, selectedCategory]);

  const publicUrl = useMemo(() => {
    return userProfile?.storeSlug 
      ? `${window.location.origin}/store/${userProfile.storeSlug}`
      : '';
  }, [userProfile?.storeSlug]);

  const productStats = useMemo(() => {
    return {
      total: products.length,
      filtered: filteredProducts.length,
      hasCategory: selectedCategory !== ''
    };
  }, [products.length, filteredProducts.length, selectedCategory]);

  // Early return for no user
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Debes iniciar sesión para ver tus productos.</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (productsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar productos
          </h3>
          <p className="text-gray-600 mb-6">
            {productsError.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={handleRetryFetch}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout title="Mi Catálogo">
        <LoadingState isLoading={productsLoading} message="Cargando productos...">
          <div className="space-y-6">
            {/* Store Info */}
            {userProfile?.storeSlug && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">{userProfile.storeName}</h3>
                    <p className="text-blue-700 text-sm">Tu catálogo público está listo</p>
                  </div>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
                    aria-label="Ver catálogo público en nueva ventana"
                  >
                    <span className="text-sm font-medium">Ver catálogo</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Header with Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mis Productos</h2>
                <p className="text-gray-600">
                  {productStats.filtered} de {productStats.total} producto{productStats.total !== 1 ? 's' : ''}
                  {productStats.hasCategory && ` en "${selectedCategory}"`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Analytics Link */}
                <Link
                  to="/dashboard/analytics"
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Métricas</span>
                </Link>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    aria-label="Vista en cuadrícula"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                    aria-label="Vista en lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddProduct}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg"
                  aria-label="Agregar nuevo producto"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                type={selectedCategory ? 'category' : 'products'}
                message={
                  selectedCategory 
                    ? `No hay productos en "${selectedCategory}". Prueba con otra categoría o agrega productos a esta categoría.`
                    : products.length === 0 
                      ? 'Aún no tienes productos. ¡Haz clic en "Agregar producto" para crear el primero!'
                      : 'No hay productos en esta categoría'
                }
                actionLabel={!selectedCategory && products.length === 0 ? 'Agregar producto' : undefined}
                onAction={!selectedCategory && products.length === 0 ? handleAddProduct : undefined}
              />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onUpdate={handleProductUpdate}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <ProductForm
              product={editingProduct}
              onClose={handleCloseForm}
              onSave={handleProductUpdate}
            />
          )}
        </LoadingState>
      </Layout>
    </ErrorBoundary>
  );
};

export default Dashboard;