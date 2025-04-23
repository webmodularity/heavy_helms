"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { baseSepolia, shape } from "viem/chains";
import { WalletProvider } from "./store/wallet-context";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "./config";

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email", "wallet", "farcaster", "twitter"],
        appearance: {
          theme: "dark",
          accentColor: "#f9c846",
          // logo: "/logo.png",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain:
          process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
            ? baseSepolia
            : shape,
        supportedChains:
          process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
            ? [baseSepolia]
            : [shape],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <WalletProvider>
            {/* Initialize EventBus globally for Phaser games */}
            {children}
          </WalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default Providers;
