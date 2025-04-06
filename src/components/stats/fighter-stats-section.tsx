"use client";

import { Users, Shield, Skull } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface FighterStats {
  playerCount: number;
  activePlayerCount: number;
  retiredPlayerCount: number;
  defaultPlayerCount: number;
  monsterCount: number;
  activeMonsterCount: number;
  retiredMonsterCount: number;
  totalFightersCount: number;
}

interface FighterStatsSectionProps {
  stats: FighterStats;
}

export function FighterStatsSection({ stats }: FighterStatsSectionProps) {
  return (
    <section>
      <SectionHeader
        title="Fighter Statistics"
        description="Overview of all fighters in Heavy Helms, including players and monsters."
        icon={<Shield className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Fighters"
          value={stats.totalFightersCount.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="All fighters in the game"
        />

        <StatsCard
          title="Players"
          value={stats.playerCount.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description={`${stats.activePlayerCount} active, ${stats.retiredPlayerCount} retired`}
        />

        <StatsCard
          title="Default Players"
          value={stats.defaultPlayerCount.toLocaleString()}
          description="System-generated players"
        />

        <StatsCard
          title="Monsters"
          value={stats.monsterCount.toLocaleString()}
          icon={<Skull className="h-5 w-5" />}
          description={`${stats.activeMonsterCount} active, ${stats.retiredMonsterCount} retired`}
        />
      </div>

      <div className="mt-6 bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
          Fighter Breakdown
        </h3>

        <div className="w-full h-6 bg-stone-800 rounded-full overflow-hidden">
          {/* Player percentage */}
          <div
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center text-xs text-white"
            style={{
              width: `${(stats.playerCount / stats.totalFightersCount) * 100}%`,
            }}
          >
            {Math.round((stats.playerCount / stats.totalFightersCount) * 100)}%
          </div>
        </div>

        <div className="mt-2 flex justify-between text-xs text-stone-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full mr-1" />
            Players
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-stone-800 rounded-full mr-1" />
            Monsters
          </div>
        </div>
      </div>
    </section>
  );
}
