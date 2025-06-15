"use client";
import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { useFarcaster } from "@/store/farcaster-context";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const { isInFarcasterClient } = useFarcaster();
  const { ready: privyReady, authenticated: privyAuthenticated } = usePrivy();

  // If we're in a Farcaster client, don't show anything until we're ready
  if (isInFarcasterClient && !privyReady) {
    return null;
  }
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
