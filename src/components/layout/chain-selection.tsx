"use client";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";

export function ChainSelection() {
  const { ready, authenticated } = usePrivy();
  const {
    currentChainId,
    isWrongNetwork,
    checking,
    hasWallet,
    currentChainName,
    switchToBaseSepolia,
  } = useWallet();

  return (
    <>
      {/* Network indicator - shows for any connected chain */}
      {ready &&
        authenticated &&
        hasWallet &&
        currentChainId !== null &&
        !checking && (
          <div
            className={`flex items-center px-3 py-1.5 rounded-full text-sm border ${
              !isWrongNetwork
                ? "bg-green-950/20 border-green-800/30 text-green-400"
                : "bg-yellow-950/20 border-yellow-800/30 text-yellow-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                !isWrongNetwork ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <span>{currentChainName}</span>

            {/* Show switch link if on wrong network */}
            {isWrongNetwork && (
              <button
                onClick={switchToBaseSepolia}
                className="ml-2 text-xs underline hover:text-white transition-colors"
                type="button"
              >
                Switch
              </button>
            )}
          </div>
        )}

      {/* Loading indicator while checking network */}
      {ready && authenticated && hasWallet && checking && (
        <div className="flex items-center px-3 py-1.5 rounded-full text-sm bg-slate-950/20 border border-slate-800/30 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-slate-500 mr-2 animate-pulse" />
          <span>Checking network...</span>
        </div>
      )}
    </>
  );
}
