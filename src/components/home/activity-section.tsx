"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useCancelChallenge } from "@/hooks/use-cancel-challenge";
import { useAcceptChallenge } from "@/hooks/use-accept-challenge";
import {
  Loader2,
  Shield,
  Swords,
  Trophy,
  ChevronRight,
  BookMarked,
  Dumbbell,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { formatEther } from "viem";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import { type Challenge, useFighterChallenges } from "@/hooks/use-challenges";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { useRouter } from "next/navigation";
import { ChallengeCard } from "@/components/home/challenge-card";
import { useRecentGauntlets } from "@/hooks/use-recent-gauntlets";
import { Accordion } from "@/components/ui/accordion";
import { GauntletAccordionItem } from "@/components/gauntlet/gauntlet-accordion-item";
import { useAccount } from "wagmi";
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { cn } from "@/lib/utils";

interface ActivitySectionProps {
  selectedCharacter: Player | null;
}

export function ActivitySection({ selectedCharacter }: ActivitySectionProps) {
  const { isConnected } = useAccount();

  return (
    // <section className="mb-4" id="activity-section">
    //   <motion.div
    //     className="text-center mb-3"
    //     initial={{ opacity: 0, y: 10 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.3 }}
    //   >
    //     <div className="flex items-center justify-center gap-1.5 mb-1">
    //       <BookMarked className="h-4 w-4 text-primary retro-text-glow" />
    //       <h2 className="font-pixel text-pixel-lg text-primary font-bold uppercase tracking-wider retro-text-glow">
    //         BATTLE CHRONICLES
    //       </h2>
    //     </div>
    //     <div className="font-pixel text-pixel-xs text-primary/60 uppercase tracking-widest">
    //       YOUR SAGA UNFOLDS
    //     </div>
    //   </motion.div>

    //   <motion.div
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.4, delay: 0.1 }}
    //   >
    <RetroCard variant="arcade">
      <RetroCardHeader variant="arcade">
        <RetroCardTitle
          variant="arcade"
          className="font-pixel text-pixel-lg flex items-center gap-2"
        >
          <BookMarked className="h-4 w-4 text-primary retro-box-glow" />
          BATTLE CHRONICLES
        </RetroCardTitle>
      </RetroCardHeader>
      <RetroCardContent className="py-3 px-0">
        {isConnected ? (
          <BattleTabs selectedCharacter={selectedCharacter} />
        ) : (
          <div className="text-center py-6">
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary/50" />
            <p className="font-pixel text-pixel-sm text-primary/70">
              CONNECT WALLET TO VIEW CHRONICLES
            </p>
          </div>
        )}
      </RetroCardContent>
    </RetroCard>
    //   </motion.div>
    // </section>
  );
}

function BattleTabs({
  selectedCharacter,
}: { selectedCharacter: Player | null }) {
  const [activeTab, setActiveTab] = useState("gauntlets");

  // Determine which hook to use based on selectedCharacter
  const fighterId = selectedCharacter?.id?.toString() ?? null;

  const {
    challenges: fighterSpecificChallenges,
    // ...other properties for fighter challenges
  } = useFighterChallenges(fighterId);

  console.log("challenges for selected character", fighterSpecificChallenges);

  const activeCharacterChallenges = useMemo(() => {
    if (!selectedCharacter) return [];
    return fighterSpecificChallenges.filter(
      (c) =>
        !c.fulfilled &&
        (c.challengerId.toString() === selectedCharacter.id.toString() ||
          c.defenderId.toString() === selectedCharacter.id.toString()),
    );
  }, [fighterSpecificChallenges, selectedCharacter]);

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
        <TabsList className="bg-arcade-screen/50 p-1 border border-primary/30 rounded-pixel-md w-full h-auto retro-box-glow">
          <TabsTrigger
            value="gauntlets"
            className="flex-1 px-1 py-1.5 font-pixel text-pixel-xs text-primary/70 border-0 bg-transparent
                       data-[state=active]:text-primary data-[state=active]:bg-primary/20 data-[state=active]:retro-text-glow
                       data-[state=inactive]:hover:text-primary/90 data-[state=inactive]:hover:bg-primary/5
                       rounded-pixel transition-all duration-200 pixel-perfect gap-1 flex items-center justify-center cursor-pointer"
          >
            <Trophy className="h-2 w-2" />
            <span className="sm:hidden text-pixel-lg">Gauntlets</span>
          </TabsTrigger>
          <TabsTrigger
            value="duels"
            className="flex-1 px-1 py-1.5 font-pixel text-pixel-xs text-primary/70 border-0 bg-transparent
                       data-[state=active]:text-primary data-[state=active]:bg-primary/20 data-[state=active]:retro-text-glow
                       data-[state=inactive]:hover:text-primary/90 data-[state=inactive]:hover:bg-primary/5
                       rounded-pixel transition-all duration-200 pixel-perfect gap-0.5 flex items-center justify-center cursor-pointer"
          >
            <Swords className="h-2 w-2" />
            <span className="sm:hidden text-pixel-lg">History</span>
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="flex-1 px-1 py-1.5 font-pixel text-pixel-xs text-primary/70 border-0 bg-transparent relative
                       data-[state=active]:text-primary data-[state=active]:bg-primary/20 data-[state=active]:retro-text-glow
                       data-[state=inactive]:hover:text-primary/90 data-[state=inactive]:hover:bg-primary/5
                       rounded-pixel transition-all duration-200 pixel-perfect gap-0.5 flex items-center justify-center cursor-pointer"
          >
            <Shield className="h-2 w-2" />
            <span className="sm:hidden text-pixel-lg">Challenges</span>
            {activeCharacterChallenges.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-warning text-background font-pixel text-[7px] font-bold rounded-pixel min-w-[12px] h-3 px-0.5 flex items-center justify-center retro-text-glow">
                {activeCharacterChallenges.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-2 pt-0 pb-0 px-0">
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
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="font-pixel text-pixel-sm text-destructive mb-3">
          FAILED TO LOAD GAUNTLETS
        </p>
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching}
          className="retro-glow"
        >
          {isRefetching ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Loader2 className="h-3 w-3 mr-1" />
          )}
          REFRESH
        </RetroButton>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Trophy className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        </motion.div>
        <motion.p
          className="font-pixel text-pixel-sm text-primary/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          SELECT WARRIOR TO VIEW GAUNTLETS
        </motion.p>
      </motion.div>
    );
  }

  if (gauntlets.length === 0) {
    return (
      <div className="text-center py-6">
        <Trophy className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        <p className="font-pixel text-pixel-sm text-primary/70 mb-3">
          NO RECENT GAUNTLETS FOUND
        </p>
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching}
          className="retro-glow"
        >
          {isRefetching ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Loader2 className="h-3 w-3 mr-1" />
          )}
          REFRESH
        </RetroButton>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.div
        className="flex justify-end mb-2"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching}
          className="retro-glow"
        >
          {isRefetching ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESHING...</span>
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESH</span>
            </>
          )}
        </RetroButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
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
              <motion.div
                key={currentItemValue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
              >
                <GauntletAccordionItem
                  itemValue={currentItemValue}
                  gauntlet={gauntlet}
                  selectedCharacter={selectedCharacter}
                  isExpanded={expandedItemValue === currentItemValue}
                />
              </motion.div>
            );
          })}
        </Accordion>
      </motion.div>

      {/* Loading more indicator */}
      <motion.div
        ref={loadMoreRef}
        className="py-3 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {isFetchingNextPage ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : hasNextPage ? (
          <RetroButton
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            className="font-pixel text-pixel-xs"
          >
            LOAD MORE
          </RetroButton>
        ) : gauntlets.length > 0 ? (
          <span className="font-pixel text-pixel-xs text-primary/50">
            END OF GAUNTLET HISTORY
          </span>
        ) : null}
      </motion.div>
    </motion.div>
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
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="font-pixel text-pixel-sm text-destructive mb-3">
          FAILED TO LOAD DUELS
        </p>
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching || isLoading}
          className="retro-glow"
        >
          {isRefetching ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Loader2 className="h-3 w-3 mr-1" />
          )}
          REFRESH
        </RetroButton>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Swords className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        </motion.div>
        <motion.p
          className="font-pixel text-pixel-sm text-primary/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          SELECT WARRIOR TO VIEW DUELS
        </motion.p>
      </motion.div>
    );
  }

  if (duels.length === 0) {
    return (
      <div className="text-center py-6">
        <Swords className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        <p className="font-pixel text-pixel-sm text-primary/70 mb-3">
          NO RECENT DUELS FOUND
        </p>
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching || isLoading}
          className="retro-glow"
        >
          {isRefetching ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Loader2 className="h-3 w-3 mr-1" />
          )}
          REFRESH
        </RetroButton>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.div
        className="flex justify-end mb-2"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching || isLoading}
          className="retro-glow"
        >
          {isRefetching ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESHING...</span>
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESH</span>
            </>
          )}
        </RetroButton>
      </motion.div>

      <motion.div
        className="space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        {duels.map((duel, index) => {
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
            <motion.div
              key={duel.id}
              className={cn(
                "border border-primary/30 rounded-pixel-md overflow-hidden transition-all duration-200 cursor-pointer pixel-perfect",
                isNavigatingThisDuel
                  ? "opacity-70 pointer-events-none"
                  : "hover:border-primary/50 hover:retro-box-glow",
              )}
              onClick={() =>
                !isNavigatingThisDuel && handleDuelNavigation(duel.id)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!isNavigatingThisDuel) handleDuelNavigation(duel.id);
                }
              }}
              role="button"
              tabIndex={isNavigatingThisDuel ? -1 : 0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: isNavigatingThisDuel ? 1 : 1.02 }}
            >
              <div className="p-2.5 bg-arcade-screen/30">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-pixel",
                        isVictory ? "bg-success" : "bg-destructive",
                        isVictory ? "animate-pulse" : "",
                      )}
                    />
                    <span
                      className={cn(
                        "font-pixel text-pixel-xs font-bold uppercase",
                        isVictory ? "text-success" : "text-destructive",
                      )}
                    >
                      {isVictory ? "VICTORY" : "DEFEAT"}
                    </span>
                  </div>
                  <span className="font-pixel text-pixel-xs text-primary/50">
                    {new Date(
                      Number.parseInt(duel.blockTimestamp) * 1000,
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Swords className="h-2.5 w-2.5 text-primary/70" />
                    <p className="font-pixel text-pixel-xs text-foreground truncate max-w-[120px]">
                      VS {opponentFighter.fullName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-pixel-xs text-warning font-bold">
                      {formatEther(BigInt(duel.challenge.wagerAmount))} ETH
                    </span>
                    {isNavigatingThisDuel ? (
                      <Loader2 className="h-3 w-3 text-primary animate-spin" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-primary/70" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Loading more indicator */}
      <motion.div
        ref={loadMoreRef}
        className="py-3 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {isFetchingNextPage ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : hasNextPage ? (
          <span className="font-pixel text-pixel-xs text-primary/50">
            SCROLL FOR MORE
          </span>
        ) : duels.length > 0 ? (
          <span className="font-pixel text-pixel-xs text-primary/50">
            END OF DUEL HISTORY
          </span>
        ) : null}
      </motion.div>
    </motion.div>
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
  } = useFighterChallenges(selectedCharacter?.id ?? null);

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
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="font-pixel text-pixel-sm text-destructive mb-3">
          FAILED TO LOAD CHALLENGES
        </p>
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          className="retro-glow"
        >
          {isRefetching ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Loader2 className="h-3 w-3 mr-1" />
          )}
          REFRESH
        </RetroButton>
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Shield className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        </motion.div>
        <motion.p
          className="font-pixel text-pixel-sm text-primary/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          SELECT WARRIOR TO VIEW CHALLENGES
        </motion.p>
      </motion.div>
    );
  }

  if (characterChallenges.length === 0) {
    return (
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Shield className="h-8 w-8 mx-auto mb-2 text-primary/30" />
        </motion.div>
        <motion.p
          className="font-pixel text-pixel-sm text-primary/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          NO ACTIVE CHALLENGES
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.35 }}
        >
          <RetroButton
            variant="pixel"
            size="sm"
            onClick={handleRefetch}
            className="retro-glow"
          >
            {isRefetching ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Loader2 className="h-3 w-3 mr-1" />
            )}
            REFRESH
          </RetroButton>
        </motion.div>
      </motion.div>
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
      <motion.div
        className="flex justify-end mb-2"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <RetroButton
          variant="pixel"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching}
          className="retro-glow"
        >
          {isRefetching ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESHING...</span>
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 mr-1" />
              <span className="font-pixel text-pixel-xs">REFRESH</span>
            </>
          )}
        </RetroButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="space-y-2"
      >
        {characterChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id.toString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
          >
            <ChallengeCard
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
          </motion.div>
        ))}
      </motion.div>

      {/* Loading more indicator */}
      <motion.div
        ref={loadMoreRef}
        className="py-3 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {isFetchingNextPage ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : hasNextPage ? (
          <span className="font-pixel text-pixel-xs text-primary/50">
            SCROLL FOR MORE
          </span>
        ) : characterChallenges.length > 0 ? (
          <span className="font-pixel text-pixel-xs text-primary/50">
            END OF CHALLENGES
          </span>
        ) : null}
      </motion.div>
    </div>
  );
}
