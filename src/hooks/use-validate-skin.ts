import { SkinRegistryABI } from "@/game/abi/SkinRegistryABI.abi";
import type { PlayerAttributes } from "@/types/player.types";
import { SkinType } from "@/types/skin.types";
import { useQuery } from "@tanstack/react-query";
import { meetsEquipmentRequirements } from "@/lib/equipment-utils";
import type { ArmorType, WeaponType } from "@/types/equipment.types";
import { useAccount, useReadContract } from "wagmi";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function useValidateSkinOwnership(
  skinIndex: number,
  skinTokenId: number,
  skinType: SkinType,
  enabled = true,
) {
  const { address } = useAccount();

  // Get skin registry contract address
  const skinRegistryAddress = process.env
    .NEXT_PUBLIC_SKIN_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;

  // Use wagmi's useReadContract for checking ownership
  const {
    data: validationResult,
    isError,
    error,
  } = useReadContract({
    address: skinRegistryAddress,
    abi: SkinRegistryABI,
    functionName: "validateSkinOwnership",
    args: [
      {
        skinIndex,
        skinTokenId,
      },
      address as `0x${string}`,
    ],
    query: {
      enabled: enabled && skinType !== SkinType.DefaultPlayer && !!address,
    },
  });

  return useQuery({
    queryKey: [
      "skinOwnershipValidation",
      skinIndex,
      skinTokenId,
      skinType,
      address,
    ],
    queryFn: async (): Promise<ValidationResult> => {
      // Default player skins are always valid
      if (skinType === SkinType.DefaultPlayer) {
        return { isValid: true };
      }

      if (!address) {
        throw new Error("Wallet not connected");
      }

      // If we have validation result from wagmi, it means validation succeeded
      if (validationResult !== undefined) {
        return { isValid: true };
      }

      // If there's an error from wagmi, parse it
      if (isError && error) {
        console.error("Error validating skin ownership:", error);

        // Extract user-friendly error message
        let errorMessage = "Failed to validate skin ownership";
        const errorString = error.toString();

        if (errorString.includes("SkinNotOwned")) {
          errorMessage = "You don't own this skin";
        } else if (errorString.includes("RequiredNFTNotOwned")) {
          errorMessage = "You don't own the required NFT for this skin";
        }

        return { isValid: false, error: errorMessage };
      }

      // Default case if we don't have a result yet
      return { isValid: false, error: "Validation in progress" };
    },
    enabled, // Only run the query if enabled is true
  });
}

export function useValidateSkinRequirements(
  skinIndex: number,
  skinTokenId: number,
  attributes: PlayerAttributes | undefined,
  weaponType: WeaponType,
  armorType: ArmorType,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "skinRequirementsValidation",
      skinIndex,
      skinTokenId,
      attributes,
      weaponType,
      armorType,
    ],
    queryFn: async (): Promise<ValidationResult> => {
      if (!attributes) {
        return { isValid: false, error: "Character attributes not available" };
      }

      try {
        // Use local validation functions instead of contract call
        const result = meetsEquipmentRequirements(
          attributes,
          weaponType,
          armorType,
        );

        if (!result.meets) {
          // Create a readable error message about missing requirements
          const missingAttrs = result.missing
            ? Object.entries(result.missing)
                .map(([attr, value]) => `${attr} (${value} more)`)
                .join(", ")
            : "";

          return {
            isValid: false,
            error: `Character doesn't meet requirements: ${missingAttrs}`,
          };
        }

        // If meets requirements
        return { isValid: true };
      } catch (error) {
        console.error("Error validating skin requirements:", error);

        // Extract user-friendly error message
        let errorMessage = "Failed to validate skin requirements";
        if (error instanceof Error) {
          if (error.message.includes("EquipmentRequirementsNotMet")) {
            errorMessage =
              "Your character doesn't meet the requirements for this skin";
          } else {
            errorMessage = error.message;
          }
        }

        return { isValid: false, error: errorMessage };
      }
    },
    enabled, // Only run if enabled is true and attributes are available
  });
}

// Composite hook that returns both validations
export function useValidateSkin(
  skinIndex: number,
  skinTokenId: number,
  skinType: SkinType,
  attributes: PlayerAttributes,
  weaponType: WeaponType,
  armorType: ArmorType,
) {
  const ownership = useValidateSkinOwnership(skinIndex, skinTokenId, skinType);

  const requirements = useValidateSkinRequirements(
    skinIndex,
    skinTokenId,
    attributes,
    weaponType,
    armorType,
    ownership.data?.isValid || false, // Only run if ownership passes
  );

  const isValid = ownership.data?.isValid && requirements.data?.isValid;
  const isValidating = ownership.isLoading || requirements.isLoading;
  const error = ownership.data?.error || requirements.data?.error;

  return {
    ownership,
    requirements,
    isValid,
    isValidating,
    error,
    refetch: async () => {
      await ownership.refetch();
      if (ownership.data?.isValid) {
        await requirements.refetch();
      }
    },
  };
}
