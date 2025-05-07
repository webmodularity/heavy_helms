import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYER_GAUNTLETS_PAGINATED } from "@/lib/gql-queries";
import type { Fighter } from "@/types/fighter-types"; // Assuming Fighter type is generic enough
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";

// --- Inline Type Definitions ---

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
  const { address: connectedWalletAddress } = useAccount(); // For query key if needed, though playerId is primary

  const queryResult = useInfiniteQuery({
    queryKey: ["recent-gauntlets", playerId, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!SUBGRAPH_URL) {
        console.error("Subgraph URL is not configured.");
        throw new Error("Subgraph URL is not configured.");
      }
      if (!playerId) {
        // console.log("useRecentGauntlets: No playerId provided, returning empty.");
        return []; // Return empty array if no playerId
      }

      try {
        const response = await request<RawGauntletParticipantsQueryResult>(
          SUBGRAPH_URL,
          GET_PLAYER_GAUNTLETS_PAGINATED,
          {
            playerId: playerId.toString(), // Ensure playerId is a string for the query
            limit: pageSize,
            skip: pageParam,
          },
        );

        const rawParticipants = response.gauntletParticipants || [];
        // Extract the gauntlet data and process it
        const processedGauntlets: GauntletChronicle[] = rawParticipants
          .map((participant) => participant.gauntlet)
          .map(processGauntletData)
          // Sort by Gauntlet ID (numeric part) descending after processing
          .sort(
            (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
          );

        return processedGauntlets;
      } catch (error) {
        console.error("Error fetching/processing recent gauntlets:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.reduce((acc, page) => acc + page.length, 0); // Next skip is total items fetched
    },
    enabled: !!playerId, // Only run query if playerId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Keep true for auto-refresh on tab switch
    refetchOnWindowFocus: true,
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

  // Flatten pages and then re-sort the entire flat list to ensure consistent global order
  // This is important because infinite scroll fetches pages, and each page was sorted,
  // but the combined list might not be if not re-sorted here.
  const allGauntlets = data?.pages.flat() || [];
  const sortedAllGauntlets = [...allGauntlets].sort(
    (a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
  );

  return {
    gauntlets: sortedAllGauntlets,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
