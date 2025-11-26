"use client";

import {
  X,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Share2,
  Twitter,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../ui/button";
import type { Fighter } from "@/types/fighter-types";
import type { IRefPhaserGame } from "./enhanced-phaser-game";
import type Phaser from "phaser";
import {
  generateFightUrl,
  shareFightOnTwitter,
  shareFightOnFarcaster,
} from "@/hooks/use-global-fight-modal";
import { toast } from "sonner";
import { FarcasterIcon } from "../icons/farcaster-icon";
import { FighterInfoDisplay } from "./fighter-info-display";

// Dynamically import EnhancedPhaserGame with no SSR
const EnhancedPhaserGame = dynamic(() => import("./enhanced-phaser-game"), {
  ssr: false,
});

interface ModalGameWrapperProps {
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  backgroundImage?: string;
  onClose?: () => void;
  title?: string;
  modalId?: string; // Unique ID for this modal instance
}

export function ModalGameWrapper({
  player1,
  txId,
  logIndex,
  backgroundImage,
  onClose,
  title = "Battle",
  modalId = "modal-game",
}: ModalGameWrapperProps) {
  console.log("ModalGameWrapper props:", {
    player1: !!player1,
    txId,
    logIndex,
  });
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Key to force recreation
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const phaserInstanceRef = useRef<IRefPhaserGame>({ game: null, scene: null });
  const gameContainerId = `${modalId}-game-container`;
  const isRestartingRef = useRef(false); // Track intentional restarts

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fixCanvasSize = useCallback(() => {
    // Look for canvas in the actual game container, not the wrapper div
    const gameContainer = document.getElementById(gameContainerId);
    const canvas = gameContainer?.querySelector("canvas");

    if (canvas && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      console.log("ModalGameWrapper: Fixing canvas size", {
        modalId,
        gameContainerId,
        containerWidth,
        containerHeight,
        canvasExists: !!canvas,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        gameContainerExists: !!gameContainer,
      });

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
    } else {
      console.log("ModalGameWrapper: Canvas not found", {
        modalId,
        gameContainerId,
        containerExists: !!containerRef.current,
        gameContainerExists: !!gameContainer,
        canvasExists: !!canvas,
      });
    }
  }, [modalId, gameContainerId]);

  // Poll for canvas creation
  const waitForCanvas = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max

    const checkCanvas = () => {
      const gameContainer = document.getElementById(gameContainerId);
      const canvas = gameContainer?.querySelector("canvas");

      if (canvas) {
        console.log(
          "ModalGameWrapper: Canvas found after",
          attempts * 100,
          "ms",
        );
        fixCanvasSize();
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkCanvas, 100);
      } else {
        console.warn(
          "ModalGameWrapper: Canvas not found after",
          maxAttempts * 100,
          "ms",
        );
      }
    };

    checkCanvas();
  }, [gameContainerId, fixCanvasSize]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    waitForCanvas();
    window.addEventListener("resize", waitForCanvas);

    const timer = setTimeout(waitForCanvas, 500);

    return () => {
      window.removeEventListener("resize", waitForCanvas);
      clearTimeout(timer);
    };
  }, [isClient, waitForCanvas]);

  const handleGameReady = useCallback(
    (gameInstance: Phaser.Game) => {
      console.log("ModalGameWrapper: Game ready", { modalId });
      if (gameInstance) {
        phaserInstanceRef.current.game = gameInstance;
        setIsGameReady(true);
        setIsLoading(false);
        setHasError(false);

        // Reset restart flag after successful initialization
        isRestartingRef.current = false;

        // Wait for canvas to be created and then fix its size
        setTimeout(() => {
          waitForCanvas();
        }, 100);

        console.log("ModalGameWrapper: Game state updated", {
          modalId,
          isGameReady: true,
          isLoading: false,
          hasError: false,
        });
      } else {
        console.error("ModalGameWrapper: Invalid game instance received");
        setHasError(true);
        setIsLoading(false);
        // Reset restart flag on error too
        isRestartingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalId, waitForCanvas],
  );

  const handleGameDestroyed = useCallback(() => {
    console.log("ModalGameWrapper: Game destroyed", { modalId });
    phaserInstanceRef.current.game = null;

    // Only update state if this wasn't an intentional restart
    if (!isRestartingRef.current) {
      setIsGameReady(false);
    }
  }, [modalId]);

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
      console.error("ModalGameWrapper: Game instance missing in toggleMute");
    }
  };

  const restartGame = () => {
    console.log("ModalGameWrapper: Restarting game", { modalId });
    setIsLoading(true);
    setHasError(false);
    setIsGameReady(false);
    setGameKey((prev) => prev + 1); // Force recreation
    isRestartingRef.current = true;

    // Safety timeout to reset restart flag in case something goes wrong
    setTimeout(() => {
      if (isRestartingRef.current) {
        console.warn("ModalGameWrapper: Restart timeout, resetting flag");
        isRestartingRef.current = false;
      }
    }, 10000); // 10 second timeout
  };

  const handleShareFarcaster = () => {
    if (!txId) return;

    // Try to get player data from the game registry for better Farcaster text
    let player1Name = "Fighter";
    let player2Name = "Fighter";
    let gauntletName = "";

    if (phaserInstanceRef.current?.game) {
      const game = phaserInstanceRef.current.game;

      // Try multiple possible keys for player data
      const registryPlayer1 =
        game.registry.get("player1") || game.registry.get("player1Data");
      const registryPlayer2 =
        game.registry.get("player2") || game.registry.get("player2Data");

      // Try different name properties
      if (registryPlayer1) {
        player1Name =
          registryPlayer1.fullName ||
          registryPlayer1.name?.fullName ||
          registryPlayer1.name ||
          "Fighter";
      }
      if (registryPlayer2) {
        player2Name =
          registryPlayer2.fullName ||
          registryPlayer2.name?.fullName ||
          registryPlayer2.name ||
          "Fighter";
      }

      // Also try to use the player1 prop if registry doesn't have names
      if (player1Name === "Fighter" && player1?.fullName) {
        player1Name = player1.fullName;
      }

      // For gauntlets, try to get a better name from the title
      if (logIndex && title && title.includes("Gauntlet Fight")) {
        gauntletName = title.replace(/Gauntlet Fight \d+/, "").trim();
      }
    }

    const fightData = {
      txId,
      logIndex,
      title,
      player1Name,
      player2Name,
      gauntletName,
    };

    shareFightOnFarcaster(fightData);
  };

  const handleShareTwitter = () => {
    if (!txId) return;

    // Try to get player data from the game registry for better Twitter text
    let player1Name = "Fighter";
    let player2Name = "Fighter";
    let gauntletName = "";

    if (phaserInstanceRef.current?.game) {
      const game = phaserInstanceRef.current.game;

      // Try multiple possible keys for player data
      const registryPlayer1 =
        game.registry.get("player1") || game.registry.get("player1Data");
      const registryPlayer2 =
        game.registry.get("player2") || game.registry.get("player2Data");

      // Try different name properties
      if (registryPlayer1) {
        player1Name =
          registryPlayer1.fullName ||
          registryPlayer1.name?.fullName ||
          registryPlayer1.name ||
          "Fighter";
      }
      if (registryPlayer2) {
        player2Name =
          registryPlayer2.fullName ||
          registryPlayer2.name?.fullName ||
          registryPlayer2.name ||
          "Fighter";
      }

      // Also try to use the player1 prop if registry doesn't have names
      if (player1Name === "Fighter" && player1?.fullName) {
        player1Name = player1.fullName;
      }

      // For gauntlets, try to get a better name from the title
      if (logIndex && title && title.includes("Gauntlet Fight")) {
        gauntletName = title.replace(/Gauntlet Fight \d+/, "").trim();
      }
    }

    const fightData = {
      txId,
      logIndex,
      title,
      player1Name,
      player2Name,
      gauntletName,
    };

    shareFightOnTwitter(fightData);
  };

  const handleClose = () => {
    console.log("ModalGameWrapper: Closing modal", { modalId });

    // Cleanup game before closing
    if (phaserInstanceRef.current?.game) {
      console.log("ModalGameWrapper: Cleaning up game before close");
      try {
        // Stop all sounds
        if (phaserInstanceRef.current.game.sound) {
          phaserInstanceRef.current.game.sound.stopAll();
        }

        // Destroy the game
        phaserInstanceRef.current.game.destroy(true);
        phaserInstanceRef.current.game = null;
      } catch (error) {
        console.error("ModalGameWrapper: Error during cleanup:", error);
      }
    }

    if (onClose) {
      onClose();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("ModalGameWrapper: Component unmounting, cleaning up", {
        modalId,
      });
      if (phaserInstanceRef.current?.game) {
        try {
          // Stop all sounds
          if (phaserInstanceRef.current.game.sound) {
            phaserInstanceRef.current.game.sound.stopAll();
          }

          // Destroy the game
          phaserInstanceRef.current.game.destroy(true);
          phaserInstanceRef.current.game = null;
        } catch (error) {
          console.error(
            "ModalGameWrapper: Error during unmount cleanup:",
            error,
          );
        }
      }
    };
  }, [modalId]);

  if (!isClient) return null;

  return (
    <div className="w-full h-full flex flex-col bg-stone-950">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-stone-700 min-h-[60px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400 truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Share Controls */}
          {txId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8A63D2] hover:bg-purple-900/30 p-1 sm:p-2"
                onClick={handleShareFarcaster}
                title="Share on Farcaster"
              >
                <FarcasterIcon size={14} className="sm:w-4 sm:h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-900/30 p-1 sm:p-2"
                onClick={handleShareTwitter}
                title="Share on Twitter"
              >
                <Twitter size={14} className="sm:w-4 sm:h-4" />
              </Button>

              {/* Separator */}
              <div className="w-px h-4 sm:h-6 bg-stone-600 mx-0.5 sm:mx-1" />
            </>
          )}

          {/* Game Controls */}
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:bg-yellow-900/30 disabled:opacity-50 p-1 sm:p-2"
            onClick={toggleMute}
            disabled={!isGameReady}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX size={14} className="sm:w-4 sm:h-4" />
            ) : (
              <Volume2 size={14} className="sm:w-4 sm:h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:bg-yellow-900/30 disabled:opacity-50 p-1 sm:p-2"
            onClick={toggleFullscreen}
            disabled={!isGameReady}
            title="Fullscreen"
          >
            <Maximize2 size={14} className="sm:w-4 sm:h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/30 p-1 sm:p-2"
            onClick={restartGame}
            title="Restart Game"
          >
            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-900/30 p-1 sm:p-2"
            onClick={handleClose}
            title="Close"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 min-h-0">
        <div
          ref={containerRef}
          className="relative bg-black w-full h-full overflow-hidden flex items-center justify-center"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-stone-900/90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4" />
                <p className="text-yellow-400">Loading game...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 bg-stone-900/90 flex items-center justify-center z-10">
              <div className="text-center p-6">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  Game Error
                </h3>
                <p className="text-stone-300 mb-4">
                  There was an error loading the game. You can try restarting
                  it.
                </p>
                <Button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-100"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart Game
                </Button>
              </div>
            </div>
          )}

          <EnhancedPhaserGame
            key={gameKey} // Force recreation when key changes
            player1={player1}
            player1Id={player1?.id}
            txId={txId}
            logIndex={logIndex}
            backgroundImage={backgroundImage}
            onGameReady={handleGameReady}
            onGameDestroyed={handleGameDestroyed}
            containerId={gameContainerId}
            forceRecreate={gameKey > 0}
          />
        </div>
      </div>
    </div>
  );
}
