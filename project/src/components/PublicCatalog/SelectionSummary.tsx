import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, Package, ShoppingCart, Share2 } from 'lucide-react';
import { SelectedProduct } from '../../hooks/useProductSelection';

interface SelectionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: SelectedProduct[];
  totalCount: number;
  totalItems: number;
  onRemoveProduct: (productId: string, variantId?: string) => void;
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onClearSelection: () => void;
  onSendWhatsApp: () => void;
  whatsAppUrl: string;
  storeName: string;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  totalCount,
  totalItems,
  onRemoveProduct,
  onUpdateQuantity,
  onClearSelection,
  onSendWhatsApp,
  whatsAppUrl,
  storeName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle quantity change with animation
  const handleQuantityChange = (productId: string, variantId: string | undefined, newQuantity: number) => {
    setIsAnimating(true);
    onUpdateQuantity(productId, variantId, newQuantity);
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const productList = selectedProducts.map(p => `• ${p.name}${p.selectedVariantName ? ` - ${p.selectedVariantName}` : ''}`).join('\n');
        await navigator.share({
          title: `Productos seleccionados de ${storeName}`,
          text: `He seleccionado estos productos:\n\n${productList}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const productList = selectedProducts.map(p => `• ${p.name}${p.selectedVariantName ? ` - ${p.selectedVariantName}` : ''}`).join('\n');
      const text = `Productos seleccionados de ${storeName}:\n\n${productList}\n\nVer catálogo: ${window.location.href}`;
      navigator.clipboard.writeText(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-label="Cerrar resumen"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Productos Seleccionados</h2>
              <p className="text-blue-100">
                {totalCount} producto{totalCount !== 1 ? 's' : ''} • {totalItems} artículo{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(90vh-200px)]">
          {selectedProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay productos seleccionados
                </h3>
                <p className="text-gray-600">
                  Selecciona productos del catálogo para agregarlos aquí
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Product List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedProducts.map((product) => (
                  <div
                    key={`${product.id}-${product.selectedVariantId || 'base'}`}
                    className={`bg-gray-50 rounded-lg p-4 transition-all duration-200 ${
                      isAnimating ? 'scale-[1.02]' : 'scale-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.selectedVariantName && (
                          <p className="text-sm text-gray-600">
                            {product.selectedVariantName}
                          </p>
                        )}
                        {product.category && (
                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-blue-600">
                            {product.price}
                          </span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(product.id, product.selectedVariantId, product.quantity - 1)}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-semibold min-w-[2rem] text-center">
                              {product.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.id, product.selectedVariantId, product.quantity + 1)}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveProduct(product.id, product.selectedVariantId)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">
                      Total de productos:
                    </span>
                    <span className="font-bold text-blue-900">
                      {totalCount} producto{totalCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {totalItems !== totalCount && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-blue-700">
                        Total de artículos:
                      </span>
                      <span className="text-sm font-semibold text-blue-700">
                        {totalItems} artículo{totalItems !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Compartir</span>
                  </button>
                  
                  <button
                    onClick={onClearSelection}
                    className="flex-1 bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors border border-red-200"
                  >
                    Limpiar todo
                  </button>
                  
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onSendWhatsApp}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Enviar por WhatsApp</span>
                  </a>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center">
                  Al enviar por WhatsApp se abrirá una conversación con {storeName} 
                  con la lista de productos seleccionados
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionSummary;