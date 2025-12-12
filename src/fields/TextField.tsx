import type { TextFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { TextFieldConfigPanel } from './config/TextFieldConfig';

const TextFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as TextFieldConfig;

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
          type="text"
          placeholder={config.placeholder}
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
        type="text"
        placeholder={config.placeholder}
        required={config.required}
        disabled={config.disabled}
        minLength={config.minLength}
        maxLength={config.maxLength}
        pattern={config.pattern}
        {...(isControlled
          ? { value: currentValue, onChange: (e) => onChange(e.target.value) }
          : { defaultValue: config.defaultValue as string | undefined })}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateTextConfig = (config: Partial<FieldConfig>): string | null => {
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

export const textFieldDefinition: FieldDefinition = {
  type: 'text',
  title: 'Text Input',
  description: 'Single-line text field',
  defaultConfig: {
    label: 'Text Input',
    name: 'text_input',
    placeholder: '',
    required: false,
  },
  configComponent: ({ config, onChange, error }) => (
    <TextFieldConfigPanel
      config={config as TextFieldConfig}
      onChange={(updates) => onChange(updates as Partial<FieldConfig>)}
      error={error}
    />
  ),
  renderComponent: TextFieldRender,
  validateConfig: validateTextConfig,
};
