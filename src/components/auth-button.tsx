"use client";

import { useMiniApp } from "@/store/miniapp-context";
import { motion, AnimatePresence } from "framer-motion";

// User icon component
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

// Farcaster icon component
const FarcasterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 3v18h3V9h3v12h6V9h3v12h3V3z" />
  </svg>
);

// Wallet icon component (same as wallet-connection)
const WalletIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

// Alert triangle icon
const AlertIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.662-.833-2.432 0L4.382 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

// Loading spinner component
const LoadingSpinner = ({ className }: { className?: string }) => (
  <motion.svg
    className={className}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </motion.svg>
);

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
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-sm rounded-lg border border-amber-600/30 px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-amber-600/20 rounded-full border border-amber-400/30">
            <LoadingSpinner className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-amber-300">Loading...</span>
            <span className="text-xs text-amber-400/70">Initializing app</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-lg border border-red-600/30 px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-red-600/20 rounded-full border border-red-400/30">
            <AlertIcon className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-300">Error</span>
            <span className="text-xs text-red-400/70 max-w-40 truncate">{error}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="unauthenticated"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-lg border border-amber-600/30 px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-amber-600/20 rounded-full border border-amber-400/30">
            <FarcasterIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-amber-300">Farcaster Required</span>
            <span className="text-xs text-amber-400/70">Open in Farcaster app</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="authenticated"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        {/* User info card */}
        <motion.div
          className="flex items-center gap-3 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-sm rounded-lg border border-yellow-600/30 px-4 py-3 shadow-lg relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-400/10 to-yellow-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          {/* User avatar or icon */}
          <div className="relative z-10">
            {user?.pfpUrl ? (
              <motion.img 
                src={user.pfpUrl} 
                alt={user.displayName || user.username} 
                className="w-8 h-8 rounded-full border-2 border-yellow-400/30"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-600/20 rounded-full border border-yellow-400/30">
                <UserIcon className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col relative z-10">
            <span className="text-sm font-medium text-yellow-300">
              {user?.displayName || user?.username || 'Farcaster User'}
            </span>
            
            {/* Wallet status */}
            {isConnecting ? (
              <div className="flex items-center gap-1.5 text-xs text-yellow-400/70">
                <LoadingSpinner className="w-3 h-3" />
                <span>Connecting wallet...</span>
              </div>
            ) : isConnected && walletAddress ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                <WalletIcon className="w-3 h-3" />
                <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
                <WalletIcon className="w-3 h-3" />
                <span>Wallet not connected</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
