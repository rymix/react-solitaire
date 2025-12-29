# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Windows 3.1-style Klondike Solitaire game built with React, featuring the classic victory animation, theming support, and both mouse and touch controls. This is a monorepo managed with pnpm workspaces containing publishable npm packages.

## Monorepo Structure

This project uses a monorepo architecture with three distinct packages:

- **`packages/core`** - Pure TypeScript game logic with NO React dependency. Contains all game state management, rules, scoring, and validation. Can be used standalone in non-React environments.
- **`packages/react`** - React components, hooks, and themes. Depends on `@react-solitaire/core` and exports styled-components-based UI.
- **`apps/demo`** - Demo application for development and testing. Uses both core and react packages.

When making changes:
- Core game logic changes must NEVER import React or React-related dependencies
- React components should delegate all game logic to the core package
- Test core logic changes in `packages/core/src/**/*.test.ts` files using vitest

## Common Commands

### Development
```bash
# Install dependencies (must use pnpm)
pnpm install

# Run demo app for development
pnpm dev
# Equivalent to: pnpm --filter demo dev

# Build all packages
pnpm build
# This runs: packages/core -> packages/react (respects dependency order)

# Build specific packages
pnpm build:core      # Just @react-solitaire/core
pnpm build:react     # Just @react-solitaire/react
pnpm build:all       # All packages + demo app

# Run tests (core package only has tests currently)
pnpm test
# Or: pnpm test:core

# Watch mode for tests
pnpm --filter @react-solitaire/core test:watch

# Linting and formatting
pnpm lint            # Lint all packages
pnpm format          # Format all code
pnpm format:check    # Check formatting without modifying
```

### Building Individual Packages
```bash
# Build and watch core package during development
cd packages/core
pnpm dev

# Build and watch react package during development
cd packages/react
pnpm dev
```

## Architecture

### Core Package Game State Flow

The core package is organized around immutable state management:

1. **State Creation** (`game.ts`):
   - `createInitialState()` creates a new shuffled game
   - Game state includes: 7 tableau piles, 4 foundation piles, stock, waste, score, timing, config
   - All state is cloned before modifications to maintain immutability

2. **Game Operations** (`game.ts`):
   - `drawFromStock()` - Move cards from stock to waste
   - `resetStock()` - Recycle waste back to stock (with draw mode rules)
   - `executeMove()` - Move cards between piles (validates via rules engine)
   - `autoMoveToFoundation()` - Double-click behavior for auto-moving to foundations or Kings to empty tableau
   - `autoCompleteStep()` - One step of auto-complete algorithm
   - All operations return new state rather than mutating

3. **Rules Engine** (`rules.ts`):
   - `isValidMove()` - Validates moves based on Solitaire rules
   - `canPickUpCards()` - Checks if cards can be picked up from a pile
   - `checkWinCondition()` - Determines if game is won (all cards in foundations)
   - `findAutoCompleteMove()` - AI for auto-complete feature
   - `canAutoComplete()` - Determines if auto-complete button should be shown
   - `hasValidMoves()` - Checks if any valid moves remain (for game over detection)

4. **Scoring System** (`scoring.ts`):
   - Standard mode: +10 to foundation, +5 for reveals, -15 for foundation to tableau, -20 for recycle in draw-three
   - Vegas mode: +5 to foundation, -52 initial buy-in, limited recycles
   - Score is calculated per move in `calculateMoveScore()`

5. **Types** (`types.ts`):
   - All TypeScript types and interfaces are defined here
   - Includes `Card`, `Pile`, `GameState`, `CardLocation`, `Move`, `GameConfig`
   - Core types are imported throughout the codebase

### React Package Architecture

The React package wraps the core logic with UI components:

1. **`useGame` Hook** (`hooks/useGame.ts`):
   - Primary interface between React and core game logic
   - Uses `useReducer` with `GameHistory` class for undo/redo
   - Exposes: `state`, `newGame()`, `draw()`, `move()`, `autoMove()`, `undo()`, `canUndo`, etc.
   - All game actions flow through the reducer

2. **`useDrag` Hook** (`hooks/useDrag.ts`):
   - Unified mouse and touch drag-and-drop implementation
   - Manages drag state, drop target validation, and pointer events
   - Used by `<Solitaire>` component for card dragging

3. **`useSounds` Hook** (`hooks/useSounds.ts`):
   - Wraps `use-sound` (optional peer dependency)
   - Provides: `play('pickup' | 'place' | 'draw' | 'flip' | 'invalid' | 'bounce')`
   - Gracefully handles missing `use-sound` dependency

4. **Component Hierarchy**:
   ```
   <Solitaire>              (Main component, game logic coordination)
   ├── <Table>              (Game board layout)
   │   ├── <Pile>           (Stock, waste, foundations, tableau)
   │   │   └── <Card>       (Individual card rendering)
   ├── <VictoryAnimation>   (Bouncing cards win animation)
   └── <Controls>           (UI controls - timer, score, etc.)
   ```

5. **Theming** (`themes/`):
   - `SolitaireTheme` type defines all visual properties
   - `win31Theme` is the default Windows 3.1-inspired theme
   - Themes control: colors, card dimensions, spacing, animations, typography
   - Passed down through component props (no context provider)

### Key Behavioral Details

1. **Click-to-Flip vs Auto-Flip**:
   - Default: `autoFlipTableau: false` (matches original Windows Solitaire)
   - When false, players must click face-down cards to flip them
   - When true, cards auto-flip when exposed

2. **Double-Click Behavior**:
   - Double-clicking a card attempts auto-move via `canAutoMove()`
   - Priority: foundations first, then Kings to empty tableau
   - Can be disabled with `doubleClickEnabled: false`

3. **Draw Modes**:
   - `draw-one`: Draw one card at a time from stock
   - `draw-three`: Draw three cards at a time (only top card playable)

4. **Auto-Complete**:
   - Button appears when `canAutoComplete()` returns true
   - All face-down cards must be revealed
   - Only Aces and 2s remain in tableau, or foundations accept all remaining cards
   - Executes moves at 100ms intervals via `autoCompleteStep()`

5. **Victory Animation** (`components/VictoryAnimation/`):
   - Cards bounce from foundations with physics simulation
   - Each card launches with random initial velocity
   - Bounces on container edges with damping
   - Plays 'bounce' sound on each collision
   - Cards are hidden from table during animation via `hiddenCardIds` set

## Common Development Tasks

### Adding a New Game Rule

1. Modify validation in `packages/core/src/rules.ts` (`isValidMove`, etc.)
2. Add tests in `packages/core/src/rules.test.ts`
3. Run `pnpm test:core` to verify
4. Rebuild: `pnpm build:core`

### Adding a New Scoring Mode

1. Add new `ScoringMode` type to `packages/core/src/types.ts`
2. Update `packages/core/src/scoring.ts` functions
3. Update initial score in `getInitialScore()`
4. Add tests in `packages/core/src/game.test.ts`

### Creating a New Theme

1. Copy `packages/react/src/themes/win31.ts` as a starting point
2. Modify colors, dimensions, spacing according to `SolitaireTheme` interface
3. Export from `packages/react/src/themes/index.ts`
4. Import and use: `import { myTheme } from '@react-solitaire/react'`

### Adding Sound Effects

1. Place audio files in `apps/demo/public/sounds/` (demo app only)
2. Update `useSounds` hook to reference new sound names
3. Call `sounds.play('newSound')` in component callbacks
4. Sound effects are optional - the hook handles missing `use-sound` gracefully

### Testing Victory Animation

The `<Solitaire>` component accepts a `showTestButton` prop. When true, displays a test button that triggers `createWonState()` to instantly show the victory animation for debugging.

## Build System

- **Core**: Uses `tsup` to build CJS and ESM formats with TypeScript declarations
- **React**: Uses `tsup` with externals for peer dependencies (React, styled-components, use-sound)
- **Demo**: Uses Vite with `@vitejs/plugin-react`

All packages output to `dist/` directories which are gitignored.

## Package Manager

Must use **pnpm** (v8+). This is enforced in `package.json` via `"packageManager": "pnpm@9.1.0"`.

Workspace dependencies use `workspace:*` protocol to link local packages during development.
