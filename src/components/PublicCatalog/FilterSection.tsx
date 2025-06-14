import React from 'react';
import { Filter, Tag, X } from 'lucide-react';

interface FilterSectionProps {
  categories: string[];
  selectedCategory: string;
  showCategoryFilter: boolean;
  toggleCategoryFilter: () => void;
  handleCategoryChange: (category: string) => void;
  availableProducts: any[];
}

const FilterSection: React.FC<FilterSectionProps> = ({
  categories,
  selectedCategory,
  showCategoryFilter,
  toggleCategoryFilter,
  handleCategoryChange,
  availableProducts
}) => {
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Mobile filter toggle */}
        <div className="sm:hidden mb-3">
          <button
            onClick={toggleCategoryFilter}
            className="flex items-center space-x-2 text-gray-700 font-medium w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtrar por categoría</span>
              {selectedCategory && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {selectedCategory}
                </span>
              )}
            </div>
            <X className={`h-4 w-4 transition-transform ${showCategoryFilter ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Filter options */}
        <div className={`${showCategoryFilter ? 'block' : 'hidden'} sm:block`}>
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
            
            {/* Clear filter button for mobile */}
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="sm:hidden flex items-center space-x-1 px-3 py-2 rounded-full text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FilterSection);