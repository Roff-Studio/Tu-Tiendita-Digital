import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md'
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 shadow-sm';
  
  const hoverClasses = hover 
    ? 'transition-all duration-300 hover:shadow-lg hover:scale-[1.02]' 
    : '';

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const combinedClasses = `
    ${baseClasses}
    ${hoverClasses}
    ${paddingClasses[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default Card;