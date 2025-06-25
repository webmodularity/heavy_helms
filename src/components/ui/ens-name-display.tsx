import { useEnsName } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { mainnet } from "viem/chains"; // Import mainnet chain for ENS lookup
import { useEffect } from "react"; // Import useEffect for logging

// Helper function to abbreviate address (keep this available)
function abbreviateAddress(address: string | undefined | null): string {
  if (!address) return "N/A";
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

interface EnsNameDisplayProps {
  address: `0x${string}` | undefined | null;
  className?: string;
  isAbbreviated?: boolean; // Added this prop with default value true
}

export function EnsNameDisplay({
  address,
  className,
  isAbbreviated = true, // Default to true for backwards compatibility
}: EnsNameDisplayProps) {
  // Convert null to undefined before passing to the hook
  const addressForHook = address ?? undefined;

  const {
    data: ensName,
    isLoading,
    isError,
    error,
  } = useEnsName({
    address: addressForHook, // Use the potentially converted value
    chainId: mainnet.id,
  });

  // Show skeleton while loading (Only shows if address is provided and fetch starts)
  if (address && isLoading) {
    return (
      <Skeleton
        className={`h-4 ${isAbbreviated ? "w-24" : "w-40"} ${className || ""}`}
      />
    );
  }

  // Display ENS name if found (and not loading/error)
  if (address && ensName && !isLoading && !isError) {
    return (
      <span className={`text-stone-400 font-medium text-xs ${className || ""}`}>
        {ensName}
      </span>
    );
  }

  // Fallback to address (abbreviated or full based on props)
  return (
    <span className={`text-stone-500 font-mono text-xs ${className || ""}`}>
      {isAbbreviated ? abbreviateAddress(address) : address || "N/A"}
    </span>
  );
}
