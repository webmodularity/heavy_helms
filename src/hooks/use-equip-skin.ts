import { useState } from "react";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { toast } from "sonner";
import { usePlayer } from "@/store/player-context";

interface EquipSkinResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export function useEquipSkin(characterId: string) {
  const [isEquipping, setIsEquipping] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const { equipCharacterSkin } = usePlayer();

  const equipSkin = async (
    skinIndex: number,
    skinTokenId: number,
  ): Promise<EquipSkinResult> => {
    setIsEquipping(true);
    setTxHash(undefined);

    try {
      const result = await equipCharacterSkin(
        Number.parseInt(characterId, 10), // playerId as uint32
        skinIndex, // skinIndex as uint32
        skinTokenId, // skinTokenId as uint16
      );

      if (result.success) {
        setTxHash(result.txHash);
        toast.success("Skin equipped successfully!");
        return { success: true, txHash: result.txHash };
      }
      throw new Error(result.error || "Failed to equip skin");
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
    } finally {
      setIsEquipping(false);
    }
  };

  return {
    equipSkin,
    isEquipping,
    txHash,
  };
}
