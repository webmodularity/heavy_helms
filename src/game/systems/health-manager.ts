import type { Fighter } from "@/types/fighter-types";
import type { Scene } from "phaser";
import * as WebFont from "webfontloader";

interface BarConfig {
  width: number;
  staminaWidth: number;
  height: number;
  staminaHeight: number;
  fillHeight: number;
  padding: number;
  y: number;
  labelPadding: number;
  staminaGap: number;
  p1x: number;
  p2x: number;
  nudgeFactor: number;
}

interface PlayerBars {
  healthBg: Phaser.GameObjects.Image;
  healthFill: Phaser.GameObjects.Image;
  staminaBg: Phaser.GameObjects.Image;
  staminaFill: Phaser.GameObjects.Image;
  health: number; // Keep these for smooth animations
  maxHealth: number;
  stamina: number;
  maxStamina: number;
}

interface Tweens {
  p1Health: Phaser.Tweens.Tween | null;
  p2Health: Phaser.Tweens.Tween | null;
  p1Stamina: Phaser.Tweens.Tween | null;
  p2Stamina: Phaser.Tweens.Tween | null;
  duration: number;
}

export class HealthManager {
  private scene: Scene;
  private player1: Fighter;
  private player2: Fighter;
  private barConfig: BarConfig;
  private p1Bars: PlayerBars | null;
  private p2Bars: PlayerBars | null;
  private tweens: Tweens;

  constructor(scene: Scene, player1: Fighter, player2: Fighter) {
    this.scene = scene;
    this.player1 = player1;
    this.player2 = player2;
    this.barConfig = {
      width: 180,
      staminaWidth: 135,
      height: 18,
      staminaHeight: 12,
      fillHeight: 19,
      padding: 2,
      y: 40,
      labelPadding: 30,
      staminaGap: 6,
      p1x: 20,
      p2x: 280, // Moved from 260 to 280 for perfect symmetry (480 - 180 - 20 = 280)
      nudgeFactor: 2,
    };
    this.p1Bars = null;
    this.p2Bars = null;

    // Add tweening properties
    this.tweens = {
      p1Health: null,
      p2Health: null,
      p1Stamina: null,
      p2Stamina: null,
      duration: 500, // Duration of health/stamina change animation
    };
  }

  createBars() {
    // Get max values from player data
    const p1MaxHealth = this.player1.calculatedStats?.maxHealth || 100;
    const p2MaxHealth = this.player2.calculatedStats?.maxHealth || 100;
    const p1MaxEndurance = this.player1.calculatedStats?.maxEndurance || 100;
    const p2MaxEndurance = this.player2.calculatedStats?.maxEndurance || 100;

    // Get current values from player state
    const p1CurrentHealth =
      this.player1.currentState?.currentHealth || p1MaxHealth;
    const p2CurrentHealth =
      this.player2.currentState?.currentHealth || p2MaxHealth;
    const p1CurrentStamina =
      this.player1.currentState?.currentEndurance || p1MaxEndurance;
    const p2CurrentStamina =
      this.player2.currentState?.currentEndurance || p2MaxEndurance;

    // Player 1 bars (right-aligned, white accent on left)
    this.p1Bars = {
      healthBg: this.scene.add
        .image(this.barConfig.p1x, this.barConfig.y, "bar-bg")
        .setOrigin(0, 0)
        .setDepth(98)
        .setDisplaySize(this.barConfig.width, this.barConfig.height),
      healthFill: this.scene.add
        .image(
          this.barConfig.p1x + this.barConfig.width,
          this.barConfig.y,
          "bar-fill-2",
        )
        .setOrigin(1, 0)
        .setDepth(100)
        .setDisplaySize(this.barConfig.width, this.barConfig.height),
      staminaBg: this.scene.add
        .image(
          this.barConfig.p1x +
            this.barConfig.width -
            this.barConfig.staminaWidth -
            this.barConfig.nudgeFactor,
          this.barConfig.y + this.barConfig.height + this.barConfig.staminaGap,
          "bar-bg",
        )
        .setOrigin(0, 0)
        .setDepth(98)
        .setDisplaySize(
          this.barConfig.staminaWidth,
          this.barConfig.staminaHeight,
        ),
      staminaFill: this.scene.add
        .image(
          this.barConfig.p1x +
            this.barConfig.width -
            this.barConfig.nudgeFactor,
          this.barConfig.y + this.barConfig.height + this.barConfig.staminaGap,
          "bar-fill-1",
        )
        .setOrigin(1, 0)
        .setDepth(100)
        .setDisplaySize(
          this.barConfig.staminaWidth,
          this.barConfig.staminaHeight,
        ),
      health: p1CurrentHealth,
      maxHealth: p1MaxHealth,
      stamina: p1CurrentStamina,
      maxStamina: p1MaxEndurance,
    };

    // Player 2 bars (left-aligned, white accent on right)
    this.p2Bars = {
      healthBg: this.scene.add
        .image(this.barConfig.p2x, this.barConfig.y, "bar-bg")
        .setOrigin(0, 0)
        .setDepth(98)
        .setDisplaySize(this.barConfig.width, this.barConfig.height),
      healthFill: this.scene.add
        .image(this.barConfig.p2x, this.barConfig.y, "bar-fill-2-right")
        .setOrigin(0, 0)
        .setDepth(100)
        .setDisplaySize(this.barConfig.width, this.barConfig.height),
      staminaBg: this.scene.add
        .image(
          this.barConfig.p2x + this.barConfig.nudgeFactor,
          this.barConfig.y + this.barConfig.height + this.barConfig.staminaGap,
          "bar-bg",
        )
        .setOrigin(0, 0)
        .setDepth(98)
        .setDisplaySize(
          this.barConfig.staminaWidth,
          this.barConfig.staminaHeight,
        ),
      staminaFill: this.scene.add
        .image(
          this.barConfig.p2x + this.barConfig.nudgeFactor,
          this.barConfig.y + this.barConfig.height + this.barConfig.staminaGap,
          "bar-fill-1-right",
        )
        .setOrigin(0, 0)
        .setDepth(100)
        .setDisplaySize(
          this.barConfig.staminaWidth,
          this.barConfig.staminaHeight,
        ),
      health: p2CurrentHealth,
      maxHealth: p2MaxHealth,
      stamina: p2CurrentStamina,
      maxStamina: p2MaxEndurance,
    };

    // Initialize the display
    this.updateBarDisplays();

    // Load fonts and create player labels
    WebFont.load({
      google: {
        families: ["Bokor", "Montserrat:700"],
      },
      active: () => this.createPlayerLabels(),
    });
  }

  createPlayerLabels() {
    const p1Name = this.player1.name.fullName || "";
    const p2Name = this.player2.name.fullName || "";

    // Player labels - larger font for better readability
    this.scene.add
      .text(
        this.barConfig.p1x + this.barConfig.width - 5,
        this.barConfig.y - this.barConfig.labelPadding,
        p1Name,
        {
          fontFamily: "Bokor",
          fontSize: "20px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 5,
        },
      )
      .setOrigin(1, 0)
      .setDepth(98);

    this.scene.add
      .text(
        this.barConfig.p2x + 5,
        this.barConfig.y - this.barConfig.labelPadding,
        p2Name,
        {
          fontFamily: "Bokor",
          fontSize: "20px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 5,
        },
      )
      .setOrigin(0, 0)
      .setDepth(98);
  }

  // Method to update the bars from player state
  updateBars() {
    if (!this.p1Bars || !this.p2Bars) return;

    // Get current values from player state
    const p1Health = this.player1.currentState?.currentHealth || 0;
    const p2Health = this.player2.currentState?.currentHealth || 0;
    const p1Stamina = this.player1.currentState?.currentEndurance || 0;
    const p2Stamina = this.player2.currentState?.currentEndurance || 0;

    // Update the bars with values from player state
    this.animateBars(p1Health, p2Health, p1Stamina, p2Stamina);
  }

  // Private method to handle the actual animation logic
  private animateBars(
    p1Health: number,
    p2Health: number,
    p1Stamina: number,
    p2Stamina: number,
  ) {
    if (!this.p1Bars || !this.p2Bars) return;

    // Kill any existing tweens
    if (this.tweens.p1Health) this.tweens.p1Health.stop();
    if (this.tweens.p2Health) this.tweens.p2Health.stop();
    if (this.tweens.p1Stamina) this.tweens.p1Stamina.stop();
    if (this.tweens.p2Stamina) this.tweens.p2Stamina.stop();

    // Create new tweens
    this.tweens.p1Health = this.scene.tweens.addCounter({
      from: this.p1Bars.health,
      to: p1Health,
      duration: this.tweens.duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        this.p1Bars!.health = tween.getValue();
        this.updateBarDisplays();
      },
    });

    this.tweens.p2Health = this.scene.tweens.addCounter({
      from: this.p2Bars.health,
      to: p2Health,
      duration: this.tweens.duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        this.p2Bars!.health = tween.getValue();
        this.updateBarDisplays();
      },
    });

    this.tweens.p1Stamina = this.scene.tweens.addCounter({
      from: this.p1Bars.stamina,
      to: p1Stamina,
      duration: this.tweens.duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        this.p1Bars!.stamina = tween.getValue();
        this.updateBarDisplays();
      },
    });

    this.tweens.p2Stamina = this.scene.tweens.addCounter({
      from: this.p2Bars.stamina,
      to: p2Stamina,
      duration: this.tweens.duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        this.p2Bars!.stamina = tween.getValue();
        this.updateBarDisplays();
      },
    });
  }

  updateBarDisplays() {
    if (!this.p1Bars || !this.p2Bars) return;

    // Calculate the actual widths
    const p1HealthWidth =
      this.barConfig.width * (this.p1Bars.health / this.p1Bars.maxHealth);
    const p2HealthWidth =
      this.barConfig.width * (this.p2Bars.health / this.p2Bars.maxHealth);
    const p1StaminaWidth =
      this.barConfig.staminaWidth *
      (this.p1Bars.stamina / this.p1Bars.maxStamina);
    const p2StaminaWidth =
      this.barConfig.staminaWidth *
      (this.p2Bars.stamina / this.p2Bars.maxStamina);

    // Update Player 1 bars (right-aligned, drains right-to-left)
    this.p1Bars.healthFill.setX(this.barConfig.p1x + this.barConfig.width);
    this.p1Bars.healthFill.displayWidth = p1HealthWidth;

    this.p1Bars.staminaFill.setX(
      this.barConfig.p1x + this.barConfig.width - this.barConfig.nudgeFactor,
    );
    this.p1Bars.staminaFill.displayWidth = p1StaminaWidth;

    // Update Player 2 bars (left-aligned, drains left-to-right)
    this.p2Bars.healthFill.displayWidth = p2HealthWidth;
    this.p2Bars.staminaFill.displayWidth = p2StaminaWidth;
  }
}
