import { Suspense } from "react";
import { fetchGameStats } from "@/lib/stats-api";
import { StatsPageSkeleton } from "@/components/stats/stats-page-skeleton";
import { FighterStatsSection } from "@/components/stats/fighter-stats-section";
import { CombatStatsSection } from "@/components/stats/combat-stats-section";
import { GauntletStatsSection } from "@/components/stats/gauntlet-stats-section";
import { DuelStatsSection } from "@/components/stats/duel-stats-section";
import { SkinStatsSection } from "@/components/stats/skin-stats-section";
import StatsMenuBar from "@/components/stats/stats-menu-bar";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every minute

async function StatsPage() {
  const stats = await fetchGameStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header styled like battle archives/leaderboards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500">
            Game Statistics
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            The numbers behind the battles, gauntlets, and glory of Heavy Helms
          </p>
        </div>
      </div>
      {/* Black menu bar for section navigation */}
      <StatsMenuBar />
      <div id="fighters-section" className="scroll-mt-28">
        <FighterStatsSection stats={stats} />
      </div>
      <div id="combat-section" className="scroll-mt-28">
        <CombatStatsSection stats={stats} />
      </div>
      <div id="gauntlet-section" className="scroll-mt-28">
        <GauntletStatsSection stats={stats} />
      </div>
      <div id="duel-section" className="scroll-mt-28">
        <DuelStatsSection stats={stats} />
      </div>
      <div id="skins-section" className="scroll-mt-28">
        <SkinStatsSection stats={stats} />
      </div>
    </div>
  );
}

export default function StatsPageWrapper() {
  return (
    <Suspense fallback={<StatsPageSkeleton />}>
      <StatsPage />
    </Suspense>
  );
}
