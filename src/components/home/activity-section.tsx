"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useCancelChallenge } from "@/hooks/use-cancel-challenge";
import { useAcceptChallenge } from "@/hooks/use-accept-challenge";
import { Loader2, Shield, Swords, Trophy, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import { type Challenge, useChallenges } from "@/hooks/use-challenges";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { useRouter } from "next/navigation";
import { ChallengeCard } from "@/components/home/challenge-card";
import { useRecentGauntlets } from "@/hooks/use-recent-gauntlets";
import { Accordion } from "@/components/ui/accordion";
import { GauntletAccordionItem } from "@/components/gauntlet/gauntlet-accordion-item";
import { useAccount } from "wagmi";

interface ActivitySectionProps {
  selectedCharacter: Player | null;
}

export function ActivitySection({ selectedCharacter }: ActivitySectionProps) {
  const { isConnected } = useAccount();

  return (
    <section className="mb-6" id="activity-section">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          Battle Chronicles
        </h2>
        <div className="text-yellow-400/90 text-xs font-medium">YOUR SAGA</div>
      </div>

      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
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
  console.log("challenges", challenges)
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
        <TabsList className="bg-transparent p-0 border-b border-stone-600 rounded-none w-full h-8">
          <TabsTrigger
            value="gauntlets"
            className="px-3 py-1.5 text-xs text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            Gauntlets
          </TabsTrigger>
          <TabsTrigger
            value="duels"
            className="px-3 py-1.5 text-xs text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            Duels
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="px-3 py-1.5 text-xs text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0 relative"
          >
            Challenges
            {activeCharacterChallenges.length > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-amber-600 text-amber-50 text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {activeCharacterChallenges.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-0 pt-3 pb-0 px-0">
        <TabsContent value="gauntlets" className="space-y-2 mt-0">
          <RecentGauntletsTabContent selectedCharacter={selectedCharacter} />
        </TabsContent>

        <TabsContent value="duels" className="space-y-2 mt-0">
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
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        <p className="text-sm">Failed to load recent gauntlets</p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500">
          Please select a warrior to view gauntlets
        </p>
      </div>
    );
  }

  if (gauntlets.length === 0) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500 mb-2">
          This warrior has no recent gauntlets.
        </p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefetch}
          className="py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          disabled={isRefetching}
          type="button"
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <Loader2 className="mr-1 h-3 w-3" /> Refresh
            </>
          )}
        </button>
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
      <div ref={loadMoreRef} className="py-3 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="text-xs text-yellow-500 hover:text-yellow-400"
            type="button"
          >
            Load More
          </button>
        ) : gauntlets.length > 0 ? (
          <span className="text-xs text-stone-400">
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
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

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
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        <p className="text-sm">Failed to load recent duels</p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          disabled={isRefetching || isLoading}
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Swords className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500">
          Please select a warrior to view duels
        </p>
      </div>
    );
  }

  if (duels.length === 0) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Swords className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500 mb-2">
          No recent duels found for this warrior
        </p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          disabled={isRefetching || isLoading}
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefetch}
          className="py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          disabled={isRefetching || isLoading}
          type="button"
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <Loader2 className="mr-1 h-3 w-3" /> Refresh
            </>
          )}
        </button>
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
            <div className="p-2">
              <div className="flex justify-between mb-1">
                <span
                  className={`text-xs font-medium ${isVictory ? "text-yellow-400" : "text-red-400"}`}
                >
                  {isVictory ? "Victory" : "Defeat"}
                </span>
                <span className="text-stone-400 text-[10px]">
                  {new Date(
                    Number.parseInt(duel.blockTimestamp) * 1000,
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-stone-300 text-xs truncate max-w-[60%]">
                  vs {opponentFighter.fullName}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-xs font-medium">
                    {formatEther(BigInt(duel.challenge.wagerAmount))} ETH
                  </span>
                  {isNavigatingThisDuel ? (
                    <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="py-2 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <span className="text-xs text-stone-400">Scroll for more</span>
        ) : duels.length > 0 ? (
          <span className="text-xs text-stone-400">End of duel history</span>
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
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

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
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        <p className="text-sm">Failed to load challenges</p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500">
          Please select a warrior to view your challenges
        </p>
      </div>
    );
  }

  if (characterChallenges.length === 0) {
    return (
      <div className="text-center py-4 text-stone-300">
        <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600/50" />
        <p className="text-sm text-yellow-500 mb-2">
          This warrior has no active challenges
        </p>
        <button
          onClick={handleRefetch}
          className="mt-2 py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          type="button"
        >
          <Loader2
            className={`mr-1 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
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
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefetch}
          className="py-1 px-2 text-xs border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/10 inline-flex items-center"
          disabled={isRefetching}
          type="button"
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <Loader2 className="mr-1 h-3 w-3" /> Refresh
            </>
          )}
        </button>
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
      <div ref={loadMoreRef} className="py-3 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <span className="text-xs text-stone-400">Scroll for more</span>
        ) : characterChallenges.length > 0 ? (
          <span className="text-xs text-stone-400">End of challenges</span>
        ) : null}
      </div>
    </div>
  );
}
