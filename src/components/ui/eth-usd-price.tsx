"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EthPriceContextType {
  ethPrice: number | null;
  isLoading: boolean;
  error: Error | null;
}

const EthPriceContext = createContext<EthPriceContextType>({
  ethPrice: null,
  isLoading: true,
  error: null,
});

// Simple hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function EthPriceProvider({ children }: { children: React.ReactNode }) {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch ETH price"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEthPrice();
  }, []);

  return (
    <EthPriceContext.Provider value={{ ethPrice, isLoading, error }}>
      {children}
    </EthPriceContext.Provider>
  );
}

export function EthUsdPrice({ ethAmount }: { ethAmount: number }) {
  const { ethPrice, isLoading, error } = useContext(EthPriceContext);
  const isMobile = useIsMobile();

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error loading price</span>;

  const usdValue = ethPrice ? ethAmount * ethPrice : null;

  // On mobile, show the USD price inline
  if (isMobile) {
    return (
      <span>
        {ethAmount} ETH{" "}
        {usdValue && (
          <span className="text-stone-400">(~${usdValue.toFixed(3)} USD)</span>
        )}
      </span>
    );
  }

  // On desktop, use tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{ethAmount} ETH</span>
        </TooltipTrigger>
        <TooltipContent>
          {usdValue ? `~$${usdValue.toFixed(3)} USD` : "Price unavailable"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
