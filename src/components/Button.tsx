import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  let baseStyles = 'clay-button inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none ';

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs rounded-xl gap-1.5';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3.5 text-base rounded-2xl gap-3';
      break;
    case 'md':
    default:
      sizeStyles = 'px-4.5 py-2.5 text-sm rounded-2xl gap-2';
      break;
  }

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[6px_6px_14px_rgba(99,102,241,0.35),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:brightness-105 active:shadow-inner';
      break;
    case 'secondary':
      variantStyles = 'bg-white text-slate-700 shadow-clay-btn hover:bg-slate-50 text-slate-800';
      break;
    case 'success':
      variantStyles = 'bg-emerald-600 text-white shadow-[6px_6px_14px_rgba(16,185,129,0.35),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-emerald-500';
      break;
    case 'danger':
      variantStyles = 'bg-rose-500 text-white shadow-[6px_6px_14px_rgba(244,63,94,0.35),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-rose-600';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-slate-600 hover:bg-purple-50 shadow-none';
      break;
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
