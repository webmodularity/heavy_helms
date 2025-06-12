"use client";
import { wagmiConfig } from "@/config";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { getChainId, switchChain, disconnect } from "@wagmi/core";
import { type ReactNode, createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { baseSepolia, shape } from "viem/chains";

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
  switchToPrimaryNetwork: (showToast?: boolean) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  currentChainId: shape.id,
  isWrongNetwork: false,
  checking: false,
  hasWallet: false,
  currentChainName: "Disconnected",
  switchToPrimaryNetwork: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [checking, setChecking] = useState(false);
  const { setActiveWallet } = useSetActiveWallet();

  // Get chain name or use "Unknown Network" as fallback
  const getChainName = (chainId: number) => {
    if (chainId === null) return "Disconnected";
    return CHAIN_NAMES[chainId] || `Unknown Network (${chainId})`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!ready || !authenticated || !wallets || wallets.length === 0) return;
    const injectedAddress = wallets.find(
      (wallet) => wallet.connectorType === "injected",
    );
    const embeddedAddress = wallets.find(
      (wallet) => wallet.connectorType === "embedded",
    );

    const primaryAddress = injectedAddress || embeddedAddress;
    if (primaryAddress) {
      setActiveWallet(primaryAddress);
    }
  }, [ready, authenticated, wallets]);

  // Check current chain when authenticated
  useEffect(() => {
    if (!ready || !authenticated || !wallets || wallets.length === 0) return;

    if (
      getChainId(wagmiConfig) !==
      (process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
        ? baseSepolia.id
        : shape.id)
    ) {
      // Don't show toast on automatic network switching during page load
      switchToPrimaryNetwork(false);
    }
  }, [ready, authenticated, wallets]);

  // Switch network function
  const switchToPrimaryNetwork = async (showToast = true) => {
    switchChain(wagmiConfig, {
      chainId:
        process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
          ? baseSepolia.id
          : shape.id,
    });
    if (showToast) {
      toast("Network switched", {
        description: `Successfully connected to ${process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia" ? "Base Sepolia" : "Shape"}`,
      });
    }
  };

  // Calculate derived state

  const hasWallet = Boolean(wallets && wallets.length > 0);
  const currentChainName = getChainName(getChainId(wagmiConfig));

  const value = {
    currentChainId: getChainId(wagmiConfig),
    isWrongNetwork:
      getChainId(wagmiConfig) !==
      (process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
        ? baseSepolia.id
        : shape.id),
    checking,
    hasWallet,
    currentChainName,
    switchToPrimaryNetwork,
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!ready || !authenticated) {
      disconnect(wagmiConfig);
    }
  }, [ready, authenticated, wagmiConfig]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
