"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDuelActions } from "@/stores/duel-store";
import { EventBus } from "@/game/EventBus";
import { ResultsSummary } from "@/components/dialogs/results-summary";
import type { Fighter } from "@/types/fighter-types";
import type { DecodedCombatResult } from "@/types/game.types";

// Define event names or import from a shared location
const DUEL_DATA_LOADED = "duel-data-loaded";
const GAME_OVER_EVENT = "game-over";
const REPLAY_DUEL = "replay-duel"; // Define replay event name

// Fallback component for when the game fails to load
function GameErrorFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900/90 p-6 text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">
        Could not load game
      </h2>
      <p className="text-stone-200 mb-6">
        There was an error loading the game. This could be due to browser
        compatibility issues or missing assets.
      </p>
      <button
        type="button"
        className="bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-100 px-4 py-2 rounded"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );
}

// Component that uses txId from URL
function DuelGame() {
  // Add this log
  console.log("DuelGame component rendering...");

  const searchParams = useSearchParams();
  const txId = searchParams.get("txId") ?? undefined;
  const router = useRouter();
  const { clearState } = useDuelActions();

  // State for Results Summary
  const [player1, setPlayer1] = useState<Fighter | null>(null);
  const [player2, setPlayer2] = useState<Fighter | null>(null);
  const [duelResult, setDuelResult] = useState<DecodedCombatResult | null>(
    null,
  );
  const [showResults, setShowResults] = useState(false);

  // Effect for initial setup and redirect
  useEffect(() => {
    // Add these logs
    console.log("DuelGame initial useEffect running, txId:", txId);
    if (!txId) {
      console.log("No txId found, redirecting...");
      router.push("/");
      return; // Add return to potentially stop further execution in this effect run
    }
    // Cleanup for duel store state
    return () => {
      clearState();
    };
  }, [txId, router, clearState]);

  // Effect for EventBus listeners
  useEffect(() => {
    // Add this log
    console.log("DuelGame registering EventBus listeners...");

    // Handler for when initial duel data is loaded from Phaser
    const handleDuelDataLoaded = (data: {
      player1: Fighter;
      player2: Fighter;
      decodedCombatBytes: DecodedCombatResult;
    }) => {
      console.log("React received DUEL_DATA_LOADED:", data);
      setPlayer1(data.player1);
      setPlayer2(data.player2);
      setDuelResult(data.decodedCombatBytes); // Store the full result data
    };

    // Handler for when the Phaser game signals the fight is over
    const handleGameOver = () => {
      console.log("React received GAME_OVER_EVENT");
      setShowResults(true); // Trigger the results modal
      // Remove automatic redirect on game over
      // setTimeout(() => {
      //   // router.push("/");
      // }, 5000);
    };

    // Add this log
    console.log("DuelGame EventBus instance:", EventBus);

    // Subscribe to events
    EventBus.on(DUEL_DATA_LOADED, handleDuelDataLoaded);
    EventBus.on(GAME_OVER_EVENT, handleGameOver);

    // Cleanup listeners on component unmount
    return () => {
      EventBus.off(DUEL_DATA_LOADED, handleDuelDataLoaded);
      EventBus.off(GAME_OVER_EVENT, handleGameOver);
    };
  }, []); // Changed dependency array back to empty

  // Handler for closing the dialog (navigates back via button)
  const onDialogClose = () => {
    setShowResults(false);
    // The button itself will handle navigation if needed
    router.push("/"); // Navigate immediately when "Back" is clicked
  };

  // Handler for the Replay button
  const handleReplay = () => {
    console.log("Replay requested, emitting REPLAY_DUEL");
    EventBus.emit(REPLAY_DUEL); // Emit the replay event
    setShowResults(false); // Close the dialog immediately
  };

  if (!txId) {
    // Still show loading spinner if txId isn't present yet (during initial redirect checks)
    return <LoadingSpinner size="lg" text="Loading duel..." />;
  }

  return (
    // Added relative positioning to allow absolute positioning of the modal
    <div className="w-full h-full relative">
      <ErrorBoundary FallbackComponent={GameErrorFallback}>
        <GameWrapper />
      </ErrorBoundary>

      <ResultsSummary
        isOpen={showResults}
        onClose={onDialogClose}
        onReplay={handleReplay}
        result={duelResult}
        player1={player1}
        player2={player2}
      />
    </div>
  );
}

export default function DuelPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Radial gradients - enhanced size and positioning */}
        <div className="absolute inset-0 bg-gradient-radial from-yellow-900/15 via-black/0 to-black/0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800/10 via-transparent to-transparent" />

        {/* Dynamic light beams */}
        <div
          className="absolute bg-yellow-600/5 blur-3xl rotate-45 transform-gpu"
          style={{
            width: "150vw",
            height: "10vh",
            top: "30%",
            left: "-25vw",
            animation: "beam 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bg-yellow-700/5 blur-3xl -rotate-45 transform-gpu"
          style={{
            width: "150vw",
            height: "8vh",
            top: "60%",
            right: "-25vw",
            animation: "beam 15s ease-in-out infinite 5s",
          }}
        />

        {/* Top and bottom shadows with extended height */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Edge highlights for depth perception */}
        <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-black/30 to-transparent" />

        {/* Animated glowing elements (more particles, varying sizes) */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 45 }).map((_, i) => {
            // Generate unique identifier instead of using index as key
            const uniqueId = `particle-${Math.random().toString(36).substr(2, 9)}-${i}`;
            const size = Math.random() * 1.5 + 0.5; // varying sizes between 0.5 and 2

            return (
              <div
                key={uniqueId}
                className="absolute rounded-full bg-yellow-500/30"
                style={{
                  height: `${size}px`,
                  width: `${size}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `float ${Math.random() * 15 + 10}s linear infinite, 
                              pulse ${Math.random() * 4 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            );
          })}
        </div>

        {/* Large, subtle circular highlights with better positioning */}
        <div
          className="absolute rounded-full bg-yellow-700/5 blur-3xl"
          style={{
            width: "60vh",
            height: "60vh",
            top: "20%",
            left: "5%",
            animation: "pulse 12s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute rounded-full bg-stone-700/5 blur-3xl"
          style={{
            width: "50vh",
            height: "50vh",
            bottom: "5%",
            right: "10%",
            animation:
              "float 30s linear infinite, pulse 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* Larger game container with no horizontal margins */}
      <main className="relative z-10 w-full max-w-6xl aspect-video">
        {/* Enhanced outer glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-900/30 via-yellow-600/20 to-yellow-900/30 rounded-lg blur-lg" />

        {/* Decorative corner elements that "break out" of the container */}
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-yellow-600/20 to-transparent rounded-tl-3xl blur-md" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-bl from-yellow-600/20 to-transparent rounded-tr-3xl blur-md" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-yellow-600/20 to-transparent rounded-bl-3xl blur-md" />
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-tl from-yellow-600/20 to-transparent rounded-br-3xl blur-md" />

        {/* Game container with enhanced border glow */}
        <div className="relative w-full h-full bg-stone-950 bg-opacity-90 rounded-lg overflow-hidden border border-yellow-600/40 shadow-2xl">
          {/* Inner container glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/5 via-transparent to-yellow-900/5" />

          <Suspense
            fallback={<LoadingSpinner size="lg" text="Loading duel..." />}
          >
            {/* Ensure DuelGame itself fills the container */}
            <div className="w-full h-full flex items-center justify-center">
              <DuelGame />
            </div>
          </Suspense>
        </div>
      </main>

      {/* Add some global keyframe animations with more variety */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(10px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(-10px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        @keyframes beam {
          0%, 100% { opacity: 0.2; transform: translateY(0) rotate(45deg) scaleY(1); }
          50% { opacity: 0.5; transform: translateY(10vh) rotate(45deg) scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}
