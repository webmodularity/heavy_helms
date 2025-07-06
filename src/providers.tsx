"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MiniAppProvider } from "./store/miniapp-context";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config";

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MiniAppProvider>
          {children}
        </MiniAppProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default Providers;
