import type { SliderFieldConfig, FieldConfig, FieldDefinition } from '../types/fields';

const SliderFieldRender: React.FC<{ config: FieldConfig; mode: 'builder' | 'preview' }> = ({
  config: rawConfig,
  mode,
}) => {
  const config = rawConfig as SliderFieldConfig;
  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <input
          type="range"
          disabled
          min={config.min}
          max={config.max}
          step={config.step}
          className={`w-full ${config.className || ''}`}
        />
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
      <div className="space-y-2">
        <input
          id={config.name}
          name={config.name}
          type="range"
          required={config.required}
          disabled={config.disabled}
          min={config.min}
          max={config.max}
          step={config.step}
          defaultValue={config.defaultValue as number}
          className={`w-full ${config.className || ''}`}
        />
        <div className="flex justify-between text-xs text-secondary-600">
          <span>{config.min}</span>
          <span className="font-medium text-secondary-900">
            {(config.defaultValue as number | undefined) || config.min}
          </span>
          <span>{config.max}</span>
        </div>
      </div>
    </div>
  );
};

const validateSliderConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  if ('min' in config && 'max' in config) {
    if (config.min === undefined) return 'Min value is required';
    if (config.max === undefined) return 'Max value is required';
    if (typeof config.min === 'number' && typeof config.max === 'number') {
      if (config.min >= config.max) return 'Min must be less than max';
    }
  }
  return null;
};

export const sliderFieldDefinition: FieldDefinition = {
  type: 'slider',
  title: 'Slider/Rating',
  description: 'Slider or rating field',
  defaultConfig: {
    label: 'Slider',
    name: 'slider',
    required: false,
    min: 0,
    max: 100,
    step: 1,
  },
  renderComponent: SliderFieldRender,
  validateConfig: validateSliderConfig,
};
