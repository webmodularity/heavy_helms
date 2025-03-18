import type { Player } from "@/types/player.types";
import type { GameObjects, Scene } from "phaser";
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

interface DisplayStyles {
  container: {
    backgroundColor: number;
    alpha: number;
    borderColor: number;
    borderWidth: number;
  };
  header: {
    fontFamily: string;
    fontSize: string;
    color: string;
  };
  label: {
    fontFamily: string;
    fontSize: string;
    color: string;
  };
  value: {
    fontFamily: string;
    fontSize: string;
    color: string;
  };
}

interface StateTweens {
  health: Phaser.Tweens.Tween | null;
  stamina: Phaser.Tweens.Tween | null;
  duration: number;
}

export class PlayerStatsDisplay {
  private scene: Scene;
  private x: number;
  private y: number;
  private isRightSide: boolean;
  private containerWidth: number;
  private padding: number;
  private labelWidth: number;
  private valueWidth: number;
  private labelStartX: number;
  private valueStartX: number;
  private startX: number;
  private targetX: number;
  private styles: DisplayStyles;
  private container: GameObjects.Container;
  private textElements: GameObjects.Text[];
  private background?: GameObjects.Graphics;

  // Reference for health and stamina text elements
  private healthText?: GameObjects.Text;
  private staminaText?: GameObjects.Text;

  // Tween values
  private currentHealth = 0;
  private currentStamina = 0;
  private tweens: StateTweens;
  private updateDelay = 1200;

  // Player reference
  private player: Player | null = null;

  constructor(scene: Scene, x: number, y: number, isRightSide = false) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isRightSide = isRightSide;
    this.textElements = [];

    // Style configurations
    this.containerWidth = 160;
    this.padding = 12;
    this.labelWidth = 45;
    this.valueWidth = 55;

    // Calculate text positions with padding between label and value
    if (isRightSide) {
      this.labelStartX = x + this.padding;
      this.valueStartX = x + this.padding + this.labelWidth + 20;
      // Start position for right side (off screen)
      this.startX = scene.cameras.main.width;
      this.targetX = scene.cameras.main.width - this.containerWidth;
    } else {
      this.labelStartX = x + this.padding;
      this.valueStartX = x + this.padding + this.labelWidth + 20;
      // Start position for left side (off screen)
      this.startX = -this.containerWidth;
      this.targetX = 0;
    }

    this.styles = {
      container: {
        backgroundColor: 0x000000,
        alpha: 0.4,
        borderColor: 0x000000,
        borderWidth: 1,
      },
      header: {
        fontFamily: "Bokor",
        fontSize: "14px",
        color: "#ffffff",
      },
      label: {
        fontFamily: "Montserrat",
        fontSize: "11px",
        color: "#888888",
      },
      value: {
        fontFamily: "Montserrat",
        fontSize: "11px",
        color: "#d4af37",
      },
    };

    // Initialize tweens
    this.tweens = {
      health: null,
      stamina: null,
      duration: 500, // Duration of health/stamina change animation
    };

    // Create container immediately
    this.createContainer();
    // Set initial position
    this.container.x = this.startX;
  }

  public show(): void {
    // Slide in from the side when combat starts
    this.scene.tweens.add({
      targets: this.container,
      x: this.targetX,
      duration: 500,
      ease: "Power2",
    });
  }

  private createContainer(): void {
    this.container = this.scene.add.container(0, this.y);
    this.container.setDepth(10);
  }

  public updateWithDelay(player: Player): void {
    // Store player reference immediately
    this.player = player;

    // Delay the actual update to match health bar animation timing
    this.scene.time.delayedCall(this.updateDelay, () => {
      // If this is the first update, initialize current values
      if (this.currentHealth === 0 && this.currentStamina === 0) {
        this.currentHealth = player.currentState?.currentHealth ?? 0;
        this.currentStamina = player.currentState?.currentEndurance ?? 0;
      }

      // Get target values
      const targetHealth = player.currentState?.currentHealth ?? 0;
      const targetStamina = player.currentState?.currentEndurance ?? 0;

      // Only tween health and stamina values
      this.updateStatsWithTween(targetHealth, targetStamina);
    });
  }

  public update(player: Player): void {
    // Store player reference
    this.player = player;

    // If this is the first update, initialize current values
    if (this.currentHealth === 0 && this.currentStamina === 0) {
      this.currentHealth = player.currentState?.currentHealth ?? 0;
      this.currentStamina = player.currentState?.currentEndurance ?? 0;
    }

    // Get target values
    const targetHealth = player.currentState?.currentHealth ?? 0;
    const targetStamina = player.currentState?.currentEndurance ?? 0;

    // First initial update or non-stat-related update
    const isFirstUpdate = !this.healthText || !this.staminaText;
    const statsChanged =
      this.currentHealth !== targetHealth ||
      this.currentStamina !== targetStamina;

    if (isFirstUpdate || !statsChanged) {
      this.fullUpdate(player);
      return;
    }

    // Only tween the health and stamina values
    this.updateStatsWithTween(targetHealth, targetStamina);
  }

  private updateStatsWithTween(targetHealth: number, targetStamina: number) {
    // Kill any existing tweens
    if (this.tweens.health) this.tweens.health.stop();
    if (this.tweens.stamina) this.tweens.stamina.stop();

    // Update health with tween
    this.tweens.health = this.scene.tweens.addCounter({
      from: this.currentHealth,
      to: targetHealth,
      duration: this.tweens.duration,
      onUpdate: (tween) => {
        this.currentHealth = Math.floor(tween.getValue());
        this.updateHealthText();
      },
    });

    // Update stamina with tween
    this.tweens.stamina = this.scene.tweens.addCounter({
      from: this.currentStamina,
      to: targetStamina,
      duration: this.tweens.duration,
      onUpdate: (tween) => {
        this.currentStamina = Math.floor(tween.getValue());
        this.updateStaminaText();
      },
    });
  }

  private updateHealthText() {
    if (this.healthText && this.player) {
      const maxHealth = this.player.calculatedStats?.maxHealth ?? 100;
      this.healthText.setText(`${Math.floor(this.currentHealth)}/${maxHealth}`);
    }
  }

  private updateStaminaText() {
    if (this.staminaText && this.player) {
      const maxEndurance = this.player.calculatedStats?.maxEndurance ?? 100;
      this.staminaText.setText(
        `${Math.floor(this.currentStamina)}/${maxEndurance}`,
      );
    }
  }

  private fullUpdate(player: Player): void {
    // Clear existing elements
    if (this.textElements.length > 0) {
      for (const element of this.textElements) {
        this.container.remove(element);
        element.destroy();
      }
    }
    this.textElements = [];

    if (this.background) {
      this.container.remove(this.background);
      this.background.destroy();
    }

    let currentY = this.padding;
    const spacing = 14;
    let maxWidth = 0;

    const addHeader = (text: string): void => {
      const headerText = this.scene.add
        .text(this.padding + 2, currentY, text, this.styles.header)
        .setOrigin(0, 0);
      currentY += spacing * 1.2;
      this.textElements.push(headerText);
      maxWidth = Math.max(maxWidth, headerText.width + this.padding * 2);
    };

    const addTextRow = (label: string, value: string | number): void => {
      const labelText = this.scene.add
        .text(this.padding, currentY, `${label}:`, this.styles.label)
        .setOrigin(0, 0);

      const valueText = this.scene.add
        .text(
          this.padding + this.labelWidth + 20,
          currentY,
          value.toString(),
          this.styles.value,
        )
        .setOrigin(0, 0);

      maxWidth = Math.max(
        maxWidth,
        valueText.x + valueText.width + this.padding,
      );
      this.textElements.push(labelText, valueText);

      // Store references to health and stamina text
      if (label === "HP") {
        this.healthText = valueText;
        this.currentHealth = player.currentState?.currentHealth ?? 0;
      } else if (label === "STAM") {
        this.staminaText = valueText;
        this.currentStamina = player.currentState?.currentEndurance ?? 0;
      }

      currentY += spacing;
    };

    // Strategy section
    addHeader("Strategy");

    // Convert numeric values to display names using the utility functions
    const weaponValue = player.currentSkin.weapon || 0;
    const armorValue = player.currentSkin.armor || 0;
    const stanceValue = player.currentSkin.stance || 0;

    // Use the utility functions to get display names
    const weaponDisplay = getWeaponDisplayName(weaponValue as WeaponType);
    const armorDisplay = getArmorDisplayName(armorValue as ArmorType);
    const stanceDisplay = getStanceDisplayName(stanceValue as StanceType);

    addTextRow("Weapon", weaponDisplay);
    addTextRow("Armor", armorDisplay);
    addTextRow("Stance", stanceDisplay);
    currentY += spacing / 2;

    // Stats section
    addHeader("Stats");
    addTextRow("Str", player.attributes.strength || 0);
    addTextRow("Con", player.attributes.constitution || 0);
    addTextRow("Size", player.attributes.size || 0);
    addTextRow("Agi", player.attributes.agility || 0);
    addTextRow("Stam", player.attributes.stamina || 0);
    addTextRow("Luck", player.attributes.luck || 0);

    // Get health and stamina values from player state
    const currentHealth = player.currentState?.currentHealth ?? 0;
    const maxHealth = player.calculatedStats?.maxHealth ?? 100;
    const currentEndurance = player.currentState?.currentEndurance ?? 0;
    const maxEndurance = player.calculatedStats?.maxEndurance ?? 100;

    addTextRow("HP", `${Math.floor(currentHealth)}/${maxHealth}`);
    addTextRow("STAM", `${Math.floor(currentEndurance)}/${maxEndurance}`);
    currentY += spacing / 2;

    // Reputation section
    addHeader("Reputation");
    addTextRow(
      "Record",
      `${player.record.wins || 0}-${player.record.losses || 0}-${player.record.kills || 0}`,
    );
    addTextRow("ID", player.id);

    // Create background with calculated dimensions
    const bg = this.scene.add.graphics();
    const containerHeight = currentY + this.padding;
    this.containerWidth = Math.max(160, maxWidth);

    // Fill with semi-transparent black
    bg.fillStyle(
      this.styles.container.backgroundColor,
      this.styles.container.alpha,
    );
    bg.fillRect(0, 0, this.containerWidth, containerHeight);

    // Add borders
    bg.lineStyle(
      this.styles.container.borderWidth,
      this.styles.container.borderColor,
    );

    // Top border
    bg.beginPath();
    bg.moveTo(0, 0);
    bg.lineTo(this.containerWidth, 0);
    bg.strokePath();

    // Bottom border
    bg.beginPath();
    bg.moveTo(0, containerHeight);
    bg.lineTo(this.containerWidth, containerHeight);
    bg.strokePath();

    // Side border (right for player 1, left for player 2)
    bg.beginPath();
    if (this.isRightSide) {
      bg.moveTo(0, 0);
      bg.lineTo(0, containerHeight);
    } else {
      bg.moveTo(this.containerWidth, 0);
      bg.lineTo(this.containerWidth, containerHeight);
    }
    bg.strokePath();

    // Add background first
    this.container.add(bg);
    this.background = bg;

    // Add all text elements with proper depth
    for (const element of this.textElements) {
      element.setDepth(11);
      this.container.add(element);
    }
  }
}
