import { SUBGRAPH_URL } from "@/config";
// Use the new GQL query constant
import { GET_EXPIRED_CHALLENGES } from "@/lib/gql-queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

// --- Type Definitions (can reuse or redefine if needed) ---
interface ChallengeFighterSnapshot {
  id: string;
  fullName: string | null;
}

interface ExpiredChallenge {
  // Renamed interface for clarity
  id: string;
  createdAt: string;
  challengerSnapshot: ChallengeFighterSnapshot | null;
  defenderSnapshot: ChallengeFighterSnapshot | null;
}

interface ExpiredChallengeQueryResult {
  // Renamed interface for clarity
  duelChallenges: ExpiredChallenge[];
}

// --- Hook Implementation ---
export function useExpiredChallenges(pageSize = 10) {
  const queryResult = useInfiniteQuery({
    // Use a distinct queryKey
    queryKey: ["expired-challenges", pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Calculate timestamps for the time window
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const threeMonthsInSeconds = 90 * 24 * 60 * 60; // Approximately 3 months
      const nowInSeconds = Math.floor(Date.now() / 1000);

      // maxTimestamp: 7 days ago (challenges older than this are "expired")
      const maxTimestamp = nowInSeconds - sevenDaysInSeconds;
      // minTimestamp: 3 months ago (we don't want challenges older than this)
      const minTimestamp = nowInSeconds - threeMonthsInSeconds;

      try {
        const response = await request<ExpiredChallengeQueryResult>(
          SUBGRAPH_URL,
          GET_EXPIRED_CHALLENGES, // Use the new query
          {
            limit: pageSize,
            skip: pageParam,
            // Pass both timestamps
            maxTimestamp: String(maxTimestamp),
            minTimestamp: String(minTimestamp),
          },
        );
        return response.duelChallenges || [];
      } catch (error) {
        console.error("Error fetching expired challenges:", error);
        throw new Error("Failed to fetch expired challenges");
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
