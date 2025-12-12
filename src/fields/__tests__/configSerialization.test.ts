import { describe, it, expect } from 'vitest';
import type {
  TextFieldConfig,
  SelectFieldConfig,
  SliderFieldConfig,
  FieldConfig,
} from '../../types/fields';

describe('Field Configuration Serialization', () => {
  it('should serialize and deserialize text field config', () => {
    const config: TextFieldConfig = {
      label: 'Email',
      name: 'email',
      helperText: 'Enter your email address',
      required: true,
      placeholder: 'name@example.com',
      maxLength: 100,
      pattern: '[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$',
    };

    const json = JSON.stringify(config);
    const deserialized: TextFieldConfig = JSON.parse(json);

    expect(deserialized).toEqual(config);
    expect(deserialized.label).toBe('Email');
    expect(deserialized.required).toBe(true);
    expect(deserialized.pattern).toBe(config.pattern);
  });

  it('should serialize and deserialize select field config with options', () => {
    const config: SelectFieldConfig = {
      label: 'Country',
      name: 'country',
      required: true,
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'Mexico', value: 'mx' },
      ],
      multiple: false,
      defaultValue: 'us',
    };

    const json = JSON.stringify(config);
    const deserialized: SelectFieldConfig = JSON.parse(json);

    expect(deserialized).toEqual(config);
    expect(deserialized.options).toHaveLength(3);
    expect(deserialized.options[0].value).toBe('us');
  });

  it('should serialize and deserialize slider field config', () => {
    const config: SliderFieldConfig = {
      label: 'Rating',
      name: 'rating',
      required: true,
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 3,
    };

    const json = JSON.stringify(config);
    const deserialized: SliderFieldConfig = JSON.parse(json);

    expect(deserialized).toEqual(config);
    expect(deserialized.min).toBe(1);
    expect(deserialized.max).toBe(5);
    expect(deserialized.defaultValue).toBe(3);
  });

  it('should preserve all field types in serialization', () => {
    const configs: FieldConfig[] = [
      {
        label: 'Name',
        name: 'name',
        required: true,
        placeholder: 'John Doe',
      },
      {
        label: 'Bio',
        name: 'bio',
        helperText: 'Tell us about yourself',
        placeholder: 'Your bio',
      },
    ];

    const json = JSON.stringify(configs);
    const deserialized: FieldConfig[] = JSON.parse(json);

    expect(deserialized).toHaveLength(2);
    expect(deserialized[0].label).toBe('Name');
    expect(deserialized[1].helperText).toBe('Tell us about yourself');
  });

  it('should handle config with validation rules', () => {
    const config: TextFieldConfig = {
      label: 'Password',
      name: 'password',
      required: true,
      validationRules: [
        { type: 'required', message: 'Password is required' },
        { type: 'min', value: 8, message: 'Password must be at least 8 characters' },
        {
          type: 'pattern',
          value: '^(?=.*[A-Z])(?=.*[0-9])',
          message: 'Password must contain uppercase and number',
        },
      ],
    };

    const json = JSON.stringify(config);
    const deserialized: TextFieldConfig = JSON.parse(json);

    expect(deserialized.validationRules).toHaveLength(3);
    expect(deserialized.validationRules?.[1].value).toBe(8);
    expect(deserialized.validationRules?.[2].type).toBe('pattern');
  });

  it('should handle undefined and optional fields', () => {
    const config: SelectFieldConfig = {
      label: 'Status',
      name: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    };

    const json = JSON.stringify(config);
    const deserialized: SelectFieldConfig = JSON.parse(json);

    expect(deserialized.required).toBeUndefined();
    expect(deserialized.multiple).toBeUndefined();
    expect(deserialized.defaultValue).toBeUndefined();
    expect(deserialized.disabled).toBeUndefined();
  });

  it('should maintain type safety for numeric fields', () => {
    const config: SliderFieldConfig = {
      label: 'Score',
      name: 'score',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    };

    const json = JSON.stringify(config);
    const deserialized: SliderFieldConfig = JSON.parse(json);

    expect(typeof deserialized.min).toBe('number');
    expect(typeof deserialized.max).toBe('number');
    expect(typeof deserialized.step).toBe('number');
    expect(typeof deserialized.defaultValue).toBe('number');
  });
});
