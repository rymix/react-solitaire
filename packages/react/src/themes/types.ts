/**
 * Theme definition for the Solitaire game
 */
export interface SolitaireTheme {
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
export interface SoundConfig {
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
export interface SolitaireOptions {
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
