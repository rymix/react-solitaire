import { describe, it, expect } from 'vitest';
import {
  createDeck,
  createCard,
  createShuffledDeck,
  shuffle,
  shuffleWithSeed,
  flipCard,
  isSameCard,
  SUITS,
  RANKS,
} from './deck';

describe('deck', () => {
  describe('createDeck', () => {
    it('creates a 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('contains all suits and ranks', () => {
      const deck = createDeck();
      
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          const card = deck.find(c => c.suit === suit && c.rank === rank);
          expect(card).toBeDefined();
        }
      }
    });

    it('creates all cards face down', () => {
      const deck = createDeck();
      expect(deck.every(card => !card.faceUp)).toBe(true);
    });

    it('creates unique card IDs', () => {
      const deck = createDeck();
      const ids = new Set(deck.map(c => c.id));
      expect(ids.size).toBe(52);
    });
  });

  describe('createCard', () => {
    it('creates a card with correct properties', () => {
      const card = createCard('hearts', 1);
      expect(card.suit).toBe('hearts');
      expect(card.rank).toBe(1);
      expect(card.faceUp).toBe(false);
      expect(card.id).toBe('hearts-1');
    });

    it('creates a face-up card when specified', () => {
      const card = createCard('spades', 13, true);
      expect(card.faceUp).toBe(true);
    });
  });

  describe('shuffle', () => {
    it('returns an array of the same length', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('does not mutate the original array', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffle(deck);
      expect(deck).toEqual(original);
    });

    it('contains all original elements', () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      const originalIds = new Set(deck.map(c => c.id));
      const shuffledIds = new Set(shuffled.map(c => c.id));
      expect(shuffledIds).toEqual(originalIds);
    });

    it('produces different orderings (probabilistic)', () => {
      const deck = createDeck();
      const shuffled1 = shuffle(deck);
      const shuffled2 = shuffle(deck);
      // Very unlikely to be identical
      const sameOrder = shuffled1.every((c, i) => c.id === shuffled2[i].id);
      expect(sameOrder).toBe(false);
    });
  });

  describe('shuffleWithSeed', () => {
    it('produces consistent results with the same seed', () => {
      const deck = createDeck();
      const shuffled1 = shuffleWithSeed(deck, 12345);
      const shuffled2 = shuffleWithSeed(deck, 12345);
      expect(shuffled1.map(c => c.id)).toEqual(shuffled2.map(c => c.id));
    });

    it('produces different results with different seeds', () => {
      const deck = createDeck();
      const shuffled1 = shuffleWithSeed(deck, 12345);
      const shuffled2 = shuffleWithSeed(deck, 54321);
      const sameOrder = shuffled1.every((c, i) => c.id === shuffled2[i].id);
      expect(sameOrder).toBe(false);
    });
  });

  describe('createShuffledDeck', () => {
    it('creates a shuffled 52-card deck', () => {
      const deck = createShuffledDeck();
      expect(deck).toHaveLength(52);
    });

    it('is reproducible with a seed', () => {
      const deck1 = createShuffledDeck(42);
      const deck2 = createShuffledDeck(42);
      expect(deck1.map(c => c.id)).toEqual(deck2.map(c => c.id));
    });
  });

  describe('flipCard', () => {
    it('flips a card face up', () => {
      const card = createCard('hearts', 5);
      const flipped = flipCard(card, true);
      expect(flipped.faceUp).toBe(true);
      expect(card.faceUp).toBe(false); // Original unchanged
    });

    it('returns same object if no change needed', () => {
      const card = createCard('hearts', 5, true);
      const result = flipCard(card, true);
      expect(result).toBe(card);
    });
  });

  describe('isSameCard', () => {
    it('returns true for identical cards', () => {
      const card1 = createCard('hearts', 5);
      const card2 = createCard('hearts', 5);
      expect(isSameCard(card1, card2)).toBe(true);
    });

    it('returns false for different cards', () => {
      const card1 = createCard('hearts', 5);
      const card2 = createCard('hearts', 6);
      expect(isSameCard(card1, card2)).toBe(false);
    });
  });
});
