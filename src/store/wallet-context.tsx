"use client";
import { wagmiConfig } from "@/config";

import { getChainId, switchChain } from "@wagmi/core";
import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useConnect } from "wagmi";
import { baseSepolia, base, shape } from "wagmi/chains";

// Base Sepolia Chain ID
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Chain name mapping
export const CHAIN_NAMES: Record<string, string> = {
  360: "Shape",
  84532: "Base Sepolia",
};

interface WalletContextType {
  currentChainId: number;
  isWrongNetwork: boolean;
  checking: boolean;
  hasWallet: boolean;
  currentChainName: string;
  switchToPrimaryNetwork: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  currentChainId: baseSepolia.id,
  isWrongNetwork: false,
  checking: false,
  hasWallet: false,
  currentChainName: "Disconnected",
  switchToPrimaryNetwork: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(false);
  // const { setActiveWallet } = useSetActiveWallet();

  // Get chain name or use "Unknown Network" as fallback
  const getChainName = (chainId: number) => {
    if (chainId === null) return "Disconnected";
    return CHAIN_NAMES[chainId] || `Unknown Network (${chainId})`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if (!ready || !authenticated || !wallets || wallets.length === 0) return;
  //   const injectedAddress = wallets.find(
  //     (wallet) => wallet.connectorType === "injected",
  //   );
  //   const embeddedAddress = wallets.find(
  //     (wallet) => wallet.connectorType === "embedded",
  //   );

  //   const primaryAddress = injectedAddress || embeddedAddress;
  //   if (primaryAddress) {
  //     setActiveWallet(primaryAddress);
  //   }
  // }, [ready, authenticated, wallets]);

  // Check current chain when authenticated
  useEffect(() => {
    switchToPrimaryNetwork();
    // if (getChainId(wagmiConfig) !== shape.id) {
    if (getChainId(wagmiConfig) !== baseSepolia.id) {
      switchToPrimaryNetwork();
    }
  }, []);

  // Switch network function
  const switchToPrimaryNetwork = async () => {
    switchChain(wagmiConfig, { chainId: baseSepolia.id });
  };

  // Calculate derived state

  // const hasWallet = Boolean(wallets && wallets.length > 0);
  const currentChainName = getChainName(getChainId(wagmiConfig));

  const value = {
    currentChainId: getChainId(wagmiConfig),
    isWrongNetwork: getChainId(wagmiConfig) !== baseSepolia.id,
    checking,
    hasWallet: true,
    currentChainName,
    switchToPrimaryNetwork,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
