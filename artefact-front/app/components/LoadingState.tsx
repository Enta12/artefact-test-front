'use client';

import { FC } from 'react';
import Spinner from './Spinner';
import { twMerge } from 'tailwind-merge';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'primary' | 'secondary';
  fullPage?: boolean;
}

const LoadingState: FC<LoadingStateProps> = ({
  message = 'Chargement en cours...',
  className,
  size = 'lg',
  variant = 'primary',
  fullPage = false
}) => {
  const containerClasses = twMerge(
    'flex flex-col items-center justify-center space-y-4',
    fullPage ? 'min-h-screen' : 'py-12',
    className
  );

  return (
    <div className={containerClasses}>
      <div className="relative">
        <Spinner size={size} variant={variant} />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full">
          <div className="animate-pulse bg-indigo-100 h-1 w-12 mx-auto rounded-full" />
        </div>
      </div>
      {message && (
        <div className="text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <div className="mt-2 text-sm text-gray-400 animate-pulse">
            Veuillez patienter...
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingState; 