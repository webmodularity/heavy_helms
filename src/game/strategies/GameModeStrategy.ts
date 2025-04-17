import type { Scene } from "phaser";
import type { Fighter } from "@/types/fighter-types";
import type { DecodedCombatResult, SceneData } from "@/types/game.types";
import type { PlayerLoadout } from "@/types/player.types";

export interface GameModeStrategy {
  /**
   * Initialize the strategy with necessary data
   */
  initialize(scene: Scene): Promise<void>;
  
  /**
   * Load player data for the game mode
   */
  loadPlayerData(): Promise<{player1: Fighter; player2: Fighter}>;
  
  /**
   * Load combat data for the game mode
   */
  loadCombatData(): Promise<DecodedCombatResult>;
  
  /**
   * Prepare the scene data to be passed to the next scene
   */
  prepareSceneData(): SceneData;
  
  /**
   * Check if the strategy can handle the current game configuration
   */
  canHandle(scene: Scene): boolean;
} 