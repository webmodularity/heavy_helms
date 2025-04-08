"use client";

import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CharacterGallery } from "@/components/home/character-gallery";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Import types
import { usePrivy } from "@privy-io/react-auth";
import { sdk } from "@farcaster/frame-sdk";

// Renamed from Home to avoid conflict
export default function HomeClientPage() {
  const { authenticated, ready } = usePrivy();
  console.log("SDK Context", sdk.context.then((context) => console.log("Context", context)));
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {!ready ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Loading game..." />
        </div>
      ) : authenticated ? (
        <AuthenticatedView />
      ) : (
        // Non-authenticated view
        <>
          <CharacterGallery />
          <GameIntroduction />
          <CommunityStats />
        </>
      )}
    </div>
  );
} 