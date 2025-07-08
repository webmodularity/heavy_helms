"use client";

import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import { motion } from "framer-motion";
import { Heart, Crown, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { EnsNameDisplay } from "@/components/ui/ens-name-display";

export function VelvetRopeLeaderboard() {
  const router = useRouter();

  // Fetch players with exactly 69 wins
  const { players, isLoading, error, refetch, isRefetching } =
    useLeaderboardData({ limit: 50, sortBy: "battleRating", exactWins: 69 });

  const handlePlayerClick = (playerId: string) => {
    router.push(`/character/${playerId}`);
  };

  const renderLoadingSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading state
        <div
          key={`velvet-skeleton-${i}`}
          className="bg-pink-900/20 border border-pink-600/30 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center text-pink-400">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-xl font-semibold mb-2">
        Failed to load The Velvet Rope.
      </p>
      <p className="text-sm text-stone-400 mb-4">{error?.message}</p>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
      </Button>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-pink-950/30 to-stone-900 border border-pink-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-3 md:p-4 bg-gradient-to-r from-pink-900/50 to-stone-900 border-b border-pink-600/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Heart className="h-5 w-5 text-pink-500 mr-2" />
            <h2 className="text-xl font-bold text-pink-400">The Velvet Rope</h2>
          </div>
          <span className="text-sm text-pink-300 flex items-center justify-center">
            <Sparkles className="h-4 w-4 mr-1" />
            Exclusive 69 Win Club
          </span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-pink-600">
            The Elite 69 Club
          </h3>
          <p className="text-sm text-pink-300/70 mt-2">
            Warriors who achieved the legendary 69 victories
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-pink-600 to-transparent mt-2" />
        </div>

        {isLoading ? (
          renderLoadingSkeletons()
        ) : error ? (
          renderErrorState()
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <p className="text-lg text-pink-300">
              No warriors have achieved 69 wins yet
            </p>
            <p className="text-sm text-stone-400 mt-2">
              Be the first to join this exclusive club!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handlePlayerClick(player.id)}
                className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-600/30 rounded-lg p-4 cursor-pointer hover:from-pink-800/30 hover:to-purple-800/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        {index === 0 ? (
                          <Crown className="h-5 w-5 text-white" />
                        ) : (
                          <Heart className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-pink-400 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-pink-200 group-hover:text-pink-100 transition-colors">
                        {player.fullName}
                        <span className="text-pink-400/70 text-sm font-normal ml-2">
                          #{player.id}
                        </span>
                      </div>
                      <div className="text-xs text-pink-400/60">
                        Battle Rating: {Math.round(player.battleRating)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-pink-400 font-bold">
                      <Heart className="h-4 w-4" />
                      <span className="text-lg">69</span>
                    </div>
                    <div className="text-xs text-pink-300/70">Perfect Wins</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-red-400">
                      <span className="text-stone-400">L:</span> {player.losses}
                    </span>
                    <span className="text-blue-400">
                      <span className="text-stone-400">K:</span> {player.kills}
                    </span>
                  </div>
                  <div className="text-xs">
                    <EnsNameDisplay
                      address={
                        player.owner?.address as `0x${string}` | undefined
                      }
                    />
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-pink-500/50" />
                <div className="flex justify-center mt-3 space-x-1">
                  {[...Array(3)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: decorative dots
                    <div
                      key={i}
                      className="h-1 w-1 bg-pink-400/30 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
