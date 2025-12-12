import type { SliderFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { SliderFieldConfigPanel } from './config/SliderFieldConfig';

const SliderFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as SliderFieldConfig;

  const isControlled = typeof onChange === 'function';
  const currentValue =
    typeof value === 'number'
      ? value
      : typeof config.defaultValue === 'number'
        ? (config.defaultValue as number)
        : config.min;

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
      <label className="block text-sm font-medium text-secondary-900" htmlFor={config.name}>
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
          {...(isControlled
            ? { value: currentValue, onChange: (e) => onChange(Number(e.target.value)) }
            : { defaultValue: config.defaultValue as number | undefined })}
          className={`w-full ${config.className || ''}`}
        />
        <div className="flex justify-between text-xs text-secondary-600">
          <span>{config.min}</span>
          <span className="font-medium text-secondary-900">{currentValue}</span>
          <span>{config.max}</span>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
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
  configComponent: ({ config, onChange, error }) => (
    <SliderFieldConfigPanel config={config as SliderFieldConfig} onChange={onChange} error={error} />
  ),
  renderComponent: SliderFieldRender,
  validateConfig: validateSliderConfig,
};
