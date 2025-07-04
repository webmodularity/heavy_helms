import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_FIGHTERS_BY_IDS } from "@/lib/gql-queries";
import {
  convertRawFighterToFighter,
  type FightersResponse,
} from "@/lib/player-api";
import request from "graphql-request";
import type { Fighter } from "@/types/fighter-types";
import { SUBGRAPH_URL } from "@/config";
import { useAccount } from "wagmi";
import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import { useMemo } from "react";

/**
 * Custom hook to fetch a player by ID and determine their leaderboard rank.
 */
export function usePlayerById(playerId: string) {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  // Fetch leaderboard data - top 50 to match other ranking displays
  const { players: leaderboardPlayers, isLoading: leaderboardLoading } =
    useLeaderboardData({ limit: 50 }); // Matches leaderboard page capacity

  // Fetch the specific player's data
  const { data, isLoading, error } = useQuery({
    queryKey: ["player", playerId],
    queryFn: async () => {
      // Check cache first (omitted for brevity, assume it's there)
      // ... cache check logic ...

      // Fetch from API if not in cache
      try {
        const response = await request<FightersResponse>(
          SUBGRAPH_URL,
          GET_FIGHTERS_BY_IDS,
          { fighterIds: [playerId] },
        );
        const fighters = response.fighters;
        if (!fighters || fighters.length === 0) return null;
        return await convertRawFighterToFighter(fighters[0]);
      } catch (err) {
        console.error("Error fetching player:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Calculate rank directly from the fetched leaderboard data
  const playerRank = useMemo(() => {
    // Ensure both leaderboard and player data are loaded and valid
    if (!leaderboardPlayers || leaderboardPlayers.length === 0 || !data) {
      return null; // Cannot determine rank yet
    }

    // Find the index of the player in the leaderboard array using their ID
    // Use String() comparison for safety against type mismatches (e.g., '10003' vs 10003)
    const index = leaderboardPlayers.findIndex(
      (leaderboardPlayer) => String(leaderboardPlayer.id) === String(playerId),
    );

    // If the player is found (index >= 0), their rank is index + 1
    if (index >= 0) {
      return index + 1;
    }

    // Player not found in the fetched leaderboard slice (e.g., outside top 50)
    return null;
  }, [leaderboardPlayers, data, playerId]); // Dependencies: leaderboard, player data, and the ID itself

  // Combine player data with the calculated rank
  const playerWithRank = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      rank: playerRank, // This will be null if not ranked in the fetched list
    };
  }, [data, playerRank]);

  return {
    data: playerWithRank,
    // Combine loading states
    isLoading: isLoading || leaderboardLoading,
    error,
  };
}
