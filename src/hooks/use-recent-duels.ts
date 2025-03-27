import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYER_DUELS, GET_ALL_DUELS } from "@/lib/gql-queries";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import type { Duel } from "@/types/game.types";

export function useRecentDuels(playerId?: string | number, limit = 10) {
  const {
    data: duels,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recent-duels", playerId, limit],
    queryFn: async () => {
      try {
        if (playerId) {
          const response = await request<{ duelCompletes: Duel[] }>(
            SUBGRAPH_URL,
            GET_PLAYER_DUELS,
            { limit, playerId: playerId.toString() },
          );
          return response.duelCompletes || [];
        }
        const response = await request<{ duelCompletes: Duel[] }>(
          SUBGRAPH_URL,
          GET_ALL_DUELS,
          { limit },
        );
        return response.duelCompletes || [];
      } catch (error) {
        console.error("Error fetching recent duels:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    duels: duels || [],
    isLoading,
    error,
    refetch,
  };
}
