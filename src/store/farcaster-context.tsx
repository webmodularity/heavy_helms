// src/store/farcaster-context.tsx
"use client";

import { wagmiConfig } from "@/config";
import { sdk } from "@farcaster/frame-sdk";
import { usePrivy, useWallets, useIdentityToken } from "@privy-io/react-auth";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { disconnect, switchChain } from "@wagmi/core";
import {
  type ReactNode,
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { toast } from "sonner";
import { baseSepolia } from "wagmi/chains";

/**
 * Farcaster context interface exposed to consumers
 */
interface FarcasterContextType {
  isInFarcasterClient: boolean;
  isReady: boolean;
  // Frame actions
  signalReady: () => Promise<void>;
  addFrame: () => Promise<void>;
  closeFrame: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  viewProfile: (fid: number) => Promise<void>;
}

// Create the context with default values
export const FarcasterContext = createContext<FarcasterContextType>({
  isInFarcasterClient: false,
  isReady: false,
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

  // const { ready, authenticated } = usePrivy();
  const { setActiveWallet } = useSetActiveWallet();
  const [isBackendSynced, setIsBackendSynced] = useState<boolean>(false);
  const [hasAttemptedBackendRegistration, setHasAttemptedBackendRegistration] =
    useState(false);

  // Get Privy hooks for authentication and wallet management
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
  } = usePrivy();
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();
  const { wallets, ready: readyWallets } = useWallets();
  const { identityToken } = useIdentityToken();
  // Login to Mini App with Privy automatically
  useEffect(() => {
    if (privyReady && !privyAuthenticated && !privyUser) {
      console.log(
        "FarcasterProvider: Attempting Farcaster login via Mini App SDK",
      );
      const performLogin = async () => {
        try {
          const { nonce } = await initLoginToFrame();
          const result = await sdk.actions.signIn({ nonce: nonce });
          await loginToFrame({
            message: result.message,
            signature: result.signature,
          });
          console.log("FarcasterProvider: Privy loginToFrame successful");
        } catch (error) {
          console.error(
            "FarcasterProvider: Error during Farcaster login flow:",
            error,
          );
          toast.error("Farcaster login failed.");
        }
      };
      performLogin();
    }
  }, [
    privyReady,
    privyAuthenticated,
    privyUser,
    initLoginToFrame,
    loginToFrame,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!privyReady || !privyAuthenticated) {
      disconnect(wagmiConfig);
    }
  }, [privyReady, privyAuthenticated, wagmiConfig]);

  // Effect to register user with backend
  useEffect(() => {
    const registerUserWithBackend = async (token: string) => {
      setHasAttemptedBackendRegistration(true);
      // console.log(
      //   "FarcasterProvider: Attempting to register/login user with backend.",
      // );
      try {
        // Find the Warpcast injected wallet
        const warpcastWallet = wallets.find(
          (w) => w.walletClientType === "warpcast",
        );
        if (warpcastWallet) {
          setActiveWallet(warpcastWallet);
        }

        const response = await fetch("/api/user/register-or-login", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: `HTTP error ${response.status}` }));
          toast.error(
            `Backend sync failed: ${errorData.message || "Unknown error"}`,
          );
          setIsBackendSynced(false);
          return;
        }

        const data = await response.json();

        setIsBackendSynced(true);
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        console.error(
          "FarcasterProvider: Error registering user with backend (catch block):",
          error.message,
        );
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const responseFromError = (error as any).response as
          | Response
          | undefined;
        if (!responseFromError) {
          toast.error("Network error during backend sync.");
        }
        setIsBackendSynced(false);
      }
    };

    if (
      privyReady &&
      privyAuthenticated &&
      privyUser &&
      identityToken &&
      !hasAttemptedBackendRegistration
    ) {
      const farcasterAccount = privyUser.linkedAccounts.find(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (acc: any) => acc.type === "farcaster" && acc.firstVerifiedAt,
      );

      if (farcasterAccount) {
        registerUserWithBackend(identityToken);
      } else {
        console.log(
          "FarcasterProvider: User authenticated with Privy, but no verified Farcaster account for backend registration. No backend sync performed.",
        );
        setHasAttemptedBackendRegistration(true);
      }
    }
  }, [
    privyReady,
    privyAuthenticated,
    privyUser,
    identityToken,
    hasAttemptedBackendRegistration,
    wallets,
    setActiveWallet,
  ]);

  /**
   * Signal to the Farcaster client that the app is ready to be displayed
   */
  const signalReady = useCallback(async (): Promise<void> => {
    try {
      await sdk.actions.ready();
      console.log("Signaled ready to Farcaster client");
    } catch (error) {
      console.error("Error in sdk.actions.ready():", error);
      toast.error("Failed to signal ready to Farcaster client");
    }
  }, []);

  useEffect(() => {
    if (privyReady && privyAuthenticated && isBackendSynced) {
      switchChain(wagmiConfig, { chainId: baseSepolia.id });
      signalReady();
    }
  }, [privyReady, privyAuthenticated, isBackendSynced, signalReady]);

  /**
   * Request the user to add this frame to their favorites
   */
  const addFrame = useCallback(async (): Promise<void> => {
    if (!isInFarcasterClient) return;

    try {
      await sdk.actions.addFrame();
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
  const viewProfile = useCallback(async (fid: number): Promise<void> => {
    // if (!isInFarcasterClient) return;

    try {
      await sdk.actions.viewProfile({ fid });
    } catch (error) {
      console.error(`Error viewing profile for FID ${fid}:`, error);
      toast.error("Failed to view profile");
    }
  }, []);

  // Construct the context value
  const contextValue: FarcasterContextType = {
    isInFarcasterClient,
    isReady: privyReady && privyAuthenticated && isBackendSynced,
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
