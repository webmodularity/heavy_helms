import type { Skin, SkinInfo } from "./skin.types";

export interface Player {
  id: string;
  name: PlayerName;
  attributes: PlayerAttributes;
  currentSkin: Skin;
  record: PlayerRecord;
  calculatedStats?: CalculatedStats;
  currentState?: PlayerState;
  isRetired: boolean;
  isImmortal: boolean;
}

export type Character = Player;

export interface PlayerLoadout {
  playerId: number;
  skin: SkinInfo;
}

export interface RawPlayerData {
  id: string;
  firstName: string;
  surname: string;
  currentSkin: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress: string | null;
    };
    tokenId: number;
    metadataURI: string;
    weapon: number;
    armor: number;
    stance: number;
  };
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
  wins: number;
  losses: number;
  kills: number;
  isRetired: boolean;
  isImmortal: boolean;
}

export interface PlayerAttributes {
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}

export interface PlayerName {
  firstName: string;
  surname: string;
  fullName?: string; // Derived field, could be computed
}

export interface PlayerRecord {
  wins: number;
  losses: number;
  kills: number;
}

export interface CalculatedStats {
  maxHealth: number;
  maxEndurance: number;
  damageModifier: number;
  hitChance: number;
  blockChance: number;
  dodgeChance: number;
  critChance: number;
  initiative: number;
  counterChance: number;
  critMultiplier: number;
  parryChance: number;
  baseSurvivalRate: number;
}

export interface PlayerState {
  currentHealth: number;
  currentEndurance: number;
}
