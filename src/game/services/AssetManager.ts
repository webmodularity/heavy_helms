import type { Scene } from "phaser";
import type { Fighter } from "@/types/fighter-types";
import { GAUNTLET_THEMES } from "@/lib/gauntlet-naming";

export class AssetManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Load all background assets
   */
  loadBackgroundAssets(): void {
    // Load all gauntlet theme backgrounds
    for (const theme of GAUNTLET_THEMES) {
      // Extract filename from path for the asset key
      const filename = theme.backgroundImage.split('/').pop()?.replace('.jpg', '') || theme.name.toLowerCase();
      const assetKey = `${filename}-bg`;
      this.scene.load.image(assetKey, theme.backgroundImage);
    }
    
    // Load practice mode background (default for practice/duel modes)
    this.scene.load.image("practice-bg", "/backgrounds/practice/practice.jpg");
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
    this.scene.load.audio("fight-music", "/audio/bkg/bg.mp3");
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
