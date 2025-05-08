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

export function useEquipSkin(playerId: string) {
  const { isConnected } = useAccount();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [pendingSkin, setPendingSkin] = useState<EquipSkinParams | null>(null);

  // Get player contract address
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

  // Effect to handle skin equipping completion when transaction is confirmed
  useEffect(() => {
    async function processSkinEquipping() {
      if (!pendingSkin || !txReceipt || !address) return;

      try {
        // Create the player skin
        const newSkin = await createPlayerSkin(pendingSkin.newSkin);

        // Update the player in the cache
        queryClient.setQueryData(["player", playerId], (oldData: Player) => {
          return {
            ...oldData,
            currentSkin: {
              ...oldData.currentSkin,
              ...newSkin,
            },
          };
        });

        // Update the player in the owned players cache
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

        // Show success toast
        toast.success("Skin equipped successfully!", {
          description: "Your warrior has been updated with the new skin.",
          action: {
            label:
              process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
                ? "View on BaseSepoliaScan"
                : "View on ShapeScan",
            onClick: () =>
              window.open(
                `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${writeData}`,
                "_blank",
              ),
          },
        });

        // Clear the pending state
        setPendingSkin(null);
      } catch (error) {
        console.error("Error processing skin equipping:", error);
        toast.error("Error updating character", {
          description: "Could not update your character with the new skin.",
        });
      }
    }

    processSkinEquipping();
  }, [txReceipt, pendingSkin, address, writeData, playerId, queryClient]);

  const mutation = useMutation<EquipSkinResult, Error, EquipSkinParams>({
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

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Execute the contract write with wagmi
      const txHash = await writeContractAsync({
        account: address,
        address: playerContractAddress,
        abi: PlayerABI,
        functionName: "equipSkin",
        // TODO SET THIS TO PASSED IN STANCE INSTEAD OF 1
        args: [Number(playerId), skinIndex, skinTokenId, stance],
      });

      // Return success and transaction hash
      return { success: true, txHash, newSkin, stance };
    },

    onSuccess: (result) => {
      // Store the pending skin to process once transaction is confirmed
      setPendingSkin({
        skinIndex: result.newSkin.collection.id as unknown as number,
        skinTokenId: result.newSkin.tokenId,
        newSkin: result.newSkin,
        stance: 1,
      });

      // Show initial success toast
      toast.success("Equipping skin...", {
        description: "Your transaction has been submitted to the blockchain.",
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
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        newSkin, // We still need to return the newSkin for type compatibility
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
