"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

interface FarcasterReadyProps {
  children: React.ReactNode;
}

/**
 * Component that calls sdk.actions.ready() when mounted.
 * This signals to the Farcaster client that the app's UI is ready to be displayed,
 * hiding the initial loading splash screen.
 */
export function FarcasterReady({ children }: FarcasterReadyProps) {
  useEffect(() => {
    // Call ready() immediately to dismiss the Farcaster client's splash screen
    // We now assume the UI (at least the main menu) is ready quickly.
    sdk.actions.ready().catch((error) => {
      // Optional: Handle potential errors if the ready call fails
      // This might happen if the app isn't running inside a Farcaster client
      // or if there's an issue with the SDK communication.
      // For now, we'll log it, but you might want more robust handling.
      console.debug(
        "Farcaster SDK ready() call failed or not in Farcaster client:",
        error,
      );
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  return <>{children}</>;
}
