"use client";

import { Palette, Box } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface SkinStats {
  skinCollectionsCount: number;
  totalSkinsCount: number;
}

interface SkinStatsSectionProps {
  stats: SkinStats;
}

export function SkinStatsSection({ stats }: SkinStatsSectionProps) {
  return (
    <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6">
      <SectionHeader
        title="Skin Statistics"
        icon={<Palette className="h-6 w-6 text-purple-400" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatsCard
          title="Total Skins"
          value={stats.totalSkinsCount.toLocaleString()}
          icon={<Box className="h-5 w-5 text-purple-400" />}
          description="All skins available in the game"
          valueClassName="text-purple-400"
        />
        <StatsCard
          title="Skin Collections"
          value={stats.skinCollectionsCount.toLocaleString()}
          icon={<Palette className="h-5 w-5 text-indigo-400" />}
          description="Total number of skin collections"
          valueClassName="text-indigo-400"
        />
      </div>
    </div>
  );
}
