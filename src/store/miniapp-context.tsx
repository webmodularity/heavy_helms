"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { baseSepolia } from "viem/chains";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";

// Base Sepolia Chain ID (only network we support)
export const BASE_SEPOLIA_CHAIN_ID = 84532;

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
}

interface MiniAppContextType {
  // Farcaster Auth State
  isInFarcaster: boolean;
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // retry: () => void;

  // Wallet State
  currentChainId: number;
  isWrongNetwork: boolean;
  hasWallet: boolean;
  currentChainName: string;
  walletAddress: string | null;
  isConnecting: boolean;
  isConnected: boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  // Farcaster Auth Defaults
  isInFarcaster: false,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  // retry: () => {},

  // Wallet Defaults
  currentChainId: baseSepolia.id,
  isWrongNetwork: false,
  hasWallet: false,
  currentChainName: "Base Sepolia",
  walletAddress: null,
  isConnecting: false,
  isConnected: false,
});

export function MiniAppProvider({ children }: { children: ReactNode }) {
  // Farcaster Auth State
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [contextInitialized, setContextInitialized] = useState(false);

  // Wagmi Wallet Hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const initializeFarcaster = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🚀 Initializing Farcaster SDK...");

      // Get the context to check if we're in Farcaster and get user info
      // But don't call ready() yet - wait for wallet connection
      console.log("📱 Getting Farcaster context...");
      const context = await sdk.context;
      await sdk.back.enableWebNavigation();
      console.log("📱 Farcaster context:", context);

      if (context) {
        setIsInFarcaster(true);
        console.log("✅ Running in Farcaster environment");

        // In a Farcaster MiniApp, user should always be available
        if (context.user) {
          const userData = {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          };

          setUser(userData);
          console.log("👤 User authenticated:", userData);
        } else {
          console.warn(
            "⚠️ No user in context - this shouldn't happen in a MiniApp",
          );
          setError("No user context available");
        }
      } else {
        console.error("❌ Not running in Farcaster environment");
        setIsInFarcaster(false);
        setError("This app must be run within Farcaster");
      }

      setContextInitialized(true);
    } catch (error) {
      console.error("💥 Farcaster SDK initialization failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize SDK",
      );
      setIsInFarcaster(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Farcaster SDK on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Add a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      initializeFarcaster();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Auto-connect wallet when user is authenticated in Farcaster
  useEffect(() => {
    const attemptAutoConnect = async () => {
      // Only try to auto-connect if:
      // 1. Context is initialized
      // 2. User is authenticated in Farcaster
      // 3. We're running in Farcaster environment
      // 4. Wallet is not already connected
      // 5. We haven't attempted auto-connect yet
      // 6. Auth is not loading
      // 7. We have connectors available
      if (
        contextInitialized &&
        !!user &&
        isInFarcaster &&
        !isConnected &&
        // !autoConnectAttempted &&
        !isLoading &&
        connectors.length > 0
      ) {
        try {
          // Use the first (and only) connector - the Farcaster MiniApp connector
          const connector = connectors[0];
          if (connector) {
            connect({ connector });
            console.log("✅ Auto-connected to wallet successfully");
          } else {
            console.error("❌ No connector available");
          }
        } catch (error) {
          console.error("💥 Auto-connect failed:", error);
          // Don't show error toast for auto-connect failures
        }
      }
    };

    attemptAutoConnect();
  }, [
    contextInitialized,
    user,
    isInFarcaster,
    isConnected,
    isLoading,
    connect,
    connectors,
  ]);

  // Call sdk.actions.ready() only when wallet is connected
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const callReady = async () => {
      if (
        contextInitialized &&
        isInFarcaster &&
        !!user &&
        isConnected &&
        address &&
        !isLoading
      ) {
        try {
          console.log("📞 Calling sdk.actions.ready() - wallet is connected!");
          await sdk.actions.ready();
        } catch (error) {
          console.error("💥 Failed to call sdk.actions.ready():", error);
          setError(
            error instanceof Error ? error.message : "Failed to initialize SDK",
          );
        }
      }
    };

    callReady();
  }, [contextInitialized, isInFarcaster, user, isConnected, address]);

  // Auto-disconnect when user is no longer authenticated
  useEffect(() => {
    if (!user && isConnected) {
      console.log(
        "🔌 Auto-disconnecting wallet (user no longer authenticated)",
      );
      disconnect();
    }
  }, [user, isConnected, disconnect]);

  const value = {
    // Farcaster Auth State
    isInFarcaster,
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    // retry,

    // Wallet State
    currentChainId: chainId || baseSepolia.id,
    isWrongNetwork: (chainId || baseSepolia.id) !== baseSepolia.id,
    hasWallet: !!address,
    currentChainName: "Base Sepolia",
    walletAddress: address || null,
    isConnecting: isPending,
    isConnected,
  };

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  );
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }
  return context;
}

// Legacy exports for backward compatibility
export const useFarcasterAuth = useMiniApp;
export const useWallet = useMiniApp;
