import type { FieldConfig, ValidationRule } from '../types/fields';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class FieldValidator {
  static validateRequired(value: unknown): ValidationResult {
    if (value === '' || value === null || value === undefined) {
      return { valid: false, errors: ['This field is required'] };
    }
    return { valid: true, errors: [] };
  }

  static validateMinLength(value: unknown, minLength: number): ValidationResult {
    if (typeof value !== 'string') {
      return { valid: true, errors: [] };
    }
    if (value.length < minLength) {
      return {
        valid: false,
        errors: [`Minimum length is ${minLength} characters`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateMaxLength(value: unknown, maxLength: number): ValidationResult {
    if (typeof value !== 'string') {
      return { valid: true, errors: [] };
    }
    if (value.length > maxLength) {
      return {
        valid: false,
        errors: [`Maximum length is ${maxLength} characters`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validatePattern(value: unknown, pattern: string | RegExp): ValidationResult {
    if (typeof value !== 'string') {
      return { valid: true, errors: [] };
    }
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    if (!regex.test(value)) {
      return {
        valid: false,
        errors: ['Invalid format'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateNumber(value: unknown, min?: number, max?: number): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'number') {
      return { valid: true, errors: [] };
    }

    if (min !== undefined && value < min) {
      errors.push(`Minimum value is ${min}`);
    }

    if (max !== undefined && value > max) {
      errors.push(`Maximum value is ${max}`);
    }

    return { valid: errors.length === 0, errors };
  }

  static validateRule(value: unknown, rule: ValidationRule): ValidationResult {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value);
      case 'min':
        if (typeof value === 'string') {
          return this.validateMinLength(value, rule.value as number);
        }
        if (typeof value === 'number') {
          return this.validateNumber(value, rule.value as number);
        }
        return { valid: true, errors: [] };
      case 'max':
        if (typeof value === 'string') {
          return this.validateMaxLength(value, rule.value as number);
        }
        if (typeof value === 'number') {
          return this.validateNumber(value, undefined, rule.value as number);
        }
        return { valid: true, errors: [] };
      case 'pattern':
        return this.validatePattern(value, rule.value as string | RegExp);
      case 'custom':
        return { valid: true, errors: [] };
      default:
        return { valid: true, errors: [] };
    }
  }

  static validateRules(value: unknown, rules: ValidationRule[]): ValidationResult {
    const allErrors: string[] = [];

    for (const rule of rules) {
      const result = this.validateRule(value, rule);
      if (!result.valid) {
        allErrors.push(rule.message || result.errors.join(', '));
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  static validateFieldValue(config: FieldConfig, value: unknown): ValidationResult {
    const errors: string[] = [];

    // Check required
    if (config.required) {
      const result = this.validateRequired(value);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    // Check validation rules
    if (config.validationRules && config.validationRules.length > 0) {
      const result = this.validateRules(value, config.validationRules);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class ValidationSchemaBuilder {
  static buildZodSchema(config: FieldConfig): Record<string, unknown> {
    const schema: Record<string, unknown> = {};

    if (config.required) {
      schema.required = true;
    }

    if ('minLength' in config && config.minLength !== undefined) {
      schema.minLength = config.minLength;
    }

    if ('maxLength' in config && config.maxLength !== undefined) {
      schema.maxLength = config.maxLength;
    }

    if ('min' in config && config.min !== undefined) {
      schema.min = config.min;
    }

    if ('max' in config && config.max !== undefined) {
      schema.max = config.max;
    }

    if ('pattern' in config && config.pattern !== undefined) {
      schema.pattern = config.pattern;
    }

    return schema;
  }

  static buildYupSchema(config: FieldConfig): Record<string, unknown> {
    // Similar to Zod but with Yup structure
    return this.buildZodSchema(config);
  }

  static serializeValidationRules(config: FieldConfig): string {
    return JSON.stringify({
      type: 'field_validation',
      config: {
        label: config.label,
        name: config.name,
        required: config.required,
        validationRules: config.validationRules || [],
      },
    });
  }

  static deserializeValidationRules(json: string): FieldConfig | null {
    try {
      const parsed = JSON.parse(json);
      if (parsed.type === 'field_validation') {
        return parsed.config as FieldConfig;
      }
      return null;
    } catch {
      return null;
    }
  }
}
