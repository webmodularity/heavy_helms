import type { SkinWithMetadataURI } from "@/components/character/skins-browser";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { createPlayerSkin } from "@/lib/player-api";
import type { Player } from "@/types/player.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";
import type { StanceType } from "@/types/equipment.types";
import type { Skin } from "@/types/skin.types";

// --- Constants ---
const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

// --- Type Definitions ---
interface EquipSkinParams {
  skinIndex: number;
  skinTokenId: number;
  newSkin: SkinWithMetadataURI;
  stance: StanceType;
}

interface EquipSkinResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newSkin: SkinWithMetadataURI;
  stance: StanceType;
}

interface EquipSkinStatus {
  equipSkin: (
    skinIndex: number,
    skinTokenId: number,
    newSkin: SkinWithMetadataURI,
    stance: StanceType,
  ) => Promise<
    | EquipSkinResult
    | { success: false; error: string; newSkin: SkinWithMetadataURI }
  >;
  isEquipping: boolean;
  equipError: Error | null;
  isSuccess: boolean;
  txHash: `0x${string}` | string | null;
}

// --- Mutation Keys ---
const skinKeys = {
  all: ["skins"] as const,
  mutations: () => [...skinKeys.all, "mutations"] as const,
  equip: (playerId: string) =>
    [...skinKeys.mutations(), "equip", playerId] as const,
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

export function useEquipSkin(playerId: string): EquipSkinStatus {
  const { isConnected, address } = useAccount();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const [pendingSkin, setPendingSkin] = useState<EquipSkinParams | null>(null);

  // Using wagmi's contract hooks
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  // Track transaction status
  const {
    data: txReceipt,
    isLoading: isWaitingForTx,
    isSuccess: isReceiptReady,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Process skin equipping when transaction is confirmed
  useEffect(() => {
    async function processSkinEquipping() {
      if (!pendingSkin || !txReceipt || !address) return;

      try {
        // Create the player skin
        const newSkin = await createPlayerSkin(pendingSkin.newSkin);

        // Update player data in cache
        updatePlayerCache(playerId, address, newSkin);

        // Show success notification
        showTransactionToast(
          "Skin equipped successfully!",
          "Your warrior has been updated with the new skin.",
          writeData as string,
        );

        // Clear pending state
        setPendingSkin(null);
      } catch (error) {
        console.error("Error processing skin equipping:", error);
        toast.error("Error updating character", {
          description: "Could not update your character with the new skin.",
        });
      }
    }

    processSkinEquipping();
  }, [txReceipt, pendingSkin, address, writeData, playerId]);

  // Helper function to update the player cache
  function updatePlayerCache(playerId: string, address: string, newSkin: Skin) {
    // Update single player in cache
    queryClient.setQueryData(["player", playerId], (oldData: Player) => {
      return {
        ...oldData,
        currentSkin: {
          ...oldData.currentSkin,
          ...newSkin,
        },
      };
    });

    // Update player in owned players list
    queryClient.setQueryData(
      ["owned-players", address],
      (oldData: Player[] = []) => {
        return oldData.map((player) => {
          if (player.id === playerId) {
            return { ...player, currentSkin: newSkin };
          }
          return player;
        });
      },
    );
  }

  // Create mutation for equipping skin
  const mutation = useMutation<EquipSkinResult, Error, EquipSkinParams>({
    mutationKey: skinKeys.equip(playerId),
    mutationFn: async ({
      skinIndex,
      skinTokenId,
      newSkin,
      stance,
    }): Promise<EquipSkinResult> => {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      if (!PLAYER_CONTRACT_ADDRESS) {
        throw new Error("Player contract address not configured");
      }

      try {
        // Execute contract transaction
        const txHash = await writeContractAsync({
          account: address,
          address: PLAYER_CONTRACT_ADDRESS,
          abi: PlayerABI,
          functionName: "equipSkin",
          args: [Number(playerId), skinIndex, skinTokenId, stance],
        });

        return { success: true, txHash, newSkin, stance };
      } catch (error) {
        console.error("Contract error:", error);
        throw error;
      }
    },

    onSuccess: (result) => {
      // Store pending skin to process after confirmation
      setPendingSkin({
        skinIndex: result.newSkin.collection.id as unknown as number,
        skinTokenId: result.newSkin.tokenId,
        newSkin: result.newSkin,
        stance: result.stance,
      });

      // Show transaction submitted toast
      showTransactionToast(
        "Equipping skin...",
        "Your transaction has been submitted to the blockchain.",
        result.txHash as string,
      );
    },

    onError: (error) => {
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
    },
  });

  const equipSkin = async (
    skinIndex: number,
    skinTokenId: number,
    newSkin: SkinWithMetadataURI,
    stance: StanceType,
  ) => {
    try {
      return await mutation.mutateAsync({
        skinIndex,
        skinTokenId,
        newSkin,
        stance,
      });
    } catch (error) {
      // Error is already handled in onError callback
      return {
        success: false as const,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        newSkin, // Return the newSkin for type compatibility
      };
    }
  };

  return {
    equipSkin,
    isEquipping:
      mutation.isPending || isWritePending || isWaitingForTx || !!pendingSkin,
    equipError: mutation.error || writeError,
    isSuccess: mutation.isSuccess || isReceiptReady,
    txHash: writeData || mutation.data?.txHash || null,
  };
}
