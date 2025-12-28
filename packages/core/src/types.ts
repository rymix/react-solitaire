/**
 * Card suits - using Unicode suit symbols for display
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Card ranks - Ace through King
 */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Card colours for alternating placement rules
 */
export type Colour = 'red' | 'black';

/**
 * A single playing card
 */
export interface Card {
  /** Unique identifier for the card */
  id: string;
  /** The suit of the card */
  suit: Suit;
  /** The rank (1 = Ace, 11 = Jack, 12 = Queen, 13 = King) */
  rank: Rank;
  /** Whether the card is face up */
  faceUp: boolean;
}

/**
 * Types of piles in the game
 */
export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';

/**
 * A pile of cards
 */
export interface Pile {
  /** Unique identifier for the pile */
  id: string;
  /** Type of pile */
  type: PileType;
  /** Cards in the pile (bottom to top) */
  cards: Card[];
  /** For tableau piles, the column index (0-6) */
  tableauIndex?: number;
  /** For foundation piles, the suit (once established) */
  foundationSuit?: Suit;
}

/**
 * Draw mode for the stock pile
 */
export type DrawMode = 'draw-one' | 'draw-three';

/**
 * Scoring mode
 */
export type ScoringMode = 'standard' | 'vegas' | 'none';

/**
 * Game configuration options
 */
export interface GameConfig {
  /** How many cards to draw from stock */
  drawMode: DrawMode;
  /** Scoring system to use */
  scoringMode: ScoringMode;
  /** Whether to allow unlimited passes through the deck (Vegas typically limits to 3) */
  unlimitedPasses: boolean;
  /** Whether to automatically flip exposed tableau cards (false = click to flip) */
  autoFlipTableau: boolean;
}

/**
 * The complete game state
 */
export interface GameState {
  /** The stock pile (draw pile) */
  stock: Pile;
  /** The waste pile (drawn cards) */
  waste: Pile;
  /** The four foundation piles */
  foundations: [Pile, Pile, Pile, Pile];
  /** The seven tableau piles */
  tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile];
  /** Current score */
  score: number;
  /** Number of moves made */
  moves: number;
  /** Game start timestamp */
  startTime: number | null;
  /** Game end timestamp (if won) */
  endTime: number | null;
  /** Whether the game is won */
  isWon: boolean;
  /** Number of passes through the stock */
  stockPasses: number;
  /** Game configuration */
  config: GameConfig;
}

/**
 * Location of a card in the game
 */
export interface CardLocation {
  /** Type of pile */
  pileType: PileType;
  /** Index of the pile (for foundations 0-3, for tableau 0-6) */
  pileIndex: number;
  /** Index of the card within the pile */
  cardIndex: number;
}

/**
 * A move in the game
 */
export interface Move {
  /** Source location */
  from: CardLocation;
  /** Destination location */
  to: CardLocation;
  /** Number of cards being moved */
  cardCount: number;
  /** Whether a card was flipped as result of this move */
  flippedCard: boolean;
  /** Score change from this move */
  scoreChange: number;
}

/**
 * History entry for undo functionality
 */
export interface HistoryEntry {
  /** The move that was made */
  move: Move;
  /** State before the move (for complex undo scenarios) */
  previousState: GameState;
}

/**
 * Game action types
 */
export type GameAction =
  | { type: 'NEW_GAME'; config?: Partial<GameConfig> }
  | { type: 'DRAW_FROM_STOCK' }
  | { type: 'RESET_STOCK' }
  | { type: 'MOVE_CARDS'; from: CardLocation; to: CardLocation; cardCount: number }
  | { type: 'AUTO_COMPLETE' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

/**
 * Result of attempting a move
 */
export interface MoveResult {
  /** Whether the move was valid and executed */
  success: boolean;
  /** The new game state (if successful) */
  state?: GameState;
  /** Error message (if unsuccessful) */
  error?: string;
  /** The move that was made (if successful) */
  move?: Move;
}

/**
 * Suit display information
 */
export const SUIT_INFO: Record<Suit, { symbol: string; colour: Colour; name: string }> = {
  hearts: { symbol: '♥', colour: 'red', name: 'Hearts' },
  diamonds: { symbol: '♦', colour: 'red', name: 'Diamonds' },
  clubs: { symbol: '♣', colour: 'black', name: 'Clubs' },
  spades: { symbol: '♠', colour: 'black', name: 'Spades' },
};

/**
 * Rank display information
 */
export const RANK_INFO: Record<Rank, { symbol: string; name: string }> = {
  1: { symbol: 'A', name: 'Ace' },
  2: { symbol: '2', name: 'Two' },
  3: { symbol: '3', name: 'Three' },
  4: { symbol: '4', name: 'Four' },
  5: { symbol: '5', name: 'Five' },
  6: { symbol: '6', name: 'Six' },
  7: { symbol: '7', name: 'Seven' },
  8: { symbol: '8', name: 'Eight' },
  9: { symbol: '9', name: 'Nine' },
  10: { symbol: '10', name: 'Ten' },
  11: { symbol: 'J', name: 'Jack' },
  12: { symbol: 'Q', name: 'Queen' },
  13: { symbol: 'K', name: 'King' },
};

/**
 * Get the colour of a card
 */
export function getCardColour(card: Card): Colour {
  return SUIT_INFO[card.suit].colour;
}

/**
 * Get display string for a card (e.g., "A♠", "10♥")
 */
export function getCardDisplay(card: Card): string {
  return `${RANK_INFO[card.rank].symbol}${SUIT_INFO[card.suit].symbol}`;
}
