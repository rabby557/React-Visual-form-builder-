# Field Library Usage Examples

This document provides practical examples of how to use the Field Library system.

## Basic Field Rendering

### Render a Text Field in Preview Mode

```typescript
import { FieldRenderer } from './fields/FieldRenderer';
import { initializeFieldRegistry } from './fields/initializeRegistry';
import type { TextFieldConfig } from './types/fields';

// Initialize registry (done automatically in App.tsx)
initializeFieldRegistry();

// Create field configuration
const emailConfig: TextFieldConfig = {
  label: 'Email Address',
  name: 'email',
  helperText: 'We will never share your email',
  placeholder: 'name@example.com',
  required: true,
  pattern: '[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$',
};

// Render field
function MyForm() {
  return (
    <FieldRenderer type="text" config={emailConfig} mode="preview" />
  );
}
```

### Render a Field in Builder Mode

```typescript
function FieldPreview() {
  return (
    // Shows disabled version for visual feedback in builder
    <FieldRenderer type="text" config={emailConfig} mode="builder" />
  );
}
```

## Working with Registry

### Register All Built-in Fields

```typescript
import { initializeFieldRegistry } from './fields/initializeRegistry';

// This is automatically called in App.tsx
initializeFieldRegistry();

// After this, all 10 field types are available:
// - text, textarea, select, checkbox, radio
// - file_upload, date, time, rich_text, slider
```

### Access a Field Definition from Registry

```typescript
import { getFieldRegistry } from './fields/registry';

const registry = getFieldRegistry();

// Get text field definition
const textFieldDef = registry.get('text');
console.log(textFieldDef.title); // "Text Input"

// Get all registered fields
const allFields = registry.getAll();
console.log(allFields.length); // 10

// Check if a field type is registered
const hasSelect = registry.isRegistered('select');
```

### Register a Custom Field Type

```typescript
import { getFieldRegistry } from './fields/registry';
import type { FieldDefinition, FieldConfig } from './types/fields';

// Create custom field definition
const customFieldDef: FieldDefinition = {
  type: 'phone',
  title: 'Phone Number',
  description: 'International phone number input',
  defaultConfig: {
    label: 'Phone Number',
    name: 'phone',
    placeholder: '+1 (555) 000-0000',
  },
  renderComponent: ({ config, mode }) => {
    return (
      <input
        type="tel"
        placeholder={config.placeholder}
        disabled={mode === 'builder'}
        className="w-full px-3 py-2 border border-builder-border rounded"
      />
    );
  },
  validateConfig: (config) => {
    if (!config.label) return 'Label is required';
    if (!config.name) return 'Name is required';
    return null;
  },
};

// Register it
const registry = getFieldRegistry();
registry.register('phone', customFieldDef);

// Now use it like any other field
<FieldRenderer type="phone" config={phoneConfig} mode="preview" />
```

## Field Configuration Examples

### Text Field with Validation

```typescript
import type { TextFieldConfig } from './types/fields';

const passwordConfig: TextFieldConfig = {
  label: 'Password',
  name: 'password',
  helperText: 'Must be 8-20 characters with uppercase and numbers',
  required: true,
  minLength: 8,
  maxLength: 20,
  pattern: '^(?=.*[A-Z])(?=.*[0-9])',
  validationRules: [
    { type: 'required', message: 'Password is required' },
    { type: 'min', value: 8, message: 'Minimum 8 characters' },
    { type: 'max', value: 20, message: 'Maximum 20 characters' },
    {
      type: 'pattern',
      value: '^(?=.*[A-Z])(?=.*[0-9])',
      message: 'Must contain uppercase and number',
    },
  ],
};
```

### Select Field with Options

```typescript
import type { SelectFieldConfig } from './types/fields';

const countryConfig: SelectFieldConfig = {
  label: 'Country',
  name: 'country',
  helperText: 'Select your country of residence',
  required: true,
  defaultValue: 'us',
  options: [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Australia', value: 'au' },
  ],
};
```

### Radio Field with Options

```typescript
import type { RadioFieldConfig } from './types/fields';

const genderConfig: RadioFieldConfig = {
  label: 'Gender',
  name: 'gender',
  required: true,
  defaultValue: 'prefer_not_to_say',
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non_binary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ],
};
```

### Slider Field with Range

```typescript
import type { SliderFieldConfig } from './types/fields';

const ratingConfig: SliderFieldConfig = {
  label: 'Product Rating',
  name: 'rating',
  helperText: 'How would you rate this product?',
  required: true,
  min: 1,
  max: 5,
  step: 1,
  defaultValue: 3,
};
```

### File Upload Field

```typescript
import type { FileUploadFieldConfig } from './types/fields';

const documentConfig: FileUploadFieldConfig = {
  label: 'Upload Document',
  name: 'document',
  helperText: 'PDF, DOC, or DOCX files up to 10MB',
  required: true,
  accept: '.pdf,.doc,.docx',
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB in bytes
};
```

## Validation Examples

### Validate a Field Value

```typescript
import { FieldValidator } from './fields/validation';
import type { TextFieldConfig } from './types/fields';

const emailConfig: TextFieldConfig = {
  label: 'Email',
  name: 'email',
  required: true,
  validationRules: [
    {
      type: 'pattern',
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format',
    },
  ],
};

// Validate user input
const userEmail = 'user@example.com';
const result = FieldValidator.validateFieldValue(emailConfig, userEmail);

if (!result.valid) {
  console.log('Validation errors:', result.errors);
  // Handle errors: display to user, etc.
}
```

### Apply Multiple Validation Rules

```typescript
import { FieldValidator } from './fields/validation';

const rules = [
  { type: 'required' as const, message: 'Field is required' },
  { type: 'min' as const, value: 3, message: 'Minimum 3 characters' },
  { type: 'max' as const, value: 50, message: 'Maximum 50 characters' },
  { type: 'pattern' as const, value: /^[a-zA-Z0-9_-]+$/, message: 'Invalid characters' },
];

const username = 'user_123';
const result = FieldValidator.validateRules(username, rules);

if (result.valid) {
  console.log('Username is valid!');
} else {
  result.errors.forEach((error) => console.log('Error:', error));
}
```

## Schema Building and Serialization

### Build a Validation Schema

```typescript
import { ValidationSchemaBuilder } from './fields/validation';
import type { TextFieldConfig } from './types/fields';

const passwordConfig: TextFieldConfig = {
  label: 'Password',
  name: 'password',
  required: true,
  minLength: 8,
  maxLength: 20,
  pattern: '^(?=.*[A-Z])(?=.*[0-9])',
};

// Build Zod-compatible schema
const schema = ValidationSchemaBuilder.buildZodSchema(passwordConfig);
console.log(schema);
// Output: { required: true, minLength: 8, maxLength: 20, pattern: '...' }

// Can be used with actual Zod for more advanced validation:
// const zodSchema = z.string()
//   .min(8)
//   .max(20)
//   .regex(/^(?=.*[A-Z])(?=.*[0-9])/);
```

### Serialize Field Configuration

```typescript
import { ValidationSchemaBuilder } from './fields/validation';
import type { TextFieldConfig } from './types/fields';

const config: TextFieldConfig = {
  label: 'Email',
  name: 'email',
  required: true,
  validationRules: [
    { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  ],
};

// Serialize to JSON for storage
const json = ValidationSchemaBuilder.serializeValidationRules(config);
localStorage.setItem('emailFieldConfig', json);

// Later, deserialize from storage
const stored = localStorage.getItem('emailFieldConfig');
const restoredConfig = ValidationSchemaBuilder.deserializeValidationRules(stored);
```

### Full Configuration Serialization

```typescript
import type { SelectFieldConfig } from './types/fields';

const config: SelectFieldConfig = {
  label: 'Status',
  name: 'status',
  required: true,
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
  ],
};

// Serialize entire config
const json = JSON.stringify(config);

// Deserialize
const restored = JSON.parse(json) as SelectFieldConfig;
console.log(restored.options[0].label); // "Active"
```

## Building a Complete Form

### Basic Contact Form

```typescript
import { FieldRenderer } from './fields/FieldRenderer';
import type {
  TextFieldConfig,
  TextareaFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
} from './types/fields';

const nameConfig: TextFieldConfig = {
  label: 'Full Name',
  name: 'name',
  required: true,
  placeholder: 'John Doe',
};

const emailConfig: TextFieldConfig = {
  label: 'Email',
  name: 'email',
  required: true,
  placeholder: 'john@example.com',
  validationRules: [
    {
      type: 'pattern',
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email',
    },
  ],
};

const messageConfig: TextareaFieldConfig = {
  label: 'Message',
  name: 'message',
  required: true,
  placeholder: 'Your message here...',
  rows: 5,
  maxLength: 500,
};

const subjectConfig: SelectFieldConfig = {
  label: 'Subject',
  name: 'subject',
  required: true,
  options: [
    { label: 'General Inquiry', value: 'inquiry' },
    { label: 'Support', value: 'support' },
    { label: 'Feedback', value: 'feedback' },
  ],
};

const agreeConfig: CheckboxFieldConfig = {
  label: 'I agree to the terms of service',
  name: 'agree',
  required: true,
};

export function ContactForm() {
  return (
    <form className="space-y-5 max-w-2xl mx-auto">
      <FieldRenderer type="text" config={nameConfig} mode="preview" />
      <FieldRenderer type="text" config={emailConfig} mode="preview" />
      <FieldRenderer type="select" config={subjectConfig} mode="preview" />
      <FieldRenderer type="textarea" config={messageConfig} mode="preview" />
      <FieldRenderer type="checkbox" config={agreeConfig} mode="preview" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Send
      </button>
    </form>
  );
}
```

## Testing Custom Fields

```typescript
import { describe, it, expect } from 'vitest';
import { FieldValidator } from './fields/validation';
import type { SliderFieldConfig } from './types/fields';

describe('Custom Slider Field', () => {
  it('should validate valid range values', () => {
    const config: SliderFieldConfig = {
      label: 'Rating',
      name: 'rating',
      min: 1,
      max: 5,
      required: true,
    };

    const result = FieldValidator.validateFieldValue(config, 3);
    expect(result.valid).toBe(true);
  });

  it('should reject values outside range', () => {
    const config: SliderFieldConfig = {
      label: 'Rating',
      name: 'rating',
      min: 1,
      max: 5,
      required: true,
      validationRules: [
        { type: 'min', value: 1, message: 'Minimum is 1' },
        { type: 'max', value: 5, message: 'Maximum is 5' },
      ],
    };

    const result = FieldValidator.validateFieldValue(config, 10);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Maximum is 5');
  });
});
```

## Error Handling

### Display Validation Errors

```typescript
import { FieldValidator } from './fields/validation';
import type { TextFieldConfig } from './types/fields';
import { useState } from 'react';

function TextField({ config }: { config: TextFieldConfig }) {
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Validate on change
    const result = FieldValidator.validateFieldValue(config, newValue);
    setErrors(result.errors);
  };

  return (
    <div>
      <label>{config.label}</label>
      <input value={value} onChange={handleChange} />
      {errors.length > 0 && (
        <ul className="text-red-600 text-sm mt-1">
          {errors.map((error, i) => (
            <li key={i}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Handle Unknown Field Types

```typescript
import { FieldRenderer } from './fields/FieldRenderer';
import { getFieldRegistry } from './fields/registry';

function SafeFieldRenderer({
  type,
  config,
  mode,
}: {
  type: string;
  config: any;
  mode: 'builder' | 'preview';
}) {
  const registry = getFieldRegistry();

  if (!registry.isRegistered(type as any)) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        Field type "{type}" is not registered. Available types: {registry.getAll().map((d) => d.type).join(', ')}
      </div>
    );
  }

  return <FieldRenderer type={type as any} config={config} mode={mode} />;
}
```

## Performance Tips

### Memoize Field Configurations

```typescript
import { useMemo } from 'react';
import type { TextFieldConfig } from './types/fields';

function OptimizedForm() {
  const nameConfig = useMemo<TextFieldConfig>(
    () => ({
      label: 'Name',
      name: 'name',
      required: true,
    }),
    []
  );

  return <FieldRenderer type="text" config={nameConfig} mode="preview" />;
}
```

### Cache Validation Rules

```typescript
import { useMemo } from 'react';
import { FieldValidator } from './fields/validation';

function ValidatingForm() {
  const validationRules = useMemo(
    () => [
      { type: 'required' as const },
      { type: 'min' as const, value: 3 },
      { type: 'max' as const, value: 50 },
    ],
    []
  );

  const validate = (value: string) => {
    return FieldValidator.validateRules(value, validationRules);
  };

  return <>{/* form content */}</>;
}
```

## Summary

The Field Library provides a comprehensive system for:
- ✅ Creating and managing form fields
- ✅ Validating user input with flexible rules
- ✅ Rendering fields in multiple modes
- ✅ Serializing configurations for persistence
- ✅ Extending with custom field types
- ✅ Building complete forms with type safety

Use the examples above as a starting point for your own implementations.
