'use client';

import { forwardRef, useEffect, useCallback } from 'react';
import Modal, { ModalRef } from './Modal';
import Button from './Button';
import { 
  BsExclamationTriangle,
  BsExclamationCircle,
  BsInfoCircle
} from 'react-icons/bs';
import cn from 'classnames';

interface ConfirmModalProps {
  title: string;
  description: string;
  itemLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmModal = forwardRef<ModalRef, ConfirmModalProps>(({
  title,
  description,
  itemLabel,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel
}, ref) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onConfirm();
    }
  }, [onConfirm, isLoading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const variantStyles = {
    danger: {
      icon: BsExclamationCircle,
      iconClass: 'text-red-600',
      textClass: 'text-red-600',
      bgClass: 'bg-red-50',
      buttonVariant: 'danger' as const
    },
    warning: {
      icon: BsExclamationTriangle,
      iconClass: 'text-orange-600',
      textClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      buttonVariant: 'primary' as const
    },
    info: {
      icon: BsInfoCircle,
      iconClass: 'text-blue-600',
      textClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      buttonVariant: 'primary' as const
    }
  };

  const { icon: Icon, iconClass, textClass, bgClass, buttonVariant } = variantStyles[variant];

  return (
    <Modal
      ref={ref}
      title={title}
      onAfterClose={onCancel}
      className="max-w-lg"
    >
      <div className="space-y-6">
        <div className={cn(
          "flex items-start gap-4 p-4 rounded-lg",
          bgClass
        )}>
          <div className="flex-shrink-0">
            <Icon className={cn("w-6 h-6", iconClass)} />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-gray-700">{description}</p>
            {itemLabel && (
              <p className={cn(
                "font-semibold text-lg",
                textClass
              )}>{itemLabel}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            className="min-w-[100px]"
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant={buttonVariant}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Chargement...</span>
              </div>
            ) : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal; 