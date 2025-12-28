import React, { forwardRef } from 'react';
import styled from 'styled-components';
import type { GameState, CardLocation } from '@react-solitaire/core';
import type { SolitaireTheme } from '../../themes/types';
import { Pile } from '../Pile';

/**
 * Table component props
 */
export interface TableProps {
  /** Current game state */
  gameState: GameState;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** Currently selected card location */
  selectedCard?: CardLocation | null;
  /** Current drop target location */
  dropTarget?: CardLocation | null;
  /** Check if a location is a valid drop target */
  isValidDropTarget?: (location: CardLocation) => boolean;
  /** Click handler for stock pile */
  onStockClick?: () => void;
  /** Click handler for a card */
  onCardClick?: (location: CardLocation) => void;
  /** Double-click handler for a card */
  onCardDoubleClick?: (location: CardLocation) => void;
  /** Pointer down handler for drag start */
  onCardPointerDown?: (event: React.PointerEvent, location: CardLocation, element: HTMLElement) => void;
  /** Register drop target */
  registerDropTarget?: (location: CardLocation, element: HTMLElement) => void;
  /** Unregister drop target */
  unregisterDropTarget?: (location: CardLocation) => void;
  /** Scale factor */
  scale?: number;
  /** Additional class name */
  className?: string;
  /** Card IDs to hide (for victory animation) */
  hiddenCardIds?: Set<string>;
  /** Whether more draws from stock are allowed */
  canDrawFromStock?: boolean;
}

interface StyledTableProps {
  $tableColor: string;
  $padding: number;
  $pileGap: number;
  $scale: number;
}

const StyledTable = styled.div<StyledTableProps>`
  display: flex;
  flex-direction: column;
  gap: ${p => p.$pileGap * p.$scale * 1.5}px;
  padding: ${p => p.$padding * p.$scale}px;
  background-color: ${p => p.$tableColor};
  min-height: 100%;
  box-sizing: border-box;
`;

const TopRow = styled.div<{ $gap: number; $scale: number }>`
  display: flex;
  gap: ${p => p.$gap * p.$scale}px;
  justify-content: space-between;
`;

const StockWasteArea = styled.div<{ $gap: number; $scale: number }>`
  display: flex;
  gap: ${p => p.$gap * p.$scale}px;
`;

const FoundationsArea = styled.div<{ $gap: number; $scale: number }>`
  display: flex;
  gap: ${p => p.$gap * p.$scale}px;
`;

const TableauRow = styled.div<{ $gap: number; $scale: number }>`
  display: flex;
  gap: ${p => p.$gap * p.$scale}px;
  justify-content: flex-start;
  flex: 1;
`;

/**
 * Table component - arranges all piles in the classic Solitaire layout
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  {
    gameState,
    theme,
    selectedCard,
    dropTarget,
    isValidDropTarget,
    onStockClick,
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
  const checkValidDrop = (location: CardLocation) => {
    return isValidDropTarget?.(location) ?? false;
  };

  return (
    <StyledTable
      ref={ref}
      $tableColor={theme.colors.table}
      $padding={theme.spacing.tablePadding}
      $pileGap={theme.spacing.pileGap}
      $scale={scale}
      className={className}
    >
      {/* Top row: Stock, Waste, and Foundations */}
      <TopRow $gap={theme.spacing.pileGap} $scale={scale}>
        <StockWasteArea $gap={theme.spacing.pileGap} $scale={scale}>
          {/* Stock pile */}
          <Pile
            pile={gameState.stock}
            theme={theme}
            location={{ pileType: 'stock', pileIndex: 0 }}
            selectedCard={selectedCard}
            dropTarget={dropTarget}
            scale={scale}
            onPileClick={onStockClick ? () => onStockClick() : undefined}
            onCardClick={onStockClick ? () => onStockClick() : undefined}
            canDrawFromStock={canDrawFromStock}
          />
          
          {/* Waste pile */}
          <Pile
            pile={gameState.waste}
            theme={theme}
            location={{ pileType: 'waste', pileIndex: 0 }}
            selectedCard={selectedCard}
            dropTarget={dropTarget}
            scale={scale}
            onCardClick={onCardClick}
            onCardDoubleClick={onCardDoubleClick}
            onCardPointerDown={onCardPointerDown}
            registerDropTarget={registerDropTarget}
            unregisterDropTarget={unregisterDropTarget}
          />
        </StockWasteArea>

        {/* Foundations */}
        <FoundationsArea $gap={theme.spacing.pileGap} $scale={scale}>
          {gameState.foundations.map((foundation, index) => (
            <Pile
              key={foundation.id}
              pile={foundation}
              theme={theme}
              location={{ pileType: 'foundation', pileIndex: index }}
              selectedCard={selectedCard}
              dropTarget={dropTarget}
              isValidDropTarget={checkValidDrop({ pileType: 'foundation', pileIndex: index, cardIndex: foundation.cards.length })}
              scale={scale}
              onCardClick={onCardClick}
              onCardDoubleClick={onCardDoubleClick}
              onCardPointerDown={onCardPointerDown}
              registerDropTarget={registerDropTarget}
              unregisterDropTarget={unregisterDropTarget}
              hiddenCardIds={hiddenCardIds}
            />
          ))}
        </FoundationsArea>
      </TopRow>

      {/* Tableau row */}
      <TableauRow $gap={theme.spacing.pileGap} $scale={scale}>
        {gameState.tableau.map((tableau, index) => (
          <Pile
            key={tableau.id}
            pile={tableau}
            theme={theme}
            location={{ pileType: 'tableau', pileIndex: index }}
            selectedCard={selectedCard}
            dropTarget={dropTarget}
            isValidDropTarget={checkValidDrop({ pileType: 'tableau', pileIndex: index, cardIndex: tableau.cards.length })}
            scale={scale}
            onCardClick={onCardClick}
            onCardDoubleClick={onCardDoubleClick}
            onCardPointerDown={onCardPointerDown}
            registerDropTarget={registerDropTarget}
            unregisterDropTarget={unregisterDropTarget}
          />
        ))}
      </TableauRow>
    </StyledTable>
  );
});

Table.displayName = 'Table';

export default Table;
