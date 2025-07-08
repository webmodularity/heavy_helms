"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  BadgeCheck,
  ChevronDown,
  Shield,
  Swords,
  Flame,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSkinCombatAnalytics } from "@/hooks/use-skin-analytics";
import { createPlayerSkin } from "@/lib/player-api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Skin } from "@/types/skin.types";

// Sort options for skin leaderboards - matching warrior leaderboard pattern
type SkinSortBy =
  | "winRate"
  | "totalCombats"
  | "wins"
  | "losses"
  | "kills"
  | "averageDamage"
  | "averageDamageTaken";

const SORT_OPTIONS: Array<{
  value: SkinSortBy;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: "winRate",
    label: "Win Rate",
    icon: <Trophy className="h-4 w-4" />,
    description: "Highest win percentage",
  },
  {
    value: "totalCombats",
    label: "Total Fights",
    icon: <Swords className="h-4 w-4" />,
    description: "Most battles fought",
  },
  {
    value: "wins",
    label: "Total Wins",
    icon: <Crown className="h-4 w-4" />,
    description: "Most victories achieved",
  },
  {
    value: "losses",
    label: "Total Losses",
    icon: <Shield className="h-4 w-4" />,
    description: "Most defeats taken",
  },
  {
    value: "kills",
    label: "Total Kills",
    icon: <Swords className="h-4 w-4" />,
    description: "Most kills achieved",
  },
  {
    value: "averageDamage",
    label: "Avg Damage",
    icon: <Flame className="h-4 w-4" />,
    description: "Highest average damage per fight",
  },
  {
    value: "averageDamageTaken",
    label: "Avg Damage Taken",
    icon: <Shield className="h-4 w-4" />,
    description: "Lowest average damage taken (best defense)",
  },
];

// Stance icons matching your existing system
const STANCE_ICONS = {
  0: <Shield className="h-3 w-3" />, // Defensive
  1: <Swords className="h-3 w-3" />, // Balanced
  2: <Flame className="h-3 w-3" />, // Offensive
} as const;

// Stance names mapping
const STANCE_NAMES = {
  0: "DEFENSIVE",
  1: "BALANCED",
  2: "OFFENSIVE",
} as const;

// Helper function to get stance name from stanceBreakdown
const getStanceName = (
  stanceBreakdown: Record<number, { fights: number; wins: number }>,
): string => {
  const stanceKey = Number.parseInt(Object.keys(stanceBreakdown)[0]);
  return STANCE_NAMES[stanceKey as keyof typeof STANCE_NAMES] || "UNKNOWN";
};

// Helper to format win rate as percentage
function formatWinRate(winRate: number): string {
  return `${(winRate * 100).toFixed(1)}%`;
}

// Skin data interface
interface SkinLeaderboardEntry {
  skinId: string;
  skinCollectionId: string;
  skinTokenId: number;
  wins: number;
  losses: number;
  kills?: number; // Optional until new analytics data is available
  totalDamage: number;
  totalCombats: number;
  winRate: number;
  averageDamage: number;
  averageDamageTaken?: number; // Optional until new analytics data is available
  stanceBreakdown: Record<number, { fights: number; wins: number }>;
  metadataURI?: string;
  weapon?: number;
  armor?: number;
}

interface EnhancedSkinEntry extends SkinLeaderboardEntry {
  imageURL: string;
  skinName: string;
}

// Skin card component for mobile - matching warrior leaderboard pattern
const SkinCard = ({
  skin,
  rank,
}: {
  skin: EnhancedSkinEntry;
  rank: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: (rank - 4) * 0.05 }}
    className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4 cursor-pointer hover:bg-stone-700/30 transition-colors"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold text-stone-400 min-w-[2rem]">
          #{rank}
        </div>
        <div className="flex items-center gap-3">
          {skin.imageURL ? (
            <Image
              src={skin.imageURL}
              alt={`Skin ${skin.skinCollectionId}-${skin.skinTokenId}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg border border-stone-600 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-stone-700 border border-stone-600 flex items-center justify-center text-lg">
              🎨
            </div>
          )}
          <div>
            <div className="font-medium text-stone-200 hover:text-yellow-400 transition-colors">
              {getStanceName(skin.stanceBreakdown)}
            </div>
            <div className="text-xs text-stone-500">
              {skin.totalCombats} fights
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-yellow-400 font-bold">
          {formatWinRate(skin.winRate)}
        </div>
        <div className="text-xs text-stone-400">Win Rate</div>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <span className="text-green-500">
          <span className="text-stone-400">W:</span> {skin.wins}
        </span>
        <span className="text-red-500">
          <span className="text-stone-400">L:</span> {skin.losses}
        </span>
        <span className="text-blue-400">
          <span className="text-stone-400">Fights:</span> {skin.totalCombats}
        </span>
        <span className="text-orange-400">
          <span className="text-stone-400">Dmg:</span>{" "}
          {Math.round(skin.averageDamage)}
        </span>
      </div>
    </div>
  </motion.div>
);

interface SkinLeaderboardProps {
  sortBy?: string;
}

export function SkinLeaderboard({
  sortBy: urlSortBy = "winRate",
}: SkinLeaderboardProps) {
  const router = useRouter();
  const sortBy = urlSortBy as SkinSortBy;
  const [processedLeaderboard, setProcessedLeaderboard] = useState<
    EnhancedSkinEntry[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use refs to avoid dependency issues
  const lastProcessedDataRef = useRef<string>("");
  const isProcessingRef = useRef<boolean>(false);

  const {
    skinAnalytics,
    loading: isLoading,
    error,
  } = useSkinCombatAnalytics(5); // Lower minimum to 5 combats

  // Process leaderboard data with skin images
  useEffect(() => {
    const processLeaderboard = async () => {
      // If no data, clear processed leaderboard
      if (!skinAnalytics || skinAnalytics.length === 0) {
        setProcessedLeaderboard((prev) => (prev.length > 0 ? [] : prev));
        lastProcessedDataRef.current = "";
        return;
      }

      // Create a hash of current data to check if we need to reprocess
      const currentDataHash = JSON.stringify(
        skinAnalytics.map((a: unknown) => {
          const analytics = a as {
            id: string;
            wins: number;
            losses: number;
            totalCombats: number;
          };
          return `${analytics.id}-${analytics.wins}-${analytics.losses}-${analytics.totalCombats}`;
        }),
      );

      // If data hasn't changed, don't reprocess
      if (lastProcessedDataRef.current === currentDataHash) {
        return;
      }

      // If already processing, don't start another process
      if (isProcessingRef.current) {
        return;
      }

      isProcessingRef.current = true;
      setIsProcessing(true);
      const processedData: EnhancedSkinEntry[] = [];

      try {
        for (const analytics of skinAnalytics) {
          try {
            // Type assertion for analytics data
            const a = analytics as {
              id: string;
              skinCollectionId: string;
              skinTokenId: number;
              stance: number;
              totalCombats: number;
              wins: number;
              losses: number;
              kills?: number;
              averageDamageDealt: number;
              averageDamageTaken: number;
              winRate: number;
              skin?: {
                id: string;
                metadataURI: string;
                weapon: number;
                armor: number;
              };
            };

            let skinData: Skin | null = null;

            // Only create skin if we have metadataURI
            if (a.skin?.metadataURI) {
              skinData = await createPlayerSkin({
                collection: {
                  id: a.skinCollectionId,
                  contractAddress: a.skinCollectionId,
                  isVerified: true,
                  skinType: 0,
                  requiredNFTAddress: null,
                },
                tokenId: a.skinTokenId,
                metadataURI: a.skin.metadataURI,
                weapon: a.skin.weapon || 0,
                armor: a.skin.armor || 0,
              });
            }

            // Convert analytics data to skin leaderboard format
            processedData.push({
              skinId: a.id,
              skinCollectionId: a.skinCollectionId,
              skinTokenId: a.skinTokenId,
              wins: a.wins,
              losses: a.losses,
              kills: a.kills,
              totalDamage: a.averageDamageDealt * a.totalCombats,
              totalCombats: a.totalCombats,
              winRate: a.winRate,
              averageDamage: a.averageDamageDealt,
              averageDamageTaken: a.averageDamageTaken,
              stanceBreakdown: {
                [a.stance]: { fights: a.totalCombats, wins: a.wins },
              },
              metadataURI: a.skin?.metadataURI,
              weapon: a.skin?.weapon,
              armor: a.skin?.armor,
              imageURL: skinData?.imageURL || "/images/default-skin.png",
              skinName: `Skin #${a.skinTokenId}`,
            });
          } catch (error) {
            console.error("Error processing analytics:", error);
          }
        }

        setProcessedLeaderboard(processedData);
        lastProcessedDataRef.current = currentDataHash;
      } catch (error) {
        console.error("Error processing leaderboard:", error);
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    };

    processLeaderboard();
  }, [skinAnalytics]); // Only depend on skinAnalytics

  const finalSortedLeaderboard = useMemo(() => {
    return [...processedLeaderboard].sort((a, b) => {
      switch (sortBy) {
        case "winRate":
          return b.winRate - a.winRate;
        case "totalCombats":
          return b.totalCombats - a.totalCombats;
        case "wins":
          return b.wins - a.wins;
        case "losses":
          return b.losses - a.losses;
        case "kills":
          return (b.kills || 0) - (a.kills || 0);
        case "averageDamage":
          return b.averageDamage - a.averageDamage;
        case "averageDamageTaken":
          return (a.averageDamageTaken || 0) - (b.averageDamageTaken || 0); // Lower is better for damage taken
        default:
          return b.winRate - a.winRate;
      }
    });
  }, [processedLeaderboard, sortBy]);

  // Get sort value for display
  const getSortValue = (skin: EnhancedSkinEntry): string => {
    switch (sortBy) {
      case "winRate":
        return formatWinRate(skin.winRate);
      case "totalCombats":
        return skin.totalCombats.toString();
      case "wins":
        return skin.wins.toString();
      case "losses":
        return skin.losses.toString();
      case "kills":
        return (skin.kills || 0).toString();
      case "averageDamage":
        return Math.round(skin.averageDamage).toString();
      case "averageDamageTaken":
        return Math.round(skin.averageDamageTaken || 0).toString();
      default:
        return formatWinRate(skin.winRate);
    }
  };

  const getSortLabel = (sort: SkinSortBy): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option?.label || "Win Rate";
  };

  const getCurrentSortOption = () => {
    return (
      SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0]
    );
  };

  const handleSkinClick = (skin: EnhancedSkinEntry) => {
    router.push(`/skin/${skin.skinCollectionId}/${skin.skinTokenId}`);
  };

  // Loading skeletons - exact copy from warrior leaderboard
  const renderLoadingSkeletons = () => {
    const skeletonKeys = Array.from({ length: 10 }, (_, i) => `skeleton-${i}`);
    const mobileSkeletonKeys = Array.from(
      { length: 10 },
      (_, i) => `mobile-skeleton-${i}`,
    );
    const headerSkeletonKeys = Array.from(
      { length: 6 },
      (_, i) => `header-skeleton-${i}`,
    );

    return (
      <div className="p-3 md:p-4">
        {/* Top 3 skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((rank) => (
            <div
              key={`top-skeleton-${rank}`}
              className="relative p-4 bg-stone-800/30 border border-stone-700/50 rounded-lg shadow-lg flex flex-col min-h-[180px]"
            >
              <div className="text-center flex-grow">
                <Skeleton className="h-6 w-24 mx-auto mb-1" />
                <Skeleton className="h-5 w-32 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto mb-3" />
                <Skeleton className="h-6 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="hidden md:block">
          <div className="border border-yellow-900/20 rounded-lg overflow-hidden">
            <div className="bg-amber-950/30 p-3">
              <div className="grid grid-cols-6 gap-4">
                {headerSkeletonKeys.map((key) => (
                  <Skeleton key={key} className="h-4" />
                ))}
              </div>
            </div>
            <div className="space-y-2 p-2">
              {skeletonKeys.map((key) => (
                <div key={key} className="grid grid-cols-6 gap-4 p-2">
                  {headerSkeletonKeys.map((headerKey) => (
                    <Skeleton key={`${key}-${headerKey}`} className="h-4" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {mobileSkeletonKeys.map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  };

  // Error state - exact copy from warrior leaderboard
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-500 mb-4">
        <Trophy className="h-12 w-12 mx-auto mb-2" />
        <p className="text-lg font-semibold">Failed to load skin leaderboard</p>
      </div>
      <p className="text-stone-400 mb-4">
        {error?.message || "An error occurred while fetching the data."}
      </p>
    </div>
  );

  if (isLoading || isProcessing) return renderLoadingSkeletons();
  if (error) return renderErrorState();
  if (!finalSortedLeaderboard.length) {
    return (
      <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
        <div className="p-3 md:p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-xl font-bold text-yellow-400">
                Skin Performance
              </h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-12 w-12 text-stone-500 mb-4" />
          <p className="text-lg font-semibold text-stone-400">
            No skin data available
          </p>
          <p className="text-stone-500">
            Combat results are still being processed.
          </p>
        </div>
      </div>
    );
  }

  const topThree = finalSortedLeaderboard.slice(0, 3);
  const restOfSkins = finalSortedLeaderboard.slice(3);

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      {/* Simple header like before */}
      <div className="p-3 md:p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold text-yellow-400">
              Skin Performance
            </h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
              >
                {getCurrentSortOption().icon}
                <span className="ml-2">{getCurrentSortOption().label}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-56 bg-stone-900 border-yellow-600/20 text-stone-200"
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    router.push(`/leaderboards/skins/${option.value}`)
                  }
                  className={`flex items-center gap-2 hover:bg-yellow-500/20 hover:text-yellow-300 focus:bg-yellow-500/20 focus:text-yellow-300 ${
                    sortBy === option.value
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "text-stone-300"
                  }`}
                >
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-stone-500">
                      {option.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Regular leaderboard content */}
      <div className="p-3 md:p-4">
        <div className="relative">
          {/* Top 3 skins showcase - exact copy of warrior leaderboard structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Runner-up - Order 2 on mobile, 1 on desktop */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleSkinClick(topThree[1])}
                className="relative p-4 bg-gradient-to-b from-slate-800/30 to-stone-900 border border-slate-400/30 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-2 md:order-1 hover:bg-slate-700/30 transition-colors"
              >
                <div className="text-center flex-grow">
                  <div className="text-xl font-bold mb-1 text-slate-300">
                    Runner-up
                  </div>
                  <div className="flex items-start justify-center gap-2 mb-1">
                    {topThree[1].imageURL ? (
                      <Image
                        src={topThree[1].imageURL}
                        alt={`Skin ${topThree[1].skinCollectionId}-${topThree[1].skinTokenId}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg border-2 border-slate-400 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-stone-700 border-2 border-slate-400 flex items-center justify-center text-xl">
                        🎨
                      </div>
                    )}
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors text-center">
                      <div>{getStanceName(topThree[1].stanceBreakdown)}</div>
                      <div className="text-xs font-normal mt-1">
                        <div className="text-orange-400">
                          Avg: {Math.round(topThree[1].averageDamage)} dmg
                        </div>
                        <div className="text-cyan-400">
                          Taken:{" "}
                          {Math.round(topThree[1].averageDamageTaken || 0)} dmg
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 font-bold text-slate-400">
                    <BadgeCheck className="h-4 w-4" />
                    <span>
                      {getSortValue(topThree[1])} {getSortLabel(sortBy)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                      {topThree[1].wins} W - {topThree[1].losses} L -{" "}
                      {topThree[1].kills || 0} K - {topThree[1].totalCombats}{" "}
                      Fights
                    </span>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-400/50" />
              </motion.div>
            )}

            {/* Champion - Order 1 on mobile, 2 on desktop */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                onClick={() => handleSkinClick(topThree[0])}
                className="relative p-4 bg-gradient-to-b from-amber-900/30 to-stone-900 border-2 border-yellow-600/40 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-1 md:order-2 hover:bg-amber-800/30 transition-colors"
              >
                <div className="text-center flex-grow">
                  <div className="text-xl font-bold mb-1 text-yellow-400">
                    Champion
                  </div>
                  <div className="flex items-start justify-center gap-2 mb-1">
                    {topThree[0].imageURL ? (
                      <Image
                        src={topThree[0].imageURL}
                        alt={`Skin ${topThree[0].skinCollectionId}-${topThree[0].skinTokenId}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg border-2 border-yellow-400 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-stone-700 border-2 border-yellow-400 flex items-center justify-center text-xl">
                        🎨
                      </div>
                    )}
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors text-center">
                      <div>{getStanceName(topThree[0].stanceBreakdown)}</div>
                      <div className="text-xs font-normal mt-1">
                        <div className="text-orange-400">
                          Avg: {Math.round(topThree[0].averageDamage)} dmg
                        </div>
                        <div className="text-cyan-400">
                          Taken:{" "}
                          {Math.round(topThree[0].averageDamageTaken || 0)} dmg
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 font-bold text-yellow-400">
                    <BadgeCheck className="h-4 w-4" />
                    <span>
                      {getSortValue(topThree[0])} {getSortLabel(sortBy)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                      {topThree[0].wins} W - {topThree[0].losses} L -{" "}
                      {topThree[0].kills || 0} K - {topThree[0].totalCombats}{" "}
                      Fights
                    </span>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/50" />
              </motion.div>
            )}

            {/* Third Place - Order 3 on both */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => handleSkinClick(topThree[2])}
                className="relative p-4 bg-gradient-to-b from-amber-800/20 to-stone-900 border border-amber-700/30 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-3 hover:bg-amber-700/20 transition-colors"
              >
                <div className="text-center flex-grow">
                  <div className="text-xl font-bold mb-1 text-amber-700">
                    Third Place
                  </div>
                  <div className="flex items-start justify-center gap-2 mb-1">
                    {topThree[2].imageURL ? (
                      <Image
                        src={topThree[2].imageURL}
                        alt={`Skin ${topThree[2].skinCollectionId}-${topThree[2].skinTokenId}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg border-2 border-amber-700 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-stone-700 border-2 border-amber-700 flex items-center justify-center text-xl">
                        🎨
                      </div>
                    )}
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors text-center">
                      <div>{getStanceName(topThree[2].stanceBreakdown)}</div>
                      <div className="text-xs font-normal mt-1">
                        <div className="text-orange-400">
                          Avg: {Math.round(topThree[2].averageDamage)} dmg
                        </div>
                        <div className="text-cyan-400">
                          Taken:{" "}
                          {Math.round(topThree[2].averageDamageTaken || 0)} dmg
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-2 font-bold text-amber-800">
                    <BadgeCheck className="h-4 w-4" />
                    <span>
                      {getSortValue(topThree[2])} {getSortLabel(sortBy)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                      {topThree[2].wins} W - {topThree[2].losses} L -{" "}
                      {topThree[2].kills || 0} K - {topThree[2].totalCombats}{" "}
                      Fights
                    </span>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-700/50" />
              </motion.div>
            )}
          </div>

          {/* Rest of the skins - Desktop Table */}
          <div className="hidden md:block">
            <Table className="border border-yellow-900/20">
              <TableHeader className="bg-amber-950/30">
                <TableRow>
                  <TableHead className="w-12 text-center text-yellow-500">
                    Rank
                  </TableHead>
                  <TableHead className="text-yellow-500">Skin</TableHead>
                  <TableHead
                    className={`w-24 text-center ${
                      sortBy === "winRate"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Win Rate
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "wins"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Wins
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "losses"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Losses
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "kills"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Kills
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "totalCombats"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Fights
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "averageDamage"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Avg Damage
                  </TableHead>
                  <TableHead
                    className={`text-center ${
                      sortBy === "averageDamageTaken"
                        ? "text-yellow-400 font-bold"
                        : "text-yellow-500"
                    }`}
                  >
                    Avg Mitigation
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restOfSkins.map((skin, index) => (
                  <TableRow
                    key={skin.skinId}
                    onClick={() => handleSkinClick(skin)}
                    className="hover:bg-amber-950/20 group cursor-pointer"
                  >
                    <TableCell className="text-center font-semibold text-stone-500">
                      {index + 4}
                    </TableCell>
                    <TableCell className="font-medium text-stone-300 group-hover:text-yellow-400 transition-colors">
                      <div className="flex items-center gap-3">
                        {skin.imageURL ? (
                          <Image
                            src={skin.imageURL}
                            alt={`Skin ${skin.skinCollectionId}-${skin.skinTokenId}`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg border border-stone-600 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-700 border border-stone-600 flex items-center justify-center text-lg">
                            🎨
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-stone-200 hover:text-yellow-400 transition-colors">
                            {getStanceName(skin.stanceBreakdown)}
                          </div>
                          <div className="text-xs text-stone-500">
                            {skin.totalCombats} fights
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "winRate"
                          ? "text-yellow-400 font-bold"
                          : "text-yellow-400 font-bold"
                      }`}
                    >
                      {formatWinRate(skin.winRate)}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "wins"
                          ? "text-yellow-400 font-bold"
                          : "text-green-500 font-bold"
                      }`}
                    >
                      {skin.wins}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "losses"
                          ? "text-yellow-400 font-bold"
                          : "text-red-500 font-bold"
                      }`}
                    >
                      {skin.losses}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "kills"
                          ? "text-yellow-400 font-bold"
                          : "text-purple-400 font-bold"
                      }`}
                    >
                      {skin.kills || 0}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "totalCombats"
                          ? "text-yellow-400 font-bold"
                          : "text-blue-400 font-bold"
                      }`}
                    >
                      {skin.totalCombats}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "averageDamage"
                          ? "text-yellow-400 font-bold"
                          : "text-orange-400 font-bold"
                      }`}
                    >
                      {Math.round(skin.averageDamage)}
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        sortBy === "averageDamageTaken"
                          ? "text-yellow-400 font-bold"
                          : "text-cyan-400 font-bold"
                      }`}
                    >
                      {Math.round(skin.averageDamageTaken || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Rest of the skins - Mobile Cards */}
          <div className="md:hidden space-y-3">
            {restOfSkins.map((skin, index) => (
              <button
                key={skin.skinId}
                onClick={() => handleSkinClick(skin)}
                className="w-full text-left"
                type="button"
              >
                <SkinCard skin={skin} rank={index + 4} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
