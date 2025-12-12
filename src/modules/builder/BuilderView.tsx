import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { FieldRenderer } from '../../fields/FieldRenderer';
import { getFieldRegistry } from '../../fields/registry';
import { FieldConfigPanel } from '../../fields/config/FieldConfigPanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addComponent,
  addStep,
  redo,
  removeComponent,
  removeStep,
  reorderComponents,
  selectComponent,
  selectStep,
  setDragging,
  undo,
  updateComponent,
  updateStep,
} from '../../store/builderSlice';
import type {
  Component,
  FieldConfig,
  FieldType,
  FormStep,
  LogicOperator,
  ValidationRule,
  VisibilityCondition,
  VisibilityRule,
} from '../../types';
import { generateId } from '../../utils/helpers';

type FieldTemplate = {
  id: string;
  type: FieldType;
  title: string;
  description: string;
  defaultConfig: Partial<FieldConfig>;
};

type ActiveDragData =
  | { kind: 'template'; templateId: string }
  | { kind: 'component'; componentId: string };

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

const getComponentLabel = (component: Component) => {
  const label = (component.props as FieldConfig).label;
  return typeof label === 'string' && label.trim().length > 0 ? label : component.type;
};

const StepsPanel: React.FC<{
  steps: FormStep[];
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onAddStep: () => void;
  onRenameStep: (id: string, title: string) => void;
  onDeleteStep: (id: string) => void;
}> = ({ steps, selectedStepId, onSelectStep, onAddStep, onRenameStep, onDeleteStep }) => {
  return (
    <Panel title="Steps">
      <div className="space-y-2">
        {steps.map((step) => {
          const isSelected = selectedStepId === step.id;
          return (
            <div
              key={step.id}
              className={`rounded border p-2 ${
                isSelected ? 'border-primary-400 bg-primary-50' : 'border-builder-border bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSelected ? (
                  <input
                    value={step.title}
                    onChange={(e) => onRenameStep(step.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-builder-border rounded bg-white text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectStep(step.id)}
                    className="flex-1 text-left text-sm font-medium text-secondary-900"
                  >
                    {step.title}
                  </button>
                )}

                <button
                  type="button"
                  className="p-1 rounded hover:bg-red-50 text-red-600 disabled:opacity-50"
                  disabled={steps.length <= 1}
                  aria-label={`Delete ${step.title}`}
                  onClick={() => onDeleteStep(step.id)}
                >
                  <Icon type="delete" size="sm" />
                </button>
              </div>
            </div>
          );
        })}

        <Button variant="outline" size="sm" onClick={onAddStep} className="w-full justify-center">
          <Icon type="add" size="sm" className="mr-2" />
          Add step
        </Button>
      </div>
    </Panel>
  );
};

const TemplateDraggable: React.FC<{ template: FieldTemplate }> = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template:${template.id}`,
    data: { kind: 'template', templateId: template.id } satisfies ActiveDragData,
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
  const type = component.type as FieldType;
  const config = component.props as FieldConfig;

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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-secondary-900 truncate">{label}</div>
            <div className="text-xs text-secondary-600 mt-0.5">Type: {component.type}</div>
            <div className="mt-3">
              <FieldRenderer type={type} config={config} mode="builder" />
            </div>
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
        className={`min-h-[18rem] rounded transition-colors ${isOver ? 'bg-primary-50' : ''}`}
      >
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary-500">
            <Icon type="builder" size="lg" className="mb-4" />
            <p className="text-lg">Add fields to this step</p>
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

const ValidationRulesEditor: React.FC<{
  rules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
}> = ({ rules, onChange }) => {
  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    const next = rules.map((rule, i) => (i === index ? { ...rule, ...updates } : rule));
    onChange(next);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {rules.length === 0 ? (
        <p className="text-sm text-secondary-500">No extra validation rules.</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, index) => {
            const valueInputType = rule.type === 'pattern' ? 'text' : 'number';
            const showValue = rule.type === 'min' || rule.type === 'max' || rule.type === 'pattern';

            return (
              <div key={index} className="rounded border border-builder-border bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(index, { type: e.target.value as ValidationRule['type'] })}
                    className="px-2 py-1 border border-builder-border rounded text-sm"
                  >
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="pattern">Pattern</option>
                  </select>

                  <button
                    type="button"
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                    onClick={() => removeRule(index)}
                    aria-label="Remove rule"
                  >
                    <Icon type="delete" size="sm" />
                  </button>
                </div>

                {showValue && (
                  <input
                    type={valueInputType}
                    value={rule.value === undefined ? '' : String(rule.value)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (rule.type === 'pattern') {
                        updateRule(index, { value: v });
                        return;
                      }
                      updateRule(index, { value: v ? Number(v) : undefined });
                    }}
                    className="w-full px-3 py-2 border border-builder-border rounded text-sm"
                    placeholder={rule.type === 'pattern' ? 'Regex pattern' : 'Value'}
                  />
                )}

                <input
                  type="text"
                  value={rule.message || ''}
                  onChange={(e) => updateRule(index, { message: e.target.value })}
                  className="w-full px-3 py-2 border border-builder-border rounded text-sm"
                  placeholder="Custom error message (optional)"
                />
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...rules, { type: 'min', value: 0 }])}
        className="justify-center"
      >
        <Icon type="add" size="sm" className="mr-2" />
        Add rule
      </Button>
    </div>
  );
};

const OPERATOR_LABELS: Record<LogicOperator, string> = {
  equals: 'Equals',
  not_equals: 'Not equals',
  contains: 'Contains',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
  is_checked: 'Is checked',
  is_unchecked: 'Is unchecked',
};

const VisibilityRuleEditor: React.FC<{
  rule: VisibilityRule | undefined;
  components: Component[];
  currentComponentId: string;
  onChange: (rule: VisibilityRule | undefined) => void;
}> = ({ rule, components, currentComponentId, onChange }) => {
  const safeRule: VisibilityRule =
    rule ?? ({ action: 'show', match: 'all', conditions: [] } satisfies VisibilityRule);

  const update = (updates: Partial<VisibilityRule>) => {
    onChange({ ...safeRule, ...updates });
  };

  const updateCondition = (index: number, updates: Partial<VisibilityCondition>) => {
    const nextConditions = safeRule.conditions.map((c, i) => (i === index ? { ...c, ...updates } : c));
    update({ conditions: nextConditions });
  };

  const removeCondition = (index: number) => {
    update({ conditions: safeRule.conditions.filter((_, i) => i !== index) });
  };

  const otherComponents = useMemo(() => {
    return components.filter((c) => c.id !== currentComponentId);
  }, [components, currentComponentId]);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-secondary-700">
        <input
          type="checkbox"
          checked={Boolean(rule)}
          onChange={(e) => onChange(e.target.checked ? safeRule : undefined)}
          className="border-builder-border"
        />
        Enable conditional visibility
      </label>

      {rule && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-secondary-700">Action</label>
            <select
              value={safeRule.action}
              onChange={(e) => update({ action: e.target.value as VisibilityRule['action'] })}
              className="px-2 py-1 border border-builder-border rounded text-sm"
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
            </select>

            <label className="text-sm font-medium text-secondary-700 ml-2">When</label>
            <select
              value={safeRule.match}
              onChange={(e) => update({ match: e.target.value as VisibilityRule['match'] })}
              className="px-2 py-1 border border-builder-border rounded text-sm"
            >
              <option value="all">All conditions match</option>
              <option value="any">Any condition matches</option>
            </select>
          </div>

          {safeRule.conditions.length === 0 ? (
            <p className="text-sm text-secondary-500">Add one or more conditions.</p>
          ) : (
            <div className="space-y-2">
              {safeRule.conditions.map((condition, index) => {
                const needsValue =
                  condition.operator !== 'is_empty' &&
                  condition.operator !== 'is_not_empty' &&
                  condition.operator !== 'is_checked' &&
                  condition.operator !== 'is_unchecked';

                return (
                  <div key={index} className="rounded border border-builder-border bg-white p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={condition.sourceComponentId}
                        onChange={(e) => updateCondition(index, { sourceComponentId: e.target.value })}
                        className="flex-1 px-2 py-1 border border-builder-border rounded text-sm"
                      >
                        <option value="">Select field</option>
                        {otherComponents.map((c) => (
                          <option key={c.id} value={c.id}>
                            {getComponentLabel(c)}
                          </option>
                        ))}
                      </select>

                      <select
                        value={condition.operator}
                        onChange={(e) =>
                          updateCondition(index, { operator: e.target.value as VisibilityCondition['operator'] })
                        }
                        className="px-2 py-1 border border-builder-border rounded text-sm"
                      >
                        {(Object.keys(OPERATOR_LABELS) as LogicOperator[]).map((op) => (
                          <option key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                        onClick={() => removeCondition(index)}
                        aria-label="Remove condition"
                      >
                        <Icon type="delete" size="sm" />
                      </button>
                    </div>

                    {needsValue && (
                      <input
                        type="text"
                        value={condition.value === undefined ? '' : String(condition.value)}
                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-builder-border rounded text-sm"
                        placeholder="Value"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                conditions: [
                  ...safeRule.conditions,
                  { sourceComponentId: '', operator: 'equals', value: '' } satisfies VisibilityCondition,
                ],
              })
            }
            className="justify-center"
          >
            <Icon type="add" size="sm" className="mr-2" />
            Add condition
          </Button>
        </div>
      )}
    </div>
  );
};

const PropertiesInspector: React.FC<{
  component: Component | null;
  steps: FormStep[];
  allComponents: Component[];
  onUpdate: (id: string, updates: Partial<Component>) => void;
  onDelete: (id: string) => void;
}> = ({ component, steps, allComponents, onUpdate, onDelete }) => {
  const registry = getFieldRegistry();

  if (!component) {
    return (
      <Panel title="Properties">
        <p className="text-sm text-secondary-500 text-center py-4">
          Select a field on the canvas to edit its properties
        </p>
      </Panel>
    );
  }

  const definition = registry.get(component.type as FieldType);
  const config = component.props as FieldConfig;
  const visibilityRule = (component.props as { visibilityRule?: VisibilityRule }).visibilityRule;

  const configError = useMemo(() => {
    if (!definition?.validateConfig) return null;
    return definition.validateConfig(config);
  }, [config, definition]);

  const ConfigComponent = definition?.configComponent ?? FieldConfigPanel;

  const validationRules = (config.validationRules || []) as ValidationRule[];

  return (
    <Panel title="Properties">
      <div className="space-y-5">
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
          <label className="block text-sm font-medium text-secondary-700 mb-1">Step</label>
          <select
            value={component.stepId || steps[0]?.id}
            onChange={(e) => onUpdate(component.id, { stepId: e.target.value })}
            className="w-full px-3 py-2 border border-builder-border rounded bg-white text-sm"
          >
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-2">Field configuration</h3>
          <ConfigComponent
            config={config}
            onChange={(updates) => onUpdate(component.id, { props: updates })}
            error={configError}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-2">Validation rules</h3>
          <ValidationRulesEditor
            rules={validationRules}
            onChange={(rules) => onUpdate(component.id, { props: { validationRules: rules } })}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-secondary-900 mb-2">Visibility rules</h3>
          <VisibilityRuleEditor
            rule={visibilityRule}
            components={allComponents}
            currentComponentId={component.id}
            onChange={(next) => onUpdate(component.id, { props: { visibilityRule: next } })}
          />
        </div>

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

  const schema = useAppSelector((state) => state.builder.schema.present);
  const selectedComponentId = useAppSelector((state) => state.builder.selectedComponentId);
  const selectedStepId = useAppSelector((state) => state.builder.selectedStepId);
  const canUndo = useAppSelector((state) => state.builder.schema.past.length > 0);
  const canRedo = useAppSelector((state) => state.builder.schema.future.length > 0);

  const steps = useMemo(() => [...schema.steps].sort((a, b) => a.order - b.order), [schema.steps]);
  const activeStepId = selectedStepId ?? steps[0]?.id ?? null;

  const componentsForStep = useMemo(() => {
    if (!activeStepId) return [];
    return schema.components
      .filter((c) => c.stepId === activeStepId)
      .sort((a, b) => a.order - b.order);
  }, [schema.components, activeStepId]);

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null;
    return schema.components.find((c) => c.id === selectedComponentId) ?? null;
  }, [schema.components, selectedComponentId]);

  const registry = getFieldRegistry();

  const templates = useMemo<FieldTemplate[]>(() => {
    const base = registry.getAll().map((def) => ({
      id: def.type,
      type: def.type,
      title: def.title,
      description: def.description,
      defaultConfig: def.defaultConfig,
    }));

    const presets: FieldTemplate[] = [
      {
        id: 'text:email',
        type: 'text',
        title: 'Email',
        description: 'Email address (preset)',
        defaultConfig: {
          label: 'Email',
          name: 'email',
          placeholder: 'name@example.com',
          validationRules: [
            {
              type: 'pattern',
              value: '[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$',
              message: 'Enter a valid email address',
            },
          ],
        },
      },
      {
        id: 'text:phone',
        type: 'text',
        title: 'Phone',
        description: 'Phone number (preset)',
        defaultConfig: {
          label: 'Phone',
          name: 'phone',
          placeholder: '(555) 123-4567',
        },
      },
    ];

    return [...presets, ...base];
  }, [registry]);

  const templateById = useMemo(() => {
    const map = new Map<string, FieldTemplate>();
    for (const template of templates) map.set(template.id, template);
    return map;
  }, [templates]);

  const { sensors } = useDragAndDrop();
  const { save, load, clear, exportJson, importJson } = useSchemaPersistence();

  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [isLeftOpen, setIsLeftOpen] = useState(false);
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
      if (!over || !activeStepId) return;

      const activeData = active.data.current as ActiveDragData | undefined;

      if (activeData?.kind === 'component') {
        let overId = String(over.id);
        if (overId === 'canvas') {
          const lastId = componentsForStep[componentsForStep.length - 1]?.id;
          if (!lastId || lastId === String(active.id)) return;
          overId = lastId;
        }

        if (String(active.id) !== overId) {
          dispatch(reorderComponents({ activeId: String(active.id), overId }));
        }
        return;
      }

      if (activeData?.kind === 'template') {
        const template = templateById.get(activeData.templateId);
        if (!template) return;

        const id = generateId();
        const baseName = template.defaultConfig.name ?? template.type;

        const definition = registry.get(template.type);
        const baseConfig = (definition?.defaultConfig ?? {}) as Partial<FieldConfig>;

        const config: FieldConfig = {
          ...(baseConfig as FieldConfig),
          ...(template.defaultConfig as FieldConfig),
          label: String(template.defaultConfig.label ?? baseConfig.label ?? template.title),
          name: `${String(baseName)}_${id.slice(-4)}`,
        };

        const nextComponent: Component = {
          id,
          type: template.type,
          props: config as unknown as Record<string, unknown>,
          order: componentsForStep.length,
          stepId: activeStepId,
        };

        const overId = String(over.id);
        const overIndex = componentsForStep.findIndex((c) => c.id === overId);
        const insertIndex = overId === 'canvas' || overIndex === -1 ? componentsForStep.length : overIndex;

        dispatch(addComponent({ component: nextComponent, index: insertIndex }));
        dispatch(selectComponent(nextComponent.id));
      }
    },
    [
      activeStepId,
      componentsForStep,
      dispatch,
      registry,
      templateById,
    ]
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
    <div className="space-y-4">
      <StepsPanel
        steps={steps}
        selectedStepId={activeStepId}
        onSelectStep={(id) => {
          dispatch(selectStep(id));
          dispatch(selectComponent(null));
        }}
        onAddStep={() => {
          const nextId = `step_${generateId().slice(-4)}`;
          dispatch(addStep({ step: { id: nextId, title: `Step ${steps.length + 1}`, order: steps.length } }));
        }}
        onRenameStep={(id, title) => dispatch(updateStep({ id, updates: { title } }))}
        onDeleteStep={(id) => dispatch(removeStep(id))}
      />

      <Panel title="Field palette">
        <ul role="listbox" aria-label="Field templates" className="space-y-2">
          {templates.map((template) => (
            <TemplateDraggable key={template.id} template={template} />
          ))}
        </ul>
      </Panel>
    </div>
  );

  const inspectorPanel = (
    <PropertiesInspector
      component={selectedComponent}
      steps={steps}
      allComponents={schema.components}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );

  const dragOverlayLabel = useMemo(() => {
    if (!activeDrag) return null;
    if (activeDrag.kind === 'template') {
      return templateById.get(activeDrag.templateId)?.title ?? 'Field';
    }

    const component = schema.components.find((c) => c.id === activeDrag.componentId);
    return component ? getComponentLabel(component) : 'Field';
  }, [activeDrag, schema.components, templateById]);

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
          <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsLeftOpen(true)}>
            Steps & Fields
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
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[18rem_1fr] lg:grid-cols-[18rem_1fr_22rem]">
          <aside className="hidden md:block border-r border-builder-border bg-builder-panel p-4 overflow-y-auto">
            {palettePanel}
          </aside>

          <main className="min-w-0 p-4 md:p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <SortableContext items={componentsForStep.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <Canvas
                  components={componentsForStep}
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

      <Modal isOpen={isLeftOpen} onClose={() => setIsLeftOpen(false)} title="Steps & field palette">
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
            placeholder='{"version":2,"steps":[],"components":[]}'
          />
          {importError && <p className="text-sm text-red-600">{importError}</p>}
        </div>
      </Modal>
    </div>
  );
};
