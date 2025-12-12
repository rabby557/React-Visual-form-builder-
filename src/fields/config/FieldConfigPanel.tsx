import type { FieldConfig } from '../../types/fields';

interface FieldConfigPanelProps {
  config: FieldConfig;
  onChange: (updates: Partial<FieldConfig>) => void;
  error?: string | null;
}

export const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({ config, onChange, error }) => {
  return (
    <div className="space-y-4">
      {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Label</label>
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Field label"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Field name (for form submission)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Helper Text</label>
        <input
          type="text"
          value={config.helperText || ''}
          onChange={(e) => onChange({ helperText: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Optional helper text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Placeholder</label>
        <input
          type="text"
          value={config.placeholder || ''}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Placeholder text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">CSS Classes</label>
        <input
          type="text"
          value={config.className || ''}
          onChange={(e) => onChange({ className: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="e.g. text-lg text-blue-600"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={config.required || false}
          onChange={(e) => onChange({ required: e.target.checked })}
          className="border-builder-border"
        />
        <label htmlFor="required" className="text-sm font-medium text-secondary-700">
          Required
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="disabled"
          checked={config.disabled || false}
          onChange={(e) => onChange({ disabled: e.target.checked })}
          className="border-builder-border"
        />
        <label htmlFor="disabled" className="text-sm font-medium text-secondary-700">
          Disabled
        </label>
      </div>
    </div>
  );
};
