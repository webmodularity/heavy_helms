// src/store/farcaster-context.tsx
"use client";

import { sdk } from "@farcaster/frame-sdk";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";
import { useSetActiveWallet } from "@privy-io/wagmi";
import {
  type ReactNode,
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/**
 * Farcaster user profile information
 */
interface FarcasterUserProfile {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  verified?: boolean;
}

/**
 * Screen safe area insets to avoid UI elements being covered
 */
interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * Notification details for sending notifications to the user
 */
interface FrameNotificationDetails {
  url: string;
  token: string;
}

/**
 * Information about the current frame location/context
 */
interface FrameLocationContext {
  type: string;
  cast?: {
    fid: number;
    hash: string;
  };
  // Other location contexts as needed (channel, user, etc.)
}

/**
 * Information about the Farcaster client
 */
interface FarcasterClientInfo {
  clientFid: number;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets;
  notificationDetails?: FrameNotificationDetails;
}

/**
 * Complete Farcaster SDK context information
 */
interface FarcasterContextData {
  user?: FarcasterUserProfile;
  location?: FrameLocationContext;
  client?: FarcasterClientInfo;
}

/**
 * Wallet information associated with the Farcaster user
 */
interface ConnectedWallet {
  address: string;
  type: string; // ethereum, solana, etc.
  chainId?: string;
  isPrimary: boolean;
}

/**
 * Authentication status for Farcaster
 */
type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

/**
 * Farcaster context interface exposed to consumers
 */
interface FarcasterContextType {
  // Authentication state
  authStatus: AuthStatus;
  isInFarcasterClient: boolean;
  isReady: boolean;

  // User data
  // farcasterUser: FarcasterUserProfile | null;
  // connectedWallets: ConnectedWallet[];
  // primaryWallet: ConnectedWallet | null;

  // Raw SDK context
  sdkContext: FarcasterContextData | null;

  // Authentication methods
  // signIn: () => Promise<boolean>;

  // Wallet management
  // setActivePrimaryWallet: (walletAddress: string) => Promise<boolean>;

  // Frame actions
  signalReady: () => Promise<void>;
  addFrame: () => Promise<void>;
  closeFrame: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  viewProfile: (fid: number) => Promise<void>;

  // Raw access to Privy objects (for advanced use cases)
  privyUser: any;
}

// Create the context with default values
export const FarcasterContext = createContext<FarcasterContextType>({
  authStatus: "loading",
  isInFarcasterClient: false,
  isReady: false,
  //   farcasterUser: null,
  //   connectedWallets: [],
  //   primaryWallet: null,
  sdkContext: null,
  privyUser: null,
  //   signIn: async () => false,
  //   setActivePrimaryWallet: async () => false,
  signalReady: async () => {},
  addFrame: async () => {},
  closeFrame: async () => {},
  openUrl: async () => {},
  viewProfile: async () => {},
});

/**
 * Provider component for Farcaster integration
 * Handles authentication, wallet connections, and frame actions
 */
export function FarcasterProvider({ children }: { children: ReactNode }) {
  // State for Farcaster client detection
  const [isInFarcasterClient, setIsInFarcasterClient] =
    useState<boolean>(false);
  const [sdkContext, setSdkContext] = useState<FarcasterContextData | null>(
    null,
  );
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  // Get Privy hooks for authentication and wallet management
  const { ready, authenticated, user, linkWallet, connectWallet } = usePrivy();
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();
  const { wallets, ready: readyWallets } = useWallets();

  // Login to Mini App with Privy automatically
  useEffect(() => {
    if (ready && !authenticated) {
      console.log("should login");
      const login = async () => {
        // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
        const { nonce } = await initLoginToFrame();

        // Request a signature from Warpcast
        const result = await sdk.actions.signIn({ nonce: nonce });
        // Send the received signature from Warpcast to Privy for authentication
        await loginToFrame({
          message: result.message,
          signature: result.signature,
        });
      };
      login();
    }
  }, [ready, authenticated, initLoginToFrame, loginToFrame]);

  useEffect(() => {
    if (ready && authenticated && readyWallets) {
      signalReady();
    }
  }, [ready, authenticated, readyWallets]);

  /**
   * Signal to the Farcaster client that the app is ready to be displayed
   */
  const signalReady = useCallback(async (): Promise<void> => {
    // if (!isInFarcasterClient) return;

    try {
      await sdk.actions.ready();
      console.log("Signaled ready to Farcaster client");
    } catch (error) {
      console.error("Error in sdk.actions.ready():", error);
      toast.error("Failed to signal ready to Farcaster client");
    }
  }, []);

  /**
   * Request the user to add this frame to their favorites
   */
  const addFrame = useCallback(async (): Promise<void> => {
    if (!isInFarcasterClient) return;

    try {
      const result = await sdk.actions.addFrame();
      console.log("Add frame result:", result);

      //   if (result) {
      //     toast.success("App added successfully");
      //   } else {
      //     toast.error(
      //       result && result.reason
      //         ? `Failed to add app: ${result.reason}`
      //         : "User declined to add app",
      //     );
      //   }
    } catch (error) {
      console.error("Error in sdk.actions.addFrame():", error);
      toast.error("Failed to add app");
    }
  }, [isInFarcasterClient]);

  /**
   * Close the mini app frame
   */
  const closeFrame = useCallback(async (): Promise<void> => {
    if (!isInFarcasterClient) return;

    try {
      await sdk.actions.close();
    } catch (error) {
      console.error("Error in sdk.actions.close():", error);
    }
  }, [isInFarcasterClient]);

  /**
   * Open an external URL from the frame
   * Falls back to browser window.open if not in a Farcaster client
   */
  const openUrl = useCallback(
    async (url: string): Promise<void> => {
      if (!isInFarcasterClient) {
        // Fallback for non-Farcaster environments
        window.open(url, "_blank");
        return;
      }

      try {
        await sdk.actions.openUrl(url);
      } catch (error) {
        console.error("Error in sdk.actions.openUrl():", error);
        // Fallback if the Farcaster action fails
        window.open(url, "_blank");
      }
    },
    [isInFarcasterClient],
  );

  /**
   * View a Farcaster user's profile
   * @param fid The Farcaster ID of the user to view
   */
  const viewProfile = useCallback(
    async (fid: number): Promise<void> => {
      if (!isInFarcasterClient) return;

      try {
        await sdk.actions.viewProfile({ fid });
      } catch (error) {
        console.error(`Error viewing profile for FID ${fid}:`, error);
        toast.error("Failed to view profile");
      }
    },
    [isInFarcasterClient],
  );

  // Construct the context value
  const contextValue: FarcasterContextType = {
    authStatus,
    isInFarcasterClient,
    isReady: ready && authenticated,
    // farcasterUser,
    // connectedWallets,
    // primaryWallet,
    sdkContext,
    privyUser: user,
    // signIn,
    // setActivePrimaryWallet,
    signalReady,
    addFrame,
    closeFrame,
    openUrl,
    viewProfile,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      {children}
    </FarcasterContext.Provider>
  );
}

/**
 * Hook to use the Farcaster context in components
 * @returns The Farcaster context
 * @throws Error if used outside of a FarcasterProvider
 */
export function useFarcaster(): FarcasterContextType {
  const context = useContext(FarcasterContext);

  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }

  return context;
}
