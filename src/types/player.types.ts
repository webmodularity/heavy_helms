/**
 * Character stance type
 */
export type Stance = "offensive" | "defensive" | "balanced";

/**
 * Character weapon type
 */
export type Weapon =
  | "Sword + Shield"
  | "Battleaxe"
  | "Mace + Shield"
  | "Spear"
  | "Warhammer"
  | "Quarterstaff";

/**
 * Character armor type
 */
export type Armor = "Plate" | "Chain" | "Leather" | "Cloth";

/**
 * Character name data
 */
export interface CharacterName {
  firstName: string;
  surname: string;
  fullName: string;
}

/**
 * Character information
 */
export interface Character {
  playerId: string;
  name: string;
  nameData?: CharacterName;
  imageUrl: string;
  stance: Stance;
  weapon: Weapon;
  armor: Armor;
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
  wins?: number;
  losses?: number;
  kills?: number;
}

/**
 * Calculated stats for a character
 */
export interface CalculatedStats {
  maxHealth: number;
  damageModifier: number;
  hitChance: number;
  blockChance: number;
  dodgeChance: number;
  maxEndurance: number;
  critChance: number;
  initiative: number;
  counterChance: number;
  critMultiplier: number;
  parryChance: number;
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

export interface PlayerRecord {
  wins: number;
  losses: number;
  kills: number;
}
