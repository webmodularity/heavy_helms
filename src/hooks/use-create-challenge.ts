import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { toast } from "sonner";
import { decodeEventLog, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import type { Player } from "@/types/player.types";
import {
  useAccount,
  useWriteContract,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";
import { viemClient } from "@/config";

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

      console.log("challengeCreatedEvent", challengeCreatedEvent);

      return {
        txHash: hash,
        challengerId: character.id,
        createdChallenge: challengeCreatedEvent.args,
      };
    },

    onSuccess: async ({ txHash, challengerId, createdChallenge }) => {
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
        queryClient.invalidateQueries({
          queryKey: ["active-challenges", address],
        });

        // Update the fighter-challenges query data
        queryClient.setQueryData(
          ["fighter-challenges", challengerId],
          (oldData: unknown = []) => {
            const previousData = Array.isArray(oldData) ? oldData : [];
            return [
              ...previousData,
              {
                id: createdChallenge.challengeId,
                challengerId: Number(createdChallenge.challengerId),
                defenderId: Number(createdChallenge.defenderId),
                wagerAmount: createdChallenge.wagerAmount,
                createdBlock: createdChallenge.createdAtBlock,
                fulfilled: false,
              },
            ];
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
