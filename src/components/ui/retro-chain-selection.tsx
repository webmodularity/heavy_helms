"use client";

import { useWallet } from "@/hooks/use-wallet";
import { useAccount } from "wagmi";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroSpinner } from "@/components/ui/retro-spinner";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RetroChainSelection() {
  const { isConnected } = useAccount();
  const {
    currentChainId,
    isWrongNetwork,
    checking,
    hasWallet,
    currentChainName,
    switchToPrimaryNetwork,
  } = useWallet();

  // Don't render anything if not connected
  if (!isConnected || !hasWallet) {
    return null;
  }

  // Loading state - COMPACTED
  if (checking) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-retro bg-arcade-screen/80 border border-primary/30 backdrop-blur-sm">
        <RetroSpinner variant="arcade" size="xs" speed="fast" />
        <span className="text-pixel-xs font-pixel text-primary/80">
          SCANNING...
        </span>
      </div>
    );
  }

  // Connected state - COMPACTED
  if (currentChainId !== null) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-retro border font-pixel text-pixel-xs transition-all duration-200",
          !isWrongNetwork
            ? "bg-success/10 border-success/30 text-success shadow-[0_0_6px_var(--color-success)]"
            : "bg-warning/10 border-warning/50 text-warning shadow-[0_0_6px_var(--color-warning)]",
        )}
      >
        {/* Network Status Icon - COMPACTED */}
        <div
          className={cn(
            "flex items-center justify-center",
            !isWrongNetwork ? "text-success" : "text-warning",
          )}
        >
          {!isWrongNetwork ? (
            <Wifi className="h-2.5 w-2.5" />
          ) : (
            <AlertTriangle className="h-2.5 w-2.5" />
          )}
        </div>

        {/* Network Name */}
        <span className="pixel-perfect">
          {!isWrongNetwork ? "CONNECTED" : "WRONG NET"}
        </span>

        {/* Switch Button for Wrong Network - COMPACTED */}
        {isWrongNetwork && (
          <RetroButton
            variant="pixel"
            size="xs"
            onClick={switchToPrimaryNetwork}
            className="ml-0.5 px-1.5 py-0.5 text-pixel-xs hover:shadow-pixel"
          >
            SWITCH
          </RetroButton>
        )}
      </div>
    );
  }

  return null;
}
