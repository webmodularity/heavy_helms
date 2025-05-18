import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { toast } from "sonner";
import { decodeEventLog, formatEther, parseEther } from "viem";
import type { Player } from "@/types/player.types";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { SUBGRAPH_URL, viemClient } from "@/config";
import request from "graphql-request";
import { GET_FIGHTERS_BY_IDS } from "@/lib/gql-queries";
import type { SubgraphChallenge } from "./use-challenges";
import type { RawFighterData } from "@/types/fighter-types";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface CreateChallengeParams {
  character: Player;
  defenderId: number;
  wagerAmount: string;
}

interface CreateChallengeResult {
  txHash: `0x${string}`;
  createdChallenge: ChallengeCreatedEvent["args"];
  challengerId?: string;
  challenger: Player;
  createdAtBlock: bigint;
}

interface ChallengeCreatedEvent {
  event: string;
  args: {
    challengeId: bigint;
    challengerId: number;
    defenderId: number;
    wagerAmount: bigint;
    challengerSkinIndex: number;
    challengerSkinTokenId: number;
    challengerStance: number;
  };
}

interface CreateChallengeStatus {
  createChallenge: (params: CreateChallengeParams) => Promise<void>;
  isCreatingChallenge: boolean;
  txHash: `0x${string}` | null;
  error: Error | null;
}

// --- Mutation Keys ---
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
  mutations: () => [...challengeKeys.all, "mutations"] as const,
  create: () => [...challengeKeys.mutations(), "create"] as const,
};

// --- Helper Functions ---
function showTransactionToast(
  title: string,
  description: string,
  txHash: string,
) {
  toast.success(title, {
    description,
    action: {
      label: "View Transaction",
      onClick: () =>
        window.open(
          `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`,
          "_blank",
        ),
    },
    duration: 5000,
  });
}

export function useCreateChallenge(): CreateChallengeStatus {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  const {
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Create a mutation for challenge creation
  const mutation = useMutation({
    mutationKey: challengeKeys.create(),
    mutationFn: async ({
      character,
      defenderId,
      wagerAmount,
    }: CreateChallengeParams): Promise<CreateChallengeResult> => {
      if (!address) {
        throw new Error("Authentication required");
      }

      if (!publicClient) {
        throw new Error("No public client available");
      }

      // Convert wager amount to wei
      const wagerValue = parseEther(wagerAmount);

      // Create the loadout from the selected character
      const challengerLoadout = {
        playerId: Number(character.id),
        skin: {
          skinIndex: Number(character.currentSkin.collection.id),
          skinTokenId: character.currentSkin.tokenId,
        },
        stance: character.stance,
      };

      try {
        // Use wagmi's writeContractAsync to send the transaction
        const hash = await writeContractAsync({
          address: DUEL_GAME_CONTRACT_ADDRESS,
          abi: DuelGameABI,
          functionName: "initiateChallenge",
          args: [challengerLoadout, defenderId, wagerValue],
          value: wagerValue + parseEther("0.0002"),
        });

        // Wait for transaction receipt
        const receipt = await viemClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });

        // Parse logs to find the event containing the challenge ID
        const challengeCreatedEvent = decodeEventLog({
          abi: DuelGameABI,
          data: receipt.logs[0].data,
          topics: receipt.logs[0].topics,
        }) as unknown as ChallengeCreatedEvent;

        return {
          txHash: hash,
          challenger: character,
          challengerId: character.id,
          createdAtBlock: receipt.blockNumber,
          createdChallenge: challengeCreatedEvent.args,
        };
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },

    onSuccess: async ({
      txHash,
      challengerId,
      createdChallenge,
      challenger,
      createdAtBlock,
    }) => {
      showTransactionToast(
        "Challenge created successfully",
        "Your challenge has been created and is now waiting for acceptance.",
        txHash,
      );

      if (address) {
        try {
          // Fetch defender information
          const defenders = await request<{ fighters: RawFighterData[] }>(
            SUBGRAPH_URL,
            GET_FIGHTERS_BY_IDS,
            {
              fighterIds: [createdChallenge.defenderId],
            },
          );
          const defender = defenders.fighters[0];
          console.log("defender", defender);
          // Update the query cache with the new challenge
          updateChallengeCache(address, challengerId, {
            challengerSnapshot: {
              currentSkin: {
                weapon: challenger?.currentSkin.weapon,
                armor: challenger?.currentSkin.armor,
              },
              fighterId: challenger?.id,
              fighterType: "PlayerSnapshot",
              stance: challenger?.stance,
              firstName: challenger?.name.firstName,
              surname: challenger?.name.surname,
              fullName: challenger?.name.fullName,
            },
            id: String(createdChallenge.challengeId),
            wagerAmount: formatEther(createdChallenge.wagerAmount),
            state: "OPEN",
            createdAt: String(createdAtBlock),
            defenderSnapshot: {
              currentSkin: {
                weapon: defender?.currentSkin.weapon,
                armor: defender?.currentSkin.armor,
              },
              fighterId: defender?.id,
              fighterType: "PlayerSnapshot",
              stance: defender?.stance,
              firstName: defender?.firstName,
              surname: defender?.surname,
              fullName: defender?.fullName,
            },
          });
        } catch (error) {
          console.error("Error updating challenge cache:", error);
        }
      }
    },

    onError: (error) => {
      console.error("Error creating challenge:", error);

      toast.error("Error creating challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Helper function to update the challenge cache
  function updateChallengeCache(
    address: string,
    challengerId: string | undefined,
    newChallenge: Omit<SubgraphChallenge, "defenderOwner" | "challengerOwner">,
  ) {
    queryClient.setQueryData(
      challengeKeys.infiniteList({
        address,
        fighterId: challengerId,
        pageSize: 10,
      }),
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: InfiniteData<any> | undefined) => {
        if (!oldData || !oldData.pages || !oldData.pages[0]) return oldData;

        // Clone the first page
        const firstPage = { ...oldData.pages[0] };

        // Add to the appropriate array based on isSentByMe flag
        firstPage.sentChallenges = [
          newChallenge,
          ...(firstPage.sentChallenges || []),
        ];

        return {
          ...oldData,
          pages: [firstPage, ...oldData.pages.slice(1)],
        };
      },
    );
  }

  const createChallenge = async (params: CreateChallengeParams) => {
    if (!address) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to create a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    createChallenge,
    isCreatingChallenge: mutation.isPending || isWritePending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error || writeError,
  };
}
