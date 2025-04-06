import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import type { Challenge } from "./use-challenges";
import { useRouter } from "next/navigation";
import {
  useDuelActions,
  useDuelChallengeId,
  useDuelTxHash,
} from "@/stores/duel-store";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useState, useEffect } from "react";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface AcceptChallengeParams {
  character: Player;
  challengeId: bigint;
  wagerAmount: bigint;
}

interface AcceptChallengeResult {
  txHash: string;
  challengeId: bigint;
  characterId: string;
}

export function useAcceptChallenge() {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { address } = useAccount();
  const [pendingChallenge, setPendingChallenge] =
    useState<AcceptChallengeResult | null>(null);

  // Get duel store state and actions
  const {
    startListening,
    stopListening,
    setDuelTxHash,
    markAsTimedOut,
    setListenerTimeout,
  } = useDuelActions();
  const watchedChallengeId = useDuelChallengeId();

  // Using wagmi's contract hooks
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

  // Effect to handle transaction receipt confirmation
  useEffect(() => {
    if (pendingChallenge && txReceipt) {
      console.log("Transaction confirmed, handling challenge acceptance");

      // Handle the UI updates for challenge acceptance
      handleChallengeAccepted(pendingChallenge);
      setPendingChallenge(null);
    }
  }, [txReceipt, pendingChallenge]);

  // Create a mutation for accepting a challenge
  const mutation = useMutation({
    mutationFn: async ({
      character,
      challengeId,
      wagerAmount,
    }: AcceptChallengeParams): Promise<AcceptChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      console.log("Submitting acceptChallenge transaction:", {
        challengeId: challengeId.toString(),
        playerId: character.id,
        wagerAmount: wagerAmount.toString(),
      });

      // Create the defender loadout from the selected character
      const defenderLoadout = {
        playerId: Number(character.id),
        skin: {
          skinIndex: Number(character.currentSkin.collection.id),
          skinTokenId: character.currentSkin.tokenId,
        },
        stance: character.stance,
      };

      // Execute the contract write with wagmi
      const txHash = await writeContractAsync({
        account: address,
        address: DUEL_GAME_CONTRACT_ADDRESS,
        abi: DuelGameABI,
        functionName: "acceptChallenge",
        args: [challengeId, defenderLoadout],
        value: wagerAmount,
      });

      console.log("Transaction submitted:", txHash);

      return {
        txHash,
        challengeId,
        characterId: character.id,
      };
    },

    onSuccess: (result) => {
      // Store the pending challenge to process once transaction is confirmed
      setPendingChallenge(result);

      // Show initial success toast
      toast.success("Challenge acceptance submitted", {
        description: "Your challenge acceptance is being processed...",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(
              `https://sepolia.basescan.org/tx/${result.txHash}`,
              "_blank",
            ),
        },
        duration: 5000,
      });
    },

    onError: (error) => {
      console.error("Error accepting challenge:", error);

      // Show error toast
      toast.error("Error accepting challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Function to handle successful challenge acceptance after transaction is confirmed
  const handleChallengeAccepted = ({
    txHash,
    challengeId,
    characterId,
  }: AcceptChallengeResult) => {
    toast.success("Challenge accepted", {
      description:
        "You've accepted the challenge! Preparing for battle as the duel begins.",
      action: {
        label: "View on BaseScan",
        onClick: () =>
          window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
      },
      duration: 5000,
    });

    // This now sets up the event listener in the store, not in this component
    startListening(challengeId);

    // Set up a timeout for the duel completion
    const timeoutId = window.setTimeout(() => {
      markAsTimedOut();
      toast.error("Duel processing timeout", {
        description:
          "The duel is taking longer than expected to process. You can check back later.",
      });
    }, 60000); // 1 minute timeout

    setListenerTimeout(timeoutId);

    // Update the cache
    if (address) {
      // queryClient.invalidateQueries({
      //   queryKey: ["active-challenges", address, characterId],
      // });

      queryClient.setQueryData(
        ["active-challenges", address, characterId],
        (oldData: Challenge[] = []) => [
          ...oldData.filter((challenge) => challenge.id !== challengeId),
        ],
      );
    }

    // Navigate to the loading screen
    router.push("/duel/loading");
  };

  const acceptChallenge = async (params: AcceptChallengeParams) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to accept a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    acceptChallenge,
    isAcceptingChallenge:
      mutation.isPending ||
      isWritePending ||
      isWaitingForTx ||
      !!pendingChallenge,
    txHash: writeData || pendingChallenge?.txHash || null,
    error: mutation.error || writeError,
  };
}
