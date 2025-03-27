import type { Scene } from "phaser";
import type { Fighter } from "@/types/fighter-types";

// Define types for assets
interface ImageAsset {
  key: string;
  path: string;
}

interface AtlasAsset {
  key: string;
  imagePath: string;
  jsonPath?: string;
  framesData?: object;
}

interface AudioAsset {
  key: string;
  paths: string[];
}

interface AssetPack {
  images?: ImageAsset[];
  atlases?: AtlasAsset[];
  audio?: AudioAsset[];
}

export class ConfigurableAssetManager {
  private scene: Scene;
  private assetPacks: Record<string, AssetPack> = {};

  constructor(scene: Scene) {
    this.scene = scene;

    // Initialize with default asset packs
    this.initializeDefaultAssetPacks();
  }

  /**
   * Initialize default asset packs
   */
  private initializeDefaultAssetPacks(): void {
    // Background assets
    this.registerAssetPack("backgrounds", {
      images: [
        { key: "sky", path: "/backgrounds/forest2/Sky.png" },
        { key: "bg-decor", path: "/backgrounds/forest2/BG.png" },
        { key: "middle-decor", path: "/backgrounds/forest2/Middle.png" },
        { key: "ground-02", path: "/backgrounds/forest2/Ground_02.png" },
        { key: "ground-01", path: "/backgrounds/forest2/Ground_01.png" },
        { key: "foreground", path: "/backgrounds/forest2/Foreground.png" },
      ],
    });

    // UI assets
    this.registerAssetPack("ui", {
      images: [
        { key: "bar-bg", path: "/ui/load_bar_bg.png" },
        { key: "bar-fill-1", path: "/ui/load_bar_1.png" },
        { key: "bar-fill-2", path: "/ui/load_bar_2.png" },
        { key: "bar-fill-1-right", path: "/ui/load_bar_1_right.png" },
        { key: "bar-fill-2-right", path: "/ui/load_bar_2_right.png" },
        { key: "bar-dark", path: "/ui/dark.png" },
      ],
    });

    // Audio assets
    this.registerAssetPack("audio", {
      audio: [{ key: "fight-music", paths: ["/audio/bkg/bg.ogg"] }],
    });
  }

  /**
   * Register a new asset pack
   */
  registerAssetPack(name: string, pack: AssetPack): void {
    this.assetPacks[name] = pack;
  }

  /**
   * Load an asset pack by name
   */
  loadAssetPack(packName: string): void {
    const pack = this.assetPacks[packName];

    if (!pack) {
      console.warn(`Asset pack '${packName}' not found`);
      return;
    }

    // Load images
    if (pack.images) {
      for (const image of pack.images) {
        this.scene.load.image(image.key, image.path);
      }
    }

    // Load atlases
    if (pack.atlases) {
      for (const atlas of pack.atlases) {
        if (atlas.jsonPath) {
          // Load atlas with separate JSON file
          this.scene.load.atlas(atlas.key, atlas.imagePath, atlas.jsonPath);
        } else if (atlas.framesData) {
          // Load atlas with inline frames data
          this.scene.load.atlas(atlas.key, atlas.imagePath, atlas.framesData);
        }
      }
    }

    // Load audio
    if (pack.audio) {
      for (const audio of pack.audio) {
        this.scene.load.audio(audio.key, audio.paths);
      }
    }
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
   * Load initial assets (backgrounds, UI, audio)
   */
  loadInitialAssets(): void {
    this.loadAssetPack("backgrounds");
    this.loadAssetPack("ui");
    this.loadAssetPack("audio");
  }

  /**
   * Load fighter assets
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
