"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Crown, Award, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBestSurvivalRate } from "@/hooks/use-skin-analytics";

// Types for tank loadouts
interface TankLoadoutEntry {
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
  deaths: number;
  survivalRate: number;
  deathRate: number;
  averageDamageTaken: number;
  minDamageTaken: number;
  damageEfficiency: number;
  skinName?: string;
}

type TankSortBy =
  | "survivalRate"
  | "averageDamageTaken"
  | "damageEfficiency"
  | "minDamageTaken";

const SORT_OPTIONS = [
  { value: "survivalRate" as const, label: "Survival Rate" },
  { value: "averageDamageTaken" as const, label: "Avg Damage Taken" },
  { value: "damageEfficiency" as const, label: "Damage Efficiency" },
  { value: "minDamageTaken" as const, label: "Best Defense" },
];

// Helper functions
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDamage(value: number): string {
  return Math.round(value).toString();
}

function getStanceName(stance: number): string {
  const names = ["🛡️ Defensive", "⚖️ Balanced", "⚔️ Offensive"];
  return names[stance] || "Unknown";
}

function getStanceIcon(stance: number): string {
  const icons = ["🛡️", "⚖️", "⚔️"];
  return icons[stance] || "❓";
}

export function TankLoadoutsLeaderboard() {
  const [sortBy, setSortBy] = useState<TankSortBy>("survivalRate");
  const { tankLoadouts, loading: isLoading, error } = useBestSurvivalRate(10);

  // Process and sort the leaderboard data
  const processedLeaderboard = useMemo(() => {
    if (!tankLoadouts || tankLoadouts.length === 0) return [];

    return tankLoadouts.map((loadout: any) => ({
      ...loadout,
      skinName: `Skin #${loadout.skinCollectionId.slice(-6)}-${loadout.skinTokenId}`,
    }));
  }, [tankLoadouts]);

  const finalSortedLeaderboard = useMemo(() => {
    return [...processedLeaderboard].sort((a, b) => {
      switch (sortBy) {
        case "survivalRate":
          return b.survivalRate - a.survivalRate;
        case "averageDamageTaken":
          return a.averageDamageTaken - b.averageDamageTaken; // Lower is better
        case "damageEfficiency":
          return b.damageEfficiency - a.damageEfficiency;
        case "minDamageTaken":
          return a.minDamageTaken - b.minDamageTaken; // Lower is better
        default:
          return b.survivalRate - a.survivalRate;
      }
    });
  }, [processedLeaderboard, sortBy]);

  // Get sort value for display
  const getSortValue = (loadout: TankLoadoutEntry): string => {
    switch (sortBy) {
      case "survivalRate":
        return formatPercentage(loadout.survivalRate);
      case "averageDamageTaken":
        return formatDamage(loadout.averageDamageTaken);
      case "damageEfficiency":
        return loadout.damageEfficiency.toFixed(2);
      case "minDamageTaken":
        return formatDamage(loadout.minDamageTaken);
      default:
        return formatPercentage(loadout.survivalRate);
    }
  };

  const getSortLabel = (sort: TankSortBy): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option?.label || "Survival Rate";
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
            <Skeleton key={`tank-skeleton-${i}`} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-12 w-12 text-blue-500 mb-4" />
        <p className="text-lg font-semibold text-stone-400">
          Failed to load tank loadouts
        </p>
      </div>
    );
  }

  if (!finalSortedLeaderboard.length) {
    return (
      <div className="bg-stone-900 border border-blue-600/20 rounded-lg overflow-hidden h-full">
        <div className="p-4 bg-gradient-to-r from-blue-900/50 to-stone-900 border-b border-blue-600/20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-blue-400">
                Tankiest Loadouts
              </h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="h-12 w-12 text-stone-500 mb-4" />
          <p className="text-lg font-semibold text-stone-400">
            No tank data available
          </p>
        </div>
      </div>
    );
  }

  const topThree = finalSortedLeaderboard.slice(0, 3);
  const restOfLoadouts = finalSortedLeaderboard.slice(3);

  return (
    <div className="bg-stone-900 border border-blue-600/20 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-900/50 to-stone-900 border-b border-blue-600/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <Shield className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-blue-400">
                Tankiest Loadouts
              </h2>
            </div>
            <p className="text-sm text-stone-400">
              Hardest skin + stance combinations to kill
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TankSortBy)}
              className="bg-stone-800 border border-blue-600/20 rounded px-3 py-1 text-sm text-stone-200 focus:outline-none focus:border-blue-500"
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
                className="relative p-4 bg-gradient-to-br from-blue-900/30 to-stone-800/30 border border-blue-700/50 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex flex-col min-h-[200px]"
              >
                {renderRankBadge(rank)}

                <div className="text-center flex-grow">
                  <div className="text-lg font-semibold text-stone-200 mb-1">
                    #{rank}
                  </div>
                  <div className="text-sm font-medium text-blue-400 mb-1">
                    {loadout.skinName}
                  </div>
                  <div className="text-xs text-stone-400 mb-3">
                    {getStanceName(loadout.stance)}
                  </div>

                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {getSortValue(loadout)}
                  </div>

                  <div className="space-y-1 text-xs text-stone-400">
                    <div className="flex justify-between">
                      <span>Survival:</span>
                      <span className="text-blue-400 font-medium">
                        {formatPercentage(loadout.survivalRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Damage:</span>
                      <span className="text-blue-400 font-medium">
                        {formatDamage(loadout.averageDamageTaken)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Defense:</span>
                      <span className="text-blue-400 font-medium">
                        {formatDamage(loadout.minDamageTaken)}
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

        {/* Rest of the leaderboard - simplified for now */}
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
                  className="bg-gradient-to-r from-blue-900/20 to-stone-800/20 border border-blue-700/30 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-blue-400 font-medium">
                        #{rank} {loadout.skinName}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getStanceName(loadout.stance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold">
                        {getSortValue(loadout)}
                      </div>
                      <div className="text-xs text-stone-400">
                        {getSortLabel(sortBy)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Survival:</span>
                      <span className="text-blue-400">
                        {formatPercentage(loadout.survivalRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Deaths:</span>
                      <span className="text-stone-300">{loadout.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Avg Damage:</span>
                      <span className="text-stone-300">
                        {formatDamage(loadout.averageDamageTaken)}
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
