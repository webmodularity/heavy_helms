"use client";

import { useDuelActions, useDuelLoadingState } from "@/stores/duel-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function DuelLoadingPage() {
  const { isListening, isTimeout, duelTxHash } = useDuelLoadingState();
  const { clearState } = useDuelActions();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // If we already have a txHash, show a success message but DON'T navigate
  // (the callback in startListening will handle navigation with delay)
  useEffect(() => {
    if (duelTxHash && !isNavigating) {
      setIsNavigating(true);
      // Show success UI but don't navigate - this is now handled by the callback
    }
  }, [duelTxHash, isNavigating]);

  // If we're not listening anymore and we don't have a duel txHash, go back to challenges
  useEffect(() => {
    if (!isListening && !duelTxHash && !isTimeout) {
      router.push("/");
    }
  }, [isListening, duelTxHash, router, isTimeout]);

  const handleCancel = () => {
    clearState();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-black/10 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isNavigating ? "Duel Complete!" : "Preparing for Battle"}
        </h1>

        {isTimeout ? (
          <div className="text-center">
            <p className="mb-4">
              The duel is taking longer than expected to process. This could be
              due to network congestion.
            </p>
            <p className="mb-6">
              You can wait longer or check back later. The duel will still be
              processed by the blockchain.
            </p>
            <Button onClick={handleCancel} variant="outline" className="mr-4">
              Return to Challenges
            </Button>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        ) : isNavigating ? (
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="mb-4">
              Duel completed! Preparing the visualization...
            </p>
            <p className="mb-4">
              You'll be redirected in a few seconds.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="mb-4">
              Your challenge has been accepted! We're waiting for the blockchain
              to process the duel.
            </p>
            <p className="mb-4">
              This usually takes less than a minute, but may take longer during
              periods of network congestion.
            </p>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
