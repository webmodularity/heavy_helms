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
  private txId: string;
  private network: string;
  private blockNumber: string;
  private decodedCombatBytes: DecodedCombatResult;
  private duelGameContractAddress: Address;

  async initialize(scene: Scene): Promise<void> {
    this.scene = scene;

    // Get transaction ID from registry first, then URL parameters
    const txIdFromRegistry = scene.game.registry.get("txId");
    const params = new URLSearchParams(window.location.search);
    const txIdFromUrl = params.get("txId");

    this.txId = txIdFromRegistry || txIdFromUrl || "";

    // Get network
    this.network =
      params.get("network") ||
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ||
      "mainnet";

    // Get duel game contract address
    this.duelGameContractAddress = process.env
      .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as Address;
  }

  canHandle(scene: Scene): boolean {
    // Check if we're in duel mode (txId provided via registry or URL)
    const txIdFromRegistry = scene.game.registry.get("txId");
    const params = new URLSearchParams(window.location.search);
    const txIdFromUrl = params.get("txId");

    return !!(txIdFromRegistry || txIdFromUrl);
  }

  async loadPlayerData(): Promise<{ player1: Fighter; player2: Fighter }> {
    // Load combat result data to get player info
    const { player1, player2, blockNumber, decodedCombatBytes } =
      await CombatService.loadCombatResultFromTx(
        this.txId,
        0,
        this.duelGameContractAddress,
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
