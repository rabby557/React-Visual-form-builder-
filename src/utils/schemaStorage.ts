import type { BuilderSchema, BuilderSchemaV2, Component, FormSchema, FormStep } from '../types';

const STORAGE_KEY_V2 = 'builder.schema.v2';
const STORAGE_KEY_V1 = 'builder.schema.v1';

export const serializeSchemaV2 = (schema: FormSchema): BuilderSchemaV2 => {
  return {
    version: 2,
    steps: schema.steps,
    components: schema.components,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
};

type ComponentLike = Omit<Component, 'order'> & { order?: unknown };

const isComponentLike = (value: unknown): value is ComponentLike => {
  if (!isRecord(value)) return false;

  const hasChildren = value.children === undefined || isStringArray(value.children);

  return (
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    isRecord(value.props) &&
    (value.order === undefined || typeof value.order === 'number') &&
    (value.stepId === undefined || typeof value.stepId === 'string') &&
    hasChildren
  );
};

type FormStepLike = Omit<FormStep, 'order'> & { order?: unknown };

const isFormStepLike = (value: unknown): value is FormStepLike => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    (value.order === undefined || typeof value.order === 'number')
  );
};

const normalizeSteps = (steps: FormStepLike[]): FormStep[] => {
  return steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    order: typeof step.order === 'number' ? step.order : index,
  }));
};

const normalizeComponents = (components: ComponentLike[], fallbackStepId: string): Component[] => {
  return components.map((component, index) => ({
    ...component,
    order: typeof component.order === 'number' ? component.order : index,
    stepId: component.stepId ?? fallbackStepId,
  }));
};

export const parseSchemaJson = (json: string): FormSchema => {
  const parsed: unknown = JSON.parse(json);

  if (!isRecord(parsed) || typeof parsed.version !== 'number') {
    throw new Error('Invalid schema format');
  }

  const builderSchema = parsed as BuilderSchema;

  if (builderSchema.version === 1) {
    if (!('components' in builderSchema) || !Array.isArray(builderSchema.components)) {
      throw new Error('Invalid schema format');
    }

    const components = builderSchema.components;
    if (!components.every(isComponentLike)) {
      throw new Error('Invalid components in schema');
    }

    const fallbackStep: FormStep = { id: 'step_1', title: 'Step 1', order: 0 };

    return {
      steps: [fallbackStep],
      components: normalizeComponents(components as ComponentLike[], fallbackStep.id),
    };
  }

  if (builderSchema.version === 2) {
    if (!('steps' in builderSchema) || !Array.isArray(builderSchema.steps)) {
      throw new Error('Invalid steps in schema');
    }

    if (!('components' in builderSchema) || !Array.isArray(builderSchema.components)) {
      throw new Error('Invalid components in schema');
    }

    if (!builderSchema.steps.every(isFormStepLike)) {
      throw new Error('Invalid steps in schema');
    }

    if (!builderSchema.components.every(isComponentLike)) {
      throw new Error('Invalid components in schema');
    }

    const steps = normalizeSteps(builderSchema.steps as FormStepLike[]);
    const fallbackStepId = steps[0]?.id ?? 'step_1';

    return {
      steps,
      components: normalizeComponents(builderSchema.components as ComponentLike[], fallbackStepId),
    };
  }

  throw new Error('Unsupported schema version');
};

export const saveSchemaToStorage = (schema: FormSchema) => {
  if (typeof window === 'undefined') return;
  const serialized = serializeSchemaV2(schema);
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(serialized));
};

export const loadSchemaFromStorage = (): FormSchema | null => {
  if (typeof window === 'undefined') return null;

  const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
  if (rawV2) {
    try {
      return parseSchemaJson(rawV2);
    } catch {
      // fallthrough
    }
  }

  const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
  if (!rawV1) return null;

  try {
    return parseSchemaJson(rawV1);
  } catch {
    return null;
  }
};

export const clearSchemaStorage = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY_V2);
  window.localStorage.removeItem(STORAGE_KEY_V1);
};
