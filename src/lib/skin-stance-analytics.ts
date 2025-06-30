/**
 * Get stance display name
 */
export function getStanceName(stance: number): string {
  const names = ["Defensive", "Balanced", "Offensive"];
  return names[stance] || "Unknown";
}

/**
 * Get stance icon
 */
export function getStanceIcon(stance: number): string {
  const icons = ["🛡️", "⚖️", "⚔️"];
  return icons[stance] || "❓";
}

/**
 * Format win rate as percentage
 */
export function formatWinRate(winRate: number): string {
  return `${(winRate * 100).toFixed(1)}%`;
}

/**
 * Format damage with commas
 */
export function formatDamage(damage: number): string {
  return damage.toLocaleString();
}

/**
 * Get performance tier based on win rate
 */
export function getPerformanceTier(winRate: number): {
  tier: string;
  color: string;
  icon: string;
} {
  if (winRate >= 0.8)
    return { tier: "S-Tier", color: "text-yellow-400", icon: "⭐" };
  if (winRate >= 0.7)
    return { tier: "A-Tier", color: "text-green-400", icon: "🔥" };
  if (winRate >= 0.6)
    return { tier: "B-Tier", color: "text-blue-400", icon: "📈" };
  if (winRate >= 0.5)
    return { tier: "C-Tier", color: "text-purple-400", icon: "📊" };
  return { tier: "D-Tier", color: "text-stone-400", icon: "📉" };
}
