import type { RichTextFieldConfig, FieldConfig, FieldDefinition, FieldRenderProps } from '../types/fields';
import { FieldConfigPanel } from './config/FieldConfigPanel';

const RichTextFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  value,
  onChange,
  error,
}) => {
  const config = rawConfig as RichTextFieldConfig;

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
        <div
          className={`min-h-32 border border-builder-border rounded bg-secondary-50 ${config.className || ''}`}
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
        required={config.required}
        disabled={config.disabled}
        minLength={config.minLength}
        maxLength={config.maxLength}
        rows={6}
        {...(isControlled
          ? { value: currentValue, onChange: (e) => onChange(e.target.value) }
          : { defaultValue: config.defaultValue as string | undefined })}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm font-mono ${config.className || ''}`}
        placeholder="Enter rich text content..."
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-secondary-500">
        Note: Rich text editor would be integrated with a library like TipTap or Slate in production
      </p>
    </div>
  );
};

const validateRichTextConfig = (config: Partial<FieldConfig>): string | null => {
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

export const richTextFieldDefinition: FieldDefinition = {
  type: 'rich_text',
  title: 'Rich Text',
  description: 'Rich text editor field',
  defaultConfig: {
    label: 'Rich Text',
    name: 'rich_text',
    required: false,
    toolbar: ['bold', 'italic', 'underline', 'link'],
  },
  configComponent: ({ config, onChange, error }) => (
    <FieldConfigPanel config={config} onChange={onChange} error={error} />
  ),
  renderComponent: RichTextFieldRender,
  validateConfig: validateRichTextConfig,
};
