'use client';

import { forwardRef, useImperativeHandle, useState, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ModalRef {
  close: () => void;
  open: () => void;
}

interface ModalProps {
  children: ReactNode;
  title?: string;
  className?: string;
  onAfterClose?: () => void;
}

const Modal = forwardRef<ModalRef, ModalProps>(({
  children,
  title,
  className = '',
  onAfterClose
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onAfterClose) {
      setTimeout(() => {
        onAfterClose();
      }, 300);
    }
  };

  useImperativeHandle(ref, () => ({
    close: handleClose,
    open: () => setIsOpen(true),
  }));

  return (
    <div 
      className={twMerge(
        'fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className={twMerge(
          'bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-md shadow-xl transition-all duration-300 transform',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
          className
        )}
      >
        {title && (
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal; 