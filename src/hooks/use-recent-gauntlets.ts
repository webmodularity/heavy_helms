import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYER_GAUNTLETS_PAGINATED } from "@/lib/gql-queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";

// --- Type Definitions ---

// Raw Gauntlet structure from Subgraph
// (Define based on the fields selected in GET_PLAYER_GAUNTLETS_PAGINATED)
export interface RawSubgraphGauntlet {
  id: string;
  size: number;
  entryFee: string;
  state: string; // "PENDING" | "COMPLETED"
  vrfRequestTimestamp: string;
  completionTimestamp: string | null;
  champion: {
    id: string;
    fighterId: string;
    fullName?: string | null;
    // Add other relevant champion fields
  } | null;
  prizeAwarded: string;
  feeCollected: string;
  startedAt: string;
  startedTx: string;
  completedAt: string | null;
  completedTx: string | null;
  finalParticipantIds: string[];
  roundWinners: string[] | null;
}

// The GauntletParticipant structure from the GQL response
interface RawGauntletParticipant {
  id: string; // Participant ID
  gauntlet: RawSubgraphGauntlet;
  player: {
    id: string; // Player's entity ID (e.g., address or composite)
    fighterId: string; // Player's numerical fighter ID
  };
}

// Structure for the raw GQL query result for gauntletParticipants
interface RawGauntletParticipantsQueryResult {
  gauntletParticipants: RawGauntletParticipant[];
}

// Transformed Gauntlet type for UI consumption (can be expanded)
export interface GauntletChronicle extends RawSubgraphGauntlet {
  // Add any transformed or additional UI-specific fields here if needed
  // For example, formatted dates, derived states, etc.
  isCompleted: boolean;
  displayTimestamp: string; // To show completedAt or startedAt
}

// --- Query Keys ---
const gauntletKeys = {
  all: ["gauntlets"] as const,
  lists: () => [...gauntletKeys.all, "list"] as const,
  list: (filters: { playerId?: string; pageSize: number }) =>
    [...gauntletKeys.lists(), filters] as const,
  infiniteList: (filters: { playerId?: string; pageSize: number }) =>
    [...gauntletKeys.list(filters), "infinite"] as const,
};

// --- Helper Functions ---
function processGauntletData(
  rawGauntlet: RawSubgraphGauntlet,
): GauntletChronicle {
  const isCompleted = rawGauntlet.state === "COMPLETED";
  const displayTimestamp =
    rawGauntlet.completionTimestamp || rawGauntlet.startedAt;

  return {
    ...rawGauntlet,
    isCompleted,
    displayTimestamp,
    // Potentially format more fields here:
    // entryFee: formatEther(BigInt(rawGauntlet.entryFee)),
    // prizeAwarded: formatEther(BigInt(rawGauntlet.prizeAwarded)),
  };
}

// --- Hook Implementation ---

export function useRecentGauntlets(playerId?: string, pageSize = 10) {
  // Build query parameters object for consistent key structure
  const queryParams = {
    playerId: playerId || undefined,
    pageSize,
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: gauntletKeys.infiniteList(queryParams),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      if (!SUBGRAPH_URL) {
        throw new Error("Subgraph URL is not configured.");
      }

      if (!playerId) {
        return [];
      }

      try {
        const response = await request<RawGauntletParticipantsQueryResult>(
          SUBGRAPH_URL,
          GET_PLAYER_GAUNTLETS_PAGINATED,
          {
            playerId: playerId.toString(),
            limit: pageSize,
            skip: pageParam,
          },
        );

        const rawParticipants = response.gauntletParticipants || [];
        // Extract the gauntlet data and process it
        const processedGauntlets: GauntletChronicle[] = rawParticipants
          .map((participant) => participant.gauntlet)
          .map(processGauntletData)
          // Sort by Gauntlet ID (numeric part) descending
          .sort(
            (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
          );

        return processedGauntlets;
      } catch (error) {
        console.error("Error fetching/processing recent gauntlets:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;

      // Calculate total items fetched for correct pagination
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Resort entire dataset after flattening to ensure global sort order
  const gauntlets = data?.pages.flat() || [];
  const sortedGauntlets = [...gauntlets].sort(
    (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
  );

  return {
    gauntlets: sortedGauntlets,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
