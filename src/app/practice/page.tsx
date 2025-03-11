"use client";

import { GameWrapper } from "@/components/game/game-wrapper";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Armor, Character, Stance, Weapon } from "@/types/player.types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

export default function PracticePage() {
  const searchParams = useSearchParams();
  const player1Id = searchParams.get("player1Id") ?? undefined;
  const player2Id = searchParams.get("player2Id") ?? undefined;
  const router = useRouter();

  useEffect(() => {
    // Redirect if no character ID is provided
    if (!player1Id || !player2Id) {
      router.push("/");
      return;
    }
  }, [player1Id, player2Id, router]);

  console.log(player1Id, player2Id);
  return (
    <div className="min-h-screen flex flex-col bg-stone-9000">
      <main className="p-4 flex flex-col">
        <div className="flex-1 bg-opacity-70 rounded-lg overflow-hidden border border-yellow-600/20 shadow-lg items-center justify-center flex p-4">
          {/* Game container */}
          <div className="flex items-center justify-center flex-1 z-10">
            <ErrorBoundary FallbackComponent={GameErrorFallback}>
              <Suspense
                fallback={
                  <LoadingSpinner size="large" text="Loading game..." />
                }
              >
                <GameWrapper player1Id={player1Id} player2Id={player2Id} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
