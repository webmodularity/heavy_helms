"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WalletProvider } from "./store/wallet-context";
import { wagmiConfig } from "./config";
import { WagmiProvider } from "wagmi";

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <WalletProvider>
          {/* Initialize EventBus globally for Phaser games */}
          {children}
        </WalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default Providers;
