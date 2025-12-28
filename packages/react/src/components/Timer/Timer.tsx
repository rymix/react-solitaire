import styled from 'styled-components';
import type { SolitaireTheme } from '../../themes/types';
import { useTimer } from '../../hooks/useTimer';

/**
 * Timer component props
 */
export interface TimerProps {
  /** Game start timestamp */
  startTime: number | null;
  /** Game end timestamp */
  endTime: number | null;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** Additional class name */
  className?: string;
}

interface StyledTimerProps {
  $fontFamily: string;
  $fontSize: number;
  $textColor: string;
}

const StyledTimer = styled.div<StyledTimerProps>`
  font-family: ${p => p.$fontFamily};
  font-size: ${p => p.$fontSize}px;
  color: ${p => p.$textColor};
  font-variant-numeric: tabular-nums;
  min-width: 4em;
  text-align: center;
`;

const Label = styled.span`
  opacity: 0.7;
  margin-right: 0.5em;
`;

/**
 * Timer display component
 */
export function Timer({ startTime, endTime, theme, className }: TimerProps) {
  const { formatted } = useTimer({ startTime, endTime });

  return (
    <StyledTimer
      $fontFamily={theme.typography.uiFont}
      $fontSize={theme.typography.uiFontSize}
      $textColor={theme.colors.text}
      className={className}
    >
      <Label>Time:</Label>
      {formatted}
    </StyledTimer>
  );
}

export default Timer;
