'use client';

import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function Button({
  children,
  className,
  isLoading = false,
  loadingText,
  variant = 'primary',
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      className={twMerge(
        'group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        'transition-colors duration-200',
        variantStyles[variant],
        fullWidth ? 'w-full' : '',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (loadingText || children) : children}
    </button>
  );
} 