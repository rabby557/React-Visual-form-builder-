import type { DateFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { FieldConfigPanel } from './config/FieldConfigPanel';

const DateFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as DateFieldConfig;

  const isControlled = typeof onChange === 'function';
  const currentValue =
    typeof value === 'string'
      ? value
      : typeof config.defaultValue === 'string'
        ? (config.defaultValue as string)
        : '';

  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <input
          type="date"
          disabled
          className={`w-full px-3 py-2 border border-builder-border rounded bg-secondary-50 text-secondary-600 text-sm ${config.className || ''}`}
        />
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
      <input
        id={config.name}
        name={config.name}
        type="date"
        required={config.required}
        disabled={config.disabled}
        min={config.min}
        max={config.max}
        step={config.step}
        {...(isControlled
          ? { value: currentValue, onChange: (e) => onChange(e.target.value) }
          : { defaultValue: config.defaultValue as string | undefined })}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateDateConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  return null;
};

export const dateFieldDefinition: FieldDefinition = {
  type: 'date',
  title: 'Date',
  description: 'Date picker field',
  defaultConfig: {
    label: 'Date',
    name: 'date',
    required: false,
  },
  configComponent: ({ config, onChange, error }) => (
    <FieldConfigPanel config={config} onChange={onChange} error={error} />
  ),
  renderComponent: DateFieldRender,
  validateConfig: validateDateConfig,
};
