import { SUBGRAPH_URL } from "@/config";
// Use the new GQL query constant
import { GET_EXPIRED_WAGER_CHALLENGES } from "@/lib/gql-queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

// --- Type Definitions (can reuse or redefine if needed) ---
interface ChallengeFighterSnapshot {
  id: string;
  fullName: string | null;
}

interface ExpiredWagerChallenge {
  // Renamed interface for clarity
  id: string;
  wagerAmount: string;
  createdAt: string;
  challengerSnapshot: ChallengeFighterSnapshot | null;
  defenderSnapshot: ChallengeFighterSnapshot | null;
}

interface ExpiredWagerChallengeQueryResult {
  // Renamed interface for clarity
  duelChallenges: ExpiredWagerChallenge[];
}

// --- Hook Implementation ---
export function useExpiredWagerChallenges(pageSize = 10) {
  const queryResult = useInfiniteQuery({
    // Use a distinct queryKey
    queryKey: ["expired-wager-challenges", pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Timestamp calculation remains the same (we need the point 7 days ago)
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      // This timestamp is now the *maximum* creation time allowed
      const maxTimestamp = nowInSeconds - sevenDaysInSeconds;

      try {
        const response = await request<ExpiredWagerChallengeQueryResult>(
          SUBGRAPH_URL,
          GET_EXPIRED_WAGER_CHALLENGES, // Use the new query
          {
            limit: pageSize,
            skip: pageParam,
            // Pass the timestamp as maxTimestamp
            maxTimestamp: String(maxTimestamp),
          },
        );
        return response.duelChallenges || [];
      } catch (error) {
        console.error("Error fetching expired wager challenges:", error);
        throw new Error("Failed to fetch expired wager challenges");
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      const currentPageCount = Array.isArray(allPages) ? allPages.length : 0;
      return currentPageCount * pageSize;
    },
    staleTime: 300 * 1000, // 5m (or longer if expired data changes less often)
    refetchInterval: 300 * 1000, // 5m (or longer)
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      challenges: data?.pages.flat() || [],
    }),
  });

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = queryResult;

  return {
    challenges: data?.challenges ?? [], // Keep consistent naming
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
