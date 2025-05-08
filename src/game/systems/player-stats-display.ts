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
import type { Fighter } from "@/types/fighter-types";

interface DisplayStyles {
  container: {
    backgroundColor: number;
    alpha: number;
    borderColor: number;
    borderWidth: number;
    borderRadius?: number;
    shadowColor?: number;
    shadowBlur?: number;
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
  private player: Fighter | null = null;

  constructor(scene: Scene, x: number, y: number, isRightSide = false) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isRightSide = isRightSide;
    this.textElements = [];

    // Style configurations
    this.containerWidth = 320;
    this.padding = 20;
    this.labelWidth = 80;
    this.valueWidth = 140;

    // Calculate text positions with padding between label and value
    if (isRightSide) {
      this.labelStartX = x + this.padding;
      this.valueStartX = x + this.padding + this.labelWidth + 20;
      // Start position for right side (off screen)
      this.startX = scene.cameras.main.width + 20;
      this.targetX = scene.cameras.main.width - this.containerWidth - x;
    } else {
      this.labelStartX = x + this.padding;
      this.valueStartX = x + this.padding + this.labelWidth + 20;
      // Start position for left side (off screen)
      this.startX = -this.containerWidth;
      this.targetX = x;
    }

    this.styles = {
      container: {
        backgroundColor: 0x000000,
        alpha: 0.8,
        borderColor: 0xffd700,
        borderWidth: 3,
        borderRadius: 8,
        shadowColor: 0x000000,
        shadowBlur: 15
      },
      header: {
        fontFamily: "Bokor",
        fontSize: "24px",
        color: "#ffd700",
      },
      label: {
        fontFamily: "Montserrat",
        fontSize: "18px",
        color: "#ffffff",
      },
      value: {
        fontFamily: "Montserrat",
        fontSize: "18px",
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

  public updateWithDelay(player: Fighter): void {
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

  public update(player: Fighter): void {
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

  private fullUpdate(player: Fighter): void {
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
    const spacing = 20;
    let maxWidth = 0;

    const addHeader = (text: string): void => {
      const headerText = this.scene.add
        .text(this.padding + 2, currentY, text, this.styles.header)
        .setOrigin(0, 0);
      currentY += spacing * 1.2;
      this.textElements.push(headerText);
      maxWidth = Math.max(maxWidth, headerText.width + this.padding * 2);
    };

    const addTextRow = (
      label: string,
      value: string | number,
      isMultiLineHint = false,
    ): void => {
      const labelText = this.scene.add
        .text(this.padding, currentY, `${label}:`, this.styles.label)
        .setOrigin(0, 0);

      // Create the value text using the base style
      const valueText = this.scene.add
        .text(
          this.padding + this.labelWidth + 20,
          currentY,
          value.toString(),
          this.styles.value, // Use the original style object
        )
        .setOrigin(0, 0);

      // --- Set lineSpacing AFTER creation if needed ---
      const lines = value.toString().split("\n");
      if (lines.length > 1) {
        valueText.setLineSpacing(3); // Set spacing directly on the Text object
      }
      // --- End lineSpacing adjustment ---

      // Adjust maxWidth calculation (remains the same)
      const valueTextWidth = valueText.width;
      maxWidth = Math.max(
        maxWidth,
        this.padding + this.labelWidth + 20 + valueTextWidth + this.padding,
      );

      this.textElements.push(labelText, valueText);

      // Store references
      if (label === "Health") this.healthText = valueText;
      if (label === "Energy") this.staminaText = valueText;

      // Increment Y position (remains the same)
      const lineCount = lines.length;
      currentY += spacing * lineCount;
      if (lineCount > 1) {
        currentY += spacing * 0.2;
      }
    };

    // Strategy section
    addHeader("Strategy");

    const weaponValue = player.currentSkin.weapon || 0;
    const armorValue = player.currentSkin.armor || 0;
    const stanceValue = player.stance || 0;

    // Get display names
    let weaponDisplay = getWeaponDisplayName(weaponValue as WeaponType);
    const armorDisplay = getArmorDisplayName(armorValue as ArmorType);
    const stanceDisplay = getStanceDisplayName(stanceValue as StanceType);

    // Add the newline logic for " + "
    const isMultiLineWeapon = weaponDisplay.includes(" + ");
    if (isMultiLineWeapon) {
      weaponDisplay = weaponDisplay.replace(" + ", "\n+ ");
    } else {
      // If it wasn't multi-line due to "+", add a blank newline anyway
      // to ensure consistent height with panels that ARE multi-line.
      weaponDisplay += "\n";
    }

    // The isMultiLineHint might not be strictly necessary anymore with this approach,
    // but we can leave it or remove it depending on how addTextRow uses it.
    // Let's keep it for now as addTextRow uses lineCount.
    const finalIsMultiLine = weaponDisplay.includes("\n");

    addTextRow("Weapon", weaponDisplay, finalIsMultiLine);
    addTextRow("Armor", armorDisplay);
    addTextRow("Stance", stanceDisplay);
    currentY += spacing / 2;

    // Stats section
    addHeader("Stats");
    addTextRow("Str", player.attributes.strength || 0);
    addTextRow("Con", player.attributes.constitution || 0);
    addTextRow("Size", player.attributes.size || 0);
    addTextRow("Stam", player.attributes.stamina || 0);
    addTextRow("Agi", player.attributes.agility || 0);
    addTextRow("Luck", player.attributes.luck || 0);
    currentY += spacing / 2;

    // Condition section
    addHeader("Condition");
    const currentHealth = player.currentState?.currentHealth ?? 0;
    const maxHealth = player.calculatedStats?.maxHealth ?? 100;
    const currentEndurance = player.currentState?.currentEndurance ?? 0;
    const maxEndurance = player.calculatedStats?.maxEndurance ?? 100;

    addTextRow("Health", `${Math.floor(currentHealth)}/${maxHealth}`);
    addTextRow("Energy", `${Math.floor(currentEndurance)}/${maxEndurance}`);
    currentY += spacing / 2;

    // Reputation section
    addHeader("Reputation");
    addTextRow(
      "Record",
      `${player.record.wins || 0}-${player.record.losses || 0}-${player.record.kills || 0}`,
    );
    addTextRow("ID", player.id);

    // Create background with calculated dimensions and styling
    const bg = this.scene.add.graphics();
    const containerHeight = currentY + this.padding;
    this.containerWidth = Math.max(240, maxWidth);

    // Add shadow effect
    if (this.styles.container.shadowBlur) {
      bg.fillStyle(this.styles.container.shadowColor || 0x000000, 0.5);
      bg.fillRoundedRect(
        4, 4, 
        this.containerWidth, 
        containerHeight,
        this.styles.container.borderRadius || 0
      );
    }

    // Fill with semi-transparent black
    bg.fillStyle(this.styles.container.backgroundColor, this.styles.container.alpha);
    
    // Use rounded rectangle if borderRadius is specified
    if (this.styles.container.borderRadius) {
      bg.fillRoundedRect(0, 0, this.containerWidth, containerHeight, this.styles.container.borderRadius);
      
      // Add borders with rounded corners
      bg.lineStyle(this.styles.container.borderWidth, this.styles.container.borderColor);
      bg.strokeRoundedRect(0, 0, this.containerWidth, containerHeight, this.styles.container.borderRadius);
    } else {
      // Original rectangle code
      bg.fillRect(0, 0, this.containerWidth, containerHeight);
      
      // Original border code
      bg.lineStyle(this.styles.container.borderWidth, this.styles.container.borderColor);
      bg.strokeRect(0, 0, this.containerWidth, containerHeight);
    }

    // Add background first
    this.container.add(bg);
    this.background = bg;

    // Add all text elements with proper depth
    for (const element of this.textElements) {
      element.setDepth(11);
      this.container.add(element);
    }

    // At the end of fullUpdate method, right before adding elements to container
    // Update target position after container width is recalculated
    if (this.isRightSide) {
      this.targetX = this.scene.cameras.main.width - this.containerWidth - this.x;
      
      // If the container is already shown, update its position immediately
      if (this.container.x !== this.startX) {
        this.container.x = this.targetX;
      }
    }
  }
}
