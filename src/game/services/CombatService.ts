import { fetchRawCombatResultByTx } from "@/lib/combat-api";
import type { DecodedCombatResult, RawCombatResult } from "@/types/game.types";
import type { PlayerLoadout } from "@/types/player.types";
import { BlockchainService } from "./BlockchainService";
import type { Address } from "viem";
import {
  buildRawFighterFromDecodedData,
  convertRawFighterToFighter,
} from "@/lib/player-api";
import type { Fighter } from "@/types/fighter-types";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CombatService {
  /**
   * Load combat data from transaction ID
   */
  static async loadCombatResultFromTx(txId: string): Promise<{
    combatResult: RawCombatResult;
    decodedCombatBytes: DecodedCombatResult;
    player1: Fighter;
    player2: Fighter;
    blockNumber: string;
  }> {
    try {
      // Fetch combat results
      const combatResult = await fetchRawCombatResultByTx(txId);

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
}
