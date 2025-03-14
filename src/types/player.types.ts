import { WeaponType, ArmorType, StanceType } from './equipment.types';

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

export interface PlayerSkin {
  collection: SkinCollection;
  tokenId: number;
  metadataURL: string;
  imageURL: string;
  weapon: WeaponType;
  armor: ArmorType;
  stance: StanceType;
}

export interface SkinCollection {
  id: string;
  contractAddress: string;
  isVerified: boolean;
  skinType: SkinType;
  requiredNFTAddress?: string;
}

export enum SkinType {
  Player = 0,
  DefaultPlayer = 1,
  Monster = 2
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

export interface Player {
  id: string;
  name: PlayerName;
  attributes: PlayerAttributes;
  currentSkin: PlayerSkin;
  record: PlayerRecord;
  calculatedStats?: CalculatedStats;
}


export type Character = Player;



/**
 * Player action in combat
 */
export type PlayerAction =
  | "attack"
  | "block"
  | "dodge"
  | "counter"
  | "parry"
  | "rest";

/**
 * Player state during combat
 */
export interface PlayerState {
  playerId: string;
  currentHealth: number;
  maxHealth: number;
  currentEndurance: number;
  maxEndurance: number;
  lastAction: PlayerAction | null;
  isAttacker: boolean;
}

/**
 * Combat state
 */
export interface CombatState {
  player1: PlayerState;
  player2: PlayerState;
  currentTurn: number;
  isComplete: boolean;
  winner: string | null;
  turnHistory: TurnResult[];
}

/**
 * Turn result
 */
export interface TurnResult {
  attacker: string;
  defender: string;
  attackerAction: PlayerAction;
  defenderAction: PlayerAction;
  result:
    | "hit"
    | "miss"
    | "blocked"
    | "dodged"
    | "critical"
    | "countered"
    | "parried";
  damage: number;
  attackerEndurance: number;
  defenderEndurance: number;
  attackerHealth: number;
  defenderHealth: number;
  turnNumber: number;
}