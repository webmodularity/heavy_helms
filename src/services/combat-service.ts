import type {
  CalculatedStats,
  CombatState,
  PlayerAction,
  PlayerState,
  TurnResult,
} from "@/types/player.types";
import { getPlayerCalculatedStats } from "./blockchain-service";

/**
 * Initialize a new combat state between two players
 */
export async function initializeCombat(
  player1Id: string,
  player2Id: string,
): Promise<CombatState> {
  // Get player stats from blockchain service
  const player1Stats = await getPlayerCalculatedStats(player1Id);
  const player2Stats = await getPlayerCalculatedStats(player2Id);

  if (!player1Stats || !player2Stats) {
    throw new Error("Failed to get player stats");
  }

  // Determine who goes first based on initiative
  const player1GoesFirst = determineInitiative(player1Stats, player2Stats);

  // Create player states
  const player1State: PlayerState = {
    playerId: player1Id,
    currentHealth: player1Stats.maxHealth,
    maxHealth: player1Stats.maxHealth,
    currentEndurance: player1Stats.maxEndurance,
    maxEndurance: player1Stats.maxEndurance,
    lastAction: null,
    isAttacker: player1GoesFirst,
  };

  const player2State: PlayerState = {
    playerId: player2Id,
    currentHealth: player2Stats.maxHealth,
    maxHealth: player2Stats.maxHealth,
    currentEndurance: player2Stats.maxEndurance,
    maxEndurance: player2Stats.maxEndurance,
    lastAction: null,
    isAttacker: !player1GoesFirst,
  };

  // Initialize combat state
  return {
    player1: player1State,
    player2: player2State,
    currentTurn: 1,
    isComplete: false,
    winner: null,
    turnHistory: [],
  };
}

/**
 * Process a turn in combat
 */
export async function processTurn(
  combatState: CombatState,
  attackerAction: PlayerAction,
  defenderAction: PlayerAction,
): Promise<CombatState> {
  // Make a copy of the combat state to avoid mutating the original
  const newState: CombatState = JSON.parse(JSON.stringify(combatState));

  // Determine attacker and defender
  const attacker = newState.player1.isAttacker
    ? newState.player1
    : newState.player2;
  const defender = newState.player1.isAttacker
    ? newState.player2
    : newState.player1;

  // Get player stats
  const attackerStats = await getPlayerCalculatedStats(attacker.playerId);
  const defenderStats = await getPlayerCalculatedStats(defender.playerId);

  if (!attackerStats || !defenderStats) {
    throw new Error("Failed to get player stats");
  }

  // Process endurance costs
  processEnduranceCosts(attacker, defender, attackerAction, defenderAction);

  // Determine the result of the turn
  const result = determineCombatResult(
    attackerStats,
    defenderStats,
    attackerAction,
    defenderAction,
    attacker.currentEndurance,
    defender.currentEndurance,
  );

  // Calculate damage
  const damage = calculateDamage(
    attackerStats,
    defenderStats,
    result,
    attackerAction,
    defenderAction,
  );

  // Apply damage
  if (damage > 0) {
    defender.currentHealth = Math.max(0, defender.currentHealth - damage);
  }

  // Update last actions
  attacker.lastAction = attackerAction;
  defender.lastAction = defenderAction;

  // Create turn result
  const turnResult: TurnResult = {
    attacker: attacker.playerId,
    defender: defender.playerId,
    attackerAction,
    defenderAction,
    result,
    damage,
    attackerEndurance: attacker.currentEndurance,
    defenderEndurance: defender.currentEndurance,
    attackerHealth: attacker.currentHealth,
    defenderHealth: defender.currentHealth,
    turnNumber: newState.currentTurn,
  };

  // Add turn to history
  newState.turnHistory.push(turnResult);

  // Check if combat is complete
  if (defender.currentHealth <= 0) {
    newState.isComplete = true;
    newState.winner = attacker.playerId;
  } else {
    // Swap attacker and defender roles for next turn
    newState.player1.isAttacker = !newState.player1.isAttacker;
    newState.player2.isAttacker = !newState.player2.isAttacker;

    // Increment turn counter
    newState.currentTurn++;

    // Regenerate some endurance
    regenerateEndurance(newState.player1);
    regenerateEndurance(newState.player2);
  }

  return newState;
}

/**
 * Determine which player goes first based on initiative
 */
function determineInitiative(
  player1Stats: CalculatedStats,
  player2Stats: CalculatedStats,
): boolean {
  // Higher initiative goes first
  if (player1Stats.initiative !== player2Stats.initiative) {
    return player1Stats.initiative > player2Stats.initiative;
  }

  // If initiative is tied, use a random coin flip
  return Math.random() < 0.5;
}

/**
 * Process endurance costs for actions
 */
function processEnduranceCosts(
  attacker: PlayerState,
  defender: PlayerState,
  attackerAction: PlayerAction,
  defenderAction: PlayerAction,
): void {
  // Define endurance costs for each action
  const enduranceCosts: Record<PlayerAction, number> = {
    attack: 10,
    block: 5,
    dodge: 15,
    counter: 20,
    parry: 15,
    rest: 0,
  };

  // Apply costs
  attacker.currentEndurance = Math.max(
    0,
    attacker.currentEndurance - enduranceCosts[attackerAction],
  );
  defender.currentEndurance = Math.max(
    0,
    defender.currentEndurance - enduranceCosts[defenderAction],
  );
}

/**
 * Determine the result of a combat turn
 */
function determineCombatResult(
  attackerStats: CalculatedStats,
  defenderStats: CalculatedStats,
  attackerAction: PlayerAction,
  defenderAction: PlayerAction,
  attackerEndurance: number,
  defenderEndurance: number,
):
  | "hit"
  | "miss"
  | "blocked"
  | "dodged"
  | "critical"
  | "countered"
  | "parried" {
  // If attacker is resting, it's automatically a miss
  if (attackerAction === "rest") return "miss";

  // If attacker is not attacking, it's a miss
  if (attackerAction !== "attack") return "miss";

  // Check for critical hit
  const critRoll = Math.random() * 100;
  if (critRoll <= attackerStats.critChance) return "critical";

  // Check defender's action
  switch (defenderAction) {
    case "block": {
      // Check if block is successful
      const blockRoll = Math.random() * 100;
      if (blockRoll <= defenderStats.blockChance && defenderEndurance >= 5) {
        return "blocked";
      }
      break;
    }

    case "dodge": {
      // Check if dodge is successful
      const dodgeRoll = Math.random() * 100;
      if (dodgeRoll <= defenderStats.dodgeChance && defenderEndurance >= 15) {
        return "dodged";
      }
      break;
    }

    case "counter": {
      // Check if counter is successful
      const counterRoll = Math.random() * 100;
      if (
        counterRoll <= defenderStats.counterChance &&
        defenderEndurance >= 20
      ) {
        return "countered";
      }
      break;
    }

    case "parry": {
      // Check if parry is successful
      const parryRoll = Math.random() * 100;
      if (parryRoll <= defenderStats.parryChance && defenderEndurance >= 15) {
        return "parried";
      }
      break;
    }
  }

  // If no special result, check for hit or miss
  const hitRoll = Math.random() * 100;
  return hitRoll <= attackerStats.hitChance ? "hit" : "miss";
}

/**
 * Calculate damage for a combat turn
 */
function calculateDamage(
  attackerStats: CalculatedStats,
  defenderStats: CalculatedStats,
  result:
    | "hit"
    | "miss"
    | "blocked"
    | "dodged"
    | "critical"
    | "countered"
    | "parried",
  attackerAction: PlayerAction,
  defenderAction: PlayerAction,
): number {
  // Base damage is attacker's damage modifier
  let damage = attackerStats.damageModifier;

  // Adjust damage based on result
  switch (result) {
    case "hit":
      // Normal hit, no adjustment
      break;

    case "critical":
      // Critical hit multiplies damage
      damage = Math.floor(damage * (attackerStats.critMultiplier / 100));
      break;

    case "blocked":
      // Blocked attacks deal reduced damage
      damage = Math.floor(damage * 0.3);
      break;

    case "countered":
      // Countered attacks deal no damage and may cause damage to attacker
      // (handled separately)
      damage = 0;
      break;

    case "parried":
      // Parried attacks deal no damage
      damage = 0;
      break;

    case "dodged":
      // Dodged attacks deal no damage
      damage = 0;
      break;

    case "miss":
      // Missed attacks deal no damage
      damage = 0;
      break;
  }

  // Add some randomness to damage (±20%)
  const randomFactor = 0.8 + Math.random() * 0.4;
  damage = Math.floor(damage * randomFactor);

  return damage;
}

/**
 * Regenerate endurance for a player
 */
function regenerateEndurance(player: PlayerState): void {
  // Regenerate more endurance if resting
  const regenAmount = player.lastAction === "rest" ? 30 : 10;

  // Apply regeneration, capped at max endurance
  player.currentEndurance = Math.min(
    player.maxEndurance,
    player.currentEndurance + regenAmount,
  );
}
