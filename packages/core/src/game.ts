import type {
  Card,
  Pile,
  Rank,
  GameState,
  GameConfig,
  CardLocation,
  Move,
  MoveResult,
  HistoryEntry,
} from './types';
import { createShuffledDeck, flipCard } from './deck';
import {
  isValidMove,
  getPile,
  checkWinCondition,
  findAutoCompleteMove,
} from './rules';
import { calculateMoveScore, getInitialScore, getRecycleWastePenalty } from './scoring';

/**
 * Default game configuration
 */
export const DEFAULT_CONFIG: GameConfig = {
  drawMode: 'draw-one',
  scoringMode: 'standard',
  unlimitedPasses: true,
  autoFlipTableau: false, // Match original Windows Solitaire - click to flip
};

/**
 * Create an empty pile of a given type
 */
function createPile(type: Pile['type'], index: number): Pile {
  const id = type === 'tableau' || type === 'foundation' 
    ? `${type}-${index}` 
    : type;
  
  return {
    id,
    type,
    cards: [],
    ...(type === 'tableau' && { tableauIndex: index }),
  };
}

/**
 * Create the initial game state with a shuffled deck
 */
export function createInitialState(
  config: Partial<GameConfig> = {},
  seed?: number
): GameState {
  const fullConfig: GameConfig = { ...DEFAULT_CONFIG, ...config };
  const deck = createShuffledDeck(seed);

  // Create empty piles
  const stock = createPile('stock', 0);
  const waste = createPile('waste', 0);
  const foundations: [Pile, Pile, Pile, Pile] = [
    createPile('foundation', 0),
    createPile('foundation', 1),
    createPile('foundation', 2),
    createPile('foundation', 3),
  ];
  const tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile] = [
    createPile('tableau', 0),
    createPile('tableau', 1),
    createPile('tableau', 2),
    createPile('tableau', 3),
    createPile('tableau', 4),
    createPile('tableau', 5),
    createPile('tableau', 6),
  ];

  // Deal cards to tableau
  let cardIndex = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = col; row < 7; row++) {
      const card = deck[cardIndex++];
      // Only the top card (first card dealt to each pile) is face up
      const isFaceUp = row === col;
      tableau[row].cards.push(flipCard(card, isFaceUp));
    }
  }

  // Remaining cards go to stock (face down)
  while (cardIndex < deck.length) {
    stock.cards.push(deck[cardIndex++]);
  }

  return {
    stock,
    waste,
    foundations,
    tableau,
    score: getInitialScore(fullConfig.scoringMode),
    moves: 0,
    startTime: null,
    endTime: null,
    isWon: false,
    stockPasses: 0,
    config: fullConfig,
  };
}

/**
 * Deep clone the game state
 */
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    stock: { ...state.stock, cards: [...state.stock.cards.map(c => ({ ...c }))] },
    waste: { ...state.waste, cards: [...state.waste.cards.map(c => ({ ...c }))] },
    foundations: state.foundations.map(f => ({
      ...f,
      cards: [...f.cards.map(c => ({ ...c }))],
    })) as [Pile, Pile, Pile, Pile],
    tableau: state.tableau.map(t => ({
      ...t,
      cards: [...t.cards.map(c => ({ ...c }))],
    })) as [Pile, Pile, Pile, Pile, Pile, Pile, Pile],
    config: { ...state.config },
  };
}

/**
 * Draw cards from stock to waste
 */
export function drawFromStock(state: GameState): GameState {
  if (state.stock.cards.length === 0) {
    return state;
  }

  const newState = cloneState(state);
  const drawCount = state.config.drawMode === 'draw-three' ? 3 : 1;
  const cardsToMove = Math.min(drawCount, newState.stock.cards.length);

  // Move cards from stock to waste
  for (let i = 0; i < cardsToMove; i++) {
    const card = newState.stock.cards.pop()!;
    newState.waste.cards.push(flipCard(card, true));
  }

  // Start timer on first move
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }

  newState.moves++;

  return newState;
}

/**
 * Reset waste back to stock
 */
export function resetStock(state: GameState): GameState {
  if (state.waste.cards.length === 0) {
    return state;
  }

  // Check if we can reset in Vegas mode
  if (state.config.scoringMode === 'vegas' && !state.config.unlimitedPasses) {
    if (state.stockPasses >= 3) {
      return state; // Can't reset anymore
    }
  }

  const newState = cloneState(state);

  // Move all waste cards back to stock (reversed, face down)
  while (newState.waste.cards.length > 0) {
    const card = newState.waste.cards.pop()!;
    newState.stock.cards.push(flipCard(card, false));
  }

  newState.stockPasses++;
  newState.moves++;

  // Apply recycling penalty in standard draw-three mode
  const penalty = getRecycleWastePenalty(newState);
  newState.score = Math.max(0, newState.score + penalty);

  return newState;
}

/**
 * Execute a move between piles
 */
export function executeMove(
  state: GameState,
  from: CardLocation,
  to: CardLocation,
  cardCount: number
): MoveResult {
  // Validate the move
  if (!isValidMove(state, from, to, cardCount)) {
    return { success: false, error: 'Invalid move' };
  }

  const newState = cloneState(state);
  const sourcePile = getPile(newState, from)!;
  const destPile = getPile(newState, to)!;

  // Remove cards from source
  const movedCards = sourcePile.cards.splice(from.cardIndex, cardCount);

  // Add cards to destination
  destPile.cards.push(...movedCards);

  // Check if we need to flip the new top card of source tableau
  let flippedCard = false;
  if (sourcePile.type === 'tableau' && sourcePile.cards.length > 0 && newState.config.autoFlipTableau) {
    const topCard = sourcePile.cards.at(-1)!;
    if (!topCard.faceUp) {
      sourcePile.cards[sourcePile.cards.length - 1] = flipCard(topCard, true);
      flippedCard = true;
    }
  }

  // Start timer on first move
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }

  // Create move record
  const move: Move = {
    from,
    to,
    cardCount,
    flippedCard,
    scoreChange: 0,
  };

  // Calculate and apply score
  move.scoreChange = calculateMoveScore(move, newState);
  newState.score += move.scoreChange;
  newState.moves++;

  // Check win condition
  if (checkWinCondition(newState)) {
    newState.isWon = true;
    newState.endTime = Date.now();
  }

  return { success: true, state: newState, move };
}

/**
 * Manually flip a face-down tableau card (when autoFlipTableau is false)
 * Only works on the top card of a tableau pile
 */
export function flipTableauCard(
  state: GameState,
  tableauIndex: number
): MoveResult {
  if (tableauIndex < 0 || tableauIndex >= 7) {
    return { success: false, error: 'Invalid tableau index' };
  }

  const tableau = state.tableau[tableauIndex];
  if (tableau.cards.length === 0) {
    return { success: false, error: 'Tableau is empty' };
  }

  const topCard = tableau.cards.at(-1)!;
  if (topCard.faceUp) {
    return { success: false, error: 'Card is already face up' };
  }

  const newState = cloneState(state);
  const newTableau = newState.tableau[tableauIndex];
  newTableau.cards[newTableau.cards.length - 1] = flipCard(topCard, true);

  // Start timer on first action
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }

  return { success: true, state: newState };
}

/**
 * Attempt to auto-move a card to a foundation
 * Used for double-click behaviour
 */
/**
 * Check if a card can be auto-moved (to foundation or King to empty tableau)
 * Returns the destination if valid, null otherwise
 */
export function canAutoMove(
  state: GameState,
  from: CardLocation
): CardLocation | null {
  const sourcePile = getPile(state, from);
  if (!sourcePile) return null;

  const card = sourcePile.cards[from.cardIndex];
  if (!card || !card.faceUp) return null;

  // For top card, check foundations first
  if (from.cardIndex === sourcePile.cards.length - 1) {
    // Try foundations
    for (let i = 0; i < 4; i++) {
      const to: CardLocation = {
        pileType: 'foundation',
        pileIndex: i,
        cardIndex: state.foundations[i].cards.length,
      };
      if (isValidMove(state, from, to, 1)) {
        return to;
      }
    }

    // If it's a King, try empty tableaux
    if (card.rank === 13) {
      for (let i = 0; i < 7; i++) {
        if (state.tableau[i].cards.length === 0) {
          return {
            pileType: 'tableau',
            pileIndex: i,
            cardIndex: 0,
          };
        }
      }
    }
  } else {
    // Non-top card - only Kings can be moved (to empty tableaux)
    if (card.rank === 13) {
      // Check if entire stack from this card is face up
      for (let i = from.cardIndex; i < sourcePile.cards.length; i++) {
        if (!sourcePile.cards[i].faceUp) return null;
      }

      for (let i = 0; i < 7; i++) {
        if (state.tableau[i].cards.length === 0) {
          return {
            pileType: 'tableau',
            pileIndex: i,
            cardIndex: 0,
          };
        }
      }
    }
  }

  return null;
}

export function autoMoveToFoundation(
  state: GameState,
  from: CardLocation
): MoveResult {
  const sourcePile = getPile(state, from);
  if (!sourcePile) {
    return { success: false, error: 'Invalid source pile' };
  }

  // Can only auto-move single cards (top card of stack or single selected)
  if (from.cardIndex !== sourcePile.cards.length - 1) {
    // If it's a King and there's an empty tableau, allow that
    const card = sourcePile.cards[from.cardIndex];
    if (card && card.faceUp && card.rank === 13) {
      // Check if the entire stack from this King can be moved
      let canMoveStack = true;
      for (let i = from.cardIndex; i < sourcePile.cards.length; i++) {
        if (!sourcePile.cards[i].faceUp) {
          canMoveStack = false;
          break;
        }
      }
      
      if (canMoveStack) {
        // Try to find an empty tableau
        for (let i = 0; i < 7; i++) {
          if (state.tableau[i].cards.length === 0) {
            const to: CardLocation = {
              pileType: 'tableau',
              pileIndex: i,
              cardIndex: 0,
            };
            const cardCount = sourcePile.cards.length - from.cardIndex;
            return executeMove(state, from, to, cardCount);
          }
        }
      }
    }
    return { success: false, error: 'Can only auto-move top card or Kings to empty columns' };
  }

  const card = sourcePile.cards[from.cardIndex];
  if (!card || !card.faceUp) {
    return { success: false, error: 'Card not available' };
  }

  // First, try to find a valid foundation
  for (let i = 0; i < 4; i++) {
    const to: CardLocation = {
      pileType: 'foundation',
      pileIndex: i,
      cardIndex: state.foundations[i].cards.length,
    };

    if (isValidMove(state, from, to, 1)) {
      return executeMove(state, from, to, 1);
    }
  }

  // If it's a King, try to find an empty tableau
  if (card.rank === 13) {
    for (let i = 0; i < 7; i++) {
      if (state.tableau[i].cards.length === 0) {
        const to: CardLocation = {
          pileType: 'tableau',
          pileIndex: i,
          cardIndex: 0,
        };
        return executeMove(state, from, to, 1);
      }
    }
  }

  return { success: false, error: 'No valid move for this card' };
}

/**
 * Perform one step of auto-complete
 * Returns null if no more moves possible
 */
export function autoCompleteStep(state: GameState): GameState | null {
  const move = findAutoCompleteMove(state);
  if (!move) {
    return null;
  }

  const result = executeMove(state, move.from, move.to, 1);
  return result.success ? result.state! : null;
}

/**
 * Get all cards currently in the game in a flat array
 * Useful for debugging and validation
 */
export function getAllCards(state: GameState): Card[] {
  return [
    ...state.stock.cards,
    ...state.waste.cards,
    ...state.foundations.flatMap(f => f.cards),
    ...state.tableau.flatMap(t => t.cards),
  ];
}

/**
 * Validate that the game state is consistent
 * (52 cards, no duplicates, etc.)
 */
export function validateState(state: GameState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allCards = getAllCards(state);

  // Check total card count
  if (allCards.length !== 52) {
    errors.push(`Expected 52 cards, found ${allCards.length}`);
  }

  // Check for duplicates
  const cardIds = new Set<string>();
  for (const card of allCards) {
    if (cardIds.has(card.id)) {
      errors.push(`Duplicate card: ${card.id}`);
    }
    cardIds.add(card.id);
  }

  // Check foundation consistency
  for (let i = 0; i < 4; i++) {
    const foundation = state.foundations[i];
    for (let j = 0; j < foundation.cards.length; j++) {
      const card = foundation.cards[j];
      if (j === 0 && card.rank !== 1) {
        errors.push(`Foundation ${i} first card should be Ace, found rank ${card.rank}`);
      }
      if (j > 0) {
        const prevCard = foundation.cards[j - 1];
        if (card.suit !== prevCard.suit) {
          errors.push(`Foundation ${i} has mixed suits`);
        }
        if (card.rank !== prevCard.rank + 1) {
          errors.push(`Foundation ${i} cards not in sequence`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Game history manager for undo/redo
 */
export class GameHistory {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private readonly maxHistory: number = 100;

  /**
   * Record a state change
   */
  push(entry: HistoryEntry): void {
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new entry
    this.history.push(entry);
    this.currentIndex++;

    // Trim old history if needed
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get the state for undo
   */
  undo(): GameState | null {
    if (!this.canUndo()) {
      return null;
    }

    const entry = this.history[this.currentIndex];
    this.currentIndex--;
    return entry.previousState;
  }

  /**
   * Get the move for redo (we need to re-execute it)
   */
  redo(): HistoryEntry | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current history size
   */
  size(): number {
    return this.history.length;
  }
}

/**
 * Create a won game state for testing victory animation
 */
export function createWonState(config?: Partial<GameConfig>): GameState {
  const fullConfig: GameConfig = { ...DEFAULT_CONFIG, ...config };
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
  
  // Create foundations with all cards in order
  const foundations = suits.map((suit, index) => ({
    id: `foundation-${index}`,
    type: 'foundation' as const,
    cards: Array.from({ length: 13 }, (_, rank) => ({
      id: `${suit}-${rank + 1}`,
      suit,
      rank: (rank + 1) as Rank,
      faceUp: true,
    })),
  })) as [Pile, Pile, Pile, Pile];

  const startTime = Date.now() - (180 * 1000); // 3 minutes ago
  const endTime = Date.now();

  const tableau: [Pile, Pile, Pile, Pile, Pile, Pile, Pile] = [
    { id: 'tableau-0', type: 'tableau', cards: [] },
    { id: 'tableau-1', type: 'tableau', cards: [] },
    { id: 'tableau-2', type: 'tableau', cards: [] },
    { id: 'tableau-3', type: 'tableau', cards: [] },
    { id: 'tableau-4', type: 'tableau', cards: [] },
    { id: 'tableau-5', type: 'tableau', cards: [] },
    { id: 'tableau-6', type: 'tableau', cards: [] },
  ];

  return {
    config: fullConfig,
    stock: { id: 'stock', type: 'stock', cards: [] },
    waste: { id: 'waste', type: 'waste', cards: [] },
    foundations,
    tableau,
    score: fullConfig.scoringMode === 'vegas' ? 260 : 3000,
    moves: 150,
    startTime,
    endTime,
    isWon: true,
    stockPasses: 0,
  };
}
