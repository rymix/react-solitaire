import type { SolitaireTheme } from './types';

/**
 * Windows 3.1 Solitaire theme
 * Faithful recreation of the classic look and feel
 */
export const win31Theme: SolitaireTheme = {
  name: 'Windows 3.1',

  colors: {
    // The classic green felt
    table: '#008000',
    // Cream/white card face
    cardFace: '#FFFFFF',
    // Classic blue card back
    cardBack: '#0000AA',
    cardBackPattern: '#000080',
    // Suit colours
    redSuit: '#FF0000',
    blackSuit: '#000000',
    // Card styling
    cardBorder: '#000000',
    // Empty pile styling (darker green with dashed outline)
    emptyPile: 'rgba(0, 64, 0, 0.5)',
    emptyPileBorder: 'rgba(0, 100, 0, 0.8)',
    // Highlights
    highlight: 'rgba(255, 255, 0, 0.3)',
    validDrop: 'rgba(0, 255, 0, 0.3)',
    // Text
    text: '#FFFFFF',
    textSecondary: '#C0C0C0',
  },

  card: {
    // Windows 3.1 used 71x96 pixel cards
    // We'll scale up for modern displays
    width: 71,
    height: 96,
    borderRadius: 3,
    borderWidth: 1,
    shadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    dragShadow: '4px 4px 8px rgba(0, 0, 0, 0.4)',
  },

  spacing: {
    // Tight stacking for hidden cards
    tableauStackedHidden: 4,
    // More visible stacking for face-up cards
    tableauStackedVisible: 18,
    // Offset for draw-three waste display
    wasteOffset: 14,
    // Gap between piles
    pileGap: 12,
    // Table padding
    tablePadding: 16,
  },

  animation: {
    flip: 150,
    move: 200,
    victoryDelay: 50,
    victoryBounce: 400,
  },

  typography: {
    // Classic Windows font
    cardFont: '"MS Sans Serif", "Segoe UI", Arial, sans-serif',
    cardFontSize: 14,
    uiFont: '"MS Sans Serif", "Segoe UI", Arial, sans-serif',
    uiFontSize: 12,
  },

  cardBack: {
    type: 'pattern',
    pattern: 'crosshatch',
  },
};

export { win31Theme as defaultTheme };
