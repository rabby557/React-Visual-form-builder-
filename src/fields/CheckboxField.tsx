import type { CheckboxFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { FieldConfigPanel } from './config/FieldConfigPanel';

const CheckboxFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as CheckboxFieldConfig;

  const isControlled = typeof onChange === 'function';
  const checkedValue =
    typeof value === 'boolean' ? value : Boolean(value ?? (config.defaultValue as boolean | undefined));

  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input type="checkbox" disabled className={`border-builder-border ${config.className || ''}`} />
          <label className="text-sm font-medium text-secondary-700">{config.label}</label>
        </div>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          id={config.name}
          name={config.name}
          type="checkbox"
          required={config.required}
          disabled={config.disabled}
          value={'value' in config ? (config.value as string | number | boolean | undefined) : undefined}
          {...(isControlled
            ? { checked: checkedValue, onChange: (e) => onChange(e.target.checked) }
            : { defaultChecked: Boolean(config.defaultValue) })}
          className={`border-builder-border ${config.className || ''}`}
        />
        <label htmlFor={config.name} className="text-sm font-medium text-secondary-900">
          {config.label}
          {config.required && <span className="text-red-600"> *</span>}
        </label>
      </div>
      {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateCheckboxConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  return null;
};

export const checkboxFieldDefinition: FieldDefinition = {
  type: 'checkbox',
  title: 'Checkbox',
  description: 'Boolean toggle field',
  defaultConfig: {
    label: 'Checkbox',
    name: 'checkbox',
    required: false,
  },
  configComponent: ({ config, onChange, error }) => (
    <FieldConfigPanel config={config} onChange={onChange} error={error} />
  ),
  renderComponent: CheckboxFieldRender,
  validateConfig: validateCheckboxConfig,
};
