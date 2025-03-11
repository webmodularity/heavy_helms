import {
  CombatActionType,
  type CombatLog,
  CombatResultType,
  type CombatTurn,
} from "@/types/blockchain.types";
import type { PlayerAction, TurnResult } from "@/types/player.types";

/**
 * Parse combat bytes from the blockchain into a structured combat log
 */
export function parseCombatBytes(
  combatBytes: Uint8Array,
  player1Id: number,
  player2Id: number,
): CombatLog {
  const turns: CombatTurn[] = [];
  let currentIndex = 0;

  // Parse each turn from the combat bytes
  while (currentIndex < combatBytes.length) {
    // Each turn is represented by 8 bytes in the combat bytes
    if (currentIndex + 8 > combatBytes.length) break;

    const turn = parseTurnBytes(
      combatBytes.slice(currentIndex, currentIndex + 8),
      player1Id,
      player2Id,
    );
    turns.push(turn);
    currentIndex += 8;
  }

  // Determine the winner based on the final health values
  const lastTurn = turns[turns.length - 1];
  const winner =
    lastTurn.attackerHealth <= 0
      ? lastTurn.defender
      : lastTurn.defenderHealth <= 0
        ? lastTurn.attacker
        : 0;

  return {
    player1Id,
    player2Id,
    turns,
    winner,
    timestamp: Date.now(),
  };
}

/**
 * Parse a single turn from combat bytes
 */
function parseTurnBytes(
  turnBytes: Uint8Array,
  player1Id: number,
  player2Id: number,
): CombatTurn {
  // Byte 0: Attacker (0 = player1, 1 = player2)
  const attackerIsPlayer1 = turnBytes[0] === 0;
  const attacker = attackerIsPlayer1 ? player1Id : player2Id;
  const defender = attackerIsPlayer1 ? player2Id : player1Id;

  // Byte 1: Attacker action (0 = attack, 1 = block, etc.)
  const attackerAction = turnBytes[1] as CombatActionType;

  // Byte 2: Defender action
  const defenderAction = turnBytes[2] as CombatActionType;

  // Byte 3: Result (0 = hit, 1 = miss, etc.)
  const result = turnBytes[3] as CombatResultType;

  // Byte 4: Damage
  const damage = turnBytes[4];

  // Byte 5: Attacker endurance
  const attackerEndurance = turnBytes[5];

  // Byte 6: Defender endurance
  const defenderEndurance = turnBytes[6];

  // Byte 7: Health reduction (applied to defender)
  const healthReduction = turnBytes[7];

  // Calculate health values (these would be tracked cumulatively in a real implementation)
  // For simplicity, we're using placeholder values here
  const attackerHealth = 100;
  const defenderHealth = 100 - healthReduction;

  return {
    attacker,
    defender,
    attackerAction,
    defenderAction,
    result,
    damage,
    attackerEndurance,
    defenderEndurance,
    attackerHealth,
    defenderHealth,
  };
}

/**
 * Convert blockchain combat turns to client-friendly turn results
 */
export function convertToTurnResults(combatLog: CombatLog): TurnResult[] {
  return combatLog.turns.map((turn, index) => {
    return {
      attacker: turn.attacker.toString(),
      defender: turn.defender.toString(),
      attackerAction: convertActionType(turn.attackerAction),
      defenderAction: convertActionType(turn.defenderAction),
      result: convertResultType(turn.result),
      damage: turn.damage,
      attackerEndurance: turn.attackerEndurance,
      defenderEndurance: turn.defenderEndurance,
      attackerHealth: turn.attackerHealth,
      defenderHealth: turn.defenderHealth,
      turnNumber: index + 1,
    };
  });
}

/**
 * Convert blockchain action type to client action type
 */
function convertActionType(actionType: CombatActionType): PlayerAction {
  const actionMap: Record<CombatActionType, PlayerAction> = {
    [CombatActionType.ATTACK]: "attack",
    [CombatActionType.BLOCK]: "block",
    [CombatActionType.DODGE]: "dodge",
    [CombatActionType.COUNTER]: "counter",
    [CombatActionType.PARRY]: "parry",
    [CombatActionType.REST]: "rest",
  };

  return actionMap[actionType];
}

/**
 * Convert blockchain result type to client result type
 */
function convertResultType(
  resultType: CombatResultType,
):
  | "hit"
  | "miss"
  | "blocked"
  | "dodged"
  | "critical"
  | "countered"
  | "parried" {
  const resultMap: Record<
    CombatResultType,
    "hit" | "miss" | "blocked" | "dodged" | "critical" | "countered" | "parried"
  > = {
    [CombatResultType.HIT]: "hit",
    [CombatResultType.MISS]: "miss",
    [CombatResultType.BLOCKED]: "blocked",
    [CombatResultType.DODGED]: "dodged",
    [CombatResultType.CRITICAL]: "critical",
    [CombatResultType.COUNTERED]: "countered",
    [CombatResultType.PARRIED]: "parried",
  };

  return resultMap[resultType];
}
