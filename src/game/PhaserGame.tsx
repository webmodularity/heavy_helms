"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { EventBus } from "./EventBus";
import StartGame from "./config/main";
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
    if (player1Id) EventBus.emit("set-player1-id", player1Id);
    if (player2Id) EventBus.emit("set-player2-id", player2Id);

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

    EventBus.on("current-scene-ready", handleSceneReady);
    EventBus.on("set-player1", (player: Fighter) => {
      console.log("player1 from event bus", player);
    });
    return () => {
      EventBus.off("current-scene-ready", handleSceneReady);
      EventBus.off("set-player1", (player: Fighter) => {
        console.log("player1 from event bus", player);
      });
    };
  }, [currentActiveScene, ref, player1Id, player2Id]);

  return <div id="game-container" />;
});

export default PhaserGame;
