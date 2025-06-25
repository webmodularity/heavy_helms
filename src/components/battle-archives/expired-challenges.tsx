"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useExpiredChallenges } from "@/hooks/use-expired-challenges";
import { Button } from "@/components/ui/button";

// Reusable skeleton (can keep the same one)
function ChallengeCardSkeleton() {
  return (
    <div className="relative border border-yellow-600/20 rounded-lg bg-stone-900/80 p-4 shadow-lg animate-pulse">
      <div className="absolute top-3 right-3 h-5 w-12 bg-red-900/50 rounded" />{" "}
      {/* Changed color hint */}
      <div className="text-center mb-4">
        <div className="h-5 w-40 bg-yellow-800/30 rounded mx-auto mb-2" />
        <div className="h-3 w-28 bg-stone-700/30 rounded mx-auto" />
      </div>
      <div className="space-y-3">
        <div className="text-center">
          <div className="h-4 w-24 bg-stone-700/30 rounded mx-auto mb-2" />
          <div className="h-4 w-32 bg-stone-600/30 rounded mx-auto" />
        </div>
        <div className="text-center border-y border-stone-700/50 py-2 my-3">
          <div className="h-4 w-32 bg-stone-700/30 rounded mx-auto mb-2" />
          <div className="h-4 w-32 bg-stone-600/30 rounded mx-auto" />
        </div>
        <div className="text-center">
          <div className="h-4 w-28 bg-stone-700/30 rounded mx-auto mb-2" />
          <div className="h-5 w-20 bg-yellow-800/30 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Renamed component
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
  } = useExpiredChallenges();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString();
  };

  // Infinite scroll useEffect remains the same
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
    <>
      {isLoading && challenges.length === 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>Failed to load expired challenges</p>
          <p className="text-sm text-red-300 mt-2">Please try again later</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-8 text-stone-300">
          <p>No expired challenges found</p>
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
                className="relative border border-yellow-600/20 rounded-lg bg-stone-900/80 p-4 shadow-lg"
              >
                <div className="absolute top-3 right-3 text-[10px] sm:text-xs text-red-400 font-bold bg-red-900/50 px-2 py-1 rounded shadow-md">
                  EXPIRED
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-yellow-500 font-bold text-lg uppercase tracking-wider">
                    A Challenge Issued
                  </h3>
                  <div className="text-stone-400 text-xs mt-1">
                    Posted on {formatDate(challenge.createdAt)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-stone-400 text-sm font-semibold">
                      Challenger:
                    </div>
                    <div className="text-stone-100 font-semibold">
                      {challenge.challengerSnapshot?.fullName || "Unknown"}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-stone-400 text-sm font-semibold">
                      Sought combat with:
                    </div>
                    <div className="text-stone-100 font-semibold">
                      {challenge.defenderSnapshot?.fullName ||
                        "Anyone Brave Enough"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
                className="border-yellow-600/20 hover:bg-yellow-500/10 text-stone-300 hover:text-yellow-400"
                variant="outline"
              >
                Load More Challenges
              </Button>
            ) : challenges.length > 0 ? (
              <span className="text-sm text-stone-400">End of challenges</span>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
