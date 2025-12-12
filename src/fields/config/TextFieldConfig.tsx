import type { TextFieldConfig } from '../../types/fields';
import { FieldConfigPanel } from './FieldConfigPanel';

interface TextFieldConfigPanelProps {
  config: TextFieldConfig;
  onChange: (updates: Partial<TextFieldConfig>) => void;
  error?: string | null;
}

export const TextFieldConfigPanel: React.FC<TextFieldConfigPanelProps> = ({
  config,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <FieldConfigPanel config={config} onChange={onChange} error={error} />

      <hr className="border-builder-border" />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Min Length</label>
        <input
          type="number"
          value={config.minLength || ''}
          onChange={(e) =>
            onChange({ minLength: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Minimum character length"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Max Length</label>
        <input
          type="number"
          value={config.maxLength || ''}
          onChange={(e) =>
            onChange({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Maximum character length"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Pattern (Regex)</label>
        <input
          type="text"
          value={config.pattern || ''}
          onChange={(e) => onChange({ pattern: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="e.g. [a-zA-Z0-9]+"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Default Value</label>
        <input
          type="text"
          value={(config.defaultValue as string | undefined) || ''}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          placeholder="Default value for the field"
        />
      </div>
    </div>
  );
};
