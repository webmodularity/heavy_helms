"use client";

import { Users, Shield, Skull } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface FighterStats {
  uniqueOwnersCount: number; // Players (unique wallets)
  playerCount: number; // Fighters (characters)
  activePlayerCount: number;
  retiredPlayerCount: number;
  defaultPlayerCount: number;
}

interface FighterStatsSectionProps {
  stats: FighterStats;
}

export function FighterStatsSection({ stats }: FighterStatsSectionProps) {
  return (
    <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6">
      <SectionHeader
        title="Fighter & Player Stats"
        icon={<Users className="h-6 w-6 text-yellow-500" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatsCard
          title="Players"
          value={stats.uniqueOwnersCount}
          icon={<Users className="h-5 w-5 text-blue-400" />}
          description="Unique wallets that own at least one fighter"
          valueClassName="text-blue-400"
        />
        <StatsCard
          title="Fighters"
          value={stats.playerCount}
          icon={<Users className="h-5 w-5 text-yellow-400" />}
          description="All fighters created by players"
          valueClassName="text-yellow-400"
        />
        <StatsCard
          title="Retired"
          value={stats.retiredPlayerCount}
          icon={<Shield className="h-5 w-5 text-stone-400" />}
          description="Fighters that have been retired"
          valueClassName="text-stone-400"
        />
        <StatsCard
          title="Game-Controlled"
          value={stats.defaultPlayerCount}
          icon={<Skull className="h-5 w-5 text-purple-400" />}
          description="Practice and fill-in fighters controlled by the game"
          valueClassName="text-purple-400"
        />
      </div>
    </div>
  );
}
