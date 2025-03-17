import type { SkinType } from '@/types/skin.types';
import { WeaponType, ArmorType, StanceType } from '../types/equipment.types';

export const WEAPON_DISPLAY_NAMES: Record<WeaponType, string> = {
  [WeaponType.SwordAndShield]: "Sword + Shield",
  [WeaponType.MaceAndShield]: "Mace + Shield",
  [WeaponType.RapierAndShield]: "Rapier + Shield",
  [WeaponType.Greatsword]: "Greatsword",
  [WeaponType.Battleaxe]: "Battleaxe",
  [WeaponType.Quarterstaff]: "Quarterstaff",
  [WeaponType.Spear]: "Spear"
};

export function getWeaponDisplayName(weapon: WeaponType): string {
  return WEAPON_DISPLAY_NAMES[weapon] || "Unknown Weapon";
}

export const ARMOR_DISPLAY_NAMES: Record<ArmorType, string> = {
  [ArmorType.Cloth]: "Cloth",
  [ArmorType.Leather]: "Leather",
  [ArmorType.Chain]: "Chain",
  [ArmorType.Plate]: "Plate"
};

export function getArmorDisplayName(armor: ArmorType): string {
  return ARMOR_DISPLAY_NAMES[armor] || "Unknown Armor";
}

export const STANCE_DISPLAY_NAMES: Record<StanceType, string> = {
  [StanceType.Defensive]: "defensive",
  [StanceType.Balanced]: "balanced",
  [StanceType.Offensive]: "offensive"
};

export function getStanceDisplayName(stance: StanceType): string {
  return STANCE_DISPLAY_NAMES[stance] || "balanced";
}

// export function getSkinTypeDisplayName(skinType: SkinType): string {
//   return SKIN_TYPE_DISPLAY_NAMES[skinType] || "Unknown Skin Type";
// }