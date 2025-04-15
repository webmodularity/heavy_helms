"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sword, Shield, Trophy, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";

// Loading skeleton for a battle card
function BattleCardSkeleton() {
  return (
    <div className="p-4 border-b border-stone-800">
      <div className="flex flex-col md:flex-row items-start md:items-center">
        <div className="flex-1 flex items-center mb-2 md:mb-0">
          {/* Challenger skeleton */}
          <div className="flex flex-col items-center mr-4">
            <div className="h-10 w-10 rounded-full bg-stone-800/80 animate-pulse" />
            <div className="h-2 w-16 bg-stone-800/80 animate-pulse mt-2 rounded" />
          </div>

          {/* VS Indicator skeleton */}
          <div className="flex flex-col items-center mx-2">
            <div className="h-4 w-8 bg-stone-800/80 animate-pulse rounded" />
            <div className="h-3 w-3 bg-stone-800/80 animate-pulse mt-1 rounded-full" />
          </div>

          {/* Defender skeleton */}
          <div className="flex flex-col items-center ml-4">
            <div className="h-10 w-10 rounded-full bg-stone-800/80 animate-pulse" />
            <div className="h-2 w-16 bg-stone-800/80 animate-pulse mt-2 rounded" />
          </div>
        </div>

        {/* Outcome skeleton */}
        <div className="flex-1 md:text-center">
          <div className="h-4 w-48 bg-stone-800/80 animate-pulse rounded mx-auto mb-2" />
          <div className="h-3 w-24 bg-stone-800/80 animate-pulse rounded mx-auto" />
        </div>

        {/* Timestamp skeleton */}
        <div className="h-3 w-24 bg-stone-800/80 animate-pulse rounded mt-2 md:mt-0" />
      </div>

      {/* Battle details skeleton */}
      <div className="mt-3 flex justify-between">
        <div className="h-3 w-20 bg-stone-800/80 animate-pulse rounded" />
        <div className="h-3 w-28 bg-stone-800/80 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function RecentBattles() {
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Sword className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Recent Battles</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400 flex items-center">
            <Clock className="h-4 w-4 mr-1" /> Latest combat logs
          </span>
          <Button
            // variant="outline"
            size="sm"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400  text-yellow-500"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {isLoading && duels.length === 0 ? (
        <div className="divide-y divide-stone-800">
          {/* Display 5 skeleton cards while loading */}
          {Array.from({ length: 5 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <BattleCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>Failed to load recent battles</p>
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
      ) : duels.length === 0 ? (
        <div className="text-center py-8 text-stone-300">
          <p>No recent battles found</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-stone-800">
            {duels.map((duel, index) => {
              const isChallenger =
                duel.winnerId === duel.challenge.challengerId;
              const winner = isChallenger
                ? duel.challenge.challengerSnapshot
                : duel.challenge.defenderSnapshot;
              const loser = isChallenger
                ? duel.challenge.defenderSnapshot
                : duel.challenge.challengerSnapshot;

              return (
                <motion.div
                  key={duel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="cursor-pointer p-4 hover:bg-amber-900/10 transition-colors"
                  onClick={() => {
                    router.push(`/duel?txId=${duel.id}`);
                  }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    <div className="flex-1 flex items-center mb-2 md:mb-0">
                      {/* Challenger */}
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${isChallenger ? "ring-2 ring-green-500" : ""}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                          {/* Placeholder for actual images */}
                          <div className="h-full w-full bg-amber-800 flex items-center justify-center text-white font-bold">
                            {duel.challenge.challengerSnapshot.fullName.charAt(
                              0,
                            )}
                          </div>
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
                          className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${!isChallenger ? "ring-2 ring-green-500" : ""}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                          {/* Placeholder for actual images */}
                          <div className="h-full w-full bg-red-900 flex items-center justify-center text-white font-bold">
                            {duel.challenge.defenderSnapshot.fullName.charAt(0)}
                          </div>
                        </div>
                        <span className="text-xs text-stone-400 mt-1 truncate w-20 text-center">
                          {duel.challenge.defenderSnapshot.fullName}
                        </span>
                      </div>
                    </div>

                    {/* Outcome */}
                    <div className="flex-1 md:text-center">
                      <div className="flex items-center text-sm font-medium">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-400">
                          {winner.fullName}
                        </span>
                        <span className="text-stone-500 mx-1">defeated</span>
                        <span className="text-red-400">{loser.fullName}</span>
                      </div>
                      {duel.challenge.wagerAmount &&
                        Number.parseFloat(duel.challenge.wagerAmount) > 0 && (
                          <div className="text-xs text-green-400 mt-1">
                            Wager:{" "}
                            {formatEther(BigInt(duel.challenge.wagerAmount))}{" "}
                            ETH
                          </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-stone-500 mt-2 md:mt-0">
                      {formatDate(duel.blockTimestamp)}
                    </div>
                  </div>

                  {/* Battle details - can expand in future */}
                  <div className="mt-3 text-xs text-stone-600 flex justify-between">
                    <span>Block #: {duel.blockNumber}</span>
                    <span>
                      TX: {duel.id.substring(0, 10)}...
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
            className="p-4 flex justify-center border-t border-yellow-600/20"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
            ) : hasNextPage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
              >
                Load More Battles
              </Button>
            ) : duels.length > 0 ? (
              <span className="text-sm text-stone-400">
                End of battle history
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
