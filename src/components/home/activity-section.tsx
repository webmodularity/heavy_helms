"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { motion } from "framer-motion";
import { useCancelChallenge } from "@/hooks/use-cancel-challenge";
import { useAcceptChallenge } from "@/hooks/use-accept-challenge";
import { Loader2, Shield, Swords, Trophy, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { formatEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import { type Challenge, useChallenges } from "@/hooks/use-challenges";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChallengeCard } from "@/components/home/challenge-card";
import {
  useRecentGauntlets,
  type GauntletChronicle,
} from "@/hooks/use-recent-gauntlets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GauntletAccordionItem } from "@/components/gauntlet/gauntlet-accordion-item";
import { useAccount } from "wagmi";

interface ActivitySectionProps {
  selectedCharacter: Player | null;
}

export function ActivitySection({ selectedCharacter }: ActivitySectionProps) {
  const { isConnected } = useAccount();

  return (
    <section className="mb-8" id="activity-section">
      <SectionHeader title="Battle Chronicles" subtitle="YOUR SAGA" />

      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        {isConnected ? (
          <BattleTabs selectedCharacter={selectedCharacter} />
        ) : (
          <></>
        )}
      </motion.div>
    </section>
  );
}

function BattleTabs({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const [activeTab, setActiveTab] = useState("gauntlets");
  const { challenges } = useChallenges(selectedCharacter?.id || "");

  // Filter challenges for the selected character
  const activeCharacterChallenges = useMemo(() => {
    if (!selectedCharacter) return [];
    return challenges.filter(
      (c) =>
        !c.fulfilled &&
        (c.challengerId.toString() === selectedCharacter.id.toString() ||
          c.defenderId.toString() === selectedCharacter.id.toString()),
    );
  }, [challenges, selectedCharacter]);

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
      defaultValue="gauntlets"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-0">
        <TabsList className="bg-transparent p-0 border-b border-stone-600 rounded-none w-full">
          <TabsTrigger
            value="gauntlets"
            className="px-5 py-3 text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            Recent Gauntlets
          </TabsTrigger>
          <TabsTrigger
            value="duels"
            className="px-5 py-3 text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            Recent Duels
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="px-5 py-3 text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0 relative"
          >
            Active Challenges
            {activeCharacterChallenges.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-amber-600 text-amber-50 text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {activeCharacterChallenges.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-0 pt-6 pb-0 px-0">
        <TabsContent value="gauntlets" className="space-y-4 mt-0">
          <RecentGauntletsTabContent selectedCharacter={selectedCharacter} />
        </TabsContent>

        <TabsContent value="duels" className="space-y-4 mt-0">
          <RecentDuelsTabContent selectedCharacter={selectedCharacter} />
        </TabsContent>

        <TabsContent value="challenges" className="mt-0">
          <ActiveChallenges selectedCharacter={selectedCharacter} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function RecentGauntletsTabContent({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const {
    gauntlets,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useRecentGauntlets(selectedCharacter?.id);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // State to track the currently expanded accordion item's value
  const [expandedItemValue, setExpandedItemValue] = useState<
    string | undefined
  >();

  const handleRefetch = async () => {
    await refetch();
  };

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && gauntlets.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load recent gauntlets</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
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
        <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          Please select a warrior to view recent gauntlets.
        </h3>
      </div>
    );
  }

  if (gauntlets.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          This warrior has no recent gauntlets.
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

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-4">
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

      <Accordion
        type="single"
        collapsible
        className="w-full space-y-2"
        value={expandedItemValue}
        onValueChange={setExpandedItemValue}
      >
        {gauntlets.map((gauntlet, index) => {
          const currentItemValue = `gauntlet-${gauntlet.id}-${index}`;
          return (
            <GauntletAccordionItem
              key={currentItemValue}
              itemValue={currentItemValue}
              gauntlet={gauntlet}
              selectedCharacter={selectedCharacter}
              isExpanded={expandedItemValue === currentItemValue}
            />
          );
        })}
      </Accordion>

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="py-6 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <Button
            variant="link"
            onClick={() => fetchNextPage()}
            className="text-yellow-500 hover:text-yellow-400"
          >
            Load More Gauntlets
          </Button>
        ) : gauntlets.length > 0 ? (
          <span className="text-sm text-stone-400">
            End of gauntlet history
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RecentDuelsTabContent({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const {
    duels,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useRecentDuels(selectedCharacter?.id || "");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [navigatingToDuelId, setNavigatingToDuelId] = useState<string | null>(
    null,
  );

  const handleRefetch = async () => {
    await refetch();
  };

  const handleDuelNavigation = (duelId: string) => {
    if (navigatingToDuelId) return;
    setNavigatingToDuelId(duelId);
    router.push(`/duel?txId=${duelId}&player1Id=${selectedCharacter?.id}`);
  };

  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" }, // Load more before user reaches the bottom
    );

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && duels.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load recent duels</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
        <YellowButton
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
          disabled={isRefetching || isLoading}
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
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          Please select a warrior to view your recent duels.
        </h3>
      </div>
    );
  }

  if (duels.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          No recent duels found for this warrior
        </h3>
        <YellowButton
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="default"
          disabled={isRefetching || isLoading}
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
          disabled={isRefetching || isLoading}
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
        const isNavigatingThisDuel = navigatingToDuelId === duel.id;
        const isChallenger =
          duel.challenge.challengerId.toString() ===
          selectedCharacter.id.toString();
        const isVictory = duel.winnerId === selectedCharacter.id.toString();
        const userFighter = isChallenger
          ? duel.challenge.challengerSnapshot
          : duel.challenge.defenderSnapshot;
        const opponentFighter = isChallenger
          ? duel.challenge.defenderSnapshot
          : duel.challenge.challengerSnapshot;

        return (
          <div
            key={duel.id}
            className={`block border-b border-stone-700/50 transition-colors ${
              isNavigatingThisDuel
                ? "opacity-70 pointer-events-none"
                : "hover:bg-yellow-600/10 cursor-pointer"
            }`}
            onClick={() =>
              !isNavigatingThisDuel && handleDuelNavigation(duel.id)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (!isNavigatingThisDuel) handleDuelNavigation(duel.id);
              }
            }}
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="button"
            tabIndex={isNavigatingThisDuel ? -1 : 0}
          >
            <div className="p-4">
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
              <div className="flex justify-between items-center">
                <p className="text-stone-300 text-sm">
                  Your warrior {userFighter.fullName}{" "}
                  {isVictory ? "defeated" : "was defeated by"}{" "}
                  {opponentFighter.fullName}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-medium">
                    {formatEther(BigInt(duel.challenge.wagerAmount))} ETH
                  </span>
                  {isNavigatingThisDuel ? (
                    <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <span className="text-sm text-stone-400">Scroll for more</span>
        ) : duels.length > 0 ? (
          <span className="text-sm text-stone-400">End of duel history</span>
        ) : null}
      </div>
    </div>
  );
}

function ActiveChallenges({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const {
    challenges,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useChallenges(selectedCharacter?.id || "");

  const { cancelChallenge, isCancellingChallenge } = useCancelChallenge();
  const { acceptChallenge, isAcceptingChallenge } = useAcceptChallenge();
  const [expandedChallenge, setExpandedChallenge] = useState<bigint | null>(
    null,
  );
  const [processingChallengeId, setProcessingChallengeId] = useState<
    bigint | null
  >(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleRefetch = async () => {
    await refetch();
  };

  // Filter challenges for the current character
  const characterChallenges = challenges.filter(
    (challenge) =>
      challenge.challengerId.toString() === selectedCharacter?.id?.toString() ||
      challenge.defenderId.toString() === selectedCharacter?.id?.toString(),
  );

  // Set up infinite scroll
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" }, // Load more before user reaches the bottom
    );

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && characterChallenges.length === 0) {
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
        <Shield className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
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
            setExpandedChallenge(
              expandedChallenge === challenge.id ? null : challenge.id,
            )
          }
        />
      ))}

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <span className="text-sm text-stone-400">Scroll for more</span>
        ) : characterChallenges.length > 0 ? (
          <span className="text-sm text-stone-400">End of challenges</span>
        ) : null}
      </div>
    </div>
  );
}
