import type { ScoringMode, Move, GameState } from './types';

/**
 * Standard scoring values (Windows 3.1 style)
 */
export const STANDARD_SCORES = {
  /** Waste to tableau */
  wasteToTableau: 5,
  /** Waste to foundation */
  wasteToFoundation: 10,
  /** Tableau to foundation */
  tableauToFoundation: 10,
  /** Turn over tableau card */
  turnOverTableauCard: 5,
  /** Foundation back to tableau (penalty) */
  foundationToTableau: -15,
  /** Recycle waste to stock (draw-three only, per pass) */
  recycleWaste: -20,
};

/**
 * Vegas scoring values
 */
export const VEGAS_SCORES = {
  /** Initial cost to play */
  initialCost: -52,
  /** Each card to foundation */
  cardToFoundation: 5,
  /** Foundation back to tableau */
  foundationToTableau: -5,
};

/**
 * Calculate score for a move in standard mode
 */
export function calculateStandardScore(
  move: Move,
  _state: GameState
): number {
  let score = 0;

  const { from, to, flippedCard } = move;

  // Waste to tableau
  if (from.pileType === 'waste' && to.pileType === 'tableau') {
    score += STANDARD_SCORES.wasteToTableau;
  }

  // Waste to foundation
  if (from.pileType === 'waste' && to.pileType === 'foundation') {
    score += STANDARD_SCORES.wasteToFoundation;
  }

  // Tableau to foundation
  if (from.pileType === 'tableau' && to.pileType === 'foundation') {
    score += STANDARD_SCORES.tableauToFoundation;
  }

  // Foundation to tableau (penalty)
  if (from.pileType === 'foundation' && to.pileType === 'tableau') {
    score += STANDARD_SCORES.foundationToTableau;
  }

  // Bonus for turning over a tableau card
  if (flippedCard) {
    score += STANDARD_SCORES.turnOverTableauCard;
  }

  return score;
}

/**
 * Calculate score for a move in Vegas mode
 */
export function calculateVegasScore(
  move: Move,
  _state: GameState
): number {
  let score = 0;

  const { from, to } = move;

  // Any card to foundation
  if (to.pileType === 'foundation') {
    score += VEGAS_SCORES.cardToFoundation;
  }

  // Foundation to tableau (penalty)
  if (from.pileType === 'foundation' && to.pileType === 'tableau') {
    score += VEGAS_SCORES.foundationToTableau;
  }

  return score;
}

/**
 * Calculate score for a move based on the scoring mode
 */
export function calculateMoveScore(
  move: Move,
  state: GameState
): number {
  switch (state.config.scoringMode) {
    case 'standard':
      return calculateStandardScore(move, state);
    case 'vegas':
      return calculateVegasScore(move, state);
    case 'none':
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate the initial score for a new game
 */
export function getInitialScore(scoringMode: ScoringMode): number {
  switch (scoringMode) {
    case 'vegas':
      return VEGAS_SCORES.initialCost;
    case 'standard':
    case 'none':
    default:
      return 0;
  }
}

/**
 * Calculate penalty for recycling the waste pile
 */
export function getRecycleWastePenalty(state: GameState): number {
  if (state.config.scoringMode !== 'standard') {
    return 0;
  }

  // Only penalise in draw-three mode
  if (state.config.drawMode !== 'draw-three') {
    return 0;
  }

  return STANDARD_SCORES.recycleWaste;
}

/**
 * Calculate time-based bonus for standard mode
 * Windows 3.1 gave 700,000 / seconds bonus, capped at 700,000
 */
export function calculateTimeBonus(elapsedSeconds: number): number {
  if (elapsedSeconds <= 30) {
    return 0; // No bonus for very fast games (probably auto-complete)
  }

  const bonus = Math.floor(700000 / elapsedSeconds);
  return Math.max(0, Math.min(bonus, 700000));
}

/**
 * Format score for display
 */
export function formatScore(score: number, scoringMode: ScoringMode): string {
  switch (scoringMode) {
    case 'vegas':
      // Vegas shows as currency
      if (score >= 0) {
        return `$${score}`;
      }
      return `-$${Math.abs(score)}`;
    case 'standard':
    case 'none':
    default:
      return score.toString();
  }
}
