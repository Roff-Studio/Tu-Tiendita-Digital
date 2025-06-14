import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingProps } from '../../types';

const LoadingState: React.FC<LoadingProps> = ({ 
  isLoading, 
  children, 
  message = 'Cargando...',
  size = 'md',
  fullScreen = false,
  className = ''
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto mb-4`} />
        <p className="text-gray-600">{message}</p>
        {fullScreen && (
          <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;