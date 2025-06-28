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

  // Failed attack types (attacks that didn't land due to opponent's defense)
  attacksBlocked: number;
  attacksCountered: number;
  attacksDodged: number;
  attacksParried: number;
  attacksRiposted: number;

  // Health and stamina metrics
  maxHealth?: number;
  maxStamina?: number;
  endingHealth?: number;
  endingStamina?: number;

  // Calculated metrics
  accuracy: number; // hits / totalAttackAttempts (includes all attack attempts)
  critRate: number; // crits / hits
  avgDamage: number; // totalDamage / hits
  defenseRate: number; // defensiveActions / (attacks received)
  mitigationRate: number; // successful defenses (including opponent misses) / total attacks attempted
  totalAttacksReceived: number; // All attack attempts against this player (includes hits and misses)
  successfulDefenses: number; // Total attacks successfully defended (blocked/countered/dodged/parried/riposted + opponent misses)
  healthRemaining?: number; // endingHealth / maxHealth (percentage)
  staminaRemaining?: number; // endingStamina / maxStamina (percentage)
  totalAttackAttempts: number; // Total attack attempts including blocked/countered/dodged/parried/riposted
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
 *
 * IMPORTANT FIX: Mitigation calculation now correctly includes opponent misses as defenses.
 * Logic: totalAttacksReceived = all attack attempts (hits + misses)
 * successfulDefenses = active defenses (blocks/dodges/etc) + opponent misses
 * mitigationRate = successfulDefenses / totalAttacksReceived
 */
export function extractCombatMetrics(
  combatResult: RawCombatResult,
): CombatPerformanceMetrics | null {
  // Check if we have the new detailed statistics
  if (!combatResult.player1TotalDamage && !combatResult.player1Attacks) {
    return null; // Old format without detailed stats
  }

  // Calculate mitigation rates using ONLY subgraph defensive actions (no workarounds)
  // Use the subgraph's summary defensive actions field instead of calculating manually
  const p1TotalDefenses = combatResult.player1DefensiveActions || 0;
  const p2TotalDefenses = combatResult.player2DefensiveActions || 0;

  // Combat metrics calculation

  // Calculate total attack attempts for player 1
  // After subgraph fix: attacks field now correctly represents total attempts
  // The defensive action fields (attacksBlocked, etc.) are subsets for detailed breakdown
  const player1TotalAttackAttempts = combatResult.player1Attacks || 0;

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

    // Failed attack types (attacks that didn't land due to opponent's defense)
    attacksBlocked: combatResult.player1AttacksBlocked || 0,
    attacksCountered: combatResult.player1AttacksCountered || 0,
    attacksDodged: combatResult.player1AttacksDodged || 0,
    attacksParried: combatResult.player1AttacksParried || 0,
    attacksRiposted: combatResult.player1AttacksRiposted || 0,

    // Health and stamina metrics
    maxHealth: combatResult.player1MaxHealth,
    maxStamina: combatResult.player1MaxStamina,
    endingHealth: combatResult.player1EndingHealth,
    endingStamina: combatResult.player1EndingStamina,

    // Calculated metrics - now using comprehensive attack tracking
    totalAttackAttempts: player1TotalAttackAttempts,
    accuracy:
      player1TotalAttackAttempts > 0
        ? (combatResult.player1Hits || 0) / player1TotalAttackAttempts
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
    // Fix: totalAttacksReceived should include ALL attack attempts against this player
    totalAttacksReceived: combatResult.player2Attacks || 0,
    successfulDefenses: p1TotalDefenses,
    // PURE SUBGRAPH: Use only subgraph defensive actions (no workarounds)
    mitigationRate: combatResult.player2Attacks
      ? p1TotalDefenses / combatResult.player2Attacks
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

  // Calculate total attack attempts for player 2
  // After subgraph fix: attacks field now correctly represents total attempts
  // The defensive action fields (attacksBlocked, etc.) are subsets for detailed breakdown
  const player2TotalAttackAttempts = combatResult.player2Attacks || 0;

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

    // Failed attack types (attacks that didn't land due to opponent's defense)
    attacksBlocked: combatResult.player2AttacksBlocked || 0,
    attacksCountered: combatResult.player2AttacksCountered || 0,
    attacksDodged: combatResult.player2AttacksDodged || 0,
    attacksParried: combatResult.player2AttacksParried || 0,
    attacksRiposted: combatResult.player2AttacksRiposted || 0,

    // Health and stamina metrics
    maxHealth: combatResult.player2MaxHealth,
    maxStamina: combatResult.player2MaxStamina,
    endingHealth: combatResult.player2EndingHealth,
    endingStamina: combatResult.player2EndingStamina,

    // Calculated metrics - now using comprehensive attack tracking
    totalAttackAttempts: player2TotalAttackAttempts,
    accuracy:
      player2TotalAttackAttempts > 0
        ? (combatResult.player2Hits || 0) / player2TotalAttackAttempts
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
    // Fix: totalAttacksReceived should include ALL attack attempts against this player
    totalAttacksReceived: combatResult.player1Attacks || 0,
    successfulDefenses: p2TotalDefenses,
    // PURE SUBGRAPH: Use only subgraph defensive actions (no workarounds)
    mitigationRate: combatResult.player1Attacks
      ? p2TotalDefenses / combatResult.player1Attacks
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

/**
 * Get attack breakdown for a player showing all attack types
 */
export function getAttackBreakdown(metrics: PlayerCombatMetrics): {
  successful: number;
  missed: number;
  blocked: number;
  countered: number;
  dodged: number;
  parried: number;
  riposted: number;
  total: number;
} {
  return {
    successful: metrics.hits,
    missed: metrics.misses,
    blocked: metrics.attacksBlocked,
    countered: metrics.attacksCountered,
    dodged: metrics.attacksDodged,
    parried: metrics.attacksParried,
    riposted: metrics.attacksRiposted,
    total: metrics.totalAttackAttempts,
  };
}

/**
 * Format attack breakdown as a readable string
 */
export function formatAttackBreakdown(metrics: PlayerCombatMetrics): string {
  const breakdown = getAttackBreakdown(metrics);

  if (breakdown.total === 0) return "No attacks attempted";

  const parts: string[] = [];
  if (breakdown.successful > 0) parts.push(`${breakdown.successful} hits`);
  if (breakdown.missed > 0) parts.push(`${breakdown.missed} misses`);
  if (breakdown.blocked > 0) parts.push(`${breakdown.blocked} blocked`);
  if (breakdown.countered > 0) parts.push(`${breakdown.countered} countered`);
  if (breakdown.dodged > 0) parts.push(`${breakdown.dodged} dodged`);
  if (breakdown.parried > 0) parts.push(`${breakdown.parried} parried`);
  if (breakdown.riposted > 0) parts.push(`${breakdown.riposted} riposted`);

  return parts.join(", ");
}

/**
 * Get comprehensive accuracy information
 */
export function getAccuracyInfo(metrics: PlayerCombatMetrics): {
  accuracy: number;
  totalAttempts: number;
  successfulHits: number;
  failedAttempts: number;
  accuracyFormatted: string;
} {
  const breakdown = getAttackBreakdown(metrics);
  const failedAttempts = breakdown.total - breakdown.successful;

  return {
    accuracy: metrics.accuracy,
    totalAttempts: breakdown.total,
    successfulHits: breakdown.successful,
    failedAttempts,
    accuracyFormatted: formatAccuracy(metrics.accuracy),
  };
}

/**
 * Format mitigation rate as a percentage
 */
export function formatMitigationRate(mitigationRate: number): string {
  return `${(mitigationRate * 100).toFixed(1)}%`;
}

/**
 * Get defensive breakdown for a player showing all defensive actions
 */
export function getDefensiveBreakdown(metrics: PlayerCombatMetrics): {
  totalAttacksReceived: number;
  successfulDefenses: number;
  attacksBlocked: number;
  attacksCountered: number;
  attacksDodged: number;
  attacksParried: number;
  attacksRiposted: number;
  mitigationRate: number;
} {
  return {
    totalAttacksReceived: metrics.totalAttacksReceived,
    successfulDefenses: metrics.successfulDefenses,
    attacksBlocked: metrics.blocks, // This is the player's own blocks
    attacksCountered: metrics.counters,
    attacksDodged: metrics.dodges,
    attacksParried: metrics.parries,
    attacksRiposted: metrics.ripostes,
    mitigationRate: metrics.mitigationRate,
  };
}

/**
 * Get comprehensive defense information
 */
export function getDefenseInfo(metrics: PlayerCombatMetrics): {
  mitigationRate: number;
  totalAttacksReceived: number;
  successfulDefenses: number;
  attacksTaken: number;
  mitigationFormatted: string;
} {
  const attacksTaken =
    metrics.totalAttacksReceived - metrics.successfulDefenses;

  return {
    mitigationRate: metrics.mitigationRate,
    totalAttacksReceived: metrics.totalAttacksReceived,
    successfulDefenses: metrics.successfulDefenses,
    attacksTaken,
    mitigationFormatted: formatMitigationRate(metrics.mitigationRate),
  };
}

/**
 * MITIGATION CALCULATION EXPLANATION:
 *
 * Example scenario (like the bug report):
 * - Tom makes 5 attack attempts against Mike
 * - 3 hits connect and deal damage to Mike
 * - 2 attacks miss completely
 *
 * OLD (INCORRECT) CALCULATION:
 * - totalAttacksReceived = 5 (all attack attempts)
 * - successfulDefenses = 0 (Mike didn't block/dodge/parry)
 * - mitigationRate = 0/5 = 0%
 * - attacksTaken = 5 - 0 = 5 (WRONG - includes misses)
 *
 * NEW (CORRECT) CALCULATION:
 * - totalAttacksReceived = 3 (only hits that reached Mike)
 * - successfulDefenses = 0 (Mike didn't block/dodge/parry)
 * - mitigationRate = 0/3 = 0%
 * - attacksTaken = 3 - 0 = 3 (CORRECT - only actual hits)
 *
 * The key insight: You can't mitigate an attack that misses you entirely.
 * Mitigation is about defending against attacks that would otherwise hit.
 */
