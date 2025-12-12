import { useState } from 'react';
import type { PanelProps } from '../../types';

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={`bg-builder-panel border border-builder-border rounded-panel shadow-panel ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-builder-border">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-builder-hover transition-colors"
              aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              <svg
                className={`w-5 h-5 text-secondary-600 transition-transform ${
                  isCollapsed ? '-rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      {!isCollapsed && <div className="p-4">{children}</div>}
    </div>
  );
};
