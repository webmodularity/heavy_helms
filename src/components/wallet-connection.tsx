"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { CTAButton } from "./ui/cta-button";
import { useMiniApp } from "@/store/miniapp-context";

export function WalletConnection() {
  const { isInFarcaster } = useMiniApp();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isInFarcaster) {
    return null; // Only show in Farcaster environment
  }

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-400">💰 {shortAddress}</span>
        <button
          onClick={() => disconnect()}
          className="text-xs text-stone-400 hover:text-white underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <CTAButton
      title={isPending ? "Connecting..." : "Connect Wallet"}
      onClick={() => {
        // Connect using the first (and only) connector - the Farcaster MiniApp connector
        const connector = connectors[0];
        if (connector) {
          connect({ connector });
        }
      }}
      disabled={isPending}
    />
  );
} 