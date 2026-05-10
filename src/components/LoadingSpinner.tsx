import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = 'border-black'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-8'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${color} 
        border-t-transparent 
        rounded-none 
        animate-spin 
        ${className}
      `}
    />
  );
};

export default LoadingSpinner;
