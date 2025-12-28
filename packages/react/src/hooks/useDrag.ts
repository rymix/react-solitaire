import { useState, useCallback, useRef, useEffect } from 'react';
import type { CardLocation } from '@react-solitaire/core';

/**
 * Drag state information
 */
export interface DragState {
  /** Whether a drag is in progress */
  isDragging: boolean;
  /** Source location of the drag */
  source: CardLocation | null;
  /** Number of cards being dragged */
  cardCount: number;
  /** Current X position relative to viewport */
  currentX: number;
  /** Current Y position relative to viewport */
  currentY: number;
  /** Starting X position */
  startX: number;
  /** Starting Y position */
  startY: number;
  /** Offset from card top-left to pointer */
  offsetX: number;
  /** Offset from card top-left to pointer */
  offsetY: number;
}

/**
 * Drop target information
 */
export interface DropTarget {
  /** Location of the drop target */
  location: CardLocation;
  /** Whether the drop is valid */
  isValid: boolean;
  /** Bounding rect of the target element */
  rect: DOMRect;
}

/**
 * Hook options
 */
export interface UseDragOptions {
  /** Callback when drag starts */
  onDragStart?: (source: CardLocation, cardCount: number) => void;
  /** Callback during drag */
  onDragMove?: (x: number, y: number) => void;
  /** Callback when drag ends (with or without drop) */
  onDragEnd?: (source: CardLocation, target: CardLocation | null, cardCount: number) => void;
  /** Callback when dropped on a valid target */
  onDrop?: (source: CardLocation, target: CardLocation, cardCount: number) => void;
  /** Function to check if a drop target is valid */
  isValidDrop?: (source: CardLocation, target: CardLocation, cardCount: number) => boolean;
  /** Minimum distance before drag starts (prevents accidental drags) */
  dragThreshold?: number;
}

/**
 * Hook return type
 */
export interface UseDragReturn {
  /** Current drag state */
  dragState: DragState;
  /** Start a drag operation */
  startDrag: (
    event: React.PointerEvent,
    source: CardLocation,
    cardCount: number,
    cardElement: HTMLElement
  ) => void;
  /** Cancel the current drag */
  cancelDrag: () => void;
  /** Register a drop target */
  registerDropTarget: (location: CardLocation, element: HTMLElement) => void;
  /** Unregister a drop target */
  unregisterDropTarget: (location: CardLocation) => void;
  /** Current drop target (if hovering over one) */
  currentDropTarget: DropTarget | null;
}

const initialDragState: DragState = {
  isDragging: false,
  source: null,
  cardCount: 0,
  currentX: 0,
  currentY: 0,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
};

/**
 * Hook for managing drag and drop with unified mouse/touch support
 */
export function useDrag(options: UseDragOptions = {}): UseDragReturn {
  const { dragThreshold = 5 } = options;

  // Store all callbacks in a ref to avoid recreating handlers
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const [currentDropTarget, setCurrentDropTarget] = useState<DropTarget | null>(null);
  
  const dropTargetsRef = useRef<Map<string, { location: CardLocation; element: HTMLElement }>>(
    new Map()
  );
  const dragStartedRef = useRef(false);
  const pendingDragRef = useRef<{
    source: CardLocation;
    cardCount: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    element: HTMLElement;
    pointerId: number;
  } | null>(null);

  /**
   * Create a unique key for a card location
   */
  const locationKey = (loc: CardLocation): string => {
    return `${loc.pileType}-${loc.pileIndex}-${loc.cardIndex}`;
  };

  /**
   * Find drop target at a given position
   * Uses padding to make drop detection more forgiving
   */
  const findDropTarget = useCallback((
    x: number, 
    y: number, 
    source: CardLocation, 
    cardCount: number
  ): DropTarget | null => {
    const PADDING = 15; // Extra pixels of tolerance around drop zones
    
    for (const { location, element } of dropTargetsRef.current.values()) {
      const rect = element.getBoundingClientRect();
      // Add padding to make drops easier
      const paddedRect = {
        left: rect.left - PADDING,
        right: rect.right + PADDING,
        top: rect.top - PADDING,
        bottom: rect.bottom + PADDING,
      };
      
      if (x >= paddedRect.left && x <= paddedRect.right && 
          y >= paddedRect.top && y <= paddedRect.bottom) {
        const isValid = optionsRef.current.isValidDrop?.(source, location, cardCount) ?? true;
        return { location, isValid, rect };
      }
    }
    return null;
  }, []);

  /**
   * Handle pointer move during drag
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const pending = pendingDragRef.current;
    if (!pending) return;

    const x = event.clientX;
    const y = event.clientY;

    // Check if we should start the actual drag (passed threshold)
    if (!dragStartedRef.current) {
      const dx = x - pending.startX;
      const dy = y - pending.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= dragThreshold) {
        dragStartedRef.current = true;
        
        // Now capture the pointer for drag tracking
        try {
          pending.element.setPointerCapture(pending.pointerId);
        } catch {
          // Pointer capture may fail if pointer was released
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
          offsetY: pending.offsetY,
        });

        optionsRef.current.onDragStart?.(pending.source, pending.cardCount);
      }
      return;
    }

    // Update position during drag
    setDragState(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
    }));

    optionsRef.current.onDragMove?.(x, y);

    // Find drop target
    const target = findDropTarget(x, y, pending.source, pending.cardCount);
    setCurrentDropTarget(target);
  }, [dragThreshold, findDropTarget]);

  /**
   * Handle pointer up (end drag)
   */
  const handlePointerUp = useCallback((event: PointerEvent) => {
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

  /**
   * Handle pointer cancel (e.g., touch interrupted)
   */
  const handlePointerCancel = useCallback(() => {
    const pending = pendingDragRef.current;
    
    if (dragStartedRef.current && pending) {
      optionsRef.current.onDragEnd?.(pending.source, null, pending.cardCount);
    }

    setDragState(initialDragState);
    setCurrentDropTarget(null);
    dragStartedRef.current = false;
    pendingDragRef.current = null;
  }, []);

  /**
   * Start a drag operation
   */
  const startDrag = useCallback((
    event: React.PointerEvent,
    source: CardLocation,
    cardCount: number,
    cardElement: HTMLElement
  ) => {
    const rect = cardElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // Store pending drag info (won't start until threshold is met)
    // Don't capture pointer yet - let click/double-click events work
    pendingDragRef.current = {
      source,
      cardCount,
      startX: event.clientX,
      startY: event.clientY,
      offsetX,
      offsetY,
      element: cardElement,
      pointerId: event.pointerId,
    };
  }, []);

  /**
   * Cancel the current drag
   */
  const cancelDrag = useCallback(() => {
    handlePointerCancel();
  }, [handlePointerCancel]);

  /**
   * Register a drop target
   */
  const registerDropTarget = useCallback((location: CardLocation, element: HTMLElement) => {
    dropTargetsRef.current.set(locationKey(location), { location, element });
  }, []);

  /**
   * Unregister a drop target
   */
  const unregisterDropTarget = useCallback((location: CardLocation) => {
    dropTargetsRef.current.delete(locationKey(location));
  }, []);

  // Set up global event listeners - stable handlers due to refs
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel]);

  return {
    dragState,
    startDrag,
    cancelDrag,
    registerDropTarget,
    unregisterDropTarget,
    currentDropTarget,
  };
}
