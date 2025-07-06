"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCancelChallenge } from "@/hooks/use-cancel-challenge";
import { useAcceptChallenge } from "@/hooks/use-accept-challenge";
import {
  Loader2,
  Shield,
  Swords,
  Trophy,
  BookMarked,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { YellowButton } from "@/components/ui/yellow-button";
import { toast } from "sonner";
import Image from "next/image";
import type { Player } from "@/types/player.types";
import { type Challenge, useChallenges } from "@/hooks/use-challenges";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { ChallengeCard } from "@/components/home/challenge-card";
import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";
import { useRecentGauntlets } from "@/hooks/use-recent-gauntlets";
import { Accordion } from "@/components/ui/accordion";
import { GauntletAccordionItem } from "@/components/gauntlet/gauntlet-accordion-item";
import { CombatDetails } from "@/components/battle-archives/combat-details";

import { useMiniApp } from "@/store/miniapp-context";

interface ActivitySectionProps {
  selectedCharacter: Player | null;
  isOwner?: boolean;
}

export function ActivitySection({
  selectedCharacter,
  isOwner,
}: ActivitySectionProps) {
  const { isAuthenticated, retry } = useMiniApp();

  return (
    <section className="mb-8" id="activity-section">
      <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
        <BookMarked className="mr-2 h-5 w-5" />
        Battle Chronicles
      </h3>

      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        {isAuthenticated ? (
          <BattleTabs selectedCharacter={selectedCharacter} isOwner={isOwner} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-stone-300 text-center">
              Connect your wallet to view your battle chronicles
            </p>
            <YellowButton onClick={retry}>Connect Wallet</YellowButton>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function BattleTabs({
  selectedCharacter,
  isOwner,
}: { selectedCharacter: Player | null; isOwner?: boolean }) {
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
            className="sm:px-5 px-3 py-3 text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            <span className="inline sm:hidden">Gauntlets</span>
            <span className="hidden sm:inline">Recent Gauntlets</span>
          </TabsTrigger>
          <TabsTrigger
            value="duels"
            className="sm:px-5 px-3 py-3 text-stone-400 border-b-2 border-transparent 
                       data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                       data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                       rounded-none focus-visible:ring-offset-0 focus-visible:ring-0"
          >
            <span className="inline sm:hidden">Duels</span>
            <span className="hidden sm:inline">Recent Duels</span>
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger
              value="challenges"
              className="sm:px-5 px-3 py-3 text-stone-400 border-b-2 border-transparent 
                         data-[state=active]:text-yellow-500 data-[state=active]:border-b-yellow-500/50 data-[state=active]:bg-yellow-500/5 data-[state=active]:rounded-tl-md data-[state=active]:rounded-tr-md
                         data-[state=inactive]:hover:text-yellow-400 data-[state=inactive]:hover:bg-yellow-500/10 data-[state=inactive]:hover:border-b-yellow-400/50
                         rounded-none focus-visible:ring-offset-0 focus-visible:ring-0 relative"
            >
              <span className="inline sm:hidden">Challenges</span>
              <span className="hidden sm:inline">Active Challenges</span>
              {activeCharacterChallenges.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-600 text-amber-50 text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                  {activeCharacterChallenges.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <div className="mt-0 pt-6 pb-0 px-0">
        <TabsContent value="gauntlets" className="space-y-4 mt-0">
          <RecentGauntletsTabContent selectedCharacter={selectedCharacter} />
        </TabsContent>

        <TabsContent value="duels" className="space-y-4 mt-0">
          <RecentDuelsTabContent selectedCharacter={selectedCharacter} />
        </TabsContent>

        {isOwner && (
          <TabsContent value="challenges" className="mt-0">
            <ActiveChallenges selectedCharacter={selectedCharacter} />
          </TabsContent>
        )}
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

  // State to track which gauntlet fight is currently active/selected
  const [activeFightKey, setActiveFightKey] = useState<string>("");

  // State to track which fight accordion is expanded
  const [expandedFightId, setExpandedFightId] = useState<string | null>(null);

  const handleFightAccordionToggle = (fightId: string | null) => {
    setExpandedFightId(fightId);
  };

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
              activeFightKey={activeFightKey}
              onFightClick={setActiveFightKey}
              expandedFightId={expandedFightId || undefined}
              onFightAccordionToggle={handleFightAccordionToggle}
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
  const { openFightModal } = useGlobalFightModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // State to track which duel is currently expanded for details
  const [expandedDuelId, setExpandedDuelId] = useState<string | null>(null);

  const handleRefetch = async () => {
    await refetch();
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
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
      <div className="divide-y divide-stone-800">
        {/* Display 5 skeleton cards while loading */}
        {Array.from({ length: 5 }, (_, index) => index).map((skeletonId) => (
          <div
            key={`duel-skeleton-${skeletonId}`}
            className="p-4 border-b border-stone-800"
          >
            <div className="flex flex-col items-center space-y-3 md:flex-row md:items-center md:space-y-0">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center mr-4">
                  <div className="h-10 w-10 rounded-full bg-stone-800/80 animate-pulse" />
                  <div className="h-2 w-16 bg-stone-800/80 animate-pulse mt-2 rounded" />
                </div>
                <div className="flex flex-col items-center mx-2">
                  <div className="h-4 w-8 bg-stone-800/80 animate-pulse rounded" />
                  <div className="h-3 w-3 bg-stone-800/80 animate-pulse mt-1 rounded-full" />
                </div>
                <div className="flex flex-col items-center ml-4">
                  <div className="h-10 w-10 rounded-full bg-stone-800/80 animate-pulse" />
                  <div className="h-2 w-16 bg-stone-800/80 animate-pulse mt-2 rounded" />
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="h-4 w-48 bg-stone-800/80 animate-pulse rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-stone-800/80 animate-pulse rounded mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load recent duels</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
        <Button
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="outline"
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
        <Button
          onClick={handleRefetch}
          className="mt-4"
          size="sm"
          variant="outline"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {duels.map((duel, index) => {
        const isChallenger =
          duel.challenge.challengerId.toString() ===
          selectedCharacter.id.toString();
        const isVictory = duel.winnerId === selectedCharacter.id.toString();
        const winner = isVictory
          ? isChallenger
            ? duel.challenge.challengerSnapshot
            : duel.challenge.defenderSnapshot
          : isChallenger
            ? duel.challenge.defenderSnapshot
            : duel.challenge.challengerSnapshot;
        const loser = isVictory
          ? isChallenger
            ? duel.challenge.defenderSnapshot
            : duel.challenge.challengerSnapshot
          : isChallenger
            ? duel.challenge.challengerSnapshot
            : duel.challenge.defenderSnapshot;

        const challengerImageUrl =
          duel.challenge.challengerSnapshot.currentSkin?.imageURL;
        const defenderImageUrl =
          duel.challenge.defenderSnapshot.currentSkin?.imageURL;

        const isExpanded = expandedDuelId === duel.id;

        return (
          <motion.div
            key={duel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-stone-800/30 last:border-b-0"
          >
            {/* Main Duel Card - Clickable */}
            <button
              type="button"
              className="w-full cursor-pointer p-4 hover:bg-amber-900/10 transition-colors text-left"
              onClick={() => {
                setExpandedDuelId(isExpanded ? null : duel.id);
              }}
            >
              <div className="flex flex-col items-center space-y-3 md:flex-row md:items-center md:space-y-0">
                <div className="flex items-center justify-center">
                  {/* Challenger */}
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${
                        isChallenger
                          ? isVictory
                            ? "border-2 border-yellow-400 ring-2 ring-yellow-500/60"
                            : "border-2 border-red-400 ring-2 ring-red-500/60"
                          : ""
                      }`}
                    >
                      {challengerImageUrl ? (
                        <Image
                          src={challengerImageUrl}
                          alt={
                            duel.challenge.challengerSnapshot.fullName ||
                            "Challenger"
                          }
                          fill
                          className="object-cover"
                          sizes="40px"
                          priority={index < 5}
                        />
                      ) : (
                        <div className="h-full w-full bg-amber-800 flex items-center justify-center text-white font-bold">
                          {duel.challenge.challengerSnapshot.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                    </div>
                    <span className="text-xs text-stone-400 mt-1 truncate w-20 text-center">
                      {duel.challenge.challengerSnapshot.fullName}
                    </span>
                  </div>

                  {/* VS Indicator */}
                  <div className="flex flex-col items-center mx-2">
                    <div className="text-yellow-600 text-sm">VS</div>
                    <div className="text-xs text-stone-500">⚔️</div>
                  </div>

                  {/* Defender */}
                  <div className="flex flex-col items-center ml-4">
                    <div
                      className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${
                        !isChallenger
                          ? isVictory
                            ? "border-2 border-yellow-400 ring-2 ring-yellow-500/60"
                            : "border-2 border-red-400 ring-2 ring-red-500/60"
                          : ""
                      }`}
                    >
                      {defenderImageUrl ? (
                        <Image
                          src={defenderImageUrl}
                          alt={
                            duel.challenge.defenderSnapshot.fullName ||
                            "Defender"
                          }
                          fill
                          className="object-cover"
                          sizes="40px"
                          priority={index < 5}
                        />
                      ) : (
                        <div className="h-full w-full bg-red-900 flex items-center justify-center text-white font-bold">
                          {duel.challenge.defenderSnapshot.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                    </div>
                    <span className="text-xs text-stone-400 mt-1 truncate w-20 text-center">
                      {duel.challenge.defenderSnapshot.fullName}
                    </span>
                  </div>
                </div>

                {/* Outcome - Centered with ID */}
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center text-sm font-medium">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-yellow-400">
                      {winner.fullName} ({winner.id.split("-").pop()})
                    </span>
                  </div>
                </div>

                {/* Timestamp and Expand Button */}
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-stone-500 text-center md:text-right">
                    {formatDate(duel.blockTimestamp)}
                  </div>
                  <div className="text-stone-400">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Expandable Combat Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <CombatDetails
                      transactionHash={duel.id}
                      winnerName={winner.fullName}
                      loserName={loser.fullName}
                    />
                    {/* Action Buttons */}
                    <div className="flex justify-center mt-3 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFightModal({
                            txId: duel.id,
                            title: `Duel: ${winner.fullName} vs ${loser.fullName}`,
                          });
                        }}
                        className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
                      >
                        Watch Replay
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Loading more indicator */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
          >
            Load More Duels
          </Button>
        ) : duels.length > 0 ? (
          <span className="text-sm text-stone-400">End of battle history</span>
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
        onModalClose: async () => {
          await refetch();
        },
      });

      // Don't refetch here - the optimistic update handles the UI immediately
      // We'll refetch when the modal closes and the subgraph has been updated
    } catch (error) {
      console.error("🔥 Error in handleAcceptChallenge:", error);
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
