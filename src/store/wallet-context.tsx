"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { getChainId } from "viem/actions";
import { baseSepolia } from "viem/chains";

// Base Sepolia Chain ID
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Chain name mapping
export const CHAIN_NAMES: Record<string, string> = {
  "eip155:1": "Ethereum Mainnet",
  "eip155:5": "Goerli Testnet",
  "eip155:11155111": "Sepolia Testnet",
  "eip155:84532": "Base Sepolia",
  "eip155:8453": "Base",
  "eip155:137": "Polygon",
  "eip155:80001": "Polygon Mumbai",
  "eip155:42161": "Arbitrum One",
  "eip155:421613": "Arbitrum Goerli",
};

interface WalletContextType {
  currentChainId: string | null;
  isWrongNetwork: boolean;
  checking: boolean;
  hasWallet: boolean;
  currentChainName: string;
  switchToBaseSepolia: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  currentChainId: null,
  isWrongNetwork: false,
  checking: false,
  hasWallet: false,
  currentChainName: "Disconnected",
  switchToBaseSepolia: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Get chain name or use "Unknown Network" as fallback
  const getChainName = (chainId: string | null) => {
    if (chainId === null) return "Disconnected";
    return CHAIN_NAMES[chainId] || `Unknown Network (${chainId})`;
  };

  // Check current chain when authenticated
  useEffect(() => {
    if (!ready || !authenticated || !wallets || wallets.length === 0) return;

    const checkChain = async () => {
      try {
        setChecking(true);
        const wallet = wallets[0]; // Get the first wallet

        // Get current chain directly from wallet object
        const chainId = wallet.chainId;
        console.log("chainId", chainId);
        setCurrentChainId(chainId);
      } catch (error) {
        console.error("Failed to get chain ID:", error);
      } finally {
        setChecking(false);
      }
    };

    checkChain();
  }, [ready, authenticated, wallets]);

  // Switch network function
  const switchToBaseSepolia = useCallback(async () => {
    if (!wallets || wallets.length === 0) return;

    try {
      const wallet = wallets[0]; // Get the first wallet

      // Use the switchChain method directly on the wallet object
      await wallet.switchChain(BASE_SEPOLIA_CHAIN_ID);

      toast("Network switched", {
        description: "Successfully connected to Base Sepolia",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to switch networks";
      toast("Network switch failed", {
        description: errorMessage,
        style: { backgroundColor: "rgb(239, 68, 68)", color: "white" },
      });
    }
  }, [wallets]);

  // Calculate derived state
  const isWrongNetwork =
    currentChainId !== null && currentChainId !== "eip155:84532";
  console.log({ currentChainId, baseSepoliaId: baseSepolia.id });
  const hasWallet = Boolean(wallets && wallets.length > 0);
  const currentChainName = getChainName(currentChainId);

  const value = {
    currentChainId,
    isWrongNetwork,
    checking,
    hasWallet,
    currentChainName,
    switchToBaseSepolia,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
