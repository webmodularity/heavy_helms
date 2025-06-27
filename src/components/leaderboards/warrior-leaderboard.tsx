"use client";

import { useState } from "react";
import {
  useLeaderboardData,
  type LeaderboardSortBy,
} from "@/hooks/use-leaderboard-data";
import type { LeaderboardPlayer } from "@/hooks/use-leaderboard-data";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  BadgeCheck,
  AlertCircle,
  ChevronDown,
  Sword,
  Shield,
  RefreshCw,
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
import { useRouter } from "next/navigation";
import { EnsNameDisplay } from "@/components/ui/ens-name-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to format Battle Rating as integer
function formatBattleRating(rating: number): string {
  return Math.round(rating).toString();
}

// Sort options configuration
const SORT_OPTIONS: Array<{
  value: LeaderboardSortBy;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: "battleRating",
    label: "Battle Rating",
    icon: <Trophy className="h-4 w-4" />,
    description: "Ranked by overall battle performance",
  },
  {
    value: "wins",
    label: "Wins",
    icon: <Crown className="h-4 w-4" />,
    description: "Most victories achieved",
  },
  {
    value: "losses",
    label: "Losses",
    icon: <Shield className="h-4 w-4" />,
    description: "Most defeats endured",
  },
  {
    value: "kills",
    label: "Kills",
    icon: <Sword className="h-4 w-4" />,
    description: "Most enemies slain",
  },
  {
    value: "duelWins",
    label: "Duel Wins",
    icon: <Shield className="h-4 w-4" />,
    description: "One-on-one victories",
  },
  {
    value: "gauntletWins",
    label: "Gauntlet Wins",
    icon: <Trophy className="h-4 w-4" />,
    description: "Tournament championships",
  },
];

export function WarriorLeaderboard() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>("battleRating");

  // Fetch top 20 players with current sort
  const { players, isLoading, error, refetch, isRefetching } =
    useLeaderboardData({ limit: 20, sortBy });

  // Render rank badge based on position
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Crown className="h-8 w-8 text-yellow-400 drop-shadow-glow" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Award className="h-7 w-7 text-slate-300 drop-shadow-glow" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -left-2 -top-2 h-10 w-10 z-10">
            <Medal className="h-7 w-7 text-amber-700 drop-shadow-glow" />
          </div>
        );
      default:
        return null;
    }
  };

  // Mobile card component for ranks 4-20
  const PlayerCard = ({
    player,
    rank,
  }: { player: LeaderboardPlayer; rank: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 4) * 0.05 }}
      onClick={() => router.push(`/character/${player.id}`)}
      className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4 cursor-pointer hover:bg-stone-700/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-stone-400 min-w-[2rem]">
            #{rank}
          </div>
          <div>
            <div className="font-medium text-stone-200 hover:text-yellow-400 transition-colors">
              {player.fullName}
            </div>
            <div className="text-xs text-stone-500">ID: {player.id}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-bold">
            {getSortValue(player, sortBy)}
          </div>
          <div className="text-xs text-stone-400">{getSortLabel(sortBy)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-green-500">
            <span className="text-stone-400">W:</span> {player.wins}
          </span>
          <span className="text-red-500">
            <span className="text-stone-400">L:</span> {player.losses}
          </span>
          <span className="text-blue-400">
            <span className="text-stone-400">K:</span> {player.kills}
          </span>
          <span className="text-yellow-500">
            <span className="text-stone-400">BR:</span>{" "}
            {formatBattleRating(player.battleRating)}
          </span>
        </div>
        <div className="text-xs">
          <EnsNameDisplay
            address={player.owner?.address as `0x${string}` | undefined}
          />
        </div>
      </div>
    </motion.div>
  );

  // Helper functions for sort values and labels
  const getSortValue = (
    player: LeaderboardPlayer,
    sort: LeaderboardSortBy,
  ): string => {
    switch (sort) {
      case "battleRating":
        return formatBattleRating(player.battleRating);
      case "wins":
        return player.wins.toString();
      case "losses":
        return player.losses.toString();
      case "kills":
        return player.kills.toString();
      case "duelWins":
        return player.duelWins.toString();
      case "gauntletWins":
        return player.gauntletWins.toString();
      default:
        return formatBattleRating(player.battleRating);
    }
  };

  const getSortLabel = (sort: LeaderboardSortBy): string => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option?.label || "Battle Rating";
  };

  const getCurrentSortOption = () => {
    return SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];
  };

  // Generate stable keys for skeleton items
  const skeletonKeys = Array.from({ length: 17 }, (_, i) => `skeleton-${i}`);
  const mobileSkeletonKeys = Array.from(
    { length: 17 },
    (_, i) => `mobile-skeleton-${i}`,
  );

  const renderLoadingSkeletons = () => (
    <>
      {/* Top 3 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Runner-up - Order 1 on desktop, 2 on mobile */}
        <div className="relative p-4 border border-slate-400/30 rounded-lg shadow-lg bg-stone-800/30 animate-pulse order-2 md:order-1">
          <div className="text-center">
            <Skeleton className="h-6 w-24 mb-2 mx-auto" />
            <Skeleton className="h-5 w-32 mb-3 mx-auto" />
            <Skeleton className="h-5 w-28 mb-3 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>

        {/* Champion - Order 1 on mobile, 2 on desktop */}
        <div className="relative p-4 border-2 border-yellow-600/40 rounded-lg shadow-lg bg-stone-800/30 animate-pulse order-1 md:order-2">
          <div className="text-center">
            <Skeleton className="h-6 w-24 mb-2 mx-auto" />
            <Skeleton className="h-5 w-32 mb-3 mx-auto" />
            <Skeleton className="h-5 w-28 mb-3 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>

        {/* Third Place - Order 3 on both */}
        <div className="relative p-4 border border-amber-700/30 rounded-lg shadow-lg bg-stone-800/30 animate-pulse order-3">
          <div className="text-center">
            <Skeleton className="h-6 w-24 mb-2 mx-auto" />
            <Skeleton className="h-5 w-32 mb-3 mx-auto" />
            <Skeleton className="h-5 w-28 mb-3 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block">
        <Table className="border border-yellow-900/20">
          <TableHeader className="bg-amber-950/30">
            <TableRow>
              <TableHead className="w-12 text-center text-yellow-500">
                Rank
              </TableHead>
              <TableHead className="text-yellow-500">Warrior</TableHead>
              <TableHead className="w-24 text-center text-yellow-500">
                ID
              </TableHead>
              <TableHead
                className={`w-24 text-center ${
                  sortBy === "battleRating"
                    ? "text-yellow-400 font-bold"
                    : "text-yellow-500"
                }`}
              >
                Battle Rating
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
              {(sortBy === "duelWins" || sortBy === "gauntletWins") && (
                <TableHead className="w-24 text-center text-yellow-400 font-bold">
                  {getSortLabel(sortBy)}
                </TableHead>
              )}
              <TableHead className="text-center text-yellow-500">
                Owner
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonKeys.map((key, index) => (
              <TableRow key={key} className="hover:bg-amber-950/20">
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-3/4" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>
                {(sortBy === "duelWins" || sortBy === "gauntletWins") && (
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden space-y-3">
        {mobileSkeletonKeys.map((key, index) => (
          <div
            key={key}
            className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-8" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center text-red-400">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-xl font-semibold mb-2">
        Failed to load leaderboard data.
      </p>
      <p className="text-sm text-stone-400 mb-4">{error?.message}</p>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
      </Button>
    </div>
  );

  // Split data once loaded
  const topThree = players?.slice(0, 3) || [];
  const restOfPlayers = players?.slice(3) || [];

  // Function to handle row click
  const handleRowClick = (playerId: string) => {
    router.push(`/character/${playerId}`);
  };

  // Click handler for Top 3 cards
  const handleCardClick = (playerId: string | undefined) => {
    if (playerId) {
      router.push(`/character/${playerId}`);
    }
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-3 md:p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold text-yellow-400">
              Warrior Leaderboard
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
                  onClick={() => setSortBy(option.value)}
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

      <div className="p-3 md:p-4">
        {isLoading ? (
          renderLoadingSkeletons()
        ) : error ? (
          renderErrorState()
        ) : (
          <div className="relative">
            {/* Top 3 fighters showcase - Fixed Ordering */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Runner-up - Order 2 on mobile, 1 on desktop */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => handleCardClick(topThree[1].id)}
                  className="relative p-4 bg-gradient-to-b from-slate-800/30 to-stone-900 border border-slate-400/30 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-2 md:order-1"
                >
                  {renderRankBadge(2)}
                  <div className="text-center flex-grow">
                    <div className="text-xl font-bold mb-1 text-slate-300">
                      Runner-up
                    </div>
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors">
                      {topThree[1].fullName}{" "}
                      <span className="text-stone-400 text-sm font-normal">
                        ({topThree[1].id})
                      </span>
                    </div>
                    <div className="mt-1 text-xs h-4">
                      <EnsNameDisplay
                        address={
                          topThree[1].owner?.address as
                            | `0x${string}`
                            | undefined
                        }
                      />
                    </div>
                    <div className="inline-flex items-center gap-1 mt-3 font-bold text-slate-400">
                      <BadgeCheck className="h-4 w-4" />
                      <span>
                        {getSortValue(topThree[1], sortBy)}{" "}
                        {getSortLabel(sortBy)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-stone-400">
                      <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                        {topThree[1].wins} W - {topThree[1].losses} L -{" "}
                        {topThree[1].kills} K -{" "}
                        {formatBattleRating(topThree[1].battleRating)} BR
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
                  onClick={() => handleCardClick(topThree[0].id)}
                  className="relative p-4 bg-gradient-to-b from-amber-900/30 to-stone-900 border-2 border-yellow-600/40 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-1 md:order-2"
                >
                  {renderRankBadge(1)}
                  <div className="text-center flex-grow">
                    <div className="text-xl font-bold mb-1 text-yellow-400">
                      Champion
                    </div>
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors">
                      {topThree[0].fullName}{" "}
                      <span className="text-stone-400 text-sm font-normal">
                        ({topThree[0].id})
                      </span>
                    </div>
                    <div className="mt-1 text-xs h-4">
                      <EnsNameDisplay
                        address={
                          topThree[0].owner?.address as
                            | `0x${string}`
                            | undefined
                        }
                      />
                    </div>
                    <div className="inline-flex items-center gap-1 mt-3 font-bold text-yellow-500">
                      <BadgeCheck className="h-4 w-4" />
                      <span>
                        {getSortValue(topThree[0], sortBy)}{" "}
                        {getSortLabel(sortBy)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-stone-400">
                      <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                        {topThree[0].wins} W - {topThree[0].losses} L -{" "}
                        {topThree[0].kills} K -{" "}
                        {formatBattleRating(topThree[0].battleRating)} BR
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
                  onClick={() => handleCardClick(topThree[2].id)}
                  className="relative p-4 bg-gradient-to-b from-amber-800/20 to-stone-900 border border-amber-700/30 rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group order-3"
                >
                  {renderRankBadge(3)}
                  <div className="text-center flex-grow">
                    <div className="text-xl font-bold mb-1 text-amber-700">
                      Third Place
                    </div>
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors">
                      {topThree[2].fullName}{" "}
                      <span className="text-stone-400 text-sm font-normal">
                        ({topThree[2].id})
                      </span>
                    </div>
                    <div className="mt-1 text-xs h-4">
                      <EnsNameDisplay
                        address={
                          topThree[2].owner?.address as
                            | `0x${string}`
                            | undefined
                        }
                      />
                    </div>
                    <div className="inline-flex items-center gap-1 mt-3 font-bold text-amber-800">
                      <BadgeCheck className="h-4 w-4" />
                      <span>
                        {getSortValue(topThree[2], sortBy)}{" "}
                        {getSortLabel(sortBy)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-stone-400">
                      <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                        {topThree[2].wins} W - {topThree[2].losses} L -{" "}
                        {topThree[2].kills} K -{" "}
                        {formatBattleRating(topThree[2].battleRating)} BR
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-700/50" />
                </motion.div>
              )}
            </div>

            {/* Rest of the fighters - Desktop Table */}
            <div className="hidden md:block">
              <Table className="border border-yellow-900/20">
                <TableHeader className="bg-amber-950/30">
                  <TableRow>
                    <TableHead className="w-12 text-center text-yellow-500">
                      Rank
                    </TableHead>
                    <TableHead className="text-yellow-500">Warrior</TableHead>
                    <TableHead className="w-24 text-center text-yellow-500">
                      ID
                    </TableHead>
                    <TableHead
                      className={`w-24 text-center ${
                        sortBy === "battleRating"
                          ? "text-yellow-400 font-bold"
                          : "text-yellow-500"
                      }`}
                    >
                      Battle Rating
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
                    {(sortBy === "duelWins" || sortBy === "gauntletWins") && (
                      <TableHead className="w-24 text-center text-yellow-400 font-bold">
                        {getSortLabel(sortBy)}
                      </TableHead>
                    )}
                    <TableHead className="text-center text-yellow-500">
                      Owner
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restOfPlayers.map((player, index) => (
                    <TableRow
                      key={player.id}
                      className="hover:bg-amber-950/20 group cursor-pointer"
                      onClick={() => handleRowClick(player.id)}
                    >
                      <TableCell className="text-center font-semibold text-stone-500">
                        {index + 4}
                      </TableCell>
                      <TableCell className="font-medium text-stone-300 group-hover:text-yellow-400 transition-colors">
                        {player.fullName}
                      </TableCell>
                      <TableCell className="text-center text-stone-400 font-mono text-xs">
                        {player.id}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          sortBy === "battleRating"
                            ? "text-yellow-400 font-bold"
                            : "text-yellow-400 font-bold"
                        }`}
                      >
                        {formatBattleRating(player.battleRating)}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          sortBy === "wins"
                            ? "text-yellow-400 font-bold"
                            : "text-green-500 font-bold"
                        }`}
                      >
                        {player.wins}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          sortBy === "losses"
                            ? "text-yellow-400 font-bold"
                            : "text-red-500"
                        }`}
                      >
                        {player.losses}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          sortBy === "kills"
                            ? "text-yellow-400 font-bold"
                            : "text-blue-400 font-bold"
                        }`}
                      >
                        {player.kills}
                      </TableCell>
                      {(sortBy === "duelWins" || sortBy === "gauntletWins") && (
                        <TableCell className="text-center text-yellow-400 font-bold">
                          {getSortValue(player, sortBy)}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <EnsNameDisplay
                          address={
                            player.owner?.address as `0x${string}` | undefined
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Rest of the fighters - Mobile Cards */}
            <div className="md:hidden space-y-3">
              {restOfPlayers.map((player, index) => (
                <PlayerCard key={player.id} player={player} rank={index + 4} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
