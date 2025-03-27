import type { Scene } from "phaser";
import type { Fighter } from "@/types/fighter-types";

export class AssetManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Load all background assets
   */
  loadBackgroundAssets(): void {
    const paths = {
      sky: "/backgrounds/forest2/Sky.png",
      "bg-decor": "/backgrounds/forest2/BG.png",
      "middle-decor": "/backgrounds/forest2/Middle.png",
      "ground-02": "/backgrounds/forest2/Ground_02.png",
      "ground-01": "/backgrounds/forest2/Ground_01.png",
      foreground: "/backgrounds/forest2/Foreground.png",
    };

    for (const [key, path] of Object.entries(paths)) {
      this.scene.load.image(key, path);
    }
  }

  /**
   * Load all UI assets
   */
  loadUIAssets(): void {
    const uiElements = [
      { key: "bar-bg", path: "/ui/load_bar_bg.png" },
      { key: "bar-fill-1", path: "/ui/load_bar_1.png" },
      { key: "bar-fill-2", path: "/ui/load_bar_2.png" },
      { key: "bar-fill-1-right", path: "/ui/load_bar_1_right.png" },
      { key: "bar-fill-2-right", path: "/ui/load_bar_2_right.png" },
      { key: "bar-dark", path: "/ui/dark.png" },
    ];

    for (const asset of uiElements) {
      this.scene.load.image(asset.key, asset.path);
    }
  }

  /**
   * Load audio assets
   */
  loadAudioAssets(): void {
    this.scene.load.audio("fight-music", "/audio/bkg/bg.ogg");
  }

  /**
   * Load fighter spritesheets
   */
  loadFighterSpritesheet(fighter: Fighter): void {
    // Keep using player prefix for backward compatibility
    const spritesheetKey = `fighter${fighter.id}-spritesheet`;

    this.scene.load.atlas(
      spritesheetKey,
      fighter.currentSkin.spritesheet.image,
      {
        frames: fighter.currentSkin.spritesheet.frames,
      },
    );
  }

  /**
   * Load initial assets before fighter data is available
   */
  loadInitialAssets(): void {
    this.loadBackgroundAssets();
    this.loadUIAssets();
    this.loadAudioAssets();
  }

  /**
   * Load fighter assets after fighter data is available
   */
  loadFighterAssets(player1: Fighter, player2: Fighter): void {
    this.loadFighterSpritesheet(player1);
    this.loadFighterSpritesheet(player2);
  }

  /**
   * Start asset loading process
   */
  startLoading(): void {
    this.scene.load.start();
  }

  /**
   * Register a callback for when loading is complete
   */
  onLoadComplete(callback: () => void, context: unknown): void {
    this.scene.load.on("complete", callback, context);
  }

  /**
   * Remove a load complete callback
   */
  offLoadComplete(callback: () => void, context: unknown): void {
    this.scene.load.off("complete", callback, context);
  }

  /**
   * Register a one-time callback for when loading is complete
   */
  onceLoadComplete(callback: () => void, context: unknown): void {
    this.scene.load.once("complete", callback, context);
  }
}
