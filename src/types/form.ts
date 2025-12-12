export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_checked'
  | 'is_unchecked';

export interface VisibilityCondition {
  sourceComponentId: string;
  operator: LogicOperator;
  value?: string | number | boolean;
}

export interface VisibilityRule {
  action: 'show' | 'hide';
  match: 'all' | 'any';
  conditions: VisibilityCondition[];
}

export interface FormStep {
  id: string;
  title: string;
  order: number;
}
