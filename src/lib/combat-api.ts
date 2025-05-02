import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { GET_COMBAT_RESULT } from "./gql-queries";
import type { RawCombatResult } from "@/types/game.types";
import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { parseAbiItem, toEventSelector, decodeEventLog } from "viem";

// Blockchain contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

// CombatResult event ABI and selector
const combatResultEvent = parseAbiItem(
  "event CombatResult(bytes32 indexed player1Data, bytes32 indexed player2Data, uint32 indexed winningPlayerId, bytes packedResults)",
);
const combatResultSelector = toEventSelector(combatResultEvent);

// Simple in-memory cache to avoid repeated blockchain calls
const combatResultCache = new Map<string, RawCombatResult>();

/**
 * Fetches raw combat result by transaction hash from the subgraph
 * Falls back to direct blockchain query if subgraph hasn't indexed the transaction yet
 */
export async function fetchRawCombatResultByTx(
  txHash: string,
): Promise<RawCombatResult> {
  // Check cache first
  if (combatResultCache.has(txHash)) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return combatResultCache.get(txHash)!;
  }

  try {
    // First try subgraph
    const response = await request<{ combatResults: RawCombatResult[] }>(
      SUBGRAPH_URL,
      GET_COMBAT_RESULT,
      { txHash: txHash },
    );

    // Check if the combatResults array has at least one item
    if (response.combatResults && response.combatResults.length > 0) {
      const result = response.combatResults[0];
      combatResultCache.set(txHash, result);
      return result;
    }

    console.log(
      "Combat result not found in subgraph, falling back to blockchain...",
    );

    // If not found in subgraph, fallback to blockchain
    const blockchainResult = await fetchCombatResultFromBlockchain(txHash);
    combatResultCache.set(txHash, blockchainResult);
    return blockchainResult;
  } catch (error) {
    console.error("Error fetching raw combat result from subgraph:", error);

    // Try blockchain fallback on any error from subgraph
    try {
      console.log("Falling back to blockchain due to subgraph error...");
      const blockchainResult = await fetchCombatResultFromBlockchain(txHash);
      combatResultCache.set(txHash, blockchainResult);
      return blockchainResult;
    } catch (blockchainError) {
      console.error("Error fetching from blockchain:", blockchainError);
      throw blockchainError; // If both methods fail, throw the blockchain error
    }
  }
}

/**
 * Fallback function to get combat result directly from blockchain events
 */
async function fetchCombatResultFromBlockchain(
  txHash: string,
): Promise<RawCombatResult> {
  try {
    // Get transaction receipt to find events
    const receipt = await viemClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    // Find CombatResult event in the logs
    const combatResultLogs = receipt.logs.filter(
      (log) =>
        log.address.toLowerCase() ===
          DUEL_GAME_CONTRACT_ADDRESS.toLowerCase() &&
        log.topics[0] === combatResultSelector,
    );

    if (combatResultLogs.length === 0) {
      // More specific error
      throw new Error(
        `CombatResult event not found in transaction ${txHash}. This may indicate the transaction is still pending or hasn't emitted the expected event.`,
      );
    }

    // Parse the CombatResult event using the standalone decodeEventLog function
    const log = combatResultLogs[0];
    const decoded = decodeEventLog({
      abi: [combatResultEvent],
      data: log.data,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      topics: log.topics as any, // Type coercion may be needed
    });

    // Get transaction block data to get timestamp
    const block = await viemClient.getBlock({
      blockHash: receipt.blockHash,
    });

    // Format the result to match RawCombatResult
    const result: RawCombatResult = {
      id: txHash, // Use txHash as ID (same as subgraph)
      player1Data: decoded.args.player1Data,
      player2Data: decoded.args.player2Data,
      winningPlayerId: decoded.args.winningPlayerId.toString(),
      packedResults: decoded.args.packedResults,
      blockTimestamp: String(Number(block.timestamp)), // Convert to string to match subgraph format
      blockNumber: String(block.number),
      transactionHash: txHash,
    };

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Blockchain fallback failed: ${error.message}`);
    }
    throw new Error("Blockchain fallback failed with unknown error");
  }
}
