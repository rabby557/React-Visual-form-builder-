import { describe, it, expect, beforeEach } from 'vitest';
import { createFieldRegistry } from '../registry';
import { textFieldDefinition } from '../TextField';
import { selectFieldDefinition } from '../SelectField';
import type { FieldRegistry } from '../../types/fields';

describe('FieldRegistry', () => {
  let registry: FieldRegistry;

  beforeEach(() => {
    registry = createFieldRegistry();
  });

  it('should register a field definition', () => {
    registry.register('text', textFieldDefinition);
    expect(registry.isRegistered('text')).toBe(true);
  });

  it('should retrieve a registered field definition', () => {
    registry.register('text', textFieldDefinition);
    const definition = registry.get('text');
    expect(definition).toBe(textFieldDefinition);
    expect(definition?.title).toBe('Text Input');
  });

  it('should return undefined for unregistered field types', () => {
    const definition = registry.get('text');
    expect(definition).toBeUndefined();
  });

  it('should unregister a field definition', () => {
    registry.register('text', textFieldDefinition);
    expect(registry.isRegistered('text')).toBe(true);
    registry.unregister('text');
    expect(registry.isRegistered('text')).toBe(false);
  });

  it('should get all registered definitions', () => {
    registry.register('text', textFieldDefinition);
    registry.register('select', selectFieldDefinition);
    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(textFieldDefinition);
    expect(all).toContain(selectFieldDefinition);
  });

  it('should handle multiple registrations and unregistrations', () => {
    registry.register('text', textFieldDefinition);
    registry.register('select', selectFieldDefinition);
    expect(registry.getAll()).toHaveLength(2);

    registry.unregister('text');
    expect(registry.getAll()).toHaveLength(1);
    expect(registry.isRegistered('text')).toBe(false);
    expect(registry.isRegistered('select')).toBe(true);
  });

  it('should allow re-registering a field type', () => {
    registry.register('text', textFieldDefinition);
    const def = registry.get('text');
    expect(def?.title).toBe('Text Input');

    registry.register('text', selectFieldDefinition);
    const updatedDef = registry.get('text');
    expect(updatedDef?.title).toBe('Select');
  });
});
