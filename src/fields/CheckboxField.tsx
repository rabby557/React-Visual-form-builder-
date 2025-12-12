import type { CheckboxFieldConfig, FieldConfig, FieldDefinition } from '../types/fields';

const CheckboxFieldRender: React.FC<{
  config: FieldConfig;
  mode: 'builder' | 'preview';
}> = ({ config: rawConfig, mode }) => {
  const config = rawConfig as CheckboxFieldConfig;
  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled
            className={`border-builder-border ${config.className || ''}`}
          />
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
          defaultChecked={Boolean(config.defaultValue)}
          value={'value' in config ? (config.value as string | number | undefined) : undefined}
          className={`border-builder-border ${config.className || ''}`}
        />
        <label htmlFor={config.name} className="text-sm font-medium text-secondary-900">
          {config.label}
          {config.required && <span className="text-red-600"> *</span>}
        </label>
      </div>
      {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
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
  renderComponent: CheckboxFieldRender,
  validateConfig: validateCheckboxConfig,
};
