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
  player1: undefined as Fighter | undefined
};

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "game-container",
  scene: [Boot, Preloader, FightScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
    min: {
      width: 320,
      height: 180,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
  },
};

const StartGame = (parent: string, gameConfig?: GameConfig) => {
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

  // Create the game instance
  const game = new Game({ ...config, parent });
  
  // Store the initial data in the game registry for access across scenes
  console.log("gameData", gameData);
  game.registry.set('player1Id', gameData.player1Id);
  game.registry.set('player2Id', gameData.player2Id);
  game.registry.set('player1', gameData.player1);
  
  return game;
};

export default StartGame;
