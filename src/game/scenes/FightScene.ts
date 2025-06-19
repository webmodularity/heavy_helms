import { Scene } from "phaser";
import { EventBus } from "../EventBus";

import { DamageNumbers } from "../systems/damage-numbers";
import { CombatAnimator } from "../systems/combat-animator";
import { CombatAudioManager } from "../systems/combat-audio-manager";
import { HealthManager } from "../systems/health-manager";
// PlayerStatsDisplay removed - using external UI instead
import type {
  CombatAction,
  DecodedCombatResult,
  SceneData,
} from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import type {
  WeaponType,
  ArmorType,
  StanceType,
} from "@/types/equipment.types";

interface TextStyles {
  mainText: Phaser.GameObjects.Text;
  shadowText: Phaser.GameObjects.Text;
  metalGradient: Phaser.GameObjects.Text;
}

export class FightScene extends Scene {
  // Scene data
  private player1: Fighter;
  private player2: Fighter;
  private network = "mainnet";
  private blockNumber = "0";
  private txId = "Practice";
  private decodedCombatBytes: DecodedCombatResult;

  // Game objects
  private player1Sprite: Phaser.Physics.Arcade.Sprite;
  private player2Sprite: Phaser.Physics.Arcade.Sprite;
  private countdownText?: Phaser.GameObjects.Text;
  private networkText?: Phaser.GameObjects.Text;
  private backgroundMusic?: Phaser.Sound.BaseSound;

  // Scene managers
  private healthManager: HealthManager;
  private animator: CombatAnimator;
  private damageNumbers: DamageNumbers;
  private audioManager: CombatAudioManager;
  // Stats displays removed - using external UI instead

  // Game state
  private isInitialized = false;
  private isFightSequencePlaying = false;
  private playerStartX = 0;
  private player2StartX = 0;
  private centerX = 0;
  private countdownInterval?: NodeJS.Timeout;
  private fighterInfoPanel?: { panelY: number; sidePadding: number };
  private fighterInfoTexts: {
    p1Health?: Phaser.GameObjects.Text;
    p1Stamina?: Phaser.GameObjects.Text;
    p2Health?: Phaser.GameObjects.Text;
    p2Stamina?: Phaser.GameObjects.Text;
  } = {};
  private currentDisplayValues = {
    p1Health: 0,
    p1Stamina: 0,
    p2Health: 0,
    p2Stamina: 0,
  };
  // private fKey?: Phaser.Input.Keyboard.Key;
  // private rKey?: Phaser.Input.Keyboard.Key;

  // Combat timing constants
  private SEQUENCE_DELAY = 1500;
  private DEFENSE_DELAY = 50;
  private VICTORY_DELAY = 1000;
  private WALK_DISTANCE = 100;
  private WALK_DURATION = 1000;
  // UI Configurations
  private countdownConfig = {
    fontSize: "80px",
    fontFamily: "Bokor",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 6,
    duration: 750,
    scale: { from: 2, to: 0.5 },
    alpha: { from: 1, to: 0 },
  };

  private titleTextConfig = {
    main: {
      fontFamily: "Bokor",
      fontSize: "90px",
      color: "#ffd700",
      stroke: "#8b0000",
      strokeThickness: 8,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 5,
        fill: true,
        stroke: true,
      },
    },
    shadow: {
      fontFamily: "Bokor",
      fontSize: "94px",
      color: "#000000",
      alpha: 0.7,
    },
    metallic: {
      fontFamily: "Bokor",
      fontSize: "90px",
      color: "#ffffff",
    },
  };

  constructor() {
    super({ key: "FightScene" });
  }

  init(data: SceneData) {
    // Guard against multiple initializations
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    this.player1 = data.player1;
    this.player2 = data.player2;
    this.decodedCombatBytes = data.decodedCombatBytes;
    this.network = data.network;
    this.blockNumber = data.blockNumber;
    this.txId = data.txId;

    // Store player data in registry so modal wrapper can access it for Twitter sharing
    this.game.registry.set("player1", this.player1);
    this.game.registry.set("player2", this.player2);
    this.game.registry.set("player1Id", this.player1.id);
    this.game.registry.set("player2Id", this.player2.id);
  }

  async create(data: SceneData) {
    // Initialize audio manager first, before other setup
    this.audioManager = new CombatAudioManager(this);

    // Initialize combat audio
    await this.audioManager.init();

    // Now safe to play background music
    this.backgroundMusic = this.sound.add("fight-music", {
      loop: true,
      volume: 0.15,
    });
    this.backgroundMusic.play();

    // Start countdown
    this.countdownText = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "3", {
        fontFamily: "Montserrat",
        fontSize: "64px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    let count = 3;
    this.countdownInterval = setInterval(() => {
      // Check if scene is still active with better null safety
      try {
        if (
          !this.scene ||
          !this.scene.manager ||
          !this.scene.manager.isActive(this.scene.key)
        ) {
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = undefined;
          }
          return;
        }
      } catch (error) {
        // Scene is likely destroyed, clean up interval
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = undefined;
        }
        return;
      }

      count--;
      if (count > 0) {
        this.countdownText?.setText(count.toString());
      } else {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = undefined;
        }
        this.countdownText?.destroy();
        // Start the fight sequence
        this.startFightSequence();
      }
    }, 1000);

    // 1. Scene Setup - Background Layers
    const layers = [
      { key: "sky", depth: 0, alpha: 0.75 },
      { key: "bg-decor", depth: 1, alpha: 0.75 },
      { key: "middle-decor", depth: 2, alpha: 0.8 },
      { key: "foreground", depth: 3, alpha: 0.65 },
      { key: "ground-01", depth: 4, alpha: 1 },
    ];

    // Clear any existing game objects first
    this.children.removeAll();

    for (const layer of layers) {
      this.add
        .image(0, -130, layer.key) // Moved up 80px to match taller stats panel
        .setOrigin(0, 0)
        .setScale(0.6)
        .setDepth(layer.depth)
        .setAlpha(layer.alpha);
    }

    // 2. Player Setup - positioned properly on the ground (adjusted for taller stats panel)
    const groundY = 530;
    this.player1Sprite = this.physics.add
      .sprite(120, groundY, `fighter${this.player1.id}-spritesheet`)
      .setFlipX(false)
      .setOrigin(0.5, 1)
      .setDisplaySize(280, 280)
      .setDepth(5);

    this.player2Sprite = this.physics.add
      .sprite(360, groundY, `fighter${this.player2.id}-spritesheet`)
      .setFlipX(true)
      .setOrigin(0.5, 1)
      .setDisplaySize(280, 280)
      .setDepth(5);

    // 3. Animation Setup
    this.createPlayerAnimations(this.player1, this.player1Sprite, false);
    this.createPlayerAnimations(this.player2, this.player2Sprite, true);

    // 4. Manager Initialization
    this.healthManager = new HealthManager(this, this.player1, this.player2);
    this.healthManager.createBars();
    this.animator = new CombatAnimator(this);
    this.damageNumbers = new DamageNumbers(this);

    // 5. Initial Animations
    this.player1Sprite.play("idle");
    this.player2Sprite.play("idle2");

    // 6. Combat Setup
    this.playerStartX = this.player1Sprite.x;
    this.player2StartX = this.player2Sprite.x;
    this.centerX = this.cameras.main.centerX;
    this.isFightSequencePlaying = false;
    // this.fKey = this.input.keyboard.addKey("F");
    // this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 7. Event Setup
    this.events.once("fightComplete", () => {
      if (this.player1Sprite && this.player2Sprite) {
        this.handleVictory(
          this.decodedCombatBytes.winner,
          this.player1Sprite,
          this.player2Sprite,
        );
      }
    });

    // Network info text - positioned above the taller stats panel
    this.networkText = this.add
      .text(
        5,
        this.cameras.main.height - 285, // Adjusted for taller panel
        `${this.network} | Block#: ${this.blockNumber} | v${Math.floor((this.decodedCombatBytes.gameEngineVersion || 0) / 100)}.${(this.decodedCombatBytes?.gameEngineVersion || 0) % 100} | ${this.txId}`,
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#cccccc",
          align: "left",
        },
      )
      .setOrigin(0, 1)
      .setDepth(100);

    // Create fighter info UI at bottom of game
    this.createFighterInfoUI();

    // Add the mute event listener
    this.game.events.on("set-mute", this.handleMuteToggle, this);

    // Ensure listener is removed when FightScene shuts down
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      // Check if game.events still exists before trying to remove listener
      if (this.game.events) {
        this.game.events.off("set-mute", this.handleMuteToggle, this);
      }
    });

    // Emit current-scene-ready
    this.game.events.emit("current-scene-ready", this);
  }

  // Game State Management
  update() {
    // if (!this.rKey) return;

    // if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
    //   this.resetFight();
    // }

    if (!this.player1Sprite || !this.player2Sprite) return;

    // Dynamic depth adjustment
    if (
      this.player1Sprite.anims?.currentAnim?.key === "attacking" ||
      this.player1Sprite.anims?.currentAnim?.key === "blocking"
    ) {
      this.player1Sprite.setDepth(6);
      this.player2Sprite.setDepth(5);
    } else if (
      this.player2Sprite.anims?.currentAnim?.key === "attacking2" ||
      this.player2Sprite.anims?.currentAnim?.key === "blocking2"
    ) {
      this.player2Sprite.setDepth(6);
      this.player1Sprite.setDepth(5);
    } else {
      this.player1Sprite.setDepth(5);
      this.player2Sprite.setDepth(5);
    }

    // if (this.fKey?.isDown && !this.isFightSequencePlaying) {
    //   this.startFightSequence();
    // }
  }

  // Combat Sequence Methods
  startFightSequence() {
    // Enhanced checks for scene state
    if (
      this.isFightSequencePlaying ||
      !this.player1Sprite ||
      !this.player2Sprite ||
      !this.scene ||
      !this.scene.manager ||
      !this.animator
    ) {
      console.warn(
        "FightScene: Cannot start fight sequence - scene not ready or already playing",
      );
      return;
    }

    // Additional scene active check with error handling
    try {
      if (!this.scene.manager.isActive(this.scene.key)) {
        console.warn(
          "FightScene: Scene is not active, aborting fight sequence",
        );
        return;
      }
    } catch (error) {
      console.warn(
        "FightScene: Scene validation failed, aborting fight sequence",
      );
      return;
    }
    this.isFightSequencePlaying = true;

    this.startCountdown()
      .then(() => {
        // Additional checks after countdown
        if (
          !this.player1Sprite ||
          !this.player2Sprite ||
          !this.scene ||
          !this.scene.manager ||
          !this.animator
        ) {
          console.warn(
            "FightScene: Scene destroyed during countdown, aborting fight sequence",
          );
          return;
        }

        // Additional scene active check with error handling
        try {
          if (!this.scene.manager.isActive(this.scene.key)) {
            console.warn(
              "FightScene: Scene not active after countdown, aborting",
            );
            return;
          }
        } catch (error) {
          console.warn(
            "FightScene: Scene validation failed after countdown, aborting",
          );
          return;
        }

        // Initial run to center
        this.animator.playAnimation(this.player1Sprite, "running");
        this.animator.playAnimation(this.player2Sprite, "running", true);

        // Move players to center with responsive run-in distance
        this.tweens.add({
          targets: this.player1Sprite,
          x: this.centerX - 60,
          duration: 500,
          onStart: () => {
            // Stats panels removed - no need to show them
          },
          onComplete: () => {
            if (this.animator && this.player1Sprite) {
              this.animator.playAnimation(this.player1Sprite, "idle");
            }
          },
        });

        this.tweens.add({
          targets: this.player2Sprite,
          x: this.centerX + 60,
          duration: 500,
          onStart: () => {
            // Stats panels removed - no need to show them
          },
          onComplete: () => {
            if (this.animator && this.player2Sprite) {
              this.animator.playAnimation(this.player2Sprite, "idle", true);
            }
            if (
              this.decodedCombatBytes.actions &&
              this.scene &&
              this.scene.manager
            ) {
              this.time?.delayedCall(300, () => {
                try {
                  if (this.scene?.manager?.isActive(this.scene.key)) {
                    this.playCombatSequence(0);
                  }
                } catch (error) {
                  console.warn("FightScene: Scene check failed in delayedCall");
                }
              });
            }
          },
        });
      })
      .catch((error) => {
        console.error("FightScene: Error in startCountdown:", error);
      });
  }

  playCombatSequence(actionIndex: number) {
    if (!this.decodedCombatBytes.actions) return;

    const action = this.decodedCombatBytes.actions[actionIndex];
    const isLastAction =
      actionIndex === this.decodedCombatBytes.actions.length - 1;

    this.handleSequence(action, isLastAction);

    this.events.once("sequenceComplete", (isLast: boolean) => {
      if (!isLast) {
        this.time?.delayedCall(this.SEQUENCE_DELAY, () => {
          this.playCombatSequence(actionIndex + 1);
        });
      }
    });
  }

  startCountdown(): Promise<void> {
    return new Promise((resolve) => {
      const numbers = ["3", "2", "1", "Fight!"];
      let index = 0;

      const showNumber = () => {
        // Guard against scene destruction
        if (!this.scene || !this.cameras || !this.cameras.main) {
          console.warn(
            "FightScene: Scene or cameras destroyed during countdown",
          );
          resolve();
          return;
        }

        if (index >= numbers.length) {
          resolve();
          return;
        }

        const number = numbers[index];
        const scale = number === "Fight!" ? 1.25 : 2;
        const texts = this.createStyledText(
          this.cameras.main.centerX,
          this.cameras.main.centerY - 150, // Moved up from center for mobile layout
          number,
          scale,
        );

        // Set initial state
        for (const text of [
          texts.shadowText,
          texts.mainText,
          texts.metalGradient,
        ]) {
          text.setAlpha(0);
          text.setDepth(100);
        }

        if (number === "Fight!") {
          // Special animation for "Fight!"
          this.tweens.add({
            targets: [texts.shadowText, texts.mainText, texts.metalGradient],
            alpha: {
              from: 0,
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              to: (target: any) =>
                target === texts.metalGradient
                  ? 0.3
                  : target === texts.shadowText
                    ? 0.7
                    : 1,
            },
            scale: {
              from: scale * 1.5,
              to: scale,
            },
            duration: 500,
            ease: "Back.out",
            onComplete: () => {
              this.time?.delayedCall(750, () => {
                // Guard against scene destruction
                if (!this.scene || !this.tweens) {
                  console.warn(
                    "FightScene: Scene destroyed during countdown animation",
                  );
                  return;
                }

                this.tweens.add({
                  targets: [
                    texts.shadowText,
                    texts.mainText,
                    texts.metalGradient,
                  ],
                  alpha: 0,
                  scale: scale * 0.8,
                  duration: 500,
                  ease: "Power2",
                  onComplete: () => {
                    // Guard against scene destruction
                    if (!this.scene) {
                      console.warn(
                        "FightScene: Scene destroyed during countdown cleanup",
                      );
                      return;
                    }

                    texts.shadowText.destroy();
                    texts.mainText.destroy();
                    texts.metalGradient.destroy();
                    index++;
                    showNumber();
                  },
                });
              });
            },
          });
        } else {
          // Numbers animation
          this.tweens.add({
            targets: [texts.shadowText, texts.mainText, texts.metalGradient],
            alpha: {
              from: 0,
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              to: (target: any) =>
                target === texts.metalGradient
                  ? 0.3
                  : target === texts.shadowText
                    ? 0.7
                    : 1,
            },
            scale: {
              from: scale * 1.5,
              to: scale * 0.5,
            },
            duration: this.countdownConfig.duration,
            ease: "Power2",
            onComplete: () => {
              // Guard against scene destruction
              if (!this.scene) {
                console.warn(
                  "FightScene: Scene destroyed during countdown cleanup",
                );
                return;
              }

              texts.shadowText.destroy();
              texts.mainText.destroy();
              texts.metalGradient.destroy();
              index++;
              showNumber();
            },
          });
        }
      };

      showNumber();
    });
  }

  createStyledText(x: number, y: number, text: string, scale = 1): TextStyles {
    // Guard against scene destruction
    if (!this.add || !this.scene) {
      console.warn("FightScene: Scene destroyed, cannot create styled text");
      // Return dummy objects to prevent further errors
      const dummyText = { destroy: () => {} } as Phaser.GameObjects.Text;
      return {
        shadowText: dummyText,
        mainText: dummyText,
        metalGradient: dummyText,
      };
    }

    const shadowText = this.add
      .text(x + 4, y, text, this.titleTextConfig.shadow)
      .setOrigin(0.5)
      .setScale(scale);

    const mainText = this.add
      .text(x, y, text, this.titleTextConfig.main)
      .setOrigin(0.5)
      .setScale(scale);

    const metalGradient = this.add
      .text(x, y, text, this.titleTextConfig.metallic)
      .setOrigin(0.5)
      .setAlpha(0.3)
      .setScale(scale);

    return { shadowText, mainText, metalGradient };
  }

  startVictorySequence(
    winner: Phaser.Physics.Arcade.Sprite,
    playerType: string,
  ) {
    const isPlayer2 = playerType === "player2";
    const originalX = winner.x;

    const walkDistance = 300;
    const walkDuration = 3000;
    const finalPosition = isPlayer2
      ? originalX + walkDistance
      : originalX - walkDistance;
    const halfwayPoint = isPlayer2
      ? originalX + walkDistance / 2
      : originalX - walkDistance / 2;

    this.time.delayedCall(1000, () => {
      winner.setFlipX(!isPlayer2);

      // Use the existing walking animation configuration
      this.animator?.playAnimation(winner, "walking", isPlayer2);

      const sequence = [
        {
          targets: winner,
          x: halfwayPoint,
          duration: walkDuration / 2,
          ease: "Linear",
        },
        {
          targets: winner,
          x: halfwayPoint,
          duration: 800,
          onStart: () => {
            this.animator?.playAnimation(winner, "dodging", isPlayer2);
          },
          onComplete: () => {
            // Resume walking animation using existing configuration
            this.animator?.playAnimation(winner, "walking", isPlayer2);
          },
        },
        {
          targets: winner,
          x: finalPosition,
          duration: walkDuration / 2,
          ease: "Linear",
          onComplete: () => {
            this.animator?.playAnimation(winner, "idle", isPlayer2);
            this.time.delayedCall(500, () => {
              this.playTauntSequence(winner, isPlayer2);
            });
          },
        },
      ];

      this.tweens.chain({
        tweens: sequence,
      });
    });
  }

  shutdown() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    // Reset initialization flag
    this.isInitialized = false;

    // Clean up any running animations, tweens, etc.
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.sound.removeAll();

    // Clear all game objects
    this.children.removeAll();

    // Clean up countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  private createPlayerAnimations(
    player: Fighter,
    sprite: Phaser.Physics.Arcade.Sprite,
    isPlayer2 = false,
  ) {
    const textureKey = `fighter${player.id}-spritesheet`;
    const texture = this.textures.get(textureKey);
    if (!texture) return;

    // Get all frame names for this texture
    const frameNames = texture.getFrameNames();

    // Create animations for each action type
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "idle",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "walking",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "running",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "attacking",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "blocking",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "dying",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "hurt",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "dodging",
      isPlayer2,
    );
    this.createAnimationForAction(
      player,
      textureKey,
      frameNames,
      "taunting",
      isPlayer2,
    );

    // Start with idle animation
    const animKey = isPlayer2 ? "idle2" : "idle";
    sprite.play(animKey);
  }

  private createAnimationForAction(
    player: Fighter,
    textureKey: string,
    allFrames: string[],
    actionType: keyof typeof player.currentSkin.spritesheet.fps,
    isPlayer2 = false,
  ) {
    // Filter frames for this action type
    const actionFrames = allFrames.filter((name) =>
      name.startsWith(`${actionType}_`),
    );

    if (actionFrames.length > 0) {
      // Sort frames by their numeric suffix
      actionFrames.sort((a, b) => {
        const numA = Number.parseInt(
          a.replace(`${actionType}_`, "").replace(".png", ""),
        );
        const numB = Number.parseInt(
          b.replace(`${actionType}_`, "").replace(".png", ""),
        );
        return numA - numB;
      });

      // Create the animation
      const animKey = isPlayer2 ? `${actionType}2` : actionType;

      // Remove existing animation if it exists
      if (this.anims.exists(animKey)) {
        this.anims.remove(animKey);
      }

      this.anims.create({
        key: animKey,
        frames: actionFrames.map((frameName) => ({
          key: textureKey,
          frame: frameName,
        })),
        frameRate: player.currentSkin.spritesheet.fps[actionType],
        repeat:
          actionType === "idle" ||
          actionType === "walking" ||
          actionType === "running"
            ? -1
            : 0,
      });
    }
  }

  handleSequence(action: CombatAction, isLastAction: boolean): void {
    // Handle exhaustion first
    if (
      action.p1Result === "EXHAUSTED" ||
      (isLastAction &&
        this.decodedCombatBytes.condition === "EXHAUSTION" &&
        !this.decodedCombatBytes.winner)
    ) {
      this.damageNumbers.show(
        this.player1Sprite.x,
        this.player1Sprite.y - 200,
        "Exhausted!",
        "exhausted",
        1.2,
      );
      this.animator.playAnimation(this.player1Sprite, "idle", false);

      // Set player1 endurance to 0
      if (this.player1.currentState) {
        this.player1.currentState.currentEndurance = 0;
      }

      // Update health bars
      this.healthManager.updateBars();
      this.updateFighterInfoUI();

      // Add delay before completing sequence
      this.time.delayedCall(1000, () => {
        this.completeSequence(true); // Always treat as last action
      });
      return;
    }

    if (
      action.p2Result === "EXHAUSTED" ||
      (isLastAction &&
        this.decodedCombatBytes.condition === "EXHAUSTION" &&
        this.decodedCombatBytes.winner)
    ) {
      this.damageNumbers.show(
        this.player2Sprite.x,
        this.player2Sprite.y - 200,
        "Exhausted!",
        "exhausted",
        1.2,
      );
      this.animator.playAnimation(this.player2Sprite, "idle", true);

      // Set player2 endurance to 0
      if (this.player2.currentState) {
        this.player2.currentState.currentEndurance = 0;
      }

      // Update health bars
      this.healthManager.updateBars();
      this.updateFighterInfoUI();

      // Add delay before completing sequence
      this.time.delayedCall(1000, () => {
        this.completeSequence(true); // Always treat as last action
      });
      return;
    }

    // Get current values from player states
    const currentP1Health = this.player1.currentState?.currentHealth || 0;
    const currentP2Health = this.player2.currentState?.currentHealth || 0;
    const currentP1Stamina = this.player1.currentState?.currentEndurance || 0;
    const currentP2Stamina = this.player2.currentState?.currentEndurance || 0;

    // Initialize new values with current values
    let newP1Health = currentP1Health;
    let newP2Health = currentP2Health;
    const newP1Stamina = Math.max(
      0,
      currentP1Stamina - (action.p1StaminaLost || 0),
    );
    const newP2Stamina = Math.max(
      0,
      currentP2Stamina - (action.p2StaminaLost || 0),
    );

    // Handle P2's defensive actions that deal damage
    if (
      ["COUNTER", "COUNTER_CRIT", "RIPOSTE", "RIPOSTE_CRIT"].includes(
        action.p2Result,
      )
    ) {
      const damage = Number(action.p2Damage);
      newP1Health = Math.max(0, currentP1Health - damage);
    }
    // If P2 gets HIT normally, apply P1's damage
    else if (action.p2Result === "HIT" || action.p2Result === "CRIT") {
      const damage = Number(action.p1Damage);
      newP2Health = Math.max(0, currentP2Health - damage);
    }

    // Handle P1's defensive actions that deal damage
    if (
      ["COUNTER", "COUNTER_CRIT", "RIPOSTE", "RIPOSTE_CRIT"].includes(
        action.p1Result,
      )
    ) {
      const damage = Number(action.p1Damage);
      newP2Health = Math.max(0, currentP2Health - damage);
    }
    // If P1 gets HIT normally, apply P2's damage
    else if (action.p1Result === "HIT" || action.p1Result === "CRIT") {
      const damage = Number(action.p2Damage);
      newP1Health = Math.max(0, currentP1Health - damage);
    }

    // Update player states with new values
    if (this.player1.currentState) {
      this.player1.currentState.currentHealth = newP1Health;
      this.player1.currentState.currentEndurance = newP1Stamina;
    }

    if (this.player2.currentState) {
      this.player2.currentState.currentHealth = newP2Health;
      this.player2.currentState.currentEndurance = newP2Stamina;
    }

    // Stats displays removed - handled by external UI

    // Update the health bars with actual values after a longer delay
    this.time.delayedCall(1200, () => {
      this.healthManager.updateBars();
      this.updateFighterInfoUI();
    });

    // Continue with animation sequence
    if (this.isOffensiveSuccessAction(action.p2Result)) {
      this.playAttackSequence(
        this.player2Sprite,
        this.player1Sprite,
        action.p2Result,
        action.p2Damage,
        action.p1Result,
        true,
        isLastAction,
        action,
      );
    } else if (this.isOffensiveSuccessAction(action.p1Result)) {
      this.playAttackSequence(
        this.player1Sprite,
        this.player2Sprite,
        action.p1Result,
        action.p1Damage,
        action.p2Result,
        false,
        isLastAction,
        action,
      );
    }
  }

  playAttackSequence(
    attacker: Phaser.Physics.Arcade.Sprite,
    defender: Phaser.Physics.Arcade.Sprite,
    attackResult: string,
    attackerDamage: number,
    defenderResult: string,
    isPlayer2: boolean,
    isLastAction: boolean,
    action: CombatAction,
  ): void {
    // Convert to uppercase string for consistency
    const attackText = attackResult.toString().toUpperCase();

    // Play attack animation
    this.animator.playAnimation(attacker, "attacking", isPlayer2);

    // Only play attack sound if it's not being defended against
    const isDefended = [
      "BLOCK",
      "PARRY",
      "COUNTER",
      "COUNTER_CRIT",
      "RIPOSTE",
      "RIPOSTE_CRIT",
    ].includes(defenderResult);
    if (!isDefended) {
      const weaponType = "SwordAndShield";
      const armorType = "Leather";
      const isCrit = attackResult === "CRIT";
      const isMiss = defenderResult === "MISS" || defenderResult === "DODGE";
      this.audioManager.playAttackSound(weaponType, armorType, isCrit, isMiss);
    }

    attacker.once("animationcomplete", () => {
      this.animator.playAnimation(attacker, "idle", isPlayer2);

      this.time.delayedCall(this.DEFENSE_DELAY, () => {
        if (
          ["COUNTER", "COUNTER_CRIT", "RIPOSTE", "RIPOSTE_CRIT"].includes(
            defenderResult,
          )
        ) {
          const defenderDamage = !isPlayer2 ? action.p2Damage : action.p1Damage;
          this.playDefenseAnimation(
            defender,
            defenderResult,
            defenderDamage,
            !isPlayer2,
            isLastAction,
            defenderResult.includes("CRIT"),
          );
        } else {
          this.playDefenseAnimation(
            defender,
            defenderResult,
            attackerDamage,
            !isPlayer2,
            isLastAction,
            attackText === "CRIT",
          );
        }
      });
    });
  }

  playDefenseAnimation(
    defender: Phaser.Physics.Arcade.Sprite,
    defenseType: string,
    damage: number,
    isPlayer2: boolean,
    isLastAction: boolean,
    isCrit = false,
  ): void {
    const defenseText = defenseType.toString().toUpperCase();
    const attacker = isPlayer2 ? this.player1Sprite : this.player2Sprite;

    switch (defenseText) {
      case "MISS":
      case "DODGE":
        // Remove sound playing from here
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          defenseText === "MISS" ? "Miss!" : "Dodge!",
          defenseText === "MISS" ? "miss" : "dodge",
        );

        if (defenseText === "DODGE") {
          this.animator.playAnimation(defender, "dodging", isPlayer2);
          defender.once("animationcomplete", () => {
            this.animator.playAnimation(defender, "idle", isPlayer2);
            this.completeSequence(isLastAction);
          });
        } else {
          this.completeSequence(isLastAction);
        }
        return;
      case "HIT":
        // Remove sound playing from here
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          `-${damage}`,
          "damage",
          isCrit ? 1.2 : 1.0,
        );
        this.animator.playAnimation(defender, "hurt", isPlayer2);

        defender.once("animationcomplete", () => {
          this.animator.playAnimation(defender, "idle", isPlayer2);
          this.completeSequence(isLastAction);
        });
        return;
      case "BLOCK":
        this.audioManager.playDefenseSound("BLOCK");
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          "Block!",
          "block",
        );
        this.animator.playAnimation(defender, "blocking", isPlayer2);
        defender.once("animationcomplete", () => {
          this.animator.playAnimation(defender, "idle", isPlayer2);
          this.completeSequence(isLastAction);
        });
        return;
      case "PARRY":
        this.audioManager.playDefenseSound("PARRY");
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          "Parry!",
          "block",
        );
        this.animator.playAnimation(defender, "attacking", isPlayer2);
        defender.once("animationcomplete", () => {
          this.animator.playAnimation(defender, "idle", isPlayer2);
          this.completeSequence(isLastAction);
        });
        return;
      case "COUNTER":
      case "COUNTER_CRIT":
        this.audioManager.playDefenseSound(
          defenseText,
          defenseText === "COUNTER_CRIT",
        );
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          "Counter!",
          "counter",
        );
        this.animator.playAnimation(defender, "blocking", isPlayer2);
        defender.once("animationcomplete", () => {
          this.time.delayedCall(this.DEFENSE_DELAY, () => {
            this.animator.playAnimation(defender, "attacking", isPlayer2);
            this.damageNumbers.show(
              attacker.x,
              attacker.y - 200,
              `-${damage}`,
              "damage",
              defenseText === "COUNTER_CRIT" ? 1.2 : 1.0,
            );

            defender.once("animationcomplete", () => {
              this.animator.playAnimation(defender, "idle", isPlayer2);
              this.completeSequence(isLastAction);
            });
          });
        });
        return;
      case "RIPOSTE":
      case "RIPOSTE_CRIT":
        this.audioManager.playDefenseSound(
          defenseText,
          defenseText === "RIPOSTE_CRIT",
        );
        this.damageNumbers.show(
          defender.x,
          defender.y - 200,
          "Riposte!",
          "counter",
        );
        this.animator.playAnimation(defender, "attacking", isPlayer2);
        defender.once("animationcomplete", () => {
          this.time.delayedCall(this.DEFENSE_DELAY, () => {
            this.animator.playAnimation(defender, "attacking", isPlayer2);
            this.damageNumbers.show(
              attacker.x,
              attacker.y - 200,
              `-${damage}`,
              "damage",
              defenseText === "RIPOSTE_CRIT" ? 1.2 : 1.0,
            );

            defender.once("animationcomplete", () => {
              this.animator.playAnimation(defender, "idle", isPlayer2);
              this.completeSequence(isLastAction);
            });
          });
        });
        return;
    }

    this.animator.playAnimation(defender, "hurt", isPlayer2);
    defender.once("animationcomplete", () => {
      this.animator.playAnimation(defender, "idle", isPlayer2);
      this.completeSequence(isLastAction);
    });
  }

  completeSequence(isLastAction: boolean): void {
    if (isLastAction) {
      this.events.emit("fightComplete");
    } else {
      this.events.emit("sequenceComplete", isLastAction);
    }
  }

  startVictoryLap(
    winner: Phaser.Physics.Arcade.Sprite,
    isPlayer2: boolean,
  ): void {
    this.animator.playAnimation(winner, "victory", isPlayer2);

    winner.once("animationcomplete", () => {
      this.animator.playAnimation(winner, "walking", isPlayer2);

      this.tweens.add({
        targets: winner,
        x: isPlayer2 ? -100 : this.cameras.main.width + 100,
        duration: 2000,
        ease: "Linear",
        onComplete: () => {
          this.events.emit("victoryComplete");
        },
      });
    });
  }

  isOffensiveAction(result: string): boolean {
    const resultStr = result.toString().toUpperCase();
    return ["ATTACK", "CRIT", "MISS"].includes(resultStr);
  }

  isOffensiveSuccessAction(result: string): boolean {
    const resultStr = result.toString().toUpperCase();
    return ["ATTACK", "CRIT"].includes(resultStr);
  }

  handleVictory(
    winner: string | number,
    player1: Phaser.Physics.Arcade.Sprite,
    player2: Phaser.Physics.Arcade.Sprite,
  ): void {
    const winnerId = Number(winner);
    const p1Id = Number(this.player1.id);
    const p2Id = Number(this.player2.id);

    if (winnerId === p1Id) {
      this.playVictorySequence(player1, player2);
    } else if (winnerId === p2Id) {
      this.playVictorySequence(player2, player1, true);
    } else {
      console.error("Invalid winner ID:", winner);
    }
  }

  playVictorySequence(
    winner: Phaser.Physics.Arcade.Sprite,
    loser: Phaser.Physics.Arcade.Sprite,
    isPlayer2 = false,
  ): void {
    // Play dying animation for loser
    this.animator.playAnimation(loser, "dying", !isPlayer2);

    // Get the player name from the scene data
    const winnerName = isPlayer2
      ? this.player2.name.fullName
      : this.player1.name.fullName;

    // First add Victory text - sized for mobile
    const victoryText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 200, // Moved higher for mobile layout
        "Victory",
        {
          fontFamily: "Bokor",
          fontSize: "80px",
          color: "#ff3333",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0);

    // Fade in Victory text first
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      duration: 1000,
      ease: "Power1",
      onComplete: () => {
        // After Victory text is in, add Player text - sized for mobile
        const playerText = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 130, // Moved higher to align with victory text
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            winnerName!,
            {
              fontFamily: "Bokor",
              fontSize: "40px",
              color: "#ff3333",
              stroke: "#000000",
              strokeThickness: 4,
              align: "center",
            },
          )
          .setOrigin(0.5)
          .setDepth(100)
          .setAlpha(0);

        // Slide in and fade in player text
        this.tweens.add({
          targets: playerText,
          alpha: 1,
          x: {
            from: this.cameras.main.centerX - 100,
            to: this.cameras.main.centerX,
          },
          duration: 800,
          ease: "Power2",
        });
      },
    });

    // After victory delay, turn and walk away, then taunt
    this.time.delayedCall(this.VICTORY_DELAY, () => {
      // Turn away from opponent
      winner.setFlipX(!isPlayer2);

      // Play walking animation
      this.animator.playAnimation(winner, "walking", isPlayer2);

      // Walk away from opponent
      this.tweens.add({
        targets: winner,
        x: winner.x + (isPlayer2 ? this.WALK_DISTANCE : -this.WALK_DISTANCE),
        duration: this.WALK_DURATION,
        ease: "Linear",
        onComplete: () => {
          // After walking away, start taunt sequence
          this.playTauntSequence(winner, isPlayer2);
        },
      });
    });
  }

  playTauntSequence(
    winner: Phaser.Physics.Arcade.Sprite,
    isPlayer2: boolean,
    currentTauntCount = 0,
  ): void {
    const MAX_TAUNTS = 4; // Total of 4 taunts (2 before, 2 after)

    // After first 2 taunts, play attack animation
    if (currentTauntCount === 2) {
      this.animator.playAnimation(winner, "attacking", isPlayer2);
      winner.once("animationcomplete", () => {
        // Continue with taunt sequence after attack
        this.animator.playAnimation(winner, "taunting", isPlayer2);
        winner.once("animationcomplete", () => {
          this.playTauntSequence(winner, isPlayer2, currentTauntCount + 1);
        });
      });
      return;
    }

    if (currentTauntCount >= MAX_TAUNTS) {
      this.animator.playAnimation(winner, "idle", isPlayer2);
      return;
    }

    this.animator.playAnimation(winner, "taunting", isPlayer2);

    winner.once("animationcomplete", () => {
      const nextTauntCount = currentTauntCount + 1;
      if (nextTauntCount < MAX_TAUNTS) {
        this.playTauntSequence(winner, isPlayer2, nextTauntCount);
      } else {
        this.animator.playAnimation(winner, "idle", isPlayer2);
      }
    });
  }

  // refreshPlayerStats method removed - stats handled by external UI

  private handleMuteToggle(muteState: boolean): void {
    if (this.sound) {
      this.sound.mute = muteState;
    } else {
      console.warn("Sound manager not available in FightScene?");
    }
  }

  private createFighterInfoUI(): void {
    const panelHeight = 280; // Increased from 200 to fit attributes
    const panelY = this.cameras.main.height - panelHeight;

    // Uniform brown background - fully opaque to cover any background variations
    const panel = this.add.graphics();
    panel
      .fillStyle(0x4a3728, 1.0)
      .fillRect(0, panelY, this.cameras.main.width, panelHeight)
      .setDepth(88);

    // Gold border around entire panel
    panel
      .lineStyle(3, 0xffd700, 0.9)
      .strokeRect(0, panelY, this.cameras.main.width, panelHeight);

    // Gold center divider - slightly adjusted for visual balance
    const centerX = this.cameras.main.width / 2 + 2;
    panel
      .lineStyle(2, 0xffd700, 0.8)
      .moveTo(centerX, panelY + 10)
      .lineTo(centerX, panelY + panelHeight - 10)
      .strokePath();

    // Store panel info for updates
    this.fighterInfoPanel = {
      panelY: panelY,
      sidePadding: 25,
    };

    // Create character sheets with consistent padding
    this.createCharacterSheet(
      this.player1,
      this.fighterInfoPanel.sidePadding,
      panelY + 10,
      false,
    );
    this.createCharacterSheet(
      this.player2,
      this.cameras.main.width - this.fighterInfoPanel.sidePadding,
      panelY + 10,
      true,
    );
  }

  private updateFighterInfoUI(): void {
    if (!this.fighterInfoPanel) return;

    // Get target values
    const p1Health =
      this.player1.currentState?.currentHealth ??
      (this.player1.calculatedStats?.maxHealth || 100);
    const p1Stamina =
      this.player1.currentState?.currentEndurance ??
      (this.player1.calculatedStats?.maxEndurance || 100);
    const p2Health =
      this.player2.currentState?.currentHealth ??
      (this.player2.calculatedStats?.maxHealth || 100);
    const p2Stamina =
      this.player2.currentState?.currentEndurance ??
      (this.player2.calculatedStats?.maxEndurance || 100);

    // Only tween if values changed and text elements exist
    if (
      this.fighterInfoTexts.p1Health &&
      this.currentDisplayValues.p1Health !== p1Health
    ) {
      this.tweenValue(
        "p1Health",
        p1Health,
        this.player1.calculatedStats?.maxHealth || 100,
      );
    }
    if (
      this.fighterInfoTexts.p1Stamina &&
      this.currentDisplayValues.p1Stamina !== p1Stamina
    ) {
      this.tweenValue(
        "p1Stamina",
        p1Stamina,
        this.player1.calculatedStats?.maxEndurance || 100,
      );
    }
    if (
      this.fighterInfoTexts.p2Health &&
      this.currentDisplayValues.p2Health !== p2Health
    ) {
      this.tweenValue(
        "p2Health",
        p2Health,
        this.player2.calculatedStats?.maxHealth || 100,
      );
    }
    if (
      this.fighterInfoTexts.p2Stamina &&
      this.currentDisplayValues.p2Stamina !== p2Stamina
    ) {
      this.tweenValue(
        "p2Stamina",
        p2Stamina,
        this.player2.calculatedStats?.maxEndurance || 100,
      );
    }

    // If no text elements exist, recreate the entire UI
    if (!this.fighterInfoTexts.p1Health) {
      // Clear existing character sheets and text references
      for (const child of this.children.list) {
        if (
          "depth" in child &&
          (child as Phaser.GameObjects.Text).depth === 91
        ) {
          child.destroy();
        }
      }
      this.fighterInfoTexts = {};

      // Recreate character sheets with updated data
      this.createCharacterSheet(
        this.player1,
        this.fighterInfoPanel.sidePadding,
        this.fighterInfoPanel.panelY + 10,
        false,
      );
      this.createCharacterSheet(
        this.player2,
        this.cameras.main.width - this.fighterInfoPanel.sidePadding,
        this.fighterInfoPanel.panelY + 10,
        true,
      );
    }
  }

  private tweenValue(
    key: "p1Health" | "p1Stamina" | "p2Health" | "p2Stamina",
    targetValue: number,
    maxValue: number,
  ): void {
    const textElement = this.fighterInfoTexts[key];
    if (!textElement) return;

    this.tweens.addCounter({
      from: this.currentDisplayValues[key],
      to: targetValue,
      duration: 500,
      onUpdate: (tween) => {
        const currentValue = Math.floor(tween.getValue());
        this.currentDisplayValues[key] = currentValue;
        textElement.setText(`${currentValue}/${maxValue}`);
      },
    });
  }

  private createCharacterSheet(
    player: Fighter,
    baseX: number,
    baseY: number,
    rightAlign: boolean,
  ): void {
    const align = rightAlign ? 1 : 0;
    let y = baseY;

    // NAME - aligned with ATTRIBUTES header (same style and positioning)
    const nameX = rightAlign ? baseX + 4 : baseX - 4;
    const nameText = rightAlign
      ? `ID: ${player.id} - PLAYER 2`
      : `PLAYER 1 - ID: ${player.id}`;
    this.add
      .text(nameX, y, nameText, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(rightAlign ? 1 : 0, 0)
      .setDepth(91);
    y += 25;

    // EQUIPMENT - better spacing
    this.createIconValuePair(
      baseX,
      y,
      "⚔️",
      this.getWeaponName(player.currentSkin.weapon),
      rightAlign,
    );
    y += 22;
    this.createIconValuePair(
      baseX,
      y,
      "🛡️",
      this.getArmorName(player.currentSkin.armor),
      rightAlign,
    );
    y += 22;
    this.createIconValuePair(
      baseX,
      y,
      this.getStanceIcon(player.stance),
      this.getStanceName(player.stance),
      rightAlign,
    );
    y += 25;

    // RECORD - just numbers
    const wins = player.record.wins || 0;
    const losses = player.record.losses || 0;
    const kills = player.record.kills || 0;
    this.createIconValuePair(
      baseX,
      y,
      "🏆",
      `${wins}-${losses}-${kills}`,
      rightAlign,
    );
    y += 25;

    // HEALTH & ENDURANCE - current/max format with tweening
    const currentHealth =
      player.currentState?.currentHealth ??
      (player.calculatedStats?.maxHealth || 100);
    const maxHealth = player.calculatedStats?.maxHealth || 100;
    const currentEndurance =
      player.currentState?.currentEndurance ??
      (player.calculatedStats?.maxEndurance || 100);
    const maxEndurance = player.calculatedStats?.maxEndurance || 100;

    // Initialize display values on first creation
    const isPlayer1 = !rightAlign;
    if (isPlayer1) {
      if (this.currentDisplayValues.p1Health === 0)
        this.currentDisplayValues.p1Health = currentHealth;
      if (this.currentDisplayValues.p1Stamina === 0)
        this.currentDisplayValues.p1Stamina = currentEndurance;
    } else {
      if (this.currentDisplayValues.p2Health === 0)
        this.currentDisplayValues.p2Health = currentHealth;
      if (this.currentDisplayValues.p2Stamina === 0)
        this.currentDisplayValues.p2Stamina = currentEndurance;
    }

    this.fighterInfoTexts[isPlayer1 ? "p1Health" : "p2Health"] =
      this.createIconValuePair(
        baseX,
        y,
        "❤️",
        `${Math.floor(isPlayer1 ? this.currentDisplayValues.p1Health : this.currentDisplayValues.p2Health)}/${maxHealth}`,
        rightAlign,
      );
    y += 22;
    this.fighterInfoTexts[isPlayer1 ? "p1Stamina" : "p2Stamina"] =
      this.createIconValuePair(
        baseX,
        y,
        "⚡",
        `${Math.floor(isPlayer1 ? this.currentDisplayValues.p1Stamina : this.currentDisplayValues.p2Stamina)}/${maxEndurance}`,
        rightAlign,
      );
    y += 25;

    // ATTRIBUTES SECTION - moved to bottom for better visual flow
    // Attributes header aligned with icon edges (left edge for P1, right edge for P2)
    const attributesHeaderX = rightAlign ? baseX + 4 : baseX - 4;
    this.add
      .text(attributesHeaderX, y, "ATTRIBUTES", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(rightAlign ? 1 : 0, 0)
      .setDepth(91);
    y += 22;

    // Row 1: Strength, Constitution, Size
    this.createAttributeRow(
      baseX,
      y,
      [
        { icon: "", name: "STR", value: player.attributes.strength },
        { icon: "", name: "CON", value: player.attributes.constitution },
        { icon: "", name: "SIZE", value: player.attributes.size },
      ],
      rightAlign,
    );
    y += 32; // Increased spacing for two-line attributes

    // Row 2: Agility, Stamina, Luck
    this.createAttributeRow(
      baseX,
      y,
      [
        { icon: "", name: "AGI", value: player.attributes.agility },
        { icon: "", name: "STA", value: player.attributes.stamina },
        { icon: "", name: "LUCK", value: player.attributes.luck },
      ],
      rightAlign,
    );
  }

  private createAttributeRow(
    baseX: number,
    y: number,
    attributes: Array<{ icon: string; name: string; value: number }>,
    rightAlign: boolean,
  ): void {
    const attributeWidth = 70; // Space for each attribute
    const startX = rightAlign
      ? baseX - (attributes.length - 1) * attributeWidth + 4 // Align with right edge of icons
      : baseX - 4; // Align with left edge of icons

    attributes.forEach((attr, index) => {
      const x = rightAlign
        ? startX + (attributes.length - 1 - index) * attributeWidth
        : startX + index * attributeWidth;

      // Attribute name and value on separate lines
      this.add
        .text(x, y, attr.name, {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#CCCCCC",
          fontStyle: "bold",
        })
        .setOrigin(rightAlign ? 1 : 0, 0)
        .setDepth(91);

      this.add
        .text(x, y + 14, attr.value.toString(), {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#FFFFFF",
          fontStyle: "bold",
        })
        .setOrigin(rightAlign ? 1 : 0, 0)
        .setDepth(91);
    });
  }

  private createIconValuePair(
    x: number,
    y: number,
    icon: string,
    value: string,
    rightAlign: boolean,
  ): Phaser.GameObjects.Text {
    const iconX = rightAlign ? x - 5 : x + 5;
    const textX = rightAlign ? x - 25 : x + 25;
    const align = rightAlign ? 1 : 0;

    // Icon
    this.add
      .text(iconX, y, icon, {
        fontFamily: "Arial",
        fontSize: "18px",
      })
      .setOrigin(0.5, 0)
      .setDepth(91);

    // Value text - bigger and better
    return this.add
      .text(textX, y, value, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(rightAlign ? 1 : 0, 0)
      .setDepth(91);
  }

  private getStanceIcon(stance: number): string {
    switch (stance) {
      case 0:
        return "🛡️"; // Defensive
      case 1:
        return "⚖️"; // Balanced
      case 2:
        return "⚔️"; // Offensive
      default:
        return "⚖️";
    }
  }

  private getWeaponName(weapon: number): string {
    return getWeaponDisplayName(weapon as WeaponType) || `Weapon #${weapon}`;
  }

  private getArmorName(armor: number): string {
    return getArmorDisplayName(armor as ArmorType) || `Armor #${armor}`;
  }

  private getStanceName(stance: number): string {
    return getStanceDisplayName(stance as StanceType) || `Stance #${stance}`;
  }
}
