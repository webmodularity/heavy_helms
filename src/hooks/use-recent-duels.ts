import { SUBGRAPH_URL } from "@/config";
import { GET_ALL_DUELS, GET_PLAYER_DUELS } from "@/lib/gql-queries";
import type { Duel } from "@/types/game.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";
import { createPlayerSkin } from "@/lib/player-api";
import type { Fighter } from "@/types/fighter-types";

// --- Inline Type Definitions ---

// Raw skin data structure as returned by GQL before processing
interface RawCurrentSkinData {
  collection: {
    id: string;
    contractAddress: string;
    isVerified: boolean;
    skinType: number;
    requiredNFTAddress?: string | null; // Keep optionality
  };
  tokenId: number;
  metadataURI: string;
  weapon: number; // Assuming these are numbers before mapping to WeaponType/ArmorType
  armor: number;
}

// Raw Fighter structure containing the raw skin data
interface RawFighterSnapshot extends Omit<Fighter, "currentSkin"> {
  // Reuse Fighter fields but override skin
  currentSkin: RawCurrentSkinData | null;
}

// Raw Duel structure before skin processing (without combat result)
interface RawDuel extends Omit<Duel, "challenge" | "combatResult"> {
  // Reuse Duel fields but override challenge structure
  // Note: id field IS the transaction hash for DuelComplete events
  challenge: Omit<
    Duel["challenge"],
    "challengerSnapshot" | "defenderSnapshot"
  > & {
    challengerSnapshot: RawFighterSnapshot | null;
    defenderSnapshot: RawFighterSnapshot | null;
  };
}

// Structure for the raw GQL query result
interface RawDuelCompleteQueryResult {
  duelCompletes: RawDuel[];
}

// --- Helper Functions ---

// processFighterSkin remains the same, processing RawFighterSnapshot into Fighter
async function processFighterSkin(
  fighter: RawFighterSnapshot | null,
): Promise<Fighter | null> {
  if (!fighter?.currentSkin) {
    // If there's no raw skin data, return the fighter as is (or with a default skin structure if needed)
    // This assumes the Fighter type can handle a nullish/default skin
    return fighter as Fighter | null;
  }
  // Type assertion for the raw skin data being passed to createPlayerSkin
  const rawSkin = fighter.currentSkin as Parameters<typeof createPlayerSkin>[0];

  if (!rawSkin.metadataURI) {
    console.warn(`Fighter ${fighter.id} skin missing metadataURI`);
    // Return fighter cast to Fighter type with a default image URL added
    return {
      ...fighter,
      currentSkin: { ...rawSkin, imageURL: DEFAULT_IMAGE_URL }, // Add default URL to raw data temporarily
    } as unknown as Fighter; // Needs careful casting or type adjustment
  }

  try {
    const processedSkin = await createPlayerSkin(rawSkin);
    // Return the fighter structure with the fully processed Skin object
    return {
      ...fighter,
      currentSkin: processedSkin,
    } as Fighter; // Cast to the final Fighter type
  } catch (error) {
    console.error(`Error processing skin for fighter ${fighter.id}:`, error);
    // Return fighter cast to Fighter type with a default image URL added
    return {
      ...fighter,
      currentSkin: { ...rawSkin, imageURL: DEFAULT_IMAGE_URL },
    } as unknown as Fighter; // Needs careful casting or type adjustment
  }
}

// processDuelSkins now takes RawDuel and returns Duel (without combat result)
async function processDuelSkins(duel: RawDuel): Promise<Duel> {
  const processedChallenger = await processFighterSkin(
    duel.challenge.challengerSnapshot,
  );
  const processedDefender = await processFighterSkin(
    duel.challenge.defenderSnapshot,
  );

  // Construct the final Duel object with processed snapshots (no combat result)
  return {
    ...duel, // Spread the base properties of RawDuel
    challenge: {
      ...duel.challenge, // Spread the base challenge properties
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      challengerSnapshot: processedChallenger!, // Assert non-null if logic guarantees it
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      defenderSnapshot: processedDefender!, // Assert non-null if logic guarantees it
    },
    // No combatResult field - will be undefined by default
  } as Duel; // Cast the final result to the Duel type
}

// --- Hook Implementation ---

export function useRecentDuels(playerId?: string | number, pageSize = 10) {
  const { address } = useAccount();

  const queryResult = useInfiniteQuery({
    queryKey: playerId
      ? ["recent-duels", address, playerId, pageSize]
      : ["recent-duels", address, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const query = playerId ? GET_PLAYER_DUELS : GET_ALL_DUELS;
        const variables = playerId
          ? { limit: pageSize, skip: pageParam, playerId: playerId.toString() }
          : { limit: pageSize, skip: pageParam };

        // Fetch using the Raw query result type
        const response = await request<RawDuelCompleteQueryResult>(
          SUBGRAPH_URL,
          query,
          variables,
        );

        const rawDuels = response.duelCompletes || [];

        // Process raw duels into final Duel type (without combat results)
        const processedDuels: Duel[] = await Promise.all(
          rawDuels.map(processDuelSkins),
        );

        return processedDuels; // Return the array of fully processed Duels
      } catch (error) {
        console.error("Error fetching/processing recent duels:", error);
        throw error; // Re-throw to be handled by react-query
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // lastPage is now Duel[]
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 300 * 1000, // 5m
    refetchInterval: 300 * 1000, // 5m
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // Flattened data is now Duel[]
      duels: data?.pages.flat() || [],
    }),
  });

  // Extract data using the structure defined in 'select'
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

  // Ensure the returned type matches the processed Duel structure
  return {
    duels: data?.duels ?? [],
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}

// Add default constants if not already defined elsewhere
const DEFAULT_IMAGE_URL = "/path/to/default/image.png"; // FIXME: Update with your actual default image path
