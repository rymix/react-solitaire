# React Solitaire 🂡

A Windows 3.1-style Klondike Solitaire game built with React, featuring the classic victory animation, theming support, and both mouse and touch controls.

## Features

- 🎮 **Classic Klondike Solitaire** gameplay
- 🖼️ **Windows 3.1 aesthetic** with authentic card designs and green felt
- 🎉 **Victory animation** with bouncing cards (just like the original!)
- 🖱️ **Drag-and-drop** with unified mouse and touch support
- ⌨️ **Click-to-select** alternative control scheme
- 🔊 **Sound effects** (via use-sound)
- 🎨 **Themeable** with built-in Win31 and Dark themes
- ⏱️ **Timer and scoring** with Standard and Vegas modes
- ↩️ **Undo support**
- 📦 **Publishable as npm package** for embedding in other projects

## Packages

This is a monorepo containing:

| Package | Description |
|---------|-------------|
| `@react-solitaire/core` | Pure TypeScript game logic (no React dependency) |
| `@react-solitaire/react` | React components and hooks |
| `demo` | Demo application |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Run demo
pnpm dev
```

## Usage

### Basic Usage

```tsx
import { Solitaire } from '@react-solitaire/react';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Solitaire />
    </div>
  );
}
```

### With Options

```tsx
import { Solitaire, win31Theme } from '@react-solitaire/react';

function App() {
  const handleWin = (stats) => {
    console.log(`Won in ${stats.moves} moves!`);
  };

  return (
    <Solitaire
      theme={win31Theme}
      options={{
        drawMode: 'draw-three',
        scoringMode: 'vegas',
        doubleClickEnabled: true,
      }}
      onWin={handleWin}
      scale={1.5}
    />
  );
}
```

### Using the Game Logic Directly

```tsx
import { useGame } from '@react-solitaire/react';

function CustomSolitaire() {
  const {
    state,
    draw,
    move,
    autoMove,
    undo,
    newGame,
  } = useGame({
    config: { drawMode: 'draw-one' },
  });

  // Build your own UI...
}
```

### Using Core Logic (No React)

```typescript
import {
  createInitialState,
  drawFromStock,
  executeMove,
  isValidMove,
} from '@react-solitaire/core';

// Create a new game
const state = createInitialState({ drawMode: 'draw-one' });

// Draw a card
const newState = drawFromStock(state);

// Check and make a move
const from = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
const to = { pileType: 'tableau', pileIndex: 3, cardIndex: 5 };

if (isValidMove(newState, from, to, 1)) {
  const result = executeMove(newState, from, to, 1);
  if (result.success) {
    console.log('Move successful!', result.state);
  }
}
```

## Theming

Create your own theme:

```typescript
import type { SolitaireTheme } from '@react-solitaire/react';

const myTheme: SolitaireTheme = {
  name: 'My Theme',
  colors: {
    table: '#1a472a',
    cardFace: '#ffffff',
    cardBack: '#8b0000',
    redSuit: '#cc0000',
    blackSuit: '#000000',
    // ... other colors
  },
  card: {
    width: 71,
    height: 96,
    borderRadius: 4,
    // ... other card properties
  },
  // ... spacing, animation, typography
};
```

## API Reference

### `<Solitaire />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `SolitaireTheme` | `win31Theme` | Visual theme |
| `options` | `SolitaireOptions` | `{}` | Game options |
| `onWin` | `(stats) => void` | - | Called when game is won |
| `onNewGame` | `() => void` | - | Called when new game starts |
| `newGameTrigger` | `number` | - | Increment to trigger new game |
| `scale` | `number` | `1` | Scale factor for cards |

### `SolitaireOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `drawMode` | `'draw-one' \| 'draw-three'` | `'draw-one'` | Cards drawn from stock |
| `scoringMode` | `'standard' \| 'vegas' \| 'none'` | `'standard'` | Scoring system |
| `unlimitedPasses` | `boolean` | `true` | Allow unlimited stock passes |
| `doubleClickEnabled` | `boolean` | `true` | Double-click to foundation |
| `sound` | `Partial<SoundConfig>` | - | Sound configuration |

## Development

```bash
# Run tests
pnpm test

# Run core tests with coverage
pnpm test:core

# Build all packages
pnpm build

# Format code
pnpm format
```

## Credits

- Game logic and React implementation by Steve Arnott
- Inspired by the original Windows 3.1 Solitaire by Wes Cherry
- Card graphics inspired by Susan Kare's original designs

## Licence

MIT
