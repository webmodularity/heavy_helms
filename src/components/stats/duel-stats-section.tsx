"use client";

import { Swords, Timer, CheckCircle, XCircle } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface DuelStats {
  totalDuels: number;
  totalWagerDuels: number;
  totalNonWagerDuels: number;
  openChallenges: number;
  completedDuels: number;
  cancelledDuels: number;
  forfeitedDuels: number;
}

interface DuelStatsSectionProps {
  stats: DuelStats;
}

export function DuelStatsSection({ stats }: DuelStatsSectionProps) {
  console.log("stats", stats);
  const totalDuels = stats.totalNonWagerDuels + stats.totalWagerDuels;
  const wagerPercentage =
    totalDuels > 0 ? (stats.totalWagerDuels / totalDuels) * 100 : 0;

  const completionRate =
    stats.totalDuels > 0 ? (stats.completedDuels / stats.totalDuels) * 100 : 0;

  return (
    <section>
      <SectionHeader
        title="Duel Statistics"
        description="Overview of all duels in Heavy Helms."
        icon={<Swords className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Duels"
          value={stats.totalDuels.toLocaleString()}
          icon={<Swords className="h-5 w-5" />}
        />

        <StatsCard
          title="Open Challenges"
          value={stats.openChallenges.toLocaleString()}
          icon={<Timer className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-blue-950/20 border-blue-900/20"
          valueClassName="text-blue-400"
        />

        <StatsCard
          title="Completed Duels"
          value={stats.completedDuels.toLocaleString()}
          icon={<CheckCircle className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-green-950/20 border-green-900/20"
          valueClassName="text-green-500"
        />

        <StatsCard
          title="Cancelled/Forfeited"
          value={(stats.cancelledDuels + stats.forfeitedDuels).toLocaleString()}
          icon={<XCircle className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-red-950/20 border-red-900/20"
          valueClassName="text-red-500"
          description={`${stats.cancelledDuels} cancelled, ${stats.forfeitedDuels} forfeited`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            Wager vs. Non-Wager Duels
          </h3>

          <div className="mt-4 flex items-center">
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs text-stone-400">
                <span>
                  Wager Duels: {stats.totalWagerDuels.toLocaleString()}
                </span>
                <span>{Math.round(wagerPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500"
                  style={{ width: `${wagerPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs text-stone-400">
                <span>
                  Non-Wager Duels: {stats.totalNonWagerDuels.toLocaleString()}
                </span>
                <span>{Math.round(100 - wagerPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
                  style={{ width: `${100 - wagerPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            Duel Completion Rate
          </h3>

          <div className="mt-2 text-center">
            <div className="text-4xl font-bold text-green-500">
              {Math.round(completionRate)}%
            </div>
            <div className="text-xs text-stone-400 mt-1">
              of duels completed successfully
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-medium text-green-500">
                {stats.completedDuels.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400">Completed</div>
            </div>
            <div>
              <div className="text-sm font-medium text-red-500">
                {stats.cancelledDuels.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400">Cancelled</div>
            </div>
            <div>
              <div className="text-sm font-medium text-orange-500">
                {stats.forfeitedDuels.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400">Forfeited</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
