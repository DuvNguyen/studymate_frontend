import React, { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const getButtonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className: string = ''
) => {
  const baseClass = 'inline-flex items-center justify-center font-black uppercase tracking-wider transition-all border-2 border-black active:translate-y-1 active:translate-x-1 active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:translate-x-0 disabled:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
  
  let sizeClass = '';
  if (size === 'sm') sizeClass = 'text-[10px] px-3 py-1.5';
  if (size === 'md') sizeClass = 'text-xs px-6 py-3';
  if (size === 'lg') sizeClass = 'text-sm px-8 py-4';

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
  } else if (variant === 'outline') {
    variantClass = 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
  } else if (variant === 'danger') {
    variantClass = 'bg-red-600 text-white hover:bg-red-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
  }

  return `${baseClass} ${sizeClass} ${variantClass} ${className}`.trim();
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button ref={ref} className={getButtonClasses(variant, size, className)} {...props} />
    );
  }
);

Button.displayName = 'Button';
