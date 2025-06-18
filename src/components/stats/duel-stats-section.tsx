"use client";

import { Sword, Timer, AlertTriangle } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface DuelStats {
  totalDuels: number;
  completedDuels: number;
  cancelledDuels: number;
  forfeitedDuels: number;
  openChallenges: number;
}

interface DuelStatsSectionProps {
  stats: DuelStats;
}

export function DuelStatsSection({ stats }: DuelStatsSectionProps) {
  // Calculate completion rate
  const completionRate =
    stats.totalDuels > 0
      ? Math.round((stats.completedDuels / stats.totalDuels) * 100)
      : 0;

  return (
    <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6">
      <SectionHeader
        title="Duel Statistics"
        icon={<Sword className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatsCard
          title="Completed"
          value={stats.completedDuels}
          icon={<Sword className="h-5 w-5" />}
          description="Total number of completed duels"
        />

        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<Timer className="h-5 w-5" />}
          description="Percentage of duels that complete"
        />

        <StatsCard
          title="Open"
          value={stats.openChallenges}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Currently open duel challenges"
        />

        <StatsCard
          title="Cancelled/Forfeited"
          value={stats.cancelledDuels + stats.forfeitedDuels}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Total cancelled and forfeited duels"
        />
      </div>
    </div>
  );
}
