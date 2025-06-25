import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { GET_LEADERBOARD_PLAYERS } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config"; // Use the existing config

// --- Type Definitions ---

export type LeaderboardSortBy =
  | "battleRating"
  | "wins"
  | "losses"
  | "kills"
  | "duelWins"
  | "gauntletWins";

// Player type based on the PLAYER_DATA_FRAGMENT
// Consider generating this from your schema for better maintenance
// or importing if it already exists in @/types/
export interface LeaderboardPlayer {
  id: string;
  firstName: string;
  surname: string;
  fullName: string;
  currentSkin: {
    weapon: number | null; // Assuming number based on other hooks, adjust if type is different
    armor: number | null; // Assuming number based on other hooks, adjust if type is different
    // Add other skin fields if needed (e.g., imageURL after processing, like in use-recent-duels)
  } | null;
  stance: string;
  wins: number;
  losses: number;
  kills: number;
  duelWins: number;
  gauntletWins: number;
  battleRating: number;
  owner?: { address: string } | null; // Include owner if needed
  // Add other relevant fields from PlayerDataFields
}

// Structure for the raw GQL query result
interface LeaderboardQueryResult {
  players: LeaderboardPlayer[];
}

interface LeaderboardOptions {
  limit?: number;
  sortBy?: LeaderboardSortBy;
  minWins?: number; // For special leaderboards like Velvet Rope (69) and Green Room (420)
  exactWins?: number; // For exact win count matches
}

// --- Hook Implementation ---

// Default limit can be adjusted or removed if always passed
const DEFAULT_LIMIT = 100;

export function useLeaderboardData(options: LeaderboardOptions = {}) {
  const {
    limit = DEFAULT_LIMIT,
    sortBy = "battleRating",
    minWins,
    exactWins,
  } = options;

  const queryResult = useQuery({
    // Unique query key including the limit
    queryKey: ["leaderboard-players", limit, sortBy, minWins, exactWins],

    queryFn: async () => {
      try {
        const response = await request<LeaderboardQueryResult>(
          SUBGRAPH_URL, // Use imported SUBGRAPH_URL
          GET_LEADERBOARD_PLAYERS,
          { limit: limit * 2, skip: 0 }, // Fetch more to allow for filtering
        );
        // Return the raw players array; sorting happens in 'select'
        return response.players || [];
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error; // Re-throw for react-query error handling
      }
    },

    // Add caching/refetching options similar to other hooks if desired
    staleTime: 300 * 1000, // 5m example
    // refetchInterval: 300 * 1000, // Optional: 5m refetch example

    // Use 'select' to process/sort the data returned by queryFn
    select: (fetchedPlayers) => {
      if (!fetchedPlayers) return []; // Handle potential undefined case

      let filteredPlayers = [...fetchedPlayers];

      // Apply win count filters for special leaderboards
      if (minWins !== undefined) {
        filteredPlayers = filteredPlayers.filter(
          (player) => player.wins >= minWins,
        );
      }

      if (exactWins !== undefined) {
        filteredPlayers = filteredPlayers.filter(
          (player) => player.wins === exactWins,
        );
      }

      // Sort based on the selected criteria
      const sortedPlayers = filteredPlayers.sort((a, b) => {
        switch (sortBy) {
          case "wins":
            if (a.wins !== b.wins) return b.wins - a.wins;
            return b.battleRating - a.battleRating; // Secondary sort by battle rating
          case "losses":
            if (a.losses !== b.losses) return b.losses - a.losses;
            return b.battleRating - a.battleRating;
          case "kills":
            if (a.kills !== b.kills) return b.kills - a.kills;
            return b.battleRating - a.battleRating;
          case "duelWins":
            if (a.duelWins !== b.duelWins) return b.duelWins - a.duelWins;
            return b.battleRating - a.battleRating;
          case "gauntletWins":
            if (a.gauntletWins !== b.gauntletWins)
              return b.gauntletWins - a.gauntletWins;
            return b.battleRating - a.battleRating;
          default: // battleRating
            if (a.battleRating !== b.battleRating)
              return b.battleRating - a.battleRating;
            return b.wins - a.wins; // Secondary sort by wins
        }
      });

      // Return only the requested limit after filtering and sorting
      return sortedPlayers.slice(0, limit);
    },
  });

  // Destructure what the component needs (isLoading, error, data, refetch, etc.)
  const {
    data: players, // Rename data to players for clarity
    isLoading,
    error,
    refetch,
    isRefetching,
    // Add other properties from queryResult as needed
  } = queryResult;

  return {
    players: players ?? [], // Ensure returning an array even if data is initially undefined
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
