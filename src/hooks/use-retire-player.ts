import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlayerABI } from "@/game/abi";
import type { Fighter } from "@/types/fighter-types";
import { useWallet } from "./use-wallet";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";

interface RetirePlayerResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Hook to handle the retirement of a player/character using React Query
 * @param playerId The ID of the player to retire
 * @returns Object containing retirement function and state
 */
export function useRetirePlayer(playerId: string) {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [pendingRetirement, setPendingRetirement] = useState<boolean>(false);

  // Contract address from environment
  const playerContractAddress = process.env
    .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

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

  // Effect to handle player retirement when transaction is confirmed
  useEffect(() => {
    async function processRetirement() {
      if (!pendingRetirement || !txReceipt || !address) return;

      try {
        // Update the UI
        toast.success("Warrior retired successfully!", {
          description: "Your warrior has been retired from battle.",
          duration: 3000,
        });

        // Invalidate specific queries
        await queryClient.invalidateQueries({
          queryKey: ["player", playerId],
        });

        // Update the owned-players cache to remove the retired player
        queryClient.setQueryData(
          ["owned-players", address],
          (oldData: Fighter[] = []) => {
            return oldData.filter((player) => player.id !== playerId);
          },
        );

        // Clear the pending state
        setPendingRetirement(false);
      } catch (error) {
        console.error("Error processing player retirement:", error);
        toast.error("Error updating player list", {
          description:
            "Player was retired, but the UI may not reflect this change.",
        });
      }
    }

    processRetirement();
  }, [txReceipt, pendingRetirement, address, playerId, queryClient]);

  const mutation = useMutation<RetirePlayerResult, Error, void>({
    mutationFn: async (): Promise<RetirePlayerResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Execute the contract write with wagmi
      const txHash = await writeContractAsync({
        account: address,
        address: playerContractAddress,
        abi: PlayerABI,
        functionName: "retireOwnPlayer",
        args: [Number(playerId)],
      });

      // Return success result
      return { success: true, txHash };
    },

    onSuccess: async (data) => {
      // Find embedded wallet

      if (data.txHash) {
        toast.success("Retirement request submitted", {
          description:
            "Your warrior retirement request has been submitted to the blockchain.",
          action: {
            label: "View on BaseScan",
            onClick: () =>
              window.open(
                `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${data.txHash}`,
                "_blank",
              ),
          },
          duration: 5000,
        });

        // Invalidate specific queries
        await queryClient.invalidateQueries({
          queryKey: ["player", playerId],
        });

        // if (embeddedWallet?.address) {
        //   await queryClient.invalidateQueries({
        //     queryKey: ["owned-players", embeddedWallet.address],
        //   });
        // }
        console.log("Retiring from address:", address);
        queryClient.setQueryData(
          ["owned-players", address],
          (oldData: Fighter[]) => {
            console.log("Old data:", oldData);
            return oldData?.filter((player) => player.id !== playerId);
          },
        );

        // Show success toast after refetch
        toast.success("Warrior retired successfully!", {
          description: "Your warrior has been retired from battle.",
          duration: 3000,
        });
      }
    },

    onError: (error) => {
      console.error("Error retiring character:", error);

      let errorMessage = "Failed to retire warrior";

      // Extract a user-friendly error message if possible
      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to complete the transaction";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected";
      } else if (error.message.includes("NotOwner")) {
        errorMessage = "You don't own this character";
      } else if (error.message.includes("NonexistentPlayer")) {
        errorMessage =
          "This character doesn't exist or has already been retired";
      }

      toast.error(errorMessage, {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  /**
   * Retires the player with the given ID
   * @returns Promise that resolves when the player is retired
   */
  const retirePlayer = async (): Promise<RetirePlayerResult> => {
    if (!authenticated) {
      toast.error("Please connect your wallet", {
        description: "You need to be logged in to retire a character.",
      });
      return { success: false, error: "Not authenticated" };
    }

    try {
      return await mutation.mutateAsync();
    } catch (error) {
      // Error is already handled in onError callback
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  return {
    retirePlayer,
    isRetiring:
      mutation.isPending ||
      isWritePending ||
      isWaitingForTx ||
      pendingRetirement,
    isSuccess: mutation.isSuccess || isReceiptReady,
    error: mutation.error || writeError,
    txHash: writeData || mutation.data?.txHash || null,
  };
}
