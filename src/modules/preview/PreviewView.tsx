import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../components/ui';
import { FieldRenderer } from '../../fields/FieldRenderer';
import { FieldValidator } from '../../fields/validation';
import { useAppSelector } from '../../store/hooks';
import { evaluateVisibilityRule } from '../../utils/logicEngine';
import type { Component, FieldConfig, FieldType, VisibilityRule } from '../../types';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1024,
  tablet: 768,
  mobile: 375,
};

const getInitialValue = (component: Component): unknown => {
  const config = component.props as FieldConfig;
  if (config.defaultValue !== undefined) return config.defaultValue;
  if (component.type === 'checkbox') return false;
  if (component.type === 'slider') return (config as unknown as { min?: number }).min ?? 0;
  return '';
};

export const PreviewView: React.FC = () => {
  const navigate = useNavigate();
  const schema = useAppSelector((state) => state.builder.schema.present);

  const steps = useMemo(() => [...schema.steps].sort((a, b) => a.order - b.order), [schema.steps]);

  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [showFrame, setShowFrame] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    setValues((prev) => {
      const next: Record<string, unknown> = {};
      for (const component of schema.components) {
        next[component.id] = prev[component.id] ?? getInitialValue(component);
      }
      return next;
    });

    setErrors({});
    setSubmitStatus(null);
  }, [schema.components]);

  useEffect(() => {
    setStepIndex((current) => {
      if (steps.length === 0) return 0;
      return Math.min(current, steps.length - 1);
    });
  }, [steps.length]);

  const visibilityById = useMemo(() => {
    const visible = new Map<string, boolean>();

    for (const component of schema.components) {
      const rule = (component.props as { visibilityRule?: VisibilityRule }).visibilityRule;
      visible.set(component.id, evaluateVisibilityRule(rule, values));
    }

    return visible;
  }, [schema.components, values]);

  const currentStepId = steps[stepIndex]?.id;

  const currentStepComponents = useMemo(() => {
    if (!currentStepId) return [];

    return schema.components
      .filter((c) => c.stepId === currentStepId)
      .sort((a, b) => a.order - b.order);
  }, [schema.components, currentStepId]);

  const visibleCurrentStepComponents = useMemo(() => {
    return currentStepComponents.filter((c) => visibilityById.get(c.id) !== false);
  }, [currentStepComponents, visibilityById]);

  const setValue = useCallback((componentId: string, nextValue: unknown) => {
    setValues((prev) => ({ ...prev, [componentId]: nextValue }));
    setErrors((prev) => ({ ...prev, [componentId]: null }));
  }, []);

  const validateComponents = useCallback(
    (components: Component[]) => {
      const nextErrors: Record<string, string | null> = {};
      let valid = true;
      setSubmitStatus(null);

      for (const component of components) {
        if (visibilityById.get(component.id) === false) continue;

        const config = component.props as FieldConfig;
        const value = values[component.id];
        const result = FieldValidator.validateFieldValue(config, value);

        if (!result.valid) {
          valid = false;
          nextErrors[component.id] = result.errors[0] ?? 'Invalid value';
        }
      }

      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return valid;
    },
    [values, visibilityById]
  );

  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < steps.length - 1;

  const handleNext = () => {
    const ok = validateComponents(currentStepComponents);
    if (!ok) return;
    setSubmitStatus(null);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSubmitStatus(null);
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ok = validateComponents(currentStepComponents);
    if (!ok) return;

    setSubmitStatus('Form is valid!');
  };

  const deviceWidth = DEVICE_WIDTH[device];

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b border-builder-border bg-builder-panel px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-secondary-900 truncate">Preview Mode</h1>
          {steps.length > 0 && (
            <p className="text-xs text-secondary-600 truncate">
              Step {stepIndex + 1} of {steps.length}: {steps[stepIndex]?.title}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="hidden md:flex items-center gap-1 rounded border border-builder-border bg-white p-1">
            <button
              type="button"
              className={`px-2 py-1 text-sm rounded ${device === 'desktop' ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-builder-hover'}`}
              onClick={() => setDevice('desktop')}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`px-2 py-1 text-sm rounded ${device === 'tablet' ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-builder-hover'}`}
              onClick={() => setDevice('tablet')}
            >
              Tablet
            </button>
            <button
              type="button"
              className={`px-2 py-1 text-sm rounded ${device === 'mobile' ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-builder-hover'}`}
              onClick={() => setDevice('mobile')}
            >
              Mobile
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-secondary-700">
            <input
              type="checkbox"
              checked={showFrame}
              onChange={(e) => setShowFrame(e.target.checked)}
              className="border-builder-border"
            />
            Frame
          </label>

          <Button variant="outline" size="sm" onClick={() => navigate('/builder')}>
            <Icon type="builder" size="sm" className="mr-2" />
            Back to Builder
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {schema.components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
            <Icon type="preview" size="lg" className="mb-4" />
            <p className="text-lg">No fields to preview</p>
            <p className="text-sm mt-2">Add fields in the builder to see them here</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className={`transition-all duration-200 ${showFrame ? 'bg-secondary-50 p-4 md:p-6 rounded-xl border border-builder-border shadow-sm' : ''}`}
            >
              <div
                className={`mx-auto transition-all duration-200 ${showFrame ? 'bg-white rounded-lg border border-builder-border shadow-sm' : ''}`}
                style={{ width: deviceWidth, maxWidth: '100%' }}
              >
                <div className="p-6">
                  {steps.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-secondary-900">{steps[stepIndex]?.title}</h2>
                      <div className="mt-2 h-1 w-full rounded bg-secondary-100 overflow-hidden">
                        <div
                          className="h-full bg-primary-600 transition-all"
                          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <form className="space-y-5" aria-label="Preview form" onSubmit={handleSubmit}>
                    {submitStatus && (
                      <div className="p-3 rounded border border-green-200 bg-green-50 text-green-800 text-sm">
                        {submitStatus}
                      </div>
                    )}

                    {visibleCurrentStepComponents.map((component) => {
                      const config = component.props as FieldConfig;
                      const error = errors[component.id] ?? null;

                      return (
                        <div key={component.id}>
                          <FieldRenderer
                            type={component.type as FieldType}
                            config={config}
                            mode="preview"
                            value={values[component.id]}
                            onChange={(v) => setValue(component.id, v)}
                            error={error}
                          />
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between gap-3 pt-4">
                      <Button type="button" variant="outline" disabled={!canGoBack} onClick={handleBack}>
                        Back
                      </Button>

                      {canGoNext ? (
                        <Button type="button" onClick={handleNext}>
                          Next
                        </Button>
                      ) : (
                        <Button type="submit">Submit</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
