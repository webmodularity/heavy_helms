"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame, { gameData } from "./config/main";
import type { Fighter } from "@/types/fighter-types";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  player1Id?: string;
  player2Id?: string;
  player1?: Fighter;
}

const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame(
  { currentActiveScene, player1Id, player2Id, player1 },
  ref,
) {
  const game = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame("game-container", {
        player1Id,
        player2Id,
        player1,
      });
      console.log("player1", player1);
      console.log("currentActiveScene", currentActiveScene);

      if (typeof ref === "function") {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, [ref, player1Id, player2Id, currentActiveScene, player1]);

  useEffect(() => {
    // Update registry data if props change after initialization
    if (game.current) {
      if (player1Id) {
        game.current.registry.set('player1Id', player1Id);
      }
      
      if (player2Id) {
        game.current.registry.set('player2Id', player2Id);
      }
      
      if (player1) {
        game.current.registry.set('player1', player1);
      }
    }

    const handleSceneReady = (scene_instance: Phaser.Scene) => {
      console.log("scene_instance", scene_instance);
      if (currentActiveScene && typeof currentActiveScene === "function") {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === "function") {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref) {
        ref.current = {
          game: game.current,
          scene: scene_instance,
        };
      }
    };

    // Still listen for scene ready events
    if (game.current) {
      game.current.events.on("current-scene-ready", handleSceneReady);
    }

    return () => {
      if (game.current) {
        game.current.events.off("current-scene-ready", handleSceneReady);
      }
    };
  }, [currentActiveScene, ref, player1Id, player2Id, player1]);

  return <div id="game-container" />;
});

export default PhaserGame;
