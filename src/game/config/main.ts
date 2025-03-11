import { AUTO, Game } from "phaser";
import { EventBus } from "../EventBus";
import { Boot } from "../scenes/Boot";
import { FightScene } from "../scenes/FightScene";
import { Preloader } from "../scenes/Preloader";

// Game configuration interface
interface GameConfig {
  player1Id?: string;
  player2Id?: string;
}

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
  // Store player IDs in a global registry for access across scenes
  if (gameConfig?.player1Id) {
    EventBus.emit("set-player1-id", gameConfig.player1Id);
  }

  if (gameConfig?.player2Id) {
    EventBus.emit("set-player2-id", gameConfig.player2Id);
  }

  return new Game({ ...config, parent });
};

export default StartGame;
