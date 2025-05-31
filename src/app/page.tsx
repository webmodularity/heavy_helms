"use client";
import { RetroAuthenticatedView } from "@/components/home/retro-authenticated-view";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  // const { user } = usePrivy();
  // console.log("privyUser 2", user);
  // console.log("isConnected", isConnected);
  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden pixel-perfect">
      {isConnected ? (
        <RetroAuthenticatedView />
      ) : (
        <>
          <GameIntroduction />
          <CommunityStats />
        </>
      )}
    </div>
  );
}
