import type { FormStep } from './form';

export interface Component {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  order: number;
  stepId?: string;
}

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface BuilderSchemaV1 {
  version: 1;
  components: Component[];
}

export interface BuilderSchemaV2 {
  version: 2;
  steps: FormStep[];
  components: Component[];
}

export type BuilderSchema = BuilderSchemaV1 | BuilderSchemaV2;

export interface FormSchema {
  steps: FormStep[];
  components: Component[];
}

export interface BuilderState {
  schema: UndoRedoState<FormSchema>;
  selectedComponentId: string | null;
  selectedStepId: string | null;
  isDragging: boolean;
}

export type IconType =
  | 'close'
  | 'add'
  | 'delete'
  | 'edit'
  | 'drag'
  | 'preview'
  | 'builder'
  | 'settings';

export interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface IconProps {
  type: IconType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export {
  type FormStep,
  type LogicOperator,
  type VisibilityCondition,
  type VisibilityRule,
} from './form';

export {
  type FieldType,
  type FieldConfig,
  type FieldDefinition,
  type FieldRegistry,
  type ValidationRule,
} from './fields';
