"use client";

import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMiniApp } from "@/store/miniapp-context";

export default function Home() {
  const { isAuthenticated, isLoading, error, isInFarcaster } = useMiniApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading Farcaster..." />
      </div>
    );
  }

  if (error || !isInFarcaster) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-2xl font-bold text-red-400">
          {!isInFarcaster ? "Not in Farcaster" : "Connection Error"}
        </h2>
        <p className="text-stone-300 text-center max-w-md">
          {!isInFarcaster 
            ? "This app must be opened within Farcaster." 
            : error || "Something went wrong"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {isAuthenticated ? (
        <AuthenticatedView />
      ) : (
        <>
          <GameIntroduction />
          <CommunityStats />
        </>
      )}
    </div>
  );
}
