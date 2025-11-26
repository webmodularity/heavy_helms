import type { Scene } from "phaser";
import type { GameModeStrategy } from "./GameModeStrategy";
import type { Fighter } from "@/types/fighter-types";
import type { DecodedCombatResult, SceneData } from "@/types/game.types";
import type { Address } from "viem";
import { CombatService } from "../services/CombatService";
import { FighterService } from "../services/FighterService";

export class GauntletGameStrategy implements GameModeStrategy {
  private scene: Scene;
  private player1: Fighter;
  private player2: Fighter;
  private txId: string;
  private logIndex: number;
  private network: string;
  private blockNumber: string;
  private decodedCombatBytes: DecodedCombatResult;
  private gauntletGameContractAddress: Address;

  async initialize(scene: Scene): Promise<void> {
    this.scene = scene;

    // Try to get data from URL parameters first (for direct page access)
    const params = new URLSearchParams(window.location.search);
    const txIdFromUrl = params.get("txId");
    const logIndexFromUrl = params.get("logIndex");
    const networkFromUrl = params.get("network");

    // Determine final values, starting with URL values
    let finalTxId = txIdFromUrl;
    let finalLogIndexStr = logIndexFromUrl;

    // If not in URL, try to get from registry (for modal access)
    if (!finalTxId) {
      finalTxId = scene.game.registry.get("txId");
    }

    if (!finalLogIndexStr) {
      const registryLogIndex = scene.game.registry.get("logIndex");
      if (typeof registryLogIndex === "number") {
        finalLogIndexStr = registryLogIndex.toString();
      } else if (typeof registryLogIndex === "string") {
        finalLogIndexStr = registryLogIndex;
      }
    }

    // Validate we have the required data
    if (!finalTxId || !finalLogIndexStr) {
      throw new Error(
        "GauntletGameStrategy: Missing txId or logIndex in both URL and registry",
      );
    }

    this.txId = finalTxId;

    // Parse and validate logIndex
    const parsedLogIndex = Number.parseInt(finalLogIndexStr);
    if (Number.isNaN(parsedLogIndex) || parsedLogIndex < 0) {
      throw new Error(
        `GauntletGameStrategy: Invalid or negative logIndex: "${finalLogIndexStr}".`,
      );
    }
    this.logIndex = parsedLogIndex;

    // Get network
    this.network =
      networkFromUrl || process.env.NEXT_PUBLIC_ALCHEMY_NETWORK || "mainnet";

    // Get gauntlet game contract address
    this.gauntletGameContractAddress = process.env
      .NEXT_PUBLIC_GAUNTLET_GAME_CONTRACT_ADDRESS as Address;
  }

  canHandle(scene: Scene): boolean {
    // Check if we're in gauntlet mode (txId + logIndex provided)
    // First check URL parameters (for direct page access)
    const params = new URLSearchParams(window.location.search);
    if (params.get("txId") && params.get("logIndex")) {
      return true;
    }

    // Also check game registry (for modal access)
    const txId = scene.game.registry.get("txId");
    const logIndex = scene.game.registry.get("logIndex");
    return !!txId && logIndex !== undefined && logIndex !== null;
  }

  async loadPlayerData(): Promise<{ player1: Fighter; player2: Fighter }> {
    // Load combat result data to get player info
    const { player1, player2, blockNumber, decodedCombatBytes } =
      await CombatService.loadCombatResultFromTx(
        this.txId,
        this.logIndex,
        this.gauntletGameContractAddress,
      );

    this.player1 = player1;
    this.player2 = player2;
    this.blockNumber = blockNumber;
    // Will be used in loadCombatData
    this.decodedCombatBytes = decodedCombatBytes;
    // Calculate player stats
    await FighterService.calculateFighterStats([this.player1, this.player2]);

    return { player1: this.player1, player2: this.player2 };
  }

  async loadCombatData(): Promise<DecodedCombatResult> {
    // TODO: We already loaded combat data in loadPlayerData
    return this.decodedCombatBytes;
  }

  prepareSceneData(): SceneData {
    // Get backgroundImage from registry if available
    const backgroundImage = this.scene.game.registry.get("backgroundImage");
    
    return {
      player1: this.player1,
      player2: this.player2,
      network: this.network,
      blockNumber: this.blockNumber,
      txId: this.txId,
      decodedCombatBytes: this.decodedCombatBytes,
      backgroundImage: typeof backgroundImage === "string" ? backgroundImage : undefined,
    };
  }
}
