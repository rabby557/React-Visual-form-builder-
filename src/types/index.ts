export interface Component {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  order: number;
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

export interface BuilderState {
  schema: UndoRedoState<Component[]>;
  selectedComponentId: string | null;
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
