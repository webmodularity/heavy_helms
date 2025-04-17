import { SUBGRAPH_URL } from "@/config";
import { GET_OPEN_WAGER_CHALLENGES } from "@/lib/gql-queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

// --- Inline Type Definitions ---

// Define the structure for a single challenge based on the GQL query
interface ChallengeFighterSnapshot {
  id: string;
  fullName: string | null; // Subgraph might return null
}

interface OpenWagerChallenge {
  id: string;
  wagerAmount: string; // Subgraph typically returns BigInt as string
  createdAt: string; // Timestamp as string
  challengerSnapshot: ChallengeFighterSnapshot | null; // Snapshot could be null
  defenderSnapshot: ChallengeFighterSnapshot | null; // Snapshot could be null
}

// Define the structure for the overall query result
interface OpenWagerChallengeQueryResult {
  duelChallenges: OpenWagerChallenge[];
}

// --- Hook Implementation ---

export function useOpenWagerChallenges(pageSize = 10) {
  const queryResult = useInfiniteQuery({
    queryKey: ["open-wager-challenges", pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Calculate timestamp for 7 days ago (in seconds)
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const minTimestamp = nowInSeconds - sevenDaysInSeconds;

      try {
        const response = await request<OpenWagerChallengeQueryResult>(
          SUBGRAPH_URL,
          GET_OPEN_WAGER_CHALLENGES,
          {
            limit: pageSize,
            skip: pageParam,
            // Pass the calculated timestamp as a string for BigInt variable
            minTimestamp: String(minTimestamp),
          },
        );
        return response.duelChallenges || [];
      } catch (error) {
        console.error("Error fetching open wager challenges:", error);
        // Consider throwing a more specific error or handling differently
        throw new Error("Failed to fetch open wager challenges");
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Optional chaining for safety
      if (!lastPage || lastPage.length < pageSize) return undefined;
      // Ensure allPages is defined and is an array
      const currentPageCount = Array.isArray(allPages) ? allPages.length : 0;
      return currentPageCount * pageSize;
    },
    staleTime: 300 * 1000, // 5m
    refetchInterval: 300 * 1000, // 5m
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
    challenges: data?.challenges ?? [],
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
