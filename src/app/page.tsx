"use client";

import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const selectedCharacterId = searchParams.get("selectedCharacter");

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden">
      {address ? (
        <AuthenticatedView initialSelectedCharacterId={selectedCharacterId} />
      ) : (
        <>
          <GameIntroduction />
          <CommunityStats />
        </>
      )}
    </div>
  );
}
