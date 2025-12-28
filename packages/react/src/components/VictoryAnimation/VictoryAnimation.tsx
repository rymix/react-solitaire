import React, { useEffect, useRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { type Card as CardType, type GameState } from '@react-solitaire/core';
import type { SolitaireTheme } from '../../themes/types';
import { Card } from '../Card';

/**
 * VictoryAnimation component props
 */
export interface VictoryAnimationProps {
  /** Game state (to get foundation cards) */
  gameState: GameState;
  /** Theme for styling */
  theme: SolitaireTheme;
  /** Container dimensions */
  containerWidth: number;
  containerHeight: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Scale factor */
  scale?: number;
  /** Play bounce sound (throttled internally) */
  onBounce?: () => void;
  /** Callback with IDs of cards that have been launched (to hide from foundations) */
  onCardsLaunched?: (cardIds: Set<string>) => void;
}

/**
 * Physics state for a bouncing card (kept in ref, not React state)
 */
interface CardPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  launched: boolean;
  launchTime: number;
  opacity: number;
  trailPositions: Array<{ x: number; y: number; rotation: number; opacity: number }>;
}

const AnimationContainer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1000;
`;

const CardSlot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform, opacity;
  visibility: hidden;
`;

const TrailSlot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform, opacity;
  visibility: hidden;
`;

// Physics constants
const GRAVITY = 0.4;
const BOUNCE_DAMPING = 0.75;
const HORIZONTAL_SPEED_MIN = 3;
const HORIZONTAL_SPEED_MAX = 6;
const INITIAL_VERTICAL_SPEED = -12;
const TRAIL_LENGTH = 6;
const TRAIL_FADE_RATE = 0.15;
const CARD_LAUNCH_DELAY = 120;
const ROTATION_SPEED_MAX = 8;
const CARD_LIFETIME = 5000; // 5 seconds before card is removed
const FADE_START_TIME = 3000; // Start fading at 3 seconds
const FADE_DURATION = 2000; // Fade over 2 seconds
const BOUNCE_SOUND_THROTTLE = 100; // Minimum ms between bounce sounds

/**
 * VictoryAnimation component - optimised for smooth 60fps animation
 * Pre-renders all cards once, then uses pure DOM manipulation for physics
 */
export const VictoryAnimation = React.memo(function VictoryAnimation({
  gameState,
  theme,
  containerWidth,
  containerHeight,
  onComplete,
  scale = 1,
  onBounce,
  onCardsLaunched,
}: VictoryAnimationProps) {
  // State to track if animation is active (for cleanup)
  const [isActive, setIsActive] = useState(true);
  
  // Refs for DOM elements
  const cardSlotsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const trailSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Refs for animation state
  const physicsRef = useRef<CardPhysics[]>([]);
  const animationRef = useRef<number | null>(null);
  const launchIndexRef = useRef(0);
  const lastLaunchTimeRef = useRef(0);
  const completedRef = useRef(false);
  const launchedIdsRef = useRef<Set<string>>(new Set());
  const animationStartTimeRef = useRef(0);
  const lastBounceTimeRef = useRef(0);
  
  // Stable refs for callbacks
  const onCompleteRef = useRef(onComplete);
  const onCardsLaunchedRef = useRef(onCardsLaunched);
  const onBounceRef = useRef(onBounce);
  onCompleteRef.current = onComplete;
  onCardsLaunchedRef.current = onCardsLaunched;
  onBounceRef.current = onBounce;

  const cardWidth = theme.card.width * scale;
  const cardHeight = theme.card.height * scale;
  const pileGap = theme.spacing.pileGap * scale;
  const padding = theme.spacing.tablePadding * scale;

  // Pre-compute all cards to animate (only recalculate when foundations change)
  const cardsToAnimate = useMemo(() => {
    const cards: Array<{ card: CardType; foundationIndex: number; uniqueKey: string }> = [];
    // Interleave from King down to Ace across all foundations
    for (let rank = 12; rank >= 0; rank--) {
      for (let foundationIndex = 0; foundationIndex < 4; foundationIndex++) {
        const foundation = gameState.foundations[foundationIndex];
        if (foundation.cards[rank]) {
          const card = foundation.cards[rank];
          cards.push({ 
            card, 
            foundationIndex,
            uniqueKey: `victory-${card.id}-${foundationIndex}-${rank}`,
          });
        }
      }
    }
    return cards;
  }, [gameState.foundations]);

  // Calculate foundation start position
  const getFoundationX = (foundationIndex: number) => {
    const foundationsWidth = (cardWidth * 4) + (pileGap * 3);
    const rightEdge = containerWidth - padding;
    const foundationsStartX = rightEdge - foundationsWidth;
    return foundationsStartX + (foundationIndex * (cardWidth + pileGap));
  };

  // Initialise physics state and start animation
  useEffect(() => {
    if (!isActive) return;
    
    // Reset state
    launchIndexRef.current = 0;
    lastLaunchTimeRef.current = 0;
    completedRef.current = false;
    launchedIdsRef.current = new Set();
    animationStartTimeRef.current = performance.now();
    
    // Initialise physics for each card
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
      trailPositions: [],
    }));

    // Hide all slots initially
    cardSlotsRef.current.forEach(el => {
      el.style.visibility = 'hidden';
    });
    trailSlotsRef.current.forEach(el => {
      el.style.visibility = 'hidden';
    });

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      // Launch cards periodically
      if (launchIndexRef.current < cardsToAnimate.length) {
        if (currentTime - lastLaunchTimeRef.current > CARD_LAUNCH_DELAY) {
          const idx = launchIndexRef.current;
          const { card, foundationIndex } = cardsToAnimate[idx];
          const physics = physicsRef.current[idx];
          
          // Initialise physics for launch
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

          // Show the card slot
          const cardEl = cardSlotsRef.current.get(idx);
          if (cardEl) {
            cardEl.style.visibility = 'visible';
            cardEl.style.opacity = '1';
            cardEl.style.transform = `translate(${physics.x}px, ${physics.y}px) rotate(0deg)`;
          }

          // Track launched card IDs
          launchedIdsRef.current.add(card.id);
          onCardsLaunchedRef.current?.(new Set(launchedIdsRef.current));

          launchIndexRef.current++;
          lastLaunchTimeRef.current = currentTime;
        }
      }

      // Update physics for all launched cards
      let activeCount = 0;
      
      for (let i = 0; i < physicsRef.current.length; i++) {
        const physics = physicsRef.current[i];
        if (!physics.launched) continue;

        const cardAge = currentTime - physics.launchTime;
        
        // Remove card after lifetime expires
        if (cardAge > CARD_LIFETIME) {
          physics.launched = false;
          const cardEl = cardSlotsRef.current.get(i);
          if (cardEl) cardEl.style.visibility = 'hidden';
          for (let t = 0; t < TRAIL_LENGTH; t++) {
            const trailEl = trailSlotsRef.current.get(`${i}-${t}`);
            if (trailEl) trailEl.style.visibility = 'hidden';
          }
          continue;
        }

        activeCount++;

        // Calculate fade based on age
        if (cardAge > FADE_START_TIME) {
          physics.opacity = 1 - ((cardAge - FADE_START_TIME) / FADE_DURATION);
          physics.opacity = Math.max(0, Math.min(1, physics.opacity));
        }

        // Update trail
        physics.trailPositions = [
          { x: physics.x, y: physics.y, rotation: physics.rotation, opacity: physics.opacity },
          ...physics.trailPositions.slice(0, TRAIL_LENGTH - 1).map(t => ({
            ...t,
            opacity: t.opacity * (1 - TRAIL_FADE_RATE),
          })),
        ].filter(t => t.opacity > 0.01);

        // Apply physics
        physics.vy += GRAVITY * deltaTime;
        physics.y += physics.vy * deltaTime;
        physics.x += physics.vx * deltaTime;
        physics.rotation += physics.rotationSpeed * deltaTime;

        // Bounce off bottom
        if (physics.y + cardHeight > containerHeight) {
          physics.y = containerHeight - cardHeight;
          physics.vy = -physics.vy * BOUNCE_DAMPING;
          
          // Play bounce sound (throttled)
          if (currentTime - lastBounceTimeRef.current > BOUNCE_SOUND_THROTTLE) {
            lastBounceTimeRef.current = currentTime;
            onBounceRef.current?.();
          }
        }

        // Bounce off sides
        if (physics.x < 0) {
          physics.x = 0;
          physics.vx = -physics.vx * BOUNCE_DAMPING;
        } else if (physics.x + cardWidth > containerWidth) {
          physics.x = containerWidth - cardWidth;
          physics.vx = -physics.vx * BOUNCE_DAMPING;
        }

        // Update DOM directly
        const cardEl = cardSlotsRef.current.get(i);
        if (cardEl) {
          cardEl.style.transform = `translate(${physics.x}px, ${physics.y}px) rotate(${physics.rotation}deg)`;
          cardEl.style.opacity = String(physics.opacity);
        }

        // Update trails
        for (let t = 0; t < TRAIL_LENGTH; t++) {
          const trailEl = trailSlotsRef.current.get(`${i}-${t}`);
          if (trailEl) {
            const trail = physics.trailPositions[t];
            if (trail && trail.opacity > 0.01) {
              trailEl.style.visibility = 'visible';
              trailEl.style.transform = `translate(${trail.x}px, ${trail.y}px) rotate(${trail.rotation}deg)`;
              trailEl.style.opacity = String(trail.opacity * 0.5);
            } else {
              trailEl.style.visibility = 'hidden';
            }
          }
        }
      }

      // Check completion - all cards launched and all have expired
      const allLaunched = launchIndexRef.current >= cardsToAnimate.length;
      if (allLaunched && activeCount === 0 && !completedRef.current && cardsToAnimate.length > 0) {
        completedRef.current = true;
        setIsActive(false);
        setTimeout(() => onCompleteRef.current?.(), 100);
        return; // Stop animation loop
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

  // Register card slot ref
  const setCardSlotRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) cardSlotsRef.current.set(index, el);
  };

  // Register trail slot ref
  const setTrailSlotRef = (cardIndex: number, trailIndex: number) => (el: HTMLDivElement | null) => {
    if (el) trailSlotsRef.current.set(`${cardIndex}-${trailIndex}`, el);
  };

  if (!isActive && completedRef.current) {
    return null; // Remove from DOM after completion
  }

  return (
    <AnimationContainer>
      {/* Pre-render all card slots with their trails */}
      {cardsToAnimate.map(({ card, uniqueKey }, cardIndex) => (
        <React.Fragment key={uniqueKey}>
          {/* Trail slots for this card */}
          {Array.from({ length: TRAIL_LENGTH }, (_, trailIndex) => (
            <TrailSlot
              key={`${uniqueKey}-trail-${trailIndex}`}
              ref={setTrailSlotRef(cardIndex, trailIndex)}
            >
              <Card card={card} theme={theme} scale={scale} />
            </TrailSlot>
          ))}
          {/* Main card slot */}
          <CardSlot key={`${uniqueKey}-main`} ref={setCardSlotRef(cardIndex)}>
            <Card card={card} theme={theme} scale={scale} />
          </CardSlot>
        </React.Fragment>
      ))}
    </AnimationContainer>
  );
});

export default VictoryAnimation;
