import { viemClient } from "@/config";
import type { Address } from "viem";
import { GameEngineABI, PracticeGameABI, PlayerABI } from "../abi";
import { getEnumKeyByValue } from "../utils/enum-utils";
import { CombatResultType, WinCondition } from "@/types/game.types";
import type {
  DecodedCombatResult,
  CombatAction,
  RawCombatAction,
} from "@/types/game.types";
import type { PlayerLoadout, RawDecodedPlayerData } from "@/types/player.types";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BlockchainService {
  /**
   * Get the current block number
   */
  static async getCurrentBlockNumber(): Promise<string> {
    try {
      const block = await viemClient.getBlockNumber();
      return block.toString();
    } catch (error) {
      console.error("Error fetching block number:", error);
      return "Unknown";
    }
  }

  /**
   * Get game engine address from practice game contract
   */
  static async getGameEngineAddress(): Promise<Address> {
    try {
      return await viemClient.readContract({
        address: process.env
          .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
        abi: PracticeGameABI,
        functionName: "gameEngine",
      });
    } catch (error) {
      console.error("Error getting game engine address:", error);
      // Return default address as fallback
      return process.env.NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;
    }
  }

  /**
   * Generate combat bytes for practice mode
   */
  static async generateCombatBytes(
    player1Loadout: PlayerLoadout,
    player2Loadout: PlayerLoadout,
  ): Promise<`0x${string}`> {
    try {
      return await viemClient.readContract({
        address: process.env
          .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
        abi: PracticeGameABI,
        functionName: "play",
        // @ts-ignore - Using the exact same structure as before, but TypeScript is having issues
        args: [player1Loadout, player2Loadout],
      });
    } catch (error) {
      console.error("Error generating combat bytes:", error);
      throw error;
    }
  }

  /**
   * Decode combat bytes
   */
  static async decodeCombatBytes(
    combatBytes: `0x${string}`,
    gameEngineAddress: Address,
    player1Id: number,
    player2Id: number,
  ): Promise<DecodedCombatResult> {
    try {
      const decodedCombat = await viemClient.readContract({
        address: gameEngineAddress,
        abi: GameEngineABI,
        functionName: "decodeCombatLog",
        args: [combatBytes],
      });

      // Extract actions array from decodedCombat
      const rawActions = decodedCombat[3] as RawCombatAction[];

      // Map the actions with proper enum conversion
      const actions = rawActions.map((action) => ({
        p1Result: getEnumKeyByValue(CombatResultType, Number(action.p1Result)),
        p1Damage: Number(action.p1Damage),
        p1StaminaLost: Number(action.p1StaminaLost),
        p2Result: getEnumKeyByValue(CombatResultType, Number(action.p2Result)),
        p2Damage: Number(action.p2Damage),
        p2StaminaLost: Number(action.p2StaminaLost),
      })) as CombatAction[];

      const result: DecodedCombatResult = {
        winner: decodedCombat[0] ? player1Id : player2Id,
        condition: getEnumKeyByValue(
          WinCondition,
          Number(decodedCombat[2]),
        ) as keyof typeof WinCondition,
        actions: actions,
        gameEngineVersion: Number(decodedCombat[1]),
      };

      // Verify the result has the expected structure
      if (!result.actions || result.actions.length === 0) {
        throw new Error("No actions in processed result");
      }

      return result;
    } catch (error) {
      console.error("Error decoding combat bytes:", error);
      throw error;
    }
  }

  /**
   * Decode player data from combat result
   */
  static async decodeCombatPlayerData(
    player1Data: string,
    player2Data: string,
  ): Promise<{
    player1: RawDecodedPlayerData;
    player2: RawDecodedPlayerData;
  }> {
    try {
      // Check if we have valid data
      if (!player1Data || !player2Data) {
        throw new Error("Missing player data");
      }

      // Ensure data is in the correct bytes32 format
      const formatHexData = (data: string): `0x${string}` => {
        // If it doesn't start with 0x, add it
        const hexData = data.startsWith("0x") ? data : `0x${data}`;
        return hexData as `0x${string}`;
      };

      // Get player contract address
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as Address;

      // Make multicall to decode both players' data
      const results = await viemClient.multicall({
        contracts: [
          {
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: "decodePlayerData",
            args: [formatHexData(player1Data)],
          },
          {
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: "decodePlayerData",
            args: [formatHexData(player2Data)],
          },
        ],
      });

      // Check for errors
      if (results[0].status === "failure") {
        throw results[0].error;
      }
      if (results[1].status === "failure") {
        throw results[1].error;
      }

      // Extract results and properly type them
      const [player1Id, player1Stats] = results[0].result;
      const [player2Id, player2Stats] = results[1].result;

      // Create typed objects that exactly match the RawDecodedPlayerData interface
      const rawPlayer1Data: RawDecodedPlayerData = {
        id: Number(player1Id),
        stats: player1Stats,
      };

      const rawPlayer2Data: RawDecodedPlayerData = {
        id: Number(player2Id),
        stats: player2Stats,
      };

      return {
        player1: rawPlayer1Data,
        player2: rawPlayer2Data,
      };
    } catch (error) {
      console.error("Error decoding player data:", error);
      throw error;
    }
  }
}
