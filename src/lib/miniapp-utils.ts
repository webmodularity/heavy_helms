import { sdk } from '@farcaster/miniapp-sdk';

/**
 * Utility functions for Farcaster Mini App interactions
 */

/**
 * Triggers haptic feedback using the Farcaster SDK
 * @param type - The type of haptic feedback to trigger
 */
export async function triggerHapticFeedback(type: 'impact' | 'notification' | 'selection', impactType?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid', notificationType?: 'success' | 'warning' | 'error'): Promise<void> {
  try {
    const capabilities = await sdk.getCapabilities();
    
    switch (type) {
      case 'impact':
        if (type === 'impact') {
          await sdk.haptics.impactOccurred(impactType || 'medium');
        }
        break;
      case 'notification':
        if (type === 'notification') {
          await sdk.haptics.notificationOccurred(notificationType || 'success');
        }
        break;
      case 'selection':
        if (type === 'selection') {
          await sdk.haptics.selectionChanged();
        }
        break;
    }
  } catch (error) {
    console.error('Haptic feedback failed:', error);
  }
}

/**
 * Predefined haptic feedback types for different actions
 */
export const HapticFeedback = {
  /** Light impact for basic interactions */
  TAP: () => triggerHapticFeedback('impact', 'light'),
  
  /** Medium impact for selections */
  SELECT: () => triggerHapticFeedback('selection'),
  
  /** Success notification for completed actions */
  SUCCESS: () => triggerHapticFeedback('notification', undefined, 'success'),
  
  /** Error notification for failed actions */
  ERROR: () => triggerHapticFeedback('notification', undefined, 'error'),
  
  /** Warning notification for cautionary actions */
  WARNING: () => triggerHapticFeedback('notification', undefined, 'warning'),
  
  /** Heavy impact for significant actions */
  ACTION: () => triggerHapticFeedback('impact', 'heavy')
} as const;

/**
 * Checks if haptic feedback is supported in the current environment
 * @returns boolean - Whether haptic feedback is supported
 */
export function isHapticFeedbackSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.vibrate;
} 