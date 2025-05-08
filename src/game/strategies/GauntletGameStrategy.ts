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

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);

    // Get transaction ID
    this.txId = params.get("txId") || "";

    // Get logIndex - canHandle ensures it's a non-null, non-empty string
    // biome-ignore lint/style/noNonNullAssertion: assertion is safe due to canHandle
    const logIndexStr = params.get("logIndex")!;
    const parsedLogIndex = Number.parseInt(logIndexStr);

    if (Number.isNaN(parsedLogIndex) || parsedLogIndex < 0) {
      throw new Error(
        `GauntletGameStrategy: Invalid or negative logIndex in URL: "${logIndexStr}".`,
      );
    }
    this.logIndex = parsedLogIndex;

    // Get network
    this.network =
      params.get("network") ||
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ||
      "mainnet";

    // Get gauntlet game contract address
    this.gauntletGameContractAddress = process.env
      .NEXT_PUBLIC_GAUNTLET_GAME_CONTRACT_ADDRESS as Address;
  }

  canHandle(scene: Scene): boolean {
    // Check if we're in gauntlet mode (txId + logIndex provided)
    const params = new URLSearchParams(window.location.search);
    return !!params.get("txId") && !!params.get("logIndex");
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
    return {
      player1: this.player1,
      player2: this.player2,
      network: this.network,
      blockNumber: this.blockNumber,
      txId: this.txId,
      decodedCombatBytes: this.decodedCombatBytes,
    };
  }
}
