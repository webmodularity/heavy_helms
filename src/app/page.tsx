"use client";

import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CharacterGallery } from "@/components/home/character-gallery";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Import types
import { useAccount } from "wagmi";

export default function Home() {
  const { address } = useAccount();
  console.log("address", address);
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {address ? (
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
