// Types
export type {
  Suit,
  Rank,
  Colour,
  Card,
  PileType,
  Pile,
  DrawMode,
  ScoringMode,
  GameConfig,
  GameState,
  CardLocation,
  Move,
  HistoryEntry,
  GameAction,
  MoveResult,
} from './types';

export {
  SUIT_INFO,
  RANK_INFO,
  getCardColour,
  getCardDisplay,
} from './types';

// Deck utilities
export {
  SUITS,
  RANKS,
  createCardId,
  createCard,
  createDeck,
  shuffle,
  shuffleWithSeed,
  createShuffledDeck,
  flipCard,
  isSameCard,
  findCard,
} from './deck';

// Game rules
export {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  getPile,
  getCardAt,
  canPickUpCards,
  isValidMove,
  findValidMoves,
  checkWinCondition,
  hasValidMoves,
  canAutoComplete,
  findAutoCompleteMove,
} from './rules';

// Scoring
export {
  STANDARD_SCORES,
  VEGAS_SCORES,
  calculateStandardScore,
  calculateVegasScore,
  calculateMoveScore,
  getInitialScore,
  getRecycleWastePenalty,
  calculateTimeBonus,
  formatScore,
} from './scoring';

// Game state management
export {
  DEFAULT_CONFIG,
  createInitialState,
  createWonState,
  cloneState,
  drawFromStock,
  resetStock,
  executeMove,
  flipTableauCard,
  canAutoMove,
  autoMoveToFoundation,
  autoCompleteStep,
  getAllCards,
  validateState,
  GameHistory,
} from './game';
