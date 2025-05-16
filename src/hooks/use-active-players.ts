import { SUBGRAPH_URL } from "@/config";
import { GET_ACTIVE_PLAYERS_QUERY } from "@/lib/gql-queries";
import { convertRawFighterToFighter } from "@/lib/player-api";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import type { Fighter, RawFighterData } from "@/types/fighter-types";
import { useAccount } from "wagmi";

// --- Type Definitions ---
interface ActivePlayersResult {
  players: Fighter[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

// --- Query Keys ---
const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  active: () => [...playerKeys.lists(), 'active'] as const,
};

export function useActivePlayers(): ActivePlayersResult {
  const { isConnected } = useAccount();
  
  // Fetch all active players
  const {
    data: players,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: playerKeys.active(),
    queryFn: async (): Promise<Fighter[]> => {
      try {
        // Fetch active players from the GraphQL API
        const { players } = await request<{ players: RawFighterData[] }>(
          SUBGRAPH_URL,
          GET_ACTIVE_PLAYERS_QUERY,
        );
        
        // If no players found, return empty array
        if (!players || players.length === 0) {
          return [];
        }

        // Convert raw player data to Fighter objects
        return await Promise.all(
          players.map(convertRawFighterToFighter)
        );
      } catch (error) {
        console.error("Error fetching active players:", error);
        throw error;
      }
    },
    enabled: !!isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    players: players || [],
    isLoading,
    error,
    refetch,
  };
}
