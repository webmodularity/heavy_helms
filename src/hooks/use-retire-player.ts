import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { toast } from "sonner";
import { PlayerABI } from "@/game/abi";
import { viemClient } from "@/config";
import type { Player } from "@/types/player.types";

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
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const mutation = useMutation<RetirePlayerResult, Error, void>({
    mutationFn: async (): Promise<RetirePlayerResult> => {
      if (!authenticated || !user) {
        throw new Error("Authentication required");
      }

      // Find embedded wallet
      const embeddedWallet = wallets.find(
        (wallet) => wallet.connectorType === "embedded",
      );

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Contract address from environment
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Properly encode the function call using viem
      const data = encodeFunctionData({
        abi: PlayerABI,
        functionName: "retireOwnPlayer",
        args: [Number(playerId)],
      });

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      if (!provider) {
        throw new Error("Failed to get Ethereum provider");
      }

      // Create transaction request
      const transactionRequest = {
        to: playerContractAddress,
        data,
        from: embeddedWallet.address,
      };

      // Send transaction using the provider
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      // Validate hash
      if (!hash) {
        throw new Error("Transaction failed - no hash returned");
      }

      // Wait for transaction to be mined
      await viemClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      // Return success result
      return { success: true, txHash: hash as string };
    },

    onSuccess: async (data) => {
      // Find embedded wallet
      const embeddedWallet = wallets.find(
        (wallet) => wallet.connectorType === "embedded",
      );
      if (data.txHash) {
        toast.success("Retirement request submitted", {
          description:
            "Your warrior retirement request has been submitted to the blockchain.",
          action: {
            label: "View on BaseScan",
            onClick: () =>
              window.open(
                `https://sepolia.basescan.org/tx/${data.txHash}`,
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
        console.log("Retiring from address:", embeddedWallet?.address);
        queryClient.setQueryData(
          ["owned-players", embeddedWallet?.address],
          (oldData: Player[]) => {
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
    if (!authenticated || !user) {
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
    isRetiring: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    txHash: mutation.data?.txHash,
  };
}
