"use client";

import { Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { Button } from "../ui/button";
import type { Fighter } from "@/types/fighter-types";
import type { IRefPhaserGame } from "@/game/PhaserGame";
import type Phaser from "phaser";

// Dynamically import PhaserGame with no SSR
const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
});

interface GameWrapperProps {
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  // player1Id?: string;
  // player2Id?: string;
}

export const GameWrapper = forwardRef<HTMLDivElement, GameWrapperProps>(
  function GameWrapperWithRef({ player1, txId, logIndex }, ref) {
    const [isClient, setIsClient] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    const phaserInstanceRef = useRef<IRefPhaserGame>({
      game: null,
      scene: null,
    });

    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleGameReady = useCallback((gameInstance: Phaser.Game) => {
      if (gameInstance) {
        phaserInstanceRef.current.game = gameInstance;
        setIsGameReady(true);
      } else {
        console.error(
          "handleGameReady received invalid game instance:",
          gameInstance,
        );
      }
    }, []);

    const toggleMute = () => {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      if (phaserInstanceRef.current?.game) {
        phaserInstanceRef.current.game.events.emit("set-mute", newMuteState);
      } else {
        console.error(
          "Ref or Game instance missing in toggleMute!",
          phaserInstanceRef.current,
        );
      }
    };

    if (!isClient) return null;

    return (
      <div
        ref={ref}
        id="game-container-outer"
        className="relative bg-black w-full overflow-hidden"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 2,
        }}
      >
        <PhaserGame
          player1={player1}
          txId={txId}
          logIndex={logIndex}
          onGameReady={handleGameReady}
        />

        <div className="absolute bottom-1 right-1 flex gap-1 bg-black/50 backdrop-blur-sm rounded-md z-50">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-8 md:w-8 p-0.5 text-yellow-400 hover:bg-yellow-900/30 disabled:opacity-50"
            onClick={toggleMute}
            disabled={!isGameReady}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </Button>
        </div>
      </div>
    );
  },
);

GameWrapper.displayName = "GameWrapper";
