import { useReducer, useCallback, useMemo, useRef } from 'react';
import {
  createInitialState,
  createWonState,
  drawFromStock,
  resetStock,
  executeMove,
  flipTableauCard,
  autoMoveToFoundation,
  autoCompleteStep,
  cloneState,
  GameHistory,
  type GameState,
  type GameConfig,
  type CardLocation,
  type MoveResult,
} from '@react-solitaire/core';

/**
 * Actions for the game reducer
 */
type GameAction =
  | { type: 'NEW_GAME'; config?: Partial<GameConfig>; seed?: number }
  | { type: 'DRAW' }
  | { type: 'RESET_STOCK' }
  | { type: 'MOVE'; from: CardLocation; to: CardLocation; cardCount: number }
  | { type: 'AUTO_MOVE'; from: CardLocation }
  | { type: 'AUTO_COMPLETE_STEP' }
  | { type: 'FLIP_CARD'; tableauIndex: number }
  | { type: 'UNDO' }
  | { type: 'SET_STATE'; state: GameState }
  | { type: 'TRIGGER_WIN'; config?: Partial<GameConfig> };

/**
 * Game reducer state wrapper
 */
interface GameReducerState {
  game: GameState;
  history: GameHistory;
  lastMoveResult: MoveResult | null;
}

/**
 * Reducer for game state management
 */
function gameReducer(state: GameReducerState, action: GameAction): GameReducerState {
  switch (action.type) {
    case 'NEW_GAME': {
      const newGame = createInitialState(action.config, action.seed);
      const history = new GameHistory();
      return { game: newGame, history, lastMoveResult: null };
    }

    case 'DRAW': {
      if (state.game.stock.cards.length === 0) {
        return state;
      }
      const previousState = cloneState(state.game);
      const newGame = drawFromStock(state.game);
      
      state.history.push({
        move: {
          from: { pileType: 'stock', pileIndex: 0, cardIndex: state.game.stock.cards.length - 1 },
          to: { pileType: 'waste', pileIndex: 0, cardIndex: state.game.waste.cards.length },
          cardCount: state.game.config.drawMode === 'draw-three' ? 3 : 1,
          flippedCard: false,
          scoreChange: 0,
        },
        previousState,
      });
      
      return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
    }

    case 'RESET_STOCK': {
      if (state.game.waste.cards.length === 0) {
        return state;
      }
      const previousState = cloneState(state.game);
      const newGame = resetStock(state.game);
      
      state.history.push({
        move: {
          from: { pileType: 'waste', pileIndex: 0, cardIndex: 0 },
          to: { pileType: 'stock', pileIndex: 0, cardIndex: 0 },
          cardCount: state.game.waste.cards.length,
          flippedCard: false,
          scoreChange: 0,
        },
        previousState,
      });
      
      return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
    }

    case 'MOVE': {
      const previousState = cloneState(state.game);
      const result = executeMove(state.game, action.from, action.to, action.cardCount);
      
      if (result.success && result.state && result.move) {
        state.history.push({
          move: result.move,
          previousState,
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      
      return { ...state, lastMoveResult: result };
    }

    case 'AUTO_MOVE': {
      const previousState = cloneState(state.game);
      const result = autoMoveToFoundation(state.game, action.from);
      
      if (result.success && result.state && result.move) {
        state.history.push({
          move: result.move,
          previousState,
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      
      return { ...state, lastMoveResult: result };
    }

    case 'AUTO_COMPLETE_STEP': {
      const newGame = autoCompleteStep(state.game);
      
      if (newGame) {
        // Don't record individual auto-complete moves in history
        return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
      }
      
      return state;
    }

    case 'FLIP_CARD': {
      const previousState = cloneState(state.game);
      const result = flipTableauCard(state.game, action.tableauIndex);
      
      if (result.success && result.state) {
        state.history.push({
          move: {
            from: { pileType: 'tableau', pileIndex: action.tableauIndex, cardIndex: state.game.tableau[action.tableauIndex].cards.length - 1 },
            to: { pileType: 'tableau', pileIndex: action.tableauIndex, cardIndex: state.game.tableau[action.tableauIndex].cards.length - 1 },
            cardCount: 0,
            flippedCard: true,
            scoreChange: 5, // Standard score for revealing a card
          },
          previousState,
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      
      return { ...state, lastMoveResult: result };
    }

    case 'UNDO': {
      const previousState = state.history.undo();
      if (previousState) {
        return { ...state, game: previousState, lastMoveResult: null };
      }
      return state;
    }

    case 'SET_STATE': {
      return { ...state, game: action.state, lastMoveResult: null };
    }

    case 'TRIGGER_WIN': {
      const wonState = createWonState(action.config);
      const history = new GameHistory();
      return { game: wonState, history, lastMoveResult: null };
    }

    default:
      return state;
  }
}

/**
 * Hook options
 */
export interface UseGameOptions {
  /** Initial game configuration */
  config?: Partial<GameConfig>;
  /** Seed for reproducible games */
  seed?: number;
  /** Callback when game is won */
  onWin?: (state: GameState) => void;
  /** Callback on any move */
  onMove?: (result: MoveResult) => void;
}

/**
 * Hook return type
 */
export interface UseGameReturn {
  /** Current game state */
  state: GameState;
  /** Start a new game */
  newGame: (config?: Partial<GameConfig>, seed?: number) => void;
  /** Draw from stock */
  draw: () => void;
  /** Reset waste to stock */
  resetWaste: () => void;
  /** Move cards between piles */
  move: (from: CardLocation, to: CardLocation, cardCount: number) => MoveResult;
  /** Auto-move card to foundation (double-click) */
  autoMove: (from: CardLocation) => MoveResult;
  /** Flip a face-down tableau card */
  flipCard: (tableauIndex: number) => void;
  /** Perform one auto-complete step */
  autoCompleteStep: () => boolean;
  /** Undo last move */
  undo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Last move result */
  lastMoveResult: MoveResult | null;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Trigger win state for testing */
  triggerWin: () => void;
}

/**
 * Hook for managing solitaire game state
 */
export function useGame(options: UseGameOptions = {}): UseGameReturn {
  const { config, seed } = options;

  // Use refs to avoid recreating callbacks when config changes
  const configRef = useRef(config);
  const seedRef = useRef(seed);
  configRef.current = config;
  seedRef.current = seed;

  const [reducerState, dispatch] = useReducer(gameReducer, null, () => ({
    game: createInitialState(config, seed),
    history: new GameHistory(),
    lastMoveResult: null,
  }));

  const { game, history, lastMoveResult } = reducerState;

  // Stable callbacks that don't change
  const newGame = useCallback((newConfig?: Partial<GameConfig>, newSeed?: number) => {
    dispatch({ type: 'NEW_GAME', config: newConfig ?? configRef.current, seed: newSeed ?? seedRef.current });
  }, []);

  const draw = useCallback(() => {
    dispatch({ type: 'DRAW' });
  }, []);

  const resetWaste = useCallback(() => {
    dispatch({ type: 'RESET_STOCK' });
  }, []);

  const move = useCallback((from: CardLocation, to: CardLocation, cardCount: number): MoveResult => {
    dispatch({ type: 'MOVE', from, to, cardCount });
    // Note: This returns the previous result, not the one from this action
    // The caller should check the state after render if needed
    return { success: true, error: undefined };
  }, []);

  const autoMove = useCallback((from: CardLocation): MoveResult => {
    dispatch({ type: 'AUTO_MOVE', from });
    return { success: true, error: undefined };
  }, []);

  const flipCard = useCallback((tableauIndex: number): void => {
    dispatch({ type: 'FLIP_CARD', tableauIndex });
  }, []);

  const autoCompleteStepFn = useCallback((): boolean => {
    dispatch({ type: 'AUTO_COMPLETE_STEP' });
    return true; // Caller should check gameState.isWon
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const triggerWin = useCallback(() => {
    dispatch({ type: 'TRIGGER_WIN', config: configRef.current });
  }, []);

  const canUndo = history.canUndo();

  const elapsedTime = useMemo(() => {
    if (!game.startTime) return 0;
    const endTime = game.endTime ?? Date.now();
    return Math.floor((endTime - game.startTime) / 1000);
  }, [game.startTime, game.endTime]);

  return {
    state: game,
    newGame,
    draw,
    resetWaste,
    move,
    autoMove,
    flipCard,
    autoCompleteStep: autoCompleteStepFn,
    undo,
    canUndo,
    lastMoveResult,
    elapsedTime,
    triggerWin,
  };
}
