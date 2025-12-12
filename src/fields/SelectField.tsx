import type { SelectFieldConfig, FieldConfig, FieldDefinition } from '../types/fields';

const SelectFieldRender: React.FC<{ config: FieldConfig; mode: 'builder' | 'preview' }> = ({
  config: rawConfig,
  mode,
}) => {
  const config = rawConfig as SelectFieldConfig;
  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <select
          disabled
          className={`w-full px-3 py-2 border border-builder-border rounded bg-secondary-50 text-secondary-600 text-sm ${config.className || ''}`}
        >
          <option>Select an option</option>
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-secondary-900" htmlFor={config.name}>
        {config.label}
        {config.required && <span className="text-red-600"> *</span>}
      </label>
      {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
      <select
        id={config.name}
        name={config.name}
        required={config.required}
        disabled={config.disabled}
        defaultValue={config.defaultValue as string | number}
        multiple={config.multiple}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      >
        <option value="">Select an option</option>
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const validateSelectConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  if ('options' in config) {
    if (!config.options || config.options.length === 0) return 'At least one option is required';
  }
  return null;
};

export const selectFieldDefinition: FieldDefinition = {
  type: 'select',
  title: 'Select',
  description: 'Dropdown selection field',
  defaultConfig: {
    label: 'Select',
    name: 'select',
    required: false,
    options: [],
  },
  renderComponent: SelectFieldRender,
  validateConfig: validateSelectConfig,
};
