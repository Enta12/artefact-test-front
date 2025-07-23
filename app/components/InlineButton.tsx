'use client';

import { ButtonHTMLAttributes } from 'react';


export default function InlineButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        'font-medium transition-colors duration-200 focus:outline-none cursor-pointer hover:underline text-blue-400 hover:text-blue-600' +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
} 