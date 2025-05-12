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
import { CompactDialogHeader } from "../ui/compact/CompactDialogHeader";

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
      <DialogContent className="sm:max-w-[375px] bg-stone-800 border-yellow-600 p-4 font-pixeloid">
        <CompactDialogHeader
          title="Fight Over!"
          description={winnerName && `Winner: ${winnerName}`}
          className="pb-2 font-pixeloid"
        />
        <DialogFooter className="gap-1.5 sm:justify-end pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-8 px-3 text-xs border-stone-600 font-pixeloid"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleReturnToMenu}
            className="h-8 px-3 text-xs bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-100 font-pixeloid"
          >
            Return to Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
