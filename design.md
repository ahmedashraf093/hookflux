# HookFlux TUI Design Guidelines

HookFlux adheres to a strict "Modern TUI" (Terminal User Interface) aesthetic. The goal is to provide the utility of a command-line tool with the ergonomics of a modern web application.

## 1. Visual Foundation

### Color Palette
HookFlux uses a high-contrast, dark-mode-only palette focused on Zinc and specialized accent colors:
- **Base Background**: `#09090b` (Deep Black/Zinc-950)
- **Panel Background**: `#18181b` (Zinc-900)
- **Borders**: `#27272a` (Zinc-800)
- **Primary Accent (Fluxes)**: Blue (`#3b82f6`) - Used for pipelines and general system actions.
- **Secondary Accent (Scripts)**: Orange (`#ea580c`) - Used exclusively for shell script templates.
- **Critical/Error**: Red (`#ef4444`) - Used for destructive actions, failures, and security alerts.

### Typography
- **Font Family**: `JetBrains Mono`, monospace (Primary and Only font).
- **Scale**:
    - Small (Captions/Meta): `10px`
    - Base (Body): `14px`
    - Large (Headers): `18px - 32px`
- **Weight**: Heavy use of **Black (900)** and **Bold (700)** for headers and labels.

## 2. Component Design

### Panels & Borders
- All containers should use `border` with `border-zinc-800`.
- Interaction areas (cards) use a subtle `hover:border-blue-900/50` or `hover:border-orange-900/50` transition.
- Avoid rounded corners where possible; use `rounded-none` or very subtle `rounded-sm` for TTY authenticity.

### Inputs & Buttons
- **Inputs**: Dark background (`bg-zinc-950`), subtle borders, and `focus:border-accent` transitions.
- **Buttons**: Use uppercase text with wide tracking (`tracking-widest`).
- **Primary Action**: White text on Blue/Orange background.
- **Ghost Action**: Accent-colored border with transparent background.

### Scrolling
- Use the `.custom-scrollbar` class for all scrollable areas.
- Scrollbars should be thin (`4px` to `8px`) and Zinc-colored, turning Blue/Orange only on hover.

## 3. UI Patterns

### Layout Philosophy
- **Viewport Lock**: The app must use `h-screen overflow-hidden`. Navigation happens within fixed panels rather than through document scrolling.
- **Spacing**: Use generous padding (`p-12` for managers, `p-6` for modals) but tight leading for log streams to maximize information density.

### Naming & Labels
- Labels should favor technical, system-oriented terminology.
- Use uppercase with underscores for titles and actions (e.g., `INITIALIZE_FLUX`, `SYSTEM_AUDIT_TRAIL`).
- Append a trailing underscore `_` to input labels to simulate a prompt.

### Animations
- Keep transitions short (`duration-200` or `duration-300`).
- Use "slide-in-from-top" or "zoom-in-95" for overlays to give a "popping up a terminal" feel.
- Use `animate-pulse` sparingly for background tasks (e.g., running deployments).

## 4. Iconography
- Use **Lucide-React** icons.
- Differentiate functional areas by icon color (Blue for Flux, Orange for Scripts).
- Icons should be sized consistently (`14px` for inline, `24px` for headers).
