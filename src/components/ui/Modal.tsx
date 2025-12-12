import { useEffect, useId, useMemo, useRef } from 'react';
import type { ModalProps } from '../../types';
import { Icon } from './Icon';

const getFocusableElements = (container: HTMLElement) => {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const labelledBy = useMemo(() => {
    return title ? titleId : undefined;
  }, [title, titleId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = getFocusableElements(dialog);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      document.body.style.overflow = 'hidden';

      queueMicrotask(() => {
        closeButtonRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';

      if (isOpen) {
        previouslyFocusedRef.current?.focus();
      }
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
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg shadow-modal max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-builder-border">
          {title && (
            <h2 id={titleId} className="text-xl font-semibold text-secondary-900">
              {title}
            </h2>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded hover:bg-builder-hover transition-colors ml-auto"
            aria-label="Close modal"
            type="button"
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
