import { SUBGRAPH_URL } from "@/config";
import { GET_ALL_DUELS, GET_PLAYER_DUELS } from "@/lib/gql-queries";
import type { Duel } from "@/types/game.types";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import request from "graphql-request";
import { useAccount } from "wagmi";
import { createPlayerSkin } from "@/lib/player-api";
import type { Fighter } from "@/types/fighter-types";

// --- Type Definitions ---
interface RawCurrentSkinData {
  collection: {
    id: string;
    contractAddress: string;
    isVerified: boolean;
    skinType: number;
    requiredNFTAddress?: string | null;
  };
  tokenId: number;
  metadataURI: string;
  weapon: number;
  armor: number;
}

interface RawFighterSnapshot extends Omit<Fighter, "currentSkin"> {
  currentSkin: RawCurrentSkinData | null;
}

interface RawDuel extends Omit<Duel, "challenge"> {
  challenge: Omit<
    Duel["challenge"],
    "challengerSnapshot" | "defenderSnapshot"
  > & {
    challengerSnapshot: RawFighterSnapshot | null;
    defenderSnapshot: RawFighterSnapshot | null;
  };
}

interface RawDuelCompleteQueryResult {
  duelCompletes: RawDuel[];
}

// --- Query Keys ---
const duelKeys = {
  all: ["duels"] as const,
  lists: () => [...duelKeys.all, "list"] as const,
  list: (filters: {
    address?: string;
    playerId?: string | number;
    pageSize: number;
  }) => [...duelKeys.lists(), filters] as const,
  infiniteList: (filters: {
    address?: string;
    playerId?: string | number;
    pageSize: number;
  }) => [...duelKeys.list(filters), "infinite"] as const,
};

// --- Helper Functions ---
const DEFAULT_IMAGE_URL = "/images/default-fighter.png";

async function processFighterSkin(
  fighter: RawFighterSnapshot | null,
): Promise<Fighter | null> {
  if (!fighter?.currentSkin) {
    return fighter as Fighter | null;
  }

  const rawSkin = fighter.currentSkin as Parameters<typeof createPlayerSkin>[0];

  if (!rawSkin.metadataURI) {
    console.warn(`Fighter ${fighter.id} skin missing metadataURI`);
    return {
      ...fighter,
      currentSkin: { ...rawSkin, imageURL: DEFAULT_IMAGE_URL },
    } as unknown as Fighter;
  }

  try {
    const processedSkin = await createPlayerSkin(rawSkin);
    return {
      ...fighter,
      currentSkin: processedSkin,
    } as Fighter;
  } catch (error) {
    console.error(`Error processing skin for fighter ${fighter.id}:`, error);
    return {
      ...fighter,
      currentSkin: { ...rawSkin, imageURL: DEFAULT_IMAGE_URL },
    } as unknown as Fighter;
  }
}

async function processDuelSkins(duel: RawDuel): Promise<Duel> {
  const processedChallenger = await processFighterSkin(
    duel.challenge.challengerSnapshot,
  );
  const processedDefender = await processFighterSkin(
    duel.challenge.defenderSnapshot,
  );

  return {
    ...duel,
    challenge: {
      ...duel.challenge,
      challengerSnapshot: processedChallenger,
      defenderSnapshot: processedDefender,
    },
  } as Duel;
}

// --- Hook Implementation ---
export function useRecentDuels(playerId?: string | number, pageSize = 10) {
  const { address } = useAccount();

  // Build query parameters object for consistent key structure
  const queryParams = {
    address: address || undefined,
    playerId: playerId !== undefined ? playerId : undefined,
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
    queryKey: duelKeys.infiniteList(queryParams),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const query = playerId ? GET_PLAYER_DUELS : GET_ALL_DUELS;
        const variables = playerId
          ? { limit: pageSize, skip: pageParam, playerId: playerId.toString() }
          : { limit: pageSize, skip: pageParam };

        const response = await request<RawDuelCompleteQueryResult>(
          SUBGRAPH_URL,
          query,
          variables,
        );

        // Process the duels here inside queryFn, not in select
        const rawDuels = response.duelCompletes || [];
        const processedDuels = await Promise.all(rawDuels.map(processDuelSkins));
        
        return processedDuels;
      } catch (error) {
        console.error("Error fetching recent duels:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes refetch interval
    refetchOnWindowFocus: true,
  });

  // Now data.pages will be Duel[][], not a Promise
  const duels = data?.pages.flat() || [];

  return {
    duels,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
