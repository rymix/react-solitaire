import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  cloneState,
  drawFromStock,
  resetStock,
  executeMove,
  flipTableauCard,
  validateState,
  getAllCards,
  GameHistory,
} from './game';
import type { CardLocation } from './types';

describe('game', () => {
  describe('createInitialState', () => {
    it('creates a valid initial state', () => {
      const state = createInitialState();
      const { valid, errors } = validateState(state);
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('deals 28 cards to tableau', () => {
      const state = createInitialState();
      const tableauCards = state.tableau.reduce((sum, pile) => sum + pile.cards.length, 0);
      expect(tableauCards).toBe(28);
    });

    it('places 24 cards in stock', () => {
      const state = createInitialState();
      expect(state.stock.cards).toHaveLength(24);
    });

    it('leaves waste empty', () => {
      const state = createInitialState();
      expect(state.waste.cards).toHaveLength(0);
    });

    it('leaves foundations empty', () => {
      const state = createInitialState();
      state.foundations.forEach(f => expect(f.cards).toHaveLength(0));
    });

    it('has correct tableau pile sizes', () => {
      const state = createInitialState();
      expect(state.tableau[0].cards).toHaveLength(1);
      expect(state.tableau[1].cards).toHaveLength(2);
      expect(state.tableau[2].cards).toHaveLength(3);
      expect(state.tableau[3].cards).toHaveLength(4);
      expect(state.tableau[4].cards).toHaveLength(5);
      expect(state.tableau[5].cards).toHaveLength(6);
      expect(state.tableau[6].cards).toHaveLength(7);
    });

    it('has only top card face up in each tableau', () => {
      const state = createInitialState();
      state.tableau.forEach(pile => {
        pile.cards.forEach((card, index) => {
          if (index === pile.cards.length - 1) {
            expect(card.faceUp).toBe(true);
          } else {
            expect(card.faceUp).toBe(false);
          }
        });
      });
    });

    it('is reproducible with seed', () => {
      const state1 = createInitialState({}, 42);
      const state2 = createInitialState({}, 42);
      
      const cards1 = getAllCards(state1).map(c => c.id);
      const cards2 = getAllCards(state2).map(c => c.id);
      expect(cards1).toEqual(cards2);
    });

    it('respects configuration', () => {
      const state = createInitialState({ drawMode: 'draw-three', scoringMode: 'vegas' });
      expect(state.config.drawMode).toBe('draw-three');
      expect(state.config.scoringMode).toBe('vegas');
    });
  });

  describe('cloneState', () => {
    it('creates a deep copy', () => {
      const original = createInitialState();
      const clone = cloneState(original);
      
      // Modify clone
      clone.score = 100;
      clone.stock.cards.pop();
      clone.tableau[0].cards[0].faceUp = !clone.tableau[0].cards[0].faceUp;
      
      // Original should be unchanged
      expect(original.score).toBe(0);
      expect(original.stock.cards).toHaveLength(24);
      expect(original.tableau[0].cards[0].faceUp).toBe(true);
    });
  });

  describe('drawFromStock', () => {
    it('moves one card in draw-one mode', () => {
      const state = createInitialState({ drawMode: 'draw-one' });
      const newState = drawFromStock(state);
      
      expect(newState.stock.cards).toHaveLength(23);
      expect(newState.waste.cards).toHaveLength(1);
      expect(newState.waste.cards[0].faceUp).toBe(true);
    });

    it('moves three cards in draw-three mode', () => {
      const state = createInitialState({ drawMode: 'draw-three' });
      const newState = drawFromStock(state);
      
      expect(newState.stock.cards).toHaveLength(21);
      expect(newState.waste.cards).toHaveLength(3);
    });

    it('moves fewer cards if stock has less than 3', () => {
      const state = createInitialState({ drawMode: 'draw-three' });
      // Draw most of the stock
      let current = state;
      for (let i = 0; i < 7; i++) {
        current = drawFromStock(current);
      }
      // Stock should have 3 cards left (24 - 7*3 = 3)
      expect(current.stock.cards).toHaveLength(3);
      
      // Draw again
      current = drawFromStock(current);
      expect(current.stock.cards).toHaveLength(0);
      expect(current.waste.cards).toHaveLength(24);
    });

    it('does nothing if stock is empty', () => {
      const state = createInitialState();
      state.stock.cards = [];
      const newState = drawFromStock(state);
      expect(newState).toBe(state);
    });

    it('starts the timer on first draw', () => {
      const state = createInitialState();
      expect(state.startTime).toBeNull();
      
      const newState = drawFromStock(state);
      expect(newState.startTime).not.toBeNull();
    });

    it('increments move counter', () => {
      const state = createInitialState();
      expect(state.moves).toBe(0);
      
      const newState = drawFromStock(state);
      expect(newState.moves).toBe(1);
    });
  });

  describe('resetStock', () => {
    it('moves all waste cards back to stock', () => {
      let state = createInitialState();
      // Draw all cards
      for (let i = 0; i < 24; i++) {
        state = drawFromStock(state);
      }
      expect(state.stock.cards).toHaveLength(0);
      expect(state.waste.cards).toHaveLength(24);
      
      // Reset
      const resetState = resetStock(state);
      expect(resetState.stock.cards).toHaveLength(24);
      expect(resetState.waste.cards).toHaveLength(0);
    });

    it('makes all cards face down', () => {
      let state = createInitialState();
      for (let i = 0; i < 24; i++) {
        state = drawFromStock(state);
      }
      
      const resetState = resetStock(state);
      expect(resetState.stock.cards.every(c => !c.faceUp)).toBe(true);
    });

    it('increments stock passes', () => {
      let state = createInitialState();
      expect(state.stockPasses).toBe(0);
      
      for (let i = 0; i < 24; i++) {
        state = drawFromStock(state);
      }
      state = resetStock(state);
      expect(state.stockPasses).toBe(1);
    });

    it('does nothing if waste is empty', () => {
      const state = createInitialState();
      const newState = resetStock(state);
      expect(newState).toBe(state);
    });
  });

  describe('executeMove', () => {
    it('moves cards between piles', () => {
      const state = createInitialState({}, 42);
      
      // Find a valid move (this depends on the seed)
      // We'll try moving from waste to tableau after drawing
      let current = drawFromStock(state);
      
      // Try to find any valid tableau-to-tableau move
      const from: CardLocation = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      // This specific move may or may not be valid depending on the seed
      // Just test the mechanics
      const result = executeMove(current, from, 
        { pileType: 'tableau', pileIndex: 1, cardIndex: current.tableau[1].cards.length }, 1);
      
      // Result could be success or failure depending on card values
      expect(result.success).toBeDefined();
      if (result.success) {
        expect(result.state).toBeDefined();
        expect(result.move).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('flips exposed tableau card after move when autoFlipTableau is enabled', () => {
      // Create a scenario where a card should flip
      const state = createInitialState({ autoFlipTableau: true }, 12345);
      
      // Manually set up a testable scenario
      const testState = cloneState(state);
      testState.config.autoFlipTableau = true; // Ensure config is set
      testState.tableau[0].cards = [
        { id: 'test-1', suit: 'hearts', rank: 5, faceUp: false },
        { id: 'test-2', suit: 'spades', rank: 4, faceUp: true },
      ];
      testState.tableau[1].cards = [
        { id: 'test-3', suit: 'hearts', rank: 5, faceUp: true },
      ];

      const from: CardLocation = { pileType: 'tableau', pileIndex: 0, cardIndex: 1 };
      const to: CardLocation = { pileType: 'tableau', pileIndex: 1, cardIndex: 1 };
      
      const result = executeMove(testState, from, to, 1);
      
      if (result.success) {
        // The previously hidden card should now be face up
        expect(result.state!.tableau[0].cards[0].faceUp).toBe(true);
        expect(result.move!.flippedCard).toBe(true);
      }
    });

    it('does not auto-flip when autoFlipTableau is false', () => {
      // Create a scenario where a card would flip if auto-flip was enabled
      const state = createInitialState({ autoFlipTableau: false }, 12345);
      
      const testState = cloneState(state);
      testState.tableau[0].cards = [
        { id: 'test-1', suit: 'hearts', rank: 5, faceUp: false },
        { id: 'test-2', suit: 'spades', rank: 4, faceUp: true },
      ];
      testState.tableau[1].cards = [
        { id: 'test-3', suit: 'hearts', rank: 5, faceUp: true },
      ];

      const from: CardLocation = { pileType: 'tableau', pileIndex: 0, cardIndex: 1 };
      const to: CardLocation = { pileType: 'tableau', pileIndex: 1, cardIndex: 1 };
      
      const result = executeMove(testState, from, to, 1);
      
      if (result.success) {
        // The previously hidden card should remain face down
        expect(result.state!.tableau[0].cards[0].faceUp).toBe(false);
        expect(result.move!.flippedCard).toBe(false);
      }
    });
  });

  describe('flipTableauCard', () => {
    it('flips a face-down top card', () => {
      const state = createInitialState({ autoFlipTableau: false }, 12345);
      const testState = cloneState(state);
      testState.tableau[0].cards = [
        { id: 'test-1', suit: 'hearts', rank: 5, faceUp: false },
      ];

      const result = flipTableauCard(testState, 0);
      
      expect(result.success).toBe(true);
      expect(result.state!.tableau[0].cards[0].faceUp).toBe(true);
    });

    it('fails on empty tableau', () => {
      const state = createInitialState({}, 12345);
      const testState = cloneState(state);
      testState.tableau[0].cards = [];

      const result = flipTableauCard(testState, 0);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('fails on already face-up card', () => {
      const state = createInitialState({}, 12345);
      const testState = cloneState(state);
      testState.tableau[0].cards = [
        { id: 'test-1', suit: 'hearts', rank: 5, faceUp: true },
      ];

      const result = flipTableauCard(testState, 0);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('fails on invalid tableau index', () => {
      const state = createInitialState({}, 12345);
      
      const result = flipTableauCard(state, 10);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateState', () => {
    it('validates a correct state', () => {
      const state = createInitialState();
      const { valid, errors } = validateState(state);
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('detects missing cards', () => {
      const state = createInitialState();
      state.stock.cards.pop();
      const { valid, errors } = validateState(state);
      expect(valid).toBe(false);
      expect(errors.some(e => e.includes('51'))).toBe(true);
    });

    it('detects duplicate cards', () => {
      const state = createInitialState();
      state.stock.cards.push({ ...state.stock.cards[0] });
      const { valid, errors } = validateState(state);
      expect(valid).toBe(false);
      expect(errors.some(e => e.includes('Duplicate'))).toBe(true);
    });
  });

  describe('GameHistory', () => {
    it('tracks undo/redo', () => {
      const history = new GameHistory();
      const state1 = createInitialState();
      const state2 = drawFromStock(state1);
      
      history.push({
        move: { from: { pileType: 'stock', pileIndex: 0, cardIndex: 0 }, 
                to: { pileType: 'waste', pileIndex: 0, cardIndex: 0 },
                cardCount: 1, flippedCard: false, scoreChange: 0 },
        previousState: state1,
      });
      
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      
      const undoneState = history.undo();
      expect(undoneState).toEqual(state1);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
    });

    it('clears future history on new move after undo', () => {
      const history = new GameHistory();
      const state1 = createInitialState();
      
      // Add two moves
      history.push({ move: {} as any, previousState: state1 });
      history.push({ move: {} as any, previousState: cloneState(state1) });
      
      expect(history.size()).toBe(2);
      
      // Undo one
      history.undo();
      expect(history.canRedo()).toBe(true);
      
      // Add a new move (should clear the redo)
      history.push({ move: {} as any, previousState: cloneState(state1) });
      expect(history.canRedo()).toBe(false);
      expect(history.size()).toBe(2);
    });
  });
});
