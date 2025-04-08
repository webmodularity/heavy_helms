"use client";

import { Palette, CheckSquare, Box } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface SkinStats {
  skinCollectionsCount: number;
  verifiedSkinCollectionsCount: number;
  totalSkinsCount: number;
}

interface SkinStatsSectionProps {
  stats: SkinStats;
}

export function SkinStatsSection({ stats }: SkinStatsSectionProps) {
  const verifiedPercentage =
    stats.skinCollectionsCount > 0
      ? (stats.verifiedSkinCollectionsCount / stats.skinCollectionsCount) * 100
      : 0;

  return (
    <section>
      <SectionHeader
        title="Skin Statistics"
        description="Overview of all skins and skin collections in Heavy Helms."
        icon={<Palette className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Skins"
          value={stats.totalSkinsCount.toLocaleString()}
          icon={<Box className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-purple-950/20 border-purple-900/20"
          valueClassName="text-purple-400"
        />

        <StatsCard
          title="Skin Collections"
          value={stats.skinCollectionsCount.toLocaleString()}
          icon={<Palette className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-indigo-950/20 border-indigo-900/20"
          valueClassName="text-indigo-400"
        />

        <StatsCard
          title="Verified Collections"
          value={stats.verifiedSkinCollectionsCount.toLocaleString()}
          icon={<CheckSquare className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-green-950/20 border-green-900/20"
          valueClassName="text-green-500"
          description={`${Math.round(verifiedPercentage)}% of all collections`}
        />
      </div>

      <div className="mt-6 bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-500 mb-4">
          Skin Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-stone-300 mb-3">
              Collection Verification Status
            </h4>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-500">
                    Verified
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold inline-block text-stone-500">
                    {Math.round(verifiedPercentage)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-stone-800">
                <div
                  style={{ width: `${verifiedPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-600 to-green-500"
                />
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>
                  Verified:{" "}
                  {stats.verifiedSkinCollectionsCount.toLocaleString()}
                </span>
                <span>
                  Unverified:{" "}
                  {(
                    stats.skinCollectionsCount -
                    stats.verifiedSkinCollectionsCount
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-stone-300 mb-3">
              Skins per Collection
            </h4>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-purple-400">
                {stats.skinCollectionsCount > 0
                  ? Math.round(
                      stats.totalSkinsCount / stats.skinCollectionsCount,
                    ).toLocaleString()
                  : "0"}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Average skins per collection
              </div>
            </div>
            <div className="flex justify-between text-xs text-stone-500 mt-2">
              <span>Total Skins: {stats.totalSkinsCount.toLocaleString()}</span>
              <span>
                Total Collections: {stats.skinCollectionsCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
