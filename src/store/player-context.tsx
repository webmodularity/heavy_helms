"use client";

import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
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
import { useSubgraphPlayers } from "@/hooks/use-subgraph-players";
import { SkinRegistryABI } from "@/game/abi/SkinRegistryABI.abi";
import { SkinInfo, SkinType } from "@/types/skin.types";
import type { PlayerAttributes } from "@/types/player.types";

interface PlayerContextType {
  isCreatingCharacter: boolean;
  txHash: string | null;
  createCharacter: () => Promise<void>;
  characters: Character[];
  refreshCharacters: () => Promise<void>;
  isLoading: boolean;
  validateSkinOwnership: (
    skinInfo: SkinInfo,
    skinType: SkinType,
  ) => Promise<{ success: boolean; error?: string }>;
  validateSkinRequirements: (
    skinInfo: SkinInfo,
    attributes: PlayerAttributes,
  ) => Promise<{ success: boolean; error?: string }>;
  equipCharacterSkin: (
    playerId: number,
    skinIndex: number,
    skinTokenId: number,
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>;
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

  // Use the subgraph hook instead of contract calls
  const { players, isLoading, error, refetch } = useSubgraphPlayers();

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

  // Validate skin ownership
  const validateSkinOwnership = async (
    skinInfo: SkinInfo,
    skinType: SkinType,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!authenticated || !wallets?.[0]?.address) {
      return { success: false, error: "Wallet not connected" };
    }

    if (skinType === SkinType.DefaultPlayer) {
      return { success: true };
    }

    try {
      // Call the validateSkinOwnership function
      await viemClient.readContract({
        address: process.env.NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: SkinRegistryABI,
        functionName: "validateSkinOwnership",
        args: [
          {
            skinIndex: skinInfo.skinIndex,
            skinTokenId: skinInfo.skinTokenId,
          },
          wallets[0].address as `0x${string}`,
        ],
      });
      console.log("Skin ownership validated");

      // If no error is thrown, the skin is valid
      return { success: true };
    } catch (error) {
      console.error("Error validating skin ownership:", error);

      // Extract user-friendly error message
      let errorMessage = "Failed to validate skin ownership";
      if (error instanceof Error) {
        if (error.message.includes("SkinNotOwned")) {
          errorMessage = "You don't own this skin";
        } else if (error.message.includes("RequiredNFTNotOwned")) {
          errorMessage = "You don't own the required NFT for this skin";
        }
      }

      return { success: false, error: errorMessage };
    }
  };

  // Validate skin requirements
  const validateSkinRequirements = async (
    skinInfo: SkinInfo,
    attributes: PlayerAttributes,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!authenticated) {
      return { success: false, error: "Wallet not connected" };
    }

    try {
      // Call the validateSkinRequirements function
      await viemClient.readContract({
        address: process.env.NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: SkinRegistryABI,
        functionName: "validateSkinRequirements",
        args: [
          {
            skinIndex: skinInfo.skinIndex,
            skinTokenId: skinInfo.skinTokenId,
          },
          {
            strength: attributes.strength,
            constitution: attributes.constitution,
            size: attributes.size,
            agility: attributes.agility,
            stamina: attributes.stamina,
            luck: attributes.luck,
          },
          process.env
            .NEXT_PUBLIC_EQUIPMENT_REQUIREMENTS_ADDRESS as `0x${string}`,
        ],
      });

      // If no error is thrown, the skin meets the requirements
      return { success: true };
    } catch (error) {
      console.error("Error validating skin requirements:", error);

      // Extract user-friendly error message
      let errorMessage = "Failed to validate skin requirements";
      if (error instanceof Error) {
        if (error.message.includes("EquipmentRequirementsNotMet")) {
          errorMessage =
            "Your character doesn't meet the requirements for this skin";
        }
      }

      return { success: false, error: errorMessage };
    }
  };

  // Equip character skin
  const equipCharacterSkin = async (
    playerId: number,
    skinIndex: number,
    skinTokenId: number,
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!authenticated) {
      return { success: false, error: "Wallet not connected" };
    }

    if (isWrongNetwork) {
      try {
        await switchToBaseSepolia();
      } catch (error) {
        return {
          success: false,
          error: "Failed to switch to the correct network",
        };
      }
    }

    // Find embedded wallet
    const embeddedWallet = wallets?.find(
      (wallet) => wallet.connectorType === "embedded",
    );

    if (!embeddedWallet) {
      return { success: false, error: "No embedded wallet found" };
    }

    try {
      // Get player contract address
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Prepare transaction data
      const data = encodeFunctionData({
        abi: PlayerABI,
        functionName: "equipSkin",
        args: [playerId, skinIndex, skinTokenId],
      });

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

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

      // Save hash
      const txHash = hash as string;

      toast.success("Skin equipped successfully!", {
        description: "Your warrior will be updated with the new skin shortly.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
        },
      });

      // Refresh characters after a short delay to allow the transaction to be processed
      setTimeout(() => {
        refreshCharacters();
      }, 2000);

      return { success: true, txHash };
    } catch (error) {
      console.error("Error equipping skin:", error);

      // Extract user-friendly error message
      let errorMessage = "Failed to equip skin";
      if (error instanceof Error) {
        if (error.message.includes("SkinNotOwned")) {
          errorMessage = "You don't own this skin";
        } else if (error.message.includes("RequiredNFTNotOwned")) {
          errorMessage = "You don't own the required NFT for this skin";
        } else if (error.message.includes("EquipmentRequirementsNotMet")) {
          errorMessage =
            "Your character doesn't meet the requirements for this skin";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  };

  const value = {
    characters: players,
    isLoading,
    createCharacter,
    isCreatingCharacter,
    txHash,
    refreshCharacters,
    validateSkinOwnership,
    validateSkinRequirements,
    equipCharacterSkin,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
