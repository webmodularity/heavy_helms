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

  // Loading state
  if (checking) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-retro bg-arcade-screen/80 border border-primary/30 backdrop-blur-sm">
        <RetroSpinner variant="arcade" size="xs" speed="fast" />
        <span className="text-xs font-pixeloid text-primary/80">
          SCANNING...
        </span>
      </div>
    );
  }

  // Connected state
  if (currentChainId !== null) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-retro border font-pixeloid text-xs transition-all duration-200",
          !isWrongNetwork
            ? "bg-success/10 border-success/30 text-success shadow-[0_0_8px_var(--color-success)]"
            : "bg-warning/10 border-warning/50 text-warning shadow-[0_0_8px_var(--color-warning)]",
        )}
      >
        {/* Network Status Icon */}
        <div
          className={cn(
            "flex items-center justify-center",
            !isWrongNetwork ? "text-success" : "text-warning",
          )}
        >
          {!isWrongNetwork ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
        </div>

        {/* Network Name */}
        <span className="pixel-perfect">
          {!isWrongNetwork ? "CONNECTED" : "WRONG NET"}
        </span>

        {/* Switch Button for Wrong Network */}
        {isWrongNetwork && (
          <RetroButton
            variant="pixel"
            size="xs"
            onClick={switchToPrimaryNetwork}
            className="ml-1 px-2 py-0.5 text-xs hover:shadow-pixel"
          >
            SWITCH
          </RetroButton>
        )}
      </div>
    );
  }

  return null;
}
