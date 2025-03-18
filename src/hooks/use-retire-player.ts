import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { encodeFunctionData } from "viem";
import { toast } from "sonner";
import { PlayerABI } from "@/game/abi";
import { viemClient } from "@/config";

/**
 * Hook to handle the retirement of a player/character
 * @param playerId The ID of the player to retire
 * @returns Object containing retirement function and state
 */
export function useRetirePlayer(playerId: string) {
  const [isRetiring, setIsRetiring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { wallets } = useWallets();
  const { user, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  /**
   * Retires the player with the given ID
   * @returns Promise that resolves when the player is retired
   */
  const retirePlayer = async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (!authenticated || !user) {
      toast.error("Please connect your wallet", {
        description: "You need to be logged in to retire a character.",
      });
      return { success: false, error: new Error("Not authenticated") };
    }

    // Safely access wallets
    if (!wallets || wallets.length === 0) {
      toast.error("No wallets available", {
        description: "Please refresh the page and try again.",
      });
      return { success: false, error: new Error("No wallets available") };
    }

    // Find embedded wallet
    const embeddedWallet = wallets.find(
      (wallet) => wallet.connectorType === "embedded",
    );

    if (!embeddedWallet) {
      toast.error("No embedded wallet found", {
        description: "Please refresh the page and try again.",
      });
      return { success: false, error: new Error("Wallet not connected") };
    }

    setIsRetiring(true);

    try {
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

      // Get provider for the embedded wallet - handle this carefully
      const provider = await embeddedWallet.getEthereumProvider();

      if (!provider) {
        throw new Error("Failed to get Ethereum provider");
      }

      // Create transaction request - make sure all properties are properly defined
      const transactionRequest = {
        to: playerContractAddress,
        data,
        from: embeddedWallet.address,
      };

      // Send transaction using the provider with explicit error handling
      try {
        // Make sure the provider request is properly awaited and error-handled
        if (!provider.request) {
          throw new Error("Provider does not support request method");
        }

        const hash = await provider.request({
          method: "eth_sendTransaction",
          params: [transactionRequest],
        });

        // Validate hash
        if (!hash) {
          throw new Error("Transaction failed - no hash returned");
        }

        // Save hash
        setTxHash(hash as string);

        // Show toast with transaction link
        toast.success("Retirement request submitted", {
          description:
            "Your warrior retirement request has been submitted to the blockchain.",
          action: {
            label: "View on BaseScan",
            onClick: () =>
              window.open(`https://sepolia.basescan.org/tx/${hash}`, "_blank"),
          },
          duration: 5000,
        });

        try {
          // Wait for transaction to be mined
          const receipt = await viemClient.waitForTransactionReceipt({
            hash: hash as `0x${string}`,
          });

          console.log("Retirement confirmed:", receipt);

          // Force a thorough refresh with multiple attempts
          const refreshWithRetry = async (attempts = 3, delay = 1500) => {
            for (let i = 0; i < attempts; i++) {
              console.log(`Refresh attempt ${i + 1} of ${attempts}`);

              // Clear all related caches
              await queryClient.invalidateQueries({
                queryKey: ["player", playerId],
              });

              await queryClient.invalidateQueries({
                queryKey: ["owned-players"],
              });

              // Add a delay to ensure blockchain state is updated
              await new Promise((resolve) => setTimeout(resolve, delay));

              // Explicitly refetch characters
              await queryClient.invalidateQueries({
                queryKey: ["playerIds"],
              });

              // Then invalidate all player data queries
              await queryClient.invalidateQueries({
                queryKey: ["players"],
              });
            }
          };

          // Execute the refresh with retry
          await refreshWithRetry();

          // Show success toast after refetch
          toast.success("Warrior retired successfully!", {
            description: "Your warrior has been retired from battle.",
            duration: 3000,
          });

          return { success: true };
        } catch (error) {
          console.error("Error waiting for transaction:", error);
          toast.error("Transaction might be pending", {
            description:
              "Please check BaseScan and refresh the page in a moment.",
            duration: 5000,
          });
          return {
            success: false,
            error:
              error instanceof Error
                ? error
                : new Error("Transaction monitoring failed"),
          };
        }
      } catch (txError) {
        console.error("Transaction request error:", txError);
        toast.error("Failed to send transaction", {
          description:
            txError instanceof Error
              ? txError.message
              : "Check console for details",
        });
        return {
          success: false,
          error:
            txError instanceof Error
              ? txError
              : new Error("Transaction request failed"),
        };
      }
    } catch (error) {
      console.error("Error retiring character:", error);
      toast.error("Error submitting transaction", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    } finally {
      setIsRetiring(false);
    }
  };

  return {
    retirePlayer,
    isRetiring,
    txHash,
  };
}
