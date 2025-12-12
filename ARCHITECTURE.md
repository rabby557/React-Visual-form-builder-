# Architecture Overview

## Project Structure

This document provides a detailed overview of the architecture and design decisions made for the Builder Stack application.

## Directory Structure

```
src/
├── components/
│   └── ui/              # Shared UI primitives
│       ├── Button.tsx   # Configurable button component
│       ├── Icon.tsx     # SVG icon component
│       ├── Modal.tsx    # Modal dialog component
│       └── Panel.tsx    # Panel/card component
├── hooks/               # Custom React hooks
│   ├── index.ts
│   └── useDragAndDrop.ts  # DnD Kit sensors configuration
├── modules/             # Feature modules
│   ├── builder/         # Builder interface module
│   │   ├── BuilderView.tsx
│   │   └── index.ts
│   └── preview/         # Preview mode module
│       ├── PreviewView.tsx
│       └── index.ts
├── store/               # Redux state management
│   ├── builderSlice.ts  # Builder state slice
│   ├── hooks.ts         # Typed Redux hooks
│   └── index.ts         # Store configuration
├── types/               # TypeScript definitions
│   └── index.ts         # Shared type definitions
└── utils/               # Utility functions
    └── helpers.ts       # Common helper functions
```

## State Management

### Redux Toolkit

The application uses Redux Toolkit for state management. The store is configured in `src/store/index.ts` and includes:

#### Builder Slice (`builderSlice.ts`)

Manages the builder state including:
- `components`: Array of builder components
- `selectedComponentId`: Currently selected component ID
- `isDragging`: Drag state indicator

**Actions:**
- `addComponent`: Add a new component to the canvas
- `removeComponent`: Remove a component by ID
- `updateComponent`: Update component properties
- `selectComponent`: Select a component for editing
- `setDragging`: Update drag state
- `reorderComponents`: Reorder components after drag-and-drop

### Typed Hooks

Use the typed hooks from `src/store/hooks.ts`:
- `useAppDispatch`: Typed dispatch hook
- `useAppSelector`: Typed selector hook

Example:
```typescript
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addComponent } from '../../store/builderSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.builder.components);
  
  const handleAdd = () => {
    dispatch(addComponent({ id: '1', type: 'text', props: {}, order: 0 }));
  };
};
```

## Drag and Drop

### DnD Kit Integration

The application is configured with DnD Kit for drag-and-drop functionality. The setup is in `src/hooks/useDragAndDrop.ts`.

#### Sensors Configuration

- **PointerSensor**: Mouse/touch drag with 8px activation distance (prevents accidental drags)
- **KeyboardSensor**: Keyboard accessibility with sortable coordinates

#### Usage Example

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDragAndDrop } from '../../hooks';

const BuilderCanvas = () => {
  const { sensors } = useDragAndDrop();
  const components = useAppSelector((state) => state.builder.components);
  
  const handleDragEnd = (event: DragEndEvent) => {
    // Handle reordering logic
  };
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={components} strategy={verticalListSortingStrategy}>
        {/* Sortable components */}
      </SortableContext>
    </DndContext>
  );
};
```

## Routing

### React Router Configuration

The application uses React Router v7 with the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirects to `/builder` |
| `/builder` | BuilderView | Main builder interface |
| `/preview` | PreviewView | Preview mode for built components |

Navigation example:
```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const goToPreview = () => {
    navigate('/preview');
  };
};
```

## Component Design System

### UI Primitives

All shared UI components are in `src/components/ui/` and follow consistent patterns:

#### Button Component

**Variants:**
- `primary`: Primary actions (default)
- `secondary`: Secondary actions
- `outline`: Outlined buttons
- `ghost`: Minimal styling
- `danger`: Destructive actions

**Sizes:** `sm`, `md`, `lg`

**Features:**
- Loading states with spinner
- Disabled states
- Full accessibility support

```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="danger" size="sm" isLoading>
  Deleting...
</Button>
```

#### Panel Component

Collapsible panels with titles and custom content.

```typescript
<Panel title="Properties" collapsible defaultCollapsed={false}>
  <div>Panel content</div>
</Panel>
```

#### Modal Component

Accessible modal dialogs with keyboard support.

```typescript
<Modal 
  isOpen={isOpen} 
  onClose={handleClose} 
  title="Edit Component"
  footer={<Button>Save</Button>}
>
  <div>Modal content</div>
</Modal>
```

#### Icon Component

SVG icon component with predefined icons.

**Available Icons:**
- `close`, `add`, `delete`, `edit`, `drag`
- `preview`, `builder`, `settings`

```typescript
<Icon type="add" size="md" className="text-primary-600" />
```

## Styling

### Tailwind CSS

The application uses Tailwind CSS with a custom configuration in `tailwind.config.js`.

#### Custom Theme Tokens

**Colors:**
- `primary`: Blue scale (50-950)
- `secondary`: Slate scale (50-950)
- `builder`: Canvas, panel, border, hover, selected

**Spacing:** Custom values (18, 88, 112, 128)

**Shadows:**
- `shadow-panel`: Default panel shadow
- `shadow-panel-hover`: Hover state shadow
- `shadow-modal`: Modal shadow

**Example:**
```typescript
<div className="bg-builder-panel border border-builder-border rounded-panel shadow-panel p-4">
  <h2 className="text-secondary-900 text-lg font-semibold">Title</h2>
</div>
```

## Utilities

### Helper Functions

Located in `src/utils/helpers.ts`:

- **`generateId()`**: Generate unique IDs for components
- **`classNames(...classes)`**: Conditionally join class names
- **`debounce(func, wait)`**: Debounce function calls

```typescript
import { generateId, classNames, debounce } from '../utils/helpers';

const id = generateId(); // "1638123456789-abc123def"

const classes = classNames(
  'base-class',
  isActive && 'active-class',
  'another-class'
); // "base-class active-class another-class"

const debouncedSearch = debounce(searchFunction, 300);
```

## Type System

### TypeScript Types

All shared types are defined in `src/types/index.ts`.

#### Key Interfaces

**Component:**
```typescript
interface Component {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  order: number;
}
```

**BuilderState:**
```typescript
interface BuilderState {
  components: Component[];
  selectedComponentId: string | null;
  isDragging: boolean;
}
```

## Development Workflow

### Code Quality

1. **ESLint**: Configured with TypeScript and React rules
2. **Prettier**: Enforces consistent formatting
3. **Husky**: Git hooks for pre-commit checks
4. **lint-staged**: Only lint staged files

### Git Workflow

1. Make changes
2. Stage files: `git add .`
3. Commit: `git commit -m "message"`
4. Pre-commit hook runs automatically:
   - Lints staged files
   - Formats code
   - Fails if errors exist

### Testing Changes

```bash
# Development server
npm run dev

# Type checking
npm run build

# Linting
npm run lint

# Formatting
npm run format
```

## Best Practices

### Component Creation

1. Place shared components in `src/components/ui/`
2. Place feature-specific components in `src/modules/{feature}/components/`
3. Export from barrel files (`index.ts`)
4. Use TypeScript for all components
5. Follow the established styling patterns

### State Management

1. Create feature slices in `src/store/`
2. Use typed hooks from `src/store/hooks.ts`
3. Keep state normalized
4. Use RTK's `createSlice` for consistency

### Styling

1. Use Tailwind utility classes
2. Use custom theme tokens for consistency
3. Avoid inline styles
4. Use custom CSS only when necessary

### Type Safety

1. Define interfaces in `src/types/`
2. Use strict TypeScript settings
3. Avoid `any` type
4. Export types for reuse

## Performance Considerations

1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Memoization**: Use React.memo() for expensive components
3. **DnD Optimization**: Sensors are configured with activation constraints
4. **Build Optimization**: Vite handles tree-shaking and minification

## Future Enhancements

Potential areas for expansion:
- Component library integration
- Real-time collaboration
- Undo/redo functionality
- Component templates
- Export functionality
- API integration
- Persistent storage
