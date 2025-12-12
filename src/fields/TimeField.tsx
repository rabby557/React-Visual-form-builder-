import type { TimeFieldConfig, FieldConfig, FieldDefinition } from '../types/fields';

const TimeFieldRender: React.FC<{ config: FieldConfig; mode: 'builder' | 'preview' }> = ({
  config: rawConfig,
  mode,
}) => {
  const config = rawConfig as TimeFieldConfig;
  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <input
          type="time"
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
        type="time"
        required={config.required}
        disabled={config.disabled}
        defaultValue={config.defaultValue as string}
        min={config.min}
        max={config.max}
        step={config.step}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      />
    </div>
  );
};

const validateTimeConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  return null;
};

export const timeFieldDefinition: FieldDefinition = {
  type: 'time',
  title: 'Time',
  description: 'Time picker field',
  defaultConfig: {
    label: 'Time',
    name: 'time',
    required: false,
  },
  renderComponent: TimeFieldRender,
  validateConfig: validateTimeConfig,
};
