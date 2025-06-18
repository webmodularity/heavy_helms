import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";
import type { Challenge } from "./use-challenges";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface CancelChallengeResult {
  txHash: string;
  challengeId: bigint;
  characterId: string;
}

interface CancelChallengeParams {
  challengeId: bigint;
  characterId: string;
}

export function useCancelChallenge() {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [pendingCancel, setPendingCancel] =
    useState<CancelChallengeParams | null>(null);

  // Using wagmi's useWriteContract hook
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  // Use useWaitForTransactionReceipt to track when the transaction is mined
  const {
    data: txReceipt,
    isLoading: isWaitingForTx,
    isSuccess: isReceiptReady,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Effect to handle challenge cancellation when transaction is confirmed
  useEffect(() => {
    if (!pendingCancel || !txReceipt || !address) return;

    try {
      // Update the UI
      toast.success("Challenge cancelled", {
        description: "Your challenge has been successfully cancelled.",
        action: {
          label:
            process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
              ? "View on BaseSepoliaScan"
              : "View on ShapeScan",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${writeData}`,
              "_blank",
            ),
        },
        duration: 5000,
      });

      // Update the cache to remove the cancelled challenge
      queryClient.setQueryData(
        ["active-challenges", address, pendingCancel.characterId],
        (oldData: InfiniteData<Challenge[]> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.filter(
                (challenge) => challenge.id !== pendingCancel.challengeId,
              ),
            ),
          };
        },
      );

      // Clear the pending state
      setPendingCancel(null);
    } catch (error) {
      console.error("Error processing challenge cancellation:", error);
      toast.error("Error updating challenges list", {
        description:
          "Challenge was cancelled, but the UI may not reflect this change.",
      });
    }
  }, [txReceipt, pendingCancel, address, writeData, queryClient]);

  // Create a mutation for cancelling a challenge
  const mutation = useMutation({
    mutationFn: async ({
      challengeId,
      characterId,
    }: CancelChallengeParams): Promise<CancelChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      // Execute the contract write with wagmi
      const txHash = await writeContractAsync({
        account: address,
        address: DUEL_GAME_CONTRACT_ADDRESS,
        abi: DuelGameABI,
        functionName: "cancelChallenge",
        args: [challengeId],
      });

      return { txHash, challengeId, characterId };
    },

    onSuccess: (result) => {
      // Store the pending cancellation to process once transaction is confirmed
      setPendingCancel({
        challengeId: result.challengeId,
        characterId: result.characterId,
      });

      // Show initial success toast
      toast.success("Cancelling challenge...", {
        description: "Your transaction has been submitted to the blockchain.",
        action: {
          label:
            process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
              ? "View on BaseSepoliaScan"
              : "View on ShapeScan",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${result.txHash}`,
              "_blank",
            ),
        },
        duration: 5000,
      });
    },

    onError: (error) => {
      console.error("Error cancelling challenge:", error);

      // Show error toast
      toast.error("Error cancelling challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const cancelChallenge = async (params: CancelChallengeParams) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to cancel a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    cancelChallenge,
    isCancellingChallenge:
      mutation.isPending || isWritePending || isWaitingForTx || !!pendingCancel,
    txHash: writeData || mutation.data?.txHash || null,
    error: mutation.error || writeError,
  };
}
