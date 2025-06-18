import { SUBGRAPH_URL } from "@/config";
import { GET_OPEN_CHALLENGES } from "@/lib/gql-queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

// --- Inline Type Definitions ---

// Define the structure for a single challenge based on the GQL query
interface ChallengeFighterSnapshot {
  id: string;
  fullName: string | null; // Subgraph might return null
}

interface OpenChallenge {
  id: string;
  createdAt: string; // Timestamp as string
  challengerSnapshot: ChallengeFighterSnapshot | null; // Snapshot could be null
  defenderSnapshot: ChallengeFighterSnapshot | null; // Snapshot could be null
}

// Define the structure for the overall query result
interface OpenChallengeQueryResult {
  duelChallenges: OpenChallenge[];
}

// --- Hook Implementation ---

export function useOpenChallenges(pageSize = 10) {
  const queryResult = useInfiniteQuery({
    queryKey: ["open-challenges", pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await request<OpenChallengeQueryResult>(
          SUBGRAPH_URL,
          GET_OPEN_CHALLENGES,
          {
            limit: pageSize,
            skip: pageParam,
          },
        );
        return response.duelChallenges || [];
      } catch (error) {
        console.error("Error fetching open challenges:", error);
        throw new Error("Failed to fetch open challenges");
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
