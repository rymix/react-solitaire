import type { Card, Suit, Rank } from './types';

/**
 * All suits in order
 */
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * All ranks in order (Ace low)
 */
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Create a unique card ID from suit and rank
 */
export function createCardId(suit: Suit, rank: Rank): string {
  return `${suit}-${rank}`;
}

/**
 * Create a single card
 */
export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return {
    id: createCardId(suit, rank),
    suit,
    rank,
    faceUp,
  };
}

/**
 * Create a standard 52-card deck (all face down)
 */
export function createDeck(): Card[] {
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank, false));
    }
  }

  return cards;
}

/**
 * Fisher-Yates shuffle algorithm
 * Creates a new shuffled array without mutating the original
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Shuffle with a seeded random number generator for reproducible games
 * Uses a simple LCG (Linear Congruential Generator)
 */
export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  
  // LCG parameters (same as glibc)
  const a = 1103515245;
  const c = 12345;
  const m = 2 ** 31;
  
  let current = seed;
  
  const seededRandom = (): number => {
    current = (a * current + c) % m;
    return current / m;
  };
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Create a shuffled deck
 */
export function createShuffledDeck(seed?: number): Card[] {
  const deck = createDeck();
  return seed !== undefined ? shuffleWithSeed(deck, seed) : shuffle(deck);
}

/**
 * Flip a card face up or face down
 */
export function flipCard(card: Card, faceUp: boolean): Card {
  if (card.faceUp === faceUp) return card;
  return { ...card, faceUp };
}

/**
 * Check if two cards are the same
 */
export function isSameCard(a: Card, b: Card): boolean {
  return a.id === b.id;
}

/**
 * Find a card in a deck by its ID
 */
export function findCard(cards: Card[], id: string): Card | undefined {
  return cards.find(card => card.id === id);
}
