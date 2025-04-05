import { SUBGRAPH_URL } from "@/config";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_USER_CHALLENGES, GET_FIGHTER_CHALLENGES } from "@/lib/gql-queries";
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

export function useChallenges(fighterId?: string) {
  const { authenticated } = usePrivy();

  const { address } = useAccount();
  // Fetch active challenges
  const {
    data: challenges,
    isLoading,
    error,
    refetch,
  } = useQuery({
    // Query key includes fighterId if provided
    queryKey: fighterId
      ? ["fighter-challenges", fighterId]
      : ["active-challenges", address],
    queryFn: async () => {
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
        if (fighterId) {
          data = await request<GraphQLResponse>(
            SUBGRAPH_URL,
            GET_FIGHTER_CHALLENGES,
            { fighterId },
          );
        } else {
          // Otherwise fall back to wallet-level query
          data = await request<GraphQLResponse>(
            SUBGRAPH_URL,
            GET_USER_CHALLENGES,
            { userAddress: address },
          );
        }

        // Process sent challenges
        const sentChallenges = (data.sentChallenges || []).map((challenge) => {
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
            isSentByMe: true,
          };
        });

        // Process received challenges with the same structure
        const receivedChallenges = (data.receivedChallenges || []).map(
          (challenge) => {
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
                weapon: challenge.challenger.currentSkin.weapon,
                armor: challenge.challenger.currentSkin.armor,
                stance: challenge.challenger.stance,
              },
              defenderLoadout: {
                playerId: Number(challenge.defender.id),
                weapon: challenge.defender.currentSkin.weapon,
                armor: challenge.defender.currentSkin.armor,
                stance: challenge.defender.stance,
              },
              challengerName,
              defenderName,
              isSentByMe: false,
            };
          },
        );

        // Combine both types of challenges
        return [...sentChallenges, ...receivedChallenges];
      } catch (error) {
        console.error("Error fetching challenges from subgraph:", error);
        throw error;
      }
    },
    enabled: authenticated && (!!fighterId || !!address),
    staleTime: 30 * 1000, // 30s stale time
    refetchInterval: 300 * 1000, // 5m refetch interval
  });

  return {
    challenges: challenges || [],
    isLoading,
    error,
    refetch,
  };
}
