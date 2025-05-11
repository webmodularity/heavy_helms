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
        icon={<Swords className="h-4 w-4" />}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatsCard
          title="Total Wins"
          value={stats.totalWins.toLocaleString()}
          icon={<Award className="h-4 w-4" />}
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
          icon={<Skull className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-purple-950/20 border-purple-900/20"
          valueClassName="text-purple-400"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md">
          <h3 className="text-base font-semibold text-yellow-500 mb-2">
            Win/Loss Ratio
          </h3>

          <div className="w-full h-5 bg-stone-800 rounded-full overflow-hidden">
            {/* Win percentage */}
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-[10px] text-white"
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

          <div className="mt-1.5 flex justify-between text-[10px] text-stone-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-green-500 rounded-full mr-1" />
              Wins
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-stone-800 rounded-full mr-1" />
              Losses
            </div>
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md">
          <h3 className="text-base font-semibold text-yellow-500 mb-2">
            Kill Statistics
          </h3>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">
                {stats.totalKills.toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Total Kills</div>
            </div>

            <div className="w-px h-10 bg-stone-800" />

            <div className="text-center">
              <div className="text-xl font-bold text-yellow-500">
                {(stats.totalKills / (stats.totalWins || 1)).toFixed(2)}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Kills per Win</div>
            </div>

            <div className="w-px h-10 bg-stone-800" />

            <div className="text-center">
              <div className="text-xl font-bold text-red-400">
                {(
                  (stats.totalKills / (stats.totalWins + stats.totalLosses)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Kill Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
