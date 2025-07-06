"use client";
import { useMiniApp } from "@/store/miniapp-context";

export function ChainSelection() {
  const {
    currentChainId,
    isWrongNetwork,
    hasWallet,
    currentChainName,
    isAuthenticated,
  } = useMiniApp();

  return (
    <>
      {/* Network indicator - shows for any connected chain */}
      {isAuthenticated &&
        hasWallet &&
        currentChainId !== null &&
        (
          <div
            className={`font-bokor flex items-center px-3 py-1.5 rounded-full text-sm border ${
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
          </div>
        )}

      {/* Loading indicator while checking network */}
      {isAuthenticated && hasWallet && (
        <div className="flex items-center px-3 py-1.5 rounded-full text-sm bg-slate-950/20 border border-slate-800/30 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-slate-500 mr-2 animate-pulse" />
          <span>Checking network...</span>
        </div>
      )}
    </>
  );
}
