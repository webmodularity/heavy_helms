import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Player } from "@/types/player.types";
import type { Challenge } from "./use-challenges";
import { useRouter } from "next/navigation";
import { useDuelActions } from "@/stores/duel-store";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";

// --- Constants ---
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

// --- Type Definitions ---
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

interface AcceptChallengeStatus {
  acceptChallenge: (params: AcceptChallengeParams) => Promise<void>;
  isAcceptingChallenge: boolean;
  txHash: `0x${string}` | string | null;
  error: Error | null;
}

// --- Mutation Keys ---
const challengeKeys = {
  all: ["challenges"] as const,
  mutations: () => [...challengeKeys.all, "mutations"] as const,
  accept: () => [...challengeKeys.mutations(), "accept"] as const,
};

export function useAcceptChallenge(): AcceptChallengeStatus {
  const { isConnected, address } = useAccount();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingChallenge, setPendingChallenge] =
    useState<AcceptChallengeResult | null>(null);

  // Get duel store state and actions
  const { startListening, markAsTimedOut, setListenerTimeout, clearState } =
    useDuelActions();

  // Using wagmi's contract hooks
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  // Track transaction status
  const { data: txReceipt, isLoading: isWaitingForTx } =
    useWaitForTransactionReceipt({
      hash: writeData,
    });

  // Effect to handle transaction receipt confirmation
  useEffect(() => {
    if (pendingChallenge && txReceipt) {
      handleChallengeAccepted(pendingChallenge);
      setPendingChallenge(null);
    }
  }, [txReceipt, pendingChallenge]);

  // Create a mutation for accepting a challenge
  const mutation = useMutation({
    mutationKey: challengeKeys.accept(),
    mutationFn: async ({
      character,
      challengeId,
      wagerAmount,
    }: AcceptChallengeParams): Promise<AcceptChallengeResult> => {
      if (!isConnected) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

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

      return {
        txHash,
        challengeId,
        characterId: character.id,
      };
    },
    onSuccess: (result) => {
      // Store the pending challenge to process once transaction is confirmed
      setPendingChallenge(result);

      showTransactionToast(
        "Challenge acceptance submitted",
        "Your challenge acceptance is being processed...",
        result.txHash,
      );
    },
    onError: (error) => {
      console.error("Error accepting challenge:", error);

      toast.error("Error accepting challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Helper function to show blockchain transaction toasts
  function showTransactionToast(
    title: string,
    description: string,
    txHash: string,
  ) {
    const isTestnet =
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia";
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

  // Function to handle successful challenge acceptance after transaction is confirmed
  const handleChallengeAccepted = ({
    txHash,
    challengeId,
    characterId,
  }: AcceptChallengeResult) => {
    // Clear any previous state first
    clearState();

    showTransactionToast(
      "Challenge accepted",
      "You've accepted the challenge! Preparing for battle as the duel begins.",
      txHash,
    );

    // Start listening for the new challenge
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

    // Navigate to the loading screen
    router.push(`/duel/loading?player1Id=${characterId}`);
  };

  const acceptChallenge = async (params: AcceptChallengeParams) => {
    if (!isConnected) {
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
