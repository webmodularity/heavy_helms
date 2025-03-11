export interface GameConfig {
  player1Id?: string;
  player2Id?: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  requiresAuthentication: boolean;
  requiresWager: boolean;
}

export interface CombatRound {
  roundNumber: number;
  attacker: string;
  defender: string;
  attackType: string;
  defenseType: string;
  damage: number;
  isCritical: boolean;
  attackerEndurance: number;
  defenderEndurance: number;
  attackerHealth: number;
  defenderHealth: number;
}

export interface CombatResult {
  winner: string;
  loser: string;
  rounds: CombatRound[];
  winCondition: "knockout" | "surrender" | "timeout";
  gameVersion: string;
}
