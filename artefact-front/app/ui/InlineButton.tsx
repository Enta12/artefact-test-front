'use client';

import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  underline?: boolean;
}

const variantStyles = {
  primary: 'text-indigo-600 hover:text-indigo-500',
  secondary: 'text-gray-600 hover:text-gray-500',
  danger: 'text-red-600 hover:text-red-500',
};

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function InlineButton({
  children,
  className,
  variant = 'primary',
  size = 'sm',
  underline = true,
  ...props
}: InlineButtonProps) {
  return (
    <button
      className={twMerge(
        'font-medium transition-colors duration-200 focus:outline-none cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        underline && 'hover:underline',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 