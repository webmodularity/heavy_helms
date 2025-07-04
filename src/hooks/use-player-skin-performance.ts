import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { GET_PLAYER_SKIN_PERFORMANCE } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config";

export interface PlayerSkinPerformance {
  id: string;
  skinCollectionId: string;
  skinTokenId: number;
  stance: number;
  totalCombats: number;
  wins: number;
  losses: number;
  winRate: number;
  kills: number;
  deaths: number;
  killRate: number;
  survivalRate: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  damageEfficiency: number;
  lastCombat: string;
  skin: {
    id: string;
    metadataURI: string;
    weapon: number;
    armor: number;
    collection: {
      contractAddress: string;
      skinType: string;
    };
  };
}

interface PlayerSkinPerformanceResponse {
  playerSkinCombatStats: PlayerSkinPerformance[];
}

export function usePlayerSkinPerformance(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player-skin-performance", playerId],
    queryFn: async () => {
      if (!playerId) return [];

      try {
        const response = await request<PlayerSkinPerformanceResponse>(
          SUBGRAPH_URL,
          GET_PLAYER_SKIN_PERFORMANCE,
          { playerId },
        );

        const results = response.playerSkinCombatStats || [];

        // Debug logging
        console.log(`Player ${playerId} skin performance:`, {
          loadoutsFound: results.length,
          loadouts: results.map((r) => ({
            skinId: `${r.skinCollectionId}-${r.skinTokenId}`,
            stance: r.stance,
            record: `${r.wins}-${r.losses}-${r.kills}`,
            fights: r.totalCombats,
          })),
        });

        return results;
      } catch (error) {
        console.error("Error fetching player skin performance:", error);
        throw error;
      }
    },
    enabled: !!playerId,
    staleTime: 300 * 1000, // 5 minutes
  });
}
