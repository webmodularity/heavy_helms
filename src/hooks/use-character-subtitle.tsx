import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

// Common subtitle styling for consistency
const subtitleStyle = "text-yellow-400/90 text-sm font-medium tracking-widest";

export function useCharacterSubtitle(ownerAddress?: string, id?: string) {
  // ENS resolution
  const { data: ensName, isLoading } = useEnsName({
    address: ownerAddress as `0x${string}` | undefined,
    chainId: mainnet.id,
  });

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper to generate the appropriate subtitle element
  const getSubtitle = (): ReactNode | string => {
    // Check if this is a system entity (default player or monster)
    const isSystemEntity = !ownerAddress && !!id && Number.parseInt(id) < 10001;

    if (!ownerAddress) {
      return isSystemEntity ? (
        <span className="font-pixel text-pixel-xs text-warning font-bold uppercase tracking-widest pixel-perfect retro-glow">
          GAME OWNED
        </span>
      ) : (
        <span className="font-pixel text-pixel-sm text-primary/60 pixel-perfect">
          ID: {id}
        </span>
      );
    }

    // Has owner - show loading state or resolved name
    if (isLoading) {
      return (
        <Skeleton 
          className="h-3 w-32 bg-primary/10 border border-primary/20 rounded-pixel-sm retro-glow" 
          shimmer={true}
        />
      );
    }

    // Show ENS or full address with retro styling
    const displayName = ensName || truncateAddress(ownerAddress);
    
    return (
      <span className="font-pixel text-pixel-sm text-primary/80 font-medium tracking-wider pixel-perfect">
        {ensName ? (
          // ENS names get special treatment with subtle glow
          <span className="text-secondary retro-glow">
            {ensName}
          </span>
        ) : (
          // Truncated addresses get muted styling
          <span className="text-primary/60 font-mono">
            {truncateAddress(ownerAddress)}
          </span>
        )}
      </span>
    );
  };

  return { subtitle: getSubtitle() };
}
