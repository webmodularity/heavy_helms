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

// Utility function to get enum key by value
export function getEnumKeyByValue<T extends { [key: string]: number }>(
  enumObj: T,
  value: number,
): keyof T | undefined {
  return Object.keys(enumObj).find((key) => enumObj[key] === value) as
    | keyof T
    | undefined;
}
