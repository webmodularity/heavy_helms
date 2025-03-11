import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useOwnedPlayers } from "@/hooks/use-player-data";
import { useWallet } from "@/hooks/use-wallet";
import type { Character } from "@/types/player.types";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
// src/store/player-context.tsx
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { encodeFunctionData, parseEther } from "viem";

interface PlayerContextType {
  isCreatingCharacter: boolean;
  txHash: string | null;
  createCharacter: () => Promise<void>;
  characters: Character[];
  refreshCharacters: () => Promise<void>;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
  initialCharacters: Character[];
}

export function PlayerProvider({
  children,
  initialCharacters,
}: PlayerProviderProps) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();

  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Use our improved hook to get characters
  const { 
    players = initialCharacters, 
    refetch,
    isLoading
  } = useOwnedPlayers({
    enabled: authenticated && !isWrongNetwork,
  });

  // Function to refresh characters
  const refreshCharacters = useCallback(async () => {
    const walletAddress = wallets?.find(
      (wallet) => wallet.connectorType === "embedded",
    )?.address;

    // First invalidate the player IDs query
    await queryClient.invalidateQueries({
      queryKey: ["playerIds"],
    });

    // Then invalidate all player data queries
    await queryClient.invalidateQueries({
      queryKey: ["players"],
    });

    // Explicitly refetch the data to ensure refresh
    await refetch();

    return;
  }, [queryClient, wallets, refetch]);

  // Function to create a character using Privy directly
  const createCharacter = useCallback(async () => {
    if (!authenticated) return;
    if (isWrongNetwork) {
      await switchToBaseSepolia();
      return;
    }

    // Find embedded wallet
    const embeddedWallet = wallets?.find(
      (wallet) => wallet.connectorType === "embedded",
    );

    if (!embeddedWallet) {
      toast.error("No embedded wallet found", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    setIsCreatingCharacter(true);

    try {
      // Get the creation fee
      const creationFee = parseEther("0.001");

      // Get player contract address
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Use nameSetB flag - determines which name set to use
      const useNameSetB = false;

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: PlayerABI,
        functionName: "requestCreatePlayer",
        args: [useNameSetB],
      });

      // Create transaction request
      const transactionRequest = {
        to: playerContractAddress,
        data,
        value: creationFee, // Privy handles converting this to hex
      };

      // Send transaction using the provider
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      // Save hash and show success toast
      setTxHash(hash as string);

      // Show toast with transaction link
      toast.success("Character creation submitted", {
        description:
          "Your character creation request has been submitted to the blockchain.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${hash}`, "_blank"),
        },
        duration: 5000,
      });

      // Wait for transaction to be mined, then refresh characters
      // First wait until the transaction completes
      try {
        // Use viemClient to wait for transaction
        const receipt = await viemClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });

        console.log("Transaction confirmed:", receipt);

        // Force a thorough refresh with multiple attempts
        const refreshWithRetry = async (attempts = 3, delay = 1500) => {
          for (let i = 0; i < attempts; i++) {
            console.log(`Refresh attempt ${i + 1} of ${attempts}`);

            // Clear all related caches
            await queryClient.invalidateQueries({
              queryKey: ["playerIds"],
            });

            await queryClient.invalidateQueries({
              queryKey: ["players"],
            });

            // Add a delay to ensure blockchain state is updated
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Explicitly refetch
            await refetch();

            // If characters have updated, break the loop
            if (players && players.length > 0) {
              console.log("Characters refreshed successfully");
              break;
            }
          }
        };

        // Execute the refresh with retry
        await refreshWithRetry();

        // Show success toast after refetch
        toast.success("Character created successfully!", {
          description: "Your new character is now ready for battle.",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error waiting for transaction:", error);
        toast.error("Transaction might be pending", {
          description:
            "Please check BaseScan and refresh the page in a moment.",
          duration: 5000,
        });
      } finally {
        // Reset loading state
        setIsCreatingCharacter(false);
      }
    } catch (error) {
      console.error("Error submitting character creation:", error);
      setIsCreatingCharacter(false);

      // Show error toast if there's an issue
      toast.error("Error submitting transaction", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, [
    authenticated,
    isWrongNetwork,
    switchToBaseSepolia,
    wallets,
    queryClient,
    refetch,
    players,
  ]);

  return (
    <PlayerContext.Provider
      value={{
        isCreatingCharacter,
        txHash,
        createCharacter,
        characters: players,
        refreshCharacters,
        isLoading,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
