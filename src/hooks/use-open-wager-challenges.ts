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
      try {
        // Now uses the inline types
        const response = await request<OpenWagerChallengeQueryResult>(
          SUBGRAPH_URL,
          GET_OPEN_WAGER_CHALLENGES,
          {
            limit: pageSize,
            skip: pageParam,
          },
        );
        return response.duelChallenges || [];
      } catch (error) {
        console.error("Error fetching open wager challenges:", error);
        throw error; // Re-throw for react-query error handling
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 300 * 1000, // 5m
    refetchInterval: 300 * 1000, // 5m
    select: (data) => ({
      // Flatten pages for easier access
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
