"use client";

import { Trophy, Users, Timer } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface GauntletStats {
  totalGauntletsStarted: number;
  totalGauntletsCompleted: number;
  totalGauntletsRecovered: number;
  totalGauntletPrizeMoneyAwarded: bigint | number | string;
  totalGauntletFeesCollected: bigint | number | string;
  currentGauntletQueueSize: number;
  currentGauntletEntryFee: bigint | number | string;
  currentGauntletSize: number;
  currentGauntletFeePercentage: number;
  currentMinTimeBetweenGauntlets: number;
}

interface GauntletStatsSectionProps {
  stats: GauntletStats;
}

export function GauntletStatsSection({ stats }: GauntletStatsSectionProps) {
  return (
    <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6">
      <SectionHeader
        title="Gauntlet Statistics"
        icon={<Trophy className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatsCard
          title="Completed"
          value={stats.totalGauntletsCompleted}
          icon={<Trophy className="h-5 w-5" />}
          description="Total number of gauntlets completed"
        />

        <StatsCard
          title="Queue"
          value={stats.currentGauntletQueueSize}
          icon={<Users className="h-5 w-5" />}
          description="Players waiting for next gauntlet"
        />

        <StatsCard
          title="Size"
          value={stats.currentGauntletSize}
          icon={<Users className="h-5 w-5" />}
          description="Number of players per gauntlet"
        />

        <StatsCard
          title="Min Time"
          value={`${stats.currentMinTimeBetweenGauntlets / 60} min`}
          icon={<Timer className="h-5 w-5" />}
          description="Minimum time between gauntlets"
        />
      </div>
    </div>
  );
}
