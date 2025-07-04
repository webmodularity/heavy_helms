"use client";

import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import {
  usePlayerSkinPerformance,
  type PlayerSkinPerformance,
} from "@/hooks/use-player-skin-performance";
import { useSkinMetadata } from "@/hooks/use-skin-metadata";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import { formatDistance } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SkinPerformanceProps {
  playerId: string;
}

interface SkinPerformanceCardProps {
  performance: PlayerSkinPerformance;
}

function SkinPerformanceCard({ performance }: SkinPerformanceCardProps) {
  const router = useRouter();
  const { data: skinMetadata } = useSkinMetadata(performance.skin.metadataURI);
  const winRate = (
    Number.parseFloat(performance.winRate.toString()) * 100
  ).toFixed(1);
  const lastUsed = formatDistance(
    new Date(Number.parseInt(performance.lastCombat) * 1000),
    new Date(),
    { addSuffix: true },
  ).replace(/^about\s+/, "");

  const skinName = `${getWeaponDisplayName(performance.skin.weapon)} + ${getArmorDisplayName(performance.skin.armor)}`;

  const handleClick = () => {
    router.push(
      `/skin/${performance.skinCollectionId}/${performance.skinTokenId}`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-800/30 rounded-lg border border-yellow-600/10 p-4 hover:border-yellow-600/30 transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Skin Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-700/50 flex-shrink-0">
          <Image
            src={skinMetadata?.imageUrl || "/parchment_bkg6.jpg"}
            alt={skinName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/parchment_bkg6.jpg";
            }}
          />
        </div>

        {/* Skin Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-stone-200 truncate group-hover:text-yellow-400 transition-colors mb-1">
            {getWeaponDisplayName(performance.skin.weapon)} +{" "}
            {getArmorDisplayName(performance.skin.armor)}
          </div>

          <div className="text-sm text-stone-300 mb-2">
            {getStanceDisplayName(performance.stance)}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="text-stone-400">
              <span className="text-green-400">{performance.wins}</span>
              <span className="text-stone-500">‑</span>
              <span className="text-red-400">{performance.losses}</span>
              <span className="text-stone-500">‑</span>
              <span className="text-stone-200">{performance.kills}</span>
              <span className="mx-1">•</span>
              <span className="text-yellow-400">{winRate}%</span>
            </div>
            <div className="text-stone-500 ml-4 flex-shrink-0">{lastUsed}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkinPerformance({ playerId }: SkinPerformanceProps) {
  const {
    data: performances,
    isLoading,
    error,
  } = usePlayerSkinPerformance(playerId);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pb-6"
      >
        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          Skin Performance
        </h3>
        <div className="space-y-3">
          {["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
            <div
              key={key}
              className="bg-stone-800/30 rounded-lg border border-yellow-600/10 p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-stone-700/50 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-stone-700/50 rounded mb-2 w-1/3" />
                  <div className="h-3 bg-stone-700/50 rounded mb-2 w-1/2" />
                  <div className="h-3 bg-stone-700/50 rounded w-2/3" />
                </div>
                <div className="w-16">
                  <div className="h-3 bg-stone-700/50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pb-6"
      >
        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          Skin Performance
        </h3>
        <div className="text-center text-red-400 py-8">
          Failed to load skin performance data
        </div>
      </motion.div>
    );
  }

  if (!performances || performances.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pb-6"
      >
        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          Skin Performance
        </h3>
        <div className="text-center text-stone-400 py-8">
          No combat data found for this warrior
        </div>
      </motion.div>
    );
  }

  // Sort by total combats descending, then by win rate
  const sortedPerformances = [...performances].sort((a, b) => {
    if (a.totalCombats !== b.totalCombats) {
      return b.totalCombats - a.totalCombats;
    }
    return b.winRate - a.winRate;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="pb-6"
    >
      <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
        <Palette className="mr-2 h-5 w-5" />
        Skin Performance
        <span className="text-sm text-stone-400 ml-2">
          ({performances.length} loadout{performances.length !== 1 ? "s" : ""})
        </span>
      </h3>

      <div className="space-y-3">
        {sortedPerformances.map((performance) => (
          <SkinPerformanceCard key={performance.id} performance={performance} />
        ))}
      </div>
    </motion.div>
  );
}
