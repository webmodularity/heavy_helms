"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Trophy, Info } from "lucide-react";
import { formatBattleRating } from "./profile-helpers";
import { usePlayerRankings } from "@/hooks/use-player-rankings";
import { useRouter } from "next/navigation";

interface BattleLegacyProps {
  character: Player;
}

interface RankingCardProps {
  label: string;
  value: string;
  rank: number | null;
  className?: string;
  onClick?: () => void;
}

function RankingCard({
  label,
  value,
  rank,
  className = "",
  onClick,
}: RankingCardProps) {
  const rankDisplay = rank ? `#${rank}` : "N/A";
  const isRanked = rank !== null;
  const isClickable = !!onClick && isRanked;

  return (
    <motion.div
      className={`flex-1 p-4 bg-stone-800/30 rounded-lg border border-yellow-600/10 relative overflow-hidden group transition-all duration-300 ${
        isClickable
          ? "cursor-pointer hover:border-yellow-600/30 hover:bg-stone-800/40"
          : "hover:border-yellow-600/20"
      }`}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 text-center">
        {/* Value - Main focus */}
        <div className={`text-2xl font-bold ${className} mb-1`}>{value}</div>

        {/* Rank - Subtle but visible */}
        <div className="text-sm mb-2">
          <span
            className={`${isRanked ? "text-stone-300" : "text-stone-500"}`}
            title={!isRanked ? "Not in top 50 for this metric" : undefined}
          >
            ({rankDisplay})
          </span>
        </div>

        {/* Label */}
        <div className="text-stone-400 text-xs group-hover:text-stone-300 transition-colors duration-300">
          {label}
        </div>

        {/* Click hint for ranked items - positioned absolutely to not take space */}
        {isClickable && (
          <div className="absolute bottom-1 left-0 right-0 text-xs text-yellow-400 bg-stone-900/90 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            View Leaderboard
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function BattleLegacy({ character }: BattleLegacyProps) {
  const { rankings, isLoading } = usePlayerRankings(character.id);
  const router = useRouter();

  const navigateToLeaderboard = (sortBy: string) => {
    router.push(`/leaderboards/warriors/${sortBy}`);
  };

  const cards = [
    {
      label: "Wins",
      value: character.record.wins.toString(),
      rank: rankings.wins,
      className: "text-green-400",
      onClick: () => navigateToLeaderboard("wins"),
    },
    {
      label: "Losses",
      value: character.record.losses.toString(),
      rank: rankings.losses,
      className: "text-red-400",
      onClick: () => navigateToLeaderboard("losses"),
    },
    {
      label: "Kills",
      value: character.record.kills.toString(),
      rank: rankings.kills,
      className: "text-stone-200",
      onClick: () => navigateToLeaderboard("kills"),
    },
    {
      label: "Rating",
      value: formatBattleRating(character.battleRating),
      rank: rankings.battleRating,
      className: "text-amber-500",
      onClick: () => navigateToLeaderboard("battleRating"),
    },
    {
      label: "Duel Wins",
      value: character.duelWins?.toString() || "0",
      rank: rankings.duelWins,
      className: "text-blue-400",
      onClick: () => navigateToLeaderboard("duelWins"),
    },
    {
      label: "Gauntlet",
      value: character.gauntletWins?.toString() || "0",
      rank: rankings.gauntletWins,
      className: "text-purple-400",
      onClick: () => navigateToLeaderboard("gauntletWins"),
    },
  ];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-yellow-500 flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Battle Record
          </h3>
          <div className="text-xs text-stone-500">Top 50</div>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            {["Wins", "Losses", "Kills"].map((label) => (
              <div
                key={label}
                className="flex-1 h-20 bg-stone-800/30 rounded-lg border border-yellow-600/10 animate-pulse"
              />
            ))}
          </div>
          <div className="flex gap-3">
            {["Rating", "Duel Wins", "Gauntlet"].map((label) => (
              <div
                key={label}
                className="flex-1 h-20 bg-stone-800/30 rounded-lg border border-yellow-600/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="pb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-yellow-500 flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Battle Record
        </h3>
        <div className="text-xs text-stone-500">Top 50</div>
      </div>

      {/* Desktop: 2 rows of 3 cards */}
      <div className="hidden md:block space-y-3">
        <div className="flex gap-3">
          {cards.slice(0, 3).map((card) => (
            <RankingCard
              key={card.label}
              label={card.label}
              value={card.value}
              rank={card.rank}
              className={card.className}
              onClick={card.onClick}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {cards.slice(3, 6).map((card) => (
            <RankingCard
              key={card.label}
              label={card.label}
              value={card.value}
              rank={card.rank}
              className={card.className}
              onClick={card.onClick}
            />
          ))}
        </div>
      </div>

      {/* Mobile: 2 rows of 3 cards */}
      <div className="md:hidden space-y-3">
        <div className="flex gap-3">
          {cards.slice(0, 3).map((card) => (
            <RankingCard
              key={card.label}
              label={card.label}
              value={card.value}
              rank={card.rank}
              className={card.className}
              onClick={card.onClick}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {cards.slice(3, 6).map((card) => (
            <RankingCard
              key={card.label}
              label={card.label}
              value={card.value}
              rank={card.rank}
              className={card.className}
              onClick={card.onClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
