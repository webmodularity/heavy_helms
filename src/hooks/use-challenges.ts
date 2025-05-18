import { SUBGRAPH_URL } from "@/config";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { request } from "graphql-request";
import {
  GET_FIGHTER_CHALLENGES_PAGINATED,
  GET_ALL_OPEN_CHALLENGES,
} from "@/lib/gql-queries";
import { useAccount } from "wagmi";
import type {
  StanceType,
  ArmorType,
  WeaponType,
} from "@/types/equipment.types";

// GraphQL response type
export interface SubgraphChallenge {
  id: string;
  wagerAmount: string;
  state: string;
  createdAt: string;
  challengerOwner: string;
  defenderOwner: string;
  challengerSnapshot: {
    fighterId: string;
    fighterType: string;
    firstName?: string;
    surname?: string;
    fullName?: string;
    currentSkin: {
      weapon: WeaponType;
      armor: ArmorType;
    };
    stance: StanceType;
  };
  defenderSnapshot: {
    fighterId: string;
    fighterType: string;
    firstName?: string;
    surname?: string;
    fullName?: string;
    currentSkin: {
      weapon: WeaponType;
      armor: ArmorType;
    };
    stance: StanceType;
  };
}

export interface GraphQLResponse {
  sentChallenges: SubgraphChallenge[];
  receivedChallenges: SubgraphChallenge[];
  duelChallenges?: SubgraphChallenge[];
}

// Keep the existing Challenge interface
export interface Challenge {
  id: bigint;
  challengerId: number;
  defenderId: number;
  wagerAmount: bigint;
  createdBlock: bigint;
  fulfilled: boolean;
  challengerLoadout: {
    playerId: number;
    armor: ArmorType;
    weapon: WeaponType;
    stance: StanceType;
  };
  defenderLoadout: {
    playerId: number;
    armor: ArmorType;
    weapon: WeaponType;
    stance: StanceType;
  };
  challengerName: string;
  defenderName: string;
  isSentByMe: boolean;
}

// Query key factory
const challengeKeys = {
  all: ["challenges"] as const,
  lists: () => [...challengeKeys.all, "list"] as const,
  list: (filters: {
    address?: string;
    fighterId?: string | null;
    pageSize: number;
  }) => [...challengeKeys.lists(), filters] as const,
  infiniteList: (filters: {
    address?: string;
    fighterId?: string | null;
    pageSize: number;
  }) => [...challengeKeys.list(filters), "infinite"] as const,
};

// Helper function to process challenge data consistently
function processChallenges(
  challenges: SubgraphChallenge[],
  isSentByMe: boolean,
): Challenge[] {
  return challenges.map((challenge) => {
    const challengerName =
      challenge.challengerSnapshot.fullName ||
      `${challenge.challengerSnapshot.firstName || ""} ${challenge.challengerSnapshot.surname || ""}`.trim() ||
      `Fighter #${challenge.challengerSnapshot.fighterId}`;

    const defenderName =
      challenge.defenderSnapshot.fullName ||
      `${challenge.defenderSnapshot.firstName || ""} ${challenge.defenderSnapshot.surname || ""}`.trim() ||
      `Fighter #${challenge.defenderSnapshot.fighterId}`;

    return {
      id: BigInt(challenge.id),
      challengerId: Number(challenge.challengerSnapshot.fighterId),
      defenderId: Number(challenge.defenderSnapshot.fighterId),
      wagerAmount: BigInt(challenge.wagerAmount),
      createdBlock: BigInt(challenge.createdAt),
      fulfilled: challenge.state !== "OPEN",
      challengerLoadout: {
        playerId: Number(challenge.challengerSnapshot.fighterId),
        armor: challenge.challengerSnapshot.currentSkin.armor,
        weapon: challenge.challengerSnapshot.currentSkin.weapon,
        stance: challenge.challengerSnapshot.stance,
      },
      defenderLoadout: {
        playerId: Number(challenge.defenderSnapshot.fighterId),
        armor: challenge.defenderSnapshot.currentSkin.armor,
        weapon: challenge.defenderSnapshot.currentSkin.weapon,
        stance: challenge.defenderSnapshot.stance,
      },
      challengerName,
      defenderName,
      isSentByMe,
    };
  });
}

// --- Hook for Fighter-Specific Challenges ---
const fighterChallengeKeys = {
  all: (fighterId: string | null) => ["fighterChallenges", fighterId] as const,
  infiniteList: (
    fighterId: string | null,
    address: string | undefined,
    pageSize: number,
  ) =>
    [...fighterChallengeKeys.all(fighterId), address, pageSize, "infinite"] as const,
};

export function useFighterChallenges(
  fighterId: string | null,
  pageSize = 10,
) {
  const { isConnected, address } = useAccount();

  const queryParams = {
    address: address || undefined,
    fighterId,
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
    queryKey: fighterChallengeKeys.infiniteList(
      fighterId,
      queryParams.address,
      pageSize,
    ),
    queryFn: async ({ pageParam = 0 }) => {
      // This function will only be called if fighterId is not null due to 'enabled' option
      // and isConnected & address are valid.
      try {
        const responseData = await request<GraphQLResponse>(
          SUBGRAPH_URL,
          GET_FIGHTER_CHALLENGES_PAGINATED,
          {
            fighterId, // fighterId is guaranteed to be non-null here
            limit: pageSize,
            skip: pageParam,
          },
        );
        return responseData;
      } catch (err) {
        console.error(
          "Error fetching fighter-specific challenges from subgraph:",
          err,
        );
        throw err;
      }
    },
    enabled: isConnected && !!fighterId && !!address, // Only enable if fighterId and address are present
    initialPageParam: 0,
    select: (fetchedData: InfiniteData<GraphQLResponse>) => {
      return fetchedData.pages.map((page) => {
        const sentChallenges = processChallenges(
          page.sentChallenges || [],
          true,
        );
        const receivedChallenges = processChallenges(
          page.receivedChallenges || [],
          false,
        );
        // For fighter-specific challenges, we combine sent and received
        return [...sentChallenges, ...receivedChallenges];
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const combinedChallenges = [
        ...(lastPage.sentChallenges || []),
        ...(lastPage.receivedChallenges || []),
      ];
      if (combinedChallenges.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const challenges = data?.flat() || [];

  return {
    challenges,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}

// --- Hook for All Open Challenges ---
const allOpenChallengeKeys = {
  all: () => ["allOpenChallenges"] as const,
  infiniteList: (address: string | undefined, pageSize: number) =>
    [...allOpenChallengeKeys.all(), address, pageSize, "infinite"] as const,
};

export function useAllOpenChallenges(pageSize = 10) {
  const { isConnected, address } = useAccount();

  const queryParams = {
    address: address || undefined,
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
    queryKey: allOpenChallengeKeys.infiniteList(
      queryParams.address,
      pageSize,
    ),
    queryFn: async ({ pageParam = 0 }) => {
      // This function will only be called if isConnected & address are valid due to 'enabled' option.
      try {
        const responseData = await request<GraphQLResponse>(
          SUBGRAPH_URL,
          GET_ALL_OPEN_CHALLENGES,
          {
            limit: pageSize,
            skip: pageParam,
          },
        );
        return responseData;
      } catch (err) {
        console.error("Error fetching all open challenges from subgraph:", err);
        throw err;
      }
    },
    enabled: isConnected && !!address, // Only enable if user is connected and address is present
    initialPageParam: 0,
    select: (fetchedData: InfiniteData<GraphQLResponse>) => {
      return fetchedData.pages.map((page) => {
        // For all open challenges, we process duelChallenges (as per original logic)
        return [...processChallenges(page.duelChallenges || [], false)];
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const combinedChallenges = [...(lastPage.duelChallenges || [])];
      if (combinedChallenges.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const challenges = data?.flat() || [];

  return {
    challenges,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
}
