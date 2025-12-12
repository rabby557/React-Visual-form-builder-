import type { FieldConfig, FieldType } from '../types/fields';
import { getFieldRegistry } from './registry';

interface FieldRendererProps {
  type: FieldType;
  config: FieldConfig;
  mode: 'builder' | 'preview';
  value?: unknown;
  onChange?: (value: unknown) => void;
  error?: string | null;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  type,
  config,
  mode,
  value,
  onChange,
  error,
}) => {
  const registry = getFieldRegistry();
  const definition = registry.get(type);

  if (!definition) {
    return (
      <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
        Unknown field type: {type}
      </div>
    );
  }

  const RenderComponent = definition.renderComponent;
  return <RenderComponent config={config} mode={mode} value={value} onChange={onChange} error={error} />;
};
