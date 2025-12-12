import { describe, it, expect } from 'vitest';
import { FieldValidator, ValidationSchemaBuilder } from '../validation';
import type { TextFieldConfig, SliderFieldConfig } from '../../types/fields';

describe('FieldValidator', () => {
  it('should validate required field', () => {
    const result = FieldValidator.validateRequired('value');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation for empty required field', () => {
    const result = FieldValidator.validateRequired('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('required');
  });

  it('should validate min length', () => {
    const result = FieldValidator.validateMinLength('password123', 8);
    expect(result.valid).toBe(true);
  });

  it('should fail validation for min length', () => {
    const result = FieldValidator.validateMinLength('pass', 8);
    expect(result.valid).toBe(false);
  });

  it('should validate max length', () => {
    const result = FieldValidator.validateMaxLength('test', 10);
    expect(result.valid).toBe(true);
  });

  it('should fail validation for max length', () => {
    const result = FieldValidator.validateMaxLength('this is a very long string', 10);
    expect(result.valid).toBe(false);
  });

  it('should validate pattern', () => {
    const result = FieldValidator.validatePattern('user@example.com', /^[^@]+@[^@]+\.[^@]+$/);
    expect(result.valid).toBe(true);
  });

  it('should fail validation for invalid pattern', () => {
    const result = FieldValidator.validatePattern('invalid-email', /^[^@]+@[^@]+\.[^@]+$/);
    expect(result.valid).toBe(false);
  });

  it('should validate number ranges', () => {
    const result = FieldValidator.validateNumber(50, 0, 100);
    expect(result.valid).toBe(true);
  });

  it('should fail validation for number outside range', () => {
    const result = FieldValidator.validateNumber(150, 0, 100);
    expect(result.valid).toBe(false);
  });

  it('should validate multiple rules', () => {
    const rules = [
      { type: 'required' as const, message: 'Required' },
      { type: 'min' as const, value: 8, message: 'Min 8 chars' },
      { type: 'max' as const, value: 20, message: 'Max 20 chars' },
    ];

    const result = FieldValidator.validateRules('password123', rules);
    expect(result.valid).toBe(true);
  });

  it('should fail validation for multiple rules', () => {
    const rules = [
      { type: 'required' as const, message: 'Required' },
      { type: 'min' as const, value: 8, message: 'Min 8 chars' },
    ];

    const result = FieldValidator.validateRules('pass', rules);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Min 8 chars');
  });

  it('should validate field value with config', () => {
    const config: TextFieldConfig = {
      label: 'Email',
      name: 'email',
      required: true,
      validationRules: [
        { type: 'pattern', value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' },
      ],
    };

    const result = FieldValidator.validateFieldValue(config, 'user@example.com');
    expect(result.valid).toBe(true);
  });

  it('should fail field value validation', () => {
    const config: TextFieldConfig = {
      label: 'Email',
      name: 'email',
      required: true,
    };

    const result = FieldValidator.validateFieldValue(config, '');
    expect(result.valid).toBe(false);
  });
});

describe('ValidationSchemaBuilder', () => {
  it('should build schema for required field', () => {
    const config: TextFieldConfig = {
      label: 'Name',
      name: 'name',
      required: true,
    };

    const schema = ValidationSchemaBuilder.buildZodSchema(config);
    expect(schema.required).toBe(true);
  });

  it('should build schema with length constraints', () => {
    const config: TextFieldConfig = {
      label: 'Password',
      name: 'password',
      required: true,
      minLength: 8,
      maxLength: 20,
    };

    const schema = ValidationSchemaBuilder.buildZodSchema(config);
    expect(schema.required).toBe(true);
    expect(schema.minLength).toBe(8);
    expect(schema.maxLength).toBe(20);
  });

  it('should build schema with numeric constraints', () => {
    const config: SliderFieldConfig = {
      label: 'Rating',
      name: 'rating',
      min: 1,
      max: 5,
    };

    const schema = ValidationSchemaBuilder.buildZodSchema(config);
    expect(schema.min).toBe(1);
    expect(schema.max).toBe(5);
  });

  it('should serialize validation rules', () => {
    const config: TextFieldConfig = {
      label: 'Email',
      name: 'email',
      required: true,
      validationRules: [{ type: 'pattern', value: /^[^@]+@[^@]+\.[^@]+$/ }],
    };

    const json = ValidationSchemaBuilder.serializeValidationRules(config);
    expect(json).toContain('field_validation');
    expect(json).toContain('email');
  });

  it('should deserialize validation rules', () => {
    const original: TextFieldConfig = {
      label: 'Email',
      name: 'email',
      required: true,
      validationRules: [{ type: 'pattern', value: /^[^@]+@[^@]+\.[^@]+$/ }],
    };

    const json = ValidationSchemaBuilder.serializeValidationRules(original);
    const deserialized = ValidationSchemaBuilder.deserializeValidationRules(json);

    expect(deserialized).not.toBeNull();
    expect(deserialized?.label).toBe('Email');
    expect(deserialized?.required).toBe(true);
  });

  it('should return null for invalid JSON', () => {
    const result = ValidationSchemaBuilder.deserializeValidationRules('invalid json');
    expect(result).toBeNull();
  });

  it('should return null for non-validation JSON', () => {
    const json = JSON.stringify({ type: 'other', data: {} });
    const result = ValidationSchemaBuilder.deserializeValidationRules(json);
    expect(result).toBeNull();
  });
});
