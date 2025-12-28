// Components
export {
  Card,
  type CardProps,
  Pile,
  type PileProps,
  Table,
  type TableProps,
  Timer,
  type TimerProps,
  Controls,
  type ControlsProps,
  Solitaire,
  type SolitaireProps,
  VictoryAnimation,
  type VictoryAnimationProps,
  CardBackSelector,
  CARD_BACKS,
  type CardBackSelectorProps,
  type CardBackId,
} from './components';

// Hooks
export {
  useGame,
  type UseGameOptions,
  type UseGameReturn,
  useDrag,
  type DragState,
  type DropTarget,
  type UseDragOptions,
  type UseDragReturn,
  useTimer,
  useStopwatch,
  type TimerState,
  type UseTimerOptions,
  useSounds,
  defaultSoundConfig,
  type SoundEffect,
  type UseSoundsReturn,
} from './hooks';

// Themes
export {
  type SolitaireTheme,
  type SoundConfig,
  type SolitaireOptions,
  win31Theme,
  defaultTheme,
} from './themes';

// Re-export useful types from core
export type {
  Card as CardData,
  Pile as PileData,
  GameState,
  GameConfig,
  CardLocation,
  Suit,
  Rank,
  DrawMode,
  ScoringMode,
} from '@react-solitaire/core';
