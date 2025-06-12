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
  private blockNumber: string;
  private decodedCombatBytes: DecodedCombatResult;
  private gameEngineAddress: Address;

  async initialize(scene: Scene): Promise<void> {
    this.scene = scene;

    // Get game engine address
    this.gameEngineAddress = await BlockchainService.getGameEngineAddress();

    // Fetch current block number for reference
    this.blockNumber = await BlockchainService.getCurrentBlockNumber();
  }

  canHandle(scene: Scene): boolean {
    // This logic assumes that if 'txId' is not present in registry or URL, it's practice mode.
    const txIdFromRegistry = scene.game.registry.get("txId");
    const params = new URLSearchParams(window.location.search);
    const txIdFromUrl = params.get("txId");

    return !(txIdFromRegistry || txIdFromUrl);
  }

  async loadPlayerData(): Promise<{ player1: Fighter; player2: Fighter }> {
    // Get player 1 from registry (should be set by PhaserGame.tsx)
    this.player1 = this.scene.game.registry.get("player1");

    // If player 1 isn't available, throw an error.
    // This indicates an issue with the data flow from React to Phaser.
    if (!this.player1) {
      const p1IdFromRegistry = this.scene.game.registry.get("player1Id");
      console.error(
        "PracticeGameStrategy Error: Player 1 (Fighter object) not found in Phaser registry.",
        "player1Id in registry was:",
        p1IdFromRegistry,
      );
      throw new Error(
        "Player 1 data not found in registry. It should be set by the React wrapper.",
      );
    }

    // Get a random opponent for player 2
    const randomOpponentId = await FighterService.getRandomFighterId(
      this.player1.id,
    );
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
