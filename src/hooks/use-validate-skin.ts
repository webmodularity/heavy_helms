import { useState } from "react";
import { SkinRegistryABI } from "@/game/abi/SkinRegistryABI.abi";
import type { PlayerAttributes } from "@/types/player.types";
import type { SkinInfo } from "@/types/skin.types";
import { usePlayer } from "@/store/player-context";

interface ValidationResult {
  isValid: boolean;
  error?: string;
  isLoading: boolean;
}

export function useValidateSkin() {
  const [isValidating, setIsValidating] = useState(false);
  const { validateSkinOwnership: validateOwnership, validateSkinRequirements: validateRequirements } = usePlayer();

  const validateSkinOwnership = async (
    skinIndex: number,
    skinTokenId: number
  ): Promise<ValidationResult> => {
    setIsValidating(true);

    try {
      // Create the skin info object
      const skinInfo: SkinInfo = {
        skinIndex,
        skinTokenId,
      };

      // Call the validateSkinOwnership function through the player context
      const result = await validateOwnership(skinInfo);

      // If no error is thrown, the skin is valid
      return { isValid: result.success, error: result.error, isLoading: false };
    } catch (error) {
      console.error("Error validating skin ownership:", error);
      
      // Extract user-friendly error message
      let errorMessage = "Failed to validate skin ownership";
      if (error instanceof Error) {
        if (error.message.includes("SkinNotOwned")) {
          errorMessage = "You don't own this skin";
        } else if (error.message.includes("RequiredNFTNotOwned")) {
          errorMessage = "You don't own the required NFT for this skin";
        } else {
          errorMessage = error.message;
        }
      }
      
      return { isValid: false, error: errorMessage, isLoading: false };
    } finally {
      setIsValidating(false);
    }
  };

  const validateSkinRequirements = async (
    skinIndex: number,
    skinTokenId: number,
    attributes: PlayerAttributes
  ): Promise<ValidationResult> => {
    setIsValidating(true);

    try {
      // Create the skin info object
      const skinInfo: SkinInfo = {
        skinIndex,
        skinTokenId,
      };

      // Call the validateSkinRequirements function through the player context
      const result = await validateRequirements(skinInfo, attributes);

      // If no error is thrown, the skin meets the requirements
      return { isValid: result.success, error: result.error, isLoading: false };
    } catch (error) {
      console.error("Error validating skin requirements:", error);
      
      // Extract user-friendly error message
      let errorMessage = "Failed to validate skin requirements";
      if (error instanceof Error) {
        if (error.message.includes("EquipmentRequirementsNotMet")) {
          errorMessage = "Your character doesn't meet the requirements for this skin";
        } else {
          errorMessage = error.message;
        }
      }
      
      return { isValid: false, error: errorMessage, isLoading: false };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateSkinOwnership,
    validateSkinRequirements,
    isValidating,
  };
} 