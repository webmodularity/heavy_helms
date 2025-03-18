"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { EventBus } from "./EventBus";
import StartGame from "./config/main";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  player1Id?: string;
  player2Id?: string;
}

const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame(
  { currentActiveScene, player1Id, player2Id },
  ref,
) {
  const game = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame("game-container", {
        player1Id,
        player2Id,
      });

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
  }, [ref, player1Id, player2Id]);

  useEffect(() => {
    if (player1Id) EventBus.emit("set-player1-id", player1Id);
    if (player2Id) EventBus.emit("set-player2-id", player2Id);

    const handleSceneReady = (scene_instance: Phaser.Scene) => {
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

    return () => {
      EventBus.off("current-scene-ready", handleSceneReady);
    };
  }, [currentActiveScene, ref, player1Id, player2Id]);

  return <div id="game-container" />;
});

export default PhaserGame;
