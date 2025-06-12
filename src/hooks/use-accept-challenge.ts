import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import type { Challenge } from "./use-challenges";
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
import { useGlobalFightModal } from "./use-global-fight-modal";

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
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [pendingChallenge, setPendingChallenge] =
    useState<AcceptChallengeResult | null>(null);
  const [isWaitingForDuel, setIsWaitingForDuel] = useState(false);

  // Get duel store state and actions
  const {
    startListening,
    stopListening,
    setDuelTxHash,
    markAsTimedOut,
    setListenerTimeout,
    clearState,
  } = useDuelActions();
  const watchedChallengeId = useDuelChallengeId();
  const duelTxHash = useDuelTxHash();

  // Get global fight modal actions
  const { openFightModal, setLoading, updateFightData } = useGlobalFightModal();

  // Watch for duel completion and update modal
  useEffect(() => {
    if (duelTxHash && isWaitingForDuel) {
      console.log("Duel completed! Updating modal with txId:", duelTxHash);
      // Duel completed! Update the modal to show the actual fight
      updateFightData({
        txId: duelTxHash,
        isLoading: false,
        loadingText: undefined,
      });
      setIsWaitingForDuel(false);
    }
  }, [duelTxHash, isWaitingForDuel, updateFightData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsWaitingForDuel(false);
    };
  }, []);

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
        await switchToPrimaryNetwork();
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
      console.error("Error accepting challenge:", error);

      // Reset waiting state on error
      setIsWaitingForDuel(false);

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
    // Add this at the beginning - clear any previous state first
    clearState();

    toast.success("Challenge accepted", {
      description:
        "You've accepted the challenge! Preparing for battle as the duel begins.",
      action: {
        label:
          process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
            ? "View on BaseSepoliaScan"
            : "View on ShapeScan",
        onClick: () =>
          window.open(
            `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`,
            "_blank",
          ),
      },
      duration: 5000,
    });

    // Open the modal in loading state instead of navigating to loading page
    openFightModal({
      title: "Duel Arena",
      isLoading: true,
      loadingText: "Preparing for Battle...",
      challengeId,
    });

    // Set flag that we're waiting for duel completion
    setIsWaitingForDuel(true);

    // Start listening for the new challenge
    startListening(challengeId);

    // Set up a timeout for the duel completion
    const timeoutId = window.setTimeout(() => {
      markAsTimedOut();
      setIsWaitingForDuel(false);
      // Update modal to show timeout state
      updateFightData({
        isLoading: false,
        loadingText: "Battle processing timed out",
      });
      toast.error("Duel processing timeout", {
        description:
          "The duel is taking longer than expected to process. You can check back later.",
      });
    }, 60000); // 1 minute timeout

    setListenerTimeout(timeoutId);

    // Update the cache
    if (address) {
      queryClient.setQueryData(
        ["active-challenges", address, characterId],
        (oldData: InfiniteData<Challenge[]> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.filter((challenge) => challenge.id !== challengeId),
            ),
          };
        },
      );
    }

    // No need to navigate - stay on current page with modal open
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
