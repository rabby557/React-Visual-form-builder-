import { Panel, Button, Icon } from '../../components/ui';
import { useAppSelector } from '../../store/hooks';

export const BuilderView: React.FC = () => {
  const components = useAppSelector((state) => state.builder.components);
  const selectedComponentId = useAppSelector((state) => state.builder.selectedComponentId);

  return (
    <div className="flex h-screen bg-builder-canvas">
      <aside className="w-64 border-r border-builder-border bg-builder-panel p-4 overflow-y-auto">
        <Panel title="Components">
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Icon type="add" size="sm" className="mr-2" />
              Add Component
            </Button>
            <div className="text-sm text-secondary-600 mt-2">
              {components.length === 0 ? (
                <p className="text-center py-4">No components yet</p>
              ) : (
                <p>{components.length} component(s)</p>
              )}
            </div>
          </div>
        </Panel>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-builder-border bg-builder-panel px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-secondary-900">Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icon type="preview" size="sm" className="mr-2" />
              Preview
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <Panel title="Canvas" className="min-h-96">
              {components.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
                  <Icon type="builder" size="lg" className="mb-4" />
                  <p className="text-lg">Start building by adding components</p>
                  <p className="text-sm mt-2">Drag and drop components from the left panel</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className={`p-4 border rounded ${
                        selectedComponentId === component.id
                          ? 'border-primary-500 bg-builder-selected'
                          : 'border-builder-border hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{component.type}</span>
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-builder-hover rounded">
                            <Icon type="edit" size="sm" />
                          </button>
                          <button className="p-1 hover:bg-red-50 rounded text-red-600">
                            <Icon type="delete" size="sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </main>

      <aside className="w-80 border-l border-builder-border bg-builder-panel p-4 overflow-y-auto">
        <Panel title="Properties">
          {selectedComponentId ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Component ID
                </label>
                <input
                  type="text"
                  value={selectedComponentId}
                  disabled
                  className="w-full px-3 py-2 border border-builder-border rounded bg-secondary-50 text-secondary-600 text-sm"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary-500 text-center py-4">
              Select a component to edit its properties
            </p>
          )}
        </Panel>
      </aside>
    </div>
  );
};
