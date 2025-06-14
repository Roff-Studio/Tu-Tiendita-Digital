import React, { useState } from 'react';
import { Eye, Heart, ShoppingCart, MessageCircle, Star } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { Product } from '../../lib/supabase';

interface EnhancedProductCardProps {
  product: Product & {
    rating?: number;
    reviewCount?: number;
    isNew?: boolean;
    discount?: number;
    originalPrice?: number;
  };
  variant?: 'default' | 'featured';
  onQuickView?: (product: Product) => void;
  onAddToFavorites?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onWhatsAppContact?: (product: Product) => void;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  variant = 'default',
  onQuickView,
  onAddToFavorites,
  onAddToCart,
  onWhatsAppContact
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageNavigation = (index: number) => {
    setCurrentImageIndex(index);
  };

  const currentImage = product.images?.[currentImageIndex];
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <Card
      className={`
        group relative overflow-hidden
        ${variant === 'featured' ? 'lg:col-span-2 lg:row-span-2' : ''}
      `}
      hover={true}
      padding="none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage.imageUrl}
            alt={product.name}
            className={`
              w-full h-full object-cover transition-transform duration-700
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Image Navigation Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images?.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageNavigation(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}
                `}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className={`
          absolute inset-0 bg-black/20 flex items-center justify-center
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex space-x-3">
            {onQuickView && (
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Eye className="w-4 h-4" />}
                onClick={() => onQuickView(product)}
              >
                Vista Rápida
              </Button>
            )}
            {onAddToFavorites && (
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Heart className="w-4 h-4" />}
                onClick={() => onAddToFavorites(product)}
              >
                Favorito
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.isNew && (
            <Badge variant="success">Nuevo</Badge>
          )}
          {product.discount && (
            <Badge variant="danger">-{product.discount}%</Badge>
          )}
          {!product.isAvailable && (
            <Badge variant="warning">Agotado</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-gray-600 text-sm">{product.category}</p>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-600">
              {product.displayPrice || `$${product.basePrice.toLocaleString()}`}
            </div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < product.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0} reseñas)
            </span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Stock: {product.stockQuantity}
          </span>
          {product.variants && product.variants.length > 0 && (
            <span className="text-sm text-blue-600">
              {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            {onAddToCart && product.isAvailable && (
              <Button 
                variant="primary" 
                fullWidth 
                icon={<ShoppingCart className="w-4 h-4" />}
                onClick={() => onAddToCart(product)}
              >
                Agregar al Carrito
              </Button>
            )}
            {onWhatsAppContact && (
              <Button 
                variant="outline" 
                icon={<MessageCircle className="w-4 h-4" />}
                onClick={() => onWhatsAppContact(product)}
              >
                WhatsApp
              </Button>
            )}
          </div>
          
          {!product.isAvailable && (
            <Button variant="secondary" fullWidth disabled>
              Producto Agotado
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedProductCard;