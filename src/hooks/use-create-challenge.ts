import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { toast } from "sonner";
import { decodeEventLog, parseEther } from "viem";
import type { Player } from "@/types/player.types";
import {
  useAccount,
  useWriteContract,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";
import { SUBGRAPH_URL, viemClient } from "@/config";
import request from "graphql-request";
import { GET_FIGHTERS_BY_IDS } from "@/lib/gql-queries";
import type { Challenge } from "./use-challenges";

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
}

interface ChallengeCreatedEvent {
  event: string;
  args: {
    challengeId: bigint;
    challengerId: number;
    defenderId: number;
    wagerAmount: bigint;
    createdAtBlock: bigint;
  };
}

export function useCreateChallenge() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  const {
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Create a mutation for challenge creation
  const mutation = useMutation({
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

      // Check if we're on the right network (Base Sepolia)
      if (chainId !== baseSepolia.id) {
        try {
          await switchChain({ chainId: baseSepolia.id });
        } catch (error) {
          throw new Error(
            "Failed to switch to Base Sepolia network. Please switch manually and try again.",
          );
        }
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
        createdChallenge: challengeCreatedEvent.args,
      };
    },

    onSuccess: async ({
      txHash,
      challengerId,
      createdChallenge,
      challenger,
    }) => {
      toast.success("Challenge created successfully", {
        description:
          "Your challenge has been created and is now waiting for acceptance.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
        },
        duration: 5000,
      });

      // Invalidate active challenges query to refresh the list
      if (address) {
        // queryClient.invalidateQueries({
        //   queryKey: ["active-challenges", address, challengerId],
        // });

        const defenders = await request<{ fighters: Player[] }>(
          SUBGRAPH_URL,
          GET_FIGHTERS_BY_IDS,
          {
            fighterIds: [createdChallenge.defenderId],
          },
        );
        const defender = defenders.fighters[0];

        queryClient.setQueryData(
          ["active-challenges", address, challengerId],
          (oldData: InfiniteData<Challenge[]> | undefined) => {
            if (!oldData) return oldData;
            const lastPage = oldData.pages[oldData.pages.length - 1];
            const lastPageIndex = oldData.pages.length - 1;
            // console.log("currentPage", currentPage);
            // console.log("oldData", oldData);
            return {
              ...oldData,
              pages: [
                ...oldData.pages.slice(0, lastPageIndex),
                [
                  {
                    id: BigInt(createdChallenge.challengeId),
                    challengerId: Number(createdChallenge.challengerId),
                    defenderId: Number(createdChallenge.defenderId),
                    wagerAmount: BigInt(createdChallenge.wagerAmount),
                    createdBlock: BigInt(createdChallenge.createdAtBlock),
                    challengerLoadout: {
                      playerId: Number(createdChallenge.challengerId),
                      weapon: challenger?.currentSkin.weapon,
                      armor: challenger?.currentSkin.armor,
                      stance: challenger?.stance,
                    },
                    defenderLoadout: {
                      playerId: Number(createdChallenge.defenderId),
                      weapon: defender?.currentSkin.weapon,
                      armor: defender?.currentSkin.armor,
                      stance: defender?.stance,
                    },
                    challengerName: challenger?.name.fullName,
                    defenderName: defender?.fullName || "",
                    isSentByMe: false,
                    fulfilled: false,
                  },
                  ...lastPage,
                ],
              ],
            };
            // };
            // return [
            //   ...previousData,
            //   {
            //     id: BigInt(createdChallenge.challengeId),
            //     challengerId: Number(createdChallenge.challengerId),
            //     defenderId: Number(createdChallenge.defenderId),
            //     wagerAmount: BigInt(createdChallenge.wagerAmount),
            //     createdBlock: BigInt(createdChallenge.createdAtBlock),
            //     challengerLoadout: {
            //       playerId: Number(createdChallenge.challengerId),
            //       weapon: challenger?.currentSkin.weapon,
            //       armor: challenger?.currentSkin.armor,
            //       stance: challenger?.stance,
            //     },
            //     defenderLoadout: {
            //       playerId: Number(createdChallenge.defenderId),
            //       weapon: defender?.currentSkin.weapon,
            //       armor: defender?.currentSkin.armor,
            //       stance: defender?.stance,
            //     },
            //     challengerName: challenger?.name.fullName,
            //     defenderName: defender?.fullName || "",
            //     isSentByMe: false,
            //     fulfilled: false,
            //   },
            // ];
          },
        );
      }
    },

    onError: (error) => {
      console.error("Error creating challenge:", error);

      // Show error toast
      toast.error("Error creating challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

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
