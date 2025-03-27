import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { GET_COMBAT_RESULT } from "./gql-queries";
import type { RawCombatResult } from "@/types/game.types";

/**
 * Fetches raw combat result by transaction hash from the subgraph
 * Using direct ID (txHash) lookup which is more efficient
 */
export async function fetchRawCombatResultByTx(
  txHash: string,
): Promise<RawCombatResult> {
  try {
    const response = await request<{ combatResult: RawCombatResult | null }>(
      SUBGRAPH_URL,
      GET_COMBAT_RESULT,
      { txHash: txHash },
    );

    if (!response.combatResult) {
      throw new Error("Combat result not found");
    }

    return response.combatResult;
  } catch (error) {
    console.error("Error fetching raw combat result from subgraph:", error);
    throw error;
  }
}
