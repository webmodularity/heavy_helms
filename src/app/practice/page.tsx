"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { GameEvents } from "@/game/EventBus";
import { FightEndDialog } from "@/components/dialogs/FightEndDialog";
import { usePhaserBridge } from "@/hooks/usePhaserBridge";

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

// Create a separate client component that uses useSearchParams
function PracticeGame() {
  const searchParams = useSearchParams();
  const player1Id = searchParams.get("player1Id") ?? undefined;
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const { data: player1 } = usePlayerById(player1Id!);
  // const player2Id = searchParams.get("player2Id") ?? undefined;
  const router = useRouter();

  const [isFightEndDialogOpen, setIsFightEndDialogOpen] = useState(false);
  const [fightWinnerName, setFightWinnerName] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    // Redirect if no character ID is provided
    if (!player1Id) {
      router.push("/");
      return;
    }
  }, [player1Id, router]);

  usePhaserBridge<{ winnerName: string }>(
    GameEvents.FIGHT_ENDED,
    ({ winnerName }) => {
      setFightWinnerName(winnerName);
      setIsFightEndDialogOpen(true);
    },
  );

  const handleReturnToMenu = () => {
    router.push("/");
  };

  if (!player1Id) {
    return <LoadingSpinner size="lg" text="Loading game..." />;
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={GameErrorFallback}>
        <GameWrapper
          // player1Id={player1Id}
          // player2Id={player2Id}
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          player1={player1!}
          // player2={player2}
        />
      </ErrorBoundary>
      <FightEndDialog
        isOpen={isFightEndDialogOpen}
        onClose={() => setIsFightEndDialogOpen(false)}
        winnerName={fightWinnerName}
        onReturnToMenu={handleReturnToMenu}
      />
    </>
  );
}

export default function PracticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-9000">
      <main className="p-4 flex flex-col">
        <div className="flex-1 bg-opacity-70 rounded-lg overflow-hidden border border-yellow-600/20 shadow-lg items-center justify-center flex p-4">
          {/* Game container */}
          <div className="flex items-center justify-center flex-1 z-10">
            <Suspense
              fallback={<LoadingSpinner size="lg" text="Loading game..." />}
            >
              <PracticeGame />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
