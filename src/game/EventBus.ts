import { Events } from "phaser";

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();

// Event types
export enum GameEvents {
  CURRENT_SCENE_READY = "current-scene-ready",
  SET_PLAYER1_ID = "set-player1-id",
  SET_PLAYER2_ID = "set-player2-id",
  COMBAT_START = "combat-start",
  COMBAT_ROUND_COMPLETE = "combat-round-complete",
  COMBAT_END = "combat-end",
  PLAYER_DAMAGED = "player-damaged",
  PLAYER_HEALED = "player-healed",
  GAME_OVER = "game-over",
}
