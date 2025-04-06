"use client";

import { Swords, Award, Skull } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface CombatStats {
  totalWins: number;
  totalLosses: number;
  totalKills: number;
}

interface CombatStatsSectionProps {
  stats: CombatStats;
}

export function CombatStatsSection({ stats }: CombatStatsSectionProps) {
  return (
    <section>
      <SectionHeader
        title="Combat Statistics"
        description="Overview of combat outcomes across all fights."
        icon={<Swords className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Wins"
          value={stats.totalWins.toLocaleString()}
          icon={<Award className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-green-950/20 border-green-900/20"
          valueClassName="text-green-500"
        />

        <StatsCard
          title="Total Losses"
          value={stats.totalLosses.toLocaleString()}
          className="bg-gradient-to-br from-stone-900/80 to-red-950/20 border-red-900/20"
          valueClassName="text-red-500"
        />

        <StatsCard
          title="Total Kills"
          value={stats.totalKills.toLocaleString()}
          icon={<Skull className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-purple-950/20 border-purple-900/20"
          valueClassName="text-purple-400"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-yellow-500 mb-4">
            Win/Loss Ratio
          </h3>

          <div className="w-full h-6 bg-stone-800 rounded-full overflow-hidden">
            {/* Win percentage */}
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-xs text-white"
              style={{
                width: `${(stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100}%`,
              }}
            >
              {Math.round(
                (stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100,
              )}
              %
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs text-stone-400">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-500 rounded-full mr-1" />
              Wins
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-stone-800 rounded-full mr-1" />
              Losses
            </div>
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-yellow-500 mb-4">
            Kill Statistics
          </h3>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {stats.totalKills.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400 mt-1">Total Kills</div>
            </div>

            <div className="w-px h-12 bg-stone-800" />

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {(stats.totalKills / (stats.totalWins || 1)).toFixed(2)}
              </div>
              <div className="text-xs text-stone-400 mt-1">Kills per Win</div>
            </div>

            <div className="w-px h-12 bg-stone-800" />

            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {(
                  (stats.totalKills / (stats.totalWins + stats.totalLosses)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-xs text-stone-400 mt-1">Kill Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
