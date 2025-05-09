import type { Scene } from "phaser";
import { LoadingProgressManager } from "./LoadingProgressManager";

export class LoadingUI {
  private scene: Scene;
  private loadingBar?: Phaser.GameObjects.Graphics;
  private statusText?: Phaser.GameObjects.Text;
  private background?: Phaser.GameObjects.Image;
  private progressManager: LoadingProgressManager;

  constructor(scene: Scene) {
    this.scene = scene;

    // Initialize progress manager
    this.progressManager = new LoadingProgressManager((progress) => {
      this.updateProgress(progress);
    });

    this.create();
    this.setupListeners();
    this.configureLoadingStages();
  }

  /**
   * Create all UI elements for the loading screen
   */
  private create(): void {
    try {
      // Get the camera dimensions
      const width = this.scene.cameras.main.width;
      const height = this.scene.cameras.main.height;

      // Add the background image and properly scale it to fit the screen
      this.background = this.scene.add.image(
        width / 2,
        height / 2,
        "loading-background",
      );

      // Set the origin to center
      this.background.setOrigin(0.5, 0.5);

      // Scale the image to cover the entire screen while maintaining aspect ratio
      const scaleX = width / this.background.width;
      const scaleY = height / this.background.height;
      const scale = Math.max(scaleX, scaleY);
      this.background.setScale(scale);

      // Create a semi-transparent dark rectangle for the loading bar background
      const barY = height * 0.75;
      const barWidth = width * 0.6;
      const barHeight = 30;

      // Add a white border around the loading bar
      this.scene.add
        .rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0xffffff)
        .setOrigin(0.5);

      // Add the dark background for the loading bar
      this.scene.add
        .rectangle(width / 2, barY, barWidth, barHeight, 0x000000, 0.7)
        .setOrigin(0.5);

      // Create a progress bar
      this.loadingBar = this.scene.add.graphics();

      // Add a status text
      this.statusText = this.scene.add
        .text(width / 2, barY + barHeight + 20, "Initializing...", {
          // Default initial text
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);
    } catch (error) {
      console.error("Error creating loading UI:", error);
    }
  }

  /**
   * Configure the loading stages and their relative weights
   */
  private configureLoadingStages(): void {
    this.progressManager.configureStages({
      initialAssets: {
        weight: 0.2,
        // message: "Loading game assets...", // Removed
      },
      fighterData: {
        weight: 0.2,
        // message: "Loading fighter data...", // Removed
      },
      combatData: {
        weight: 0.2,
        // message: "Loading combat data...", // Removed
      },
      fighterAssets: {
        weight: 0.3,
        // message: "Loading fighter assets...", // Removed
      },
      finalizing: {
        weight: 0.1,
        // message: "Finalizing...", // Removed
      },
    });
  }

  /**
  /**
   * Set up event listeners for loading progress and status updates
   */
  private setupListeners(): void {
    // Update loading bar for asset loading progress
    this.scene.load.on("progress", (progress: number) => {
      // Only use this for the current loading stage, not the overall progress
      this.progressManager.updateProgress(progress);
    });

    // Update status text for different loading phases
    this.scene.events.on("status-update", (message: string) => {
      this.updateStatus(message);
    });
  }

  /**
   * Start a specific loading stage
   * @param stageName The name of the stage to start
   */
  startStage(stageName: string): void {
    this.progressManager.startStage(stageName);
  }

  /**
   * Complete the current loading stage
   */
  completeStage(): void {
    this.progressManager.completeStage();
  }

  /**
   * Update the progress bar based on loading progress
   * @param progress A value between 0 and 1 representing loading progress
   */
  updateProgress(progress: number): void {
    if (!this.loadingBar) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const barY = height * 0.75;
    const barWidth = width * 0.6;
    const barHeight = 30;

    this.loadingBar.clear();

    // Draw the blue progress bar with a slight gradient effect
    // This creates a nicer visual effect
    const gradientColors = [0x0088ff, 0x00aaff];
    const fillWidth = (barWidth - 4) * progress;
    const x = width / 2 - barWidth / 2 + 2;
    const y = barY - barHeight / 2 + 2;

    // Create gradient fill
    if (fillWidth > 0) {
      const gradientSteps = 10;
      const stepWidth = fillWidth / gradientSteps;

      for (let i = 0; i < gradientSteps; i++) {
        const ratio = i / (gradientSteps - 1);
        const color = this.lerpColor(
          gradientColors[0],
          gradientColors[1],
          ratio,
        );

        this.loadingBar.fillStyle(color);
        this.loadingBar.fillRect(
          x + i * stepWidth,
          y,
          stepWidth,
          barHeight - 4,
        );
      }
    }
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.floor(r1 + (r2 - r1) * ratio);
    const g = Math.floor(g1 + (g2 - g1) * ratio);
    const b = Math.floor(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Update the status text with a new message
   * @param message The status message to display
   */
  updateStatus(message: string): void {
    if (this.statusText) {
      this.statusText.setText(message);
    }
  }

  /**
   * Display an error message on the screen
   * @param message The error message to display
   */
  showError(message: string): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.scene.add
      .text(width / 2, height / 2, message, {
        fontSize: "18px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
  }

  /**
   * Hide the loading UI elements
   */
  hide(): void {
    if (this.background) this.background.setVisible(false);
    if (this.loadingBar) this.loadingBar.setVisible(false);
    if (this.statusText) this.statusText.setVisible(false);
  }
}
