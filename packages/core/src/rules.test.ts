import { describe, it, expect } from 'vitest';
import { createCard } from './deck';
import { createInitialState } from './game';
import {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  isValidMove,
  checkWinCondition,
  canAutoComplete,
} from './rules';
import type { Pile, CardLocation } from './types';

describe('rules', () => {
  describe('canPlaceOnFoundation', () => {
    it('allows Ace on empty foundation', () => {
      const ace = createCard('hearts', 1, true);
      const foundation: Pile = { id: 'foundation-0', type: 'foundation', cards: [] };
      expect(canPlaceOnFoundation(ace, foundation)).toBe(true);
    });

    it('rejects non-Ace on empty foundation', () => {
      const two = createCard('hearts', 2, true);
      const foundation: Pile = { id: 'foundation-0', type: 'foundation', cards: [] };
      expect(canPlaceOnFoundation(two, foundation)).toBe(false);
    });

    it('allows same suit, one rank higher', () => {
      const ace = createCard('hearts', 1, true);
      const two = createCard('hearts', 2, true);
      const foundation: Pile = { id: 'foundation-0', type: 'foundation', cards: [ace] };
      expect(canPlaceOnFoundation(two, foundation)).toBe(true);
    });

    it('rejects different suit', () => {
      const aceHearts = createCard('hearts', 1, true);
      const twoSpades = createCard('spades', 2, true);
      const foundation: Pile = { id: 'foundation-0', type: 'foundation', cards: [aceHearts] };
      expect(canPlaceOnFoundation(twoSpades, foundation)).toBe(false);
    });

    it('rejects same suit wrong rank', () => {
      const aceHearts = createCard('hearts', 1, true);
      const threeHearts = createCard('hearts', 3, true);
      const foundation: Pile = { id: 'foundation-0', type: 'foundation', cards: [aceHearts] };
      expect(canPlaceOnFoundation(threeHearts, foundation)).toBe(false);
    });
  });

  describe('canPlaceOnTableau', () => {
    it('allows King on empty tableau', () => {
      const king = createCard('hearts', 13, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [], tableauIndex: 0 };
      expect(canPlaceOnTableau(king, tableau)).toBe(true);
    });

    it('rejects non-King on empty tableau', () => {
      const queen = createCard('hearts', 12, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [], tableauIndex: 0 };
      expect(canPlaceOnTableau(queen, tableau)).toBe(false);
    });

    it('allows opposite colour, one rank lower', () => {
      const redQueen = createCard('hearts', 12, true);
      const blackJack = createCard('spades', 11, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [redQueen], tableauIndex: 0 };
      expect(canPlaceOnTableau(blackJack, tableau)).toBe(true);
    });

    it('rejects same colour', () => {
      const redQueen = createCard('hearts', 12, true);
      const redJack = createCard('diamonds', 11, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [redQueen], tableauIndex: 0 };
      expect(canPlaceOnTableau(redJack, tableau)).toBe(false);
    });

    it('rejects wrong rank', () => {
      const redQueen = createCard('hearts', 12, true);
      const blackTen = createCard('spades', 10, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [redQueen], tableauIndex: 0 };
      expect(canPlaceOnTableau(blackTen, tableau)).toBe(false);
    });

    it('rejects if top card is face down', () => {
      const redQueen = createCard('hearts', 12, false); // face down
      const blackJack = createCard('spades', 11, true);
      const tableau: Pile = { id: 'tableau-0', type: 'tableau', cards: [redQueen], tableauIndex: 0 };
      expect(canPlaceOnTableau(blackJack, tableau)).toBe(false);
    });
  });

  describe('isValidMove', () => {
    it('rejects moves to stock', () => {
      const state = createInitialState({}, 42);
      const from: CardLocation = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      const to: CardLocation = { pileType: 'stock', pileIndex: 0, cardIndex: 0 };
      expect(isValidMove(state, from, to, 1)).toBe(false);
    });

    it('rejects moves to waste', () => {
      const state = createInitialState({}, 42);
      const from: CardLocation = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      const to: CardLocation = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      expect(isValidMove(state, from, to, 1)).toBe(false);
    });

    it('rejects multiple cards to foundation', () => {
      const state = createInitialState({}, 42);
      const from: CardLocation = { pileType: 'tableau', pileIndex: 6, cardIndex: 5 };
      const to: CardLocation = { pileType: 'foundation', pileIndex: 0, cardIndex: 0 };
      expect(isValidMove(state, from, to, 2)).toBe(false);
    });
  });

  describe('checkWinCondition', () => {
    it('returns false for initial state', () => {
      const state = createInitialState();
      expect(checkWinCondition(state)).toBe(false);
    });

    it('returns true when all 52 cards are on foundations', () => {
      const state = createInitialState();
      // Clear all piles and fill foundations
      state.stock.cards = [];
      state.waste.cards = [];
      state.tableau.forEach(t => t.cards = []);
      
      // Fill each foundation with 13 cards of the appropriate suit
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
      for (let i = 0; i < 4; i++) {
        for (let rank = 1; rank <= 13; rank++) {
          state.foundations[i].cards.push(createCard(suits[i], rank as any, true));
        }
      }
      
      expect(checkWinCondition(state)).toBe(true);
    });
  });

  describe('canAutoComplete', () => {
    it('returns false if tableau has face-down cards', () => {
      const state = createInitialState({}, 42);
      expect(canAutoComplete(state)).toBe(false);
    });

    it('returns false if stock has cards', () => {
      const state = createInitialState();
      // Even if we make all tableau cards face up, stock still has cards
      state.tableau.forEach(t => t.cards.forEach(c => c.faceUp = true));
      expect(canAutoComplete(state)).toBe(false);
    });

    it('returns true when all cards are face up and stock/waste empty', () => {
      const state = createInitialState();
      state.stock.cards = [];
      state.waste.cards = [];
      state.tableau.forEach(t => t.cards.forEach(c => c.faceUp = true));
      expect(canAutoComplete(state)).toBe(true);
    });
  });
});
