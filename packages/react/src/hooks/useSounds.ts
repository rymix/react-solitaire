import { useCallback, useMemo } from 'react';
import type { SoundConfig } from '../themes/types';

/**
 * Sound effect types
 */
export type SoundEffect = 
  | 'flip'
  | 'place'
  | 'pickup'
  | 'draw'
  | 'invalid'
  | 'victory'
  | 'bounce';

/**
 * Hook return type
 */
export interface UseSoundsReturn {
  /** Play a sound effect */
  play: (effect: SoundEffect, options?: { playbackRate?: number }) => void;
  /** Stop a sound effect */
  stop: (effect: SoundEffect) => void;
  /** Whether sounds are enabled */
  enabled: boolean;
  /** Set enabled state */
  setEnabled: (enabled: boolean) => void;
  /** Current volume */
  volume: number;
  /** Set volume */
  setVolume: (volume: number) => void;
}

/**
 * Default sound configuration
 */
export const defaultSoundConfig: SoundConfig = {
  enabled: true,
  volume: 0.5,
  sounds: {},
};

/**
 * Hook for managing game sound effects
 * 
 * This is a simplified version that works without use-sound.
 * When use-sound is available, it will use that for better
 * audio handling.
 */
export function useSounds(config: Partial<SoundConfig> = {}): UseSoundsReturn {
  const mergedConfig = useMemo(() => ({
    ...defaultSoundConfig,
    ...config,
    sounds: { ...defaultSoundConfig.sounds, ...config.sounds },
  }), [config]);

  // For now, we'll use the Web Audio API directly
  // This can be replaced with use-sound integration later
  const audioContext = useMemo(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      return new AudioContext();
    }
    return null;
  }, []);

  const play = useCallback((effect: SoundEffect, options: { playbackRate?: number } = {}) => {
    if (!mergedConfig.enabled || !audioContext) return;

    const soundUrl = mergedConfig.sounds[effect];
    if (!soundUrl) {
      // Generate a simple beep for missing sounds (development)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different effects
      const frequencies: Record<SoundEffect, number> = {
        flip: 800,
        place: 600,
        pickup: 700,
        draw: 500,
        invalid: 200,
        victory: 1000,
        bounce: 400,
      };
      
      oscillator.frequency.value = frequencies[effect];
      oscillator.type = 'sine';
      
      gainNode.gain.value = mergedConfig.volume * 0.3;
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      return;
    }

    // Load and play the actual sound
    fetch(soundUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => audioContext.decodeAudioData(buffer))
      .then(audioBuffer => {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.playbackRate.value = options.playbackRate ?? 1;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = mergedConfig.volume;
        
        source.start(0);
      })
      .catch(err => {
        console.warn(`Failed to play sound: ${effect}`, err);
      });
  }, [audioContext, mergedConfig]);

  const stop = useCallback((_effect: SoundEffect) => {
    // For Web Audio API, sounds are short enough that stopping isn't needed
    // With use-sound, this would call the stop function
  }, []);

  const setEnabled = useCallback((_enabled: boolean) => {
    // This would update state in a real implementation
    // For now, config is controlled by parent
  }, []);

  const setVolume = useCallback((_volume: number) => {
    // This would update state in a real implementation
    // For now, config is controlled by parent
  }, []);

  return {
    play,
    stop,
    enabled: mergedConfig.enabled,
    setEnabled,
    volume: mergedConfig.volume,
    setVolume,
  };
}

/**
 * Create a sound sprite configuration for use-sound
 * This bundles all sounds into a single file with markers
 */
export function createSoundSprite(_sounds: SoundConfig['sounds']): Record<string, [number, number]> {
  // This would be used to create sprite markers for a combined sound file
  // For now, return empty object
  return {};
}
