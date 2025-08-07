import type { Fighter } from "./fighter-types";

export interface SceneData {
  player1: Fighter;
  player2: Fighter;
  network: string;
  blockNumber: string;
  txId: string;
  decodedCombatBytes: DecodedCombatResult;
  backgroundImage?: string; // Optional custom background image path
}

export enum CombatResultType {
  MISS = 0,
  ATTACK = 1,
  CRIT = 2,
  BLOCK = 3,
  COUNTER = 4,
  COUNTER_CRIT = 5,
  DODGE = 6,
  PARRY = 7,
  RIPOSTE = 8,
  RIPOSTE_CRIT = 9,
  EXHAUSTED = 10,
  HIT = 11,
}

export enum WinCondition {
  HEALTH = 0,
  EXHAUSTION = 1,
  MAX_ROUNDS = 2,
}

export const MAX_ROUNDS = 50;

export interface DecodedCombatResult {
  winner: number;
  condition: keyof typeof WinCondition;
  actions: CombatAction[];
  gameEngineVersion: number;
}

export interface CombatAction {
  p1Result: keyof typeof CombatResultType;
  p1Damage: number;
  p1StaminaLost: number;
  p2Result: keyof typeof CombatResultType;
  p2Damage: number;
  p2StaminaLost: number;
}

export interface RawCombatAction {
  p1Result: number;
  p1Damage: number;
  p1StaminaLost: number;
  p2Result: number;
  p2Damage: number;
  p2StaminaLost: number;
}

// Raw combat result from subgraph (before decoding)
export interface RawCombatResult {
  id: string;
  player1Data: string; // Encoded bytes data
  player2Data: string; // Encoded bytes data
  winningPlayerId: string;
  packedResults: string; // Encoded combat log
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
  logIndex?: number; // Optional for backward compatibility

  // New detailed combat statistics (optional for backward compatibility)
  player1Won?: boolean;
  gameEngineVersion?: number;
  winCondition?: "HEALTH" | "EXHAUSTION" | "MAX_ROUNDS" | "DEATH";
  roundCount?: number;

  // Player 1 combat statistics
  player1TotalDamage?: number;
  player1TotalStaminaLost?: number;
  player1Attacks?: number;
  player1Hits?: number;
  player1Misses?: number;
  player1Crits?: number;
  player1Blocks?: number;
  player1Counters?: number;
  player1Dodges?: number;
  player1Parries?: number;
  player1Ripostes?: number;
  player1DefensiveActions?: number;
  player1MaxDamage?: number;

  // Player 1 Failed Attack Types (attacks that didn't land due to opponent's defense)
  player1AttacksBlocked?: number; // Number of player 1's attacks that were blocked by opponent
  player1AttacksCountered?: number; // Number of player 1's attacks that were countered by opponent
  player1AttacksDodged?: number; // Number of player 1's attacks that were dodged by opponent
  player1AttacksParried?: number; // Number of player 1's attacks that were parried by opponent
  player1AttacksRiposted?: number; // Number of player 1's attacks that were riposted by opponent

  // Player 2 combat statistics
  player2TotalDamage?: number;
  player2TotalStaminaLost?: number;
  player2Attacks?: number;
  player2Hits?: number;
  player2Misses?: number;
  player2Crits?: number;
  player2Blocks?: number;
  player2Counters?: number;
  player2Dodges?: number;
  player2Parries?: number;
  player2Ripostes?: number;
  player2DefensiveActions?: number;
  player2MaxDamage?: number;

  // Player 2 Failed Attack Types (attacks that didn't land due to opponent's defense)
  player2AttacksBlocked?: number; // Number of player 2's attacks that were blocked by opponent
  player2AttacksCountered?: number; // Number of player 2's attacks that were countered by opponent
  player2AttacksDodged?: number; // Number of player 2's attacks that were dodged by opponent
  player2AttacksParried?: number; // Number of player 2's attacks that were parried by opponent
  player2AttacksRiposted?: number; // Number of player 2's attacks that were riposted by opponent

  // New health and stamina fields (calculated from player data)
  player1MaxHealth?: number;
  player1MaxStamina?: number;
  player1EndingHealth?: number;
  player1EndingStamina?: number;
  player2MaxHealth?: number;
  player2MaxStamina?: number;
  player2EndingHealth?: number;
  player2EndingStamina?: number;
}

export interface Duel {
  id: string; // This IS the transaction hash for DuelComplete events
  blockNumber: string;
  blockTimestamp: string;
  winnerId: string;
  combatResult?: {
    winCondition?: string;
    roundCount?: number;
    gameEngineVersion?: number;
    player1Won?: boolean;
    player1TotalDamage?: number;
    player2TotalDamage?: number;
    player1Crits?: number;
    player2Crits?: number;
    player1Hits?: number;
    player2Hits?: number;
    player1Attacks?: number;
    player2Attacks?: number;
    // New health and stamina fields
    player1MaxHealth?: number;
    player1MaxStamina?: number;
    player1EndingHealth?: number;
    player1EndingStamina?: number;
    player2MaxHealth?: number;
    player2MaxStamina?: number;
    player2EndingHealth?: number;
    player2EndingStamina?: number;
  };
  challenge: {
    wagerAmount: string;
    challengerId: string;
    defenderId: string;
    challengerSnapshot: {
      id: string;
      fighterId: string;
      fullName: string;
      currentSkin: {
        imageURL: string;
      };
    };
    defenderSnapshot: {
      id: string;
      fighterId: string;
      fullName: string;
      currentSkin: {
        imageURL: string;
      };
    };
  };
}
