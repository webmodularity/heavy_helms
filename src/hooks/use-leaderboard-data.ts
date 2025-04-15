import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { GET_LEADERBOARD_PLAYERS } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config"; // Use the existing config

// --- Type Definitions ---

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
  battleRating: number;
  owner?: { address: string } | null; // Include owner if needed
  // Add other relevant fields from PlayerDataFields
}

// Structure for the raw GQL query result
interface LeaderboardQueryResult {
  players: LeaderboardPlayer[];
}

// --- Hook Implementation ---

// Default limit can be adjusted or removed if always passed
const DEFAULT_LIMIT = 100;

export function useLeaderboardData(limit: number = DEFAULT_LIMIT) {
  const queryResult = useQuery({
    // Unique query key including the limit
    queryKey: ["leaderboard-players", limit],

    queryFn: async () => {
      try {
        const response = await request<LeaderboardQueryResult>(
          SUBGRAPH_URL, // Use imported SUBGRAPH_URL
          GET_LEADERBOARD_PLAYERS,
          { limit, skip: 0 }, // Pass variables
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

      // Perform secondary sort by wins (descending) here
      const sortedPlayers = [...fetchedPlayers].sort((a, b) => {
        // Primary sort by battleRating is handled by GQL query itself
        // This sort function handles ties in battleRating
        if (a.battleRating !== b.battleRating) {
          // Should already be sorted by GQL, but double-check doesn't hurt
          return b.battleRating - a.battleRating;
        }
        // Secondary sort: Higher wins first
        return b.wins - a.wins;
      });
      return sortedPlayers;
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
