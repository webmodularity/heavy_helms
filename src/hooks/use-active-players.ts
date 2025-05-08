import { SUBGRAPH_URL } from "@/config";
import { GET_ACTIVE_PLAYERS_QUERY } from "@/lib/gql-queries";
import { convertRawFighterToFighter } from "@/lib/player-api";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import type { RawFighterData } from "@/types/fighter-types";
import { useAccount } from "wagmi";
export function useActivePlayers() {
  const { isConnected } = useAccount();
  // Fetch all active players
  const {
    data: players,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["active-players"],
    queryFn: async () => {
      try {
        // Fetch the active players from the GraphQL API
        const { players } = await request<{ players: RawFighterData[] }>(
          SUBGRAPH_URL,
          GET_ACTIVE_PLAYERS_QUERY,
        );

        // If no players found, return empty array
        if (!players || players.length === 0) {
          return [];
        }

        // Convert the raw player data to Player objects
        const convertedPlayers = await Promise.all(
          players.map((player) => convertRawFighterToFighter(player)),
        );

        return convertedPlayers;
      } catch (error) {
        console.error("Error fetching active players:", error);
        throw error;
      }
    },
    enabled: !!isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    players: players || [],
    isLoading,
    error,
    refetch,
  };
}
