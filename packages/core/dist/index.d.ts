/**
 * Card suits - using Unicode suit symbols for display
 */
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
/**
 * Card ranks - Ace through King
 */
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
/**
 * Card colours for alternating placement rules
 */
type Colour = 'red' | 'black';
/**
 * A single playing card
 */
interface Card {
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
type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';
/**
 * A pile of cards
 */
interface Pile {
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
type DrawMode = 'draw-one' | 'draw-three';
/**
 * Scoring mode
 */
type ScoringMode = 'standard' | 'vegas' | 'none';
/**
 * Game configuration options
 */
interface GameConfig {
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
interface GameState {
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
interface CardLocation {
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
interface Move {
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
interface HistoryEntry {
    /** The move that was made */
    move: Move;
    /** State before the move (for complex undo scenarios) */
    previousState: GameState;
}
/**
 * Game action types
 */
type GameAction = {
    type: 'NEW_GAME';
    config?: Partial<GameConfig>;
} | {
    type: 'DRAW_FROM_STOCK';
} | {
    type: 'RESET_STOCK';
} | {
    type: 'MOVE_CARDS';
    from: CardLocation;
    to: CardLocation;
    cardCount: number;
} | {
    type: 'AUTO_COMPLETE';
} | {
    type: 'UNDO';
} | {
    type: 'REDO';
};
/**
 * Result of attempting a move
 */
interface MoveResult {
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
declare const SUIT_INFO: Record<Suit, {
    symbol: string;
    colour: Colour;
    name: string;
}>;
/**
 * Rank display information
 */
declare const RANK_INFO: Record<Rank, {
    symbol: string;
    name: string;
}>;
/**
 * Get the colour of a card
 */
declare function getCardColour(card: Card): Colour;
/**
 * Get display string for a card (e.g., "A♠", "10♥")
 */
declare function getCardDisplay(card: Card): string;

/**
 * All suits in order
 */
declare const SUITS: Suit[];
/**
 * All ranks in order (Ace low)
 */
declare const RANKS: Rank[];
/**
 * Create a unique card ID from suit and rank
 */
declare function createCardId(suit: Suit, rank: Rank): string;
/**
 * Create a single card
 */
declare function createCard(suit: Suit, rank: Rank, faceUp?: boolean): Card;
/**
 * Create a standard 52-card deck (all face down)
 */
declare function createDeck(): Card[];
/**
 * Fisher-Yates shuffle algorithm
 * Creates a new shuffled array without mutating the original
 */
declare function shuffle<T>(array: T[]): T[];
/**
 * Shuffle with a seeded random number generator for reproducible games
 * Uses a simple LCG (Linear Congruential Generator)
 */
declare function shuffleWithSeed<T>(array: T[], seed: number): T[];
/**
 * Create a shuffled deck
 */
declare function createShuffledDeck(seed?: number): Card[];
/**
 * Flip a card face up or face down
 */
declare function flipCard(card: Card, faceUp: boolean): Card;
/**
 * Check if two cards are the same
 */
declare function isSameCard(a: Card, b: Card): boolean;
/**
 * Find a card in a deck by its ID
 */
declare function findCard(cards: Card[], id: string): Card | undefined;

/**
 * Check if a card can be placed on a foundation pile
 * Rules:
 * - Empty foundation: only Ace
 * - Non-empty: must be same suit and one rank higher
 */
declare function canPlaceOnFoundation(card: Card, foundation: Pile): boolean;
/**
 * Check if a card (or stack of cards) can be placed on a tableau pile
 * Rules:
 * - Empty tableau: only King
 * - Non-empty: must be opposite colour and one rank lower
 */
declare function canPlaceOnTableau(card: Card, tableau: Pile): boolean;
/**
 * Get the pile from the game state at a given location
 */
declare function getPile(state: GameState, location: CardLocation): Pile | null;
/**
 * Get the card at a specific location
 */
declare function getCardAt(state: GameState, location: CardLocation): Card | null;
/**
 * Check if cards from a given index can be moved (they must all be face up)
 */
declare function canPickUpCards(pile: Pile, fromIndex: number): boolean;
/**
 * Validate a move between two locations
 */
declare function isValidMove(state: GameState, from: CardLocation, to: CardLocation, cardCount: number): boolean;
/**
 * Find all valid moves for a card (or stack starting at that card)
 */
declare function findValidMoves(state: GameState, from: CardLocation): CardLocation[];
/**
 * Check if the game is won (all cards on foundations)
 */
declare function checkWinCondition(state: GameState): boolean;
/**
 * Check if there are any valid moves remaining
 */
declare function hasValidMoves(state: GameState): boolean;
/**
 * Check if auto-complete is possible
 * Auto-complete is available when all cards are face up
 */
declare function canAutoComplete(state: GameState): boolean;
/**
 * Find the best foundation move for auto-complete
 * Returns null if no move is available
 */
declare function findAutoCompleteMove(state: GameState): {
    from: CardLocation;
    to: CardLocation;
} | null;

/**
 * Standard scoring values (Windows 3.1 style)
 */
declare const STANDARD_SCORES: {
    /** Waste to tableau */
    wasteToTableau: number;
    /** Waste to foundation */
    wasteToFoundation: number;
    /** Tableau to foundation */
    tableauToFoundation: number;
    /** Turn over tableau card */
    turnOverTableauCard: number;
    /** Foundation back to tableau (penalty) */
    foundationToTableau: number;
    /** Recycle waste to stock (draw-three only, per pass) */
    recycleWaste: number;
};
/**
 * Vegas scoring values
 */
declare const VEGAS_SCORES: {
    /** Initial cost to play */
    initialCost: number;
    /** Each card to foundation */
    cardToFoundation: number;
    /** Foundation back to tableau */
    foundationToTableau: number;
};
/**
 * Calculate score for a move in standard mode
 */
declare function calculateStandardScore(move: Move, _state: GameState): number;
/**
 * Calculate score for a move in Vegas mode
 */
declare function calculateVegasScore(move: Move, _state: GameState): number;
/**
 * Calculate score for a move based on the scoring mode
 */
declare function calculateMoveScore(move: Move, state: GameState): number;
/**
 * Calculate the initial score for a new game
 */
declare function getInitialScore(scoringMode: ScoringMode): number;
/**
 * Calculate penalty for recycling the waste pile
 */
declare function getRecycleWastePenalty(state: GameState): number;
/**
 * Calculate time-based bonus for standard mode
 * Windows 3.1 gave 700,000 / seconds bonus, capped at 700,000
 */
declare function calculateTimeBonus(elapsedSeconds: number): number;
/**
 * Format score for display
 */
declare function formatScore(score: number, scoringMode: ScoringMode): string;

/**
 * Default game configuration
 */
declare const DEFAULT_CONFIG: GameConfig;
/**
 * Create the initial game state with a shuffled deck
 */
declare function createInitialState(config?: Partial<GameConfig>, seed?: number): GameState;
/**
 * Deep clone the game state
 */
declare function cloneState(state: GameState): GameState;
/**
 * Draw cards from stock to waste
 */
declare function drawFromStock(state: GameState): GameState;
/**
 * Reset waste back to stock
 */
declare function resetStock(state: GameState): GameState;
/**
 * Execute a move between piles
 */
declare function executeMove(state: GameState, from: CardLocation, to: CardLocation, cardCount: number): MoveResult;
/**
 * Manually flip a face-down tableau card (when autoFlipTableau is false)
 * Only works on the top card of a tableau pile
 */
declare function flipTableauCard(state: GameState, tableauIndex: number): MoveResult;
/**
 * Attempt to auto-move a card to a foundation
 * Used for double-click behaviour
 */
/**
 * Check if a card can be auto-moved (to foundation or King to empty tableau)
 * Returns the destination if valid, null otherwise
 */
declare function canAutoMove(state: GameState, from: CardLocation): CardLocation | null;
declare function autoMoveToFoundation(state: GameState, from: CardLocation): MoveResult;
/**
 * Perform one step of auto-complete
 * Returns null if no more moves possible
 */
declare function autoCompleteStep(state: GameState): GameState | null;
/**
 * Get all cards currently in the game in a flat array
 * Useful for debugging and validation
 */
declare function getAllCards(state: GameState): Card[];
/**
 * Validate that the game state is consistent
 * (52 cards, no duplicates, etc.)
 */
declare function validateState(state: GameState): {
    valid: boolean;
    errors: string[];
};
/**
 * Game history manager for undo/redo
 */
declare class GameHistory {
    private history;
    private currentIndex;
    private readonly maxHistory;
    /**
     * Record a state change
     */
    push(entry: HistoryEntry): void;
    /**
     * Check if undo is available
     */
    canUndo(): boolean;
    /**
     * Check if redo is available
     */
    canRedo(): boolean;
    /**
     * Get the state for undo
     */
    undo(): GameState | null;
    /**
     * Get the move for redo (we need to re-execute it)
     */
    redo(): HistoryEntry | null;
    /**
     * Clear all history
     */
    clear(): void;
    /**
     * Get current history size
     */
    size(): number;
}
/**
 * Create a won game state for testing victory animation
 */
declare function createWonState(config?: Partial<GameConfig>): GameState;

export { type Card, type CardLocation, type Colour, DEFAULT_CONFIG, type DrawMode, type GameAction, type GameConfig, GameHistory, type GameState, type HistoryEntry, type Move, type MoveResult, type Pile, type PileType, RANKS, RANK_INFO, type Rank, STANDARD_SCORES, SUITS, SUIT_INFO, type ScoringMode, type Suit, VEGAS_SCORES, autoCompleteStep, autoMoveToFoundation, calculateMoveScore, calculateStandardScore, calculateTimeBonus, calculateVegasScore, canAutoComplete, canAutoMove, canPickUpCards, canPlaceOnFoundation, canPlaceOnTableau, checkWinCondition, cloneState, createCard, createCardId, createDeck, createInitialState, createShuffledDeck, createWonState, drawFromStock, executeMove, findAutoCompleteMove, findCard, findValidMoves, flipCard, flipTableauCard, formatScore, getAllCards, getCardAt, getCardColour, getCardDisplay, getInitialScore, getPile, getRecycleWastePenalty, hasValidMoves, isSameCard, isValidMove, resetStock, shuffle, shuffleWithSeed, validateState };
