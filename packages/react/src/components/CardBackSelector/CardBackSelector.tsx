import styled from 'styled-components';

/**
 * Available card back designs
 */
export const CARD_BACKS = [
  { id: 'Back-Pattern1.gif', name: 'Pattern 1' },
  { id: 'Back-Pattern2.gif', name: 'Pattern 2' },
  { id: 'Back-Fishes.gif', name: 'Fishes' },
  { id: 'Back-Aquarium.gif', name: 'Aquarium' },
  { id: 'Back-FlowerBlack.gif', name: 'Flower (Black)' },
  { id: 'Back-FlowerBlue.gif', name: 'Flower (Blue)' },
  { id: 'Back-Robot.gif', name: 'Robot' },
  { id: 'Back-Roses.gif', name: 'Roses' },
  { id: 'Back-Shell.gif', name: 'Shell' },
  { id: 'Back-Castle.gif', name: 'Castle' },
  { id: 'Back-PalmBeach.gif', name: 'Palm Beach' },
  { id: 'Back-CardHand.gif', name: 'Card Hand' },
] as const;

export type CardBackId = typeof CARD_BACKS[number]['id'];

/**
 * CardBackSelector component props
 */
export interface CardBackSelectorProps {
  /** Currently selected card back ID */
  selected: string;
  /** Callback when selection changes */
  onSelect: (cardBackId: string) => void;
  /** Base path to card assets */
  basePath?: string;
  /** Additional class name */
  className?: string;
}

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #c0c0c0;
  border: 2px inset #ffffff;
`;

const SelectorTitle = styled.div`
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const CardBackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;

const CardBackGridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CardBackOption = styled.button<{ $isSelected: boolean }>`
  display: block;
  width: 91px;
  height: 120px;
  padding: 2px;
  border: ${p => p.$isSelected ? '2px solid #000080' : '2px outset #ffffff'};
  background: ${p => p.$isSelected ? '#000080' : '#c0c0c0'};
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    border-color: #000080;
  }
  
  &:active {
    border-style: inset;
  }
`;

const CardBackImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Pixelated rendering for crisp upscaling */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const CardBackName = styled.div`
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 13px;
`;

/**
 * CardBackSelector component
 * Allows users to select from available card back designs
 */
export function CardBackSelector({
  selected,
  onSelect,
  basePath = '/cards',
  className,
}: CardBackSelectorProps) {
  return (
    <SelectorContainer className={className}>
      <CardBackGrid>
        {CARD_BACKS.map((cardBack) => (
          <CardBackGridItem key={cardBack.id}>
            <CardBackOption
              $isSelected={selected === cardBack.id}
              onClick={() => onSelect(cardBack.id)}
              title={cardBack.name}
            >
              <CardBackImage
                src={`${basePath}/${cardBack.id}`}
                alt={cardBack.name}
                draggable={false}
              />
            </CardBackOption>
            <CardBackName>{cardBack.name}</CardBackName>
          </CardBackGridItem>
        ))}
      </CardBackGrid>
    </SelectorContainer>
  );
}

export default CardBackSelector;
