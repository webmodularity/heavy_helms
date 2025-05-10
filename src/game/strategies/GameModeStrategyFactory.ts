import type { Scene } from "phaser";
import type { GameModeStrategy } from "./GameModeStrategy";
import { PracticeGameStrategy } from "./PracticeGameStrategy";
import { DuelGameStrategy } from "./DuelGameStrategy";
import { GauntletGameStrategy } from "./GauntletGameStrategy";
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GameModeStrategyFactory {
  /**
   * Create the appropriate game mode strategy based on the current context
   */
  static createStrategy(scene: Scene): GameModeStrategy {
    const practiceStrategy = new PracticeGameStrategy();
    const duelStrategy = new DuelGameStrategy();
    const gauntletStrategy = new GauntletGameStrategy();
    // Check if the gauntlet strategy can handle this situation
    if (gauntletStrategy.canHandle(scene)) {
      return gauntletStrategy;
    }

    // Check if the duel strategy can handle this situation
    if (duelStrategy.canHandle(scene)) {
      return duelStrategy;
    }

    // Default to practice mode
    return practiceStrategy;
  }
}
