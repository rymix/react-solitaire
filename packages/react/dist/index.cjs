'use strict';

var React4 = require('react');
var styled2 = require('styled-components');
var core = require('@react-solitaire/core');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React4__default = /*#__PURE__*/_interopDefault(React4);
var styled2__default = /*#__PURE__*/_interopDefault(styled2);

// src/components/Card/Card.tsx
var StyledCard = styled2__default.default.div`
  position: relative;
  width: ${(p) => p.$width * p.$scale}px;
  height: ${(p) => p.$height * p.$scale}px;
  border-radius: ${(p) => p.$borderRadius * p.$scale}px;
  border: ${(p) => p.$useAssets ? "none" : `${p.$borderWidth}px solid ${p.$cardBorder}`};
  background-color: ${(p) => p.$useAssets ? "transparent" : p.$faceUp ? p.$cardFace : p.$cardBack};
  box-shadow: ${(p) => p.$isDragging ? p.$dragShadow : p.$shadow};
  cursor: ${(p) => p.$isDragging ? "grabbing" : "grab"};
  user-select: none;
  touch-action: none;
  transition: box-shadow 0.15s ease;
  overflow: hidden;
  
  ${(p) => p.$isSelected && styled2.css`
    outline: 2px solid ${p.$highlight};
    outline-offset: 1px;
  `}
  
  ${(p) => p.$isValidDrop && styled2.css`
    outline: 2px solid ${p.$validDropColor};
    outline-offset: 1px;
  `}
  
  ${(p) => p.$isDragging && styled2.css`
    opacity: 0.9;
    z-index: 1000;
  `}
  
  &:hover {
    box-shadow: ${(p) => p.$dragShadow};
  }
`;
var CardImage = styled2__default.default.img`
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
var CardFace = styled2__default.default.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: ${(p) => 3 * p.$scale}px;
  overflow: hidden;
`;
var CornerInfo = styled2__default.default.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  color: ${(p) => p.$colour};
  font-family: ${(p) => p.$fontFamily};
  font-size: ${(p) => p.$fontSize * p.$scale}px;
  font-weight: bold;
  
  ${(p) => p.$position === "top-left" && styled2.css`
    top: ${3 * p.$scale}px;
    left: ${3 * p.$scale}px;
  `}
  
  ${(p) => p.$position === "bottom-right" && styled2.css`
    bottom: ${3 * p.$scale}px;
    right: ${3 * p.$scale}px;
    transform: rotate(180deg);
  `}
`;
var CenterSuit = styled2__default.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${(p) => p.$fontSize * 2 * p.$scale}px;
  color: ${(p) => p.$colour};
  opacity: 0.9;
`;
var CardBackPattern = styled2__default.default.div`
  position: absolute;
  inset: ${(p) => 3 * p.$scale}px;
  border-radius: ${(p) => 2 * p.$scale}px;
  overflow: hidden;
  
  ${(p) => p.$pattern === "crosshatch" && styled2.css`
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
  
  ${(p) => p.$pattern === "diamonds" && styled2.css`
    background: 
      linear-gradient(135deg, ${p.$primaryColor} 25%, transparent 25%) -10px 0,
      linear-gradient(225deg, ${p.$primaryColor} 25%, transparent 25%) -10px 0,
      linear-gradient(315deg, ${p.$primaryColor} 25%, transparent 25%),
      linear-gradient(45deg, ${p.$primaryColor} 25%, transparent 25%);
    background-size: 20px 20px;
    background-color: ${p.$secondaryColor || p.$primaryColor};
  `}
`;
function getCardImageFilename(card) {
  const suitMap = {
    hearts: "Heart",
    diamonds: "Diamond",
    clubs: "Club",
    spades: "Spade"
  };
  const suitPrefix = suitMap[card.suit];
  return `${suitPrefix}-${card.rank}.gif`;
}
var Card = React4.forwardRef(function Card2({
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
  scale = 1
}, ref) {
  const colour = React4.useMemo(() => core.getCardColour(card), [card]);
  const suitInfo = core.SUIT_INFO[card.suit];
  const rankInfo = core.RANK_INFO[card.rank];
  const suitColour = colour === "red" ? theme.colors.redSuit : theme.colors.blackSuit;
  const useAssets = theme.assets?.enabled ?? false;
  const basePath = theme.assets?.basePath ?? "/cards";
  const cardFaceUrl = React4.useMemo(() => {
    if (!useAssets) return "";
    return `${basePath}/${getCardImageFilename(card)}`;
  }, [useAssets, basePath, card]);
  const cardBackUrl = React4.useMemo(() => {
    if (!useAssets) return "";
    return `${basePath}/${theme.assets?.cardBack ?? "Back-Pattern1.gif"}`;
  }, [useAssets, basePath, theme.assets?.cardBack]);
  const handleClick = React4.useCallback((e) => {
    e.stopPropagation();
    onClick?.(e);
  }, [onClick]);
  const handleDoubleClick = React4.useCallback((e) => {
    e.stopPropagation();
    onDoubleClick?.(e);
  }, [onDoubleClick]);
  const handlePointerDown = React4.useCallback((e) => {
    e.stopPropagation();
    onPointerDown?.(e);
  }, [onPointerDown]);
  if (useAssets) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      StyledCard,
      {
        ref,
        $width: theme.card.width,
        $height: theme.card.height,
        $borderRadius: theme.card.borderRadius,
        $borderWidth: theme.card.borderWidth,
        $shadow: theme.card.shadow,
        $dragShadow: theme.card.dragShadow,
        $faceUp: card.faceUp,
        $isSelected: isSelected,
        $isDragging: isDragging,
        $isValidDrop: isValidDrop,
        $cardBack: theme.colors.cardBack,
        $cardFace: theme.colors.cardFace,
        $cardBorder: theme.colors.cardBorder,
        $highlight: theme.colors.highlight,
        $validDropColor: theme.colors.validDrop,
        $scale: scale,
        $flipDuration: theme.animation.flip,
        $useAssets: true,
        className,
        style: { ...style, zIndex },
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        onPointerDown: handlePointerDown,
        "data-card-id": card.id,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          CardImage,
          {
            src: card.faceUp ? cardFaceUrl : cardBackUrl,
            alt: card.faceUp ? `${rankInfo.name} of ${suitInfo.name}` : "Card back",
            $scale: scale,
            draggable: false
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    StyledCard,
    {
      ref,
      $width: theme.card.width,
      $height: theme.card.height,
      $borderRadius: theme.card.borderRadius,
      $borderWidth: theme.card.borderWidth,
      $shadow: theme.card.shadow,
      $dragShadow: theme.card.dragShadow,
      $faceUp: card.faceUp,
      $isSelected: isSelected,
      $isDragging: isDragging,
      $isValidDrop: isValidDrop,
      $cardBack: theme.colors.cardBack,
      $cardFace: theme.colors.cardFace,
      $cardBorder: theme.colors.cardBorder,
      $highlight: theme.colors.highlight,
      $validDropColor: theme.colors.validDrop,
      $scale: scale,
      $flipDuration: theme.animation.flip,
      $useAssets: false,
      className,
      style: { ...style, zIndex },
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onPointerDown: handlePointerDown,
      "data-card-id": card.id,
      children: card.faceUp ? /* @__PURE__ */ jsxRuntime.jsxs(CardFace, { $scale: scale, children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          CornerInfo,
          {
            $colour: suitColour,
            $fontSize: theme.typography.cardFontSize,
            $fontFamily: theme.typography.cardFont,
            $scale: scale,
            $position: "top-left",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: rankInfo.symbol }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: suitInfo.symbol })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          CenterSuit,
          {
            $colour: suitColour,
            $fontSize: theme.typography.cardFontSize,
            $scale: scale,
            children: suitInfo.symbol
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          CornerInfo,
          {
            $colour: suitColour,
            $fontSize: theme.typography.cardFontSize,
            $fontFamily: theme.typography.cardFont,
            $scale: scale,
            $position: "bottom-right",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: rankInfo.symbol }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: suitInfo.symbol })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntime.jsx(
        CardBackPattern,
        {
          $pattern: theme.cardBack.pattern || "crosshatch",
          $primaryColor: theme.colors.cardBack,
          $secondaryColor: theme.colors.cardBackPattern,
          $scale: scale
        }
      )
    }
  );
});
Card.displayName = "Card";
var StyledPile = styled2__default.default.div`
  position: relative;
  width: ${(p) => p.$width * p.$scale}px;
  min-height: ${(p) => p.$height * p.$scale}px;
  
  ${(p) => p.$pileType !== "tableau" && styled2.css`
    height: ${p.$height * p.$scale}px;
  `}
`;
var DropZone = styled2__default.default.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  z-index: 0;
  pointer-events: none;
  
  ${(p) => p.$isValidDrop && styled2.css`
    border: 3px solid ${p.$validDropColor};
    border-radius: 4px;
    background-color: ${p.$validDropColor}22;
    pointer-events: auto;
  `}
`;
var EmptyPileIndicator = styled2__default.default.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${(p) => p.$width * p.$scale}px;
  height: ${(p) => p.$height * p.$scale}px;
  border-radius: ${(p) => p.$borderRadius * p.$scale}px;
  background-color: ${(p) => p.$emptyPileColor};
  border: 2px dashed ${(p) => p.$emptyPileBorder};
  
  ${(p) => p.$isValidDrop && styled2.css`
    border-color: ${p.$validDropColor};
    background-color: ${p.$validDropColor}33;
  `}
`;
var EmptyPileImage = styled2__default.default.img`
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
  
  ${(p) => p.$isValidDrop && styled2.css`
    outline: 2px solid ${p.$validDropColor};
    outline-offset: -2px;
  `}
`;
var FoundationSuit = styled2__default.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${(p) => p.$fontSize * 2.5 * p.$scale}px;
  color: ${(p) => p.$colour};
  opacity: 0.4;
  pointer-events: none;
`;
var StockIndicator = styled2__default.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${(p) => p.$fontSize * p.$scale}px;
  color: ${(p) => p.$textColor};
  opacity: 0.6;
  pointer-events: none;
`;
var CardWrapper = styled2__default.default.div`
  position: absolute;
  top: ${(p) => p.$top}px;
  left: ${(p) => p.$left}px;
  z-index: ${(p) => p.$zIndex};
`;
function getFoundationSuitIndicator(pileIndex) {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const suit = suits[pileIndex];
  return {
    symbol: core.SUIT_INFO[suit].symbol,
    colour: core.SUIT_INFO[suit].colour
  };
}
var Pile = React4.forwardRef(function Pile2({
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
  canDrawFromStock = true
}, ref) {
  const pileRef = React4.useRef(null);
  const dropZoneRef = React4.useRef(null);
  const cardRefs = React4.useRef(/* @__PURE__ */ new Map());
  const useAssets = theme.assets?.enabled ?? false;
  const basePath = theme.assets?.basePath ?? "/cards";
  React4.useEffect(() => {
    const targetElement = pile.type === "tableau" ? dropZoneRef.current : pileRef.current;
    if (!targetElement) return;
    if (pile.type === "stock" || pile.type === "waste") return;
    const dropLocation = {
      ...location,
      cardIndex: pile.cards.length
    };
    registerDropTarget?.(dropLocation, targetElement);
    return () => {
      unregisterDropTarget?.(dropLocation);
    };
  }, [location, pile.cards.length, pile.type, registerDropTarget, unregisterDropTarget]);
  const cardPositions = React4.useMemo(() => {
    return pile.cards.map((_, index) => {
      let top = 0;
      let left = 0;
      if (pile.type === "tableau") {
        for (let i = 0; i < index; i++) {
          const prevCard = pile.cards[i];
          if (prevCard.faceUp) {
            top += theme.spacing.tableauStackedVisible * scale;
          } else {
            top += theme.spacing.tableauStackedHidden * scale;
          }
        }
      } else if (pile.type === "waste") {
        const visibleCount = Math.min(3, pile.cards.length);
        const startIndex = pile.cards.length - visibleCount;
        if (index >= startIndex) {
          left = (index - startIndex) * theme.spacing.wasteOffset * scale;
        }
      }
      return { top, left, visible: pile.type !== "waste" || index >= pile.cards.length - 3 };
    });
  }, [pile.cards, pile.type, theme.spacing, scale]);
  const handlePileClick = React4.useCallback(() => {
    const cardLocation = {
      ...location,
      cardIndex: pile.cards.length
      // Point to where next card would go
    };
    onPileClick?.(cardLocation);
  }, [location, pile.cards.length, onPileClick]);
  const handleCardClick = React4.useCallback((cardIndex) => {
    const cardLocation = { ...location, cardIndex };
    onCardClick?.(cardLocation);
  }, [location, onCardClick]);
  const handleCardDoubleClick = React4.useCallback((cardIndex) => {
    const cardLocation = { ...location, cardIndex };
    onCardDoubleClick?.(cardLocation);
  }, [location, onCardDoubleClick]);
  const handleCardPointerDown = React4.useCallback((event, cardIndex) => {
    const element = cardRefs.current.get(cardIndex);
    if (!element) return;
    const cardLocation = { ...location, cardIndex };
    onCardPointerDown?.(event, cardLocation, element);
  }, [location, onCardPointerDown]);
  const isCardSelected = React4.useCallback((cardIndex) => {
    if (!selectedCard) return false;
    return selectedCard.pileType === location.pileType && selectedCard.pileIndex === location.pileIndex && selectedCard.cardIndex === cardIndex;
  }, [selectedCard, location]);
  const isDropTargetCard = React4.useCallback((cardIndex) => {
    if (!dropTarget || !isValidDropTarget) return false;
    return dropTarget.pileType === location.pileType && dropTarget.pileIndex === location.pileIndex && cardIndex === pile.cards.length - 1;
  }, [dropTarget, isValidDropTarget, location, pile.cards.length]);
  const showEmptyAsDropTarget = isValidDropTarget && pile.cards.length === 0 && dropTarget && dropTarget.pileType === location.pileType && dropTarget.pileIndex === location.pileIndex;
  const showPileAsDropTarget = isValidDropTarget && pile.cards.length > 0 && dropTarget && dropTarget.pileType === location.pileType && dropTarget.pileIndex === location.pileIndex && (pile.type === "tableau" || pile.type === "foundation");
  return /* @__PURE__ */ jsxRuntime.jsxs(
    StyledPile,
    {
      ref,
      $width: theme.card.width,
      $height: theme.card.height,
      $borderRadius: theme.card.borderRadius,
      $emptyPileColor: theme.colors.emptyPile,
      $emptyPileBorder: theme.colors.emptyPileBorder,
      $isValidDrop: Boolean(showEmptyAsDropTarget),
      $validDropColor: theme.colors.validDrop,
      $scale: scale,
      $pileType: pile.type,
      className,
      children: [
        pile.type === "tableau" && /* @__PURE__ */ jsxRuntime.jsx(
          DropZone,
          {
            ref: dropZoneRef,
            $isValidDrop: Boolean(showPileAsDropTarget || showEmptyAsDropTarget),
            $validDropColor: theme.colors.validDrop
          }
        ),
        useAssets && pile.type === "foundation" && /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            ref: pileRef,
            onClick: handlePileClick,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: theme.card.width * scale,
              height: theme.card.height * scale,
              zIndex: 0
            },
            children: pile.cards.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(
              EmptyPileImage,
              {
                src: `${basePath}/${theme.assets?.foundationEmpty ?? "Space-Vacant.gif"}`,
                alt: "Empty foundation",
                $scale: scale,
                $isValidDrop: Boolean(showEmptyAsDropTarget),
                $validDropColor: theme.colors.validDrop
              }
            )
          }
        ),
        useAssets && pile.cards.length === 0 && pile.type !== "foundation" && /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            ref: pile.type === "stock" ? pileRef : void 0,
            onClick: handlePileClick,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: theme.card.width * scale,
              height: theme.card.height * scale,
              cursor: pile.type === "stock" ? "pointer" : "default"
            },
            children: [
              pile.type === "stock" && /* @__PURE__ */ jsxRuntime.jsx(
                EmptyPileImage,
                {
                  src: `${basePath}/${canDrawFromStock ? theme.assets?.stockEmpty ?? "Space-Yes.gif" : theme.assets?.stockDisabled ?? "Space-No.gif"}`,
                  alt: canDrawFromStock ? "Click to recycle" : "No more draws",
                  $scale: scale,
                  $isValidDrop: false,
                  $validDropColor: theme.colors.validDrop
                }
              ),
              pile.type === "tableau" && /* @__PURE__ */ jsxRuntime.jsx(
                EmptyPileImage,
                {
                  src: `${basePath}/${theme.assets?.foundationEmpty ?? "Space-Vacant.gif"}`,
                  alt: "Empty column",
                  $scale: scale,
                  $isValidDrop: Boolean(showEmptyAsDropTarget),
                  $validDropColor: theme.colors.validDrop
                }
              )
            ]
          }
        ),
        !useAssets && /* @__PURE__ */ jsxRuntime.jsxs(
          EmptyPileIndicator,
          {
            ref: pileRef,
            $width: theme.card.width,
            $height: theme.card.height,
            $borderRadius: theme.card.borderRadius,
            $emptyPileColor: theme.colors.emptyPile,
            $emptyPileBorder: theme.colors.emptyPileBorder,
            $isValidDrop: Boolean(showEmptyAsDropTarget),
            $validDropColor: theme.colors.validDrop,
            $scale: scale,
            $pileType: pile.type,
            onClick: handlePileClick,
            children: [
              pile.type === "foundation" && pile.cards.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(
                FoundationSuit,
                {
                  $colour: getFoundationSuitIndicator(location.pileIndex).colour === "red" ? theme.colors.redSuit : theme.colors.blackSuit,
                  $fontSize: theme.typography.cardFontSize,
                  $scale: scale,
                  children: getFoundationSuitIndicator(location.pileIndex).symbol
                }
              ),
              pile.type === "stock" && pile.cards.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(
                StockIndicator,
                {
                  $fontSize: theme.typography.uiFontSize,
                  $textColor: theme.colors.textSecondary,
                  $scale: scale,
                  children: "\u21BA"
                }
              )
            ]
          }
        ),
        pile.cards.map((card, index) => {
          const position = cardPositions[index];
          if (!position.visible) return null;
          if (hiddenCardIds?.has(card.id)) return null;
          return /* @__PURE__ */ jsxRuntime.jsx(
            CardWrapper,
            {
              ref: (el) => {
                if (el) cardRefs.current.set(index, el);
                else cardRefs.current.delete(index);
              },
              $top: position.top,
              $left: position.left,
              $zIndex: index + 1,
              children: /* @__PURE__ */ jsxRuntime.jsx(
                Card,
                {
                  card,
                  theme,
                  isSelected: isCardSelected(index),
                  isValidDrop: isDropTargetCard(index),
                  scale,
                  onClick: () => handleCardClick(index),
                  onDoubleClick: () => handleCardDoubleClick(index),
                  onPointerDown: (e) => handleCardPointerDown(e, index)
                }
              )
            },
            card.id
          );
        })
      ]
    }
  );
});
Pile.displayName = "Pile";
var StyledTable = styled2__default.default.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.$pileGap * p.$scale * 1.5}px;
  padding: ${(p) => p.$padding * p.$scale}px;
  background-color: ${(p) => p.$tableColor};
  min-height: 100%;
  box-sizing: border-box;
`;
var TopRow = styled2__default.default.div`
  display: flex;
  gap: ${(p) => p.$gap * p.$scale}px;
  justify-content: space-between;
`;
var StockWasteArea = styled2__default.default.div`
  display: flex;
  gap: ${(p) => p.$gap * p.$scale}px;
`;
var FoundationsArea = styled2__default.default.div`
  display: flex;
  gap: ${(p) => p.$gap * p.$scale}px;
`;
var TableauRow = styled2__default.default.div`
  display: flex;
  gap: ${(p) => p.$gap * p.$scale}px;
  justify-content: flex-start;
  flex: 1;
`;
var Table = React4.forwardRef(function Table2({
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
  canDrawFromStock = true
}, ref) {
  const checkValidDrop = (location) => {
    return isValidDropTarget?.(location) ?? false;
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    StyledTable,
    {
      ref,
      $tableColor: theme.colors.table,
      $padding: theme.spacing.tablePadding,
      $pileGap: theme.spacing.pileGap,
      $scale: scale,
      className,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(TopRow, { $gap: theme.spacing.pileGap, $scale: scale, children: [
          /* @__PURE__ */ jsxRuntime.jsxs(StockWasteArea, { $gap: theme.spacing.pileGap, $scale: scale, children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Pile,
              {
                pile: gameState.stock,
                theme,
                location: { pileType: "stock", pileIndex: 0 },
                selectedCard,
                dropTarget,
                scale,
                onPileClick: onStockClick ? () => onStockClick() : void 0,
                onCardClick: onStockClick ? () => onStockClick() : void 0,
                canDrawFromStock
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Pile,
              {
                pile: gameState.waste,
                theme,
                location: { pileType: "waste", pileIndex: 0 },
                selectedCard,
                dropTarget,
                scale,
                onCardClick,
                onCardDoubleClick,
                onCardPointerDown,
                registerDropTarget,
                unregisterDropTarget
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(FoundationsArea, { $gap: theme.spacing.pileGap, $scale: scale, children: gameState.foundations.map((foundation, index) => /* @__PURE__ */ jsxRuntime.jsx(
            Pile,
            {
              pile: foundation,
              theme,
              location: { pileType: "foundation", pileIndex: index },
              selectedCard,
              dropTarget,
              isValidDropTarget: checkValidDrop({ pileType: "foundation", pileIndex: index, cardIndex: foundation.cards.length }),
              scale,
              onCardClick,
              onCardDoubleClick,
              onCardPointerDown,
              registerDropTarget,
              unregisterDropTarget,
              hiddenCardIds
            },
            foundation.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(TableauRow, { $gap: theme.spacing.pileGap, $scale: scale, children: gameState.tableau.map((tableau, index) => /* @__PURE__ */ jsxRuntime.jsx(
          Pile,
          {
            pile: tableau,
            theme,
            location: { pileType: "tableau", pileIndex: index },
            selectedCard,
            dropTarget,
            isValidDropTarget: checkValidDrop({ pileType: "tableau", pileIndex: index, cardIndex: tableau.cards.length }),
            scale,
            onCardClick,
            onCardDoubleClick,
            onCardPointerDown,
            registerDropTarget,
            unregisterDropTarget
          },
          tableau.id
        )) })
      ]
    }
  );
});
Table.displayName = "Table";
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
function useTimer(options) {
  const { startTime, endTime, interval = 1e3 } = options;
  const [seconds, setSeconds] = React4.useState(0);
  const intervalRef = React4.useRef(null);
  const calculateSeconds = React4.useCallback(() => {
    if (!startTime) return 0;
    const end = endTime ?? Date.now();
    return Math.floor((end - startTime) / 1e3);
  }, [startTime, endTime]);
  React4.useEffect(() => {
    setSeconds(calculateSeconds());
  }, [calculateSeconds]);
  React4.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTime && !endTime) {
      intervalRef.current = setInterval(() => {
        setSeconds(calculateSeconds());
      }, interval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, endTime, interval, calculateSeconds]);
  const isRunning = Boolean(startTime && !endTime);
  const formatted = formatTime(seconds);
  return {
    seconds,
    isRunning,
    formatted
  };
}
function useStopwatch() {
  const [startTime, setStartTime] = React4.useState(null);
  const [endTime, setEndTime] = React4.useState(null);
  const timer = useTimer({ startTime, endTime });
  const start = React4.useCallback(() => {
    setStartTime(Date.now());
    setEndTime(null);
  }, []);
  const stop = React4.useCallback(() => {
    if (startTime && !endTime) {
      setEndTime(Date.now());
    }
  }, [startTime, endTime]);
  const reset = React4.useCallback(() => {
    setStartTime(null);
    setEndTime(null);
  }, []);
  const restart = React4.useCallback(() => {
    setStartTime(Date.now());
    setEndTime(null);
  }, []);
  return {
    ...timer,
    start,
    stop,
    reset,
    restart
  };
}
var StyledTimer = styled2__default.default.div`
  font-family: ${(p) => p.$fontFamily};
  font-size: ${(p) => p.$fontSize}px;
  color: ${(p) => p.$textColor};
  font-variant-numeric: tabular-nums;
  min-width: 4em;
  text-align: center;
`;
var Label = styled2__default.default.span`
  opacity: 0.7;
  margin-right: 0.5em;
`;
function Timer({ startTime, endTime, theme, className }) {
  const { formatted } = useTimer({ startTime, endTime });
  return /* @__PURE__ */ jsxRuntime.jsxs(
    StyledTimer,
    {
      $fontFamily: theme.typography.uiFont,
      $fontSize: theme.typography.uiFontSize,
      $textColor: theme.colors.text,
      className,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(Label, { children: "Time:" }),
        formatted
      ]
    }
  );
}
var StyledControls = styled2__default.default.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: ${(p) => p.$fontFamily};
  font-size: ${(p) => p.$fontSize}px;
  color: ${(p) => p.$textColor};
`;
var Stat = styled2__default.default.div`
  display: flex;
  align-items: center;
  gap: 0.4em;
`;
var StatLabel = styled2__default.default.span`
  color: ${(p) => p.$color};
  opacity: 0.7;
`;
var StatValue = styled2__default.default.span`
  font-variant-numeric: tabular-nums;
  min-width: 3em;
`;
var Button = styled2__default.default.button`
  font-family: ${(p) => p.$fontFamily};
  font-size: ${(p) => p.$fontSize}px;
  padding: 0.4em 0.8em;
  border: 1px solid currentColor;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  cursor: ${(p) => p.$disabled ? "not-allowed" : "pointer"};
  opacity: ${(p) => p.$disabled ? 0.5 : 1};
  transition: background-color 0.15s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;
var ButtonGroup = styled2__default.default.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;
function Controls({
  score,
  moves,
  scoringMode,
  canUndo,
  canAutoComplete: canAutoComplete2,
  theme,
  onNewGame,
  onUndo,
  onAutoComplete,
  className
}) {
  const formattedScore = core.formatScore(score, scoringMode);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    StyledControls,
    {
      $fontFamily: theme.typography.uiFont,
      $fontSize: theme.typography.uiFontSize,
      $textColor: theme.colors.text,
      $secondaryColor: theme.colors.textSecondary,
      className,
      children: [
        scoringMode !== "none" && /* @__PURE__ */ jsxRuntime.jsxs(Stat, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(StatLabel, { $color: theme.colors.textSecondary, children: "Score:" }),
          /* @__PURE__ */ jsxRuntime.jsx(StatValue, { children: formattedScore })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(Stat, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(StatLabel, { $color: theme.colors.textSecondary, children: "Moves:" }),
          /* @__PURE__ */ jsxRuntime.jsx(StatValue, { children: moves })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(ButtonGroup, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Button,
            {
              $fontFamily: theme.typography.uiFont,
              $fontSize: theme.typography.uiFontSize,
              onClick: onUndo,
              disabled: !canUndo,
              $disabled: !canUndo,
              title: "Undo (Ctrl+Z)",
              children: "Undo"
            }
          ),
          canAutoComplete2 && /* @__PURE__ */ jsxRuntime.jsx(
            Button,
            {
              $fontFamily: theme.typography.uiFont,
              $fontSize: theme.typography.uiFontSize,
              onClick: onAutoComplete,
              title: "Auto-complete remaining cards",
              children: "Auto"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Button,
            {
              $fontFamily: theme.typography.uiFont,
              $fontSize: theme.typography.uiFontSize,
              onClick: onNewGame,
              title: "Start a new game (F2)",
              children: "New Game"
            }
          )
        ] })
      ]
    }
  );
}

// src/themes/win31.ts
var win31Theme = {
  name: "Windows 3.1",
  colors: {
    // The classic green felt
    table: "#008000",
    // Cream/white card face
    cardFace: "#FFFFFF",
    // Classic blue card back
    cardBack: "#0000AA",
    cardBackPattern: "#000080",
    // Suit colours
    redSuit: "#FF0000",
    blackSuit: "#000000",
    // Card styling
    cardBorder: "#000000",
    // Empty pile styling (darker green with dashed outline)
    emptyPile: "rgba(0, 64, 0, 0.5)",
    emptyPileBorder: "rgba(0, 100, 0, 0.8)",
    // Highlights
    highlight: "rgba(255, 255, 0, 0.3)",
    validDrop: "rgba(0, 255, 0, 0.3)",
    // Text
    text: "#FFFFFF",
    textSecondary: "#C0C0C0"
  },
  card: {
    // Windows 3.1 used 71x96 pixel cards
    // We'll scale up for modern displays
    width: 71,
    height: 96,
    borderRadius: 3,
    borderWidth: 1,
    shadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
    dragShadow: "4px 4px 8px rgba(0, 0, 0, 0.4)"
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
    tablePadding: 16
  },
  animation: {
    flip: 150,
    move: 200,
    victoryDelay: 50,
    victoryBounce: 400
  },
  typography: {
    // Classic Windows font
    cardFont: '"MS Sans Serif", "Segoe UI", Arial, sans-serif',
    cardFontSize: 14,
    uiFont: '"MS Sans Serif", "Segoe UI", Arial, sans-serif',
    uiFontSize: 12
  },
  cardBack: {
    type: "pattern",
    pattern: "crosshatch"
  }
};
function gameReducer(state, action) {
  switch (action.type) {
    case "NEW_GAME": {
      const newGame = core.createInitialState(action.config, action.seed);
      const history = new core.GameHistory();
      return { game: newGame, history, lastMoveResult: null };
    }
    case "DRAW": {
      if (state.game.stock.cards.length === 0) {
        return state;
      }
      const previousState = core.cloneState(state.game);
      const newGame = core.drawFromStock(state.game);
      state.history.push({
        move: {
          from: { pileType: "stock", pileIndex: 0, cardIndex: state.game.stock.cards.length - 1 },
          to: { pileType: "waste", pileIndex: 0, cardIndex: state.game.waste.cards.length },
          cardCount: state.game.config.drawMode === "draw-three" ? 3 : 1,
          flippedCard: false,
          scoreChange: 0
        },
        previousState
      });
      return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
    }
    case "RESET_STOCK": {
      if (state.game.waste.cards.length === 0) {
        return state;
      }
      const previousState = core.cloneState(state.game);
      const newGame = core.resetStock(state.game);
      state.history.push({
        move: {
          from: { pileType: "waste", pileIndex: 0, cardIndex: 0 },
          to: { pileType: "stock", pileIndex: 0, cardIndex: 0 },
          cardCount: state.game.waste.cards.length,
          flippedCard: false,
          scoreChange: 0
        },
        previousState
      });
      return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
    }
    case "MOVE": {
      const previousState = core.cloneState(state.game);
      const result = core.executeMove(state.game, action.from, action.to, action.cardCount);
      if (result.success && result.state && result.move) {
        state.history.push({
          move: result.move,
          previousState
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      return { ...state, lastMoveResult: result };
    }
    case "AUTO_MOVE": {
      const previousState = core.cloneState(state.game);
      const result = core.autoMoveToFoundation(state.game, action.from);
      if (result.success && result.state && result.move) {
        state.history.push({
          move: result.move,
          previousState
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      return { ...state, lastMoveResult: result };
    }
    case "AUTO_COMPLETE_STEP": {
      const newGame = core.autoCompleteStep(state.game);
      if (newGame) {
        return { ...state, game: newGame, lastMoveResult: { success: true, state: newGame } };
      }
      return state;
    }
    case "FLIP_CARD": {
      const previousState = core.cloneState(state.game);
      const result = core.flipTableauCard(state.game, action.tableauIndex);
      if (result.success && result.state) {
        state.history.push({
          move: {
            from: { pileType: "tableau", pileIndex: action.tableauIndex, cardIndex: state.game.tableau[action.tableauIndex].cards.length - 1 },
            to: { pileType: "tableau", pileIndex: action.tableauIndex, cardIndex: state.game.tableau[action.tableauIndex].cards.length - 1 },
            cardCount: 0,
            flippedCard: true,
            scoreChange: 5
            // Standard score for revealing a card
          },
          previousState
        });
        return { ...state, game: result.state, lastMoveResult: result };
      }
      return { ...state, lastMoveResult: result };
    }
    case "UNDO": {
      const previousState = state.history.undo();
      if (previousState) {
        return { ...state, game: previousState, lastMoveResult: null };
      }
      return state;
    }
    case "SET_STATE": {
      return { ...state, game: action.state, lastMoveResult: null };
    }
    case "TRIGGER_WIN": {
      const wonState = core.createWonState(action.config);
      const history = new core.GameHistory();
      return { game: wonState, history, lastMoveResult: null };
    }
    default:
      return state;
  }
}
function useGame(options = {}) {
  const { config, seed } = options;
  const configRef = React4.useRef(config);
  const seedRef = React4.useRef(seed);
  configRef.current = config;
  seedRef.current = seed;
  const [reducerState, dispatch] = React4.useReducer(gameReducer, null, () => ({
    game: core.createInitialState(config, seed),
    history: new core.GameHistory(),
    lastMoveResult: null
  }));
  const { game, history, lastMoveResult } = reducerState;
  const newGame = React4.useCallback((newConfig, newSeed) => {
    dispatch({ type: "NEW_GAME", config: newConfig ?? configRef.current, seed: newSeed ?? seedRef.current });
  }, []);
  const draw = React4.useCallback(() => {
    dispatch({ type: "DRAW" });
  }, []);
  const resetWaste = React4.useCallback(() => {
    dispatch({ type: "RESET_STOCK" });
  }, []);
  const move = React4.useCallback((from, to, cardCount) => {
    dispatch({ type: "MOVE", from, to, cardCount });
    return { success: true, error: void 0 };
  }, []);
  const autoMove = React4.useCallback((from) => {
    dispatch({ type: "AUTO_MOVE", from });
    return { success: true, error: void 0 };
  }, []);
  const flipCard = React4.useCallback((tableauIndex) => {
    dispatch({ type: "FLIP_CARD", tableauIndex });
  }, []);
  const autoCompleteStepFn = React4.useCallback(() => {
    dispatch({ type: "AUTO_COMPLETE_STEP" });
    return true;
  }, []);
  const undo = React4.useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);
  const triggerWin = React4.useCallback(() => {
    dispatch({ type: "TRIGGER_WIN", config: configRef.current });
  }, []);
  const canUndo = history.canUndo();
  const elapsedTime = React4.useMemo(() => {
    if (!game.startTime) return 0;
    const endTime = game.endTime ?? Date.now();
    return Math.floor((endTime - game.startTime) / 1e3);
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
    triggerWin
  };
}
var initialDragState = {
  isDragging: false,
  source: null,
  cardCount: 0,
  currentX: 0,
  currentY: 0,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0
};
function useDrag(options = {}) {
  const { dragThreshold = 5 } = options;
  const optionsRef = React4.useRef(options);
  optionsRef.current = options;
  const [dragState, setDragState] = React4.useState(initialDragState);
  const [currentDropTarget, setCurrentDropTarget] = React4.useState(null);
  const dropTargetsRef = React4.useRef(
    /* @__PURE__ */ new Map()
  );
  const dragStartedRef = React4.useRef(false);
  const pendingDragRef = React4.useRef(null);
  const locationKey = (loc) => {
    return `${loc.pileType}-${loc.pileIndex}-${loc.cardIndex}`;
  };
  const findDropTarget = React4.useCallback((x, y, source, cardCount) => {
    const PADDING = 15;
    for (const { location, element } of dropTargetsRef.current.values()) {
      const rect = element.getBoundingClientRect();
      const paddedRect = {
        left: rect.left - PADDING,
        right: rect.right + PADDING,
        top: rect.top - PADDING,
        bottom: rect.bottom + PADDING
      };
      if (x >= paddedRect.left && x <= paddedRect.right && y >= paddedRect.top && y <= paddedRect.bottom) {
        const isValid = optionsRef.current.isValidDrop?.(source, location, cardCount) ?? true;
        return { location, isValid, rect };
      }
    }
    return null;
  }, []);
  const handlePointerMove = React4.useCallback((event) => {
    const pending = pendingDragRef.current;
    if (!pending) return;
    const x = event.clientX;
    const y = event.clientY;
    if (!dragStartedRef.current) {
      const dx = x - pending.startX;
      const dy = y - pending.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= dragThreshold) {
        dragStartedRef.current = true;
        try {
          pending.element.setPointerCapture(pending.pointerId);
        } catch {
        }
        setDragState({
          isDragging: true,
          source: pending.source,
          cardCount: pending.cardCount,
          currentX: x,
          currentY: y,
          startX: pending.startX,
          startY: pending.startY,
          offsetX: pending.offsetX,
          offsetY: pending.offsetY
        });
        optionsRef.current.onDragStart?.(pending.source, pending.cardCount);
      }
      return;
    }
    setDragState((prev) => ({
      ...prev,
      currentX: x,
      currentY: y
    }));
    optionsRef.current.onDragMove?.(x, y);
    const target = findDropTarget(x, y, pending.source, pending.cardCount);
    setCurrentDropTarget(target);
  }, [dragThreshold, findDropTarget]);
  const handlePointerUp = React4.useCallback((event) => {
    const pending = pendingDragRef.current;
    if (!pending) return;
    if (dragStartedRef.current) {
      const x = event.clientX;
      const y = event.clientY;
      const target = findDropTarget(x, y, pending.source, pending.cardCount);
      if (target && target.isValid) {
        optionsRef.current.onDrop?.(pending.source, target.location, pending.cardCount);
      }
      optionsRef.current.onDragEnd?.(pending.source, target?.location ?? null, pending.cardCount);
    }
    setDragState(initialDragState);
    setCurrentDropTarget(null);
    dragStartedRef.current = false;
    pendingDragRef.current = null;
  }, [findDropTarget]);
  const handlePointerCancel = React4.useCallback(() => {
    const pending = pendingDragRef.current;
    if (dragStartedRef.current && pending) {
      optionsRef.current.onDragEnd?.(pending.source, null, pending.cardCount);
    }
    setDragState(initialDragState);
    setCurrentDropTarget(null);
    dragStartedRef.current = false;
    pendingDragRef.current = null;
  }, []);
  const startDrag = React4.useCallback((event, source, cardCount, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    pendingDragRef.current = {
      source,
      cardCount,
      startX: event.clientX,
      startY: event.clientY,
      offsetX,
      offsetY,
      element: cardElement,
      pointerId: event.pointerId
    };
  }, []);
  const cancelDrag = React4.useCallback(() => {
    handlePointerCancel();
  }, [handlePointerCancel]);
  const registerDropTarget = React4.useCallback((location, element) => {
    dropTargetsRef.current.set(locationKey(location), { location, element });
  }, []);
  const unregisterDropTarget = React4.useCallback((location) => {
    dropTargetsRef.current.delete(locationKey(location));
  }, []);
  React4.useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel]);
  return {
    dragState,
    startDrag,
    cancelDrag,
    registerDropTarget,
    unregisterDropTarget,
    currentDropTarget
  };
}
var defaultSoundConfig = {
  enabled: true,
  volume: 0.5,
  sounds: {}
};
function useSounds(config = {}) {
  const mergedConfig = React4.useMemo(() => ({
    ...defaultSoundConfig,
    ...config,
    sounds: { ...defaultSoundConfig.sounds, ...config.sounds }
  }), [config]);
  const audioContext = React4.useMemo(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      return new AudioContext();
    }
    return null;
  }, []);
  const play = React4.useCallback((effect, options = {}) => {
    if (!mergedConfig.enabled || !audioContext) return;
    const soundUrl = mergedConfig.sounds[effect];
    if (!soundUrl) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      const frequencies = {
        flip: 800,
        place: 600,
        pickup: 700,
        draw: 500,
        invalid: 200,
        victory: 1e3,
        bounce: 400
      };
      oscillator.frequency.value = frequencies[effect];
      oscillator.type = "sine";
      gainNode.gain.value = mergedConfig.volume * 0.3;
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      return;
    }
    fetch(soundUrl).then((response) => response.arrayBuffer()).then((buffer) => audioContext.decodeAudioData(buffer)).then((audioBuffer) => {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      source.buffer = audioBuffer;
      source.playbackRate.value = options.playbackRate ?? 1;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = mergedConfig.volume;
      source.start(0);
    }).catch((err) => {
      console.warn(`Failed to play sound: ${effect}`, err);
    });
  }, [audioContext, mergedConfig]);
  const stop = React4.useCallback((_effect) => {
  }, []);
  const setEnabled = React4.useCallback((_enabled) => {
  }, []);
  const setVolume = React4.useCallback((_volume) => {
  }, []);
  return {
    play,
    stop,
    enabled: mergedConfig.enabled,
    setEnabled,
    volume: mergedConfig.volume,
    setVolume
  };
}
var AnimationContainer = styled2__default.default.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1000;
`;
var CardSlot = styled2__default.default.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform, opacity;
  visibility: hidden;
`;
var TrailSlot = styled2__default.default.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform, opacity;
  visibility: hidden;
`;
var GRAVITY = 0.4;
var BOUNCE_DAMPING = 0.75;
var HORIZONTAL_SPEED_MIN = 3;
var HORIZONTAL_SPEED_MAX = 6;
var INITIAL_VERTICAL_SPEED = -12;
var TRAIL_LENGTH = 6;
var TRAIL_FADE_RATE = 0.15;
var CARD_LAUNCH_DELAY = 120;
var ROTATION_SPEED_MAX = 8;
var CARD_LIFETIME = 5e3;
var FADE_START_TIME = 3e3;
var FADE_DURATION = 2e3;
var BOUNCE_SOUND_THROTTLE = 100;
var VictoryAnimation = React4__default.default.memo(function VictoryAnimation2({
  gameState,
  theme,
  containerWidth,
  containerHeight,
  onComplete,
  scale = 1,
  onBounce,
  onCardsLaunched
}) {
  const [isActive, setIsActive] = React4.useState(true);
  const cardSlotsRef = React4.useRef(/* @__PURE__ */ new Map());
  const trailSlotsRef = React4.useRef(/* @__PURE__ */ new Map());
  const physicsRef = React4.useRef([]);
  const animationRef = React4.useRef(null);
  const launchIndexRef = React4.useRef(0);
  const lastLaunchTimeRef = React4.useRef(0);
  const completedRef = React4.useRef(false);
  const launchedIdsRef = React4.useRef(/* @__PURE__ */ new Set());
  const animationStartTimeRef = React4.useRef(0);
  const lastBounceTimeRef = React4.useRef(0);
  const onCompleteRef = React4.useRef(onComplete);
  const onCardsLaunchedRef = React4.useRef(onCardsLaunched);
  const onBounceRef = React4.useRef(onBounce);
  onCompleteRef.current = onComplete;
  onCardsLaunchedRef.current = onCardsLaunched;
  onBounceRef.current = onBounce;
  const cardWidth = theme.card.width * scale;
  const cardHeight = theme.card.height * scale;
  const pileGap = theme.spacing.pileGap * scale;
  const padding = theme.spacing.tablePadding * scale;
  const cardsToAnimate = React4.useMemo(() => {
    const cards = [];
    for (let rank = 12; rank >= 0; rank--) {
      for (let foundationIndex = 0; foundationIndex < 4; foundationIndex++) {
        const foundation = gameState.foundations[foundationIndex];
        if (foundation.cards[rank]) {
          const card = foundation.cards[rank];
          cards.push({
            card,
            foundationIndex,
            uniqueKey: `victory-${card.id}-${foundationIndex}-${rank}`
          });
        }
      }
    }
    return cards;
  }, [gameState.foundations]);
  const getFoundationX = (foundationIndex) => {
    const foundationsWidth = cardWidth * 4 + pileGap * 3;
    const rightEdge = containerWidth - padding;
    const foundationsStartX = rightEdge - foundationsWidth;
    return foundationsStartX + foundationIndex * (cardWidth + pileGap);
  };
  React4.useEffect(() => {
    if (!isActive) return;
    launchIndexRef.current = 0;
    lastLaunchTimeRef.current = 0;
    completedRef.current = false;
    launchedIdsRef.current = /* @__PURE__ */ new Set();
    animationStartTimeRef.current = performance.now();
    physicsRef.current = cardsToAnimate.map(({ foundationIndex }) => ({
      x: getFoundationX(foundationIndex),
      y: padding,
      vx: 0,
      vy: 0,
      rotation: 0,
      rotationSpeed: 0,
      launched: false,
      launchTime: 0,
      opacity: 1,
      trailPositions: []
    }));
    cardSlotsRef.current.forEach((el) => {
      el.style.visibility = "hidden";
    });
    trailSlotsRef.current.forEach((el) => {
      el.style.visibility = "hidden";
    });
    let lastTime = performance.now();
    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;
      if (launchIndexRef.current < cardsToAnimate.length) {
        if (currentTime - lastLaunchTimeRef.current > CARD_LAUNCH_DELAY) {
          const idx = launchIndexRef.current;
          const { card, foundationIndex } = cardsToAnimate[idx];
          const physics = physicsRef.current[idx];
          const goLeft = Math.random() > 0.5;
          const hSpeed = HORIZONTAL_SPEED_MIN + Math.random() * (HORIZONTAL_SPEED_MAX - HORIZONTAL_SPEED_MIN);
          physics.x = getFoundationX(foundationIndex);
          physics.y = padding;
          physics.vx = goLeft ? -hSpeed : hSpeed;
          physics.vy = INITIAL_VERTICAL_SPEED;
          physics.rotation = 0;
          physics.rotationSpeed = (Math.random() - 0.5) * ROTATION_SPEED_MAX;
          physics.launched = true;
          physics.launchTime = currentTime;
          physics.opacity = 1;
          physics.trailPositions = [];
          const cardEl = cardSlotsRef.current.get(idx);
          if (cardEl) {
            cardEl.style.visibility = "visible";
            cardEl.style.opacity = "1";
            cardEl.style.transform = `translate(${physics.x}px, ${physics.y}px) rotate(0deg)`;
          }
          launchedIdsRef.current.add(card.id);
          onCardsLaunchedRef.current?.(new Set(launchedIdsRef.current));
          launchIndexRef.current++;
          lastLaunchTimeRef.current = currentTime;
        }
      }
      let activeCount = 0;
      for (let i = 0; i < physicsRef.current.length; i++) {
        const physics = physicsRef.current[i];
        if (!physics.launched) continue;
        const cardAge = currentTime - physics.launchTime;
        if (cardAge > CARD_LIFETIME) {
          physics.launched = false;
          const cardEl2 = cardSlotsRef.current.get(i);
          if (cardEl2) cardEl2.style.visibility = "hidden";
          for (let t = 0; t < TRAIL_LENGTH; t++) {
            const trailEl = trailSlotsRef.current.get(`${i}-${t}`);
            if (trailEl) trailEl.style.visibility = "hidden";
          }
          continue;
        }
        activeCount++;
        if (cardAge > FADE_START_TIME) {
          physics.opacity = 1 - (cardAge - FADE_START_TIME) / FADE_DURATION;
          physics.opacity = Math.max(0, Math.min(1, physics.opacity));
        }
        physics.trailPositions = [
          { x: physics.x, y: physics.y, rotation: physics.rotation, opacity: physics.opacity },
          ...physics.trailPositions.slice(0, TRAIL_LENGTH - 1).map((t) => ({
            ...t,
            opacity: t.opacity * (1 - TRAIL_FADE_RATE)
          }))
        ].filter((t) => t.opacity > 0.01);
        physics.vy += GRAVITY * deltaTime;
        physics.y += physics.vy * deltaTime;
        physics.x += physics.vx * deltaTime;
        physics.rotation += physics.rotationSpeed * deltaTime;
        if (physics.y + cardHeight > containerHeight) {
          physics.y = containerHeight - cardHeight;
          physics.vy = -physics.vy * BOUNCE_DAMPING;
          if (currentTime - lastBounceTimeRef.current > BOUNCE_SOUND_THROTTLE) {
            lastBounceTimeRef.current = currentTime;
            onBounceRef.current?.();
          }
        }
        if (physics.x < 0) {
          physics.x = 0;
          physics.vx = -physics.vx * BOUNCE_DAMPING;
        } else if (physics.x + cardWidth > containerWidth) {
          physics.x = containerWidth - cardWidth;
          physics.vx = -physics.vx * BOUNCE_DAMPING;
        }
        const cardEl = cardSlotsRef.current.get(i);
        if (cardEl) {
          cardEl.style.transform = `translate(${physics.x}px, ${physics.y}px) rotate(${physics.rotation}deg)`;
          cardEl.style.opacity = String(physics.opacity);
        }
        for (let t = 0; t < TRAIL_LENGTH; t++) {
          const trailEl = trailSlotsRef.current.get(`${i}-${t}`);
          if (trailEl) {
            const trail = physics.trailPositions[t];
            if (trail && trail.opacity > 0.01) {
              trailEl.style.visibility = "visible";
              trailEl.style.transform = `translate(${trail.x}px, ${trail.y}px) rotate(${trail.rotation}deg)`;
              trailEl.style.opacity = String(trail.opacity * 0.5);
            } else {
              trailEl.style.visibility = "hidden";
            }
          }
        }
      }
      const allLaunched = launchIndexRef.current >= cardsToAnimate.length;
      if (allLaunched && activeCount === 0 && !completedRef.current && cardsToAnimate.length > 0) {
        completedRef.current = true;
        setIsActive(false);
        setTimeout(() => onCompleteRef.current?.(), 100);
        return;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cardsToAnimate, containerWidth, containerHeight, cardWidth, cardHeight, padding, pileGap, isActive]);
  const setCardSlotRef = (index) => (el) => {
    if (el) cardSlotsRef.current.set(index, el);
  };
  const setTrailSlotRef = (cardIndex, trailIndex) => (el) => {
    if (el) trailSlotsRef.current.set(`${cardIndex}-${trailIndex}`, el);
  };
  if (!isActive && completedRef.current) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(AnimationContainer, { children: cardsToAnimate.map(({ card, uniqueKey }, cardIndex) => /* @__PURE__ */ jsxRuntime.jsxs(React4__default.default.Fragment, { children: [
    Array.from({ length: TRAIL_LENGTH }, (_, trailIndex) => /* @__PURE__ */ jsxRuntime.jsx(
      TrailSlot,
      {
        ref: setTrailSlotRef(cardIndex, trailIndex),
        children: /* @__PURE__ */ jsxRuntime.jsx(Card, { card, theme, scale })
      },
      `${uniqueKey}-trail-${trailIndex}`
    )),
    /* @__PURE__ */ jsxRuntime.jsx(CardSlot, { ref: setCardSlotRef(cardIndex), children: /* @__PURE__ */ jsxRuntime.jsx(Card, { card, theme, scale }) }, `${uniqueKey}-main`)
  ] }, uniqueKey)) });
});
var SolitaireContainer = styled2__default.default.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: ${(p) => p.$width}px;
  min-height: ${(p) => p.$height}px;
  overflow: auto;
`;
var DragLayer = styled2__default.default.div`
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  left: 0;
  top: 0;
`;
var DraggedCardsContainer = styled2__default.default.div.attrs((props) => ({
  style: {
    transform: `translate(${props.$x}px, ${props.$y}px)`
  }
}))`
  position: absolute;
  left: 0;
  top: 0;
`;
var StatusBar = styled2__default.default.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  font-family: ${(p) => p.$font};
  font-size: ${(p) => p.$fontSize}px;
  color: ${(p) => p.$color};
  background-color: ${(p) => p.$bgColor};
`;
var AutoCompleteButton = styled2__default.default.button`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  font-family: ${(p) => p.$font};
  font-size: 14px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  cursor: pointer;
  opacity: ${(p) => p.$visible ? 1 : 0};
  pointer-events: ${(p) => p.$visible ? "auto" : "none"};
  transition: opacity 0.2s;

  &:active {
    border-style: inset;
  }
`;
var NoMovesOverlay = styled2__default.default.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px 48px;
  font-family: ${(p) => p.$font};
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
var TestButton = styled2__default.default.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  font-family: ${(p) => p.$font};
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
var EMPTY_OPTIONS = {};
var EMPTY_SOUND_CONFIG = {};
function Solitaire({
  theme = win31Theme,
  options = EMPTY_OPTIONS,
  onWin,
  onNewGame,
  newGameTrigger,
  scale = 1,
  className,
  showTestButton = false
}) {
  const containerRef = React4.useRef(null);
  const [containerSize, setContainerSize] = React4.useState({ width: 800, height: 600 });
  const [selectedCard, setSelectedCard] = React4.useState(null);
  const [showVictory, setShowVictory] = React4.useState(false);
  const [isAutoCompleting, setIsAutoCompleting] = React4.useState(false);
  const [launchedCardIds, setLaunchedCardIds] = React4.useState(/* @__PURE__ */ new Set());
  const autoCompleteIntervalRef = React4.useRef(null);
  const onWinRef = React4.useRef(onWin);
  const onNewGameRef = React4.useRef(onNewGame);
  onWinRef.current = onWin;
  onNewGameRef.current = onNewGame;
  const gameConfig = React4.useMemo(() => ({
    drawMode: options.drawMode ?? "draw-one",
    scoringMode: options.scoringMode ?? "standard",
    unlimitedPasses: options.unlimitedPasses ?? true,
    autoFlipTableau: options.autoFlipTableau ?? false
    // Default to click-to-flip like original
  }), [options.drawMode, options.scoringMode, options.unlimitedPasses, options.autoFlipTableau]);
  const {
    state: gameState,
    newGame,
    draw,
    resetWaste,
    move,
    autoMove,
    flipCard,
    autoCompleteStep: autoCompleteStep2,
    triggerWin
  } = useGame({ config: gameConfig });
  const gameStateRef = React4.useRef(gameState);
  gameStateRef.current = gameState;
  const moveRef = React4.useRef(move);
  moveRef.current = move;
  const prevIsWonRef = React4.useRef(false);
  React4.useEffect(() => {
    if (gameState.isWon && !prevIsWonRef.current) {
      setShowVictory(true);
      onWinRef.current?.({
        time: gameState.endTime && gameState.startTime ? Math.floor((gameState.endTime - gameState.startTime) / 1e3) : 0,
        moves: gameState.moves,
        score: gameState.score
      });
    }
    prevIsWonRef.current = gameState.isWon;
  }, [gameState.isWon, gameState.endTime, gameState.startTime, gameState.moves, gameState.score]);
  const timerOptions = React4.useMemo(() => ({
    startTime: gameState.startTime,
    endTime: gameState.endTime
  }), [gameState.startTime, gameState.endTime]);
  const timer = useTimer(timerOptions);
  const soundConfig = options.sound ?? EMPTY_SOUND_CONFIG;
  const sounds = useSounds(soundConfig);
  const soundsRef = React4.useRef(sounds);
  soundsRef.current = sounds;
  const checkValidMove = React4.useCallback((from, to, cardCount) => {
    return core.isValidMove(gameStateRef.current, from, to, cardCount);
  }, []);
  const handleDragStart = React4.useCallback(() => {
    soundsRef.current.play("pickup");
  }, []);
  const handleDrop = React4.useCallback((from, to, cardCount) => {
    const result = moveRef.current(from, to, cardCount);
    if (result.success) {
      soundsRef.current.play("place");
      setSelectedCard(null);
    } else {
      soundsRef.current.play("invalid");
    }
  }, []);
  const handleDragEnd = React4.useCallback(() => {
  }, []);
  const dragOptions = React4.useMemo(() => ({
    isValidDrop: checkValidMove,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd
  }), [checkValidMove, handleDragStart, handleDrop, handleDragEnd]);
  const {
    dragState,
    startDrag,
    currentDropTarget,
    registerDropTarget,
    unregisterDropTarget
  } = useDrag(dragOptions);
  const prevTriggerRef = React4.useRef(newGameTrigger);
  React4.useEffect(() => {
    if (newGameTrigger !== void 0 && newGameTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = newGameTrigger;
      newGame();
      setShowVictory(false);
      setSelectedCard(null);
      setIsAutoCompleting(false);
      setLaunchedCardIds(/* @__PURE__ */ new Set());
      onNewGameRef.current?.();
    }
  }, [newGameTrigger, newGame]);
  React4.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  React4.useEffect(() => {
    if (isAutoCompleting && !gameState.isWon) {
      autoCompleteIntervalRef.current = setInterval(() => {
        const moved = autoCompleteStep2();
        if (moved) {
          soundsRef.current.play("place");
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
  }, [isAutoCompleting, gameState.isWon, autoCompleteStep2]);
  const handleStockClick = React4.useCallback(() => {
    const currentState = gameStateRef.current;
    if (currentState.stock.cards.length === 0) {
      if (currentState.waste.cards.length > 0) {
        resetWaste();
        soundsRef.current.play("draw");
      }
    } else {
      draw();
      soundsRef.current.play("draw");
    }
  }, [draw, resetWaste]);
  const handleCardClick = React4.useCallback((location) => {
    const currentState = gameStateRef.current;
    const pile = core.getPile(currentState, location);
    if (!pile) return;
    const card = pile.cards[location.cardIndex];
    if (!card?.faceUp) {
      if (pile.type === "tableau" && location.cardIndex === pile.cards.length - 1) {
        flipCard(location.pileIndex);
        soundsRef.current.play("flip");
      }
      return;
    }
    setSelectedCard((prev) => {
      if (prev) {
        const sourcePile = core.getPile(currentState, prev);
        if (!sourcePile) return null;
        const cardCount = sourcePile.cards.length - prev.cardIndex;
        const destLocation = {
          ...location,
          cardIndex: pile.cards.length
        };
        const result = moveRef.current(prev, destLocation, cardCount);
        if (result.success) {
          soundsRef.current.play("place");
        }
        return null;
      } else {
        if (core.canPickUpCards(pile, location.cardIndex)) {
          soundsRef.current.play("flip");
          return location;
        }
        return null;
      }
    });
  }, [flipCard]);
  const handleCardDoubleClick = React4.useCallback((location) => {
    if (options.doubleClickEnabled === false) return;
    const destination = core.canAutoMove(gameStateRef.current, location);
    if (destination) {
      autoMove(location);
      soundsRef.current.play("place");
      setSelectedCard(null);
    }
  }, [autoMove, options.doubleClickEnabled]);
  const handleCardPointerDown = React4.useCallback((event, location, element) => {
    const pile = core.getPile(gameStateRef.current, location);
    if (!pile) return;
    const card = pile.cards[location.cardIndex];
    if (!card?.faceUp) return;
    if (!core.canPickUpCards(pile, location.cardIndex)) return;
    const cardCount = pile.cards.length - location.cardIndex;
    startDrag(event, location, cardCount, element);
  }, [startDrag]);
  const handleAutoComplete = React4.useCallback(() => {
    setIsAutoCompleting(true);
  }, []);
  const handleTestVictory = React4.useCallback(() => {
    triggerWin();
    setShowVictory(true);
  }, [triggerWin]);
  const handleNewGameFromOverlay = React4.useCallback(() => {
    newGame();
    setShowVictory(false);
    setSelectedCard(null);
    setIsAutoCompleting(false);
    setLaunchedCardIds(/* @__PURE__ */ new Set());
  }, [newGame]);
  const handleVictoryComplete = React4.useCallback(() => {
  }, []);
  const handleVictoryBounce = React4.useCallback(() => {
    soundsRef.current.play("bounce");
  }, []);
  const cardWidth = theme.card.width * scale;
  const cardHeight = theme.card.height * scale;
  const gap = theme.spacing.pileGap * scale;
  const padding = theme.spacing.tablePadding * scale;
  const minWidth = cardWidth * 7 + gap * 6 + padding * 2;
  const minHeight = cardHeight * 3 + gap * 2 + padding * 2 + 40;
  const draggedCards = React4.useMemo(() => {
    if (!dragState.isDragging || !dragState.source) return [];
    const pile = core.getPile(gameState, dragState.source);
    if (!pile) return [];
    return pile.cards.slice(dragState.source.cardIndex);
  }, [dragState.isDragging, dragState.source, gameState]);
  const canDoAutoComplete = core.canAutoComplete(gameState) && !isAutoCompleting && !gameState.isWon;
  const isGameOver = !gameState.isWon && !core.hasValidMoves(gameState);
  const canDrawFromStock = gameState.waste.cards.length > 0 && (gameState.config.unlimitedPasses || gameState.stockPasses < 3);
  const dragStateRef = React4.useRef(dragState);
  dragStateRef.current = dragState;
  const isValidDropTarget = React4.useCallback((loc) => {
    const currentDragState = dragStateRef.current;
    if (!currentDragState.source) return false;
    const pile = core.getPile(gameStateRef.current, currentDragState.source);
    if (!pile) return false;
    const cardCount = pile.cards.length - currentDragState.source.cardIndex;
    return core.isValidMove(gameStateRef.current, currentDragState.source, loc, cardCount);
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    SolitaireContainer,
    {
      ref: containerRef,
      $width: minWidth,
      $height: minHeight,
      className,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          Table,
          {
            gameState,
            theme,
            selectedCard,
            dropTarget: currentDropTarget?.location,
            isValidDropTarget,
            onStockClick: handleStockClick,
            onCardClick: handleCardClick,
            onCardDoubleClick: handleCardDoubleClick,
            onCardPointerDown: handleCardPointerDown,
            registerDropTarget,
            unregisterDropTarget,
            scale,
            hiddenCardIds: launchedCardIds,
            canDrawFromStock
          }
        ),
        dragState.isDragging && draggedCards.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(DragLayer, { children: /* @__PURE__ */ jsxRuntime.jsx(
          DraggedCardsContainer,
          {
            $x: dragState.currentX - dragState.offsetX,
            $y: dragState.currentY - dragState.offsetY,
            children: draggedCards.map((card, index) => /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  top: index * theme.spacing.tableauStackedVisible * scale
                },
                children: /* @__PURE__ */ jsxRuntime.jsx(
                  Card,
                  {
                    card,
                    theme,
                    scale,
                    isDragging: true
                  }
                )
              },
              card.id
            ))
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          AutoCompleteButton,
          {
            $font: theme.typography.uiFont,
            $visible: canDoAutoComplete,
            onClick: handleAutoComplete,
            children: "Auto Complete"
          }
        ),
        showTestButton && /* @__PURE__ */ jsxRuntime.jsx(
          TestButton,
          {
            $font: theme.typography.uiFont,
            onClick: handleTestVictory,
            title: "Test victory animation",
            children: "\u{1F3C6} Test Win"
          }
        ),
        isGameOver && /* @__PURE__ */ jsxRuntime.jsxs(NoMovesOverlay, { $font: theme.typography.uiFont, children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { children: "No Moves Available" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { children: "There are no more valid moves in this game." }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: handleNewGameFromOverlay, children: "New Game" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          StatusBar,
          {
            $font: theme.typography.uiFont,
            $fontSize: theme.typography.uiFontSize,
            $color: theme.colors.text,
            $bgColor: "rgba(0, 0, 0, 0.3)",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Score: ",
                gameState.score
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Time: ",
                timer.formatted
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                "Moves: ",
                gameState.moves
              ] })
            ]
          }
        ),
        showVictory && /* @__PURE__ */ jsxRuntime.jsx(
          VictoryAnimation,
          {
            gameState,
            theme,
            containerWidth: containerSize.width,
            containerHeight: containerSize.height,
            scale,
            onBounce: handleVictoryBounce,
            onComplete: handleVictoryComplete,
            onCardsLaunched: setLaunchedCardIds
          }
        )
      ]
    }
  );
}
var CARD_BACKS = [
  { id: "Back-Aquarium.gif", name: "Aquarium" },
  { id: "Back-CardHand.gif", name: "Card Hand" },
  { id: "Back-Castle.gif", name: "Castle" },
  { id: "Back-Fishes.gif", name: "Fishes" },
  { id: "Back-FlowerBlack.gif", name: "Flower (Black)" },
  { id: "Back-FlowerBlue.gif", name: "Flower (Blue)" },
  { id: "Back-PalmBeach.gif", name: "Palm Beach" },
  { id: "Back-Pattern1.gif", name: "Pattern 1" },
  { id: "Back-Pattern2.gif", name: "Pattern 2" },
  { id: "Back-Robot.gif", name: "Robot" },
  { id: "Back-Roses.gif", name: "Roses" },
  { id: "Back-Shell.gif", name: "Shell" }
];
var SelectorContainer = styled2__default.default.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #c0c0c0;
  border: 2px inset #ffffff;
`;
var SelectorTitle = styled2__default.default.div`
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
`;
var CardBackGrid = styled2__default.default.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;
var CardBackOption = styled2__default.default.button`
  width: 59px;
  height: 80px;
  padding: 2px;
  border: ${(p) => p.$isSelected ? "2px solid #000080" : "2px outset #ffffff"};
  background: ${(p) => p.$isSelected ? "#000080" : "#c0c0c0"};
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    border-color: #000080;
  }
  
  &:active {
    border-style: inset;
  }
`;
var CardBackImage = styled2__default.default.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Pixelated rendering for crisp upscaling */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;
function CardBackSelector({
  selected,
  onSelect,
  basePath = "/cards",
  className
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(SelectorContainer, { className, children: [
    /* @__PURE__ */ jsxRuntime.jsx(SelectorTitle, { children: "Select Card Back" }),
    /* @__PURE__ */ jsxRuntime.jsx(CardBackGrid, { children: CARD_BACKS.map((cardBack) => /* @__PURE__ */ jsxRuntime.jsx(
      CardBackOption,
      {
        $isSelected: selected === cardBack.id,
        onClick: () => onSelect(cardBack.id),
        title: cardBack.name,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          CardBackImage,
          {
            src: `${basePath}/${cardBack.id}`,
            alt: cardBack.name,
            draggable: false
          }
        )
      },
      cardBack.id
    )) })
  ] });
}

exports.CARD_BACKS = CARD_BACKS;
exports.Card = Card;
exports.CardBackSelector = CardBackSelector;
exports.Controls = Controls;
exports.Pile = Pile;
exports.Solitaire = Solitaire;
exports.Table = Table;
exports.Timer = Timer;
exports.VictoryAnimation = VictoryAnimation;
exports.defaultSoundConfig = defaultSoundConfig;
exports.defaultTheme = win31Theme;
exports.useDrag = useDrag;
exports.useGame = useGame;
exports.useSounds = useSounds;
exports.useStopwatch = useStopwatch;
exports.useTimer = useTimer;
exports.win31Theme = win31Theme;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map