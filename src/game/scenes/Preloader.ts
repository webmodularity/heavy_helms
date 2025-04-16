import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import type { DecodedCombatResult } from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";
import { GameModeStrategyFactory } from "../strategies/GameModeStrategyFactory";
import type { GameModeStrategy } from "../strategies/GameModeStrategy";
import { AssetManager } from "../services/AssetManager";
import { LoadingUI } from "../ui/LoadingUI";

// Define the event name (must match React component)
const DUEL_DATA_LOADED = "duel-data-loaded";

export class Preloader extends Scene {
  // Player data
  private player1: Fighter;
  private player2: Fighter;
  // Game data
  private decodedCombatBytes: DecodedCombatResult;

  // Game mode strategy
  private strategy: GameModeStrategy;

  // Services
  private assetManager: AssetManager;

  // UI components
  private loadingUI: LoadingUI;

  constructor() {
    super("Preloader");
  }

  preload() {
    // Load loading background image first - needed for the UI
    this.load.image(
      "loading-background",
      "/backgrounds/loading-background.jpg",
    );

    // Register complete callback for this initial load
    this.load.once("complete", this.onLoadingBackgroundComplete, this);

    // Start loading the background image
    this.load.start();
  }

  private async onLoadingBackgroundComplete() {
    // Initialize services
    this.assetManager = new AssetManager(this);

    // Create loading UI now that the background is loaded
    this.loadingUI = new LoadingUI(this);

    // Create and initialize the appropriate strategy
    this.strategy = GameModeStrategyFactory.createStrategy(this);
    await this.strategy.initialize(this);

    // Start the initial assets loading stage
    this.loadingUI.startStage("initialAssets");

    // Set up loading events for the main assets
    this.assetManager.onLoadComplete(this.onMainAssetsComplete, this);

    // Emit status update
    this.events.emit("status-update", "Loading game assets...");

    // Queue all initial assets
    this.assetManager.loadInitialAssets();

    // Start loading the queued assets
    this.assetManager.startLoading();
  }

  private async onMainAssetsComplete() {
    try {
      // Complete the initial assets stage
      this.loadingUI.completeStage();

      // Start the fighter data loading stage
      this.loadingUI.startStage("fighterData");
      this.events.emit("status-update", "Loading fighter data...");

      // Load player data using the selected strategy
      const { player1, player2 } = await this.strategy.loadPlayerData();
      this.player1 = player1;
      this.player2 = player2;

      // Complete the fighter data stage
      this.loadingUI.completeStage();

      // Start the combat data loading stage
      this.loadingUI.startStage("combatData");
      this.events.emit("status-update", "Loading combat data...");

      // Load combat data using the selected strategy
      this.decodedCombatBytes = await this.strategy.loadCombatData();

      // Complete the combat data stage
      this.loadingUI.completeStage();

      // Start the fighter assets loading stage
      this.loadingUI.startStage("fighterAssets");
      this.events.emit("status-update", "Loading fighter assets...");

      // Load player spritesheets
      this.assetManager.loadFighterAssets(this.player1, this.player2);

      // Remove the complete listener to avoid duplicate calls
      this.assetManager.offLoadComplete(this.onMainAssetsComplete, this);

      // Start loading the queued player assets
      this.assetManager.startLoading();

      // Add a new one-time listener for the player assets
      this.assetManager.onceLoadComplete(() => {
        // Complete the fighter assets stage
        this.loadingUI.completeStage();

        // Start the finalizing stage
        this.loadingUI.startStage("finalizing");
        this.events.emit("status-update", "Finalizing...");

        // Emit the data needed by the React UI before starting the next scene
        console.log("Preloader EventBus instance:", EventBus); 
        console.log("Phaser emitting DUEL_DATA_LOADED");
        EventBus.emit(DUEL_DATA_LOADED, {
          player1: this.player1,
          player2: this.player2,
          decodedCombatBytes: this.decodedCombatBytes,
        });

        // Simulate a small delay for final preparations
        setTimeout(() => {
          // Complete the finalizing stage
          this.loadingUI.completeStage();

          // Start the next scene
          this.startFightScene();
        }, 500);
      }, this);
    } catch (error) {
      console.error("FATAL ERROR: Failed to load game data:", error);
      this.loadingUI.showError("Failed to load game data. Please try again.");
    }
  }

  private startFightScene() {
    try {
      // Get scene data from strategy
      const sceneData = this.strategy.prepareSceneData();

      // Hide loading UI before transitioning
      this.loadingUI.hide();

      // Start the fight scene
      this.scene.start("FightScene", sceneData);

      // Let React know that the scene is ready
      EventBus.emit("current-scene-ready", this);
    } catch (error) {
      console.error("Error starting fight:", error);
      this.loadingUI.showError("Error starting game. Please try again.");
    }
  }
}
