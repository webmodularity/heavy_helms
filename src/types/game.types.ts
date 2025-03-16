import type { Player } from "./player.types";

export interface SceneData {
  player1: Player;
  player2: Player;
  network: string;
  blockNumber: string;
  txId: string;
  decodedCombatBytes: DecodedCombatResult;
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
