import type { SelectFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { SelectFieldConfigPanel } from './config/SelectFieldConfig';

const SelectFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as SelectFieldConfig;

  const isControlled = typeof onChange === 'function';
  const currentValue = value ?? config.defaultValue;

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;

    if (config.multiple) {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      onChange(selected);
      return;
    }

    onChange(e.target.value);
  };

  const controlledProps = config.multiple
    ? {
        value: Array.isArray(currentValue) ? currentValue.map(String) : [],
        onChange: handleChange,
      }
    : {
        value: currentValue !== undefined ? String(currentValue) : '',
        onChange: handleChange,
      };

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
        multiple={config.multiple}
        {...(isControlled
          ? controlledProps
          : { defaultValue: (config.defaultValue as string | number | undefined) ?? '' })}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      >
        {!config.multiple && <option value="">Select an option</option>}
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
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
  configComponent: ({ config, onChange, error }) => (
    <SelectFieldConfigPanel
      config={config as SelectFieldConfig}
      onChange={(updates) => onChange(updates as Partial<FieldConfig>)}
      error={error}
    />
  ),
  renderComponent: SelectFieldRender,
  validateConfig: validateSelectConfig,
};
