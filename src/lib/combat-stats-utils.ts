import type { RawCombatResult } from "@/types/game.types";

/**
 * Combat performance metrics calculated from the raw combat result
 */
export interface CombatPerformanceMetrics {
  player1: PlayerCombatMetrics;
  player2: PlayerCombatMetrics;
  summary: CombatSummaryMetrics;
}

export interface PlayerCombatMetrics {
  totalDamage: number;
  totalStaminaLost: number;
  attacks: number;
  hits: number;
  misses: number;
  crits: number;
  blocks: number;
  counters: number;
  dodges: number;
  parries: number;
  ripostes: number;
  defensiveActions: number;
  maxDamage: number;

  // Health and stamina metrics
  maxHealth?: number;
  maxStamina?: number;
  endingHealth?: number;
  endingStamina?: number;

  // Calculated metrics
  accuracy: number; // hits / attacks
  critRate: number; // crits / hits
  avgDamage: number; // totalDamage / hits
  defenseRate: number; // defensiveActions / (attacks received)
  healthRemaining?: number; // endingHealth / maxHealth (percentage)
  staminaRemaining?: number; // endingStamina / maxStamina (percentage)
}

export interface CombatSummaryMetrics {
  winner: 1 | 2;
  winCondition: "HEALTH" | "EXHAUSTION" | "MAX_ROUNDS" | "DEATH";
  rounds: number;
  totalDamage: number;
  gameEngineVersion: number;
}

/**
 * Extract combat performance metrics from a RawCombatResult
 */
export function extractCombatMetrics(
  combatResult: RawCombatResult,
): CombatPerformanceMetrics | null {
  // Check if we have the new detailed statistics
  if (!combatResult.player1TotalDamage && !combatResult.player1Attacks) {
    return null; // Old format without detailed stats
  }

  const player1Metrics: PlayerCombatMetrics = {
    totalDamage: combatResult.player1TotalDamage || 0,
    totalStaminaLost: combatResult.player1TotalStaminaLost || 0,
    attacks: combatResult.player1Attacks || 0,
    hits: combatResult.player1Hits || 0,
    misses: combatResult.player1Misses || 0,
    crits: combatResult.player1Crits || 0,
    blocks: combatResult.player1Blocks || 0,
    counters: combatResult.player1Counters || 0,
    dodges: combatResult.player1Dodges || 0,
    parries: combatResult.player1Parries || 0,
    ripostes: combatResult.player1Ripostes || 0,
    defensiveActions: combatResult.player1DefensiveActions || 0,
    maxDamage: combatResult.player1MaxDamage || 0,

    // Health and stamina metrics
    maxHealth: combatResult.player1MaxHealth,
    maxStamina: combatResult.player1MaxStamina,
    endingHealth: combatResult.player1EndingHealth,
    endingStamina: combatResult.player1EndingStamina,

    // Calculated metrics
    accuracy: combatResult.player1Attacks
      ? (combatResult.player1Hits || 0) / combatResult.player1Attacks
      : 0,
    critRate: combatResult.player1Hits
      ? (combatResult.player1Crits || 0) / combatResult.player1Hits
      : 0,
    avgDamage: combatResult.player1Hits
      ? (combatResult.player1TotalDamage || 0) / combatResult.player1Hits
      : 0,
    defenseRate: combatResult.player2Attacks
      ? (combatResult.player1DefensiveActions || 0) /
        combatResult.player2Attacks
      : 0,
    healthRemaining:
      combatResult.player1MaxHealth &&
      combatResult.player1EndingHealth !== undefined
        ? combatResult.player1EndingHealth / combatResult.player1MaxHealth
        : undefined,
    staminaRemaining:
      combatResult.player1MaxStamina &&
      combatResult.player1EndingStamina !== undefined
        ? combatResult.player1EndingStamina / combatResult.player1MaxStamina
        : undefined,
  };

  const player2Metrics: PlayerCombatMetrics = {
    totalDamage: combatResult.player2TotalDamage || 0,
    totalStaminaLost: combatResult.player2TotalStaminaLost || 0,
    attacks: combatResult.player2Attacks || 0,
    hits: combatResult.player2Hits || 0,
    misses: combatResult.player2Misses || 0,
    crits: combatResult.player2Crits || 0,
    blocks: combatResult.player2Blocks || 0,
    counters: combatResult.player2Counters || 0,
    dodges: combatResult.player2Dodges || 0,
    parries: combatResult.player2Parries || 0,
    ripostes: combatResult.player2Ripostes || 0,
    defensiveActions: combatResult.player2DefensiveActions || 0,
    maxDamage: combatResult.player2MaxDamage || 0,

    // Health and stamina metrics
    maxHealth: combatResult.player2MaxHealth,
    maxStamina: combatResult.player2MaxStamina,
    endingHealth: combatResult.player2EndingHealth,
    endingStamina: combatResult.player2EndingStamina,

    // Calculated metrics
    accuracy: combatResult.player2Attacks
      ? (combatResult.player2Hits || 0) / combatResult.player2Attacks
      : 0,
    critRate: combatResult.player2Hits
      ? (combatResult.player2Crits || 0) / combatResult.player2Hits
      : 0,
    avgDamage: combatResult.player2Hits
      ? (combatResult.player2TotalDamage || 0) / combatResult.player2Hits
      : 0,
    defenseRate: combatResult.player1Attacks
      ? (combatResult.player2DefensiveActions || 0) /
        combatResult.player1Attacks
      : 0,
    healthRemaining:
      combatResult.player2MaxHealth &&
      combatResult.player2EndingHealth !== undefined
        ? combatResult.player2EndingHealth / combatResult.player2MaxHealth
        : undefined,
    staminaRemaining:
      combatResult.player2MaxStamina &&
      combatResult.player2EndingStamina !== undefined
        ? combatResult.player2EndingStamina / combatResult.player2MaxStamina
        : undefined,
  };

  const summary: CombatSummaryMetrics = {
    winner: combatResult.player1Won ? 1 : 2,
    winCondition: combatResult.winCondition || "HEALTH",
    rounds: combatResult.roundCount || 0,
    totalDamage:
      (combatResult.player1TotalDamage || 0) +
      (combatResult.player2TotalDamage || 0),
    gameEngineVersion: combatResult.gameEngineVersion || 0,
  };

  return {
    player1: player1Metrics,
    player2: player2Metrics,
    summary,
  };
}

/**
 * Format accuracy as a percentage
 */
export function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`;
}

/**
 * Format damage numbers with commas
 */
export function formatDamage(damage: number): string {
  return damage.toLocaleString();
}

/**
 * Get a performance rating based on combat metrics
 */
export function getPerformanceRating(
  metrics: PlayerCombatMetrics,
): "Excellent" | "Good" | "Average" | "Poor" {
  const score =
    metrics.accuracy * 0.4 + metrics.critRate * 0.3 + metrics.defenseRate * 0.3;

  if (score >= 0.7) return "Excellent";
  if (score >= 0.5) return "Good";
  if (score >= 0.3) return "Average";
  return "Poor";
}

/**
 * Check if a combat result has the new detailed statistics
 */
export function hasDetailedStats(combatResult: RawCombatResult): boolean {
  return !!(
    combatResult.player1TotalDamage !== undefined ||
    combatResult.player1Attacks !== undefined
  );
}

/**
 * Check if a combat result has health and stamina data
 */
export function hasHealthStaminaData(combatResult: RawCombatResult): boolean {
  return !!(
    combatResult.player1MaxHealth !== undefined ||
    combatResult.player1MaxStamina !== undefined
  );
}

/**
 * Format health remaining as a percentage
 */
export function formatHealthRemaining(healthRemaining?: number): string {
  if (healthRemaining === undefined) return "N/A";
  return `${(healthRemaining * 100).toFixed(1)}%`;
}

/**
 * Format stamina remaining as a percentage
 */
export function formatStaminaRemaining(staminaRemaining?: number): string {
  if (staminaRemaining === undefined) return "N/A";
  return `${(staminaRemaining * 100).toFixed(1)}%`;
}

/**
 * Format health display (ending/max)
 */
export function formatHealthDisplay(
  endingHealth?: number,
  maxHealth?: number,
): string {
  if (endingHealth === undefined || maxHealth === undefined) return "N/A";
  return `${endingHealth}/${maxHealth}`;
}

/**
 * Format stamina display (ending/max)
 */
export function formatStaminaDisplay(
  endingStamina?: number,
  maxStamina?: number,
): string {
  if (endingStamina === undefined || maxStamina === undefined) return "N/A";
  return `${endingStamina}/${maxStamina}`;
}

/**
 * Get health status color based on remaining percentage
 */
export function getHealthStatusColor(
  healthRemaining?: number,
): "green" | "yellow" | "red" | "gray" {
  if (healthRemaining === undefined) return "gray";
  if (healthRemaining > 0.6) return "green";
  if (healthRemaining > 0.3) return "yellow";
  return "red";
}

/**
 * Get stamina status color based on remaining percentage
 */
export function getStaminaStatusColor(
  staminaRemaining?: number,
): "green" | "yellow" | "red" | "gray" {
  if (staminaRemaining === undefined) return "gray";
  if (staminaRemaining > 0.6) return "green";
  if (staminaRemaining > 0.3) return "yellow";
  return "red";
}
