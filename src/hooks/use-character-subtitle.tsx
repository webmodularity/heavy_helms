import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

// Common subtitle styling for consistency
const subtitleStyle = "text-yellow-400/90 text-sm font-medium tracking-widest";

// Helper function to truncate address for mobile
function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useCharacterSubtitle(ownerAddress?: string, id?: string) {
  // ENS resolution
  // Explicitly convert null to undefined for the hook
  const addressForEnsHook =
    ownerAddress === null
      ? undefined
      : (ownerAddress as `0x${string}` | undefined);

  const { data: ensName, isLoading } = useEnsName({
    address: addressForEnsHook,
    chainId: mainnet.id,
  });

  // Helper to generate the appropriate subtitle element
  const getSubtitle = (): ReactNode | string => {
    // Check if this is a system entity (default player or monster)
    const isSystemEntity = !ownerAddress && !!id && Number.parseInt(id) < 10001;

    if (!ownerAddress) {
      return isSystemEntity ? (
        <span className={subtitleStyle}>GAME OWNED</span>
      ) : (
        `ID: ${id}`
      );
    }

    // Has owner - show loading state or resolved name
    if (isLoading) {
      return <Skeleton className="h-4 w-40 bg-yellow-500/20" />;
    }

    // Show ENS or address (truncated on mobile)
    if (ensName) {
      return <span className={subtitleStyle}>{ensName}</span>;
    }

    // For wallet addresses, show truncated on mobile and full on desktop
    return (
      <>
        <span className={`${subtitleStyle} sm:hidden`}>
          {truncateAddress(ownerAddress)}
        </span>
        <span className={`${subtitleStyle} hidden sm:inline`}>
          {ownerAddress}
        </span>
      </>
    );
  };

  return { subtitle: getSubtitle() };
}
