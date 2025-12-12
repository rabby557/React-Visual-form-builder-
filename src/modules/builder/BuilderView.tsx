import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Modal, Panel } from '../../components/ui';
import { useDragAndDrop, useSchemaPersistence } from '../../hooks';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addComponent,
  redo,
  removeComponent,
  reorderComponents,
  selectComponent,
  setDragging,
  undo,
  updateComponent,
} from '../../store/builderSlice';
import type { Component } from '../../types';
import { generateId } from '../../utils/helpers';

type FieldTemplate = {
  type: string;
  title: string;
  description: string;
  defaultProps: Record<string, unknown>;
};

type ActiveDragData =
  | { kind: 'template'; templateType: string }
  | { kind: 'component'; componentId: string };

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    type: 'text',
    title: 'Text Input',
    description: 'Single-line text',
    defaultProps: { label: 'Text', name: 'text', placeholder: '', required: false },
  },
  {
    type: 'textarea',
    title: 'Textarea',
    description: 'Multi-line text',
    defaultProps: { label: 'Textarea', name: 'textarea', placeholder: '', required: false },
  },
  {
    type: 'checkbox',
    title: 'Checkbox',
    description: 'True/false',
    defaultProps: { label: 'Checkbox', name: 'checkbox', required: false },
  },
];

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

const getComponentLabel = (component: Component) => {
  const label = component.props.label;
  return typeof label === 'string' && label.trim().length > 0 ? label : component.type;
};

const TemplateDraggable: React.FC<{ template: FieldTemplate }> = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template:${template.type}`,
    data: { kind: 'template', templateType: template.type } satisfies ActiveDragData,
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <li>
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded border border-builder-border bg-white p-3 shadow-sm transition-colors ${
          isDragging ? 'opacity-60' : 'hover:border-primary-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-secondary-900">{template.title}</div>
            <div className="text-xs text-secondary-600 mt-0.5">{template.description}</div>
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-builder-hover"
            aria-label={`Drag ${template.title} into canvas`}
            {...attributes}
            {...listeners}
          >
            <Icon type="drag" size="sm" />
          </button>
        </div>
      </div>
    </li>
  );
};

const SortableCanvasItem: React.FC<{
  component: Component;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ component, isSelected, onSelect, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: { kind: 'component', componentId: component.id } satisfies ActiveDragData,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = getComponentLabel(component);

  return (
    <li ref={setNodeRef} style={style}>
      <div
        role="option"
        aria-selected={isSelected}
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group rounded border bg-white p-4 transition-colors outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          isDragging ? 'opacity-70' : ''
        } ${
          isSelected
            ? 'border-primary-500 bg-builder-selected'
            : 'border-builder-border hover:border-primary-300'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-medium text-secondary-900 truncate">{label}</div>
            <div className="text-xs text-secondary-600 mt-0.5">Type: {component.type}</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-builder-hover"
              aria-label={`Drag ${label}`}
              {...attributes}
              {...listeners}
            >
              <Icon type="drag" size="sm" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-builder-hover"
              aria-label={`Edit ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Icon type="edit" size="sm" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-red-50 text-red-600"
              aria-label={`Delete ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Icon type="delete" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

const Canvas: React.FC<{
  components: Component[];
  selectedComponentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ components, selectedComponentId, onSelect, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <Panel title="Canvas" className="min-h-[24rem]">
      <div
        ref={setNodeRef}
        className={`min-h-[18rem] rounded transition-colors ${
          isOver ? 'bg-primary-50' : 'bg-transparent'
        }`}
      >
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
            <Icon type="builder" size="lg" className="mb-4" />
            <p className="text-lg">Start building by adding fields</p>
            <p className="text-sm mt-2">Drag fields from the palette into the canvas</p>
          </div>
        ) : (
          <ul role="listbox" aria-label="Canvas fields" className="space-y-2" tabIndex={-1}>
            {components.map((component) => (
              <SortableCanvasItem
                key={component.id}
                component={component}
                isSelected={selectedComponentId === component.id}
                onSelect={() => onSelect(component.id)}
                onDelete={() => onDelete(component.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
};

const PropertiesInspector: React.FC<{
  component: Component | null;
  onUpdate: (id: string, updates: Partial<Component>) => void;
  onDelete: (id: string) => void;
}> = ({ component, onUpdate, onDelete }) => {
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (component) {
      labelRef.current?.focus();
    }
  }, [component?.id]);

  if (!component) {
    return (
      <Panel title="Properties">
        <p className="text-sm text-secondary-500 text-center py-4">
          Select a field on the canvas to edit its properties
        </p>
      </Panel>
    );
  }

  const label = typeof component.props.label === 'string' ? component.props.label : '';
  const name = typeof component.props.name === 'string' ? component.props.name : '';
  const placeholder =
    typeof component.props.placeholder === 'string' ? component.props.placeholder : '';
  const required = Boolean(component.props.required);

  return (
    <Panel title="Properties">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Type</label>
          <input
            type="text"
            value={component.type}
            disabled
            className="w-full px-3 py-2 border border-builder-border rounded bg-secondary-50 text-secondary-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Label</label>
          <input
            ref={labelRef}
            type="text"
            value={label}
            onChange={(e) =>
              onUpdate(component.id, {
                props: { label: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-builder-border rounded bg-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) =>
              onUpdate(component.id, {
                props: { name: e.target.value },
              })
            }
            className="w-full px-3 py-2 border border-builder-border rounded bg-white text-sm"
          />
        </div>

        {(component.type === 'text' || component.type === 'textarea') && (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Placeholder</label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) =>
                onUpdate(component.id, {
                  props: { placeholder: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-builder-border rounded bg-white text-sm"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-secondary-700">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) =>
              onUpdate(component.id, {
                props: { required: e.target.checked },
              })
            }
            className="rounded border-builder-border"
          />
          Required
        </label>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(component.id)}
          className="w-full justify-center"
        >
          <Icon type="delete" size="sm" className="mr-2" />
          Delete field
        </Button>
      </div>
    </Panel>
  );
};

export const BuilderView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const components = useAppSelector((state) => state.builder.schema.present);
  const selectedComponentId = useAppSelector((state) => state.builder.selectedComponentId);
  const canUndo = useAppSelector((state) => state.builder.schema.past.length > 0);
  const canRedo = useAppSelector((state) => state.builder.schema.future.length > 0);

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null;
    return components.find((c) => c.id === selectedComponentId) ?? null;
  }, [components, selectedComponentId]);

  const { sensors } = useDragAndDrop();
  const { save, load, clear, exportJson, importJson } = useSchemaPersistence();

  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleSelect = useCallback(
    (id: string) => {
      dispatch(selectComponent(id));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(removeComponent(id));
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<Component>) => {
      dispatch(updateComponent({ id, updates }));
    },
    [dispatch]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      dispatch(setDragging(true));
      const data = event.active.data.current as ActiveDragData | undefined;
      setActiveDrag(data ?? null);
    },
    [dispatch]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      dispatch(setDragging(false));
      setActiveDrag(null);

      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as ActiveDragData | undefined;

      if (activeData?.kind === 'component') {
        let overId = String(over.id);
        if (overId === 'canvas') {
          const lastId = components[components.length - 1]?.id;
          if (!lastId || lastId === String(active.id)) return;
          overId = lastId;
        }

        if (String(active.id) !== overId) {
          dispatch(reorderComponents({ activeId: String(active.id), overId }));
        }
        return;
      }

      if (activeData?.kind === 'template') {
        const template = FIELD_TEMPLATES.find((t) => t.type === activeData.templateType);
        if (!template) return;

        const id = generateId();
        const baseName = String(template.defaultProps.name ?? template.type);
        const nextComponent: Component = {
          id,
          type: template.type,
          props: {
            ...template.defaultProps,
            name: `${baseName}_${id.slice(-4)}`,
          },
          order: components.length,
        };

        const overId = String(over.id);
        const overIndex = components.findIndex((c) => c.id === overId);
        const insertIndex = overId === 'canvas' || overIndex === -1 ? components.length : overIndex;

        dispatch(addComponent({ component: nextComponent, index: insertIndex }));
        dispatch(selectComponent(nextComponent.id));
      }
    },
    [components, dispatch]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      if (
        (isMeta && e.key.toLowerCase() === 'y') ||
        (isMeta && e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        e.preventDefault();
        dispatch(removeComponent(selectedComponentId));
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch, selectedComponentId]);

  const palettePanel = (
    <Panel title="Field palette">
      <ul role="listbox" aria-label="Field templates" className="space-y-2">
        {FIELD_TEMPLATES.map((template) => (
          <TemplateDraggable key={template.type} template={template} />
        ))}
      </ul>
    </Panel>
  );

  const inspectorPanel = (
    <PropertiesInspector
      component={selectedComponent}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );

  const dragOverlayLabel = useMemo(() => {
    if (!activeDrag) return null;
    if (activeDrag.kind === 'template') {
      return FIELD_TEMPLATES.find((t) => t.type === activeDrag.templateType)?.title ?? 'Field';
    }

    const component = components.find((c) => c.id === activeDrag.componentId);
    return component ? getComponentLabel(component) : 'Field';
  }, [activeDrag, components]);

  return (
    <div className="h-screen bg-builder-canvas flex flex-col">
      <header className="border-b border-builder-border bg-builder-panel px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-xl font-semibold text-secondary-900 truncate">Builder</h1>
          {status && (
            <span className="text-xs text-secondary-600" aria-live="polite">
              {status}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsPaletteOpen(true)}
          >
            Fields
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsInspectorOpen(true)}
          >
            Properties
          </Button>

          <Button variant="outline" size="sm" disabled={!canUndo} onClick={() => dispatch(undo())}>
            Undo
          </Button>
          <Button variant="outline" size="sm" disabled={!canRedo} onClick={() => dispatch(redo())}>
            Redo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              save();
              setStatus('Saved to localStorage');
              window.setTimeout(() => setStatus(null), 1500);
            }}
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ok = load();
              setStatus(ok ? 'Loaded from localStorage' : 'No saved schema found');
              window.setTimeout(() => setStatus(null), 1500);
            }}
          >
            Load
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clear();
              setStatus('Cleared');
              window.setTimeout(() => setStatus(null), 1500);
            }}
          >
            Clear
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsExportOpen(true)}>
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsImportOpen(true);
              setImportValue('');
              setImportError(null);
            }}
          >
            Import JSON
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate('/preview')}>
            <Icon type="preview" size="sm" className="mr-2" />
            Preview
          </Button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          dispatch(setDragging(false));
          setActiveDrag(null);
        }}
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[16rem_1fr] lg:grid-cols-[16rem_1fr_20rem]">
          <aside className="hidden md:block border-r border-builder-border bg-builder-panel p-4 overflow-y-auto">
            {palettePanel}
          </aside>

          <main className="min-w-0 p-4 md:p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <Canvas
                  components={components}
                  selectedComponentId={selectedComponentId}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              </SortableContext>
            </div>
          </main>

          <aside className="hidden lg:block border-l border-builder-border bg-builder-panel p-4 overflow-y-auto">
            {inspectorPanel}
          </aside>
        </div>

        <DragOverlay>
          {dragOverlayLabel ? (
            <div className="rounded border border-primary-300 bg-white px-3 py-2 shadow-md text-sm text-secondary-900">
              {dragOverlayLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} title="Field palette">
        {palettePanel}
      </Modal>

      <Modal isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} title="Properties">
        {inspectorPanel}
      </Modal>

      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export schema JSON"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(exportJson());
                setStatus('Copied to clipboard');
                window.setTimeout(() => setStatus(null), 1500);
              }}
            >
              Copy
            </Button>
            <Button size="sm" onClick={() => setIsExportOpen(false)}>
              Done
            </Button>
          </div>
        }
      >
        <textarea
          className="w-full h-72 font-mono text-xs border border-builder-border rounded p-3"
          readOnly
          value={exportJson()}
          aria-label="Schema JSON"
        />
      </Modal>

      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import schema JSON"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                try {
                  importJson(importValue);
                  setIsImportOpen(false);
                  setStatus('Imported schema');
                  window.setTimeout(() => setStatus(null), 1500);
                } catch (e) {
                  setImportError(e instanceof Error ? e.message : 'Invalid JSON');
                }
              }}
            >
              Import
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <textarea
            className="w-full h-72 font-mono text-xs border border-builder-border rounded p-3"
            value={importValue}
            onChange={(e) => {
              setImportValue(e.target.value);
              setImportError(null);
            }}
            aria-label="Schema JSON to import"
            placeholder='{"version":1,"components":[]}'
          />
          {importError && <p className="text-sm text-red-600">{importError}</p>}
        </div>
      </Modal>
    </div>
  );
};
