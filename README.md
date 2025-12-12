# Builder Stack - Modern React Application

A modern, enterprise-ready React application built with Vite, TypeScript, Tailwind CSS, and Redux Toolkit. This project provides a robust foundation for building drag-and-drop visual builders with support for preview modes and modular architecture.

## 🚀 Tech Stack

### Core Technologies
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework

### State Management & Data Flow
- **Redux Toolkit** - Efficient Redux development with RTK
- **React Redux** - Official React bindings for Redux

### UI & Interactions
- **React DnD Kit** - Modern drag-and-drop library
  - `@dnd-kit/core` - Core drag-and-drop functionality
  - `@dnd-kit/sortable` - Sortable list support
  - `@dnd-kit/utilities` - Utility functions
- **React Router** - Client-side routing for builder/preview modes

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Shared UI primitives
│       ├── Button.tsx  # Button component with variants
│       ├── Panel.tsx   # Panel/Card component
│       ├── Modal.tsx   # Modal dialog component
│       ├── Icon.tsx    # Icon component with SVG icons
│       └── index.ts    # Barrel exports
├── modules/            # Feature modules
│   ├── builder/        # Builder mode module
│   │   ├── BuilderView.tsx
│   │   └── index.ts
│   └── preview/        # Preview mode module
│       ├── PreviewView.tsx
│       └── index.ts
├── hooks/              # Custom React hooks
├── store/              # Redux store configuration
│   ├── index.ts        # Store setup
│   ├── builderSlice.ts # Builder state slice
│   └── hooks.ts        # Typed Redux hooks
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── utils/              # Utility functions
│   └── helpers.ts      # Helper functions
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎨 Design System

### Color Palette

The project uses an enterprise-grade color system:

#### Primary Colors
- Blue scale (50-950) for primary actions and selections
- Used for buttons, links, and active states

#### Secondary Colors
- Slate scale (50-950) for text and UI elements
- Used for backgrounds, borders, and neutral elements

#### Builder-Specific Colors
- `builder.canvas` - Canvas background (#fafafa)
- `builder.panel` - Panel background (#ffffff)
- `builder.border` - Border color (#e5e7eb)
- `builder.hover` - Hover state (#f3f4f6)
- `builder.selected` - Selected state (#dbeafe)

### Typography
- **Sans-serif**: Inter, system-ui fallbacks
- **Monospace**: Fira Code

### Component Sizes
- **Small (sm)**: Compact UI elements
- **Medium (md)**: Default size
- **Large (lg)**: Prominent elements

### Spacing & Layout
- Custom spacing values: 18, 88, 112, 128 (in rem)
- Panel shadows for depth
- Z-index scale (60-100) for layering

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Building for Production

```bash
# Build the application
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Lint and auto-fix issues |
| `npm run format` | Format code with Prettier |

## 🔧 Configuration Files

### ESLint (`eslint.config.js`)
- Configured for TypeScript and React
- Integrated with Prettier
- React Hooks rules enforced
- Custom rules for unused variables

### Prettier (`.prettierrc`)
- Single quotes
- Semicolons enabled
- 100 character line width
- 2 space indentation

### Tailwind (`tailwind.config.js`)
- Custom color palette
- Enterprise theme tokens
- Extended spacing and shadows
- Custom z-index values

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- Modern ESNext target

## 🎯 Architecture Decisions

### State Management
**Choice**: Redux Toolkit

**Rationale**:
- Predictable state management for complex builder interactions
- Excellent TypeScript support
- Redux DevTools for debugging
- Time-travel debugging capabilities
- Well-established patterns for team collaboration

**Alternative Considered**: Zustand (simpler API, less boilerplate, but chosen RTK for enterprise features)

### Drag and Drop
**Choice**: DnD Kit

**Rationale**:
- Modern, performant drag-and-drop
- Excellent accessibility support
- Framework-agnostic core
- Better TypeScript support than react-dnd
- Active maintenance and community

### Routing
**Choice**: React Router v7

**Rationale**:
- Industry standard for React routing
- Supports builder/preview mode separation
- Nested routes for complex layouts
- Excellent TypeScript support

### Styling
**Choice**: Tailwind CSS

**Rationale**:
- Rapid UI development
- Consistent design system
- Small production bundle (unused styles purged)
- Easy theming with custom tokens
- Great IDE support with IntelliSense

### Module Structure
**Pattern**: Feature-based modules

**Rationale**:
- Clear separation of concerns
- Scalable for large applications
- Easy to locate related code
- Supports lazy loading
- Team-friendly structure

## 🔐 Git Hooks

The project uses Husky for Git hooks:

### Pre-commit Hook
Automatically runs on `git commit`:
- Lints staged files
- Formats code with Prettier
- Only processes staged files (via lint-staged)

This ensures code quality and consistency across the team.

## 🧩 UI Components

### Button
Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`
Features: Loading states, disabled states, full TypeScript support

### Panel
Features: Collapsible panels, custom titles, shadow variants

### Modal
Features: Keyboard support (ESC to close), backdrop blur, custom footer

### Icon
Available icons: close, add, delete, edit, drag, preview, builder, settings
Sizes: `sm`, `md`, `lg`

## 🚦 Routing Structure

- `/` - Redirects to `/builder`
- `/builder` - Main builder interface
- `/preview` - Preview mode for built components

## 📝 TypeScript Types

Key interfaces defined in `src/types/index.ts`:
- `Component` - Builder component structure
- `BuilderState` - Redux state shape
- `ButtonProps`, `PanelProps`, `ModalProps`, `IconProps` - UI component props

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure lint passes: `npm run lint`
4. Format code: `npm run format`
5. Commit (pre-commit hooks will run automatically)
6. Create a pull request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with modern tools and best practices for enterprise-grade React applications.
