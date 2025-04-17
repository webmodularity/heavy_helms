"use client";

import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import type { LeaderboardPlayer } from "@/hooks/use-leaderboard-data";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  BadgeCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  Clock,
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

// Helper function to format Battle Rating as integer
function formatBattleRating(rating: number): string {
  // Use Math.round or Math.floor depending on desired rounding behavior
  // Math.round will round to the nearest integer
  return Math.round(rating).toString();
}

export function WarriorLeaderboard() {
  const router = useRouter();
  // Fetch top 20 players
  const { players, isLoading, error, refetch, isRefetching } =
    useLeaderboardData(20); // Limit changed to 20

  // Render rank badge based on position
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -left-3 -top-3 h-12 w-12">
            <Crown className="h-8 w-8 text-yellow-400 drop-shadow-glow" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -left-3 -top-3 h-10 w-10">
            <Award className="h-7 w-7 text-slate-300 drop-shadow-glow" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -left-3 -top-3 h-10 w-10">
            <Medal className="h-7 w-7 text-amber-700 drop-shadow-glow" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderLoadingSkeletons = () => (
    <>
      {/* Top 3 Skeleton */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        {[...Array(3)].map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className={`relative p-4 w-full sm:w-1/3 ${
              index === 0
                ? "border-2 border-yellow-600/40 order-2 sm:order-2"
                : index === 1
                  ? "border border-slate-400/30 order-1 sm:order-1"
                  : "border border-amber-700/30 order-3 sm:order-3"
            } rounded-lg shadow-lg bg-stone-800/30 animate-pulse`}
          >
            <div className="text-center">
              <Skeleton className="h-6 w-24 mb-2 mx-auto" />
              <Skeleton className="h-5 w-32 mb-3 mx-auto" />
              <Skeleton className="h-5 w-28 mb-3 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </div>
        ))}
      </div>
      {/* Table Skeleton - Updated Column Order */}
      <Table className="border border-yellow-900/20">
        <TableHeader className="bg-amber-950/30">
          <TableRow>
            <TableHead className="w-12 text-center text-yellow-500">
              Rank
            </TableHead>
            <TableHead className="text-yellow-500">Warrior</TableHead>
            <TableHead className="hidden md:table-cell w-24 text-center text-yellow-500">
              ID
            </TableHead>
            <TableHead className="w-24 text-center text-yellow-500">
              Battle Rating
            </TableHead>
            <TableHead className="text-center text-yellow-500">Wins</TableHead>
            <TableHead className="text-center text-yellow-500">
              Losses
            </TableHead>
            <TableHead className="hidden lg:table-cell text-center text-yellow-500">
              Owner
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Display skeletons for remaining ranks (up to 17 more if limit is 20) */}
          {[...Array(17)].map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TableRow key={index} className="hover:bg-amber-950/20">
              <TableCell className="text-center">
                <Skeleton className="h-4 w-4 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-3/4" />
              </TableCell>
              <TableCell className="hidden md:table-cell text-center">
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
              <TableCell className="hidden lg:table-cell text-center">
                <Skeleton className="h-4 w-20 mx-auto" />{" "}
                {/* Slightly smaller skeleton for abbreviated address */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
  const restOfPlayers = players?.slice(3) || []; // Will contain up to 17 players

  // Function to handle row click
  const handleRowClick = (playerId: string) => {
    router.push(`/character/${playerId}`);
  };

  // --- Click handler for Top 3 cards ---
  const handleCardClick = (playerId: string | undefined) => {
    if (playerId) {
      router.push(`/character/${playerId}`);
    }
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">
            Warrior Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400 flex items-center">
            The Champions of Heavy Helms
          </span>
          <Button
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Trophy wall header with gold effect */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600">
            Hall of Champions
          </h3>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />
        </div>

        {isLoading ? (
          renderLoadingSkeletons()
        ) : error ? (
          renderErrorState()
        ) : (
          <div className="relative">
            {/* Top 3 fighters showcase - Updated Formatting */}
            <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4 mb-6">
              {topThree.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => handleCardClick(player.id)}
                  className={`relative p-4 w-full sm:w-1/3 ${
                    index === 0
                      ? "bg-gradient-to-b from-amber-900/30 to-stone-900 border-2 border-yellow-600/40 order-2 sm:order-2"
                      : index === 1
                        ? "bg-gradient-to-b from-slate-800/30 to-stone-900 border border-slate-400/30 order-1 sm:order-1"
                        : "bg-gradient-to-b from-amber-800/20 to-stone-900 border border-amber-700/30 order-3 sm:order-3"
                  } rounded-lg shadow-lg flex flex-col min-h-[180px] cursor-pointer group`}
                >
                  {renderRankBadge(index + 1)}
                  <div className="text-center flex-grow">
                    {/* Title (Champion, etc.) */}
                    <div
                      className={`text-xl font-bold mb-1 ${index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : "text-amber-700"}`}
                    >
                      {index === 0
                        ? "Champion"
                        : index === 1
                          ? "Runner-up"
                          : "Third Place"}
                    </div>
                    {/* Name with ID */}
                    <div className="text-stone-200 font-bold group-hover:text-yellow-400 transition-colors">
                      {player.fullName}{" "}
                      <span className="text-stone-400 text-sm font-normal">
                        ({player.id})
                      </span>
                    </div>
                    {/* Owner ENS/Address */}
                    <div className="mt-1 text-xs h-4">
                      <EnsNameDisplay
                        address={
                          player.owner?.address as `0x${string}` | undefined
                        }
                      />
                    </div>
                    {/* Battle Rating (Integer) */}
                    <div
                      className={`inline-flex items-center gap-1 mt-3 font-bold ${index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : "text-amber-800"}`}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      <span>
                        {formatBattleRating(player.battleRating)} Battle Rating
                      </span>
                    </div>
                    {/* W-L Record */}
                    <div className="mt-2 text-xs text-stone-400">
                      <span className="inline-block px-2 py-0.5 bg-stone-800 rounded-full font-mono">
                        {player.wins} W - {player.losses} L
                      </span>
                    </div>
                  </div>
                  {/* Decorative Top Border */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${index === 0 ? "bg-yellow-500/50" : index === 1 ? "bg-slate-400/50" : "bg-amber-700/50"}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Rest of the fighters table - Updated Column Order */}
            <Table className="border border-yellow-900/20">
              <TableHeader className="bg-amber-950/30">
                <TableRow>
                  <TableHead className="w-12 text-center text-yellow-500">
                    Rank
                  </TableHead>
                  <TableHead className="text-yellow-500">Warrior</TableHead>
                  <TableHead className="hidden md:table-cell w-24 text-center text-yellow-500">
                    ID
                  </TableHead>
                  <TableHead className="w-24 text-center text-yellow-500">
                    Battle Rating
                  </TableHead>
                  <TableHead className="text-center text-yellow-500">
                    Wins
                  </TableHead>
                  <TableHead className="text-center text-yellow-500">
                    Losses
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-center text-yellow-500">
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
                    {/* ID Cell */}
                    <TableCell className="hidden md:table-cell text-center text-stone-400 font-mono text-xs">
                      {player.id}
                    </TableCell>
                    {/* Battle Rating Cell - Highlighted */}
                    <TableCell className="text-center text-yellow-400 font-mono font-semibold">
                      {" "}
                      {/* Changed color and added font-semibold */}
                      {formatBattleRating(player.battleRating)}
                    </TableCell>
                    {/* Wins Cell */}
                    <TableCell className="text-center text-green-500 font-bold">
                      {player.wins}
                    </TableCell>
                    {/* Losses Cell */}
                    <TableCell className="text-center text-red-500">
                      {player.losses}
                    </TableCell>
                    {/* Owner Cell - Use EnsNameDisplay */}
                    <TableCell className="hidden lg:table-cell text-center">
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
        )}
      </div>
    </div>
  );
}
