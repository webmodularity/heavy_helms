"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  useGlobalFightModal,
  createFightDataFromUrl,
} from "@/hooks/use-global-fight-modal";

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
function GauntletGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openFightModal } = useGlobalFightModal();

  useEffect(() => {
    const fightData = createFightDataFromUrl(searchParams);

    if (fightData) {
      // Open modal and redirect to home
      openFightModal(fightData);
      router.replace("/");
    } else {
      // No valid fight data, redirect to home
      router.push("/");
    }
  }, [searchParams, router, openFightModal]);

  // This component now only handles redirects, no game rendering
  return <LoadingSpinner size="lg" text="Loading..." />;
}

export default function GauntletPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-9000">
      <main className="p-4 flex flex-col">
        <div className="flex-1 bg-opacity-70 rounded-lg overflow-hidden border border-yellow-600/20 shadow-lg items-center justify-center flex p-4">
          {/* Game container */}
          <div className="flex items-center justify-center flex-1 z-10">
            <Suspense
              fallback={<LoadingSpinner size="lg" text="Loading game..." />}
            >
              <GauntletGame />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
