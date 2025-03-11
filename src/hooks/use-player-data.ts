import {
  PlayerName,
  SkinData,
  getPlayerData,
  getPlayerIds,
  getPlayerName,
  getSkinData,
  loadSkinMetadata,
} from "@/lib/contracts/player-contract";
import type { Armor, Character, Stance, Weapon } from "@/types/player.types";
import { useWallets } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

// Utility functions for mapping contract values to domain types
function mapStanceToString(stanceValue: number | string): Stance {
  const stanceMap: Record<number, Stance> = {
    0: "offensive",
    1: "defensive",
    2: "balanced",
  };

  const numValue = Number(stanceValue);
  return stanceMap[numValue] || "balanced";
}

function mapWeaponToString(weaponValue: number | string): Weapon {
  const weaponMap: Record<number, Weapon> = {
    0: "Sword + Shield",
    1: "Mace + Shield",
    2: "Rapier + Shield",
    3: "Greatsword",
    4: "Battleaxe",
    5: "Spear",
    6: "Quarterstaff",
  };

  const numValue = Number(weaponValue);
  return weaponMap[numValue] || "Sword + Shield";
}

function mapArmorToString(armorValue: number | string): Armor {
  const armorMap: Record<number, Armor> = {
    0: "Cloth",
    1: "Leather",
    2: "Chain",
    3: "Plate",
  };

  const numValue = Number(armorValue);
  return armorMap[numValue] || "Cloth";
}

// Individual hooks for different pieces of data
export function usePlayerIds(address?: Address) {
  return useQuery({
    queryKey: ["playerIds", address],
    queryFn: async () => {
      if (!address) return [];
      return getPlayerIds(address);
    },
    enabled: Boolean(address),
  });
}

export function usePlayerData(playerId: number) {
  return useQuery({
    queryKey: ["playerData", playerId],
    queryFn: () => getPlayerData(playerId),
    enabled: playerId > 0,
  });
}

export function usePlayerName(firstNameIndex?: number, surnameIndex?: number) {
  return useQuery({
    queryKey: ["playerName", firstNameIndex, surnameIndex],
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    queryFn: () => getPlayerName(firstNameIndex!, surnameIndex!),
    enabled: Boolean(
      firstNameIndex !== undefined && surnameIndex !== undefined,
    ),
  });
}

// Hook for skin data
export function useSkinData(playerId: number) {
  return useQuery({
    queryKey: ["skinData", playerId],
    queryFn: () => getSkinData(playerId),
    enabled: playerId > 0,
  });
}

// Main hook that combines all data - enhanced with name data
export function useOwnedPlayers(options: { enabled?: boolean } = {}) {
  const { wallets } = useWallets();
  const address = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  )?.address;

  // Step 1: Get player IDs
  const {
    data: playerIds,
    isLoading: isLoadingIds,
    error: idsError,
  } = usePlayerIds(address as Address);

  // Step 2: Get player data for each ID
  const {
    data: players,
    isLoading: isLoadingPlayers,
    error: playersError,
    refetch,
  } = useQuery({
    queryKey: ["players", address],
    queryFn: async (): Promise<Character[]> => {
      if (!playerIds || !playerIds.length) return [];

      // Step 2.1: Fetch basic player data for all IDs
      const playerDataPromises = playerIds.map(async (playerId) => {
        try {
          // Get raw player data
          const rawData = await getPlayerData(playerId);
          if (!rawData) return null;

          // Step 2.2: Fetch player name - following Preloader.ts pattern
          const nameData = await getPlayerName(
            rawData.firstNameIndex,
            rawData.surnameIndex,
          );

          // Step 2.3: Get skin data if available
          let stance: Stance = "balanced";
          let weapon: Weapon = "Sword + Shield";
          let armor: Armor = "Cloth";
          let imageUrl =
            "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW"; // Default

          // Process skin data to extract equipment
          const skinData = await getSkinData(playerId);
          if (skinData) {
            // Map equipment types based on skin data
            if (skinData.weapon !== undefined) {
              weapon = mapWeaponToString(skinData.weapon);
            }

            if (skinData.armor !== undefined) {
              armor = mapArmorToString(skinData.armor);
            }

            if (skinData.stance !== undefined) {
              stance = mapStanceToString(skinData.stance);
            }

            // Set image URL if available
            if (skinData.imageUrl) {
              imageUrl = skinData.imageUrl;
            }
          }

          // Step 2.4: Map to Character type
          return {
            playerId: playerId.toString(),
            name: nameData.fullName,
            imageUrl,
            stance,
            weapon,
            armor,
            strength: rawData.attributes.strength,
            constitution: rawData.attributes.constitution,
            size: rawData.attributes.size,
            agility: rawData.attributes.agility,
            stamina: rawData.attributes.stamina,
            luck: rawData.attributes.luck,
          };
        } catch (error) {
          console.error(`Error fetching data for player ${playerId}:`, error);
          return null;
        }
      });

      // Wait for all promises to resolve and filter out nulls
      const results = await Promise.all(playerDataPromises);
      return results.filter(Boolean) as Character[];
    },
    enabled: Boolean(
      address && playerIds && playerIds.length > 0 && options.enabled !== false,
    ),
  });

  return {
    players,
    isLoading: isLoadingIds || isLoadingPlayers,
    error: idsError || playersError,
    refetch,
  };
}

// Advanced hook for detailed player data with all components
export function useDetailedPlayerData(playerId: number) {
  // Base player data
  const { data: rawData, isLoading: isLoadingRaw } = usePlayerData(playerId);

  // Player name
  const { data: nameData, isLoading: isLoadingName } = usePlayerName(
    rawData?.firstNameIndex,
    rawData?.surnameIndex,
  );

  // Skin data
  const { data: skinData, isLoading: isLoadingSkin } = useSkinData(playerId);

  // Combine all data
  return useQuery({
    queryKey: ["detailedPlayer", playerId, rawData, nameData, skinData],
    queryFn: async (): Promise<Character | null> => {
      if (!rawData || !nameData) return null;

      // Map equipment from skin data
      let stance: Stance = "balanced";
      let weapon: Weapon = "Sword + Shield";
      let armor: Armor = "Cloth";
      let imageUrl =
        "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW"; // Default

      if (skinData) {
        // Map equipment types
        weapon = mapWeaponToString(skinData.weapon || 0);
        armor = mapArmorToString(skinData.armor || 0);
        stance = mapStanceToString(skinData.stance || 0);

        // Use skin image URL if available
        if (skinData.imageUrl) {
          imageUrl = skinData.imageUrl;
        }
      }

      // Create character with all data
      return {
        playerId: playerId.toString(),
        name: nameData.fullName,
        nameData: {
          firstName: nameData.firstName,
          surname: nameData.surname,
          fullName: nameData.fullName,
        },
        imageUrl,
        stance,
        weapon,
        armor,
        strength: rawData.attributes.strength,
        constitution: rawData.attributes.constitution,
        size: rawData.attributes.size,
        agility: rawData.attributes.agility,
        stamina: rawData.attributes.stamina,
        luck: rawData.attributes.luck,
        // Add battle stats
        wins: rawData.wins,
        losses: rawData.losses,
        kills: rawData.kills,
      };
    },
    enabled: Boolean(playerId > 0 && rawData && nameData),
  });
}
