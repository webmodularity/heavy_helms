"use client";

import { X } from "lucide-react";
import { Maximize2 } from "lucide-react";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

// Dynamically import PhaserGame with no SSR
const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
});

interface GameWrapperProps {
  player1Id?: string;
  player2Id?: string;
}

export function GameWrapper({ player1Id, player2Id }: GameWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleFullscreen = () => {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    if (!document.fullscreenElement) {
      gameContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Add actual mute logic here, possibly via EventBus
  };

  const exitPractice = () => {
    router.replace("/");
  };

  if (!isClient) return null;

  return (
    <div
      //   id="game-container"
      //   ref={containerRef}
      className="relative flex items-center justify-center w-[320px] h-[180px] md:w-[960px] md:h-[540px] "
    >
      <PhaserGame player1Id={player1Id} player2Id={player2Id} />

      {/* Game Controls Overlay */}
      <div className="absolute md:bottom-0 -bottom-10 right-0 p-1 md:p-2 flex md:gap-2 gap-1 bg-stone-900/70 backdrop-blur-sm rounded-tl-md z-10">
        <Button
          variant="ghost"
          size="sm"
          className="text-yellow-400 hover:bg-yellow-800/30"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-yellow-400 hover:bg-yellow-800/30"
          onClick={toggleFullscreen}
        >
          <Maximize2 size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:bg-red-800/30"
          onClick={exitPractice}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
