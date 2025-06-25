/**
 * Win condition types and their display formatting
 */
export type WinCondition = "HEALTH" | "EXHAUSTION" | "MAX_ROUNDS" | "DEATH";

export interface WinConditionDisplay {
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Get display information for a win condition
 */
export function getWinConditionDisplay(
  winCondition?: string,
): WinConditionDisplay {
  switch (winCondition?.toUpperCase()) {
    case "HEALTH":
      return {
        label: "KO",
        icon: "💥",
        color: "text-red-400",
        description: "Knocked out by damage",
      };
    case "EXHAUSTION":
      return {
        label: "Exhaustion",
        icon: "😴",
        color: "text-blue-400",
        description: "Won by exhausting opponent",
      };
    case "MAX_ROUNDS":
      return {
        label: "Time Limit",
        icon: "⏰",
        color: "text-yellow-400",
        description: "Maximum rounds reached",
      };
    case "DEATH":
      return {
        label: "Death",
        icon: "💀",
        color: "text-purple-400",
        description: "Fatal blow delivered",
      };
    default:
      return {
        label: "Victory",
        icon: "⚔️",
        color: "text-stone-400",
        description: "Unknown win condition",
      };
  }
}

/**
 * Get a short display format for win condition
 */
export function getWinConditionShort(winCondition?: string): string {
  const display = getWinConditionDisplay(winCondition);
  return `${display.icon} ${display.label}`;
}

/**
 * Get CSS classes for win condition styling
 */
export function getWinConditionClasses(winCondition?: string): string {
  const display = getWinConditionDisplay(winCondition);
  return `${display.color} text-xs font-medium`;
}

/**
 * Get just the icon for a win condition
 */
export function getWinConditionIcon(winCondition?: string): string {
  const display = getWinConditionDisplay(winCondition);
  return display.icon;
}
