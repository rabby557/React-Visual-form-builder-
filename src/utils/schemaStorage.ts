import type { BuilderSchemaV1, Component } from '../types';

const STORAGE_KEY = 'builder.schema.v1';

export const serializeSchemaV1 = (components: Component[]): BuilderSchemaV1 => {
  return {
    version: 1,
    components,
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
    hasChildren
  );
};

export const parseSchemaJson = (json: string): Component[] => {
  const parsed: unknown = JSON.parse(json);

  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.components)) {
    throw new Error('Invalid schema format');
  }

  const components = parsed.components;
  if (!components.every(isComponentLike)) {
    throw new Error('Invalid components in schema');
  }

  const componentLikes = components as ComponentLike[];

  return componentLikes.map((component, index) => ({
    ...component,
    order: typeof component.order === 'number' ? component.order : index,
  }));
};

export const saveSchemaToStorage = (components: Component[]) => {
  if (typeof window === 'undefined') return;

  const schema = serializeSchemaV1(components);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
};

export const loadSchemaFromStorage = (): Component[] | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return parseSchemaJson(raw);
  } catch {
    return null;
  }
};

export const clearSchemaStorage = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
