import { SUBGRAPH_URL } from "@/config";
import { GET_ALL_DUELS, GET_PLAYER_DUELS } from "@/lib/gql-queries";
import type { Duel } from "@/types/game.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

export function useRecentDuels(playerId: string | number, pageSize = 10) {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["recent-duels", playerId, pageSize],
    enabled: !!playerId,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await request<{ duelCompletes: Duel[] }>(
          SUBGRAPH_URL,
          GET_PLAYER_DUELS,
          {
            limit: pageSize,
            skip: pageParam,
            playerId: playerId.toString(),
          },
        );
        return response.duelCompletes || [];
      } catch (error) {
        console.error("Error fetching recent duels:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer items than requested, we've reached the end
      if (lastPage.length < pageSize) return undefined;

      // Otherwise, calculate the next offset
      return allPages.length * pageSize;
    },
    staleTime: 300 * 1000, // 5m
    refetchInterval: 300 * 1000, // 5m
  });

  // Flatten pages of data
  const duels = data?.pages.flat() || [];

  return {
    duels,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
