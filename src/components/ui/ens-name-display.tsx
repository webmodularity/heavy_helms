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
}

export function EnsNameDisplay({ address }: EnsNameDisplayProps) {
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

  // --- Debugging Log ---
  useEffect(() => {
    if (address) {
      console.log(
        `ENS Lookup for ${address}: isLoading=${isLoading}, isError=${isError}, ensName=${ensName}, error=`,
        error,
      );
    }
  }, [address, isLoading, isError, ensName, error]);
  // --- End Debugging Log ---

  // Show skeleton while loading (Only shows if address is provided and fetch starts)
  if (address && isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  // Display ENS name if found (and not loading/error)
  if (address && ensName && !isLoading && !isError) {
    return (
      <span className="text-stone-400 font-medium text-xs">{ensName}</span>
    );
  }

  // Fallback to abbreviated address if no ENS name, error, or no address provided
  return (
    <span className="text-stone-500 font-mono text-xs">
      {abbreviateAddress(address)}
    </span>
  );
}
