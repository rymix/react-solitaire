import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Timer state
 */
export interface TimerState {
  /** Elapsed seconds */
  seconds: number;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Formatted time string (MM:SS) */
  formatted: string;
}

/**
 * Hook options
 */
export interface UseTimerOptions {
  /** Start time (timestamp) */
  startTime: number | null;
  /** End time (timestamp, if game is complete) */
  endTime: number | null;
  /** Update interval in ms */
  interval?: number;
}

/**
 * Format seconds as MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Hook for managing and displaying elapsed game time
 */
export function useTimer(options: UseTimerOptions): TimerState {
  const { startTime, endTime, interval = 1000 } = options;
  
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculateSeconds = useCallback(() => {
    if (!startTime) return 0;
    const end = endTime ?? Date.now();
    return Math.floor((end - startTime) / 1000);
  }, [startTime, endTime]);

  // Update on mount and when dependencies change
  useEffect(() => {
    setSeconds(calculateSeconds());
  }, [calculateSeconds]);

  // Set up interval for live updates
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only run interval if game is in progress (has start time, no end time)
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
    formatted,
  };
}

/**
 * Simple stopwatch hook for standalone timing
 */
export function useStopwatch() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const timer = useTimer({ startTime, endTime });

  const start = useCallback(() => {
    setStartTime(Date.now());
    setEndTime(null);
  }, []);

  const stop = useCallback(() => {
    if (startTime && !endTime) {
      setEndTime(Date.now());
    }
  }, [startTime, endTime]);

  const reset = useCallback(() => {
    setStartTime(null);
    setEndTime(null);
  }, []);

  const restart = useCallback(() => {
    setStartTime(Date.now());
    setEndTime(null);
  }, []);

  return {
    ...timer,
    start,
    stop,
    reset,
    restart,
  };
}
