import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import type { DecodedCombatResult } from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";
import { GameModeStrategyFactory } from "../strategies/GameModeStrategyFactory";
import type { GameModeStrategy } from "../strategies/GameModeStrategy";
import { AssetManager } from "../services/AssetManager";
import { LoadingUI } from "../ui/LoadingUI";

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

  // Performance timing
  private startTime: number;
  private stageStartTime: number;

  constructor() {
    super("Preloader");
  }

  preload() {
    this.startTime = performance.now();
    this.stageStartTime = this.startTime;
    console.log("Preloader: Starting preload at", this.startTime);

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
    const elapsed = performance.now() - this.stageStartTime;
    console.log(
      `Preloader: Loading background complete (${elapsed.toFixed(1)}ms), initializing...`,
    );
    this.stageStartTime = performance.now();

    // Initialize services
    this.assetManager = new AssetManager(this);

    // Create loading UI now that the background is loaded
    this.loadingUI = new LoadingUI(this);

    // Create and initialize the appropriate strategy
    console.log("Preloader: Creating strategy...");
    this.strategy = GameModeStrategyFactory.createStrategy(this);
    console.log("Preloader: Strategy created:", this.strategy.constructor.name);

    await this.strategy.initialize(this);
    const strategyElapsed = performance.now() - this.stageStartTime;
    console.log(
      `Preloader: Strategy initialized (${strategyElapsed.toFixed(1)}ms)`,
    );
    this.stageStartTime = performance.now();

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
    console.log("Preloader: Started loading initial assets");
  }

  private async onMainAssetsComplete() {
    const elapsed = performance.now() - this.stageStartTime;
    console.log(
      `Preloader: Main assets complete (${elapsed.toFixed(1)}ms), starting data loading...`,
    );
    this.stageStartTime = performance.now();

    try {
      // Complete the initial assets stage
      this.loadingUI.completeStage();

      // Start the fighter data loading stage
      this.loadingUI.startStage("fighterData");
      this.events.emit("status-update", "Loading fighter data...");

      console.log("Preloader: Loading player data...");
      // Load player data using the selected strategy
      const { player1, player2 } = await this.strategy.loadPlayerData();
      this.player1 = player1;
      this.player2 = player2;
      const playerDataElapsed = performance.now() - this.stageStartTime;
      console.log(
        `Preloader: Player data loaded (${playerDataElapsed.toFixed(1)}ms)`,
        {
          player1: player1?.id,
          player2: player2?.id,
        },
      );
      this.stageStartTime = performance.now();

      // Complete the fighter data stage
      this.loadingUI.completeStage();

      // Start the combat data loading stage
      this.loadingUI.startStage("combatData");
      this.events.emit("status-update", "Loading combat data...");

      console.log("Preloader: Loading combat data...");
      // Load combat data using the selected strategy
      this.decodedCombatBytes = await this.strategy.loadCombatData();
      const combatDataElapsed = performance.now() - this.stageStartTime;
      console.log(
        `Preloader: Combat data loaded (${combatDataElapsed.toFixed(1)}ms)`,
      );
      this.stageStartTime = performance.now();

      // Complete the combat data stage
      this.loadingUI.completeStage();

      // Start the fighter assets loading stage
      this.loadingUI.startStage("fighterAssets");
      this.events.emit("status-update", "Loading fighter assets...");

      console.log("Preloader: Loading fighter assets...");
      // Load player spritesheets
      this.assetManager.loadFighterAssets(this.player1, this.player2);

      // Remove the complete listener to avoid duplicate calls
      this.assetManager.offLoadComplete(this.onMainAssetsComplete, this);

      // Start loading the queued player assets
      this.assetManager.startLoading();

      // Add a new one-time listener for the player assets
      this.assetManager.onceLoadComplete(() => {
        const fighterAssetsElapsed = performance.now() - this.stageStartTime;
        console.log(
          `Preloader: Fighter assets loaded (${fighterAssetsElapsed.toFixed(1)}ms), finalizing...`,
        );

        // Complete the fighter assets stage
        this.loadingUI.completeStage();

        // Start the finalizing stage
        this.loadingUI.startStage("finalizing");
        this.events.emit("status-update", "Finalizing...");

        // Simulate a small delay for final preparations
        // This prevents the jarring transition if everything loads instantly
        setTimeout(() => {
          const totalElapsed = performance.now() - this.startTime;
          console.log(
            `Preloader: Starting fight scene... (Total: ${totalElapsed.toFixed(1)}ms)`,
          );

          // Complete the finalizing stage
          this.loadingUI.completeStage();

          // Start the next scene
          this.startFightScene();
        }, 100);
      }, this);
    } catch (error) {
      console.error("FATAL ERROR: Failed to load game data:", error);
      this.loadingUI.showError("Failed to load game data. Please try again.");
    }
  }

  private startFightScene() {
    try {
      console.log("Preloader: Preparing scene data...");

      // Get scene data from strategy
      const sceneData = this.strategy.prepareSceneData();
      console.log("Preloader: Scene data prepared", {
        player1: sceneData.player1?.id,
        player2: sceneData.player2?.id,
        txId: sceneData.txId,
      });

      // Hide loading UI before transitioning
      this.loadingUI.hide();

      console.log("Preloader: Starting FightScene...");
      // Start the fight scene
      this.scene.start("FightScene", sceneData);

      // Let React know that the scene is ready
      EventBus.emit("current-scene-ready", this);
      console.log("Preloader: Scene transition complete");
    } catch (error) {
      console.error("Error starting fight:", error);
      this.loadingUI.showError("Error starting game. Please try again.");
    }
  }
}
