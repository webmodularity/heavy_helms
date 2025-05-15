"use client";
import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden">
      {isConnected ? (
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
