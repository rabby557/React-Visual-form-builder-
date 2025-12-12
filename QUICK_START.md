# Quick Start Guide

Get up and running with the Builder Stack in minutes!

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server (runs on http://localhost:5173)
npm run dev
```

The app will automatically reload when you make changes.

## Project Overview

### What's Included

✅ **React 19** with TypeScript  
✅ **Vite** for fast development and builds  
✅ **Tailwind CSS** with enterprise theme tokens  
✅ **Redux Toolkit** for state management  
✅ **React Router** for navigation (builder/preview modes)  
✅ **DnD Kit** for drag-and-drop functionality  
✅ **ESLint + Prettier** for code quality  
✅ **Husky** pre-commit hooks  

### Available Routes

- **`/`** → Redirects to `/builder`
- **`/builder`** → Main builder interface
- **`/preview`** → Preview mode

## Key Files & Folders

```
src/
├── components/ui/       # Button, Panel, Modal, Icon
├── modules/
│   ├── builder/        # Builder interface
│   └── preview/        # Preview mode
├── store/              # Redux state management
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## Common Tasks

### Add a New Component

1. Create component file in `src/components/ui/MyComponent.tsx`
2. Export from `src/components/ui/index.ts`
3. Use Tailwind for styling

```typescript
// src/components/ui/MyComponent.tsx
export const MyComponent: React.FC = () => {
  return <div className="p-4 bg-builder-panel">Hello!</div>;
};

// src/components/ui/index.ts
export { MyComponent } from './MyComponent';
```

### Use Redux State

```typescript
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectComponent } from '../../store/builderSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.builder.components);
  
  return <div>Found {components.length} components</div>;
};
```

### Navigate Between Pages

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/preview')}>
      Go to Preview
    </button>
  );
};
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code |

## Styling with Tailwind

### Custom Theme Tokens

```typescript
// Colors
bg-primary-600       // Primary blue
bg-secondary-700     // Secondary slate
bg-builder-canvas    // Canvas background
bg-builder-panel     // Panel background
border-builder-border // Border color
hover:bg-builder-hover // Hover state

// Shadows
shadow-panel         // Panel shadow
shadow-panel-hover   // Hover shadow
shadow-modal         // Modal shadow

// Spacing
rounded-panel        // Panel border radius
```

### Example Usage

```typescript
<div className="bg-builder-panel border border-builder-border rounded-panel shadow-panel p-4">
  <h2 className="text-secondary-900 text-lg font-semibold">Title</h2>
  <p className="text-secondary-600 text-sm">Description</p>
</div>
```

## UI Components

### Button

```typescript
import { Button } from '../components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg
```

### Panel

```typescript
import { Panel } from '../components/ui';

<Panel title="My Panel" collapsible>
  <div>Panel content</div>
</Panel>
```

### Modal

```typescript
import { Modal } from '../components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Edit">
  <div>Modal content</div>
</Modal>
```

### Icon

```typescript
import { Icon } from '../components/ui';

<Icon type="add" size="md" />
// Types: close, add, delete, edit, drag, preview, builder, settings
```

## Git Workflow

```bash
# Make changes
git add .

# Commit (pre-commit hooks run automatically)
git commit -m "feat: add new feature"

# Push
git push
```

Pre-commit hooks will:
- Lint staged files
- Format code with Prettier
- Block commit if errors exist

## Troubleshooting

### Pre-commit hook fails
```bash
npm run lint:fix
npm run format
```

### TypeScript errors
```bash
npm run build  # Check for type errors
```

### Dev server issues
```bash
# Kill existing process
pkill -f vite

# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

1. Read the full [README.md](./README.md) for detailed information
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design patterns
3. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
4. Start building! 🚀

## Help & Support

- Check existing documentation
- Review TypeScript types in `src/types/`
- Look at existing components for examples
- Run `npm run lint` to catch issues early

Happy coding! 🎉
