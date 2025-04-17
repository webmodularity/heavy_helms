"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDuelActions } from "@/stores/duel-store";
import type { DecodedCombatResult } from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";
import { EventBus, GameEvents } from "@/game/EventBus";
import { ResultsSummary } from "@/components/dialogs/results-summary";

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
        onClick={() => window?.location?.reload()}
      >
        Try Again
      </button>
    </div>
  );
}

// Component that uses txId from URL
function DuelGame() {
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
  useEffect(() => {
    // Redirect if no transaction ID is provided
    if (!txId) {
      router.push("/");
      return;
    }

    // Add this cleanup function - will run when component unmounts
    return () => {
      clearState(); // Clear duel state when leaving the page
    };
  }, [txId, router, clearState]);

  // Effect for EventBus listeners
  useEffect(() => {
    // Handler for when initial duel data is loaded from Phaser
    const handleDuelDataLoaded = (data: {
      player1: Fighter;
      player2: Fighter;
      decodedCombatBytes: DecodedCombatResult;
    }) => {
      setPlayer1(data.player1);
      setPlayer2(data.player2);
      setDuelResult(data.decodedCombatBytes); // Store the full result data
    };

    // Handler for when the Phaser game signals the fight is over
    const handleGameOver = () => {
      setTimeout(() => {
        setShowResults(true); // Trigger the results modal
      }, 2000);
    };

    // Subscribe to events
    EventBus.on(GameEvents.DUEL_DATA_LOADED, handleDuelDataLoaded);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);

    // Cleanup listeners on component unmount
    return () => {
      EventBus.off(GameEvents.DUEL_DATA_LOADED, handleDuelDataLoaded);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);
    };
  }, []); // Changed dependency array back to empty

  const onDialogClose = () => {
    setShowResults(false);
    router.push("/");
  };

  if (!txId) {
    return <LoadingSpinner size="lg" text="Loading game..." />;
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={GameErrorFallback}>
        <GameWrapper />
      </ErrorBoundary>
      <ResultsSummary
        isOpen={showResults}
        onClose={onDialogClose}
        result={duelResult}
        player1={player1}
        player2={player2}
        txId={txId}
      />
    </>
  );
}

export default function DuelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-9000">
      <main className="p-4 flex flex-col">
        <div className="flex-1 bg-opacity-70 rounded-lg overflow-hidden border border-yellow-600/20 shadow-lg items-center justify-center flex p-4">
          {/* Game container */}
          <div className="flex items-center justify-center flex-1 z-10">
            <Suspense
              fallback={<LoadingSpinner size="lg" text="Loading game..." />}
            >
              <DuelGame />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
