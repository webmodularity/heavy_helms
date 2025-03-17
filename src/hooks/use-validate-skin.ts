import { useWallets } from "@privy-io/react-auth";
import { viemClient } from "@/config";
import { SkinRegistryABI } from "@/game/abi/SkinRegistryABI.abi";
import type { PlayerAttributes } from "@/types/player.types";
import { SkinInfo, SkinType } from "@/types/skin.types";
import { useQuery } from "@tanstack/react-query";
import { meetsEquipmentRequirements } from "@/lib/equipment-utils";
import type { ArmorType, WeaponType } from "@/types/equipment.types";

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
  const { wallets } = useWallets();

  return useQuery({
    queryKey: ["skinOwnershipValidation", skinIndex, skinTokenId, skinType],
    queryFn: async (): Promise<ValidationResult> => {
      // Default player skins are always valid
      if (skinType === SkinType.DefaultPlayer) {
        return { isValid: true };
      }

      const embeddedWallet = wallets?.find(
        (wallet) => wallet.connectorType === "embedded",
      );

      if (!embeddedWallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        // Call the validateSkinOwnership function with the correct parameter structure
        // Based on the ABI, we need an object with skinIndex and skinTokenId properties
        await viemClient.readContract({
          address: process.env
            .NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`,
          abi: SkinRegistryABI,
          functionName: "validateSkinOwnership",
          args: [
            {
              skinIndex, // Must match the exact name in the ABI
              skinTokenId, // Must match the exact name in the ABI
            },
            embeddedWallet.address as `0x${string}`,
          ],
        });

        // If no error is thrown, the skin is valid
        return { isValid: true };
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
            errorMessage = "Failed to validate skin ownership";
          }
        }

        return { isValid: false, error: errorMessage };
      }
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
        // First approach: Use local validation functions instead of contract call
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

        // Second approach (fallback): Use contract call if needed
        /* 
        await viemClient.readContract({
          address: process.env.NEXT_PUBLIC_SKIN_REGISTRY_ADDRESS as `0x${string}`,
          abi: SkinRegistryABI,
          functionName: "validateSkinRequirements",
          args: [
            {
              skinIndex,
              skinTokenId,
            },
            {
              strength: attributes.strength,
              constitution: attributes.constitution,
              size: attributes.size,
              agility: attributes.agility,
              stamina: attributes.stamina,
              luck: attributes.luck,
            },
            process.env.NEXT_PUBLIC_EQUIPMENT_REQUIREMENTS_ADDRESS as `0x${string}`,
          ],
        });
        */
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
