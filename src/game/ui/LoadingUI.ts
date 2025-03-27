import type { Scene } from "phaser";

export class LoadingUI {
  private scene: Scene;
  private loadingBar?: Phaser.GameObjects.Graphics;
  private statusText?: Phaser.GameObjects.Text;
  private background?: Phaser.GameObjects.Image;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.create();
    this.setupListeners();
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
        .text(width / 2, barY + barHeight + 20, "Loading game assets...", {
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
   * Set up event listeners for loading progress and status updates
   */
  private setupListeners(): void {
    // Update loading bar based on progress
    this.scene.load.on("progress", (progress: number) => {
      this.updateProgress(progress);
    });
    
    // Update status text for different loading phases
    this.scene.events.on("status-update", (message: string) => {
      this.updateStatus(message);
    });
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
    
    // Draw the blue progress bar
    this.loadingBar.fillStyle(0x0099ff);
    
    // Calculate the filled portion of the bar
    const fillWidth = (barWidth - 4) * progress;
    const x = width / 2 - barWidth / 2 + 2;
    const y = barY - barHeight / 2 + 2;
    
    this.loadingBar.fillRect(x, y, fillWidth, barHeight - 4);
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