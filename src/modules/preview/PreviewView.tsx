import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../components/ui';
import { useAppSelector } from '../../store/hooks';

export const PreviewView: React.FC = () => {
  const navigate = useNavigate();
  const components = useAppSelector((state) => state.builder.components);

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
        <div className="max-w-5xl mx-auto">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
              <Icon type="preview" size="lg" className="mb-4" />
              <p className="text-lg">No components to preview</p>
              <p className="text-sm mt-2">Add components in the builder to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="p-6 border border-builder-border rounded-lg bg-white"
                >
                  <h3 className="text-lg font-medium text-secondary-900">{component.type}</h3>
                  <p className="text-sm text-secondary-600 mt-1">Component ID: {component.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
