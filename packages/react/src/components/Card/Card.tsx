import React, { forwardRef, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { SUIT_INFO, RANK_INFO, getCardColour, type Card as CardType } from '@react-solitaire/core';
import type { SolitaireTheme } from '../../themes/types';

/**
 * Card component props
 */
export interface CardProps {
  /** The card data */
  card: CardType;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Whether the card is being dragged */
  isDragging?: boolean;
  /** Whether this is a valid drop target */
  isValidDrop?: boolean;
  /** Z-index for stacking */
  zIndex?: number;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Double-click handler */
  onDoubleClick?: (event: React.MouseEvent) => void;
  /** Pointer down handler (for drag start) */
  onPointerDown?: (event: React.PointerEvent) => void;
  /** Additional class name */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Scale factor for the card */
  scale?: number;
}

interface StyledCardProps {
  $width: number;
  $height: number;
  $borderRadius: number;
  $borderWidth: number;
  $shadow: string;
  $dragShadow: string;
  $faceUp: boolean;
  $isSelected: boolean;
  $isDragging: boolean;
  $isValidDrop: boolean;
  $cardBack: string;
  $cardFace: string;
  $cardBorder: string;
  $highlight: string;
  $validDropColor: string;
  $scale: number;
  $flipDuration: number;
  $useAssets: boolean;
}

const StyledCard = styled.div<StyledCardProps>`
  position: relative;
  width: ${p => p.$width * p.$scale}px;
  height: ${p => p.$height * p.$scale}px;
  border-radius: ${p => p.$borderRadius * p.$scale}px;
  border: ${p => p.$useAssets ? 'none' : `${p.$borderWidth}px solid ${p.$cardBorder}`};
  background-color: ${p => p.$useAssets ? 'transparent' : (p.$faceUp ? p.$cardFace : p.$cardBack)};
  box-shadow: ${p => p.$isDragging ? p.$dragShadow : p.$shadow};
  cursor: ${p => p.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  touch-action: none;
  transition: box-shadow 0.15s ease;
  overflow: hidden;
  
  ${p => p.$isSelected && css`
    outline: 2px solid ${p.$highlight};
    outline-offset: 1px;
  `}
  
  ${p => p.$isValidDrop && css`
    outline: 2px solid ${p.$validDropColor};
    outline-offset: 1px;
  `}
  
  ${p => p.$isDragging && css`
    opacity: 0.9;
    z-index: 1000;
  `}
  
  &:hover {
    box-shadow: ${p => p.$dragShadow};
  }
`;

const CardImage = styled.img<{ $scale: number }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Pixelated rendering for crisp upscaling */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  pointer-events: none;
  display: block;
`;

const CardFace = styled.div<{ $scale: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: ${p => 3 * p.$scale}px;
  overflow: hidden;
`;

const CornerInfo = styled.div<{ 
  $colour: string; 
  $fontSize: number;
  $fontFamily: string;
  $scale: number;
  $position: 'top-left' | 'bottom-right';
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  color: ${p => p.$colour};
  font-family: ${p => p.$fontFamily};
  font-size: ${p => p.$fontSize * p.$scale}px;
  font-weight: bold;
  
  ${p => p.$position === 'top-left' && css`
    top: ${3 * p.$scale}px;
    left: ${3 * p.$scale}px;
  `}
  
  ${p => p.$position === 'bottom-right' && css`
    bottom: ${3 * p.$scale}px;
    right: ${3 * p.$scale}px;
    transform: rotate(180deg);
  `}
`;

const CenterSuit = styled.div<{ $colour: string; $fontSize: number; $scale: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${p => p.$fontSize * 2 * p.$scale}px;
  color: ${p => p.$colour};
  opacity: 0.9;
`;

// Card back pattern component (CSS fallback)
const CardBackPattern = styled.div<{ 
  $pattern: string;
  $primaryColor: string;
  $secondaryColor?: string;
  $scale: number;
}>`
  position: absolute;
  inset: ${p => 3 * p.$scale}px;
  border-radius: ${p => 2 * p.$scale}px;
  overflow: hidden;
  
  ${p => p.$pattern === 'crosshatch' && css`
    background: 
      repeating-linear-gradient(
        45deg,
        ${p.$primaryColor} 0,
        ${p.$primaryColor} 1px,
        transparent 1px,
        transparent 6px
      ),
      repeating-linear-gradient(
        -45deg,
        ${p.$primaryColor} 0,
        ${p.$primaryColor} 1px,
        ${p.$secondaryColor || p.$primaryColor} 1px,
        ${p.$secondaryColor || p.$primaryColor} 6px
      );
  `}
  
  ${p => p.$pattern === 'diamonds' && css`
    background: 
      linear-gradient(135deg, ${p.$primaryColor} 25%, transparent 25%) -10px 0,
      linear-gradient(225deg, ${p.$primaryColor} 25%, transparent 25%) -10px 0,
      linear-gradient(315deg, ${p.$primaryColor} 25%, transparent 25%),
      linear-gradient(45deg, ${p.$primaryColor} 25%, transparent 25%);
    background-size: 20px 20px;
    background-color: ${p.$secondaryColor || p.$primaryColor};
  `}
`;

/**
 * Get the image filename for a card
 */
function getCardImageFilename(card: CardType): string {
  // Map suit names to filename prefixes
  const suitMap: Record<string, string> = {
    hearts: 'Heart',
    diamonds: 'Diamond',
    clubs: 'Club',
    spades: 'Spade',
  };
  
  const suitPrefix = suitMap[card.suit];
  return `${suitPrefix}-${card.rank}.gif`;
}

/**
 * Card component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    card,
    theme,
    isSelected = false,
    isDragging = false,
    isValidDrop = false,
    zIndex,
    onClick,
    onDoubleClick,
    onPointerDown,
    className,
    style,
    scale = 1,
  },
  ref
) {
  const colour = useMemo(() => getCardColour(card), [card]);
  const suitInfo = SUIT_INFO[card.suit];
  const rankInfo = RANK_INFO[card.rank];
  
  const suitColour = colour === 'red' ? theme.colors.redSuit : theme.colors.blackSuit;
  
  const useAssets = theme.assets?.enabled ?? false;
  const basePath = theme.assets?.basePath ?? '/cards';
  
  // Get image URLs
  const cardFaceUrl = useMemo(() => {
    if (!useAssets) return '';
    return `${basePath}/${getCardImageFilename(card)}`;
  }, [useAssets, basePath, card]);
  
  const cardBackUrl = useMemo(() => {
    if (!useAssets) return '';
    return `${basePath}/${theme.assets?.cardBack ?? 'Back-Pattern1.gif'}`;
  }, [useAssets, basePath, theme.assets?.cardBack]);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  }, [onClick]);
  
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(e);
  }, [onDoubleClick]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onPointerDown?.(e);
  }, [onPointerDown]);

  // Render with image assets
  if (useAssets) {
    return (
      <StyledCard
        ref={ref}
        $width={theme.card.width}
        $height={theme.card.height}
        $borderRadius={theme.card.borderRadius}
        $borderWidth={theme.card.borderWidth}
        $shadow={theme.card.shadow}
        $dragShadow={theme.card.dragShadow}
        $faceUp={card.faceUp}
        $isSelected={isSelected}
        $isDragging={isDragging}
        $isValidDrop={isValidDrop}
        $cardBack={theme.colors.cardBack}
        $cardFace={theme.colors.cardFace}
        $cardBorder={theme.colors.cardBorder}
        $highlight={theme.colors.highlight}
        $validDropColor={theme.colors.validDrop}
        $scale={scale}
        $flipDuration={theme.animation.flip}
        $useAssets={true}
        className={className}
        style={{ ...style, zIndex }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        data-card-id={card.id}
      >
        <CardImage
          src={card.faceUp ? cardFaceUrl : cardBackUrl}
          alt={card.faceUp ? `${rankInfo.name} of ${suitInfo.name}` : 'Card back'}
          $scale={scale}
          draggable={false}
        />
      </StyledCard>
    );
  }

  // Render with CSS (fallback)
  return (
    <StyledCard
      ref={ref}
      $width={theme.card.width}
      $height={theme.card.height}
      $borderRadius={theme.card.borderRadius}
      $borderWidth={theme.card.borderWidth}
      $shadow={theme.card.shadow}
      $dragShadow={theme.card.dragShadow}
      $faceUp={card.faceUp}
      $isSelected={isSelected}
      $isDragging={isDragging}
      $isValidDrop={isValidDrop}
      $cardBack={theme.colors.cardBack}
      $cardFace={theme.colors.cardFace}
      $cardBorder={theme.colors.cardBorder}
      $highlight={theme.colors.highlight}
      $validDropColor={theme.colors.validDrop}
      $scale={scale}
      $flipDuration={theme.animation.flip}
      $useAssets={false}
      className={className}
      style={{ ...style, zIndex }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      data-card-id={card.id}
    >
      {card.faceUp ? (
        <CardFace $scale={scale}>
          <CornerInfo
            $colour={suitColour}
            $fontSize={theme.typography.cardFontSize}
            $fontFamily={theme.typography.cardFont}
            $scale={scale}
            $position="top-left"
          >
            <span>{rankInfo.symbol}</span>
            <span>{suitInfo.symbol}</span>
          </CornerInfo>
          
          <CenterSuit
            $colour={suitColour}
            $fontSize={theme.typography.cardFontSize}
            $scale={scale}
          >
            {suitInfo.symbol}
          </CenterSuit>
          
          <CornerInfo
            $colour={suitColour}
            $fontSize={theme.typography.cardFontSize}
            $fontFamily={theme.typography.cardFont}
            $scale={scale}
            $position="bottom-right"
          >
            <span>{rankInfo.symbol}</span>
            <span>{suitInfo.symbol}</span>
          </CornerInfo>
        </CardFace>
      ) : (
        <CardBackPattern
          $pattern={theme.cardBack.pattern || 'crosshatch'}
          $primaryColor={theme.colors.cardBack}
          $secondaryColor={theme.colors.cardBackPattern}
          $scale={scale}
        />
      )}
    </StyledCard>
  );
});

Card.displayName = 'Card';

export default Card;
