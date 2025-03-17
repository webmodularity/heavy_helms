import type { SkinType } from "@/types/skin.types";
import { WeaponType, ArmorType, StanceType } from "../types/equipment.types";
import type { PlayerAttributes } from "@/types/player.types";

export const WEAPON_DISPLAY_NAMES: Record<WeaponType, string> = {
  [WeaponType.SwordAndShield]: "Sword + Shield",
  [WeaponType.MaceAndShield]: "Mace + Shield",
  [WeaponType.RapierAndShield]: "Rapier + Shield",
  [WeaponType.Greatsword]: "Greatsword",
  [WeaponType.Battleaxe]: "Battleaxe",
  [WeaponType.Quarterstaff]: "Quarterstaff",
  [WeaponType.Spear]: "Spear",
};

export function getWeaponDisplayName(weapon: WeaponType): string {
  return WEAPON_DISPLAY_NAMES[weapon] || "Unknown Weapon";
}

export const ARMOR_DISPLAY_NAMES: Record<ArmorType, string> = {
  [ArmorType.Cloth]: "Cloth",
  [ArmorType.Leather]: "Leather",
  [ArmorType.Chain]: "Chain",
  [ArmorType.Plate]: "Plate",
};

export function getArmorDisplayName(armor: ArmorType): string {
  return ARMOR_DISPLAY_NAMES[armor] || "Unknown Armor";
}

export const STANCE_DISPLAY_NAMES: Record<StanceType, string> = {
  [StanceType.Defensive]: "defensive",
  [StanceType.Balanced]: "balanced",
  [StanceType.Offensive]: "offensive",
};

export function getStanceDisplayName(stance: StanceType): string {
  return STANCE_DISPLAY_NAMES[stance] || "balanced";
}

// export function getSkinTypeDisplayName(skinType: SkinType): string {
//   return SKIN_TYPE_DISPLAY_NAMES[skinType] || "Unknown Skin Type";
// }

// EQUIPMENT REQUIREMENTS FROM CONTRACT
// For each weapon type

export function getSwordAndShieldReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 0,
    size: 0,
    agility: 6,
    stamina: 0,
    luck: 0,
  };
}

export function getMaceAndShieldReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

export function getRapierAndShieldReqs(): PlayerAttributes {
  return {
    strength: 6,
    constitution: 0,
    size: 0,
    agility: 12,
    stamina: 0,
    luck: 0,
  };
}

export function getGreatswordReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 10,
    agility: 8,
    stamina: 0,
    luck: 0,
  };
}

export function getBattleaxeReqs(): PlayerAttributes {
  return {
    strength: 15,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getQuarterstaffReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getSpearReqs(): PlayerAttributes {
  return {
    strength: 8,
    constitution: 0,
    size: 8,
    agility: 10,
    stamina: 0,
    luck: 0,
  };
}

// For each armor type

export function getClothReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getLeatherReqs(): PlayerAttributes {
  return {
    strength: 5,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getChainReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 10,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getPlateReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 12,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

// Function to get weapon requirements based on weapon type
export function getWeaponRequirements(weapon: WeaponType): PlayerAttributes {
  switch (weapon) {
    case WeaponType.SwordAndShield:
      return getSwordAndShieldReqs();
    case WeaponType.MaceAndShield:
      return getMaceAndShieldReqs();
    case WeaponType.RapierAndShield:
      return getRapierAndShieldReqs();
    case WeaponType.Greatsword:
      return getGreatswordReqs();
    case WeaponType.Battleaxe:
      return getBattleaxeReqs();
    case WeaponType.Quarterstaff:
      return getQuarterstaffReqs();
    case WeaponType.Spear:
      return getSpearReqs();
    default:
      throw new Error(`Invalid weapon type: ${weapon}`);
  }
}

// Function to get armor requirements based on armor type
export function getArmorRequirements(armor: ArmorType): PlayerAttributes {
  switch (armor) {
    case ArmorType.Cloth:
      return getClothReqs();
    case ArmorType.Leather:
      return getLeatherReqs();
    case ArmorType.Chain:
      return getChainReqs();
    case ArmorType.Plate:
      return getPlateReqs();
    default:
      throw new Error(`Invalid armor type: ${armor}`);
  }
}

// Check if a player meets the requirements for a specific weapon
export function meetsWeaponRequirements(
  playerAttributes: PlayerAttributes,
  weapon: WeaponType,
): { meets: boolean; missing?: Partial<PlayerAttributes> } {
  const requirements = getWeaponRequirements(weapon);
  return meetsRequirements(playerAttributes, requirements);
}

// Check if a player meets the requirements for a specific armor
export function meetsArmorRequirements(
  playerAttributes: PlayerAttributes,
  armor: ArmorType,
): { meets: boolean; missing?: Partial<PlayerAttributes> } {
  const requirements = getArmorRequirements(armor);
  return meetsRequirements(playerAttributes, requirements);
}

// Check if a player meets both weapon and armor requirements
export function meetsEquipmentRequirements(
  playerAttributes: PlayerAttributes,
  weapon: WeaponType,
  armor: ArmorType,
): { meets: boolean; missing?: Partial<PlayerAttributes> } {
  const weaponReqs = getWeaponRequirements(weapon);
  const armorReqs = getArmorRequirements(armor);

  // Combine requirements (taking the higher value for each stat)
  const combinedReqs: PlayerAttributes = {
    strength: Math.max(weaponReqs.strength, armorReqs.strength),
    constitution: Math.max(weaponReqs.constitution, armorReqs.constitution),
    size: Math.max(weaponReqs.size, armorReqs.size),
    agility: Math.max(weaponReqs.agility, armorReqs.agility),
    stamina: Math.max(weaponReqs.stamina, armorReqs.stamina),
    luck: Math.max(weaponReqs.luck, armorReqs.luck),
  };

  return meetsRequirements(playerAttributes, combinedReqs);
}

// Helper function to check if attributes meet requirements
function meetsRequirements(
  attributes: PlayerAttributes,
  requirements: PlayerAttributes,
): { meets: boolean; missing?: Partial<PlayerAttributes> } {
  const missing: Partial<PlayerAttributes> = {};
  let hasMissing = false;

  // Check each attribute
  for (const key of Object.keys(requirements) as Array<
    keyof PlayerAttributes
  >) {
    if (requirements[key] > 0 && attributes[key] < requirements[key]) {
      missing[key] = requirements[key] - attributes[key];
      hasMissing = true;
    }
  }

  return {
    meets: !hasMissing,
    missing: hasMissing ? missing : undefined,
  };
}
