import { SUBGRAPH_URL } from "@/config";
import { GET_COMBAT_RESULTS_DETAILED } from "@/lib/gql-queries";
import type { RawCombatResult } from "@/types/game.types";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

/**
 * Hook to fetch combat result data for a specific transaction hash
 * Used for lazy-loading combat details when user expands a duel
 * @param transactionHash - The transaction hash to fetch combat results for
 * @param logIndex - Optional log index for gauntlet fights (defaults to 0 for duels)
 */
export function useCombatResult(
  transactionHash: string | null,
  logIndex?: number,
) {
  return useQuery({
    queryKey: ["combat-result", transactionHash, logIndex],
    queryFn: async (): Promise<RawCombatResult | null> => {
      if (!transactionHash) return null;

      try {
        const response = await request<{ combatResults: RawCombatResult[] }>(
          SUBGRAPH_URL,
          GET_COMBAT_RESULTS_DETAILED,
          { txHash: transactionHash },
        );

        const combatResults = response.combatResults || [];

        if (combatResults.length === 0) return null;

        // If logIndex is specified (gauntlet fight), find the specific result
        if (logIndex !== undefined) {
          const specificResult = combatResults.find(
            (result) => result.logIndex === logIndex,
          );
          return specificResult || null;
        }

        // For duels (or when no logIndex specified), return the first result
        return combatResults[0] || null;
      } catch (error) {
        console.error(
          `Failed to fetch combat result for ${transactionHash}${logIndex !== undefined ? ` (logIndex: ${logIndex})` : ""}:`,
          error,
        );
        throw error;
      }
    },
    enabled: !!transactionHash, // Only run query if we have a transaction hash
    staleTime: 10 * 60 * 1000, // 10 minutes - combat results don't change
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
  });
}
