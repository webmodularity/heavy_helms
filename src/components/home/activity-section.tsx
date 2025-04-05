"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { motion } from "framer-motion";
import { useCancelChallenge } from "@/hooks/use-cancel-challenge";
import { useAcceptChallenge } from "@/hooks/use-accept-challenge";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, Shield, Swords } from "lucide-react";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import { type Challenge, useChallenges } from "@/hooks/use-challenges";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import Link from "next/link";
import { ChallengeCard } from "@/components/home/challenge-card";

interface ActivitySectionProps {
  selectedCharacter: Player | null;
}

export function ActivitySection({ selectedCharacter }: ActivitySectionProps) {
  const { authenticated, login } = usePrivy();

  return (
    <section className="mb-8" id="activity-section">
      <SectionHeader title="Battle Chronicles" subtitle="YOUR SAGA" />

      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        {authenticated ? (
          <BattleTabs selectedCharacter={selectedCharacter} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-stone-300 text-center">
              Connect your wallet to view your battle chronicles
            </p>
            <YellowButton onClick={login}>Connect Wallet</YellowButton>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function BattleTabs({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const [activeTab, setActiveTab] = useState("recent");

  // Listen for the event to activate the challenges tab
  useEffect(() => {
    const handleActivateChallengesTab = () => {
      setActiveTab("challenges");
    };

    document.addEventListener(
      "activateChallengesTab",
      handleActivateChallengesTab,
    );

    return () => {
      document.removeEventListener(
        "activateChallengesTab",
        handleActivateChallengesTab,
      );
    };
  }, []);

  return (
    <Tabs
      defaultValue="recent"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-stone-800/50 border border-yellow-600/20">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400"
          >
            Recent Battles
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400"
          >
            Active Challenges
          </TabsTrigger>
        </TabsList>

        {/* <Button
          variant="ghost"
          className="text-yellow-500 hover:text-yellow-400"
        >
          View All
        </Button> */}
      </div>

      <TabsContent value="recent" className="space-y-4">
        <RecentBattles selectedCharacter={selectedCharacter} />
      </TabsContent>

      <TabsContent value="challenges">
        <ActiveChallenges selectedCharacter={selectedCharacter} />
      </TabsContent>
    </Tabs>
  );
}

function RecentBattles({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const { duels, isLoading, error, refetch } = useRecentDuels(
    selectedCharacter?.id,
  );
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load recent battles</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
        <Button
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          Please select a warrior to view your recent battles
        </h3>
      </div>
    );
  }

  if (!duels || duels.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <p>No recent battles found for this warrior</p>
        <YellowButton
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </YellowButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <YellowButton
          onClick={handleRefetch}
          size="sm"
          variant="default"
          disabled={isRefetching}
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4" /> Refresh
            </>
          )}
        </YellowButton>
      </div>

      {duels.map((duel) => {
        // Determine if selected character is the challenger or defender
        const isChallenger =
          duel.challenge.challenger.id === selectedCharacter.id.toString();

        // Determine if the character won
        const isVictory =
          duel.winnerId ===
          (isChallenger
            ? duel.challenge.challenger.id
            : duel.challenge.defender.id);

        // Get the name of the user's fighter and opponent
        const userFighter = isChallenger
          ? duel.challenge.challenger
          : duel.challenge.defender;
        const opponentFighter = isChallenger
          ? duel.challenge.defender
          : duel.challenge.challenger;

        return (
          <Link href={`/duel?txId=${duel.id}`} key={duel.id} className="block">
            <div className="p-4 border-b border-stone-700/50 hover:bg-yellow-600/10 transition-colors">
              <div className="flex justify-between mb-1">
                <span
                  className={`font-medium ${isVictory ? "text-yellow-400" : "text-red-400"}`}
                >
                  {isVictory ? "Victory in Duel" : "Defeat in Duel"}
                </span>
                <span className="text-stone-400 text-sm">
                  {new Date(
                    Number.parseInt(duel.blockTimestamp) * 1000,
                  ).toLocaleDateString()}
                </span>
              </div>
              <p className="text-stone-300 text-sm">
                Your warrior {userFighter.fullName}{" "}
                {isVictory ? "defeated" : "was defeated by"}{" "}
                {opponentFighter.fullName}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ActiveChallenges({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const { challenges, isLoading, error, refetch } = useChallenges(
    selectedCharacter?.id,
  );
  const { cancelChallenge, isCancellingChallenge } = useCancelChallenge();
  const { acceptChallenge, isAcceptingChallenge } = useAcceptChallenge();
  const [expandedChallenge, setExpandedChallenge] = useState<bigint | null>(
    null,
  );
  const [processingChallengeId, setProcessingChallengeId] = useState<
    bigint | null
  >(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load challenges</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
        <YellowButton
          variant="default"
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </YellowButton>
      </div>
    );
  }

  const characterChallenges = challenges.filter(
    (challenge) =>
      challenge.challengerId.toString() === selectedCharacter?.id?.toString() ||
      challenge.defenderId.toString() === selectedCharacter?.id?.toString(),
  );

  if (!challenges || challenges.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          No Active Challenges
        </h3>
        <p className="text-sm max-w-md mx-auto">
          You don't have any active challenges at the moment. Start a duel by
          selecting a warrior and choosing "Duel Mode" from the battle options.
        </p>
        <YellowButton
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </YellowButton>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Shield className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          Please select a warrior to view your active challenges
        </h3>
      </div>
    );
  }

  if (characterChallenges.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          This warrior has no active challenges
        </h3>
        <YellowButton
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </YellowButton>
      </div>
    );
  }

  const handleAcceptChallenge = async (challenge: Challenge) => {
    if (!selectedCharacter) {
      toast.error("No character selected", {
        description: "Please select a character to accept this challenge.",
      });
      return;
    }

    setProcessingChallengeId(challenge.id);
    try {
      await acceptChallenge({
        character: selectedCharacter,
        challengeId: challenge.id,
        wagerAmount: challenge.wagerAmount,
      });
    } finally {
      setProcessingChallengeId(null);
    }
  };

  const handleCancelChallenge = async (challenge: Challenge) => {
    setProcessingChallengeId(challenge.id);
    try {
      await cancelChallenge({
        challengeId: challenge.id,
        characterId: selectedCharacter.id,
      });
    } finally {
      setProcessingChallengeId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <YellowButton
          onClick={handleRefetch}
          size="sm"
          variant="default"
          disabled={isRefetching}
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4" /> Refresh
            </>
          )}
        </YellowButton>
      </div>

      {characterChallenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id.toString()}
          challenge={challenge}
          selectedCharacter={selectedCharacter}
          isProcessing={processingChallengeId === challenge.id}
          isCancellingChallenge={isCancellingChallenge}
          isAcceptingChallenge={isAcceptingChallenge}
          onAccept={handleAcceptChallenge}
          onCancel={handleCancelChallenge}
          isExpanded={expandedChallenge === challenge.id}
          onToggleExpand={() => 
            setExpandedChallenge(expandedChallenge === challenge.id ? null : challenge.id)
          }
        />
      ))}
    </div>
  );
}
