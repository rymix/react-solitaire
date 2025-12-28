import styled from 'styled-components';
import type { SolitaireTheme } from '../../themes/types';
import { formatScore, type ScoringMode } from '@react-solitaire/core';

/**
 * Controls component props
 */
export interface ControlsProps {
  /** Current score */
  score: number;
  /** Number of moves */
  moves: number;
  /** Scoring mode */
  scoringMode: ScoringMode;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether auto-complete is available */
  canAutoComplete: boolean;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** New game handler */
  onNewGame: () => void;
  /** Undo handler */
  onUndo: () => void;
  /** Auto-complete handler */
  onAutoComplete: () => void;
  /** Additional class name */
  className?: string;
}

interface StyledControlsProps {
  $fontFamily: string;
  $fontSize: number;
  $textColor: string;
  $secondaryColor: string;
}

const StyledControls = styled.div<StyledControlsProps>`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: ${p => p.$fontFamily};
  font-size: ${p => p.$fontSize}px;
  color: ${p => p.$textColor};
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4em;
`;

const StatLabel = styled.span<{ $color: string }>`
  color: ${p => p.$color};
  opacity: 0.7;
`;

const StatValue = styled.span`
  font-variant-numeric: tabular-nums;
  min-width: 3em;
`;

const Button = styled.button<{ $fontFamily: string; $fontSize: number; $disabled?: boolean }>`
  font-family: ${p => p.$fontFamily};
  font-size: ${p => p.$fontSize}px;
  padding: 0.4em 0.8em;
  border: 1px solid currentColor;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$disabled ? 0.5 : 1};
  transition: background-color 0.15s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

/**
 * Game controls and stats display
 */
export function Controls({
  score,
  moves,
  scoringMode,
  canUndo,
  canAutoComplete,
  theme,
  onNewGame,
  onUndo,
  onAutoComplete,
  className,
}: ControlsProps) {
  const formattedScore = formatScore(score, scoringMode);

  return (
    <StyledControls
      $fontFamily={theme.typography.uiFont}
      $fontSize={theme.typography.uiFontSize}
      $textColor={theme.colors.text}
      $secondaryColor={theme.colors.textSecondary}
      className={className}
    >
      {scoringMode !== 'none' && (
        <Stat>
          <StatLabel $color={theme.colors.textSecondary}>Score:</StatLabel>
          <StatValue>{formattedScore}</StatValue>
        </Stat>
      )}
      
      <Stat>
        <StatLabel $color={theme.colors.textSecondary}>Moves:</StatLabel>
        <StatValue>{moves}</StatValue>
      </Stat>

      <ButtonGroup>
        <Button
          $fontFamily={theme.typography.uiFont}
          $fontSize={theme.typography.uiFontSize}
          onClick={onUndo}
          disabled={!canUndo}
          $disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </Button>
        
        {canAutoComplete && (
          <Button
            $fontFamily={theme.typography.uiFont}
            $fontSize={theme.typography.uiFontSize}
            onClick={onAutoComplete}
            title="Auto-complete remaining cards"
          >
            Auto
          </Button>
        )}
        
        <Button
          $fontFamily={theme.typography.uiFont}
          $fontSize={theme.typography.uiFontSize}
          onClick={onNewGame}
          title="Start a new game (F2)"
        >
          New Game
        </Button>
      </ButtonGroup>
    </StyledControls>
  );
}

export default Controls;
