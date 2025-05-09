import { EventBus } from "@/game/EventBus";
import type { GameEvents } from "@/game/EventBus";
import { useEffect } from "react";

export function usePhaserBridge<T>(eventName: GameEvents, callback: (...args: T[]) => void) {
  useEffect(() => {
    // Handler to call the callback with arguments
    const handler = (...args: T[]) => {
      callback(...args);
    };

    EventBus.on(eventName, handler);

    // Cleanup function to remove the listener
    return () => {
      EventBus.off(eventName, handler);
    };
  }, [eventName, callback]); // Re-subscribe if eventName or callback changes
} 