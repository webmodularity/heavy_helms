import type { SkinWithMetadataURI } from "@/components/character/skins-browser";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { createPlayerSkin } from "@/lib/player-api";
import type { Player } from "@/types/player.types";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData } from "viem";

interface EquipSkinResult {
  success: boolean;
  txHash?: string;
  error?: string;
  newSkin: SkinWithMetadataURI;
}

export function useEquipSkin(playerId: string) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    EquipSkinResult,
    Error,
    { skinIndex: number; skinTokenId: number; newSkin: SkinWithMetadataURI }
  >({
    mutationFn: async ({
      skinIndex,
      skinTokenId,
      newSkin,
    }): Promise<EquipSkinResult> => {
      if (!authenticated) {
        throw new Error("Wallet not connected");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      // Find embedded wallet
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.connectorType === "embedded",
      );

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

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
        args: [Number(playerId), skinIndex, skinTokenId],
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

      // Return success and transaction hash
      return { success: true, txHash: hash as string, newSkin };
    },

    onSuccess: async (data) => {
      // Find embedded wallet
      const embeddedWallet = wallets?.find(
        (wallet) => wallet.connectorType === "embedded",
      );
      if (data.txHash) {
        toast.success("Skin equipped successfully!", {
          description:
            "Your warrior will be updated with the new skin shortly.",
          action: {
            label: "View on BaseScan",
            onClick: () =>
              window.open(
                `https://sepolia.basescan.org/tx/${data.txHash}`,
                "_blank",
              ),
          },
        });
      }

      // We need to convert the RAW 'data.newSkin' to a Skin object (updated spritesheet/etc.)
      const newSkin = await createPlayerSkin(data.newSkin);

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
        ["owned-players", embeddedWallet?.address],
        (oldData: Player[]) => {
          return oldData.map((player) => {
            if (player.id === playerId) {
              return { ...player, currentSkin: newSkin };
            }
            return player;
          });
        },
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
  ) => {
    try {
      return await mutation.mutateAsync({ skinIndex, skinTokenId, newSkin });
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
    equipSkin,
    isEquipping: mutation.isPending,
    equipError: mutation.error,
    isSuccess: mutation.isSuccess,
    txHash: mutation.data?.txHash,
  };
}
