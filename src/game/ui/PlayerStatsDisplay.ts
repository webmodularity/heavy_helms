import type { GameObjects, Scene } from "phaser";

interface PlayerStats {
  weapon?: string;
  armor?: string;
  stance?: string;
  strength?: number;
  constitution?: number;
  size?: number;
  agility?: number;
  stamina?: number;
  luck?: number;
  currentHealth?: number;
  maxHealth?: number;
  currentEndurance?: number;
  maxEndurance?: number;
  wins?: number;
  losses?: number;
  kills?: number;
}

interface PlayerData {
  stats?: PlayerStats;
}

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

  public update(playerData: PlayerData): void {
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
      currentY += spacing;
    };

    const stats = playerData.stats || {};

    // Strategy section
    addHeader("Strategy");
    addTextRow("Weapon", stats.weapon || "None");
    addTextRow("Armor", stats.armor || "None");
    addTextRow("Stance", stats.stance || "None");
    currentY += spacing / 2;

    // Stats section
    addHeader("Stats");
    addTextRow("Str", stats.strength || 0);
    addTextRow("Con", stats.constitution || 0);
    addTextRow("Size", stats.size || 0);
    addTextRow("Agi", stats.agility || 0);
    addTextRow("Stam", stats.stamina || 0);
    addTextRow("Luck", stats.luck || 0);
    addTextRow("HP", `${stats.currentHealth || 0}/${stats.maxHealth || 0}`);
    addTextRow(
      "STAM",
      `${stats.currentEndurance || 0}/${stats.maxEndurance || 0}`,
    );
    currentY += spacing / 2;

    // Reputation section
    addHeader("Reputation");
    addTextRow(
      "Record",
      `${stats.wins || 0}-${stats.losses || 0}-${stats.kills || 0}`,
    );
    addTextRow(
      "ID",
      this.isRightSide
        ? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (this.scene as any).player2Id
        : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (this.scene as any).player1Id,
    );

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
