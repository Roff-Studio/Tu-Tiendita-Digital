import React from 'react';
import { Package, Image as ImageIcon, Store, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'products' | 'images' | 'store' | 'category';
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  icon
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'products':
        return <Package className="h-16 w-16 text-gray-300" />;
      case 'images':
        return <ImageIcon className="h-16 w-16 text-gray-300" />;
      case 'store':
        return <Store className="h-16 w-16 text-gray-300" />;
      case 'category':
        return <Package className="h-16 w-16 text-gray-300" />;
      default:
        return <Package className="h-16 w-16 text-gray-300" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'products':
        return 'No tienes productos aún';
      case 'images':
        return 'No hay imágenes';
      case 'store':
        return 'Tienda no encontrada';
      case 'category':
        return 'No hay productos en esta categoría';
      default:
        return 'No hay contenido';
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        {icon || getDefaultIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || getDefaultTitle()}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;