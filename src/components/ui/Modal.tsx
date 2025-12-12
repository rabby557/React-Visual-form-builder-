import { useEffect } from 'react';
import type { ModalProps } from '../../types';
import { Icon } from './Icon';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-lg shadow-modal max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-builder-border">
          {title && <h2 className="text-xl font-semibold text-secondary-900">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-builder-hover transition-colors ml-auto"
            aria-label="Close modal"
          >
            <Icon type="close" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-builder-border bg-secondary-50">{footer}</div>
        )}
      </div>
    </div>
  );
};
