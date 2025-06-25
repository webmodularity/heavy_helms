"use client";

import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import { motion } from "framer-motion";
import { Leaf, Crown, Star, RefreshCw, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { EnsNameDisplay } from "@/components/ui/ens-name-display";

export function GreenRoomLeaderboard() {
  const router = useRouter();

  // Fetch players with exactly 420 wins
  const { players, isLoading, error, refetch, isRefetching } =
    useLeaderboardData({ limit: 50, sortBy: "battleRating", exactWins: 420 });

  const handlePlayerClick = (playerId: string) => {
    router.push(`/character/${playerId}`);
  };

  const renderLoadingSkeletons = () => (
    <div className="space-y-3">
      {/* biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading state */}
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`green-skeleton-${i}`}
          className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 animate-pulse"
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
    <div className="flex flex-col items-center justify-center h-64 text-center text-green-400">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-xl font-semibold mb-2">
        Failed to load The Green Room.
      </p>
      <p className="text-sm text-stone-400 mb-4">{error?.message}</p>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
      </Button>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-green-950/30 to-stone-900 border border-green-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-3 md:p-4 bg-gradient-to-r from-green-900/50 to-stone-900 border-b border-green-600/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Leaf className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-xl font-bold text-green-400">The Green Room</h2>
          </div>
          <span className="text-sm text-green-300 flex items-center justify-center">
            <Star className="h-4 w-4 mr-1" />
            Legendary 420 Win Club
          </span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-600">
            The Ultimate 420 Club
          </h3>
          <p className="text-sm text-green-300/70 mt-2">
            Legendary warriors who blazed through 420 victories
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-green-600 to-transparent mt-2" />
        </div>

        {isLoading ? (
          renderLoadingSkeletons()
        ) : error ? (
          renderErrorState()
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <Leaf className="h-16 w-16 text-green-400/50 mx-auto mb-4" />
            <p className="text-lg text-green-300">
              No warriors have achieved 420 wins yet
            </p>
            <p className="text-sm text-stone-400 mt-2">
              Reach this legendary milestone to join the Green Room!
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
                className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-600/30 rounded-lg p-4 cursor-pointer hover:from-green-800/30 hover:to-emerald-800/30 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        {index === 0 ? (
                          <Crown className="h-5 w-5 text-white" />
                        ) : (
                          <Leaf className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 h-8 w-8 bg-green-400/20 rounded-full animate-ping" />
                    </div>
                    <div>
                      <div className="font-bold text-green-200 group-hover:text-green-100 transition-colors">
                        {player.fullName}
                        <span className="text-green-400/70 text-sm font-normal ml-2">
                          #{player.id}
                        </span>
                      </div>
                      <div className="text-xs text-green-400/60">
                        Battle Rating: {Math.round(player.battleRating)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400 font-bold">
                      <Zap className="h-4 w-4" />
                      <span className="text-lg">420</span>
                    </div>
                    <div className="text-xs text-green-300/70">
                      Legendary Wins
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm relative z-10">
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50" />
                <div className="flex justify-center mt-3 space-x-1 relative z-10">
                  {/* biome-ignore lint/suspicious/noArrayIndexKey: decorative dots */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 bg-green-400/30 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>

                {/* Floating particles effect */}
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Leaf
                    className="h-3 w-3 text-green-400 animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
                <div className="absolute bottom-2 left-2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Star
                    className="h-2 w-2 text-green-400 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
