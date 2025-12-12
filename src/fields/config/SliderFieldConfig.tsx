import type { SliderFieldConfig, FieldConfig } from '../../types/fields';
import { FieldConfigPanel } from './FieldConfigPanel';

interface SliderFieldConfigPanelProps {
  config: SliderFieldConfig;
  onChange: (updates: Partial<FieldConfig>) => void;
  error?: string | null;
}

export const SliderFieldConfigPanel: React.FC<SliderFieldConfigPanelProps> = ({
  config,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <FieldConfigPanel
        config={config as FieldConfig}
        onChange={onChange as (updates: Partial<FieldConfig>) => void}
        error={error}
      />

      <hr className="border-builder-border" />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Minimum Value</label>
        <input
          type="number"
          value={config.min}
          onChange={(e) => onChange({ min: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Maximum Value</label>
        <input
          type="number"
          value={config.max}
          onChange={(e) => onChange({ max: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Step</label>
        <input
          type="number"
          value={config.step || 1}
          onChange={(e) => onChange({ step: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Default Value</label>
        <input
          type="number"
          value={(config.defaultValue as number | undefined) || ''}
          onChange={(e) =>
            onChange({ defaultValue: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-builder-border rounded text-sm"
        />
      </div>
    </div>
  );
};
