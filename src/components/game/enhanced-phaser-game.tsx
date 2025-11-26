"use client";

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import StartGame from "@/game/config/main";
import type { Fighter } from "@/types/fighter-types";
import type Phaser from "phaser";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface EnhancedPhaserGameProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  player1Id?: string;
  player2Id?: string;
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  backgroundImage?: string;
  onGameReady?: (gameInstance: Phaser.Game) => void;
  onGameDestroyed?: () => void;
  containerId?: string; // Allow custom container ID for modal usage
  forceRecreate?: boolean; // Force recreation of game instance
}

const EnhancedPhaserGame = ({
  currentActiveScene,
  player1Id,
  player2Id,
  player1,
  txId,
  logIndex,
  backgroundImage,
  onGameReady,
  onGameDestroyed,
  containerId = "game-container",
  forceRecreate = false,
}: EnhancedPhaserGameProps) => {
  const game = useRef<Phaser.Game | null>(null);
  const isDestroying = useRef(false);
  const initializationKey = useRef(0);

  // Create a cleanup function that can be called externally
  const cleanup = useCallback(() => {
    if (game.current && !isDestroying.current) {
      isDestroying.current = true;
      console.log("EnhancedPhaserGame: Starting cleanup");

      try {
        // Stop all sounds first
        if (game.current.sound) {
          game.current.sound.stopAll();
          game.current.sound.removeAll();
        }

        // Stop all scenes and their timers/tweens
        if (game.current.scene) {
          for (const scene of game.current.scene.scenes) {
            if (scene.time) {
              scene.time.removeAllEvents();
            }
            if (scene.tweens) {
              scene.tweens.killAll();
            }
            if (scene.sound) {
              scene.sound.stopAll();
            }
          }
        }

        // Remove all event listeners
        game.current.events.removeAllListeners();

        // Destroy the game
        game.current.destroy(true);
        game.current = null;

        // Clear the container
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = "";
        }

        if (onGameDestroyed) {
          onGameDestroyed();
        }

        console.log("EnhancedPhaserGame: Cleanup completed");
      } catch (error) {
        console.error("EnhancedPhaserGame: Error during cleanup:", error);
      } finally {
        isDestroying.current = false;
      }
    }
  }, [containerId, onGameDestroyed]);

  // Initialize game
  const initializeGame = useCallback(() => {
    if (isDestroying.current) {
      console.log(
        "EnhancedPhaserGame: Skipping initialization - currently destroying",
      );
      return;
    }

    const currentKey = ++initializationKey.current;

    console.log("EnhancedPhaserGame: Initializing game", {
      currentKey,
      player1Id,
      player1,
    });

    try {
      // Use player1.id as player1Id if not provided
      const effectivePlayer1Id = player1Id || player1?.id;

      const gameInstance = StartGame(containerId, {
        player1Id: effectivePlayer1Id,
        player1,
      });

      // Set additional registry data needed for strategy detection
      if (gameInstance) {
        if (effectivePlayer1Id) {
          gameInstance.registry.set("player1Id", effectivePlayer1Id);
        }
        if (player1) {
          gameInstance.registry.set("player1", player1);
        }
        if (txId) {
          gameInstance.registry.set("txId", txId);
        }
        if (logIndex !== undefined) {
          const parsedLogIndex = Number.parseInt(logIndex, 10);
          if (!Number.isNaN(parsedLogIndex)) {
            gameInstance.registry.set("logIndex", parsedLogIndex);
          } else {
            gameInstance.registry.set("logIndex", logIndex);
          }
        }
        if (backgroundImage) {
          gameInstance.registry.set("backgroundImage", backgroundImage);
        }
      }

      // Check if this initialization is still valid
      if (currentKey !== initializationKey.current) {
        console.log("EnhancedPhaserGame: Initialization outdated, destroying", {
          currentKey,
        });
        gameInstance?.destroy(true);
        return;
      }

      game.current = gameInstance;

      if (gameInstance && onGameReady) {
        onGameReady(gameInstance);
      } else {
        console.warn(
          "EnhancedPhaserGame: Game instance or onGameReady missing",
        );
      }
    } catch (error) {
      console.error("EnhancedPhaserGame: Error during initialization:", error);
    }
  }, [containerId, player1Id, player1, txId, logIndex, onGameReady]);

  // Game initialization effect
  useLayoutEffect(() => {
    if (game.current === null || forceRecreate) {
      if (forceRecreate && game.current) {
        cleanup();
      }

      // Longer delay to ensure cleanup is complete and DOM is ready
      const timer = setTimeout(() => {
        // Double-check that we still need to initialize
        if (game.current === null && !isDestroying.current) {
          initializeGame();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [initializeGame, cleanup, forceRecreate]);

  // Game data update effect
  useEffect(() => {
    if (!game.current || isDestroying.current) {
      return;
    }

    const gameInstance = game.current;
    const effectivePlayer1Id = player1Id || player1?.id;

    console.log("EnhancedPhaserGame: Setting registry data", {
      effectivePlayer1Id,
      player1: !!player1,
      txId,
      logIndex,
    });

    // Update game registry with new data
    if (effectivePlayer1Id) {
      gameInstance.registry.set("player1Id", effectivePlayer1Id);
    }

    if (player1) {
      gameInstance.registry.set("player1", player1);
    }

    if (txId) {
      gameInstance.registry.set("txId", txId);
    }

    if (logIndex !== undefined) {
      const parsedLogIndex = Number.parseInt(logIndex, 10);
      if (!Number.isNaN(parsedLogIndex)) {
        gameInstance.registry.set("logIndex", parsedLogIndex);
      } else {
        gameInstance.registry.set("logIndex", logIndex);
        console.warn(`EnhancedPhaserGame: Invalid logIndex: "${logIndex}"`);
      }
    }

    if (backgroundImage) {
      gameInstance.registry.set("backgroundImage", backgroundImage);
    }

    const handleSceneReady = (scene_instance: Phaser.Scene) => {
      if (!game.current) {
        console.warn(
          "EnhancedPhaserGame: game.current became null in handleSceneReady",
        );
        return;
      }

      if (currentActiveScene) currentActiveScene(scene_instance);
    };

    gameInstance.events.on("current-scene-ready", handleSceneReady);

    return () => {
      gameInstance.events.off("current-scene-ready", handleSceneReady);
    };
  }, [currentActiveScene, player1Id, player1, txId, logIndex]);

  // Cleanup on unmount
  useLayoutEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Expose cleanup function for external use
  useEffect(() => {
    const globalWindow = window as unknown as Record<string, () => void>;
    globalWindow[`phaserGame_${containerId}_cleanup`] = cleanup;

    return () => {
      delete globalWindow[`phaserGame_${containerId}_cleanup`];
    };
  }, [cleanup, containerId]);

  return <div id={containerId} className="w-full h-full" />;
};

export default EnhancedPhaserGame;

// Helper function to manually cleanup a specific game instance
export const cleanupPhaserGame = (containerId = "game-container") => {
  const globalWindow = window as unknown as Record<string, () => void>;
  const cleanup = globalWindow[`phaserGame_${containerId}_cleanup`];
  if (cleanup) {
    cleanup();
  }
};
