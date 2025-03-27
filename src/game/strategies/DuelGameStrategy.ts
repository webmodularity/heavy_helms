import type { Scene } from "phaser";
import type { GameModeStrategy } from "./GameModeStrategy";
import type { Fighter } from "@/types/fighter-types";
import type { DecodedCombatResult, SceneData } from "@/types/game.types";
import type { Address } from "viem";
import { CombatService } from "../services/CombatService";
import { FighterService } from "../services/FighterService";

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
    // Load combat result data to get player info
    const { player1, player2, blockNumber } =
      await CombatService.loadCombatResultFromTx(this.txId);

    this.player1 = player1;
    this.player2 = player2;
    this.player1Id = player1.id;
    this.player2Id = player2.id;
    this.blockNumber = blockNumber;

    // Calculate player stats
    await FighterService.calculateFighterStats([this.player1, this.player2]);

    return { player1: this.player1, player2: this.player2 };
  }

  async loadCombatData(): Promise<DecodedCombatResult> {
    // We already loaded combat data in loadPlayerData
    const { decodedCombatBytes } = await CombatService.loadCombatResultFromTx(
      this.txId,
    );
    this.decodedCombatBytes = decodedCombatBytes;

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
