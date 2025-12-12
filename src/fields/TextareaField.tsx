import type { TextareaFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { FieldConfigPanel } from './config/FieldConfigPanel';

const TextareaFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as TextareaFieldConfig;

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
        <textarea
          placeholder={config.placeholder}
          disabled
          rows={3}
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
      <textarea
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={config.disabled}
        minLength={config.minLength}
        maxLength={config.maxLength}
        rows={config.rows || 3}
        {...(isControlled
          ? { value: currentValue, onChange: (e) => onChange(e.target.value) }
          : { defaultValue: config.defaultValue as string | undefined })}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateTextareaConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  if ('minLength' in config && 'maxLength' in config) {
    if (config.minLength !== undefined && config.maxLength !== undefined) {
      if (config.minLength > config.maxLength) {
        return 'Min length cannot be greater than max length';
      }
    }
  }
  return null;
};

export const textareaFieldDefinition: FieldDefinition = {
  type: 'textarea',
  title: 'Textarea',
  description: 'Multi-line text field',
  defaultConfig: {
    label: 'Textarea',
    name: 'textarea',
    placeholder: '',
    required: false,
    rows: 3,
  },
  configComponent: ({ config, onChange, error }) => (
    <FieldConfigPanel config={config} onChange={onChange} error={error} />
  ),
  renderComponent: TextareaFieldRender,
  validateConfig: validateTextareaConfig,
};
