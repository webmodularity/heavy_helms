export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  init() {
    // Emit scene ready event - this replaces EventBus.emit
    this.game.events.emit("current-scene-ready", this);
  }

  preload() {
    const loadingText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "", // TODO: This is the line which causes and intermediary loading screen between react and phaser handoff
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);

    this.load.image("loading-background", "/backgrounds/loading_bg.jpg");
  }

  create() {
    // Get the camera dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add the background image and properly scale it to fit the screen
    const background = this.add.image(
      width / 2,
      height / 2,
      "loading-background",
    );

    // Set the origin to center
    background.setOrigin(0.5, 0.5);

    // Scale the image to cover the entire screen while maintaining aspect ratio
    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Move to the Preloader scene
    this.scene.start("Preloader");
  }
}
