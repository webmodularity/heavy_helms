"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlayerSelectionTable } from "@/components/duel/player-selection-table";
import { useEffect } from "react";
import type { Fighter } from "@/types/fighter-types";
import { CompactDialogHeader } from "@/components/ui/compact/CompactDialogHeader";

interface SelectChallengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Fighter) => void;
  currentPlayerId?: string;
}

export function SelectChallengerModal({
  isOpen,
  onClose,
  onSelectPlayer,
  currentPlayerId,
}: SelectChallengerModalProps) {
  // Handle player selection
  const handleSelectPlayer = (player: Fighter) => {
    onSelectPlayer(player);
    onClose();
  };

  // Close the modal when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-stone-900 to-stone-950 border-yellow-600/20 h-[90vh] my-2.5 overflow-hidden flex flex-col">
        <CompactDialogHeader
          title="Select a Challenger"
          description="Browse and select a warrior to challenge to a duel."
        />

        <div className="mt-2.5 overflow-y-auto pr-1 h-full">
          <PlayerSelectionTable
            onSelectPlayer={handleSelectPlayer}
            currentPlayerId={currentPlayerId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
