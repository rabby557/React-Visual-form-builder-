# Contributing Guide

Thank you for your interest in contributing to the Builder Stack project! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feat/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates
- `refactor/*`: Code refactoring

### Making Changes

1. Create a new branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run dev      # Test in development
   npm run build    # Ensure build works
   npm run lint     # Check for linting errors
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   The pre-commit hook will automatically:
   - Lint your code
   - Format with Prettier
   - Block commit if there are errors

5. Push your branch:
   ```bash
   git push origin feat/your-feature-name
   ```

6. Create a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define interfaces/types in `src/types/`
- Avoid using `any` type
- Use proper type annotations
- Prefer interfaces over types for object shapes

Example:
```typescript
// Good
interface UserProps {
  name: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, age }) => {
  return <div>{name}</div>;
};

// Avoid
const User = (props: any) => {
  return <div>{props.name}</div>;
};
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Export components from barrel files (`index.ts`)
- Keep components focused and single-purpose

```typescript
// src/components/MyComponent/MyComponent.tsx
import type { MyComponentProps } from '../../types';

export const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div className="p-4">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// src/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
```

### Styling

- Use Tailwind CSS utility classes
- Use custom theme tokens from `tailwind.config.js`
- Follow mobile-first responsive design
- Avoid inline styles

```typescript
// Good
<div className="bg-builder-panel border border-builder-border rounded-panel p-4 hover:shadow-panel-hover">

// Avoid
<div style={{ backgroundColor: '#ffffff', padding: '16px' }}>
```

### State Management

- Use Redux Toolkit for global state
- Use typed hooks from `src/store/hooks.ts`
- Keep state normalized
- Use local state for UI-only state

```typescript
// Good - Global state
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addComponent } from '../../store/builderSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.builder.components);
};

// Good - Local UI state
import { useState } from 'react';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
};
```

### File Naming

- Components: PascalCase (`Button.tsx`, `BuilderView.tsx`)
- Hooks: camelCase with 'use' prefix (`useBuilder.ts`)
- Utils: camelCase (`helpers.ts`, `validators.ts`)
- Types: camelCase (`index.ts`)
- Barrel exports: `index.ts`

### Import Order

Organize imports in the following order:
1. React imports
2. Third-party libraries
3. Internal modules (hooks, store, types)
4. Components
5. Utilities
6. Styles

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../store/hooks';
import type { Component } from '../../types';

import { Button, Panel } from '../../components/ui';
import { generateId } from '../../utils/helpers';
```

## Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(builder): add drag and drop for components

- Integrate DnD Kit
- Add sortable component list
- Update builder state with reorder action

Closes #123
```

```
fix(ui): correct button loading state

The loading spinner was not centered properly in small buttons.
```

```
docs(readme): update installation instructions
```

## Testing Guidelines

### Manual Testing

Before submitting a PR:
1. Test the feature in development mode
2. Test in different browsers (Chrome, Firefox, Safari)
3. Test responsive design (mobile, tablet, desktop)
4. Test accessibility with keyboard navigation
5. Verify no console errors or warnings

### Future: Automated Testing

(To be implemented)
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## Pull Request Process

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] TypeScript types are properly defined
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots
If applicable, add screenshots

## Related Issues
Closes #issue_number
```

### Review Process

1. Submit PR with detailed description
2. Automated checks run (linting, build)
3. Code review by team member(s)
4. Address review comments
5. Approval and merge

## Code Review Guidelines

### As a Reviewer

- Be respectful and constructive
- Explain the reasoning behind suggestions
- Approve when code meets standards
- Request changes if issues exist

### As an Author

- Respond to all comments
- Ask for clarification if needed
- Make requested changes
- Keep discussions professional

## Common Issues

### Pre-commit Hook Fails

If the pre-commit hook fails:
1. Check the error message
2. Run `npm run lint:fix` to auto-fix issues
3. Run `npm run format` to format code
4. Review remaining errors manually
5. Try committing again

### Build Errors

If the build fails:
1. Check TypeScript errors carefully
2. Ensure all imports are correct
3. Verify type definitions
4. Run `npm run build` locally

### Linting Errors

Common fixes:
```bash
# Auto-fix linting issues
npm run lint:fix

# Format all files
npm run format
```

## Getting Help

- Check existing documentation (README.md, ARCHITECTURE.md)
- Search existing issues
- Ask in team chat/communication channel
- Create an issue for bugs or feature requests

## Project Structure Reference

```
src/
├── components/     # Shared components
├── hooks/          # Custom hooks
├── modules/        # Feature modules
├── store/          # Redux state
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push                 # Push to remote
```

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DnD Kit Documentation](https://docs.dndkit.com/)
- [React Router Documentation](https://reactrouter.com/)

## License

This project is proprietary and confidential.
