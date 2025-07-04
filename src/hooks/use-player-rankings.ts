import { useQuery } from "@tanstack/react-query";
import {
  useLeaderboardData,
  type LeaderboardPlayer,
} from "@/hooks/use-leaderboard-data";
import { useMemo } from "react";
import type { Player } from "@/types/player.types";

export interface PlayerRankings {
  battleRating: number | null;
  wins: number | null;
  losses: number | null;
  kills: number | null;
  duelWins: number | null;
  gauntletWins: number | null;
}

/**
 * Hook to fetch rankings for a specific player
 *
 * IMPORTANT: Only shows ranks for players in the top 50 of each metric.
 * Players outside top 50 will show null (displays as "N/A").
 * This is intentional for performance and scalability.
 */
export function usePlayerRankings(playerId: string | undefined) {
  // Fetch top 50 for each metric - reasonable limit for performance
  const { players: battleRatingLeaderboard, isLoading: battleRatingLoading } =
    useLeaderboardData({ limit: 50, sortBy: "battleRating" });

  const { players: winsLeaderboard, isLoading: winsLoading } =
    useLeaderboardData({ limit: 50, sortBy: "wins" });

  const { players: lossesLeaderboard, isLoading: lossesLoading } =
    useLeaderboardData({ limit: 50, sortBy: "losses" });

  const { players: killsLeaderboard, isLoading: killsLoading } =
    useLeaderboardData({ limit: 50, sortBy: "kills" });

  const { players: duelWinsLeaderboard, isLoading: duelWinsLoading } =
    useLeaderboardData({ limit: 50, sortBy: "duelWins" });

  const { players: gauntletWinsLeaderboard, isLoading: gauntletWinsLoading } =
    useLeaderboardData({ limit: 50, sortBy: "gauntletWins" });

  // Calculate rankings
  const rankings = useMemo((): PlayerRankings => {
    if (!playerId) {
      return {
        battleRating: null,
        wins: null,
        losses: null,
        kills: null,
        duelWins: null,
        gauntletWins: null,
      };
    }

    const findRank = (
      leaderboard: LeaderboardPlayer[],
      playerIdToFind: string,
    ): number | null => {
      const index = leaderboard.findIndex(
        (player) => String(player.id) === String(playerIdToFind),
      );
      return index >= 0 ? index + 1 : null;
    };

    return {
      battleRating: findRank(battleRatingLeaderboard, playerId),
      wins: findRank(winsLeaderboard, playerId),
      losses: findRank(lossesLeaderboard, playerId),
      kills: findRank(killsLeaderboard, playerId),
      duelWins: findRank(duelWinsLeaderboard, playerId),
      gauntletWins: findRank(gauntletWinsLeaderboard, playerId),
    };
  }, [
    playerId,
    battleRatingLeaderboard,
    winsLeaderboard,
    lossesLeaderboard,
    killsLeaderboard,
    duelWinsLeaderboard,
    gauntletWinsLeaderboard,
  ]);

  const isLoading =
    battleRatingLoading ||
    winsLoading ||
    lossesLoading ||
    killsLoading ||
    duelWinsLoading ||
    gauntletWinsLoading;

  return {
    rankings,
    isLoading,
  };
}
