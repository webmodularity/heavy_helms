import { SUBGRAPH_URL } from "@/config";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import {
  GET_USER_CHALLENGES,
  GET_FIGHTER_CHALLENGES,
  GET_FIGHTER_CHALLENGES_PAGINATED,
  GET_USER_CHALLENGES_PAGINATED,
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
  challenger: {
    id: string;
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
  defender: {
    id: string;
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

export function useChallenges(fighterId: string, pageSize = 9) {
  const { authenticated } = usePrivy();
  const { address } = useAccount();
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 0,

    queryKey:
      // ? ["fighter-challenges", fighterId]
      ["active-challenges", address, fighterId],
    queryFn: async ({ pageParam = 0 }) => {
      // Don't fetch if not authenticated
      if (!authenticated) {
        return [];
      }

      // Ensure we have either a fighter ID or wallet address
      if (!fighterId && !address) {
        return [];
      }

      try {
        let data: GraphQLResponse;

        // Use fighter-specific query if fighterId is provided
        data = await request<GraphQLResponse>(
          SUBGRAPH_URL,
          GET_FIGHTER_CHALLENGES_PAGINATED,
          {
            fighterId,
            limit: pageSize,
            skip: pageParam,
          },
        );

        // Process challenges as you do currently
        const sentChallenges = processChallenges(
          data.sentChallenges || [],
          true,
        );
        const receivedChallenges = processChallenges(
          data.receivedChallenges || [],
          false,
        );

        // Return combined challenges for this page
        return [...sentChallenges, ...receivedChallenges];
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
    enabled: authenticated && (!!fighterId || !!address),
    staleTime: 300 * 1000, // 30s stale time
    refetchInterval: 300 * 1000, // 5m refetch interval
  });

  // Helper function to process challenge data consistently
  function processChallenges(
    challenges: SubgraphChallenge[],
    isSentByMe: boolean,
  ) {
    return challenges.map((challenge) => {
      const challengerName =
        challenge.challenger.fullName ||
        `${challenge.challenger.firstName || ""} ${challenge.challenger.surname || ""}`.trim() ||
        `Fighter #${challenge.challenger.id}`;

      const defenderName =
        challenge.defender.fullName ||
        `${challenge.defender.firstName || ""} ${challenge.defender.surname || ""}`.trim() ||
        `Fighter #${challenge.defender.id}`;

      return {
        id: BigInt(challenge.id),
        challengerId: Number(challenge.challenger.id),
        defenderId: Number(challenge.defender.id),
        wagerAmount: BigInt(challenge.wagerAmount),
        createdBlock: BigInt(challenge.createdAt),
        fulfilled: challenge.state !== "OPEN",
        challengerLoadout: {
          playerId: Number(challenge.challenger.id),
          armor: challenge.challenger.currentSkin.armor,
          weapon: challenge.challenger.currentSkin.weapon,
          stance: challenge.challenger.stance,
        },
        defenderLoadout: {
          playerId: Number(challenge.defender.id),
          armor: challenge.defender.currentSkin.armor,
          weapon: challenge.defender.currentSkin.weapon,
          stance: challenge.defender.stance,
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
  };
}
