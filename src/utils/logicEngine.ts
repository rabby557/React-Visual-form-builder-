import type { LogicOperator, VisibilityCondition, VisibilityRule } from '../types';

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const compareNumber = (left: unknown, right: unknown): { left?: number; right?: number } => {
  const l = typeof left === 'number' ? left : Number(toStringValue(left));
  const r = typeof right === 'number' ? right : Number(toStringValue(right));

  return {
    left: Number.isFinite(l) ? l : undefined,
    right: Number.isFinite(r) ? r : undefined,
  };
};

export const evaluateOperator = (operator: LogicOperator, left: unknown, right?: unknown): boolean => {
  switch (operator) {
    case 'equals':
      return toStringValue(left) === toStringValue(right);
    case 'not_equals':
      return toStringValue(left) !== toStringValue(right);
    case 'contains':
      return toStringValue(left).toLowerCase().includes(toStringValue(right).toLowerCase());
    case 'gt': {
      const { left: l, right: r } = compareNumber(left, right);
      return l !== undefined && r !== undefined ? l > r : false;
    }
    case 'gte': {
      const { left: l, right: r } = compareNumber(left, right);
      return l !== undefined && r !== undefined ? l >= r : false;
    }
    case 'lt': {
      const { left: l, right: r } = compareNumber(left, right);
      return l !== undefined && r !== undefined ? l < r : false;
    }
    case 'lte': {
      const { left: l, right: r } = compareNumber(left, right);
      return l !== undefined && r !== undefined ? l <= r : false;
    }
    case 'is_empty':
      return isEmpty(left);
    case 'is_not_empty':
      return !isEmpty(left);
    case 'is_checked':
      return Boolean(left) === true;
    case 'is_unchecked':
      return Boolean(left) === false;
    default:
      return false;
  }
};

export const evaluateCondition = (
  condition: VisibilityCondition,
  valuesByComponentId: Record<string, unknown>
): boolean => {
  if (!condition.sourceComponentId) return false;
  const left = valuesByComponentId[condition.sourceComponentId];
  return evaluateOperator(condition.operator, left, condition.value);
};

export const evaluateVisibilityRule = (
  rule: VisibilityRule | undefined,
  valuesByComponentId: Record<string, unknown>
): boolean => {
  if (!rule) return true;
  if (!rule.conditions || rule.conditions.length === 0) return true;

  const results = rule.conditions.map((condition) => evaluateCondition(condition, valuesByComponentId));

  const matches = rule.match === 'any' ? results.some(Boolean) : results.every(Boolean);

  return rule.action === 'show' ? matches : !matches;
};
