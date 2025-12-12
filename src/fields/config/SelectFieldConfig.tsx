import { useState } from 'react';
import type { SelectFieldConfig } from '../../types/fields';
import { FieldConfigPanel } from './FieldConfigPanel';

interface SelectFieldConfigPanelProps {
  config: SelectFieldConfig;
  onChange: (updates: Partial<SelectFieldConfig>) => void;
  error?: string | null;
}

export const SelectFieldConfigPanel: React.FC<SelectFieldConfigPanelProps> = ({
  config,
  onChange,
  error,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const addOption = () => {
    if (newLabel && newValue) {
      const updatedOptions = [...(config.options || []), { label: newLabel, value: newValue }];
      onChange({ options: updatedOptions });
      setNewLabel('');
      setNewValue('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = (config.options || []).filter((_, i) => i !== index);
    onChange({ options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      <FieldConfigPanel config={config} onChange={onChange} error={error} />

      <hr className="border-builder-border" />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Options</label>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {(config.options || []).map(
            (option: { label: string; value: string | number }, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary-50 rounded">
                <span className="text-sm flex-1">
                  <span className="font-medium">{option.label}</span> ({option.value})
                </span>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Option label"
            className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Option value"
            className="w-full px-3 py-2 border border-builder-border rounded text-sm"
          />
          <button
            type="button"
            onClick={addOption}
            className="w-full px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
          >
            Add Option
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="multiple"
          checked={config.multiple || false}
          onChange={(e) => onChange({ multiple: e.target.checked })}
          className="border-builder-border"
        />
        <label htmlFor="multiple" className="text-sm font-medium text-secondary-700">
          Allow Multiple Selection
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Default Value</label>
        <select
          value={(config.defaultValue as string | number | undefined) || ''}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
        >
          <option value="">None</option>
          {(config.options || []).map((option: { label: string; value: string | number }) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
