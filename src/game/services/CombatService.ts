import type { DecodedCombatResult, RawCombatResult } from "@/types/game.types";
import type { PlayerLoadout } from "@/types/player.types";
import { BlockchainService } from "./BlockchainService";
import {
  type Address,
  parseAbiItem,
  toEventSelector,
  decodeEventLog,
} from "viem";
import {
  buildRawFighterFromDecodedData,
  convertRawFighterToFighter,
} from "@/lib/player-api";
import type { Fighter } from "@/types/fighter-types";
import { request } from "graphql-request";
import { viemClient } from "@/config";
import { SUBGRAPH_URL } from "@/config";
import { GET_COMBAT_RESULTS } from "@/lib/gql-queries";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CombatService {
  /**
   * Load combat data from transaction ID
   */
  static async loadCombatResultFromTx(
    txId: string,
    logIndex: number,
    gameContractAddress: Address,
  ): Promise<{
    combatResult: RawCombatResult;
    decodedCombatBytes: DecodedCombatResult;
    player1: Fighter;
    player2: Fighter;
    blockNumber: string;
  }> {
    try {
      // Fetch combat results
      const combatResult = await CombatService.fetchRawCombatResultByTx(
        txId,
        logIndex,
        gameContractAddress,
      );

      // Decode player data
      const decodedPlayerData = await BlockchainService.decodeCombatPlayerData(
        combatResult.player1Data,
        combatResult.player2Data,
      );

      // Get game engine address
      const gameEngineAddress = process.env
        .NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;

      // Decode combat bytes
      const decodedCombatBytes = await BlockchainService.decodeCombatBytes(
        combatResult.packedResults as `0x${string}`,
        gameEngineAddress,
        Number(decodedPlayerData.player1.id),
        Number(decodedPlayerData.player2.id),
      );

      // Build fighters from decoded player data
      const rawFighter1Data = await buildRawFighterFromDecodedData(
        decodedPlayerData.player1,
      );
      const rawFighter2Data = await buildRawFighterFromDecodedData(
        decodedPlayerData.player2,
      );

      // Convert raw data to Fighter objects
      const player1 = await convertRawFighterToFighter(rawFighter1Data);
      const player2 = await convertRawFighterToFighter(rawFighter2Data);

      return {
        combatResult,
        decodedCombatBytes,
        player1,
        player2,
        blockNumber: combatResult.blockNumber,
      };
    } catch (error) {
      console.error("Error loading combat result:", error);
      throw error;
    }
  }

  /**
   * Generate combat data for practice mode
   */
  static async generatePracticeModeResult(
    player1: Fighter,
    player2: Fighter,
    gameEngineAddress: Address,
  ): Promise<DecodedCombatResult> {
    try {
      // Create player loadouts
      const player1Loadout: PlayerLoadout = {
        playerId: Number(player1.id),
        skin: {
          skinIndex: Number(player1.currentSkin.collection.id),
          skinTokenId: Number(player1.currentSkin.tokenId),
        },
        stance: player1.stance,
      };

      const player2Loadout: PlayerLoadout = {
        playerId: Number(player2.id),
        skin: {
          skinIndex: Number(player2.currentSkin.collection.id),
          skinTokenId: Number(player2.currentSkin.tokenId),
        },
        stance: player2.stance,
      };

      // Generate combat bytes
      const combatBytes = await BlockchainService.generateCombatBytes(
        player1Loadout,
        player2Loadout,
      );

      // Decode combat bytes
      return await BlockchainService.decodeCombatBytes(
        combatBytes,
        gameEngineAddress,
        player1Loadout.playerId,
        player2Loadout.playerId,
      );
    } catch (error) {
      console.error("Error generating practice mode result:", error);
      throw error;
    }
  }

  /**
   * Fetches raw combat result by transaction hash from the subgraph
   * Falls back to direct blockchain query if subgraph hasn't indexed the transaction yet
   */
  static async fetchRawCombatResultByTx(
    txHash: string,
    logIndex: number,
    gameContractAddress: Address,
  ): Promise<RawCombatResult> {
    try {
      // First try subgraph
      const response = await request<{ combatResults: RawCombatResult[] }>(
        SUBGRAPH_URL,
        GET_COMBAT_RESULTS,
        { txHash: txHash },
      );

      // Check if the combatResults array has at least one item
      if (response.combatResults && response.combatResults.length > 0) {
        return response.combatResults[logIndex];
      }

      console.log(
        "Combat result not found in subgraph, falling back to blockchain...",
      );

      // If not found in subgraph, fallback to blockchain
      const blockchainResult =
        await CombatService.fetchCombatResultFromBlockchain(
          txHash,
          logIndex,
          gameContractAddress,
        );
      return blockchainResult;
    } catch (error) {
      console.error("Error fetching raw combat result from subgraph:", error);

      // Try blockchain fallback on any error from subgraph
      try {
        console.log("Falling back to blockchain due to subgraph error...");
        const blockchainResult =
          await CombatService.fetchCombatResultFromBlockchain(
            txHash,
            logIndex,
            gameContractAddress,
          );
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
  static async fetchCombatResultFromBlockchain(
    txHash: string,
    logIndex: number,
    gameContractAddress: Address,
  ): Promise<RawCombatResult> {
    try {
      // Get transaction receipt to find events
      const receipt = await viemClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      const combatResultEvent = parseAbiItem(
        "event CombatResult(bytes32 indexed player1Data, bytes32 indexed player2Data, uint32 indexed winningPlayerId, bytes packedResults)",
      );
      const combatResultSelector = toEventSelector(combatResultEvent);

      // Find CombatResult event in the logs
      const combatResultLogs = receipt.logs.filter(
        (log) =>
          log.address.toLowerCase() === gameContractAddress.toLowerCase() &&
          log.topics[0] === combatResultSelector,
      );

      if (combatResultLogs.length === 0) {
        // More specific error
        throw new Error(
          `CombatResult event not found in transaction ${txHash}. This may indicate the transaction is still pending or hasn't emitted the expected event.`,
        );
      }

      // Parse the CombatResult event using the standalone decodeEventLog function
      const log = combatResultLogs[logIndex];
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
}
