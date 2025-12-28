import React$1 from 'react';
import { Card as Card$1, Pile as Pile$1, CardLocation, GameState, ScoringMode, GameConfig, MoveResult } from '@react-solitaire/core';
export { Card as CardData, CardLocation, DrawMode, GameConfig, GameState, Pile as PileData, Rank, ScoringMode, Suit } from '@react-solitaire/core';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Theme definition for the Solitaire game
 */
interface SolitaireTheme {
    /** Theme name */
    name: string;
    /** Colours */
    colors: {
        /** Table/felt colour */
        table: string;
        /** Card face background */
        cardFace: string;
        /** Card back primary colour */
        cardBack: string;
        /** Card back pattern colour (optional) */
        cardBackPattern?: string;
        /** Red suit colour */
        redSuit: string;
        /** Black suit colour */
        blackSuit: string;
        /** Card border colour */
        cardBorder: string;
        /** Empty pile placeholder colour */
        emptyPile: string;
        /** Empty pile border colour */
        emptyPileBorder: string;
        /** Selection highlight colour */
        highlight: string;
        /** Valid drop target highlight */
        validDrop: string;
        /** Text colour */
        text: string;
        /** Secondary text colour */
        textSecondary: string;
    };
    /** Card dimensions */
    card: {
        /** Card width in pixels */
        width: number;
        /** Card height in pixels */
        height: number;
        /** Border radius */
        borderRadius: number;
        /** Border width */
        borderWidth: number;
        /** Shadow definition */
        shadow: string;
        /** Shadow when dragging */
        dragShadow: string;
    };
    /** Spacing values */
    spacing: {
        /** Vertical offset for stacked tableau cards (face down) */
        tableauStackedHidden: number;
        /** Vertical offset for stacked tableau cards (face up) */
        tableauStackedVisible: number;
        /** Horizontal offset for waste pile cards (draw-three) */
        wasteOffset: number;
        /** Gap between piles */
        pileGap: number;
        /** Padding around the table */
        tablePadding: number;
    };
    /** Animation durations (ms) */
    animation: {
        /** Card flip duration */
        flip: number;
        /** Card move duration */
        move: number;
        /** Victory cascade delay between cards */
        victoryDelay: number;
        /** Victory bounce duration */
        victoryBounce: number;
    };
    /** Typography */
    typography: {
        /** Font family for card ranks */
        cardFont: string;
        /** Font size for card ranks */
        cardFontSize: number;
        /** Font family for UI elements */
        uiFont: string;
        /** Font size for UI elements */
        uiFontSize: number;
    };
    /** Card back design */
    cardBack: {
        /** Type of card back design */
        type: 'solid' | 'pattern' | 'image';
        /** Pattern name (if type is 'pattern') */
        pattern?: 'crosshatch' | 'diamonds' | 'castle' | 'robot' | 'beach' | 'roses';
        /** Image URL (if type is 'image') */
        imageUrl?: string;
    };
    /** Asset configuration for image-based cards */
    assets?: {
        /** Whether to use image assets for cards */
        enabled: boolean;
        /** Base path to card assets */
        basePath: string;
        /** Card back image filename (without path) */
        cardBack: string;
        /** Empty stock (can draw) image filename */
        stockEmpty: string;
        /** Empty stock (cannot draw) image filename */
        stockDisabled: string;
        /** Empty foundation image filename */
        foundationEmpty: string;
    };
}
/**
 * Sound effect configuration
 */
interface SoundConfig {
    /** Whether sounds are enabled */
    enabled: boolean;
    /** Master volume (0-1) */
    volume: number;
    /** Individual sound URLs */
    sounds: {
        /** Card flip sound */
        flip?: string;
        /** Card place sound */
        place?: string;
        /** Card pickup sound */
        pickup?: string;
        /** Draw from stock sound */
        draw?: string;
        /** Invalid move sound */
        invalid?: string;
        /** Victory fanfare */
        victory?: string;
        /** Card cascade bounce */
        bounce?: string;
    };
}
/**
 * Game options passed to the Solitaire component
 */
interface SolitaireOptions {
    /** Draw mode */
    drawMode?: 'draw-one' | 'draw-three';
    /** Scoring mode */
    scoringMode?: 'standard' | 'vegas' | 'none';
    /** Allow unlimited passes through stock */
    unlimitedPasses?: boolean;
    /** Enable auto-complete when available */
    autoCompleteEnabled?: boolean;
    /** Enable double-click to foundation */
    doubleClickEnabled?: boolean;
    /** Enable undo functionality */
    undoEnabled?: boolean;
    /** Auto-flip exposed tableau cards (false = click to flip, like original Windows Solitaire) */
    autoFlipTableau?: boolean;
    /** Sound configuration */
    sound?: Partial<SoundConfig>;
}

/**
 * Card component props
 */
interface CardProps {
    /** The card data */
    card: Card$1;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** Whether the card is selected */
    isSelected?: boolean;
    /** Whether the card is being dragged */
    isDragging?: boolean;
    /** Whether this is a valid drop target */
    isValidDrop?: boolean;
    /** Z-index for stacking */
    zIndex?: number;
    /** Click handler */
    onClick?: (event: React$1.MouseEvent) => void;
    /** Double-click handler */
    onDoubleClick?: (event: React$1.MouseEvent) => void;
    /** Pointer down handler (for drag start) */
    onPointerDown?: (event: React$1.PointerEvent) => void;
    /** Additional class name */
    className?: string;
    /** Inline style overrides */
    style?: React$1.CSSProperties;
    /** Scale factor for the card */
    scale?: number;
}
/**
 * Card component
 */
declare const Card: React$1.ForwardRefExoticComponent<CardProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * Pile component props
 */
interface PileProps {
    /** The pile data */
    pile: Pile$1;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** Location of this pile */
    location: Omit<CardLocation, 'cardIndex'>;
    /** Currently selected card location */
    selectedCard?: CardLocation | null;
    /** Current drop target location */
    dropTarget?: CardLocation | null;
    /** Whether the pile is a valid drop target */
    isValidDropTarget?: boolean;
    /** Click handler for the pile (empty area) */
    onPileClick?: (location: CardLocation) => void;
    /** Click handler for a card */
    onCardClick?: (location: CardLocation) => void;
    /** Double-click handler for a card */
    onCardDoubleClick?: (location: CardLocation) => void;
    /** Pointer down handler for a card (drag start) */
    onCardPointerDown?: (event: React$1.PointerEvent, location: CardLocation, element: HTMLElement) => void;
    /** Register as drop target */
    registerDropTarget?: (location: CardLocation, element: HTMLElement) => void;
    /** Unregister as drop target */
    unregisterDropTarget?: (location: CardLocation) => void;
    /** Scale factor */
    scale?: number;
    /** Additional class name */
    className?: string;
    /** Card IDs to hide (for victory animation) */
    hiddenCardIds?: Set<string>;
    /** Whether drawing from stock is allowed (for empty stock indicator) */
    canDrawFromStock?: boolean;
}
/**
 * Pile component
 */
declare const Pile: React$1.ForwardRefExoticComponent<PileProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * Table component props
 */
interface TableProps {
    /** Current game state */
    gameState: GameState;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** Currently selected card location */
    selectedCard?: CardLocation | null;
    /** Current drop target location */
    dropTarget?: CardLocation | null;
    /** Check if a location is a valid drop target */
    isValidDropTarget?: (location: CardLocation) => boolean;
    /** Click handler for stock pile */
    onStockClick?: () => void;
    /** Click handler for a card */
    onCardClick?: (location: CardLocation) => void;
    /** Double-click handler for a card */
    onCardDoubleClick?: (location: CardLocation) => void;
    /** Pointer down handler for drag start */
    onCardPointerDown?: (event: React$1.PointerEvent, location: CardLocation, element: HTMLElement) => void;
    /** Register drop target */
    registerDropTarget?: (location: CardLocation, element: HTMLElement) => void;
    /** Unregister drop target */
    unregisterDropTarget?: (location: CardLocation) => void;
    /** Scale factor */
    scale?: number;
    /** Additional class name */
    className?: string;
    /** Card IDs to hide (for victory animation) */
    hiddenCardIds?: Set<string>;
    /** Whether more draws from stock are allowed */
    canDrawFromStock?: boolean;
}
/**
 * Table component - arranges all piles in the classic Solitaire layout
 */
declare const Table: React$1.ForwardRefExoticComponent<TableProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * Timer component props
 */
interface TimerProps {
    /** Game start timestamp */
    startTime: number | null;
    /** Game end timestamp */
    endTime: number | null;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** Additional class name */
    className?: string;
}
/**
 * Timer display component
 */
declare function Timer({ startTime, endTime, theme, className }: TimerProps): react_jsx_runtime.JSX.Element;

/**
 * Controls component props
 */
interface ControlsProps {
    /** Current score */
    score: number;
    /** Number of moves */
    moves: number;
    /** Scoring mode */
    scoringMode: ScoringMode;
    /** Whether undo is available */
    canUndo: boolean;
    /** Whether auto-complete is available */
    canAutoComplete: boolean;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** New game handler */
    onNewGame: () => void;
    /** Undo handler */
    onUndo: () => void;
    /** Auto-complete handler */
    onAutoComplete: () => void;
    /** Additional class name */
    className?: string;
}
/**
 * Game controls and stats display
 */
declare function Controls({ score, moves, scoringMode, canUndo, canAutoComplete, theme, onNewGame, onUndo, onAutoComplete, className, }: ControlsProps): react_jsx_runtime.JSX.Element;

/**
 * Solitaire component props
 */
interface SolitaireProps {
    /** Theme for styling */
    theme?: SolitaireTheme;
    /** Game options */
    options?: SolitaireOptions;
    /** Callback when game is won */
    onWin?: (stats: {
        time: number;
        moves: number;
        score: number;
    }) => void;
    /** Callback when a new game starts */
    onNewGame?: () => void;
    /** External control: start new game */
    newGameTrigger?: number;
    /** Scale factor (1 = original size) */
    scale?: number;
    /** Additional class name */
    className?: string;
    /** Show test win button (for debugging) */
    showTestButton?: boolean;
}
/**
 * Main Solitaire game component
 */
declare function Solitaire({ theme, options, onWin, onNewGame, newGameTrigger, scale, className, showTestButton, }: SolitaireProps): react_jsx_runtime.JSX.Element;

/**
 * VictoryAnimation component props
 */
interface VictoryAnimationProps {
    /** Game state (to get foundation cards) */
    gameState: GameState;
    /** Theme for styling */
    theme: SolitaireTheme;
    /** Container dimensions */
    containerWidth: number;
    containerHeight: number;
    /** Callback when animation completes */
    onComplete?: () => void;
    /** Scale factor */
    scale?: number;
    /** Play bounce sound (throttled internally) */
    onBounce?: () => void;
    /** Callback with IDs of cards that have been launched (to hide from foundations) */
    onCardsLaunched?: (cardIds: Set<string>) => void;
}
/**
 * VictoryAnimation component - optimised for smooth 60fps animation
 * Pre-renders all cards once, then uses pure DOM manipulation for physics
 */
declare const VictoryAnimation: React$1.NamedExoticComponent<VictoryAnimationProps>;

/**
 * Available card back designs
 */
declare const CARD_BACKS: readonly [{
    readonly id: "Back-Aquarium.gif";
    readonly name: "Aquarium";
}, {
    readonly id: "Back-CardHand.gif";
    readonly name: "Card Hand";
}, {
    readonly id: "Back-Castle.gif";
    readonly name: "Castle";
}, {
    readonly id: "Back-Fishes.gif";
    readonly name: "Fishes";
}, {
    readonly id: "Back-FlowerBlack.gif";
    readonly name: "Flower (Black)";
}, {
    readonly id: "Back-FlowerBlue.gif";
    readonly name: "Flower (Blue)";
}, {
    readonly id: "Back-PalmBeach.gif";
    readonly name: "Palm Beach";
}, {
    readonly id: "Back-Pattern1.gif";
    readonly name: "Pattern 1";
}, {
    readonly id: "Back-Pattern2.gif";
    readonly name: "Pattern 2";
}, {
    readonly id: "Back-Robot.gif";
    readonly name: "Robot";
}, {
    readonly id: "Back-Robot-1.gif";
    readonly name: "Robot 1";
}, {
    readonly id: "Back-Robot-2.gif";
    readonly name: "Robot 2";
}, {
    readonly id: "Back-Robot-3.gif";
    readonly name: "Robot 3";
}, {
    readonly id: "Back-Roses.gif";
    readonly name: "Roses";
}, {
    readonly id: "Back-Shell.gif";
    readonly name: "Shell";
}];
type CardBackId = typeof CARD_BACKS[number]['id'];
/**
 * CardBackSelector component props
 */
interface CardBackSelectorProps {
    /** Currently selected card back ID */
    selected: string;
    /** Callback when selection changes */
    onSelect: (cardBackId: string) => void;
    /** Base path to card assets */
    basePath?: string;
    /** Additional class name */
    className?: string;
}
/**
 * CardBackSelector component
 * Allows users to select from available card back designs
 */
declare function CardBackSelector({ selected, onSelect, basePath, className, }: CardBackSelectorProps): react_jsx_runtime.JSX.Element;

/**
 * Hook options
 */
interface UseGameOptions {
    /** Initial game configuration */
    config?: Partial<GameConfig>;
    /** Seed for reproducible games */
    seed?: number;
    /** Callback when game is won */
    onWin?: (state: GameState) => void;
    /** Callback on any move */
    onMove?: (result: MoveResult) => void;
}
/**
 * Hook return type
 */
interface UseGameReturn {
    /** Current game state */
    state: GameState;
    /** Start a new game */
    newGame: (config?: Partial<GameConfig>, seed?: number) => void;
    /** Draw from stock */
    draw: () => void;
    /** Reset waste to stock */
    resetWaste: () => void;
    /** Move cards between piles */
    move: (from: CardLocation, to: CardLocation, cardCount: number) => MoveResult;
    /** Auto-move card to foundation (double-click) */
    autoMove: (from: CardLocation) => MoveResult;
    /** Flip a face-down tableau card */
    flipCard: (tableauIndex: number) => void;
    /** Perform one auto-complete step */
    autoCompleteStep: () => boolean;
    /** Undo last move */
    undo: () => void;
    /** Whether undo is available */
    canUndo: boolean;
    /** Last move result */
    lastMoveResult: MoveResult | null;
    /** Elapsed time in seconds */
    elapsedTime: number;
    /** Trigger win state for testing */
    triggerWin: () => void;
}
/**
 * Hook for managing solitaire game state
 */
declare function useGame(options?: UseGameOptions): UseGameReturn;

/**
 * Drag state information
 */
interface DragState {
    /** Whether a drag is in progress */
    isDragging: boolean;
    /** Source location of the drag */
    source: CardLocation | null;
    /** Number of cards being dragged */
    cardCount: number;
    /** Current X position relative to viewport */
    currentX: number;
    /** Current Y position relative to viewport */
    currentY: number;
    /** Starting X position */
    startX: number;
    /** Starting Y position */
    startY: number;
    /** Offset from card top-left to pointer */
    offsetX: number;
    /** Offset from card top-left to pointer */
    offsetY: number;
}
/**
 * Drop target information
 */
interface DropTarget {
    /** Location of the drop target */
    location: CardLocation;
    /** Whether the drop is valid */
    isValid: boolean;
    /** Bounding rect of the target element */
    rect: DOMRect;
}
/**
 * Hook options
 */
interface UseDragOptions {
    /** Callback when drag starts */
    onDragStart?: (source: CardLocation, cardCount: number) => void;
    /** Callback during drag */
    onDragMove?: (x: number, y: number) => void;
    /** Callback when drag ends (with or without drop) */
    onDragEnd?: (source: CardLocation, target: CardLocation | null, cardCount: number) => void;
    /** Callback when dropped on a valid target */
    onDrop?: (source: CardLocation, target: CardLocation, cardCount: number) => void;
    /** Function to check if a drop target is valid */
    isValidDrop?: (source: CardLocation, target: CardLocation, cardCount: number) => boolean;
    /** Minimum distance before drag starts (prevents accidental drags) */
    dragThreshold?: number;
}
/**
 * Hook return type
 */
interface UseDragReturn {
    /** Current drag state */
    dragState: DragState;
    /** Start a drag operation */
    startDrag: (event: React.PointerEvent, source: CardLocation, cardCount: number, cardElement: HTMLElement) => void;
    /** Cancel the current drag */
    cancelDrag: () => void;
    /** Register a drop target */
    registerDropTarget: (location: CardLocation, element: HTMLElement) => void;
    /** Unregister a drop target */
    unregisterDropTarget: (location: CardLocation) => void;
    /** Current drop target (if hovering over one) */
    currentDropTarget: DropTarget | null;
}
/**
 * Hook for managing drag and drop with unified mouse/touch support
 */
declare function useDrag(options?: UseDragOptions): UseDragReturn;

/**
 * Timer state
 */
interface TimerState {
    /** Elapsed seconds */
    seconds: number;
    /** Whether the timer is running */
    isRunning: boolean;
    /** Formatted time string (MM:SS) */
    formatted: string;
}
/**
 * Hook options
 */
interface UseTimerOptions {
    /** Start time (timestamp) */
    startTime: number | null;
    /** End time (timestamp, if game is complete) */
    endTime: number | null;
    /** Update interval in ms */
    interval?: number;
}
/**
 * Hook for managing and displaying elapsed game time
 */
declare function useTimer(options: UseTimerOptions): TimerState;
/**
 * Simple stopwatch hook for standalone timing
 */
declare function useStopwatch(): {
    start: () => void;
    stop: () => void;
    reset: () => void;
    restart: () => void;
    /** Elapsed seconds */
    seconds: number;
    /** Whether the timer is running */
    isRunning: boolean;
    /** Formatted time string (MM:SS) */
    formatted: string;
};

/**
 * Sound effect types
 */
type SoundEffect = 'flip' | 'place' | 'pickup' | 'draw' | 'invalid' | 'victory' | 'bounce';
/**
 * Hook return type
 */
interface UseSoundsReturn {
    /** Play a sound effect */
    play: (effect: SoundEffect, options?: {
        playbackRate?: number;
    }) => void;
    /** Stop a sound effect */
    stop: (effect: SoundEffect) => void;
    /** Whether sounds are enabled */
    enabled: boolean;
    /** Set enabled state */
    setEnabled: (enabled: boolean) => void;
    /** Current volume */
    volume: number;
    /** Set volume */
    setVolume: (volume: number) => void;
}
/**
 * Default sound configuration
 */
declare const defaultSoundConfig: SoundConfig;
/**
 * Hook for managing game sound effects
 *
 * This is a simplified version that works without use-sound.
 * When use-sound is available, it will use that for better
 * audio handling.
 */
declare function useSounds(config?: Partial<SoundConfig>): UseSoundsReturn;

/**
 * Windows 3.1 Solitaire theme
 * Faithful recreation of the classic look and feel
 */
declare const win31Theme: SolitaireTheme;

export { CARD_BACKS, Card, type CardBackId, CardBackSelector, type CardBackSelectorProps, type CardProps, Controls, type ControlsProps, type DragState, type DropTarget, Pile, type PileProps, Solitaire, type SolitaireOptions, type SolitaireProps, type SolitaireTheme, type SoundConfig, type SoundEffect, Table, type TableProps, Timer, type TimerProps, type TimerState, type UseDragOptions, type UseDragReturn, type UseGameOptions, type UseGameReturn, type UseSoundsReturn, type UseTimerOptions, VictoryAnimation, type VictoryAnimationProps, defaultSoundConfig, win31Theme as defaultTheme, useDrag, useGame, useSounds, useStopwatch, useTimer, win31Theme };
