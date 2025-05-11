"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Scroll, Clock, Loader2 } from "lucide-react";
import { useExpiredWagerChallenges } from "@/hooks/use-expired-wager-challenges";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";

// Reusable skeleton
function ChallengeCardSkeleton() {
  return (
    <div className="relative border border-yellow-600/20 rounded-lg bg-stone-900/80 p-2.5 shadow-md animate-pulse">
      <div className="absolute top-2 right-2 h-4 w-10 bg-red-900/50 rounded text-[9px]" />
      <div className="text-center mb-2">
        <div className="h-4 w-32 bg-yellow-800/30 rounded mx-auto mb-1.5" />
        <div className="h-2.5 w-24 bg-stone-700/30 rounded mx-auto" />
      </div>
      <div className="space-y-2">
        <div className="text-center">
          <div className="h-3 w-20 bg-stone-700/30 rounded mx-auto mb-1" />
          <div className="h-3 w-28 bg-stone-600/30 rounded mx-auto" />
        </div>
        <div className="text-center border-y border-stone-700/50 py-1.5 my-2">
          <div className="h-3 w-24 bg-stone-700/30 rounded mx-auto mb-1" />
          <div className="h-3 w-28 bg-stone-600/30 rounded mx-auto" />
        </div>
        <div className="text-center">
          <div className="h-3 w-20 bg-stone-700/30 rounded mx-auto mb-1" />
          <div className="h-4 w-16 bg-yellow-800/30 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ExpiredChallenges() {
  const {
    challenges,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useExpiredWagerChallenges();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleRefetch = async () => {
    await refetch();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString();
  };

  // Infinite scroll setup
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
      { rootMargin: "150px" },
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center">
          <Scroll className="h-4 w-4 text-yellow-500 mr-1.5" />
          <h2 className="text-lg font-bold text-yellow-400">Expired Challenges</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Past acceptance window
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

      {isLoading && challenges.length === 0 ? (
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-400">
          <p className="text-sm">Failed to load expired challenges</p>
          <p className="text-xs text-red-300 mt-1.5">Please try again later</p>
          <Button
            onClick={handleRefetch}
            className="mt-3 h-7 px-2.5 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500 text-xs"
            size="sm"
            variant="outline"
          >
            <Loader2
              className={`mr-1.5 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-6 text-stone-300">
          <p className="text-sm">No expired wager challenges found</p>
          <Button
            onClick={handleRefetch}
            className="mt-3 h-7 px-2.5 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500 text-xs"
            size="sm"
            variant="outline"
          >
            <Loader2
              className={`mr-1.5 h-3 w-3 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative border border-yellow-600/20 rounded-lg bg-stone-900/80 p-2.5 shadow-md"
              >
                <div className="absolute top-2 right-2 text-[9px] text-red-400 font-bold bg-red-900/50 px-1.5 py-0.5 rounded shadow-sm">
                  EXPIRED
                </div>

                <div className="text-center mb-2">
                  <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wider">
                    A Challenge Issued
                  </h3>
                  <div className="text-stone-400 text-[10px] mt-0.5">
                    Posted on {formatDate(challenge.createdAt)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-stone-400 text-xs font-medium">
                      Challenger:
                    </div>
                    <div className="text-stone-100 text-sm font-medium">
                      {challenge.challengerSnapshot?.fullName || "Unknown"}
                    </div>
                  </div>

                  <div className="text-center border-y border-stone-700/50 py-1.5 my-1.5">
                    <div className="text-stone-400 text-xs font-medium">
                      Sought combat with:
                    </div>
                    <div className="text-stone-100 text-sm font-medium">
                      {challenge.defenderSnapshot?.fullName ||
                        "Anyone Brave Enough"}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-stone-400 text-xs font-medium">
                      Wager Amount:
                    </div>
                    <div className="text-yellow-500 font-bold text-base">
                      {formatEther(BigInt(challenge.wagerAmount))} ETH
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="p-2.5 flex justify-center border-t border-yellow-600/20"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
            ) : hasNextPage ? (
              <Button
                size="sm"
                onClick={() => fetchNextPage()}
                className="h-7 text-xs border-yellow-600/20 hover:bg-yellow-500/10 text-stone-300 hover:text-yellow-400"
                variant="outline"
              >
                Load More Challenges
              </Button>
            ) : challenges.length > 0 ? (
              <span className="text-xs text-stone-400">End of challenges</span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
