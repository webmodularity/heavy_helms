import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // The Boot Scene should only load minimal assets needed for the Preloader
    // This keeps the initial loading time as short as possible
    // We also need to load any assets required for the loading screen
    this.load.image("bar-bg", "ui/load_bar_bg.png");
    this.load.image("bar-fill-1", "ui/load_bar_1.png");
  }

  create() {
    // Move to the Preloader scene as soon as our minimal assets are loaded
    this.scene.start("Preloader");
  }
}
