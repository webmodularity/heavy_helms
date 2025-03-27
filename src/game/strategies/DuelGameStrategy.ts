import type { Scene } from "phaser";
import type { GameModeStrategy } from "./GameModeStrategy";
import type { Fighter } from "@/types/fighter-types";
import type {
  DecodedCombatResult,
  SceneData,
  RawCombatAction,
  CombatAction,
} from "@/types/game.types";
import { viemClient } from "@/config";
import { GameEngineABI, PlayerABI } from "../abi";
import { CombatResultType, WinCondition } from "@/types/game.types";
import { getEnumKeyByValue } from "../utils/enum-utils";
import type { Address } from "viem";
import { fetchRawCombatResultByTx } from "@/lib/combat-api";
import {
  buildRawFighterFromDecodedData,
  convertRawFighterToFighter,
} from "@/lib/player-api";
import type { RawDecodedPlayerData } from "@/types/player.types";

export class DuelGameStrategy implements GameModeStrategy {
  private scene: Scene;
  private player1: Fighter;
  private player2: Fighter;
  private player1Id: string;
  private player2Id: string;
  private txId: string;
  private network: string;
  private blockNumber: string;
  private decodedCombatBytes: DecodedCombatResult;
  private gameEngineAddress: Address;

  async initialize(scene: Scene): Promise<void> {
    this.scene = scene;

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);

    // Get transaction ID
    this.txId = params.get("txId") || "";

    // Get network
    this.network =
      params.get("network") ||
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ||
      "mainnet";

    // Get game engine address
    this.gameEngineAddress = process.env
      .NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;
  }

  canHandle(scene: Scene): boolean {
    // Check if we're in duel mode (txId provided)
    const params = new URLSearchParams(window.location.search);
    return !!params.get("txId");
  }

  async loadPlayerData(): Promise<{ player1: Fighter; player2: Fighter }> {
    // Load combat result data first to get player data
    const combatResult = await fetchRawCombatResultByTx(this.txId);

    // Decode player data
    const decodedPlayerData = await this.decodeCombatPlayerData(
      combatResult.player1Data,
      combatResult.player2Data,
    );

    // Store player IDs
    this.player1Id = String(decodedPlayerData.player1.id);
    this.player2Id = String(decodedPlayerData.player2.id);

    // Store block timestamp
    this.blockNumber = combatResult.blockTimestamp;

    // Build fighters from decoded data
    const rawFighter1Data = await buildRawFighterFromDecodedData(
      decodedPlayerData.player1,
    );
    const rawFighter2Data = await buildRawFighterFromDecodedData(
      decodedPlayerData.player2,
    );

    // Convert raw data to Fighter objects
    this.player1 = await convertRawFighterToFighter(rawFighter1Data);
    this.player2 = await convertRawFighterToFighter(rawFighter2Data);

    // Calculate player stats
    await this.calculatePlayerStats();

    return { player1: this.player1, player2: this.player2 };
  }

  async loadCombatData(): Promise<DecodedCombatResult> {
    // Load combat result
    const combatResult = await fetchRawCombatResultByTx(this.txId);

    // Decode the combat bytes
    this.decodedCombatBytes = await this.decodeCombatBytes(
      combatResult.packedResults as `0x${string}`,
      this.gameEngineAddress,
      Number(this.player1Id),
      Number(this.player2Id),
    );

    return this.decodedCombatBytes;
  }

  prepareSceneData(): SceneData {
    return {
      player1: this.player1,
      player2: this.player2,
      network: this.network,
      blockNumber: this.blockNumber,
      txId: this.txId,
      decodedCombatBytes: this.decodedCombatBytes,
    };
  }

  // PRIVATE METHODS

  private async calculatePlayerStats(): Promise<void> {
    // Create fighter stats objects
    const fighter1Stats = {
      weapon: this.player1.currentSkin.weapon,
      armor: this.player1.currentSkin.armor,
      stance: this.player1.currentSkin.stance,
      attributes: {
        strength: this.player1.attributes.strength,
        constitution: this.player1.attributes.constitution,
        size: this.player1.attributes.size,
        agility: this.player1.attributes.agility,
        stamina: this.player1.attributes.stamina,
        luck: this.player1.attributes.luck,
      },
    };

    const fighter2Stats = {
      weapon: this.player2.currentSkin.weapon,
      armor: this.player2.currentSkin.armor,
      stance: this.player2.currentSkin.stance,
      attributes: {
        strength: this.player2.attributes.strength,
        constitution: this.player2.attributes.constitution,
        size: this.player2.attributes.size,
        agility: this.player2.attributes.agility,
        stamina: this.player2.attributes.stamina,
        luck: this.player2.attributes.luck,
      },
    };

    // Calculate stats using multicall
    const results = await viemClient.multicall({
      contracts: [
        {
          address: this.gameEngineAddress,
          abi: GameEngineABI,
          functionName: "calculateStats",
          args: [fighter1Stats],
        },
        {
          address: this.gameEngineAddress,
          abi: GameEngineABI,
          functionName: "calculateStats",
          args: [fighter2Stats],
        },
      ],
    });

    // Check for errors and extract results
    if (results[0].status === "failure") {
      throw results[0].error;
    }
    if (results[1].status === "failure") {
      throw results[1].error;
    }

    const player1Stats = results[0].result;
    const player2Stats = results[1].result;

    // Assign calculated stats to player objects
    this.player1.calculatedStats = {
      maxHealth: Number(player1Stats.maxHealth),
      maxEndurance: Number(player1Stats.maxEndurance),
      damageModifier: Number(player1Stats.damageModifier),
      hitChance: Number(player1Stats.hitChance),
      blockChance: Number(player1Stats.blockChance),
      dodgeChance: Number(player1Stats.dodgeChance),
      critChance: Number(player1Stats.critChance),
      initiative: Number(player1Stats.initiative),
      counterChance: Number(player1Stats.counterChance),
      critMultiplier: Number(player1Stats.critMultiplier),
      parryChance: Number(player1Stats.parryChance),
      baseSurvivalRate: Number(player1Stats.baseSurvivalRate),
    };

    this.player2.calculatedStats = {
      maxHealth: Number(player2Stats.maxHealth),
      maxEndurance: Number(player2Stats.maxEndurance),
      damageModifier: Number(player2Stats.damageModifier),
      hitChance: Number(player2Stats.hitChance),
      blockChance: Number(player2Stats.blockChance),
      dodgeChance: Number(player2Stats.dodgeChance),
      critChance: Number(player2Stats.critChance),
      initiative: Number(player2Stats.initiative),
      counterChance: Number(player2Stats.counterChance),
      critMultiplier: Number(player2Stats.critMultiplier),
      parryChance: Number(player2Stats.parryChance),
      baseSurvivalRate: Number(player2Stats.baseSurvivalRate),
    };

    // Initialize player states with full health and endurance
    this.player1.currentState = {
      currentHealth: this.player1.calculatedStats.maxHealth,
      currentEndurance: this.player1.calculatedStats.maxEndurance,
    };

    this.player2.currentState = {
      currentHealth: this.player2.calculatedStats.maxHealth,
      currentEndurance: this.player2.calculatedStats.maxEndurance,
    };
  }

  private async decodeCombatBytes(
    combatBytes: `0x${string}`,
    gameEngineAddress: Address,
    player1Id: number,
    player2Id: number,
  ): Promise<DecodedCombatResult> {
    const decodedCombat = await viemClient.readContract({
      address: gameEngineAddress,
      abi: GameEngineABI,
      functionName: "decodeCombatLog",
      args: [combatBytes],
    });

    // Extract and map actions
    const rawActions = decodedCombat[3] as RawCombatAction[];
    const actions = rawActions.map((action) => ({
      p1Result: getEnumKeyByValue(CombatResultType, Number(action.p1Result)),
      p1Damage: Number(action.p1Damage),
      p1StaminaLost: Number(action.p1StaminaLost),
      p2Result: getEnumKeyByValue(CombatResultType, Number(action.p2Result)),
      p2Damage: Number(action.p2Damage),
      p2StaminaLost: Number(action.p2StaminaLost),
    }));

    const result: DecodedCombatResult = {
      winner: decodedCombat[0] ? player1Id : player2Id,
      condition: getEnumKeyByValue(
        WinCondition,
        Number(decodedCombat[2]),
      ) as keyof typeof WinCondition,
      actions: actions as CombatAction[],
      gameEngineVersion: Number(decodedCombat[1]),
    };

    // Verify the result
    if (!result.actions || result.actions.length === 0) {
      throw new Error("No actions in processed result");
    }

    return result;
  }

  private async decodeCombatPlayerData(
    player1Data: string,
    player2Data: string,
  ): Promise<{
    player1: RawDecodedPlayerData;
    player2: RawDecodedPlayerData;
  }> {
    // Check if we have valid data
    if (!player1Data || !player2Data) {
      throw new Error("Missing player data");
    }

    // Format hex data
    const formatHexData = (data: string): `0x${string}` => {
      const hexData = data.startsWith("0x") ? data : `0x${data}`;
      return hexData as `0x${string}`;
    };

    // Get player contract address
    const playerContractAddress = process.env
      .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as Address;

    // Decode player data using multicall
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

    // Extract results
    const [player1Id, player1Stats] = results[0].result;
    const [player2Id, player2Stats] = results[1].result;

    // Create typed objects
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
  }
}
