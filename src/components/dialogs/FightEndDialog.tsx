"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FightEndDialogProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName?: string;
  onReturnToMenu: () => void;
}

export function FightEndDialog({
  isOpen,
  onClose,
  winnerName,
  onReturnToMenu,
}: FightEndDialogProps) {
  const handleReturnToMenu = () => {
    onClose(); // Close the dialog first
    onReturnToMenu(); // Then navigate
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-stone-800 border-yellow-600">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 font-pixeloid">
            Fight Over!
          </DialogTitle>
          {winnerName && (
            <DialogDescription className="text-stone-300 pt-2 font-pixeloid">
              Winner: {winnerName}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-stone-600 hover:bg-stone-700 hover:text-stone-100 font-pixeloid"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleReturnToMenu}
            className="bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-100 font-pixeloid"
          >
            Return to Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
