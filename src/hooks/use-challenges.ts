import { SUBGRAPH_URL } from "@/config";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_USER_CHALLENGES, GET_FIGHTER_CHALLENGES } from "@/lib/gql-queries";
import { useAccount } from "wagmi";

// GraphQL response type
interface SubgraphChallenge {
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
  };
  defender: {
    id: string;
    fighterType: string;
    firstName?: string;
    surname?: string;
    fullName?: string;
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
    skin: {
      skinIndex: number;
      skinTokenId: number;
    };
    stance: number;
  };
  defenderLoadout: {
    playerId: number;
    skin: {
      skinIndex: number;
      tokenId: number;
    };
    stance: number;
  };
  // Add new fields
  challengerName?: string;
  defenderName?: string;
  isSentByMe?: boolean;
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
              skin: {
                skinIndex: 0,
                skinTokenId: 0,
              },
              stance: 0,
            },
            defenderLoadout: {
              playerId: Number(challenge.defender.id),
              skin: {
                skinIndex: 0,
                tokenId: 0,
              },
              stance: 0,
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
                skin: {
                  skinIndex: 0,
                  skinTokenId: 0,
                },
                stance: 0,
              },
              defenderLoadout: {
                playerId: Number(challenge.defender.id),
                skin: {
                  skinIndex: 0,
                  tokenId: 0,
                },
                stance: 0,
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
  });

  return {
    challenges: challenges || [],
    isLoading,
    error,
    refetch,
  };
}
