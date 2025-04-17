import { Scene } from "phaser";
import { EventBus, GameEvents } from "../EventBus";

import { DamageNumbers } from "../systems/damage-numbers";
import { CombatAnimator } from "../systems/combat-animator";
import { CombatAudioManager } from "../systems/combat-audio-manager";
import { HealthManager } from "../systems/health-manager";
import { PlayerStatsDisplay } from "../systems/player-stats-display";
import type {
  CombatAction,
  DecodedCombatResult,
  SceneData,
} from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";

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
  private player1Stats: PlayerStatsDisplay;
  private player2Stats: PlayerStatsDisplay;

  // Game state
  private isInitialized = false;
  private isFightSequencePlaying = false;
  private playerStartX = 0;
  private player2StartX = 0;
  private centerX = 0;
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
    fontSize: "120px",
    fontFamily: "Bokor",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 8,
    duration: 750,
    scale: { from: 2, to: 0.5 },
    alpha: { from: 1, to: 0 },
  };

  private titleTextConfig = {
    main: {
      fontFamily: "Bokor",
      fontSize: "140px",
      color: "#ffd700",
      stroke: "#8b0000",
      strokeThickness: 12,
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
      fontSize: "144px",
      color: "#000000",
      alpha: 0.7,
    },
    metallic: {
      fontFamily: "Bokor",
      fontSize: "140px",
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
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownText?.setText(count.toString());
      } else {
        clearInterval(countdownInterval);
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
        .image(0, 0, layer.key)
        .setOrigin(0, 0)
        .setScale(0.5)
        .setDepth(layer.depth)
        .setAlpha(layer.alpha);
    }

    // 2. Player Setup
    const groundY = 600;
    this.player1Sprite = this.physics.add
      .sprite(125, groundY - 40, `fighter${this.player1.id}-spritesheet`)
      .setFlipX(false)
      .setOrigin(0.5, 1)
      .setDisplaySize(300, 300)
      .setDepth(5);

    this.player2Sprite = this.physics.add
      .sprite(835, groundY - 40, `fighter${this.player2.id}-spritesheet`)
      .setFlipX(true)
      .setOrigin(0.5, 1)
      .setDisplaySize(300, 300)
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

    // Replace both text elements with a single combined text element
    this.networkText = this.add
      .text(
        5,
        this.cameras.main.height - 5,
        `Network: ${this.network} | Block#: ${this.blockNumber} | GameEngine: v${Math.floor((this.decodedCombatBytes.gameEngineVersion || 0) / 100)}.${(this.decodedCombatBytes?.gameEngineVersion || 0) % 100} | Transaction: ${this.txId}`,
        {
          fontFamily: "Arial",
          fontSize: "10px",
          color: "#cccccc",
          align: "left",
        },
      )
      .setOrigin(0, 1)
      .setDepth(100);

    // Create player stats displays immediately but don't show them yet
    this.player1Stats = new PlayerStatsDisplay(this, 10, 160, false);
    this.player2Stats = new PlayerStatsDisplay(
      this,
      this.cameras.main.width - 150,
      160,
      true,
    );

    // Update stats but don't show yet
    this.player1Stats.update(this.player1);
    this.player2Stats.update(this.player2);

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
    if (
      this.isFightSequencePlaying ||
      !this.player1Sprite ||
      !this.player2Sprite
    ) {
      // Handle error silently
      return;
    }
    this.isFightSequencePlaying = true;

    this.startCountdown().then(() => {
      if (!this.player1Sprite || !this.player2Sprite) return;

      // Initial run to center
      this.animator?.playAnimation(this.player1Sprite, "running");
      this.animator?.playAnimation(this.player2Sprite, "running", true);

      // Move players to center and show stats during the run
      this.tweens.add({
        targets: this.player1Sprite,
        x: this.centerX - 75,
        duration: 1000,
        onStart: () => {
          this.time.delayedCall(300, () => {
            this.player1Stats?.show();
            this.refreshPlayerStats();
          });
        },
        onComplete: () => {
          this.animator?.playAnimation(this.player1Sprite, "idle");
        },
      });

      this.tweens.add({
        targets: this.player2Sprite,
        x: this.centerX + 75,
        duration: 1000,
        onStart: () => {
          this.time.delayedCall(300, () => {
            this.player2Stats?.show();
            this.refreshPlayerStats();
          });
        },
        onComplete: () => {
          this.animator?.playAnimation(this.player2Sprite, "idle", true);
          if (this.decodedCombatBytes.actions) {
            this.time.delayedCall(500, () => {
              this.playCombatSequence(0);
            });
          }
        },
      });
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
        this.time.delayedCall(this.SEQUENCE_DELAY, () => {
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
        if (index >= numbers.length) {
          resolve();
          return;
        }

        const number = numbers[index];
        const scale = number === "Fight!" ? 1.25 : 2;
        const texts = this.createStyledText(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
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
              this.time.delayedCall(750, () => {
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

      // Update player stats display with delay
      this.refreshPlayerStats(true);

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

      // Update player stats display with delay
      this.refreshPlayerStats(true);

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

    // Update player stats displays
    this.refreshPlayerStats(true);

    // Update the health bars with actual values after a longer delay
    this.time.delayedCall(1200, () => {
      this.healthManager.updateBars();
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

    // First add Victory text
    const victoryText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 90,
        "Victory",
        {
          fontFamily: "Bokor",
          fontSize: "120px",
          color: "#ff3333",
          stroke: "#000000",
          strokeThickness: 8,
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
        // After Victory text is in, add Player text
        const playerText = this.add
          .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 10,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            winnerName!,
            {
              fontFamily: "Bokor",
              fontSize: "60px",
              color: "#ff3333",
              stroke: "#000000",
              strokeThickness: 6,
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
          EventBus?.emit(GameEvents.GAME_OVER);
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

  private refreshPlayerStats(withDelay = false): void {
    if (withDelay) {
      // For combat damage, use delayed update for both stats and health bars
      this.player1Stats?.updateWithDelay(this.player1);
      this.player2Stats?.updateWithDelay(this.player2);

      // Update health/stamina bars with same delay
      this.time.delayedCall(1200, () => {
        this.healthManager.updateBars();
      });
    } else {
      // For initial setup, update immediately
      this.player1Stats?.update(this.player1);
      this.player2Stats?.update(this.player2);

      // Update health/stamina bars immediately
      this.healthManager.updateBars();
    }
  }

  private handleMuteToggle(muteState: boolean): void {
    if (this.sound) {
      this.sound.mute = muteState;
    } else {
      console.warn("Sound manager not available in FightScene?");
    }
  }
}
