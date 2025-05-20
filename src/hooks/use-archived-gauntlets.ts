import { SUBGRAPH_URL } from "@/config";
import { GET_ARCHIVED_GAUNTLETS_PAGINATED } from "@/lib/gql-queries";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import request from "graphql-request";

// RawSubgraphGauntlet represents the direct data from the Gauntlet entity via GQL
export interface RawSubgraphGauntlet {
  id: string;
  size: number; // Matches schema
  entryFee: string; // Subgraph likely returns BigInt as string
  state: "PENDING" | "COMPLETED"; // Matches GauntletState enum
  vrfRequestTimestamp: string; // BigInt as string
  completionTimestamp: string | null; // BigInt as string or null
  champion: {
    id: string;
    fighterId: string; // Ensure GQL fragment selects this from Fighter
    fullName?: string | null;
  } | null;
  prizeAwarded: string; // BigInt as string
  feeCollected: string; // BigInt as string
  startedAt: string; // BigInt as string
  startedTx: string; // Bytes as string
  completedAt: string | null; // BigInt as string or null
  completedTx: string | null; // Bytes as string or null
  finalParticipantIds: string[];
  roundWinners: string[] | null;
  // gauntletNumericId is NOT fetched, will be derived
  // isPublic is NOT fetched
}

// GauntletChronicle will be the processed type for UI
export interface GauntletChronicle {
  id: string;
  gauntletNumericId: number; // Derived and non-optional
  size: 4 | 8 | 16 | 32; // Validated
  entryFee: string;
  state: "PENDING" | "COMPLETED";
  isPublic?: boolean | null; // Kept optional in UI type, will be undefined/null if not derivable
  displayTimestamp: string;
  champion: {
    id: string;
    fighterId: string;
    fullName?: string | null;
  } | null;
  prizeAwarded: string;
  completedTx: string | null; // For GauntletAccordionItem
  finalParticipantIds: string[];
  isCompleted: boolean;
  // Pass through other relevant fields from RawSubgraphGauntlet if needed by GauntletAccordionItem
  vrfRequestTimestamp: string;
  completionTimestamp: string | null;
  feeCollected: string;
  startedAt: string;
  startedTx: string;
  completedAt: string | null;
  roundWinners: string[] | null;
}

interface RawArchivedGauntletsQueryResult {
  gauntlets: RawSubgraphGauntlet[];
}

function isValidGauntletSize(size: number): size is 4 | 8 | 16 | 32 {
  return [4, 8, 16, 32].includes(size);
}

function processArchivedGauntletData(
  rawGauntlet: RawSubgraphGauntlet,
): GauntletChronicle | null {
  // Changed return type to include null for invalid data
  const isCompleted = rawGauntlet.state === "COMPLETED";
  const displayTimestamp =
    (isCompleted && rawGauntlet.completionTimestamp) || rawGauntlet.startedAt;

  let numericId: number | undefined;
  const parts = rawGauntlet.id.split("-");
  const numPart = Number.parseInt(parts[parts.length - 1], 10);
  if (!Number.isNaN(numPart)) {
    numericId = numPart;
  } else {
    console.warn(`Could not derive numeric ID for gauntlet: ${rawGauntlet.id}`);
    return null; // Invalid data if numericId cannot be derived
  }

  if (!isValidGauntletSize(rawGauntlet.size)) {
    console.warn(
      `Invalid size (${rawGauntlet.size}) for gauntlet: ${rawGauntlet.id}`,
    );
    return null; // Invalid data
  }

  return {
    ...rawGauntlet, // Spread all fields from RawSubgraphGauntlet
    isCompleted,
    displayTimestamp,
    gauntletNumericId: numericId, // numericId is now guaranteed to be a number
    size: rawGauntlet.size, // size is now validated to be 4 | 8 | 16 | 32
    isPublic: undefined, // Explicitly set to undefined as it's not in the schema
  };
}

export function useArchivedGauntlets(pageSize = 10) {
  const queryResult = useInfiniteQuery<
    GauntletChronicle[],
    Error,
    InfiniteData<GauntletChronicle[], number>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    any,
    number
  >({
    queryKey: ["archived-gauntlets", pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!SUBGRAPH_URL) {
        console.error("Subgraph URL is not configured.");
        throw new Error("Subgraph URL is not configured.");
      }

      try {
        const response = await request<RawArchivedGauntletsQueryResult>(
          SUBGRAPH_URL,
          GET_ARCHIVED_GAUNTLETS_PAGINATED,
          {
            limit: pageSize,
            skip: pageParam,
          },
        );

        const rawGauntlets = response.gauntlets || [];
        const processedGauntlets: GauntletChronicle[] = rawGauntlets
          .map(processArchivedGauntletData)
          .filter((g): g is GauntletChronicle => g !== null); // Filter out nulls

        return processedGauntlets;
      } catch (error) {
        console.error("Error fetching/processing archived gauntlets:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
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

  return {
    gauntlets: allGauntlets,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
