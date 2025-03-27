import type { Scene } from "phaser";
import type { GameModeStrategy } from "./GameModeStrategy";
import type { Fighter } from "@/types/fighter-types";
import type { DecodedCombatResult, SceneData } from "@/types/game.types";
import type { Address } from "viem";
import { FighterService } from "../services/FighterService";
import { BlockchainService } from "../services/BlockchainService";
import { CombatService } from "../services/CombatService";

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
    this.gameEngineAddress = await BlockchainService.getGameEngineAddress();

    // Fetch current block number for reference
    this.blockNumber = await BlockchainService.getCurrentBlockNumber();
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
    const randomOpponentId = await FighterService.getRandomFighterId();
    this.player2 = await FighterService.loadFighterById(randomOpponentId);

    // Calculate player stats
    await FighterService.calculateFighterStats([this.player1, this.player2]);

    return { player1: this.player1, player2: this.player2 };
  }

  async loadCombatData(): Promise<DecodedCombatResult> {
    // Generate combat data
    this.decodedCombatBytes = await CombatService.generatePracticeModeResult(
      this.player1,
      this.player2,
      this.gameEngineAddress,
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
}
