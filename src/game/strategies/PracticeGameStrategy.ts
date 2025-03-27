import type { Scene } from "phaser";
import type { Fighter } from "@/types/fighter-types";
import type { CombatAction, DecodedCombatResult, SceneData } from "@/types/game.types";
import type { PlayerLoadout } from "@/types/player.types";
import { fetchAndConvertFighters } from "@/lib/player-api";
import { viemClient } from "@/config";
import { GameEngineABI, PracticeGameABI } from "../abi";
import { CombatResultType, WinCondition } from "@/types/game.types";
import { getEnumKeyByValue } from "../utils/enum-utils";
import type { Address } from "viem";
import request from "graphql-request";
import { GET_ALL_ACTIVE_PLAYER_IDS_QUERY } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config";
import type { GameModeStrategy } from "./GameModeStrategy";

export class PracticeGameStrategy implements GameModeStrategy {
  private scene: Scene;
  private player1: Fighter;
  private player2: Fighter;
  private player1Id: string;
  private blockNumber: string;
  private decodedCombatBytes: DecodedCombatResult;
  private gameEngineAddress: Address;

  async initialize(scene: Scene): Promise<void> {
    this.scene = scene;

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);

    // Get player ID from URL parameters
    const p1Id = params.get("player1Id");

    // Check if player ID is valid
    if (p1Id && !Number.isNaN(Number(p1Id))) {
      this.player1Id = p1Id;
    } else {
      // Use player ID from game registry (set by React component)
      this.player1Id = scene.game.registry.get("player1Id");
    }

    // Get game engine address
    this.gameEngineAddress = process.env
      .NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;

    // Fetch current block number for reference
    await this.fetchBlockNumber();
  }

  canHandle(scene: Scene): boolean {
    // Check if we're in practice mode (no txId provided)
    const params = new URLSearchParams(window.location.search);
    return !params.get("txId");
  }

  async loadPlayerData(): Promise<{ player1: Fighter; player2: Fighter }> {
    // Get player 1 from registry
    this.player1 = this.scene.game.registry.get("player1");

    // If player 1 isn't available, throw an error
    if (!this.player1) {
      throw new Error("Player 1 data not found in registry");
    }

    // Get a random opponent for player 2
    const randomOpponentId = await this.getRandomOpponentId();
    const fighters = await fetchAndConvertFighters([randomOpponentId]);

    // Ensure we got valid fighter data
    if (!fighters || fighters.length === 0) {
      throw new Error("Failed to load opponent data");
    }

    this.player2 = fighters[0];

    // Calculate player stats
    await this.calculatePlayerStats();

    return { player1: this.player1, player2: this.player2 };
  }

  async loadCombatData(): Promise<DecodedCombatResult> {
    // Create player loadouts
    const player1Loadout: PlayerLoadout = {
      playerId: Number(this.player1.id),
      skin: {
        skinIndex: Number(this.player1.currentSkin.collection.id),
        skinTokenId: Number(this.player1.currentSkin.tokenId),
      },
    };

    const player2Loadout: PlayerLoadout = {
      playerId: Number(this.player2.id),
      skin: {
        skinIndex: Number(this.player2.currentSkin.collection.id),
        skinTokenId: Number(this.player2.currentSkin.tokenId),
      },
    };

    // Get combat bytes from practice game contract
    const combatBytes = await viemClient.readContract({
      address: process.env
        .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
      abi: PracticeGameABI,
      functionName: "play",
      // @ts-ignore - Using the exact same structure as before, but TypeScript is having issues
      args: [player1Loadout, player2Loadout],
    });

    // Decode the combat bytes
    this.decodedCombatBytes = await this.decodeCombatBytes(
      combatBytes,
      this.gameEngineAddress,
      player1Loadout.playerId,
      player2Loadout.playerId,
    );

    return this.decodedCombatBytes;
  }

  prepareSceneData(): SceneData {
    return {
      player1: this.player1,
      player2: this.player2,
      network: process.env.NEXT_PUBLIC_ALCHEMY_NETWORK || "mainnet",
      blockNumber: this.blockNumber,
      txId: "Practice",
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

  private async fetchBlockNumber(): Promise<void> {
    try {
      const block = await viemClient.getBlockNumber();
      this.blockNumber = block.toString();
    } catch (error) {
      this.blockNumber = "Unknown";
    }
  }

  private async getRandomOpponentId(): Promise<string> {
    const allActivePlayerIds = await request<{
      players: { id: string }[];
      defaultPlayers: { id: string }[];
      monsters: { id: string }[];
    }>(SUBGRAPH_URL, GET_ALL_ACTIVE_PLAYER_IDS_QUERY);

    const allPlayerIds = [
      ...allActivePlayerIds.players.map((player) => player.id),
      ...allActivePlayerIds.defaultPlayers.map((player) => player.id),
      ...allActivePlayerIds.monsters.map((player) => player.id),
    ];

    const randomIndex = Math.floor(Math.random() * allPlayerIds.length);
    return allPlayerIds[randomIndex];
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
    const rawActions = decodedCombat[3];
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
}
