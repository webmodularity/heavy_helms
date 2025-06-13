"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sword, Shield, Trophy, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { useRouter } from "next/navigation";
import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";
import { formatEther } from "viem";

// Loading skeleton for a battle card
function BattleCardSkeleton() {
  return (
    <div className="p-2.5 border-b border-stone-800">
      <div className="flex flex-col md:flex-row items-start md:items-center">
        <div className="flex-1 flex items-center mb-1.5 md:mb-0">
          {/* Challenger skeleton */}
          <div className="flex flex-col items-center mr-2">
            <div className="h-8 w-8 rounded-full bg-stone-800/80 animate-pulse" />
            <div className="h-1.5 w-14 bg-stone-800/80 animate-pulse mt-1.5 rounded" />
          </div>

          {/* VS Indicator skeleton */}
          <div className="flex flex-col items-center mx-1.5">
            <div className="h-3 w-6 bg-stone-800/80 animate-pulse rounded" />
            <div className="h-2 w-2 bg-stone-800/80 animate-pulse mt-1 rounded-full" />
          </div>

          {/* Defender skeleton */}
          <div className="flex flex-col items-center ml-2">
            <div className="h-8 w-8 rounded-full bg-stone-800/80 animate-pulse" />
            <div className="h-1.5 w-14 bg-stone-800/80 animate-pulse mt-1.5 rounded" />
          </div>
        </div>

        {/* Outcome skeleton */}
        <div className="flex-1 md:text-center">
          <div className="h-3 w-36 bg-stone-800/80 animate-pulse rounded mx-auto mb-1.5" />
          <div className="h-2 w-20 bg-stone-800/80 animate-pulse rounded mx-auto" />
        </div>

        {/* Timestamp skeleton */}
        <div className="h-2 w-20 bg-stone-800/80 animate-pulse rounded mt-1.5 md:mt-0" />
      </div>

      {/* Battle details skeleton */}
      <div className="mt-2 flex justify-between">
        <div className="h-2 w-16 bg-stone-800/80 animate-pulse rounded" />
        <div className="h-2 w-24 bg-stone-800/80 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function RecentDuels() {
  const {
    duels,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useRecentDuels();
  const router = useRouter();
  const { openFightModal } = useGlobalFightModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [navigatingToDuelId, setNavigatingToDuelId] = useState<string | null>(
    null,
  );

  // State to track which duel is currently active/selected
  const [activeDuelId, setActiveDuelId] = useState<string | null>(null);

  const handleRefetch = async () => {
    await refetch();
  };

  const handleDuelNavigation = (duelId: string) => {
    if (navigatingToDuelId) return;
    setNavigatingToDuelId(duelId);
    router.push(`/duel?txId=${duelId}`);
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-2.5 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Sword className="h-4 w-4 text-yellow-500 mr-1.5" />
          <h2 className="text-base font-bold text-yellow-400">
            Recent Battles
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-400 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Latest combat logs
          </span>
          <Button
            size="xs"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="h-6 px-2 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
          >
            {isRefetching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {isLoading && duels.length === 0 ? (
        <div className="divide-y divide-stone-800">
          {Array.from({ length: 5 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <BattleCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-400">
          <p className="text-sm">Failed to load recent battles</p>
          <p className="text-xs text-red-300 mt-1.5">Please try again later</p>
          <Button
            onClick={handleRefetch}
            className="mt-3 h-6 px-2"
            size="xs"
            variant="outline"
          >
            <Loader2
              className={`mr-1.5 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : duels.length === 0 ? (
        <div className="text-center py-4 text-stone-300">
          <p className="text-sm">No recent battles found</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-stone-800">
            {duels.map((duel, index) => {
              const isNavigatingThisDuel = navigatingToDuelId === duel.id;
              const isChallenger =
                duel.winnerId === duel.challenge.challengerId;
              const winner = isChallenger
                ? duel.challenge.challengerSnapshot
                : duel.challenge.defenderSnapshot;
              const loser = isChallenger
                ? duel.challenge.defenderSnapshot
                : duel.challenge.challengerSnapshot;

              const challengerImageUrl =
                duel.challenge.challengerSnapshot.currentSkin?.imageURL;
              const defenderImageUrl =
                duel.challenge.defenderSnapshot.currentSkin?.imageURL;

              const isActive = activeDuelId === duel.id;

              return (
                <motion.div
                  key={duel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`cursor-pointer p-4 transition-colors ${
                    isActive
                      ? "bg-yellow-600/15 border-l-4 border-yellow-500/60"
                      : "hover:bg-amber-900/10"
                  }`}
                  onClick={() => {
                    setActiveDuelId(duel.id);
                    openFightModal({
                      txId: duel.id,
                      title: `Duel: ${winner.fullName} vs ${loser.fullName}`,
                    });
                  }}
                  tabIndex={isNavigatingThisDuel ? -1 : 0}
                  aria-busy={isNavigatingThisDuel}
                  onMouseEnter={() => setActiveDuelId(null)} // Clear active state on hover to allow normal hover behavior
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    <div className="flex-1 flex items-center mb-1.5 md:mb-0">
                      {/* Challenger */}
                      <div className="flex flex-col items-center mr-2">
                        <div
                          className={`h-8 w-8 rounded-full overflow-hidden bg-stone-800 relative ${isChallenger ? "ring-1 ring-green-500" : ""}`}
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
                              sizes="32px"
                              priority={index < 5}
                            />
                          ) : (
                            <div className="h-full w-full bg-amber-800 flex items-center justify-center text-white font-bold text-xs">
                              {duel.challenge.challengerSnapshot.fullName.charAt(
                                0,
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1 truncate w-16 text-center">
                          {duel.challenge.challengerSnapshot.fullName}
                        </span>
                      </div>

                      {/* VS Indicator */}
                      <div className="flex flex-col items-center mx-1.5">
                        <div className="text-yellow-600 text-xs">VS</div>
                        <div className="text-[9px] text-stone-500">⚔️</div>
                      </div>

                      {/* Defender */}
                      <div className="flex flex-col items-center ml-2">
                        <div
                          className={`h-8 w-8 rounded-full overflow-hidden bg-stone-800 relative ${!isChallenger ? "ring-1 ring-green-500" : ""}`}
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
                              sizes="32px"
                              priority={index < 5}
                            />
                          ) : (
                            <div className="h-full w-full bg-red-900 flex items-center justify-center text-white font-bold text-xs">
                              {duel.challenge.defenderSnapshot.fullName.charAt(
                                0,
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1 truncate w-16 text-center">
                          {duel.challenge.defenderSnapshot.fullName}
                        </span>
                      </div>
                    </div>

                    {/* Outcome */}
                    <div className="flex-1 md:text-center">
                      <div className="flex items-center text-xs">
                        <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-yellow-400">
                          {winner.fullName}
                        </span>
                        <span className="text-stone-500 mx-1">defeated</span>
                        <span className="text-red-400">{loser.fullName}</span>
                      </div>
                      {duel.challenge.wagerAmount &&
                        Number.parseFloat(duel.challenge.wagerAmount) > 0 && (
                          <div className="text-[10px] text-green-400 mt-0.5">
                            Wager:{" "}
                            {formatEther(BigInt(duel.challenge.wagerAmount))}{" "}
                            ETH
                          </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-[10px] text-stone-500 mt-1.5 md:mt-0 relative">
                      {formatDate(duel.blockTimestamp)}
                      {isNavigatingThisDuel && (
                        <Loader2 className="h-3 w-3 text-yellow-500 animate-spin absolute -right-4 top-0" />
                      )}
                    </div>
                  </div>

                  {/* Battle details */}
                  <div className="mt-2 text-[9px] text-stone-600 flex justify-between">
                    <span>Block #: {duel.blockNumber}</span>
                    <span>
                      TX: {duel.id.substring(0, 8)}...
                      {duel.id.substring(duel.id.length - 4)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Loading more indicator */}
          <div
            ref={loadMoreRef}
            className="p-2.5 flex justify-center border-t border-yellow-600/20"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
            ) : hasNextPage ? (
              <Button
                variant="outline"
                size="xs"
                onClick={() => !isFetchingNextPage && fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-6 px-2 text-xs border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
              >
                Load More Duels
              </Button>
            ) : duels.length > 0 ? (
              <span className="text-xs text-stone-400">
                End of battle history
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
