import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYER_GAUNTLETS_PAGINATED } from "@/lib/gql-queries";
import type { Fighter } from "@/types/fighter-types"; // Assuming Fighter type is generic enough
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";

// --- Inline Type Definitions ---

// Raw Gauntlet structure from Subgraph for this specific hook's query
export interface RawSubgraphGauntletForPlayer {
  id: string;
  size: number; // Comes as number from subgraph
  entryFee: string;
  state: string;
  isPublic?: boolean | null; // Assuming GQL query for player gauntlets can fetch this
  vrfRequestTimestamp: string;
  completionTimestamp: string | null;
  champion: {
    id: string;
    fighterId: string;
    fullName?: string | null;
  } | null;
  prizeAwarded: string;
  feeCollected: string;
  startedAt: string;
  startedTx: string | null; // Ensure type matches schema
  completedAt: string | null;
  completedTx: string | null;
  finalParticipantIds: string[];
  roundWinners: string[] | null;
  gauntletNumericId?: number | null; // If GQL provides it directly
}

// The GauntletParticipant structure from the GQL response
interface RawGauntletParticipant {
  id: string;
  gauntlet: RawSubgraphGauntletForPlayer; // Use the more specific raw type
  player: {
    id: string;
    fighterId: string;
  };
}

// Structure for the raw GQL query result for gauntletParticipants
interface RawGauntletParticipantsQueryResult {
  gauntletParticipants: RawGauntletParticipant[];
}

// Transformed Gauntlet type for UI consumption - THIS IS THE KEY TYPE TO ALIGN
export interface GauntletChronicle {
  id: string;
  gauntletNumericId: number; // Non-optional after processing
  size: 4 | 8 | 16 | 32; // Strict size type
  entryFee: string;
  state: string;
  isPublic?: boolean | null; // Optional
  displayTimestamp: string;
  champion: {
    id: string;
    fighterId: string;
    fullName?: string | null;
  } | null;
  prizeAwarded: string;
  completedTx: string | null;
  finalParticipantIds: string[];
  isCompleted: boolean;
  // Add other fields from RawSubgraphGauntletForPlayer if they are passed through directly
  vrfRequestTimestamp: string;
  completionTimestamp: string | null;
  feeCollected: string;
  startedAt: string;
  startedTx: string | null;
  completedAt: string | null;
  roundWinners: string[] | null;
}

// --- Helper Functions ---

// Helper function to validate and cast gauntlet size
function isValidGauntletSize(size: number): size is 4 | 8 | 16 | 32 {
  return [4, 8, 16, 32].includes(size);
}

function processGauntletData(
  rawGauntlet: RawSubgraphGauntletForPlayer,
): GauntletChronicle | null {
  // Can return null if data is invalid
  const isCompleted = rawGauntlet.state === "COMPLETED";
  const displayTimestamp =
    (isCompleted && rawGauntlet.completionTimestamp) || rawGauntlet.startedAt;

  let numericId = rawGauntlet.gauntletNumericId;
  if (numericId === null || numericId === undefined) {
    const parts = rawGauntlet.id.split("-");
    const numPart = Number.parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(numPart)) {
      numericId = numPart;
    } else {
      console.warn(
        `Could not derive numeric ID for gauntlet: ${rawGauntlet.id}`,
      );
      return null; // Gauntlet is invalid without a numeric ID
    }
  }

  if (!isValidGauntletSize(rawGauntlet.size)) {
    console.warn(
      `Invalid size (${rawGauntlet.size}) for gauntlet: ${rawGauntlet.id}`,
    );
    return null; // Filter out gauntlets with invalid sizes
  }

  // Ensure all properties of GauntletChronicle are mapped
  return {
    // Raw fields that are directly compatible
    id: rawGauntlet.id,
    entryFee: rawGauntlet.entryFee,
    state: rawGauntlet.state,
    champion: rawGauntlet.champion,
    prizeAwarded: rawGauntlet.prizeAwarded,
    completedTx: rawGauntlet.completedTx,
    finalParticipantIds: rawGauntlet.finalParticipantIds,
    vrfRequestTimestamp: rawGauntlet.vrfRequestTimestamp,
    completionTimestamp: rawGauntlet.completionTimestamp,
    feeCollected: rawGauntlet.feeCollected,
    startedAt: rawGauntlet.startedAt,
    startedTx: rawGauntlet.startedTx,
    completedAt: rawGauntlet.completedAt,
    roundWinners: rawGauntlet.roundWinners,

    // Processed/validated fields
    gauntletNumericId: numericId as number, // Cast as it's validated
    size: rawGauntlet.size, // Cast as it's validated by isValidGauntletSize
    isPublic: rawGauntlet.isPublic, // Pass through if exists
    displayTimestamp,
    isCompleted,
  };
}

// --- Hook Implementation ---

export function useRecentGauntlets(playerId?: string, pageSize = 10) {
  const { address: connectedWalletAddress } = useAccount();

  const queryResult = useInfiniteQuery<
    GauntletChronicle[],
    Error,
    InfiniteData<GauntletChronicle[], number>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    any,
    number
  >({
    queryKey: ["recent-gauntlets", playerId, pageSize, connectedWalletAddress],
    queryFn: async ({ pageParam = 0 }) => {
      if (!SUBGRAPH_URL) {
        console.error("Subgraph URL is not configured.");
        throw new Error("Subgraph URL is not configured.");
      }
      if (!playerId) {
        // If no playerId, return an empty array of GauntletChronicle
        // This satisfies the expected return type of Promise<GauntletChronicle[]>
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
        const processedGauntlets: GauntletChronicle[] = rawParticipants
          .map((participant) => processGauntletData(participant.gauntlet))
          .filter((g): g is GauntletChronicle => g !== null);

        processedGauntlets.sort(
          (a, b) => b.gauntletNumericId - a.gauntletNumericId,
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
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
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

  const allGauntlets = data?.pages.flat() || [];
  // The re-sorting of the flattened list can be intensive if the list is very long.
  // If GQL sorts reliably, or if the per-page sort in queryFn is sufficient, this might be optimized.
  // For now, keeping the existing logic for consistent global order.
  const sortedAllGauntlets = [...allGauntlets].sort(
    (a, b) => b.gauntletNumericId - a.gauntletNumericId,
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
