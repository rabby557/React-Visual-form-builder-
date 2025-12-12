import type React from 'react';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file_upload'
  | 'date'
  | 'time'
  | 'rich_text'
  | 'slider';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number | RegExp;
  message?: string;
}

export interface FieldConfigBase {
  label: string;
  name: string;
  helperText?: string;
  required?: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: unknown;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface TextFieldConfig extends FieldConfigBase {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface TextareaFieldConfig extends FieldConfigBase {
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export interface SelectFieldConfig extends FieldConfigBase {
  options: Array<{ label: string; value: string | number }>;
  multiple?: boolean;
}

export interface CheckboxFieldConfig extends FieldConfigBase {
  value?: string | number | boolean;
}

export interface RadioFieldConfig extends FieldConfigBase {
  options: Array<{ label: string; value: string | number }>;
}

export interface FileUploadFieldConfig extends FieldConfigBase {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export interface DateFieldConfig extends FieldConfigBase {
  min?: string;
  max?: string;
  step?: string;
}

export interface TimeFieldConfig extends FieldConfigBase {
  min?: string;
  max?: string;
  step?: string;
}

export interface RichTextFieldConfig extends FieldConfigBase {
  toolbar?: string[];
  minLength?: number;
  maxLength?: number;
}

export interface SliderFieldConfig extends FieldConfigBase {
  min: number;
  max: number;
  step?: number;
}

export type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | FileUploadFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | RichTextFieldConfig
  | SliderFieldConfig;

export interface FieldDefinition {
  type: FieldType;
  title: string;
  description: string;
  icon?: string;
  defaultConfig: Partial<FieldConfig>;
  configComponent?: React.ComponentType<{
    config: FieldConfig;
    onChange: (updates: Partial<FieldConfig>) => void;
  }>;
  renderComponent: React.ComponentType<{
    config: FieldConfig;
    mode: 'builder' | 'preview';
  }>;
  validateConfig?: (config: Partial<FieldConfig>) => string | null;
}

export interface ValidationSchema {
  type: string;
  rules: ValidationRule[];
}

export interface FieldRegistry {
  definitions: Map<FieldType, FieldDefinition>;
  register(type: FieldType, definition: FieldDefinition): void;
  unregister(type: FieldType): void;
  get(type: FieldType): FieldDefinition | undefined;
  getAll(): FieldDefinition[];
  isRegistered(type: FieldType): boolean;
}
