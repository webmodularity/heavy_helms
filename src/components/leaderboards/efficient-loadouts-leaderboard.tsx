"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Crown, Award, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBestDamageEfficiency } from "@/hooks/use-skin-analytics";

// Types for efficient loadouts
interface EfficientLoadoutEntry {
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
  damageEfficiency: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  totalCombats: number;
  winRate: number;
  killRate: number;
  survivalRate: number;
  skinName?: string;
}

type EfficientSortBy =
  | "damageEfficiency"
  | "averageDamageDealt"
  | "winRate"
  | "killRate";

const SORT_OPTIONS = [
  { value: "damageEfficiency" as const, label: "Damage Efficiency" },
  { value: "averageDamageDealt" as const, label: "Avg Damage Dealt" },
  { value: "winRate" as const, label: "Win Rate" },
  { value: "killRate" as const, label: "Kill Rate" },
];

// Helper functions
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDamage(value: number): string {
  return Math.round(value).toString();
}

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function getStanceName(stance: number): string {
  const names = ["🛡️ Defensive", "⚖️ Balanced", "⚔️ Offensive"];
  return names[stance] || "Unknown";
}

export function EfficientLoadoutsLeaderboard() {
  const [sortBy, setSortBy] = useState<EfficientSortBy>("damageEfficiency");
  const {
    efficientLoadouts,
    loading: isLoading,
    error,
  } = useBestDamageEfficiency(10);

  // Process and sort the leaderboard data
  const processedLeaderboard = useMemo(() => {
    if (!efficientLoadouts || efficientLoadouts.length === 0) return [];

    return efficientLoadouts.map((loadout: any) => ({
      ...loadout,
      skinName: `Skin #${loadout.skinCollectionId.slice(-6)}-${loadout.skinTokenId}`,
    }));
  }, [efficientLoadouts]);

  const finalSortedLeaderboard = useMemo(() => {
    return [...processedLeaderboard].sort((a, b) => {
      switch (sortBy) {
        case "damageEfficiency":
          return b.damageEfficiency - a.damageEfficiency;
        case "averageDamageDealt":
          return b.averageDamageDealt - a.averageDamageDealt;
        case "winRate":
          return b.winRate - a.winRate;
        case "killRate":
          return b.killRate - a.killRate;
        default:
          return b.damageEfficiency - a.damageEfficiency;
      }
    });
  }, [processedLeaderboard, sortBy]);

  // Get sort value for display
  const getSortValue = (loadout: EfficientLoadoutEntry): string => {
    switch (sortBy) {
      case "damageEfficiency":
        return formatRatio(loadout.damageEfficiency);
      case "averageDamageDealt":
        return formatDamage(loadout.averageDamageDealt);
      case "winRate":
        return formatPercentage(loadout.winRate);
      case "killRate":
        return formatPercentage(loadout.killRate);
      default:
        return formatRatio(loadout.damageEfficiency);
    }
  };

  const getSortLabel = (sort: EfficientSortBy): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option?.label || "Damage Efficiency";
  };

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

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`efficient-skeleton-${i}`} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-lg font-semibold text-stone-400">
          Failed to load efficient loadouts
        </p>
      </div>
    );
  }

  if (!finalSortedLeaderboard.length) {
    return (
      <div className="bg-stone-900 border border-green-600/20 rounded-lg overflow-hidden h-full">
        <div className="p-4 bg-gradient-to-r from-green-900/50 to-stone-900 border-b border-green-600/20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-xl font-bold text-green-400">
                Most Efficient Loadouts
              </h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-stone-500 mb-4" />
          <p className="text-lg font-semibold text-stone-400">
            No efficiency data available
          </p>
        </div>
      </div>
    );
  }

  const topThree = finalSortedLeaderboard.slice(0, 3);
  const restOfLoadouts = finalSortedLeaderboard.slice(3);

  return (
    <div className="bg-stone-900 border border-green-600/20 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-900/50 to-stone-900 border-b border-green-600/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-xl font-bold text-green-400">
                Most Efficient Loadouts
              </h2>
            </div>
            <p className="text-sm text-stone-400">
              Best damage dealt vs damage taken ratios
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as EfficientSortBy)}
              className="bg-stone-800 border border-green-600/20 rounded px-3 py-1 text-sm text-stone-200 focus:outline-none focus:border-green-500"
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

      <div className="p-4">
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
                className="relative p-4 bg-gradient-to-br from-green-900/30 to-stone-800/30 border border-green-700/50 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 flex flex-col min-h-[200px]"
              >
                {renderRankBadge(rank)}

                <div className="text-center flex-grow">
                  <div className="text-lg font-semibold text-stone-200 mb-1">
                    #{rank}
                  </div>
                  <div className="text-sm font-medium text-green-400 mb-1">
                    {loadout.skinName}
                  </div>
                  <div className="text-xs text-stone-400 mb-3">
                    {getStanceName(loadout.stance)}
                  </div>

                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {getSortValue(loadout)}
                  </div>

                  <div className="space-y-1 text-xs text-stone-400">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="text-green-400 font-medium">
                        {formatRatio(loadout.damageEfficiency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Dealt:</span>
                      <span className="text-green-400 font-medium">
                        {formatDamage(loadout.averageDamageDealt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Taken:</span>
                      <span className="text-green-400 font-medium">
                        {formatDamage(loadout.averageDamageTaken)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="text-stone-300">
                        {formatPercentage(loadout.winRate)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rest of the leaderboard */}
        {restOfLoadouts.length > 0 && (
          <div className="space-y-3">
            {restOfLoadouts.slice(0, 10).map((loadout, index) => {
              const rank = index + 4;
              return (
                <motion.div
                  key={loadout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-green-900/20 to-stone-800/20 border border-green-700/30 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-green-400 font-medium">
                        #{rank} {loadout.skinName}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getStanceName(loadout.stance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">
                        {getSortValue(loadout)}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getSortLabel(sortBy)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Efficiency:</span>
                      <span className="text-green-400">
                        {formatRatio(loadout.damageEfficiency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Win Rate:</span>
                      <span className="text-stone-300">
                        {formatPercentage(loadout.winRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Avg Dealt:</span>
                      <span className="text-stone-300">
                        {formatDamage(loadout.averageDamageDealt)}
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
