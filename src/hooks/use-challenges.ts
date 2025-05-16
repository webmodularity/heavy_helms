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

interface GraphQLResponse {
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
  list: (filters: { address?: string; fighterId?: string; pageSize: number }) =>
    [...challengeKeys.lists(), filters] as const,
  infiniteList: (filters: {
    address?: string;
    fighterId?: string;
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

export function useChallenges(fighterId?: string, pageSize = 10) {
  const { isConnected, address } = useAccount();

  // Build query parameters object for consistent key structure
  const queryParams = {
    address: address || undefined,
    fighterId: fighterId || undefined,
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
    queryKey: challengeKeys.infiniteList(queryParams),
    queryFn: async ({ pageParam = 0 }) => {
      // Don't fetch if not authenticated
      if (!isConnected) {
        return {
          sentChallenges: [],
          receivedChallenges: [],
          duelChallenges: [],
        };
      }

      // Ensure we have either a fighter ID or wallet address
      if (!fighterId && !address) {
        return {
          sentChallenges: [],
          receivedChallenges: [],
          duelChallenges: [],
        };
      }

      try {
        let data: GraphQLResponse;

        // Use fighter-specific query if fighterId is provided
        data = fighterId
          ? await request<GraphQLResponse>(
              SUBGRAPH_URL,
              GET_FIGHTER_CHALLENGES_PAGINATED,
              {
                fighterId,
                limit: pageSize,
                skip: pageParam,
              },
            )
          : await request<GraphQLResponse>(
              SUBGRAPH_URL,
              GET_ALL_OPEN_CHALLENGES,
              {
                limit: pageSize,
                skip: pageParam,
              },
            );

        // Return the raw GraphQL data for transformation with select
        return data;
      } catch (error) {
        console.error("Error fetching challenges from subgraph:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    select: (data: InfiniteData<GraphQLResponse>) => {
      // Transform data after it's fetched
      return data.pages.map((page) => {
        const sentChallenges = processChallenges(
          page.sentChallenges || [],
          true,
        );
        const receivedChallenges = processChallenges(
          page.receivedChallenges || [],
          false,
        );

        return fighterId
          ? [...sentChallenges, ...receivedChallenges]
          : [...processChallenges(page.duelChallenges || [], false)];
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer items than requested, we've reached the end
      const combinedChallenges = [
        ...(lastPage.sentChallenges || []),
        ...(lastPage.receivedChallenges || []),
        ...(lastPage.duelChallenges || []),
      ];

      if (combinedChallenges.length < pageSize) return undefined;

      // Otherwise, calculate the next offset
      return allPages.length * pageSize;
    },
    enabled: isConnected && (!!fighterId || !!address),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Flatten pages of data for easier consumption
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
