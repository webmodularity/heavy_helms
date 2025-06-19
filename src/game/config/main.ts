import { AUTO, Game } from "phaser";
import { EventBus } from "../EventBus";
import { Boot } from "../scenes/Boot";
import { FightScene } from "../scenes/FightScene";
import { Preloader } from "../scenes/Preloader";
import type { Fighter } from "@/types/fighter-types";

// Game configuration interface
interface GameConfig {
  player1Id?: string;
  player2Id?: string;
  player1?: Fighter;
}

// Create a global data object that will be passed to the game
export const gameData = {
  player1Id: undefined as string | undefined,
  player2Id: undefined as string | undefined,
  player1: undefined as Fighter | undefined,
};

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

const config: Phaser.Types.Core.GameConfig = {
  type: isIOS ? Phaser.CANVAS : Phaser.AUTO,
  width: 480,
  height: 800,
  scene: [Boot, Preloader, FightScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.ENVELOP,
    width: 480,
    height: 800,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 240,
      height: 400,
    },
    max: {
      width: 960,
      height: 1600,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
  },
};

const StartGame = (
  parent: string,
  gameConfig?: GameConfig,
): Phaser.Game | null => {
  console.log("StartGame: Creating game with parent container:", parent);

  // Update the global gameData object with the provided config
  if (gameConfig?.player1Id) {
    gameData.player1Id = gameConfig.player1Id;
  }

  if (gameConfig?.player2Id) {
    gameData.player2Id = gameConfig.player2Id;
  }

  if (gameConfig?.player1) {
    gameData.player1 = gameConfig.player1;
  }

  // Verify the parent container exists with retry
  let parentElement = document.getElementById(parent);
  if (!parentElement) {
    console.warn(
      "StartGame: Parent container not found immediately, waiting...",
      parent,
    );
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      parentElement = document.getElementById(parent);
      if (!parentElement) {
        console.error(
          "StartGame: Parent container still not found after delay:",
          parent,
        );
      }
    }, 50);

    // Try one more time synchronously
    parentElement = document.getElementById(parent);
    if (!parentElement) {
      console.error("StartGame: Parent container not found:", parent);
      return null;
    }
  }

  console.log("StartGame: Parent container found:", {
    id: parent,
    element: parentElement,
    clientWidth: parentElement.clientWidth,
    clientHeight: parentElement.clientHeight,
  });

  // Create dynamic config with the correct parent
  const dynamicConfig: Phaser.Types.Core.GameConfig = {
    ...config,
    parent,
    scale: {
      ...config.scale,
      parent,
    },
  };

  // Create the game instance
  const game = new Game(dynamicConfig);

  // Store the initial data in the game registry for access across scenes
  game.registry.set("player1Id", gameData.player1Id);
  game.registry.set("player2Id", gameData.player2Id);
  game.registry.set("player1", gameData.player1);

  // Add a small delay to check if canvas was created
  setTimeout(() => {
    const canvas = parentElement?.querySelector("canvas");
    console.log("StartGame: Canvas creation check:", {
      parent,
      canvasFound: !!canvas,
      canvasElement: canvas,
    });
  }, 100);

  return game;
};

export default StartGame;
