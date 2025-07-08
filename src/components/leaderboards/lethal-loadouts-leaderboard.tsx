"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Award,
  Medal,
  Sword,
  Target,
  Skull,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHighestKillRate } from "@/hooks/use-skin-analytics";
import { createPlayerSkin } from "@/lib/player-api";

// Types for the enhanced analytics
interface LethalLoadoutEntry {
  id: string;
  skin?: {
    id: string;
    metadataURI: string;
    weapon: number;
    armor: number;
  };
  skinCollectionId: string;
  skinTokenId: number;
  stance: number;
  totalCombats: number;
  kills: number;
  killRate: number;
  killDeathRatio: number;
  winRate: number;
  averageDamageDealt: number;
  survivalRate: number;
  imageURL?: string;
  skinName?: string;
}

type LethalSortBy = "killRate" | "kills" | "killDeathRatio" | "winRate";

const SORT_OPTIONS = [
  { value: "killRate" as const, label: "Kill Rate" },
  { value: "kills" as const, label: "Total Kills" },
  { value: "killDeathRatio" as const, label: "K/D Ratio" },
  { value: "winRate" as const, label: "Win Rate" },
];

// Helper functions
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function getStanceName(stance: number): string {
  const names = ["🛡️ Defensive", "⚖️ Balanced", "⚔️ Offensive"];
  return names[stance] || "Unknown";
}

function getStanceIcon(stance: number): string {
  const icons = ["🛡️", "⚖️", "⚔️"];
  return icons[stance] || "❓";
}

export function LethalLoadoutsLeaderboard() {
  const [sortBy, setSortBy] = useState<LethalSortBy>("killRate");
  const { lethalLoadouts, loading: isLoading, error } = useHighestKillRate(10);

  // Process and sort the leaderboard data
  const processedLeaderboard = useMemo(() => {
    if (!lethalLoadouts || lethalLoadouts.length === 0) return [];

    return lethalLoadouts.map((loadout: any) => ({
      ...loadout,
      skinName: `Skin #${loadout.skinCollectionId.slice(-6)}-${loadout.skinTokenId}`,
      imageURL: "/images/default-skin.png", // Will be enhanced later
    }));
  }, [lethalLoadouts]);

  const finalSortedLeaderboard = useMemo(() => {
    return [...processedLeaderboard].sort((a, b) => {
      switch (sortBy) {
        case "killRate":
          return b.killRate - a.killRate;
        case "kills":
          return b.kills - a.kills;
        case "killDeathRatio":
          return b.killDeathRatio - a.killDeathRatio;
        case "winRate":
          return b.winRate - a.winRate;
        default:
          return b.killRate - a.killRate;
      }
    });
  }, [processedLeaderboard, sortBy]);

  // Render rank badge
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Crown className="h-8 w-8 text-yellow-400 drop-shadow-glow" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Award className="h-7 w-7 text-slate-300 drop-shadow-glow" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Medal className="h-7 w-7 text-amber-700 drop-shadow-glow" />
          </div>
        );
      default:
        return null;
    }
  };

  // Get sort value for display
  const getSortValue = (loadout: LethalLoadoutEntry): string => {
    switch (sortBy) {
      case "killRate":
        return formatPercentage(loadout.killRate);
      case "kills":
        return loadout.kills.toString();
      case "killDeathRatio":
        return formatRatio(loadout.killDeathRatio);
      case "winRate":
        return formatPercentage(loadout.winRate);
      default:
        return formatPercentage(loadout.killRate);
    }
  };

  const getSortLabel = (sort: LethalSortBy): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option?.label || "Kill Rate";
  };

  // Loading skeletons
  const renderLoadingSkeletons = () => (
    <div className="p-3 md:p-4">
      {/* Top 3 skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((rank) => (
          <div
            key={`top-skeleton-${rank}`}
            className="relative p-4 bg-stone-800/30 border border-stone-700/50 rounded-lg shadow-lg flex flex-col min-h-[200px]"
          >
            <div className="text-center flex-grow">
              <Skeleton className="h-6 w-24 mx-auto mb-1" />
              <Skeleton className="h-5 w-32 mx-auto mb-1" />
              <Skeleton className="h-4 w-20 mx-auto mb-3" />
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="hidden md:block">
        <div className="border border-red-900/20 rounded-lg overflow-hidden">
          <div className="bg-red-950/30 p-3">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
          </div>
          <div className="space-y-2 p-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 p-2">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-500 mb-4">
        <Skull className="h-12 w-12 mx-auto mb-2" />
        <p className="text-lg font-semibold">Failed to load lethal loadouts</p>
      </div>
      <p className="text-stone-400 mb-4">
        {error?.message || "An error occurred while fetching the data."}
      </p>
    </div>
  );

  if (isLoading) return renderLoadingSkeletons();
  if (error) return renderErrorState();
  if (!finalSortedLeaderboard.length) {
    return (
      <div className="bg-stone-900 border border-red-600/20 rounded-lg overflow-hidden h-full">
        <div className="p-3 md:p-4 bg-gradient-to-r from-red-900/50 to-stone-900 border-b border-red-600/20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Skull className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-xl font-bold text-red-400">
                Most Lethal Loadouts
              </h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Skull className="h-12 w-12 text-stone-500 mb-4" />
          <p className="text-lg font-semibold text-stone-400">
            No lethal data available
          </p>
          <p className="text-stone-500">
            Kill tracking data is still being processed.
          </p>
        </div>
      </div>
    );
  }

  const topThree = finalSortedLeaderboard.slice(0, 3);
  const restOfLoadouts = finalSortedLeaderboard.slice(3);

  return (
    <div className="bg-stone-900 border border-red-600/20 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 md:p-4 bg-gradient-to-r from-red-900/50 to-stone-900 border-b border-red-600/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <Skull className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-xl font-bold text-red-400">
                Most Lethal Loadouts
              </h2>
            </div>
            <p className="text-sm text-stone-400">
              Skin + stance combinations with the highest kill rates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as LethalSortBy)}
              className="bg-stone-800 border border-red-600/20 rounded px-3 py-1 text-sm text-stone-200 focus:outline-none focus:border-red-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topThree.map((loadout, index) => {
            const rank = index + 1;
            return (
              <motion.div
                key={loadout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-4 bg-gradient-to-br from-red-900/30 to-stone-800/30 border border-red-700/50 rounded-lg shadow-lg hover:shadow-red-500/20 transition-all duration-300 flex flex-col min-h-[200px]"
              >
                {renderRankBadge(rank)}

                <div className="text-center flex-grow">
                  <div className="text-lg font-semibold text-stone-200 mb-1">
                    #{rank}
                  </div>
                  <div className="text-sm font-medium text-red-400 mb-1">
                    {loadout.skinName}
                  </div>
                  <div className="text-xs text-stone-400 mb-3">
                    {getStanceName(loadout.stance)}
                  </div>

                  <div className="text-2xl font-bold text-red-400 mb-2">
                    {getSortValue(loadout)}
                  </div>

                  <div className="space-y-1 text-xs text-stone-400">
                    <div className="flex justify-between">
                      <span>Kills:</span>
                      <span className="text-red-400 font-medium">
                        {loadout.kills}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>K/D Ratio:</span>
                      <span className="text-red-400 font-medium">
                        {formatRatio(loadout.killDeathRatio)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="text-red-400 font-medium">
                        {formatPercentage(loadout.winRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fights:</span>
                      <span className="text-stone-300">
                        {loadout.totalCombats}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rest of the leaderboard - Table for desktop */}
        {restOfLoadouts.length > 0 && (
          <div className="hidden md:block">
            <div className="border border-red-900/20 rounded-lg overflow-hidden">
              <div className="bg-red-950/30 p-3">
                <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-red-400">
                  <div>Rank</div>
                  <div>Loadout</div>
                  <div>Kill Rate</div>
                  <div>Kills</div>
                  <div>K/D Ratio</div>
                  <div>Win Rate</div>
                  <div>Fights</div>
                </div>
              </div>
              <div className="space-y-1">
                {restOfLoadouts.map((loadout, index) => {
                  const rank = index + 4;
                  return (
                    <motion.div
                      key={loadout.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-7 gap-4 p-3 hover:bg-red-900/20 transition-colors border-b border-red-900/10 last:border-b-0"
                    >
                      <div className="text-stone-300 font-medium">#{rank}</div>
                      <div>
                        <div className="text-red-400 font-medium text-sm">
                          {loadout.skinName}
                        </div>
                        <div className="text-xs text-stone-400">
                          {getStanceIcon(loadout.stance)}{" "}
                          {getStanceName(loadout.stance)
                            .replace(/🛡️|⚖️|⚔️/g, "")
                            .trim()}
                        </div>
                      </div>
                      <div className="text-red-400 font-medium">
                        {formatPercentage(loadout.killRate)}
                      </div>
                      <div className="text-stone-300">{loadout.kills}</div>
                      <div className="text-stone-300">
                        {formatRatio(loadout.killDeathRatio)}
                      </div>
                      <div className="text-stone-300">
                        {formatPercentage(loadout.winRate)}
                      </div>
                      <div className="text-stone-400">
                        {loadout.totalCombats}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile layout */}
        {restOfLoadouts.length > 0 && (
          <div className="md:hidden space-y-3">
            {restOfLoadouts.map((loadout, index) => {
              const rank = index + 4;
              return (
                <motion.div
                  key={loadout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-red-900/20 to-stone-800/20 border border-red-700/30 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-red-400 font-medium">
                        #{rank} {loadout.skinName}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getStanceName(loadout.stance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">
                        {getSortValue(loadout)}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getSortLabel(sortBy)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Kills:</span>
                      <span className="text-red-400">{loadout.kills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">K/D:</span>
                      <span className="text-stone-300">
                        {formatRatio(loadout.killDeathRatio)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Win Rate:</span>
                      <span className="text-stone-300">
                        {formatPercentage(loadout.winRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Fights:</span>
                      <span className="text-stone-300">
                        {loadout.totalCombats}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
