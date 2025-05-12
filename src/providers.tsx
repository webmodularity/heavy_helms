"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { wagmiConfig } from "./config";
import { WagmiProvider } from "@privy-io/wagmi";
import { WalletProvider } from "./store/wallet-context";
import { FarcasterProvider } from "./store/farcaster-context";

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ["farcaster"],
        appearance: {
          theme: "dark",
          accentColor: "#f9c846", // Using your app's yellow color
        },
        // You can configure other Privy options here
        // farcaster: {
        //   enableFrames: true, // Enable Farcaster frames support
        // },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <FarcasterProvider>
            {/* <WalletProvider> */}
            {/* Initialize EventBus globally for Phaser games */}
            {children}
            {/* </WalletProvider> */}
          </FarcasterProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default Providers;
