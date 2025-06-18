import { request } from "graphql-request";
import { GET_GAME_STATS } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config";

export interface GameStats {
  playerCount: number;
  activePlayerCount: number;
  retiredPlayerCount: number;
  defaultPlayerCount: number;
  monsterCount: number;
  activeMonsterCount: number;
  retiredMonsterCount: number;
  totalFightersCount: number;

  // Combat statistics
  totalWins: number;
  totalLosses: number;
  totalKills: number;

  // Duel statistics
  totalDuels: number;
  openChallenges: number;
  completedDuels: number;
  cancelledDuels: number;
  forfeitedDuels: number;

  // Gauntlet statistics
  totalGauntletsStarted: number;
  totalGauntletsCompleted: number;
  totalGauntletsRecovered: number;
  totalGauntletPrizeMoneyAwarded: bigint | number | string;
  totalGauntletFeesCollected: bigint | number | string;
  currentGauntletQueueSize: number;
  currentGauntletEntryFee: bigint | number | string;
  currentGauntletSize: number;
  currentGauntletFeePercentage: number;
  currentMinTimeBetweenGauntlets: number;

  totalFeesCollected: number;

  // Skin statistics
  skinCollectionsCount: number;
  verifiedSkinCollectionsCount: number;
  totalSkinsCount: number;

  // Owner statistics
  uniqueOwnersCount: number;

  // Timestamps
  lastUpdated: string;
}

export async function fetchGameStats(): Promise<GameStats> {
  try {
    const data = await request<{ stats: GameStats }>(
      SUBGRAPH_URL,
      GET_GAME_STATS,
    );
    return data.stats;
  } catch (error) {
    console.error("Error fetching game stats:", error);
    throw error;
  }
}
