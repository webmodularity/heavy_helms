import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
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

// --- Constants ---
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

// --- Type Definitions ---
interface CancelChallengeParams {
  challengeId: bigint;
  characterId: string;
}

interface CancelChallengeResult {
  txHash: string;
  challengeId: bigint;
  characterId: string;
}

interface CancelChallengeStatus {
  cancelChallenge: (params: CancelChallengeParams) => Promise<void>;
  isCancellingChallenge: boolean;
  txHash: `0x${string}` | string | null;
  error: Error | null;
}

// --- Mutation Keys ---
const challengeKeys = {
  all: ["challenges"] as const,
  mutations: () => [...challengeKeys.all, "mutations"] as const,
  cancel: () => [...challengeKeys.mutations(), "cancel"] as const,
};

// --- Helper Functions ---
function showTransactionToast(
  title: string,
  description: string,
  txHash: string,
) {
  const isTestnet = process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia";
  const explorerLabel = isTestnet
    ? "View on BaseSepoliaScan"
    : "View on ShapeScan";

  toast.success(title, {
    description,
    action: {
      label: explorerLabel,
      onClick: () =>
        window.open(
          `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`,
          "_blank",
        ),
    },
    duration: 5000,
  });
}

export function useCancelChallenge(): CancelChallengeStatus {
  const { isConnected, address } = useAccount();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const [pendingCancel, setPendingCancel] =
    useState<CancelChallengeParams | null>(null);

  // Contract interaction hooks
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const { data: txReceipt, isLoading: isWaitingForTx } =
    useWaitForTransactionReceipt({
      hash: writeData,
    });

  // Process challenge cancellation when transaction is confirmed
  useEffect(() => {
    if (!pendingCancel || !txReceipt || !address) return;

    try {
      // Show success notification
      showTransactionToast(
        "Challenge cancelled",
        "Your challenge has been successfully cancelled. Any wager amount will be returned to your wallet.",
        writeData as string,
      );

      // Update the cache to remove the cancelled challenge
      updateChallengeCache(address, pendingCancel);

      // Clear pending state
      setPendingCancel(null);
    } catch (error) {
      console.error("Error processing challenge cancellation:", error);
      toast.error("Error updating challenges list", {
        description:
          "Challenge was cancelled, but the UI may not reflect this change.",
      });
    }
  }, [txReceipt, pendingCancel, address, writeData]);

  // Helper function to update the challenge cache
  function updateChallengeCache(
    address: string,
    pendingCancel: CancelChallengeParams,
  ) {
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
  }

  // Create a mutation for cancelling a challenge
  const mutation = useMutation({
    mutationKey: challengeKeys.cancel(),
    mutationFn: async ({
      challengeId,
      characterId,
    }: CancelChallengeParams): Promise<CancelChallengeResult> => {
      if (!isConnected) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      try {
        // Submit transaction to cancel the challenge
        const txHash = await writeContractAsync({
          account: address,
          address: DUEL_GAME_CONTRACT_ADDRESS,
          abi: DuelGameABI,
          functionName: "cancelChallenge",
          args: [challengeId],
        });

        return { txHash, challengeId, characterId };
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },

    onSuccess: (result) => {
      // Store pending cancellation for processing after confirmation
      setPendingCancel({
        challengeId: result.challengeId,
        characterId: result.characterId,
      });

      // Show transaction submitted toast
      showTransactionToast(
        "Cancelling challenge...",
        "Your transaction has been submitted to the blockchain.",
        result.txHash,
      );
    },

    onError: (error) => {
      console.error("Error cancelling challenge:", error);
      toast.error("Error cancelling challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const cancelChallenge = async (params: CancelChallengeParams) => {
    if (!isConnected) {
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
