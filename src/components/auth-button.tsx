"use client";

import { useMiniApp } from "@/store/miniapp-context";
import { Loader2 } from "lucide-react";

export function AuthButton() {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    user, 
    walletAddress, 
    isConnecting, 
    isConnected 
  } = useMiniApp();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error: {error}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-amber-500 text-sm">
        Please open this app in Farcaster
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user?.pfpUrl && (
        <img 
          src={user.pfpUrl} 
          alt={user.displayName || user.username} 
          className="h-8 w-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {user?.displayName || user?.username}
        </span>
        {isConnecting ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting wallet...
          </span>
        ) : isConnected && walletAddress ? (
          <span className="text-xs text-muted-foreground">
            💰 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        ) : (
          <span className="text-xs text-amber-500">
            Wallet not connected
          </span>
        )}
      </div>
    </div>
  );
}
