import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Using standard Button
import { YellowButton } from "@/components/ui/yellow-button"; // Or your custom YellowButton
import { useQueuedGauntletPlayers } from "@/hooks/use-queued-gauntlet-players";
import { GauntletQueueTable } from "@/components/gauntlet/gauntlet-queue-table";
import { Loader2, AlertTriangle } from "lucide-react";

interface ViewGauntletQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewGauntletQueueModal({
  isOpen,
  onClose,
}: ViewGauntletQueueModalProps) {
  const {
    data: queuedPlayers,
    isLoading,
    error,
    isSuccess,
    refetch,
  } = useQueuedGauntletPlayers();

  React.useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-stone-900/95 backdrop-blur-md border-yellow-600/30 text-stone-200">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            Current Gauntlet Queue
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Players waiting for the next gauntlet to begin.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
              <p className="text-stone-300">Loading queue...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-40 space-y-2 p-4 bg-red-900/20 border border-red-500/30 rounded-md">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <p className="text-red-300 text-center">
                Error loading queue: {error.message}
              </p>
            </div>
          )}
          {isSuccess && (!queuedPlayers || queuedPlayers.length === 0) && (
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <p className="text-stone-300">The queue is currently empty.</p>
            </div>
          )}
          {isSuccess && queuedPlayers && queuedPlayers.length > 0 && (
            <GauntletQueueTable players={queuedPlayers} />
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <YellowButton onClick={onClose} variant="outline">
            Close
          </YellowButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
