/**
 * Custom events used in the application
 */

// Add the custom event to the WindowEventMap
declare global {
  interface WindowEventMap {
    activateChallengesTab: CustomEvent;
  }
}

// Export a dummy object to make this file a module
export {}; 