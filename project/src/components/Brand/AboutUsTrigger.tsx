import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface AboutUsTriggerProps {
  onClick: () => void;
  variant?: 'subtle' | 'prominent' | 'floating';
  className?: string;
}

const AboutUsTrigger: React.FC<AboutUsTriggerProps> = ({ 
  onClick, 
  variant = 'subtle',
  className = '' 
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className={`fixed bottom-20 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 z-40 ${className}`}
        aria-label="Conoce nuestra historia"
        title="Sobre nosotros"
      >
        <Info className="h-5 w-5" />
      </button>
    );
  }

  if (variant === 'prominent') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${className}`}
      >
        <Sparkles className="h-5 w-5" />
        <span>Nuestra Historia</span>
      </button>
    );
  }

  // Subtle variant (default)
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 text-sm font-medium ${className}`}
    >
      <Info className="h-4 w-4" />
      <span>Sobre nosotros</span>
    </button>
  );
};

export default AboutUsTrigger;