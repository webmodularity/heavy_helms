import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { useMemo } from "react";
import {
  GET_COMBAT_RESULTS_WITH_LOADOUTS,
  GET_PLAYER_VS_RECORDS,
  GET_SKIN_COMBAT_HISTORY,
  GET_SKIN_STANCE_COMBAT_HISTORY,
  GET_SKIN_COMBAT_ANALYTICS,
  GET_HIGHEST_KILL_RATE,
  GET_BEST_KILL_DEATH_RATIOS,
  GET_BEST_SURVIVAL_RATE,
  GET_BEST_DEFENSE,
  GET_BEST_DAMAGE_EFFICIENCY,
  GET_WIN_CONDITION_ANALYSIS,
} from "@/lib/gql-queries";

// Hook for fetching combat results with historical loadouts
export function useCombatResultsWithLoadouts(limit = 1000, skip = 0) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["combat-results-with-loadouts", limit, skip],
    queryFn: async () => {
      const response = await request<{ combatResults: unknown[] }>(
        SUBGRAPH_URL,
        GET_COMBAT_RESULTS_WITH_LOADOUTS,
        { limit, skip },
      );
      return response.combatResults || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    combatResults: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for fetching player vs player records
export function usePlayerVsRecords(playerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["player-vs-records", playerId],
    queryFn: async () => {
      const response = await request<{ playerVsRecords: unknown[] }>(
        SUBGRAPH_URL,
        GET_PLAYER_VS_RECORDS,
        { playerId },
      );
      return response.playerVsRecords || [];
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    playerVsRecords: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for fetching skin combat history
export function useSkinCombatHistory(
  skinCollectionId: string,
  skinTokenId: number,
  limit = 1000,
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["skin-combat-history", skinCollectionId, skinTokenId, limit],
    queryFn: async () => {
      const response = await request<{ combatResults: unknown[] }>(
        SUBGRAPH_URL,
        GET_SKIN_COMBAT_HISTORY,
        { skinCollectionId, skinTokenId, limit },
      );
      return response.combatResults || [];
    },
    enabled: !!skinCollectionId && skinTokenId !== undefined,
    staleTime: 5 * 60 * 1000,
  });

  return {
    combatResults: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for fetching skin + stance combination history
export function useSkinStanceCombatHistory(
  skinCollectionId: string,
  skinTokenId: number,
  stance: number,
  limit = 1000,
) {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "skin-stance-combat-history",
      skinCollectionId,
      skinTokenId,
      stance,
      limit,
    ],
    queryFn: async () => {
      const response = await request<{ combatResults: unknown[] }>(
        SUBGRAPH_URL,
        GET_SKIN_STANCE_COMBAT_HISTORY,
        { skinCollectionId, skinTokenId, stance, limit },
      );
      return response.combatResults || [];
    },
    enabled:
      !!skinCollectionId && skinTokenId !== undefined && stance !== undefined,
    staleTime: 5 * 60 * 1000,
  });

  return {
    combatResults: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for calculating skin leaderboards
export function useSkinLeaderboards(limit = 1000) {
  const { combatResults, loading, error } = useCombatResultsWithLoadouts(limit);

  const leaderboards = useMemo(() => {
    if (!combatResults || combatResults.length === 0) {
      return {
        skinLeaderboard: [],
        comboLeaderboard: [],
      };
    }

    // Calculate skin and combo statistics
    const skinStats: Record<
      string,
      {
        skinId: string;
        wins: number;
        losses: number;
        totalDamage: number;
        totalCombats: number;
        stanceBreakdown: Record<number, { fights: number; wins: number }>;
        // Add skin metadata from GraphQL
        skinCollectionId: string;
        skinTokenId: number;
        metadataURI?: string;
        weapon?: number;
        armor?: number;
      }
    > = {};

    const comboStats: Record<
      string,
      {
        comboId: string;
        skinId: string;
        stance: number;
        wins: number;
        losses: number;
        totalDamage: number;
        totalCombats: number;
        // Add skin metadata from GraphQL
        skinCollectionId: string;
        skinTokenId: number;
        metadataURI?: string;
        weapon?: number;
        armor?: number;
      }
    > = {};

    for (const combat of combatResults) {
      // Type assertion for GraphQL data
      const c = combat as {
        player1Won: boolean;
        player1SkinCollectionId: string;
        player1SkinTokenId: number;
        player1Stance: number;
        player1TotalDamage: number;
        player1Skin?: {
          id: string;
          metadataURI: string;
          weapon: number;
          armor: number;
        };
        player2SkinCollectionId: string;
        player2SkinTokenId: number;
        player2Stance: number;
        player2TotalDamage: number;
        player2Skin?: {
          id: string;
          metadataURI: string;
          weapon: number;
          armor: number;
        };
      };

      // Check if historical fields exist
      if (!c.player1SkinCollectionId || !c.player2SkinCollectionId) {
        continue; // Skip this combat if missing historical data
      }

      // Process Player 1
      const p1SkinId = `${c.player1SkinCollectionId}-${c.player1SkinTokenId}`;
      const p1ComboId = `${p1SkinId}-${c.player1Stance}`;

      // Initialize skin stats
      if (!skinStats[p1SkinId]) {
        skinStats[p1SkinId] = {
          skinId: p1SkinId,
          skinCollectionId: c.player1SkinCollectionId,
          skinTokenId: c.player1SkinTokenId,
          metadataURI: c.player1Skin?.metadataURI,
          weapon: c.player1Skin?.weapon,
          armor: c.player1Skin?.armor,
          wins: 0,
          losses: 0,
          totalDamage: 0,
          totalCombats: 0,
          stanceBreakdown: {
            0: { fights: 0, wins: 0 },
            1: { fights: 0, wins: 0 },
            2: { fights: 0, wins: 0 },
          },
        };
      }

      // Initialize combo stats
      if (!comboStats[p1ComboId]) {
        comboStats[p1ComboId] = {
          comboId: p1ComboId,
          skinId: p1SkinId,
          skinCollectionId: c.player1SkinCollectionId,
          skinTokenId: c.player1SkinTokenId,
          metadataURI: c.player1Skin?.metadataURI,
          weapon: c.player1Skin?.weapon,
          armor: c.player1Skin?.armor,
          stance: c.player1Stance,
          wins: 0,
          losses: 0,
          totalDamage: 0,
          totalCombats: 0,
        };
      }

      // Update stats
      skinStats[p1SkinId].totalCombats++;
      skinStats[p1SkinId].totalDamage += c.player1TotalDamage || 0;
      skinStats[p1SkinId].stanceBreakdown[c.player1Stance].fights++;

      comboStats[p1ComboId].totalCombats++;
      comboStats[p1ComboId].totalDamage += c.player1TotalDamage || 0;

      if (c.player1Won) {
        skinStats[p1SkinId].wins++;
        skinStats[p1SkinId].stanceBreakdown[c.player1Stance].wins++;
        comboStats[p1ComboId].wins++;
      } else {
        skinStats[p1SkinId].losses++;
        comboStats[p1ComboId].losses++;
      }

      // Process Player 2 (similar logic)
      const p2SkinId = `${c.player2SkinCollectionId}-${c.player2SkinTokenId}`;
      const p2ComboId = `${p2SkinId}-${c.player2Stance}`;

      if (!skinStats[p2SkinId]) {
        skinStats[p2SkinId] = {
          skinId: p2SkinId,
          skinCollectionId: c.player2SkinCollectionId,
          skinTokenId: c.player2SkinTokenId,
          metadataURI: c.player2Skin?.metadataURI,
          weapon: c.player2Skin?.weapon,
          armor: c.player2Skin?.armor,
          wins: 0,
          losses: 0,
          totalDamage: 0,
          totalCombats: 0,
          stanceBreakdown: {
            0: { fights: 0, wins: 0 },
            1: { fights: 0, wins: 0 },
            2: { fights: 0, wins: 0 },
          },
        };
      }

      if (!comboStats[p2ComboId]) {
        comboStats[p2ComboId] = {
          comboId: p2ComboId,
          skinId: p2SkinId,
          skinCollectionId: c.player2SkinCollectionId,
          skinTokenId: c.player2SkinTokenId,
          metadataURI: c.player2Skin?.metadataURI,
          weapon: c.player2Skin?.weapon,
          armor: c.player2Skin?.armor,
          stance: c.player2Stance,
          wins: 0,
          losses: 0,
          totalDamage: 0,
          totalCombats: 0,
        };
      }

      skinStats[p2SkinId].totalCombats++;
      skinStats[p2SkinId].totalDamage += c.player2TotalDamage || 0;
      skinStats[p2SkinId].stanceBreakdown[c.player2Stance].fights++;

      comboStats[p2ComboId].totalCombats++;
      comboStats[p2ComboId].totalDamage += c.player2TotalDamage || 0;

      if (!c.player1Won) {
        skinStats[p2SkinId].wins++;
        skinStats[p2SkinId].stanceBreakdown[c.player2Stance].wins++;
        comboStats[p2ComboId].wins++;
      } else {
        skinStats[p2SkinId].losses++;
        comboStats[p2ComboId].losses++;
      }
    }

    // Calculate win rates and create leaderboards
    const skinLeaderboard = Object.values(skinStats)
      .map((stats) => ({
        ...stats,
        winRate: stats.wins / (stats.wins + stats.losses) || 0,
        averageDamage: stats.totalDamage / stats.totalCombats || 0,
      }))
      .filter((stats) => stats.totalCombats >= 10) // Minimum 10 combats
      .sort((a, b) => b.winRate - a.winRate);

    const comboLeaderboard = Object.values(comboStats)
      .map((stats) => ({
        ...stats,
        winRate: stats.wins / (stats.wins + stats.losses) || 0,
        averageDamage: stats.totalDamage / stats.totalCombats || 0,
      }))
      .filter((stats) => stats.totalCombats >= 5) // Minimum 5 combats for combos
      .sort((a, b) => b.winRate - a.winRate);

    return {
      skinLeaderboard,
      comboLeaderboard,
    };
  }, [combatResults]);

  return {
    ...leaderboards,
    loading,
    error,
  };
}

// NEW: Enhanced skin analytics hooks using SkinCombatAnalytics entity

// Hook for comprehensive skin analytics
export function useSkinCombatAnalytics(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["skin-combat-analytics", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_SKIN_COMBAT_ANALYTICS,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    skinAnalytics: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for highest kill rate leaderboard
export function useHighestKillRate(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["highest-kill-rate", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_HIGHEST_KILL_RATE,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    lethalLoadouts: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for best kill/death ratios
export function useBestKillDeathRatios(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["best-kill-death-ratios", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_BEST_KILL_DEATH_RATIOS,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    kdRatioLeaders: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for best survival rate (tankiest loadouts)
export function useBestSurvivalRate(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["best-survival-rate", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_BEST_SURVIVAL_RATE,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    tankLoadouts: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for best defense (lowest damage taken)
export function useBestDefense(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["best-defense", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_BEST_DEFENSE,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    defensiveLoadouts: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for best damage efficiency
export function useBestDamageEfficiency(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["best-damage-efficiency", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_BEST_DAMAGE_EFFICIENCY,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    efficientLoadouts: data || [],
    loading: isLoading,
    error,
  };
}

// Hook for win condition analysis
export function useWinConditionAnalysis(minCombats = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["win-condition-analysis", minCombats],
    queryFn: async () => {
      const response = await request<{ skinCombatStats: unknown[] }>(
        SUBGRAPH_URL,
        GET_WIN_CONDITION_ANALYSIS,
        { minCombats },
      );
      return response.skinCombatStats || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    winConditionData: data || [],
    loading: isLoading,
    error,
  };
}
