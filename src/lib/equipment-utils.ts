import type { PlayerAttributes } from "@/types/player.types";
import { WeaponType, ArmorType, StanceType } from "../types/equipment.types";

export const WEAPON_DISPLAY_NAMES: Record<WeaponType, string> = {
  [WeaponType.ArmingSwordKite]: "Sword + Kite Shield",
  [WeaponType.MaceTower]: "Mace + Tower Shield",
  [WeaponType.RapierBuckler]: "Rapier + Buckler",
  [WeaponType.Greatsword]: "Greatsword",
  [WeaponType.Battleaxe]: "Battleaxe",
  [WeaponType.Quarterstaff]: "Quarterstaff",
  [WeaponType.Spear]: "Spear",
  [WeaponType.ShortswordBuckler]: "Shortsword + Buckler",
  [WeaponType.ShortswordTower]: "Shortsword + Tower Shield",
  [WeaponType.Daggers]: "Daggers",
  [WeaponType.RapierDagger]: "Rapier + Dagger",
  [WeaponType.ScimitarBuckler]: "Scimitar + Buckler",
  [WeaponType.AxeKite]: "Axe + Kite Shield",
  [WeaponType.AxeTower]: "Axe + Tower Shield",
  [WeaponType.Scimitars]: "Scimitars",
  [WeaponType.FlailBuckler]: "Flail + Buckler",
  [WeaponType.MaceKite]: "Mace + Kite Shield",
  [WeaponType.ClubTower]: "Club + Tower Shield",
  [WeaponType.Clubs]: "Clubs",
  [WeaponType.ArmingSwordShortsword]: "Sword + Shortsword",
  [WeaponType.ScimitarDagger]: "Scimitar + Dagger",
  [WeaponType.ArmingSwordClub]: "Sword + Club",
  [WeaponType.AxeMace]: "Axe + Mace",
  [WeaponType.FlailDagger]: "Flail + Dagger",
  [WeaponType.MaceShortsword]: "Mace + Shortsword",
  [WeaponType.Maul]: "Maul",
  [WeaponType.Trident]: "Trident",
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
  [StanceType.Defensive]: "Defensive",
  [StanceType.Balanced]: "Balanced",
  [StanceType.Offensive]: "Offensive",
};

export function getStanceDisplayName(stance: StanceType): string {
  return STANCE_DISPLAY_NAMES[stance] || "Balanced";
}

export const WEAPON_ABBREVIATED_NAMES: Record<WeaponType, string> = {
  [WeaponType.ArmingSwordKite]: "Sword + Kite",
  [WeaponType.MaceTower]: "Mace + Tower",
  [WeaponType.RapierBuckler]: "Rapier + Buckler",
  [WeaponType.Greatsword]: "Greatsword",
  [WeaponType.Battleaxe]: "Battleaxe",
  [WeaponType.Quarterstaff]: "Quarterstaff",
  [WeaponType.Spear]: "Spear",
  [WeaponType.ShortswordBuckler]: "S.Sword + Buckler",
  [WeaponType.ShortswordTower]: "S.Sword + Tower",
  [WeaponType.Daggers]: "Daggers",
  [WeaponType.RapierDagger]: "Rapier + Dagger",
  [WeaponType.ScimitarBuckler]: "Scimitar + Buckler",
  [WeaponType.AxeKite]: "Axe + Kite",
  [WeaponType.AxeTower]: "Axe + Tower",
  [WeaponType.Scimitars]: "Scimitars",
  [WeaponType.FlailBuckler]: "Flail + Buckler",
  [WeaponType.MaceKite]: "Mace + Kite",
  [WeaponType.ClubTower]: "Club + Tower",
  [WeaponType.Clubs]: "Clubs",
  [WeaponType.ArmingSwordShortsword]: "Sword + S.Sword",
  [WeaponType.ScimitarDagger]: "Scimitar + Dagger",
  [WeaponType.ArmingSwordClub]: "Sword + Club",
  [WeaponType.AxeMace]: "Axe + Mace",
  [WeaponType.FlailDagger]: "Flail + Dagger",
  [WeaponType.MaceShortsword]: "Mace + S.Sword",
  [WeaponType.Maul]: "Maul",
  [WeaponType.Trident]: "Trident",
};

export function getAbbreviatedWeaponName(weapon: WeaponType): string {
  return WEAPON_ABBREVIATED_NAMES[weapon] || `Weapon #${weapon}`;
}

// EQUIPMENT REQUIREMENTS FROM CONTRACT
// For each weapon type

export function getArmingSwordKiteReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 5,
    agility: 0,
    stamina: 5,
    luck: 0,
  };
}

export function getMaceTowerReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

export function getRapierBucklerReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 14,
    stamina: 0,
    luck: 0,
  };
}

export function getGreatswordReqs(): PlayerAttributes {
  return {
    strength: 14,
    constitution: 0,
    size: 10,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getBattleaxeReqs(): PlayerAttributes {
  return {
    strength: 16,
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
    strength: 6,
    constitution: 0,
    size: 12,
    agility: 10,
    stamina: 0,
    luck: 0,
  };
}

export function getShortswordBucklerReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getShortswordTowerReqs(): PlayerAttributes {
  return {
    strength: 6,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

export function getDualDaggersReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 8,
    stamina: 0,
    luck: 0,
  };
}

export function getRapierDaggerReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 16,
    stamina: 0,
    luck: 0,
  };
}

export function getScimitarBucklerReqs(): PlayerAttributes {
  return {
    strength: 8,
    constitution: 0,
    size: 0,
    agility: 8,
    stamina: 0,
    luck: 0,
  };
}

export function getAxeKiteReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 0,
    size: 5,
    agility: 0,
    stamina: 5,
    luck: 0,
  };
}

export function getAxeTowerReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

export function getDualScimitarsReqs(): PlayerAttributes {
  return {
    strength: 8,
    constitution: 0,
    size: 0,
    agility: 14,
    stamina: 0,
    luck: 0,
  };
}

export function getFlailBucklerReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 0,
    size: 0,
    agility: 10,
    stamina: 0,
    luck: 0,
  };
}

export function getMaceKiteReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 0,
    size: 5,
    agility: 0,
    stamina: 5,
    luck: 0,
  };
}

export function getClubTowerReqs(): PlayerAttributes {
  return {
    strength: 8,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

export function getDualClubsReqs(): PlayerAttributes {
  return {
    strength: 0,
    constitution: 0,
    size: 0,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getArmingSwordShortswordReqs(): PlayerAttributes {
  return {
    strength: 14,
    constitution: 0,
    size: 0,
    agility: 12,
    stamina: 0,
    luck: 0,
  };
}

export function getScimitarDaggerReqs(): PlayerAttributes {
  return {
    strength: 8,
    constitution: 0,
    size: 0,
    agility: 16,
    stamina: 0,
    luck: 0,
  };
}

export function getArmingSwordClubReqs(): PlayerAttributes {
  return {
    strength: 14,
    constitution: 0,
    size: 0,
    agility: 8,
    stamina: 0,
    luck: 0,
  };
}

export function getAxeMaceReqs(): PlayerAttributes {
  return {
    strength: 16,
    constitution: 0,
    size: 0,
    agility: 8,
    stamina: 0,
    luck: 0,
  };
}

export function getFlailDaggerReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 0,
    agility: 14,
    stamina: 0,
    luck: 0,
  };
}

export function getMaceShortswordReqs(): PlayerAttributes {
  return {
    strength: 14,
    constitution: 0,
    size: 0,
    agility: 10,
    stamina: 0,
    luck: 0,
  };
}

export function getMaulReqs(): PlayerAttributes {
  return {
    strength: 18,
    constitution: 0,
    size: 12,
    agility: 0,
    stamina: 0,
    luck: 0,
  };
}

export function getTridentReqs(): PlayerAttributes {
  return {
    strength: 12,
    constitution: 0,
    size: 12,
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
    strength: 8,
    constitution: 6,
    size: 0,
    agility: 0,
    stamina: 6,
    luck: 0,
  };
}

export function getPlateReqs(): PlayerAttributes {
  return {
    strength: 10,
    constitution: 8,
    size: 0,
    agility: 0,
    stamina: 8,
    luck: 0,
  };
}

// Function to get weapon requirements based on weapon type
export function getWeaponRequirements(weapon: WeaponType): PlayerAttributes {
  switch (weapon) {
    case WeaponType.ArmingSwordKite:
      return getArmingSwordKiteReqs();
    case WeaponType.MaceTower:
      return getMaceTowerReqs();
    case WeaponType.RapierBuckler:
      return getRapierBucklerReqs();
    case WeaponType.Greatsword:
      return getGreatswordReqs();
    case WeaponType.Battleaxe:
      return getBattleaxeReqs();
    case WeaponType.Quarterstaff:
      return getQuarterstaffReqs();
    case WeaponType.Spear:
      return getSpearReqs();
    case WeaponType.ShortswordBuckler:
      return getShortswordBucklerReqs();
    case WeaponType.ShortswordTower:
      return getShortswordTowerReqs();
    case WeaponType.Daggers:
      return getDualDaggersReqs();
    case WeaponType.RapierDagger:
      return getRapierDaggerReqs();
    case WeaponType.ScimitarBuckler:
      return getScimitarBucklerReqs();
    case WeaponType.AxeKite:
      return getAxeKiteReqs();
    case WeaponType.AxeTower:
      return getAxeTowerReqs();
    case WeaponType.Scimitars:
      return getDualScimitarsReqs();
    case WeaponType.FlailBuckler:
      return getFlailBucklerReqs();
    case WeaponType.MaceKite:
      return getMaceKiteReqs();
    case WeaponType.ClubTower:
      return getClubTowerReqs();
    case WeaponType.Clubs:
      return getDualClubsReqs();
    case WeaponType.ArmingSwordShortsword:
      return getArmingSwordShortswordReqs();
    case WeaponType.ScimitarDagger:
      return getScimitarDaggerReqs();
    case WeaponType.ArmingSwordClub:
      return getArmingSwordClubReqs();
    case WeaponType.AxeMace:
      return getAxeMaceReqs();
    case WeaponType.FlailDagger:
      return getFlailDaggerReqs();
    case WeaponType.MaceShortsword:
      return getMaceShortswordReqs();
    case WeaponType.Maul:
      return getMaulReqs();
    case WeaponType.Trident:
      return getTridentReqs();
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
