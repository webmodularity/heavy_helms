import { AssetManager } from "@/game/services/AssetManager";

export class Boot extends Phaser.Scene {
  private assetManager: AssetManager;
  private loadingText: Phaser.GameObjects.Text | undefined; // Added to manage the text

  constructor() {
    super("Boot");
    this.assetManager = new AssetManager(this);
  }

  init() {
    // Emit scene ready event - this replaces EventBus.emit
    this.game.events.emit("current-scene-ready", this);
  }

  preload() {
    // Load the background image first
    this.load.image("loading-background", "/backgrounds/loading_bg.jpg");

    // After the background is loaded, set it up and show initial text
    this.load.once("complete", this.onBackgroundLoadComplete, this);
    this.load.start(); // Start loading just the background for now
  }

  private onBackgroundLoadComplete(): void {
    // Get the camera dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add the background image and properly scale it to fit the screen
    const background = this.add.image(
      width / 2,
      height / 2,
      "loading-background",
    );
    background.setOrigin(0.5, 0.5);
    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Display "Initializing Game..." text
    this.loadingText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Initializing Game...",
        {
          fontFamily: "Arial", // Using a common font initially
          fontSize: "28px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 5,
          align: "center",
        },
      )
      .setOrigin(0.5);

    // Now load other essential assets for Boot (e.g., fonts)
    this.assetManager.loadFontAssets();

    // Listen for the completion of these assets before proceeding to create
    this.load.once("complete", this.onEssentialAssetsComplete, this);
    this.load.start(); // Start loading the remaining assets (fonts)
  }

  private onEssentialAssetsComplete(): void {
    // Fonts are loaded, safe to update text if it used a custom font,
    // or proceed to create. For now, we just proceed.
    this.create();
  }

  create() {
    // The background and initial text are already set up in onBackgroundLoadComplete.
    // We can hide the "Initializing Game..." text if needed, or change it.
    // For now, we'll let it persist until Preloader starts.

    // Move to the Preloader scene
    // A small delay can prevent a visual flash if Preloader also sets up quickly.
    this.time.delayedCall(250, () => {
      if (this.loadingText) {
        this.loadingText.destroy(); // Clean up the text
      }
      this.scene.start("Preloader");
    });
  }
}
