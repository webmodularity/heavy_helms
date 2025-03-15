import type { Skin, SkinInfo } from "./skin.types";

export interface Player {
  id: string;
  name: PlayerName;
  attributes: PlayerAttributes;
  currentSkin: Skin;
  record: PlayerRecord;
  calculatedStats?: CalculatedStats;
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
