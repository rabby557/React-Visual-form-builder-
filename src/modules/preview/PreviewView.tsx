import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../components/ui';
import { useAppSelector } from '../../store/hooks';
import type { Component } from '../../types';

const getComponentLabel = (component: Component) => {
  const label = component.props.label;
  return typeof label === 'string' && label.trim().length > 0 ? label : component.type;
};

export const PreviewView: React.FC = () => {
  const navigate = useNavigate();
  const components = useAppSelector((state) => state.builder.schema.present);

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b border-builder-border bg-builder-panel px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-secondary-900">Preview Mode</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/builder')}>
          <Icon type="builder" size="sm" className="mr-2" />
          Back to Builder
        </Button>
      </header>

      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
              <Icon type="preview" size="lg" className="mb-4" />
              <p className="text-lg">No fields to preview</p>
              <p className="text-sm mt-2">Add fields in the builder to see them here</p>
            </div>
          ) : (
            <form className="space-y-5" aria-label="Preview form">
              {components.map((component) => {
                const label = getComponentLabel(component);
                const name = typeof component.props.name === 'string' ? component.props.name : '';
                const placeholder =
                  typeof component.props.placeholder === 'string'
                    ? component.props.placeholder
                    : '';
                const required = Boolean(component.props.required);

                return (
                  <div key={component.id} className="space-y-1">
                    <label className="block text-sm font-medium text-secondary-900" htmlFor={name}>
                      {label}
                      {required && <span className="text-red-600"> *</span>}
                    </label>

                    {component.type === 'textarea' ? (
                      <textarea
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        required={required}
                        className="w-full rounded border border-builder-border px-3 py-2"
                      />
                    ) : component.type === 'checkbox' ? (
                      <div className="flex items-center gap-2">
                        <input
                          id={name}
                          name={name}
                          type="checkbox"
                          required={required}
                          className="rounded border-builder-border"
                        />
                        <span className="text-sm text-secondary-700">{label}</span>
                      </div>
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type="text"
                        placeholder={placeholder}
                        required={required}
                        className="w-full rounded border border-builder-border px-3 py-2"
                      />
                    )}
                  </div>
                );
              })}

              <Button type="submit">Submit</Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
