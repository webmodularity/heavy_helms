"use client";

import { Sword, Skull, Target } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface CombatStats {
  totalWins: number;
  totalLosses: number;
  totalKills: number;
  totalDuels: number;
  completedDuels: number;
  totalGauntletsCompleted: number;
  currentGauntletSize: number;
}

interface CombatStatsSectionProps {
  stats: CombatStats;
}

export function CombatStatsSection({ stats }: CombatStatsSectionProps) {
  // Calculate total fights (duels + gauntlet matches)
  const totalDuels = stats.completedDuels;
  const totalGauntletMatches =
    stats.totalGauntletsCompleted * (stats.currentGauntletSize - 1);
  const totalFights = totalDuels + totalGauntletMatches;

  return (
    <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6">
      <SectionHeader
        title="Combat Statistics"
        icon={<Sword className="h-6 w-6 text-red-500" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatsCard
          title="Total Fights"
          value={totalFights}
          icon={<Target className="h-5 w-5 text-yellow-400" />}
          description="Total number of completed fights"
          valueClassName="text-yellow-400"
        />
        <StatsCard
          title="Kills"
          value={stats.totalKills}
          icon={<Skull className="h-5 w-5 text-purple-400" />}
          description="Total number of kills"
          valueClassName="text-purple-400"
        />
        <StatsCard
          title="Duels"
          value={totalDuels}
          icon={<Sword className="h-5 w-5 text-blue-400" />}
          description="Total number of completed duels"
          valueClassName="text-blue-400"
        />
        <StatsCard
          title="Gauntlet Matches"
          value={totalGauntletMatches}
          icon={<Sword className="h-5 w-5 text-green-400" />}
          description="Total number of matches in gauntlets"
          valueClassName="text-green-400"
        />
      </div>
    </div>
  );
}
