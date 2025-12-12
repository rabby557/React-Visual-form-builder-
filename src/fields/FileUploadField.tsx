import type {
  FileUploadFieldConfig,
  FieldConfig,
  FieldDefinition,
  FieldRenderProps,
} from '../types/fields';
import { FieldConfigPanel } from './config/FieldConfigPanel';

const FileUploadFieldRender: React.FC<FieldRenderProps> = ({
  config: rawConfig,
  mode,
  onChange,
  error,
}) => {
  const config = rawConfig as FileUploadFieldConfig;

  if (mode === 'builder') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-secondary-700">{config.label}</label>
        {config.helperText && <p className="text-xs text-secondary-600">{config.helperText}</p>}
        <input
          type="file"
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
        type="file"
        required={config.required}
        disabled={config.disabled}
        accept={config.accept}
        multiple={config.multiple}
        onChange={(e) => onChange?.(e.target.files)}
        className={`w-full px-3 py-2 border border-builder-border rounded text-sm ${config.className || ''}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

const validateFileUploadConfig = (config: Partial<FieldConfig>): string | null => {
  if (!config.label) return 'Label is required';
  if (!config.name) return 'Name is required';
  return null;
};

export const fileUploadFieldDefinition: FieldDefinition = {
  type: 'file_upload',
  title: 'File Upload',
  description: 'File upload field',
  defaultConfig: {
    label: 'File Upload',
    name: 'file_upload',
    required: false,
  },
  configComponent: ({ config, onChange, error }) => (
    <FieldConfigPanel config={config} onChange={onChange} error={error} />
  ),
  renderComponent: FileUploadFieldRender,
  validateConfig: validateFileUploadConfig,
};
