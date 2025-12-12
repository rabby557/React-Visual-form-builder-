import type { FieldType, FieldDefinition, FieldRegistry } from '../types/fields';

class FieldRegistryImpl implements FieldRegistry {
  definitions: Map<FieldType, FieldDefinition> = new Map();

  register(type: FieldType, definition: FieldDefinition): void {
    this.definitions.set(type, definition);
  }

  unregister(type: FieldType): void {
    this.definitions.delete(type);
  }

  get(type: FieldType): FieldDefinition | undefined {
    return this.definitions.get(type);
  }

  getAll(): FieldDefinition[] {
    return Array.from(this.definitions.values());
  }

  isRegistered(type: FieldType): boolean {
    return this.definitions.has(type);
  }
}

let globalRegistry: FieldRegistry | null = null;

export function getFieldRegistry(): FieldRegistry {
  if (!globalRegistry) {
    globalRegistry = new FieldRegistryImpl();
  }
  return globalRegistry;
}

export function resetFieldRegistry(): void {
  globalRegistry = null;
}

export function createFieldRegistry(): FieldRegistry {
  return new FieldRegistryImpl();
}
