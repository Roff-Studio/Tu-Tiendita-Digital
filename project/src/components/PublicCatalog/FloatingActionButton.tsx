import React, { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';

interface FloatingActionButtonProps {
  totalCount: number;
  totalItems: number;
  onClick: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  totalCount,
  totalItems,
  onClick,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  // Show/hide button based on selection count
  useEffect(() => {
    if (totalCount > 0 && !isVisible) {
      setIsVisible(true);
    } else if (totalCount === 0 && isVisible) {
      setIsVisible(false);
    }
  }, [totalCount, isVisible]);

  // Animate counter when count changes
  useEffect(() => {
    if (totalItems !== prevCount && totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      setPrevCount(totalItems);
      
      return () => clearTimeout(timer);
    }
  }, [totalItems, prevCount]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <button
        onClick={onClick}
        className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110 group"
        aria-label={`Ver selección (${totalItems} productos)`}
      >
        {/* Shopping Cart Icon */}
        <ShoppingCart className="h-6 w-6" />
        
        {/* Counter Badge */}
        <div 
          className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] h-6 flex items-center justify-center transition-all duration-300 ${
            isAnimating ? 'scale-125 bg-red-600' : 'scale-100'
          }`}
        >
          <span className={`transition-all duration-200 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {totalItems}
          </span>
        </div>

        {/* Pulse Animation for New Items */}
        {isAnimating && (
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            {totalCount === 1 ? '1 producto' : `${totalCount} productos`} seleccionado{totalCount !== 1 ? 's' : ''}
            {totalItems !== totalCount && (
              <span className="block text-xs text-gray-300">
                {totalItems} artículo{totalItems !== 1 ? 's' : ''} en total
              </span>
            )}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </button>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-active:opacity-30 group-active:scale-110 transition-all duration-150"></div>
    </div>
  );
};

export default FloatingActionButton;