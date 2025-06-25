import { SUBGRAPH_URL } from "@/config";
import { GET_COMBAT_RESULTS_DETAILED } from "@/lib/gql-queries";
import type { RawCombatResult } from "@/types/game.types";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

/**
 * Hook to fetch combat result data for a specific transaction hash
 * Used for lazy-loading combat details when user expands a duel
 */
export function useCombatResult(transactionHash: string | null) {
  return useQuery({
    queryKey: ["combat-result", transactionHash],
    queryFn: async (): Promise<RawCombatResult | null> => {
      if (!transactionHash) return null;

      try {
        const response = await request<{ combatResults: RawCombatResult[] }>(
          SUBGRAPH_URL,
          GET_COMBAT_RESULTS_DETAILED,
          { txHash: transactionHash },
        );

        // Return the first combat result (duels typically have one result per transaction)
        return response.combatResults?.[0] || null;
      } catch (error) {
        console.error(
          `Failed to fetch combat result for ${transactionHash}:`,
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
