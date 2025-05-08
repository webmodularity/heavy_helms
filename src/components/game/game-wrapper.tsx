"use client";

import { X, Maximize2, Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
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

export function GameWrapper({ player1, txId, logIndex }: GameWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserInstanceRef = useRef<IRefPhaserGame>({ game: null, scene: null });
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fixCanvasSize = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      canvas.setAttribute(
        "style",
        `
        width: ${containerWidth}px !important;
        height: ${containerHeight}px !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        border-radius: 0.375rem !important;
      `,
      );
    }
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    fixCanvasSize();
    window.addEventListener("resize", fixCanvasSize);

    const timer = setTimeout(fixCanvasSize, 500);

    return () => {
      window.removeEventListener("resize", fixCanvasSize);
      clearTimeout(timer);
    };
  }, [isClient, fixCanvasSize]);

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

  const toggleFullscreen = () => {
    const targetElement = containerRef.current;
    if (!targetElement) return;

    if (!document.fullscreenElement) {
      targetElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen: ${err.message} (${err.name})`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!document.fullscreenElement);
  };

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

  const exitPractice = () => {
    router.replace("/");
  };

  if (!isClient) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <div
        ref={containerRef}
        id="game-container-outer"
        className="relative bg-black w-full overflow-hidden rounded-md"
        style={{
          maxWidth: "960px",
          aspectRatio: "16/9",
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

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-8 md:w-8 p-0.5 text-yellow-400 hover:bg-yellow-900/30 disabled:opacity-50"
            onClick={toggleFullscreen}
            disabled={!isGameReady}
          >
            <Maximize2 size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-8 md:w-8 p-0.5 text-red-400 hover:bg-red-900/30 disabled:opacity-50"
            onClick={exitPractice}
            disabled={!isGameReady}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
