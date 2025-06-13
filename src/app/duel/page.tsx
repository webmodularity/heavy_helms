"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDuelActions } from "@/stores/duel-store";
import { GameEvents } from "@/game/EventBus";
import { FightEndDialog } from "@/components/dialogs/FightEndDialog";
import { usePhaserBridge } from "@/hooks/usePhaserBridge";
import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";

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
  const searchParams = useSearchParams();
  const txId = searchParams.get("txId") ?? undefined;
  const selectedCharacterId = searchParams.get("player1Id") ?? undefined;
  const router = useRouter();
  const { clearState } = useDuelActions();
  const { openFightModal } = useGlobalFightModal();

  const [isFightEndDialogOpen, setIsFightEndDialogOpen] = useState(false);
  const [fightWinnerName, setFightWinnerName] = useState<string | undefined>(
    undefined,
  );
  const [fightLoserName, setFightLoserName] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {

    if (txId) {
      // Open modal and redirect to home
      openFightModal({
        txId,
        title: "Duel Arena",
      });
      router.replace("/");
    } else {
      // No valid fight data, redirect to home
      router.push("/");
    }

    // Add this cleanup function - will run when component unmounts
    return () => {
      clearState(); // Clear duel state when leaving the page
    };
  }, [txId, router, clearState, selectedCharacterId]);

  usePhaserBridge<{ winnerName: string; loserName: string; selectedCharacterId: string }>(
    GameEvents.FIGHT_ENDED,
    ({ winnerName, loserName }) => {
      setFightWinnerName(winnerName);
      setFightLoserName(loserName);
      setIsFightEndDialogOpen(true);
    },
  );

  const handleReturnToMenu = () => {
    router.push(
      `/${selectedCharacterId ? `?selectedCharacter=${selectedCharacterId}` : ""}`,
    );
  };

  if (!txId) {
    return <LoadingSpinner size="lg" text="Loading game..." />;
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={GameErrorFallback}>
        <GameWrapper />
      </ErrorBoundary>
      <FightEndDialog
        isOpen={isFightEndDialogOpen}
        onClose={() => setIsFightEndDialogOpen(false)}
        winnerName={fightWinnerName}
        onReturnToMenu={handleReturnToMenu}
        loserName={fightLoserName}
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
