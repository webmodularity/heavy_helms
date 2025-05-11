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
        icon={<Shield className="h-4 w-4" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatsCard
          title="Total Fighters"
          value={stats.totalFightersCount.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          description="All fighters in the game"
        />

        <StatsCard
          title="Players"
          value={stats.playerCount.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
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
          icon={<Skull className="h-4 w-4" />}
          description={`${stats.activeMonsterCount} active, ${stats.retiredMonsterCount} retired`}
        />
      </div>

      <div className="mt-4 bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md">
        <h3 className="text-base font-semibold text-yellow-500 mb-1.5">
          Fighter Breakdown
        </h3>

        <div className="w-full h-5 bg-stone-800 rounded-full overflow-hidden">
          {/* Player percentage */}
          <div
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center text-[10px] text-white"
            style={{
              width: `${(stats.playerCount / stats.totalFightersCount) * 100}%`,
            }}
          >
            {Math.round((stats.playerCount / stats.totalFightersCount) * 100)}%
          </div>
        </div>

        <div className="mt-1.5 flex justify-between text-[10px] text-stone-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full mr-1" />
            Players
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-stone-800 rounded-full mr-1" />
            Monsters
          </div>
        </div>
      </div>
    </section>
  );
}
