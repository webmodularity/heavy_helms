import { SUBGRAPH_URL } from "@/config";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import {
  GET_USER_CHALLENGES,
  GET_FIGHTER_CHALLENGES,
  GET_FIGHTER_CHALLENGES_PAGINATED,
  GET_USER_CHALLENGES_PAGINATED,
  GET_ALL_OPEN_CHALLENGES,
} from "@/lib/gql-queries";
import { useAccount } from "wagmi";
import type { StanceType } from "@/types/equipment.types";
import type { ArmorType } from "@/types/equipment.types";
import type { WeaponType } from "@/types/equipment.types";

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

export function useChallenges(fighterId?: string, pageSize = 10) {
  const { isConnected } = useAccount();
  const { address } = useAccount();
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
    initialPageParam: 0,

    queryKey:
      // ? ["fighter-challenges", fighterId]
      fighterId
        ? ["active-challenges", address, fighterId, pageSize]
        : ["active-challenges", address, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Don't fetch if not authenticated
      if (!isConnected) {
        return [];
      }

      // Ensure we have either a fighter ID or wallet address
      if (!fighterId && !address) {
        return [];
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
        const sentChallenges = processChallenges(
          data.sentChallenges || [],
          true,
        );
        const receivedChallenges = processChallenges(
          data.receivedChallenges || [],
          false,
        );
        // Return combined challenges for this page
        return fighterId
          ? [...sentChallenges, ...receivedChallenges]
          : [...processChallenges(data.duelChallenges || [], false)];
      } catch (error) {
        console.error("Error fetching challenges from subgraph:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer items than requested, we've reached the end
      if (lastPage.length < pageSize) return undefined;

      // Otherwise, calculate the next offset
      return allPages.length * pageSize;
    },
    // enabled: !!fighterId && !!address,
    refetchInterval: 300 * 1000, // 5m refetch interval
  });

  // Helper function to process challenge data consistently
  function processChallenges(
    challenges: SubgraphChallenge[],
    isSentByMe: boolean,
  ) {
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

  // Flatten pages of data
  const challenges = data?.pages.flat() || [];

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
