'use client';

import { forwardRef, useImperativeHandle, useState, ReactNode, useEffect } from 'react';
import cn from 'classnames';

export interface ModalRef {
  close: () => void;
  open: () => void;
}

interface ModalProps {
  children: ReactNode;
  title?: ReactNode;
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      className={cn(
        'fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className={cn(
          'bg-white/90 backdrop-blur-md rounded-lg shadow-xl transition-all duration-300 transform',
          'max-h-[90vh] w-full max-w-md overflow-hidden flex flex-col',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
          className
        )}
      >
        {title && (
          <div className="text-xl font-semibold p-6 pb-4">{title}</div>
        )}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal; 