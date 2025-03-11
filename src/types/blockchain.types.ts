/**
 * Contract addresses for the game
 */
export interface ContractAddresses {
  player: string;
  gameEngine: string;
  practiceGame: string;
  duelGame: string;
  playerSkinRegistry: string;
}

/**
 * Player skin information
 */
export interface PlayerSkin {
  skinIndex: number;
  tokenId: number;
  name: string;
  imageUrl: string;
  weaponType: "SwordAndShield" | "Battleaxe" | "Mace" | "Spear" | "Warhammer";
  armorType: "Plate" | "Chain" | "Leather" | "Cloth";
  fightingStance: "Offensive" | "Defensive" | "Balanced";
  isDefault: boolean;
  isUnlockable: boolean;
}

/**
 * Duel challenge status
 */
export type DuelChallengeStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "expired";

/**
 * Duel challenge information
 */
export interface DuelChallenge {
  challengerId: number;
  defenderId: number;
  wagerAmount: bigint;
  status: DuelChallengeStatus;
  timestamp: number;
}

/**
 * Combat action types
 */
export enum CombatActionType {
  ATTACK = 0,
  BLOCK = 1,
  DODGE = 2,
  COUNTER = 3,
  PARRY = 4,
  REST = 5,
}

/**
 * Combat result types
 */
export enum CombatResultType {
  HIT = 0,
  MISS = 1,
  BLOCKED = 2,
  DODGED = 3,
  CRITICAL = 4,
  COUNTERED = 5,
  PARRIED = 6,
}

/**
 * Combat turn information
 */
export interface CombatTurn {
  attacker: number;
  defender: number;
  attackerAction: CombatActionType;
  defenderAction: CombatActionType;
  result: CombatResultType;
  damage: number;
  attackerEndurance: number;
  defenderEndurance: number;
  attackerHealth: number;
  defenderHealth: number;
}

/**
 * Combat log information
 */
export interface CombatLog {
  player1Id: number;
  player2Id: number;
  turns: CombatTurn[];
  winner: number;
  timestamp: number;
}

export interface TransactionStatus {
  hash: `0x${string}`;
  status: "pending" | "success" | "error";
  errorMessage?: string;
}
