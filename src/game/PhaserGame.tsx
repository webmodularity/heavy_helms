"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./config/main";
import type { Fighter } from "@/types/fighter-types";
import type Phaser from "phaser";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  player1Id?: string;
  player2Id?: string;
  player1?: Fighter;
  onGameReady?: (gameInstance: Phaser.Game) => void;
}

const PhaserGame = ({
  currentActiveScene,
  player1Id,
  player2Id,
  player1,
  onGameReady,
}: IProps) => {
  const game = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    let gameInstance: Phaser.Game | null = null;
    if (game.current === null) {
      gameInstance = StartGame("game-container", {
        player1Id,
        player2Id,
        player1,
      });
      game.current = gameInstance;

      if (gameInstance && onGameReady) {
        onGameReady(gameInstance);
      } else {
        console.warn(
          "PhaserGame useLayoutEffect: Game instance or onGameReady missing.",
        );
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, [player1Id, player2Id, player1, onGameReady]);

  useEffect(() => {
    if (!game.current) {
      console.log(
        "PhaserGame useEffect: Guard clause hit, game.current is null.",
      );
      return;
    }

    if (player1Id) {
      game.current.registry.set("player1Id", player1Id);
    }

    if (player2Id) {
      game.current.registry.set("player2Id", player2Id);
    }

    if (player1) {
      game.current.registry.set("player1", player1);
    }

    const handleSceneReady = (scene_instance: Phaser.Scene) => {
      if (!game.current) {
        console.warn(
          "PhaserGame handleSceneReady: game.current became null unexpectedly.",
        );
        return;
      }

      if (currentActiveScene) currentActiveScene(scene_instance);
    };

    game.current.events.on("current-scene-ready", handleSceneReady);

    return () => {
      game.current?.events.off("current-scene-ready", handleSceneReady);
    };
  }, [currentActiveScene, player1Id, player2Id, player1]);

  return <div id="game-container" className="w-full h-full" />;
};

export default PhaserGame;
