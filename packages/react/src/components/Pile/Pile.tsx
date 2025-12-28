import React, { forwardRef, useCallback, useMemo, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { type Pile as PileType, type CardLocation, SUIT_INFO } from '@react-solitaire/core';
import type { SolitaireTheme } from '../../themes/types';
import { Card } from '../Card';

/**
 * Pile component props
 */
export interface PileProps {
  /** The pile data */
  pile: PileType;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** Location of this pile */
  location: Omit<CardLocation, 'cardIndex'>;
  /** Currently selected card location */
  selectedCard?: CardLocation | null;
  /** Current drop target location */
  dropTarget?: CardLocation | null;
  /** Whether the pile is a valid drop target */
  isValidDropTarget?: boolean;
  /** Click handler for the pile (empty area) */
  onPileClick?: (location: CardLocation) => void;
  /** Click handler for a card */
  onCardClick?: (location: CardLocation) => void;
  /** Double-click handler for a card */
  onCardDoubleClick?: (location: CardLocation) => void;
  /** Pointer down handler for a card (drag start) */
  onCardPointerDown?: (event: React.PointerEvent, location: CardLocation, element: HTMLElement) => void;
  /** Register as drop target */
  registerDropTarget?: (location: CardLocation, element: HTMLElement) => void;
  /** Unregister as drop target */
  unregisterDropTarget?: (location: CardLocation) => void;
  /** Scale factor */
  scale?: number;
  /** Additional class name */
  className?: string;
  /** Card IDs to hide (for victory animation) */
  hiddenCardIds?: Set<string>;
  /** Whether drawing from stock is allowed (for empty stock indicator) */
  canDrawFromStock?: boolean;
}

interface StyledPileProps {
  $width: number;
  $height: number;
  $borderRadius: number;
  $emptyPileColor: string;
  $emptyPileBorder: string;
  $isValidDrop: boolean;
  $validDropColor: string;
  $scale: number;
  $pileType: PileType['type'];
}

const StyledPile = styled.div<StyledPileProps>`
  position: relative;
  width: ${p => p.$width * p.$scale}px;
  min-height: ${p => p.$height * p.$scale}px;
  
  ${p => p.$pileType !== 'tableau' && css`
    height: ${p.$height * p.$scale}px;
  `}
`;

// Invisible drop zone that covers the entire column for better drop detection
const DropZone = styled.div<{ $isValidDrop: boolean; $validDropColor: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  z-index: 0;
  pointer-events: none;
  
  ${p => p.$isValidDrop && css`
    border: 3px solid ${p.$validDropColor};
    border-radius: 4px;
    background-color: ${p.$validDropColor}22;
    pointer-events: auto;
  `}
`;

const EmptyPileIndicator = styled.div<StyledPileProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${p => p.$width * p.$scale}px;
  height: ${p => p.$height * p.$scale}px;
  border-radius: ${p => p.$borderRadius * p.$scale}px;
  background-color: ${p => p.$emptyPileColor};
  border: 2px dashed ${p => p.$emptyPileBorder};
  
  ${p => p.$isValidDrop && css`
    border-color: ${p.$validDropColor};
    background-color: ${p.$validDropColor}33;
  `}
`;

const EmptyPileImage = styled.img<{ $scale: number; $isValidDrop: boolean; $validDropColor: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Pixelated rendering for crisp upscaling */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  pointer-events: none;
  
  ${p => p.$isValidDrop && css`
    outline: 2px solid ${p.$validDropColor};
    outline-offset: -2px;
  `}
`;

const FoundationSuit = styled.div<{ $colour: string; $fontSize: number; $scale: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${p => p.$fontSize * 2.5 * p.$scale}px;
  color: ${p => p.$colour};
  opacity: 0.4;
  pointer-events: none;
`;

const StockIndicator = styled.div<{ $fontSize: number; $textColor: string; $scale: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${p => p.$fontSize * p.$scale}px;
  color: ${p => p.$textColor};
  opacity: 0.6;
  pointer-events: none;
`;

interface CardWrapperProps {
  $top: number;
  $left: number;
  $zIndex: number;
}

const CardWrapper = styled.div<CardWrapperProps>`
  position: absolute;
  top: ${p => p.$top}px;
  left: ${p => p.$left}px;
  z-index: ${p => p.$zIndex};
`;

/**
 * Get the foundation suit indicator for empty foundations
 */
function getFoundationSuitIndicator(pileIndex: number): { symbol: string; colour: 'red' | 'black' } {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  const suit = suits[pileIndex];
  return {
    symbol: SUIT_INFO[suit].symbol,
    colour: SUIT_INFO[suit].colour,
  };
}

/**
 * Pile component
 */
export const Pile = forwardRef<HTMLDivElement, PileProps>(function Pile(
  {
    pile,
    theme,
    location,
    selectedCard,
    dropTarget,
    isValidDropTarget = false,
    onPileClick,
    onCardClick,
    onCardDoubleClick,
    onCardPointerDown,
    registerDropTarget,
    unregisterDropTarget,
    scale = 1,
    className,
    hiddenCardIds,
    canDrawFromStock = true,
  },
  ref
) {
  const pileRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const useAssets = theme.assets?.enabled ?? false;
  const basePath = theme.assets?.basePath ?? '/cards';

  // Register pile as drop target - use the full pile container
  useEffect(() => {
    // Use pileRef for the main container (for non-tableau) or dropZoneRef for tableau
    const targetElement = pile.type === 'tableau' ? dropZoneRef.current : pileRef.current;
    if (!targetElement) return;
    
    // Don't register stock or waste as drop targets
    if (pile.type === 'stock' || pile.type === 'waste') return;
    
    const dropLocation: CardLocation = {
      ...location,
      cardIndex: pile.cards.length,
    };
    
    registerDropTarget?.(dropLocation, targetElement);
    
    return () => {
      unregisterDropTarget?.(dropLocation);
    };
  }, [location, pile.cards.length, pile.type, registerDropTarget, unregisterDropTarget]);

  // Calculate card positions
  const cardPositions = useMemo(() => {
    return pile.cards.map((_, index) => {
      let top = 0;
      let left = 0;

      if (pile.type === 'tableau') {
        // Stack vertically with offset based on face up/down
        for (let i = 0; i < index; i++) {
          const prevCard = pile.cards[i];
          if (prevCard.faceUp) {
            top += theme.spacing.tableauStackedVisible * scale;
          } else {
            top += theme.spacing.tableauStackedHidden * scale;
          }
        }
      } else if (pile.type === 'waste') {
        // Show last 3 cards with horizontal offset
        const visibleCount = Math.min(3, pile.cards.length);
        const startIndex = pile.cards.length - visibleCount;
        if (index >= startIndex) {
          left = (index - startIndex) * theme.spacing.wasteOffset * scale;
        }
      }
      // Foundation and stock don't stack visually

      return { top, left, visible: pile.type !== 'waste' || index >= pile.cards.length - 3 };
    });
  }, [pile.cards, pile.type, theme.spacing, scale]);

  const handlePileClick = useCallback(() => {
    const cardLocation: CardLocation = {
      ...location,
      cardIndex: pile.cards.length, // Point to where next card would go
    };
    onPileClick?.(cardLocation);
  }, [location, pile.cards.length, onPileClick]);

  const handleCardClick = useCallback((cardIndex: number) => {
    const cardLocation: CardLocation = { ...location, cardIndex };
    onCardClick?.(cardLocation);
  }, [location, onCardClick]);

  const handleCardDoubleClick = useCallback((cardIndex: number) => {
    const cardLocation: CardLocation = { ...location, cardIndex };
    onCardDoubleClick?.(cardLocation);
  }, [location, onCardDoubleClick]);

  const handleCardPointerDown = useCallback((event: React.PointerEvent, cardIndex: number) => {
    const element = cardRefs.current.get(cardIndex);
    if (!element) return;
    
    const cardLocation: CardLocation = { ...location, cardIndex };
    onCardPointerDown?.(event, cardLocation, element);
  }, [location, onCardPointerDown]);

  const isCardSelected = useCallback((cardIndex: number) => {
    if (!selectedCard) return false;
    return (
      selectedCard.pileType === location.pileType &&
      selectedCard.pileIndex === location.pileIndex &&
      selectedCard.cardIndex === cardIndex
    );
  }, [selectedCard, location]);

  const isDropTargetCard = useCallback((cardIndex: number) => {
    if (!dropTarget || !isValidDropTarget) return false;
    return (
      dropTarget.pileType === location.pileType &&
      dropTarget.pileIndex === location.pileIndex &&
      cardIndex === pile.cards.length - 1 // Only highlight top card
    );
  }, [dropTarget, isValidDropTarget, location, pile.cards.length]);

  // Determine if the empty pile should show as drop target
  const showEmptyAsDropTarget = isValidDropTarget && pile.cards.length === 0 && dropTarget && 
    dropTarget.pileType === location.pileType && 
    dropTarget.pileIndex === location.pileIndex;

  // Determine if the entire pile should show as a valid drop target (for tableau with cards)
  const showPileAsDropTarget = isValidDropTarget && pile.cards.length > 0 && dropTarget &&
    dropTarget.pileType === location.pileType &&
    dropTarget.pileIndex === location.pileIndex &&
    (pile.type === 'tableau' || pile.type === 'foundation');

  return (
    <StyledPile
      ref={ref}
      $width={theme.card.width}
      $height={theme.card.height}
      $borderRadius={theme.card.borderRadius}
      $emptyPileColor={theme.colors.emptyPile}
      $emptyPileBorder={theme.colors.emptyPileBorder}
      $isValidDrop={Boolean(showEmptyAsDropTarget)}
      $validDropColor={theme.colors.validDrop}
      $scale={scale}
      $pileType={pile.type}
      className={className}
    >
      {/* Drop zone for tableau - covers entire column for better drop detection */}
      {pile.type === 'tableau' && (
        <DropZone
          ref={dropZoneRef}
          $isValidDrop={Boolean(showPileAsDropTarget || showEmptyAsDropTarget)}
          $validDropColor={theme.colors.validDrop}
        />
      )}

      {/* Drop target for foundations - always present for drop detection */}
      {useAssets && pile.type === 'foundation' && (
        <div
          ref={pileRef}
          onClick={handlePileClick}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: theme.card.width * scale, 
            height: theme.card.height * scale,
            zIndex: 0,
          }}
        >
          {/* Only show empty indicator image when no cards */}
          {pile.cards.length === 0 && (
            <EmptyPileImage
              src={`${basePath}/${theme.assets?.foundationEmpty ?? 'Space-Vacant.gif'}`}
              alt="Empty foundation"
              $scale={scale}
              $isValidDrop={Boolean(showEmptyAsDropTarget)}
              $validDropColor={theme.colors.validDrop}
            />
          )}
        </div>
      )}

      {/* Empty pile indicator - Image-based (stock and tableau only) */}
      {useAssets && pile.cards.length === 0 && pile.type !== 'foundation' && (
        <div
          ref={pile.type === 'stock' ? pileRef : undefined}
          onClick={handlePileClick}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: theme.card.width * scale, 
            height: theme.card.height * scale,
            cursor: pile.type === 'stock' ? 'pointer' : 'default',
          }}
        >
          {/* Stock empty indicator */}
          {pile.type === 'stock' && (
            <EmptyPileImage
              src={`${basePath}/${canDrawFromStock ? theme.assets?.stockEmpty ?? 'Space-Yes.gif' : theme.assets?.stockDisabled ?? 'Space-No.gif'}`}
              alt={canDrawFromStock ? 'Click to recycle' : 'No more draws'}
              $scale={scale}
              $isValidDrop={false}
              $validDropColor={theme.colors.validDrop}
            />
          )}
          
          {/* Tableau empty - just use vacant space */}
          {pile.type === 'tableau' && (
            <EmptyPileImage
              src={`${basePath}/${theme.assets?.foundationEmpty ?? 'Space-Vacant.gif'}`}
              alt="Empty column"
              $scale={scale}
              $isValidDrop={Boolean(showEmptyAsDropTarget)}
              $validDropColor={theme.colors.validDrop}
            />
          )}
        </div>
      )}

      {/* Empty pile indicator - CSS fallback */}
      {!useAssets && (
        <EmptyPileIndicator
          ref={pileRef}
          $width={theme.card.width}
          $height={theme.card.height}
          $borderRadius={theme.card.borderRadius}
          $emptyPileColor={theme.colors.emptyPile}
          $emptyPileBorder={theme.colors.emptyPileBorder}
          $isValidDrop={Boolean(showEmptyAsDropTarget)}
          $validDropColor={theme.colors.validDrop}
          $scale={scale}
          $pileType={pile.type}
          onClick={handlePileClick}
        >
          {/* Foundation suit indicator */}
          {pile.type === 'foundation' && pile.cards.length === 0 && (
            <FoundationSuit
              $colour={
                getFoundationSuitIndicator(location.pileIndex).colour === 'red'
                  ? theme.colors.redSuit
                  : theme.colors.blackSuit
              }
              $fontSize={theme.typography.cardFontSize}
              $scale={scale}
            >
              {getFoundationSuitIndicator(location.pileIndex).symbol}
            </FoundationSuit>
          )}
          
          {/* Stock recycle indicator */}
          {pile.type === 'stock' && pile.cards.length === 0 && (
            <StockIndicator
              $fontSize={theme.typography.uiFontSize}
              $textColor={theme.colors.textSecondary}
              $scale={scale}
            >
              ↺
            </StockIndicator>
          )}
        </EmptyPileIndicator>
      )}

      {/* Cards */}
      {pile.cards.map((card, index) => {
        const position = cardPositions[index];
        if (!position.visible) return null;
        
        // Hide cards that are being animated (victory animation)
        if (hiddenCardIds?.has(card.id)) return null;

        return (
          <CardWrapper
            key={card.id}
            ref={el => {
              if (el) cardRefs.current.set(index, el);
              else cardRefs.current.delete(index);
            }}
            $top={position.top}
            $left={position.left}
            $zIndex={index + 1}
          >
            <Card
              card={card}
              theme={theme}
              isSelected={isCardSelected(index)}
              isValidDrop={isDropTargetCard(index)}
              scale={scale}
              onClick={() => handleCardClick(index)}
              onDoubleClick={() => handleCardDoubleClick(index)}
              onPointerDown={(e) => handleCardPointerDown(e, index)}
            />
          </CardWrapper>
        );
      })}
    </StyledPile>
  );
});

Pile.displayName = 'Pile';

export default Pile;
