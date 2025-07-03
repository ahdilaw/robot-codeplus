# Custom UI Module

This module provides a complete replacement for the default VS Code workbench UI with a modern, macOS-inspired interface.

## Architecture

The custom UI is built with a modular architecture that separates concerns and allows for easy extension and maintenance:

### Core Components

#### `CustomUIManager`
The main orchestrator that initializes and coordinates all UI components.

```typescript
const uiManager = new CustomUIManager(containerElement);
uiManager.initialize();
```

#### `TitleBarManager`
Manages the custom title bar with drag regions, menus, and modal tabs.

#### `ModalManager`
Handles multiple modal windows with proper z-index ordering and lifecycle management.

#### `ModalWindow`
Individual modal window implementation with drag, resize, and window controls.

#### `Dock`
macOS-style dock for minimized modals and quick actions.

#### `Launchpad`
Full-screen overlay for creating and launching new modals.

### Utility Modules

#### `constants.ts`
Centralized configuration and constants:
- UI dimensions and colors
- Z-index layers
- Animation durations
- Typography settings

#### `utils.ts`
Shared utility functions:
- DOM manipulation helpers
- Event utilities (debounce, throttle)
- Position calculations
- Modal icon mapping

#### `styles.ts`
Style templates for consistent component styling:
- Button styles with hover effects
- Animation styles
- Resize handle styles
- Component-specific style generators

#### `types.ts`
TypeScript interfaces and types for type safety:
- Event interfaces
- Modal definitions
- State management types
- Callback types

## Key Features

### 1. Modular Design
- Each component is self-contained with clear interfaces
- Shared utilities reduce code duplication
- Centralized constants ensure consistency

### 2. Type Safety
- Full TypeScript support with comprehensive type definitions
- Strongly typed event system
- Interface-based component communication

### 3. Performance Optimized
- Debounced UI updates
- Efficient DOM manipulation
- Minimal style recalculations

### 4. Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast support

### 5. Responsive Design
- Adaptive layouts
- Window resize handling
- Mobile-friendly interactions

## Usage Examples

### Creating a Custom Modal

```typescript
import { ModalManager, ModalDefinition } from './ui';

const modalManager = new ModalManager();
const modalDef: ModalDefinition = {
  title: 'My Custom Modal',
  width: 600,
  height: 400,
  titleBarColor: '#007aff',
  icon: '📝'
};

const position = DOMUtils.calculateRandomModalPosition(modalDef.width, modalDef.height);
const modal = modalManager.createModal(
  modalDef.title,
  modalDef.width,
  modalDef.height,
  position.left,
  position.top,
  modalDef.titleBarColor
);
```

### Handling Events

```typescript
import { EventUtils } from './ui';

// Debounced resize handler
const handleResize = EventUtils.debounce(() => {
  uiManager.updateLayout();
}, 250);

window.addEventListener('resize', handleResize);
```

### Custom Styling

```typescript
import { StyleTemplates, UI_CONSTANTS } from './ui';

const buttonStyles = StyleTemplates.getButtonStyles(
  UI_CONSTANTS.COLORS.ACCENT_BLUE,
  'rgba(0, 122, 255, 0.8)'
);
```

## Extension Points

### Adding New Modal Types

1. Define the modal in `launchpad.ts`:
```typescript
const customModal: ModalDefinition = {
  title: 'Custom Tool',
  width: 800,
  height: 600,
  titleBarColor: '#ff6b35',
  icon: '🔧'
};
```

2. Add icon mapping in `constants.ts`:
```typescript
export const MODAL_ICONS = {
  // ...existing icons
  tool: '🔧',
  custom: '⚡'
} as const;
```

### Custom Themes

Modify `constants.ts` to add new color schemes:

```typescript
export const THEMES = {
  light: {
    TITLE_BAR_BG: 'rgba(246, 246, 246, 0.98)',
    CONTENT_BG: '#ffffff',
    // ...
  },
  dark: {
    TITLE_BAR_BG: 'rgba(30, 30, 30, 0.98)',
    CONTENT_BG: '#1e1e1e',
    // ...
  }
} as const;
```

## Best Practices

### Performance
- Use `EventUtils.debounce()` for frequent UI updates
- Batch DOM operations when possible
- Use `DOMUtils.animate()` for smooth transitions

### Styling
- Use `StyleTemplates` for consistent component styling
- Reference colors from `UI_CONSTANTS.COLORS`
- Apply CSS classes from `CSS_CLASSES` for maintainability

### Event Handling
- Use the typed event system with `EventCallback<T>`
- Leverage `EventUtils.createCustomEvent()` for component communication
- Implement proper cleanup in component destructors

### Error Handling
- Validate modal parameters before creation
- Handle edge cases in resize and drag operations
- Provide fallbacks for unsupported features

## Testing

The module is designed for easy testing with:
- Dependency injection for all external dependencies
- Pure functions in utility modules
- Mockable event system
- Isolated component state

## Migration Guide

When upgrading from older versions:

1. Update imports to use the new module structure
2. Replace hardcoded values with constants
3. Use new utility functions for DOM operations
4. Adopt the typed event system

## Contributing

When adding new features:

1. Follow the existing modular architecture
2. Add appropriate TypeScript types
3. Update the constants file for new configuration options
4. Add utility functions for reusable logic
5. Update this documentation
