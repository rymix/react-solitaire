import type { Card, Pile, GameState, CardLocation } from './types';
import { getCardColour } from './types';

/**
 * Check if a card can be placed on a foundation pile
 * Rules:
 * - Empty foundation: only Ace
 * - Non-empty: must be same suit and one rank higher
 */
export function canPlaceOnFoundation(card: Card, foundation: Pile): boolean {
  const topCard = foundation.cards.at(-1);

  if (!topCard) {
    // Empty foundation - only Ace can be placed
    return card.rank === 1;
  }

  // Must be same suit and one rank higher
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
}

/**
 * Check if a card (or stack of cards) can be placed on a tableau pile
 * Rules:
 * - Empty tableau: only King
 * - Non-empty: must be opposite colour and one rank lower
 */
export function canPlaceOnTableau(card: Card, tableau: Pile): boolean {
  const topCard = tableau.cards.at(-1);

  if (!topCard) {
    // Empty tableau - only King can be placed
    return card.rank === 13;
  }

  // Top card must be face up
  if (!topCard.faceUp) {
    return false;
  }

  // Must be opposite colour and one rank lower
  const cardColour = getCardColour(card);
  const topCardColour = getCardColour(topCard);

  return cardColour !== topCardColour && card.rank === topCard.rank - 1;
}

/**
 * Get the pile from the game state at a given location
 */
export function getPile(state: GameState, location: CardLocation): Pile | null {
  switch (location.pileType) {
    case 'stock':
      return state.stock;
    case 'waste':
      return state.waste;
    case 'foundation':
      return state.foundations[location.pileIndex] ?? null;
    case 'tableau':
      return state.tableau[location.pileIndex] ?? null;
    default:
      return null;
  }
}

/**
 * Get the card at a specific location
 */
export function getCardAt(state: GameState, location: CardLocation): Card | null {
  const pile = getPile(state, location);
  if (!pile) return null;
  return pile.cards[location.cardIndex] ?? null;
}

/**
 * Check if cards from a given index can be moved (they must all be face up)
 */
export function canPickUpCards(pile: Pile, fromIndex: number): boolean {
  // Can't pick up from stock
  if (pile.type === 'stock') {
    return false;
  }

  // From waste, can only pick the top card
  if (pile.type === 'waste') {
    return fromIndex === pile.cards.length - 1;
  }

  // From foundation, can only pick the top card
  if (pile.type === 'foundation') {
    return fromIndex === pile.cards.length - 1;
  }

  // From tableau, all cards from the index must be face up
  for (let i = fromIndex; i < pile.cards.length; i++) {
    if (!pile.cards[i].faceUp) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a move between two locations
 */
export function isValidMove(
  state: GameState,
  from: CardLocation,
  to: CardLocation,
  cardCount: number
): boolean {
  const sourcePile = getPile(state, from);
  const destPile = getPile(state, to);

  if (!sourcePile || !destPile) {
    return false;
  }

  // Check we can pick up the cards
  if (!canPickUpCards(sourcePile, from.cardIndex)) {
    return false;
  }

  // Check card count matches available cards
  const availableCards = sourcePile.cards.length - from.cardIndex;
  if (cardCount > availableCards) {
    return false;
  }

  // Get the card being moved (the one that will be placed)
  const movingCard = sourcePile.cards[from.cardIndex];
  if (!movingCard) {
    return false;
  }

  // Can't move to stock or waste
  if (destPile.type === 'stock' || destPile.type === 'waste') {
    return false;
  }

  // Foundation rules
  if (destPile.type === 'foundation') {
    // Can only move single cards to foundation
    if (cardCount !== 1) {
      return false;
    }
    return canPlaceOnFoundation(movingCard, destPile);
  }

  // Tableau rules
  if (destPile.type === 'tableau') {
    return canPlaceOnTableau(movingCard, destPile);
  }

  return false;
}

/**
 * Find all valid moves for a card (or stack starting at that card)
 */
export function findValidMoves(
  state: GameState,
  from: CardLocation
): CardLocation[] {
  const sourcePile = getPile(state, from);
  if (!sourcePile) return [];

  const cardCount = sourcePile.cards.length - from.cardIndex;
  const validDestinations: CardLocation[] = [];

  // Check foundations (single cards only)
  if (cardCount === 1) {
    for (let i = 0; i < 4; i++) {
      const to: CardLocation = { pileType: 'foundation', pileIndex: i, cardIndex: state.foundations[i].cards.length };
      if (isValidMove(state, from, to, 1)) {
        validDestinations.push(to);
      }
    }
  }

  // Check tableaus
  for (let i = 0; i < 7; i++) {
    const to: CardLocation = { pileType: 'tableau', pileIndex: i, cardIndex: state.tableau[i].cards.length };
    if (isValidMove(state, from, to, cardCount)) {
      validDestinations.push(to);
    }
  }

  return validDestinations;
}

/**
 * Check if the game is won (all cards on foundations)
 */
export function checkWinCondition(state: GameState): boolean {
  const totalOnFoundations = state.foundations.reduce(
    (sum, foundation) => sum + foundation.cards.length,
    0
  );
  return totalOnFoundations === 52;
}

/**
 * Check if there are any valid moves remaining
 */
export function hasValidMoves(state: GameState): boolean {
  // Check waste pile
  if (state.waste.cards.length > 0) {
    const wasteTop: CardLocation = {
      pileType: 'waste',
      pileIndex: 0,
      cardIndex: state.waste.cards.length - 1,
    };
    if (findValidMoves(state, wasteTop).length > 0) {
      return true;
    }
  }

  // Check tableau piles
  for (let i = 0; i < 7; i++) {
    const tableau = state.tableau[i];
    for (let j = 0; j < tableau.cards.length; j++) {
      if (tableau.cards[j].faceUp) {
        const location: CardLocation = {
          pileType: 'tableau',
          pileIndex: i,
          cardIndex: j,
        };
        if (findValidMoves(state, location).length > 0) {
          return true;
        }
      }
    }
  }

  // Check if stock can be drawn or reset
  if (state.stock.cards.length > 0) {
    return true;
  }

  // Check if stock can be reset (if there are cards in waste)
  if (state.waste.cards.length > 0) {
    if (state.config.unlimitedPasses) {
      return true;
    }
    // Vegas mode typically allows 3 passes
    if (state.config.scoringMode === 'vegas' && state.stockPasses < 3) {
      return true;
    }
  }

  return false;
}

/**
 * Check if auto-complete is possible
 * Auto-complete is available when all cards are face up
 */
export function canAutoComplete(state: GameState): boolean {
  // All tableau cards must be face up
  for (const tableau of state.tableau) {
    for (const card of tableau.cards) {
      if (!card.faceUp) {
        return false;
      }
    }
  }

  // Stock must be empty
  if (state.stock.cards.length > 0) {
    return false;
  }

  // Waste must be empty
  if (state.waste.cards.length > 0) {
    return false;
  }

  return true;
}

/**
 * Find the best foundation move for auto-complete
 * Returns null if no move is available
 */
export function findAutoCompleteMove(state: GameState): { from: CardLocation; to: CardLocation } | null {
  // Check each tableau pile from left to right
  for (let i = 0; i < 7; i++) {
    const tableau = state.tableau[i];
    if (tableau.cards.length === 0) continue;

    const topCard = tableau.cards.at(-1)!;
    const from: CardLocation = {
      pileType: 'tableau',
      pileIndex: i,
      cardIndex: tableau.cards.length - 1,
    };

    // Find a foundation that can accept this card
    for (let j = 0; j < 4; j++) {
      const foundation = state.foundations[j];
      if (canPlaceOnFoundation(topCard, foundation)) {
        return {
          from,
          to: { pileType: 'foundation', pileIndex: j, cardIndex: foundation.cards.length },
        };
      }
    }
  }

  return null;
}
