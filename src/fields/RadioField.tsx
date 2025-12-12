import type { RadioFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { RadioFieldConfigPanel } from './config/RadioFieldConfig';

const RadioFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as RadioFieldConfig;

  const isControlled = typeof onChange === 'function';
  const currentValue = value ?? config.defaultValue;

  if (mode === 'builder') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <div className="space-y-1">
          {config.options.slice(0, 2).map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input type="radio" disabled className="border-builder-border" />
              <label className="text-sm text-secondary-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-secondary-900">
        {config.label}
        {config.required && <span className="text-red-600"> *</span>}
      </label>
      {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
      <div className="space-y-1">
        {config.options.map((option) => {
          const id = `${config.name}_${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <input
                id={id}
                name={config.name}
                type="radio"
                value={option.value}
                required={config.required}
                disabled={config.disabled}
                {...(isControlled
                  ? {
                      checked: String(currentValue ?? '') === String(option.value),
                      onChange: () => onChange(option.value),
                    }
                  : { defaultChecked: config.defaultValue === option.value })}
                className={`border-builder-border ${config.className || ''}`}
              />
              <label htmlFor={id} className="text-sm text-secondary-900">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateRadioConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  if ('options' in config) {
    if (!config.options || config.options.length === 0) return 'At least one option is required';
  }
  return null;
};

export const radioFieldDefinition: FieldDefinition = {
  type: 'radio',
  title: 'Radio',
  description: 'Radio button group field',
  defaultConfig: {
    label: 'Radio',
    name: 'radio',
    required: false,
    options: [],
  },
  configComponent: ({ config, onChange, error }) => (
    <RadioFieldConfigPanel
      config={config as RadioFieldConfig}
      onChange={(updates) => onChange(updates as Partial<FieldConfig>)}
      error={error}
    />
  ),
  renderComponent: RadioFieldRender,
  validateConfig: validateRadioConfig,
};
