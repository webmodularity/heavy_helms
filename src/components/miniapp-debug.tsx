"use client";

import { useMiniApp } from "@/store/miniapp-context";

export function MiniAppDebug() {
  const { 
    isInFarcaster, 
    user, 
    isConnected,
    walletAddress,
    error,
  } = useMiniApp();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="text-yellow-400 font-bold mb-2">MiniApp Debug</div>
      
      <div className="space-y-1">
        <div>In Farcaster: {isInFarcaster ? '✅' : '❌'}</div>
        <div>Wallet Connected: {isConnected ? '✅' : '❌'}</div>
      </div>

      {user && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-blue-400 font-semibold">Farcaster User:</div>
          <div>FID: {user.fid}</div>
          <div>Username: {user.username || 'N/A'}</div>
          <div>Display: {user.displayName || 'N/A'}</div>
        </div>
      )}

      {isConnected && walletAddress && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-green-400 font-semibold">Wallet:</div>
          <div>{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</div>
        </div>
      )}

      {error && (
        <div className="mt-2 pt-2 border-t border-red-600">
          <div className="text-red-400 font-semibold">Error:</div>
          <div className="text-red-300">{error}</div>
        </div>
      )}
    </div>
  );
} 