import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  type CardLocation,
  type GameConfig,
  isValidMove,
  canPickUpCards,
  getPile,
  canAutoComplete,
  canAutoMove,
  hasValidMoves,
} from '@react-solitaire/core';
import type { SolitaireTheme, SolitaireOptions } from '../../themes/types';
import { defaultTheme } from '../../themes';
import { useGame } from '../../hooks/useGame';
import { useDrag } from '../../hooks/useDrag';
import { useTimer } from '../../hooks/useTimer';
import { useSounds } from '../../hooks/useSounds';
import { Table } from '../Table';
import { Card } from '../Card';
import { VictoryAnimation } from '../VictoryAnimation';

/**
 * Solitaire component props
 */
export interface SolitaireProps {
  /** Theme for styling */
  theme?: SolitaireTheme;
  /** Game options */
  options?: SolitaireOptions;
  /** Callback when game is won */
  onWin?: (stats: { time: number; moves: number; score: number }) => void;
  /** Callback when a new game starts */
  onNewGame?: () => void;
  /** External control: start new game */
  newGameTrigger?: number;
  /** Scale factor (1 = original size) */
  scale?: number;
  /** Additional class name */
  className?: string;
  /** Show test win button (for debugging) */
  showTestButton?: boolean;
}

const SolitaireContainer = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: ${p => p.$width}px;
  min-height: ${p => p.$height}px;
  overflow: auto;
`;

const DragLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  left: 0;
  top: 0;
`;

const DraggedCardsContainer = styled.div.attrs<{ $x: number; $y: number }>(props => ({
  style: {
    transform: `translate(${props.$x}px, ${props.$y}px)`,
  },
}))<{ $x: number; $y: number }>`
  position: absolute;
  left: 0;
  top: 0;
`;

const StatusBar = styled.div<{ $font: string; $fontSize: number; $color: string; $bgColor: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  font-family: ${p => p.$font};
  font-size: ${p => p.$fontSize}px;
  color: ${p => p.$color};
  background-color: ${p => p.$bgColor};
`;

const AutoCompleteButton = styled.button<{ $font: string; $visible: boolean }>`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  font-family: ${p => p.$font};
  font-size: 14px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  cursor: pointer;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? 'auto' : 'none'};
  transition: opacity 0.2s;

  &:active {
    border-style: inset;
  }
`;

const NoMovesOverlay = styled.div<{ $font: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px 48px;
  font-family: ${p => p.$font};
  font-size: 18px;
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  border-radius: 8px;
  text-align: center;
  z-index: 100;
  
  h2 {
    margin: 0 0 16px 0;
    font-size: 24px;
  }
  
  p {
    margin: 0 0 16px 0;
    opacity: 0.8;
  }
  
  button {
    padding: 8px 24px;
    font-family: inherit;
    font-size: 14px;
    background: #c0c0c0;
    border: 2px outset #ffffff;
    cursor: pointer;
    
    &:active {
      border-style: inset;
    }
  }
`;

const TestButton = styled.button<{ $font: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  font-family: ${p => p.$font};
  font-size: 11px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  cursor: pointer;
  opacity: 0.6;
  z-index: 50;
  
  &:hover {
    opacity: 1;
  }
  
  &:active {
    border-style: inset;
  }
`;

// Default empty options object - stable reference
const EMPTY_OPTIONS: SolitaireOptions = {};
const EMPTY_SOUND_CONFIG = {};

/**
 * Main Solitaire game component
 */
export function Solitaire({
  theme = defaultTheme,
  options = EMPTY_OPTIONS,
  onWin,
  onNewGame,
  newGameTrigger,
  scale = 1,
  className,
  showTestButton = false,
}: SolitaireProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [selectedCard, setSelectedCard] = useState<CardLocation | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const [launchedCardIds, setLaunchedCardIds] = useState<Set<string>>(new Set());
  const autoCompleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Store callbacks in refs for stable access
  const onWinRef = useRef(onWin);
  const onNewGameRef = useRef(onNewGame);
  onWinRef.current = onWin;
  onNewGameRef.current = onNewGame;

  // Memoize game config - only changes when specific options change
  const gameConfig = useMemo<Partial<GameConfig>>(() => ({
    drawMode: options.drawMode ?? 'draw-one',
    scoringMode: options.scoringMode ?? 'standard',
    unlimitedPasses: options.unlimitedPasses ?? true,
    autoFlipTableau: options.autoFlipTableau ?? false, // Default to click-to-flip like original
  }), [options.drawMode, options.scoringMode, options.unlimitedPasses, options.autoFlipTableau]);

  // Game state management
  const {
    state: gameState,
    newGame,
    draw,
    resetWaste,
    move,
    autoMove,
    flipCard,
    autoCompleteStep,
    triggerWin,
  } = useGame({ config: gameConfig });

  // Store current gameState in ref for use in callbacks
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Store move callback in ref
  const moveRef = useRef(move);
  moveRef.current = move;

  // Track game win state
  const prevIsWonRef = useRef(false);
  useEffect(() => {
    if (gameState.isWon && !prevIsWonRef.current) {
      setShowVictory(true);
      soundsRef.current.play('victory');
      onWinRef.current?.({
        time: gameState.endTime && gameState.startTime
          ? Math.floor((gameState.endTime - gameState.startTime) / 1000)
          : 0,
        moves: gameState.moves,
        score: gameState.score,
      });
    }
    prevIsWonRef.current = gameState.isWon;
  }, [gameState.isWon, gameState.endTime, gameState.startTime, gameState.moves, gameState.score]);

  // Timer - memoize options object
  const timerOptions = useMemo(() => ({
    startTime: gameState.startTime,
    endTime: gameState.endTime,
  }), [gameState.startTime, gameState.endTime]);
  
  const timer = useTimer(timerOptions);

  // Sounds - use stable config
  const soundConfig = options.sound ?? EMPTY_SOUND_CONFIG;
  const sounds = useSounds(soundConfig);
  
  // Store sounds ref for use in callbacks
  const soundsRef = useRef(sounds);
  soundsRef.current = sounds;

  // Check if move is valid for drag/drop - use ref to get current state
  const checkValidMove = useCallback((from: CardLocation, to: CardLocation, cardCount: number) => {
    return isValidMove(gameStateRef.current, from, to, cardCount);
  }, []);

  // Drag callbacks - stable references using refs
  const handleDragStart = useCallback(() => {
    soundsRef.current.play('pickup');
  }, []);

  const handleDrop = useCallback((from: CardLocation, to: CardLocation, cardCount: number) => {
    const result = moveRef.current(from, to, cardCount);
    if (result.success) {
      soundsRef.current.play('place');
      setSelectedCard(null);
    } else {
      soundsRef.current.play('invalid');
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    // Nothing specific needed
  }, []);

  // Drag and drop - memoize options
  const dragOptions = useMemo(() => ({
    isValidDrop: checkValidMove,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  }), [checkValidMove, handleDragStart, handleDrop, handleDragEnd]);

  const {
    dragState,
    startDrag,
    currentDropTarget,
    registerDropTarget,
    unregisterDropTarget,
  } = useDrag(dragOptions);

  // Handle new game trigger from parent
  const prevTriggerRef = useRef(newGameTrigger);
  useEffect(() => {
    // Only trigger new game when the value actually changes (not on mount)
    if (newGameTrigger !== undefined && newGameTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = newGameTrigger;
      newGame();
      setShowVictory(false);
      setSelectedCard(null);
      setIsAutoCompleting(false);
      setLaunchedCardIds(new Set());
      onNewGameRef.current?.();
    }
  }, [newGameTrigger, newGame]);

  // Measure container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-complete logic
  useEffect(() => {
    if (isAutoCompleting && !gameState.isWon) {
      autoCompleteIntervalRef.current = setInterval(() => {
        const moved = autoCompleteStep();
        if (moved) {
          soundsRef.current.play('place');
        } else {
          setIsAutoCompleting(false);
        }
      }, 100);
    }

    return () => {
      if (autoCompleteIntervalRef.current) {
        clearInterval(autoCompleteIntervalRef.current);
        autoCompleteIntervalRef.current = null;
      }
    };
  }, [isAutoCompleting, gameState.isWon, autoCompleteStep]);

  // Handle stock click - draw or reset
  const handleStockClick = useCallback(() => {
    const currentState = gameStateRef.current;
    if (currentState.stock.cards.length === 0) {
      if (currentState.waste.cards.length > 0) {
        resetWaste();
        soundsRef.current.play('draw');
      }
    } else {
      draw();
      soundsRef.current.play('draw');
    }
  }, [draw, resetWaste]);

  // Handle card click (for click-to-select-then-click-to-move)
  const handleCardClick = useCallback((location: CardLocation) => {
    const currentState = gameStateRef.current;
    const pile = getPile(currentState, location);
    if (!pile) return;

    const card = pile.cards[location.cardIndex];
    
    // Handle clicking on face-down cards in tableau
    if (!card?.faceUp) {
      // Only flip if it's the top card of a tableau pile
      if (pile.type === 'tableau' && location.cardIndex === pile.cards.length - 1) {
        flipCard(location.pileIndex);
        soundsRef.current.play('flip');
      }
      return;
    }

    setSelectedCard(prev => {
      if (prev) {
        // Try to move selected cards to this location
        const sourcePile = getPile(currentState, prev);
        if (!sourcePile) return null;

        const cardCount = sourcePile.cards.length - prev.cardIndex;
        const destLocation: CardLocation = {
          ...location,
          cardIndex: pile.cards.length,
        };

        const result = moveRef.current(prev, destLocation, cardCount);
        if (result.success) {
          soundsRef.current.play('place');
        }
        return null;
      } else {
        // Select this card
        if (canPickUpCards(pile, location.cardIndex)) {
          soundsRef.current.play('flip');
          return location;
        }
        return null;
      }
    });
  }, [flipCard]);

  // Handle card double-click (auto-move to foundation or King to empty)
  const handleCardDoubleClick = useCallback((location: CardLocation) => {
    if (options.doubleClickEnabled === false) return;

    // Check if auto-move is possible before attempting
    const destination = canAutoMove(gameStateRef.current, location);
    if (destination) {
      autoMove(location);
      soundsRef.current.play('place');
      setSelectedCard(null);
    }
  }, [autoMove, options.doubleClickEnabled]);

  // Handle pointer down for drag
  const handleCardPointerDown = useCallback((
    event: React.PointerEvent,
    location: CardLocation,
    element: HTMLElement
  ) => {
    const pile = getPile(gameStateRef.current, location);
    if (!pile) return;

    const card = pile.cards[location.cardIndex];
    if (!card?.faceUp) return;

    if (!canPickUpCards(pile, location.cardIndex)) return;

    const cardCount = pile.cards.length - location.cardIndex;
    startDrag(event, location, cardCount, element);
  }, [startDrag]);

  // Handle auto-complete button
  const handleAutoComplete = useCallback(() => {
    setIsAutoCompleting(true);
  }, []);

  // Handle test victory button
  const handleTestVictory = useCallback(() => {
    triggerWin();
    setShowVictory(true);
  }, [triggerWin]);

  // Handle new game from game over screen
  const handleNewGameFromOverlay = useCallback(() => {
    newGame();
    setShowVictory(false);
    setSelectedCard(null);
    setIsAutoCompleting(false);
    setLaunchedCardIds(new Set());
  }, [newGame]);

  // Handle victory animation complete
  const handleVictoryComplete = useCallback(() => {
    // Could show a "play again" dialog here
  }, []);

  // Handle victory bounce sound with randomized pitch/volume
  const handleVictoryBounce = useCallback((options?: { playbackRate?: number; volume?: number }) => {
    soundsRef.current.play('bounce', options);
  }, []);

  // Handle victory flip sound
  const handleVictoryFlip = useCallback(() => {
    soundsRef.current.play('flip');
  }, []);

  // Calculate minimum dimensions
  const cardWidth = theme.card.width * scale;
  const cardHeight = theme.card.height * scale;
  const gap = theme.spacing.pileGap * scale;
  const padding = theme.spacing.tablePadding * scale;
  
  const minWidth = (cardWidth * 7) + (gap * 6) + (padding * 2);
  const minHeight = (cardHeight * 3) + (gap * 2) + (padding * 2) + 40; // +40 for status bar

  // Get cards being dragged
  const draggedCards = useMemo(() => {
    if (!dragState.isDragging || !dragState.source) return [];
    const pile = getPile(gameState, dragState.source);
    if (!pile) return [];
    return pile.cards.slice(dragState.source.cardIndex);
  }, [dragState.isDragging, dragState.source, gameState]);

  // Check if auto-complete is available
  const canDoAutoComplete = canAutoComplete(gameState) && !isAutoCompleting && !gameState.isWon;

  // Check if there are no valid moves remaining (game over)
  const isGameOver = !gameState.isWon && !hasValidMoves(gameState);

  // Check if drawing from stock is allowed (for empty stock indicator)
  // True if there are waste cards to recycle, and unlimited passes is allowed
  const canDrawFromStock = gameState.waste.cards.length > 0 && 
    (gameState.config.unlimitedPasses || gameState.stockPasses < 3);

  // isValidDropTarget callback for Table - use ref for current drag state
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;
  
  const isValidDropTarget = useCallback((loc: CardLocation) => {
    const currentDragState = dragStateRef.current;
    if (!currentDragState.source) return false;
    const pile = getPile(gameStateRef.current, currentDragState.source);
    if (!pile) return false;
    const cardCount = pile.cards.length - currentDragState.source.cardIndex;
    return isValidMove(gameStateRef.current, currentDragState.source, loc, cardCount);
  }, []);

  return (
    <SolitaireContainer
      ref={containerRef}
      $width={minWidth}
      $height={minHeight}
      className={className}
    >
      <Table
        gameState={gameState}
        theme={theme}
        selectedCard={selectedCard}
        dropTarget={currentDropTarget?.location}
        isValidDropTarget={isValidDropTarget}
        onStockClick={handleStockClick}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        onCardPointerDown={handleCardPointerDown}
        registerDropTarget={registerDropTarget}
        unregisterDropTarget={unregisterDropTarget}
        scale={scale}
        hiddenCardIds={launchedCardIds}
        canDrawFromStock={canDrawFromStock}
      />

      {/* Drag layer */}
      {dragState.isDragging && draggedCards.length > 0 && (
        <DragLayer>
          <DraggedCardsContainer
            $x={dragState.currentX - dragState.offsetX}
            $y={dragState.currentY - dragState.offsetY}
          >
            {draggedCards.map((card, index) => (
              <div
                key={card.id}
                style={{
                  position: 'absolute',
                  top: index * theme.spacing.tableauStackedVisible * scale,
                }}
              >
                <Card
                  card={card}
                  theme={theme}
                  scale={scale}
                  isDragging
                />
              </div>
            ))}
          </DraggedCardsContainer>
        </DragLayer>
      )}

      {/* Auto-complete button */}
      <AutoCompleteButton
        $font={theme.typography.uiFont}
        $visible={canDoAutoComplete}
        onClick={handleAutoComplete}
      >
        Auto Complete
      </AutoCompleteButton>

      {/* Test victory button (for development) */}
      {showTestButton && (
        <TestButton
          $font={theme.typography.uiFont}
          onClick={handleTestVictory}
          title="Test victory animation"
        >
          🏆 Test Win
        </TestButton>
      )}

      {/* Game over overlay - no valid moves remaining */}
      {isGameOver && (
        <NoMovesOverlay $font={theme.typography.uiFont}>
          <h2>No Moves Available</h2>
          <p>There are no more valid moves in this game.</p>
          <button onClick={handleNewGameFromOverlay}>New Game</button>
        </NoMovesOverlay>
      )}

      {/* Status bar */}
      <StatusBar
        $font={theme.typography.uiFont}
        $fontSize={theme.typography.uiFontSize}
        $color={theme.colors.text}
        $bgColor="rgba(0, 0, 0, 0.3)"
      >
        <span>Score: {gameState.score}</span>
        <span>Time: {timer.formatted}</span>
        <span>Moves: {gameState.moves}</span>
      </StatusBar>

      {/* Victory animation */}
      {showVictory && (
        <VictoryAnimation
          gameState={gameState}
          theme={theme}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          scale={scale}
          onBounce={handleVictoryBounce}
          onFlip={handleVictoryFlip}
          onComplete={handleVictoryComplete}
          onCardsLaunched={setLaunchedCardIds}
        />
      )}
    </SolitaireContainer>
  );
}

export default Solitaire;
