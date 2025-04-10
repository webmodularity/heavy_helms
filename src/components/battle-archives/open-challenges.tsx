"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Scroll, Coins, Hourglass, Loader2 } from "lucide-react";
import { useChallenges } from "@/hooks/use-challenges";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";

// Loading skeleton for a challenge card
function ChallengeCardSkeleton() {
  return (
    <div className="relative border border-amber-900/50 rounded bg-amber-950/10 overflow-hidden">
      {/* Torn edges effect with SVG */}
      <svg
        className="absolute top-0 left-0 w-full h-8 text-amber-900/30"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 L10,5 L20,2 L30,7 L40,3 L50,8 L60,2 L70,8 L80,5 L90,8 L100,3 L100,0 Z"
          fill="currentColor"
        />
      </svg>

      {/* "WANTED" stamp skeleton */}
      <div className="absolute -right-8 top-6 rotate-45 bg-red-900/40 text-amber-200 text-sm px-10 font-bold tracking-widest shadow-md animate-pulse">
        OPEN
      </div>

      <div className="pt-10 px-4 pb-4">
        {/* Title skeleton */}
        <div className="text-center mb-4">
          <div className="h-6 w-40 bg-amber-800/30 animate-pulse rounded mx-auto mb-2" />
          <div className="h-3 w-28 bg-amber-900/20 animate-pulse rounded mx-auto" />
        </div>

        {/* Challenge details skeleton */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="h-4 w-24 bg-amber-700/30 animate-pulse rounded mx-auto mb-2" />
            <div className="h-5 w-32 bg-amber-950/30 animate-pulse rounded mx-auto" />
          </div>

          <div className="text-center border-y border-amber-900/30 py-2 my-2">
            <div className="h-4 w-32 bg-amber-700/30 animate-pulse rounded mx-auto mb-2" />
            <div className="h-5 w-32 bg-amber-950/30 animate-pulse rounded mx-auto" />
          </div>

          <div className="text-center">
            <div className="h-4 w-28 bg-amber-700/30 animate-pulse rounded mx-auto mb-2" />
            <div className="h-6 w-20 bg-amber-950/30 animate-pulse rounded mx-auto" />
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-800/40" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-800/40" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-800/40" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-800/40" />
      </div>
    </div>
  );
}

export function OpenChallenges() {
  const {
    challenges,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useChallenges();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleRefetch = async () => {
    await refetch();
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return `${date.toLocaleDateString()}`;
  };

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

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Scroll className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Open Challenges</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400 flex items-center">
            <Hourglass className="h-4 w-4 mr-1" /> Awaiting acceptance
          </span>
          <Button
            size="sm"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {isLoading && challenges.length === 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* For skeleton loading items, we can safely use fixed keys since they're temporary */}
          <ChallengeCardSkeleton key="skeleton-1" />
          <ChallengeCardSkeleton key="skeleton-2" />
          <ChallengeCardSkeleton key="skeleton-3" />
          <ChallengeCardSkeleton key="skeleton-4" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>Failed to load challenges</p>
          <p className="text-sm text-red-300 mt-2">Please try again later</p>
          <Button
            onClick={handleRefetch}
            className="mt-4 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
            size="sm"
          >
            <Loader2
              className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-8 text-stone-300">
          <p>No open challenges found</p>
          <Button
            onClick={handleRefetch}
            className="mt-4 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
            size="sm"
          >
            <Loader2
              className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative border border-amber-900/50 rounded bg-amber-950/10 overflow-hidden"
              >
                {/* Torn edges effect with SVG */}
                <svg
                  className="absolute top-0 left-0 w-full h-8 text-amber-900/30"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,0 L10,5 L20,2 L30,7 L40,3 L50,8 L60,2 L70,8 L80,5 L90,8 L100,3 L100,0 Z"
                    fill="currentColor"
                  />
                </svg>

                {/* "WANTED" stamp */}
                <div className="absolute -right-8 top-6 rotate-45 bg-red-900/80 text-amber-200 text-sm px-10 font-bold tracking-widest shadow-md">
                  OPEN
                </div>

                <div className="pt-10 px-4 pb-4">
                  {/* Title with old paper effect */}
                  <div className="text-center mb-4">
                    <h3 className="text-amber-800 font-medievalsharp text-xl uppercase tracking-wider">
                      Bounty Notice
                    </h3>
                    <div className="text-amber-900/60 text-xs">
                      Posted on {formatDate(challenge.createdBlock.toString())}
                    </div>
                  </div>

                  {/* Challenge details */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-amber-700 text-sm font-semibold">
                        Challenger:
                      </div>
                      <div className="text-amber-950 font-bold">
                        {challenge.challengerName}
                      </div>
                    </div>

                    <div className="text-center border-y border-amber-900/30 py-2 my-2">
                      <div className="text-amber-700 text-sm font-semibold">
                        Seeks combat with:
                      </div>
                      <div className="text-amber-950 font-bold">
                        {challenge.defenderName}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-amber-700 text-sm font-semibold">
                        Wager Amount:
                      </div>
                      <div className="text-amber-950 font-bold text-lg">
                        {formatEther(challenge.wagerAmount)} ETH
                      </div>
                    </div>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-800/40" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-800/40" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-800/40" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-800/40" />
                </div>
              </motion.div>
            ))}
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
                size="sm"
                onClick={() => fetchNextPage()}
                className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
              >
                Load More Challenges
              </Button>
            ) : challenges.length > 0 ? (
              <span className="text-sm text-stone-400">End of challenges</span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
