import type { Skin } from "./skin.types";

// Enum for fighter types
export enum FighterType {
  Player = "Player",
  DefaultPlayer = "DefaultPlayer",
  Monster = "Monster",
}

// Base fighter name interface
export interface FighterName {
  fullName: string;
}

// Common attributes for all fighters
export interface FighterAttributes {
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}

// Common record tracking for all fighters
export interface FighterRecord {
  wins: number;
  losses: number;
  kills: number;
}

// Base Fighter interface that all fighter types implement
export interface Fighter {
  id: string;
  fighterId?: string | bigint;
  fighterType: FighterType;
  name: FighterName;
  attributes: FighterAttributes;
  currentSkin: Skin;
  record: FighterRecord;
  calculatedStats?: FighterCalculatedStats;
  currentState?: FighterState;
  isRetired: boolean;
  isImmortal: boolean;
}

// Calculated stats interface for all fighters
export interface FighterCalculatedStats {
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
  riposteChance: number;
  baseSurvivalRate: number;
}

// Current state interface for all fighters
export interface FighterState {
  currentHealth: number;
  currentEndurance: number;
}

// Raw GraphQL fighter data interface
export interface RawFighterData {
  id: string;
  fighterId: string;
  fighterType: string;
  isRetired: boolean;

  // Common attributes
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;

  // Name fields - will vary by fighter type
  firstName?: string;
  surname?: string;
  fullName?: string;

  // Skin information
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

  // Record fields
  wins: number;
  losses: number;
  kills: number;

  // Type-specific fields (optional)
  isImmortal?: boolean;
  owner?: { address: string };
  tier?: number;
}

export interface ContractInfo {
  contractFunction:
    | "playerContract"
    | "monsterContract"
    | "defaultPlayerContract";
  abi: "PlayerABI" | "MonsterABI" | "DefaultPlayerABI";
  method: "getPlayer" | "getMonster" | "getDefaultPlayer";
}
